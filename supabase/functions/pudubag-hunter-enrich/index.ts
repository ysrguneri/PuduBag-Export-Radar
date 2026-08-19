import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: cors });

  const auth = req.headers.get('Authorization') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const hunterKey = Deno.env.get('HUNTER_API_KEY');
  if (!hunterKey) return new Response(JSON.stringify({ error: 'HUNTER_API_KEY_missing' }), { status: 503, headers: cors });

  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
  const { data: userData, error: userErr } = await caller.auth.getUser();
  if (userErr || !userData.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: cors });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'company_enrich');
  const allowed = new Set(['discover','domain_finder','domain_search','company_enrich','email_finder','email_verifier']);
  if (!allowed.has(action)) return new Response(JSON.stringify({ error: 'unsupported_action' }), { status: 400, headers: cors });

  let url = '';
  let init: RequestInit = { method: 'GET' };
  const q = new URLSearchParams({ api_key: hunterKey });
  if (action === 'discover') {
    url = 'https://api.hunter.io/v2/discover?' + q.toString();
    init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body.filters || { query: body.query || '' }) };
  } else if (action === 'domain_finder') {
    q.set('company', String(body.company || ''));
    url = 'https://api.hunter.io/v2/domain-finder?' + q.toString();
  } else if (action === 'domain_search') {
    if (body.domain) q.set('domain', String(body.domain)); else q.set('company', String(body.company || ''));
    q.set('limit', String(body.limit || 10));
    url = 'https://api.hunter.io/v2/domain-search?' + q.toString();
  } else if (action === 'company_enrich') {
    q.set('domain', String(body.domain || ''));
    url = 'https://api.hunter.io/v2/companies/find?' + q.toString();
  } else if (action === 'email_finder') {
    if (body.domain) q.set('domain', String(body.domain)); else q.set('company', String(body.company || ''));
    if (body.full_name) q.set('full_name', String(body.full_name));
    if (body.first_name) q.set('first_name', String(body.first_name));
    if (body.last_name) q.set('last_name', String(body.last_name));
    url = 'https://api.hunter.io/v2/email-finder?' + q.toString();
  } else {
    q.set('email', String(body.email || ''));
    url = 'https://api.hunter.io/v2/email-verifier?' + q.toString();
  }

  const res = await fetch(url, init);
  const payload = await res.json().catch(() => ({}));
  const db = createClient(supabaseUrl, serviceKey);
  await db.from('integration_runs').insert({
    user_id: userData.user.id,
    provider: 'hunter', action, input_payload: { ...body, api_key: undefined },
    status: res.ok ? 'success' : 'error', result_count: Array.isArray(payload?.data) ? payload.data.length : (payload?.data ? 1 : 0),
    error_message: res.ok ? null : JSON.stringify(payload).slice(0, 1500), finished_at: new Date().toISOString()
  });
  return new Response(JSON.stringify(payload), { status: res.status, headers: cors });
});
