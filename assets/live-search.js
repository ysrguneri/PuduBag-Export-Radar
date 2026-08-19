(() => {
  const CFG = window.PUDU_CONFIG || {};
  const SUPABASE_URL = CFG.supabaseUrl || 'https://leldkwovorbspnzkedhd.supabase.co';
  const SUPABASE_KEY = CFG.supabaseAnonKey || '';
  const IMPORT_URL = `${SUPABASE_URL}/functions/v1/pudubag-importyeti-search`;
  const HUNTER_URL = `${SUPABASE_URL}/functions/v1/pudubag-hunter-enrich`;
  function esc(v){return String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function card(x,i){
    const score=Number(x.score||0); const cls=score>=90?'high':score>=80?'medium':'low';
    const role=x.role==='company'?'Alıcı':x.role==='supplier'?'Tedarikçi':(x.role||'Kayıt');
    return `<article class="buyer-card live-buyer-card"><div class="top"><div><div class="name">${esc(x.name)}</div><div class="meta">${esc(x.city)}${x.city&&x.country?', ':''}${esc(x.country)} • ${esc(role)}</div></div><span class="score ${cls}">${score}</span></div><div class="tags"><span class="tag">ImportYeti</span><span class="tag">${esc(x.shipments)} sevkiyat</span></div><div class="small">Son alım: ${esc(x.last||'—')} • ${esc(x.address||'Adres yok')}</div><div class="hunter-result" id="hunter-${i}"></div><div class="foot"><div class="metric-mini"><strong>${esc(x.shipments)}</strong><span>sevkiyat</span></div><div class="metric-mini"><strong>${esc(x.otherNames)}</strong><span>isim</span></div><a class="ghost" href="${esc(x.url||'#')}" target="_blank" rel="noopener">ImportYeti ↗</a><button class="ghost hunter-btn" data-hunter-index="${i}">🔎 Hunter ile Zenginleştir</button></div></article>`;
  }
  async function call(url,body){
    if(!SUPABASE_KEY) throw new Error('Supabase publishable key bulunamadı.');
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({})); if(!r.ok||d.ok===false) throw new Error(d.error||`İstek başarısız (${r.status})`); return d;
  }
  async function liveSearch(query){return call(IMPORT_URL,{query,page:1});}
  async function enrich(x,i){
    const host=document.querySelector(`#hunter-${i}`); const btn=document.querySelector(`[data-hunter-index="${i}"]`); if(!host)return;
    btn.disabled=true; btn.textContent='Hunter aranıyor…'; host.innerHTML='<div class="small muted">Domain ve şirket bilgileri aranıyor…</div>';
    try{
      let domain=''; let company=x.name||'';
      try{const f=await call(HUNTER_URL,{action:'domain_finder',company}); domain=f?.data?.domain||f?.data?.domains?.[0]?.domain||'';}catch(_){ }
      if(!domain && x.url){const m=String(x.url).match(/importyeti\.com\/company\/([^/?#]+)/i); if(m)domain=m[1]+'.com';}
      if(!domain)throw new Error('Hunter şirket domaini bulamadı.');
      const d=await call(HUNTER_URL,{action:'domain_search',domain,limit:10}); const data=d.data||{}; const emails=Array.isArray(data.emails)?data.emails:[];
      const companyInfo=await call(HUNTER_URL,{action:'company_enrich',domain}).catch(()=>({data:{}}));
      const ci=companyInfo.data||{};
      host.innerHTML=`<div class="card hunter-inline"><strong>Hunter</strong><div class="small">🌐 ${esc(domain)}${ci.company?` • ${esc(ci.company)}`:''}</div>${emails.length?`<div class="small">📧 ${emails.slice(0,5).map(e=>`${esc(e.value)}${e.position?` (${esc(e.position)})`:''}`).join(' • ')}</div>`:'<div class="small">E-posta bulunamadı.</div>'}</div>`;
    }catch(e){host.innerHTML=`<div class="small">Hunter: ${esc(e.message)}</div>`;}finally{btn.disabled=false;btn.textContent='🔎 Hunter ile Zenginleştir';}
  }
  window.renderLiveBuyers=function(){
    const host=document.querySelector('#view-buyers'); if(!host)return;
    host.innerHTML=`<div class="card"><div class="card-head"><div><h2>Alıcı İstihbaratı</h2><div class="muted small">ImportYeti canlı arama • sonuçlar Supabase'e kaydedilir</div></div><span class="demo-pill">CANLI VERİ</span></div><div class="filters"><input id="liveBuyerQuery" placeholder="Ürün veya firma: backpack, luggage, cosmetic bag…"><button id="liveBuyerSearch" class="primary">Ara</button></div><div id="liveBuyerMeta" class="muted small" style="margin:12px 0"></div><div id="liveBuyerGrid" class="grid buyer-cards"><div class="empty">Bir ürün veya firma arayın.</div></div></div>`;
    const input=document.querySelector('#liveBuyerQuery'),btn=document.querySelector('#liveBuyerSearch'),meta=document.querySelector('#liveBuyerMeta'),grid=document.querySelector('#liveBuyerGrid'); let rows=[];
    async function run(){const q=input.value.trim();if(!q)return;btn.disabled=true;btn.textContent='Aranıyor…';meta.textContent='ImportYeti sorgulanıyor…';grid.innerHTML='<div class="empty">Canlı veri alınıyor…</div>';try{const data=await liveSearch(q);rows=data.results||[];meta.textContent=`${data.found??rows.length} sonuç bulundu • ${data.saved??0} kayıt Supabase\'e işlendi • Toplam: ${data.totalHits??'—'}`;grid.innerHTML=rows.length?rows.map(card).join(''):'<div class="empty">ImportYeti sonuç döndürmedi.</div>';grid.querySelectorAll('.hunter-btn').forEach(b=>b.addEventListener('click',()=>enrich(rows[Number(b.dataset.hunterIndex)],Number(b.dataset.hunterIndex))));}catch(e){meta.textContent='';grid.innerHTML=`<div class="empty">Canlı arama hatası: ${esc(e.message)}</div>`;}finally{btn.disabled=false;btn.textContent='Ara';}}
    btn.addEventListener('click',run);input.addEventListener('keydown',e=>{if(e.key==='Enter')run();});
  };
  window.renderBuyers=function(){window.renderLiveBuyers();};
  const originalRender=window.render;if(originalRender)window.render=function(view){if(view==='buyers')return window.renderLiveBuyers();return originalRender(view);};
  document.addEventListener('DOMContentLoaded',()=>{const nav=document.querySelector('[data-view="buyers"]');if(nav)nav.addEventListener('click',()=>setTimeout(window.renderLiveBuyers,0));const jump=document.querySelector('[data-view-jump="buyers"]');if(jump)jump.addEventListener('click',()=>setTimeout(window.renderLiveBuyers,0));});
})();
