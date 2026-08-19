import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function withAuth(url: URL, key: string | null) {
  const headers = new Headers();
  if (!key) return { url, headers };
  // ImportYeti's API key delivery can vary by account/contract. Configure the mode in Supabase secrets.
  const mode = Deno.env.get('IMPORTYETI_AUTH_MODE') || 'query';
  const name = Deno.env.get('IMPORTYETI_AUTH_NAME') || 'api_key';
  if (mode === 'bearer') headers.set('Authorization', `Bearer ${key}`);
  else if (mode === 'header') headers.set(name, key);
  else url.searchParams.set(name, key);
  return { url, headers };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: cors });

  const auth = req.headers.get('Authorization') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const apiKey = Deno.env.get('IMPORTYETI_API_KEY') || null;
  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
  const { data: userData, error: userErr } = await caller.auth.getUser();
  if (userErr || !userData.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: cors });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'product_companies');
  let path = '';
  const query = new URLSearchParams();
  if (action === 'product_companies') path = `/product/${encodeURIComponent(String(body.product || ''))}/companies`;
  else if (action === 'product_suppliers') path = `/product/${encodeURIComponent(String(body.product || ''))}/suppliers`;
  else if (action === 'company_search') { path = '/company/search'; query.set('q', String(body.query || '')); }
  else if (action === 'supplier_search') { path = '/supplier/search'; query.set('q', String(body.query || '')); }
  else if (action === 'company_bols') path = `/company/${encodeURIComponent(String(body.company || ''))}/bols`;
  else if (action === 'supplier_bols') path = `/supplier/${encodeURIComponent(String(body.supplier || ''))}/bols`;
  else if (action === 'bol') path = `/bol/${encodeURIComponent(String(body.number || ''))}`;
  else return new Response(JSON.stringify({ error: 'unsupported_action' }), { status: 400, headers: cors });

  const u = new URL('https://data.importyeti.com/v1.0' + path);
  for (const [k, v] of query) u.searchParams.set(k, v);
  for (const [k, v] of Object.entries(body.params || {})) if (v !== null && v !== undefined && v !== '') u.searchParams.set(k, String(v));
  const secured = withAuth(u, apiKey);
  const res = await fetch(secured.url, { headers: secured.headers });
  const payload = await res.json().catch(() => ({}));

  const db = createClient(supabaseUrl, serviceKey);
  await db.from('integration_runs').insert({
    user_id: userData.user.id, provider: 'importyeti', action,
    input_payload: { action, product: body.product, query: body.query, company: body.company, supplier: body.supplier, number: body.number, params: body.params || {} },
    status: res.ok ? 'success' : 'error', request_cost: payload?.requestCost ?? null, credits_remaining: payload?.creditsRemaining ?? null,
    result_count: Array.isArray(payload?.data) ? payload.data.length : (payload?.data ? 1 : 0),
    error_message: res.ok ? null : JSON.stringify(payload).slice(0, 1500), finished_at: new Date().toISOString()
  });
  return new Response(JSON.stringify(payload), { status: res.status, headers: cors });
});
