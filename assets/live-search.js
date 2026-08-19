(() => {
  const CFG = window.PUDU_CONFIG || {};
  const SUPABASE_URL = CFG.supabaseUrl || 'https://leldkwovorbspnzkedhd.supabase.co';
  const SUPABASE_KEY = CFG.supabaseAnonKey || '';
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/pudubag-importyeti-search`;

  function esc(v){return String(v ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function card(x){
    const score = Number(x.score || 0);
    const cls = score >= 90 ? 'high' : score >= 80 ? 'medium' : 'low';
    const role = x.role === 'company' ? 'Alıcı' : x.role === 'supplier' ? 'Tedarikçi' : (x.role || 'Kayıt');
    return `<article class="buyer-card live-buyer-card"><div class="top"><div><div class="name">${esc(x.name)}</div><div class="meta">${esc(x.city)}${x.city && x.country ? ', ' : ''}${esc(x.country)} • ${esc(role)}</div></div><span class="score ${cls}">${score}</span></div><div class="tags"><span class="tag">ImportYeti</span><span class="tag">${esc(x.shipments)} sevkiyat</span></div><div class="small">Son alım: ${esc(x.last || '—')} • ${esc(x.address || 'Adres yok')}</div><div class="foot"><div class="metric-mini"><strong>${esc(x.shipments)}</strong><span>sevkiyat</span></div><div class="metric-mini"><strong>${esc(x.otherNames)}</strong><span>isim</span></div><a class="ghost" href="${esc(x.url || '#')}" target="_blank" rel="noopener">ImportYeti ↗</a></div></article>`;
  }

  async function liveSearch(query){
    if(!SUPABASE_KEY) throw new Error('Supabase publishable key bulunamadı.');
    const r = await fetch(FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`},body:JSON.stringify({query,page:1})});
    const data = await r.json().catch(()=>({}));
    if(!r.ok || !data.ok) throw new Error(data.error || `Arama başarısız (${r.status})`);
    return data;
  }

  window.renderLiveBuyers = function(){
    const host = document.querySelector('#view-buyers');
    if(!host) return;
    host.innerHTML = `<div class="card"><div class="card-head"><div><h2>Alıcı İstihbaratı</h2><div class="muted small">ImportYeti canlı arama • sonuçlar Supabase'e kaydedilir</div></div><span class="demo-pill">CANLI VERİ</span></div><div class="filters"><input id="liveBuyerQuery" placeholder="Ürün veya firma: backpack, luggage, cosmetic bag…"><button id="liveBuyerSearch" class="primary">Ara</button></div><div id="liveBuyerMeta" class="muted small" style="margin:12px 0"></div><div id="liveBuyerGrid" class="grid buyer-cards"><div class="empty">Bir ürün veya firma arayın.</div></div></div>`;
    const input=document.querySelector('#liveBuyerQuery'); const btn=document.querySelector('#liveBuyerSearch'); const meta=document.querySelector('#liveBuyerMeta'); const grid=document.querySelector('#liveBuyerGrid');
    async function run(){
      const q=input.value.trim(); if(!q)return;
      btn.disabled=true; btn.textContent='Aranıyor…'; meta.textContent='ImportYeti sorgulanıyor…'; grid.innerHTML='<div class="empty">Canlı veri alınıyor…</div>';
      try{const data=await liveSearch(q); const rows=data.results||[]; meta.textContent=`${data.found ?? rows.length} sonuç bulundu • ${data.saved ?? 0} kayıt Supabase'e işlendi • Toplam: ${data.totalHits ?? '—'}`; grid.innerHTML=rows.length?rows.map(card).join(''):'<div class="empty">ImportYeti sonuç döndürmedi.</div>';}catch(e){meta.textContent=''; grid.innerHTML=`<div class="empty">Canlı arama hatası: ${esc(e.message)}</div>`;} finally{btn.disabled=false;btn.textContent='Ara';}
    }
    btn.addEventListener('click',run); input.addEventListener('keydown',e=>{if(e.key==='Enter')run();});
  };

  const originalRenderBuyers = window.renderBuyers;
  window.renderBuyers = function(){ window.renderLiveBuyers(); };
  const originalRender = window.render;
  if(originalRender){
    window.render = function(view){ if(view==='buyers') return window.renderLiveBuyers(); return originalRender(view); };
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const nav=document.querySelector('[data-view="buyers"]');
    if(nav) nav.addEventListener('click',()=>setTimeout(window.renderLiveBuyers,0));
    const jump=document.querySelector('[data-view-jump="buyers"]');
    if(jump) jump.addEventListener('click',()=>setTimeout(window.renderLiveBuyers,0));
  });
})();
