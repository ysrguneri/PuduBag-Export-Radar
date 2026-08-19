import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function scoreCandidate(c: any) {
  const products = String(c.product_description || c.products || '').toLowerCase();
  const bagTerms = ['bag','tote','pouch','organizer','packing cube','cosmetic','toiletry','drawstring','laundry','storage'];
  const productFit = Math.min(100, 45 + bagTerms.filter(t => products.includes(t)).length * 10);
  const turkeySignal = c.turkey_signal ? 100 : 0;
  const shipments = Number(c.shipment_count || 0);
  const frequency = Math.min(100, shipments * 8);
  const marketMap: Record<string, number> = { US: 90, DE: 95, NL: 92, SA: 95, AE: 94, QA: 90, KW: 88, FR: 86, GB: 82, BE: 78 };
  const market = marketMap[String(c.country_code || '').toUpperCase()] || 65;
  const recency = Number(c.recency_score || 75);
  return {
    total_score: Math.round(productFit * .35 + turkeySignal * .25 + recency * .15 + frequency * .15 + market * .10),
    product_fit: productFit, turkey_signal: turkeySignal, recency_score: recency, frequency_score: frequency, market_score: market
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: cors });
  const auth = req.headers.get('Authorization') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
  const { data: userData, error: userErr } = await caller.auth.getUser();
  if (userErr || !userData.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: cors });

  const body = await req.json().catch(() => ({}));
  const candidates = Array.isArray(body.candidates) ? body.candidates.slice(0, 200) : [];
  if (!candidates.length) return new Response(JSON.stringify({ error: 'candidates_required' }), { status: 400, headers: cors });
  const db = createClient(supabaseUrl, serviceKey);
  const saved:any[] = [];
  for (const c of candidates) {
    const row = {
      canonical_name: String(c.name || c.title || '').trim(), country_code: c.country_code || null, country_name: c.country_name || c.country || null,
      city: c.city || null, address: c.address || null, website_url: c.website_url || null, domain: c.domain || null,
      company_role: 'buyer', source_provider: c.source_provider || body.source_provider || 'manual', source_external_id: c.source_external_id || c.id || null,
      source_url: c.source_url || null, raw_summary: c.raw_summary || c, last_seen_at: new Date().toISOString()
    };
    if (!row.canonical_name) continue;
    const result = row.source_external_id
      ? await db.from('export_companies').upsert(row, { onConflict: 'source_provider,source_external_id', ignoreDuplicates: false }).select('*').single()
      : await db.from('export_companies').insert(row).select('*').single();
    const { data: company, error } = result;
    if (error || !company) continue;
    const sc = scoreCandidate(c);
    await db.from('buyer_scores').upsert({ company_id: company.id, ...sc, explanation: { source: 'pudubag-v0.2-rules', input: c } });
    saved.push({ ...company, score: sc.total_score });
  }
  return new Response(JSON.stringify({ ok: true, saved: saved.length, companies: saved }), { headers: cors });
});
