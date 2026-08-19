const sampleBuyers = [
  {id:1,name:'Nordlicht Retail GmbH',country:'Germany',city:'Hamburg',segment:'Retail / Lifestyle',products:['tote bag','cosmetic bag','travel organizer'],turkey:true,shipments:18,last:'2026-07-28',score:96,volume:'High',domain:'demo-nordlicht.example',email:'',phone:'',source:'Demo',supplier:'Demo Tekstil A.Ş.',status:'new',watch:true},
  {id:2,name:'Maison Orbit BV',country:'Netherlands',city:'Rotterdam',segment:'E-commerce',products:['packing cube','shoe bag','pouch'],turkey:true,shipments:12,last:'2026-08-03',score:93,volume:'Medium',domain:'demo-orbit.example',email:'',phone:'',source:'Demo',supplier:'Demo Çanta Ltd.',status:'contact',watch:true},
  {id:3,name:'Riyadh Travel Supply Co.',country:'Saudi Arabia',city:'Riyadh',segment:'Travel / Wholesale',products:['travel organizer','laundry bag','umrah travel set'],turkey:true,shipments:9,last:'2026-07-19',score:95,volume:'High',domain:'demo-riyadh.example',email:'',phone:'',source:'Demo',supplier:'Demo Tekstil A.Ş.',status:'sample',watch:true},
  {id:4,name:'Pearl Gate Trading LLC',country:'UAE',city:'Dubai',segment:'Wholesale',products:['cosmetic bag','gift bag','pouch'],turkey:true,shipments:14,last:'2026-08-10',score:94,volume:'High',domain:'demo-pearl.example',email:'',phone:'',source:'Demo',supplier:'Demo Promosyon Ltd.',status:'offer',watch:false},
  {id:5,name:'Atelier Nove SAS',country:'France',city:'Lyon',segment:'Boutique Retail',products:['canvas tote','cosmetic bag'],turkey:true,shipments:8,last:'2026-06-25',score:88,volume:'Medium',domain:'demo-nove.example',email:'',phone:'',source:'Demo',supplier:'Demo Çanta Ltd.',status:'new',watch:false},
  {id:6,name:'Harbor Goods Ltd.',country:'United Kingdom',city:'Manchester',segment:'Retail',products:['tote bag','storage bag'],turkey:false,shipments:20,last:'2026-08-01',score:82,volume:'High',domain:'demo-harbor.example',email:'',phone:'',source:'Demo',supplier:'China supplier',status:'new',watch:false},
  {id:7,name:'Eastline Merchandising Inc.',country:'USA',city:'New York',segment:'Promotional',products:['drawstring bag','promotional textile bag'],turkey:true,shipments:31,last:'2026-08-08',score:91,volume:'High',domain:'demo-eastline.example',email:'',phone:'',source:'Demo',supplier:'Demo Promosyon Ltd.',status:'contact',watch:true},
  {id:8,name:'Doha Journey WLL',country:'Qatar',city:'Doha',segment:'Travel Retail',products:['travel organizer','shoe bag','gift set'],turkey:true,shipments:7,last:'2026-07-11',score:92,volume:'Medium',domain:'demo-doha.example',email:'',phone:'',source:'Demo',supplier:'Demo Tekstil A.Ş.',status:'new',watch:true},
  {id:9,name:'Kuwait Home & Travel Co.',country:'Kuwait',city:'Kuwait City',segment:'Retail',products:['storage bag','laundry bag','packing cube'],turkey:true,shipments:11,last:'2026-07-30',score:90,volume:'Medium',domain:'demo-kuwait.example',email:'',phone:'',source:'Demo',supplier:'Demo Çanta Ltd.',status:'sample',watch:false},
  {id:10,name:'Brussels Concept NV',country:'Belgium',city:'Brussels',segment:'Concept Stores',products:['canvas tote','pouch'],turkey:false,shipments:5,last:'2026-05-18',score:76,volume:'Low',domain:'demo-brussels.example',email:'',phone:'',source:'Demo',supplier:'Portugal supplier',status:'new',watch:false},
  {id:11,name:'Alpine Journey AG',country:'Switzerland',city:'Zurich',segment:'Travel',products:['packing cube','toiletry bag'],turkey:true,shipments:10,last:'2026-06-29',score:87,volume:'Medium',domain:'demo-alpine.example',email:'',phone:'',source:'Demo',supplier:'Demo Tekstil A.Ş.',status:'offer',watch:false},
  {id:12,name:'Scandi Soft Goods AB',country:'Sweden',city:'Gothenburg',segment:'Lifestyle',products:['tote bag','storage bag','pouch'],turkey:true,shipments:6,last:'2026-07-04',score:84,volume:'Medium',domain:'demo-scandi.example',email:'',phone:'',source:'Demo',supplier:'Demo Çanta Ltd.',status:'new',watch:false}
];

const exporters = [
 {name:'Demo Tekstil A.Ş.',city:'İstanbul',buyers:34,countries:9,products:'Travel organizer, tote, pouch',last:'2026-08-10'},
 {name:'Demo Çanta Ltd.',city:'İzmir',buyers:21,countries:7,products:'Cosmetic bag, canvas tote',last:'2026-08-03'},
 {name:'Demo Promosyon Ltd.',city:'Bursa',buyers:18,countries:5,products:'Promotional bag, drawstring',last:'2026-08-08'},
 {name:'Demo Ev Tekstili A.Ş.',city:'Denizli',buyers:13,countries:6,products:'Storage bag, laundry bag',last:'2026-07-30'}
];
const countryScores = [
 {country:'Germany',score:96,buyers:184,turkey:63},{country:'Saudi Arabia',score:95,buyers:132,turkey:57},{country:'UAE',score:94,buyers:151,turkey:49},{country:'Netherlands',score:92,buyers:106,turkey:41},{country:'USA',score:91,buyers:325,turkey:38},{country:'Qatar',score:90,buyers:62,turkey:28},{country:'Kuwait',score:88,buyers:54,turkey:24},{country:'France',score:86,buyers:119,turkey:31},{country:'United Kingdom',score:82,buyers:137,turkey:27},{country:'Belgium',score:78,buyers:71,turkey:16}
];

const titles={dashboard:'İhracat Dashboard',buyers:'Alıcı Bul',exporters:'Türk İhracatçılar',watchlist:'Takip Listesi',crm:'Satış CRM',countries:'Ülke Fırsatları',contacts:'İletişim Merkezi',settings:'Veri Kaynakları'};
let state={buyers:JSON.parse(localStorage.getItem('pudu_buyers')||'null')||sampleBuyers,query:'',country:'',turkey:'',minScore:0,product:''};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=d=>new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(d));
const scoreClass=s=>s>=90?'high':s>=80?'medium':'low';
const statusLabel={new:'Yeni Lead',contact:'İletişimde',sample:'Numune',offer:'Teklif',won:'Sipariş',lost:'Kaybedildi'};

function save(){localStorage.setItem('pudu_buyers',JSON.stringify(state.buyers))}
function switchView(view){
  $$('.view').forEach(v=>v.classList.remove('active')); $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $('#view-'+view).classList.add('active'); $('#viewTitle').textContent=titles[view]||view; render(view);
  window.scrollTo({top:0,behavior:'smooth'});
}
function render(view){({dashboard:renderDashboard,buyers:renderBuyers,exporters:renderExporters,watchlist:renderWatchlist,crm:renderCRM,countries:renderCountries,contacts:renderContacts,settings:renderSettings}[view]||(()=>{}))()}

function renderDashboard(){
 const b=state.buyers; const high=b.filter(x=>x.score>=90).length; const tr=b.filter(x=>x.turkey).length; const active=b.filter(x=>x.status!=='new').length; const offers=b.filter(x=>x.status==='offer').length;
 $('#view-dashboard').innerHTML=`
 <div class="grid kpi-grid">
  ${kpi('Potansiyel Alıcı',12460,'+642 bu ay')}${kpi('Türkiye’den Alım',1870,'öncelikli havuz')}${kpi('Yüksek Potansiyel',386,'skor ≥ 90')}${kpi('Aktif Görüşme',active,'demo pipeline')}${kpi('Numune',b.filter(x=>x.status==='sample').length,'takip gerekli')}${kpi('Teklif',offers,'satışa yakın')}
 </div>
 <div class="grid two-col">
  <div class="card"><div class="card-head"><div><h2>Bugünün En Güçlü Fırsatları</h2><div class="muted small">Türkiye’den alım geçmişi + PuduBag ürün uyumu</div></div><button class="btn-link" data-view-jump="buyers">Tümünü gör →</button></div>${buyerTable(b.slice().sort((a,b)=>b.score-a.score).slice(0,7))}</div>
  <div class="card"><div class="card-head"><div><h2>Ülke Fırsat Haritası</h2><div class="muted small">Hedef pazar yoğunluğu</div></div></div><div class="opportunity-map"></div><div class="bars" style="margin-top:16px">${countryScores.slice(0,5).map(c=>`<div class="bar-row"><span>${c.country}</span><div class="bar-track"><span style="width:${c.score}%"></span></div><b>${c.score}</b></div>`).join('')}</div></div>
 </div>
 <div class="grid two-col" style="margin-top:16px">
  <div class="card"><div class="card-head"><h2>Rakipten Müşteriye</h2><span class="tag">CORE FEATURE</span></div><p class="muted">Bir Türk ihracatçıyı seç → yurtdışındaki bilinen alıcılarını çıkar → PuduBag uyum skoruna göre sırala.</p>${exporterMini()}</div>
  <div class="card"><div class="card-head"><h2>Satış Hunisi</h2><span class="muted small">Demo</span></div>${pipelineBars()}</div>
 </div>`;
 bindDynamic();
}
function kpi(label,value,delta){return `<div class="kpi"><div class="label">${label}</div><div class="value">${value}</div><div class="delta">${delta}</div></div>`}
function buyerTable(items){return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Firma</th><th>Ülke</th><th>Türk Tedarikçi</th><th>Son Alım</th><th>Sevkiyat</th><th>Skor</th></tr></thead><tbody>${items.map(x=>`<tr data-buyer-id="${x.id}" class="buyer-row"><td><div class="company">${x.name}</div><div class="small muted">${x.segment}</div></td><td><span class="country-badge">${x.country}</span></td><td>${x.turkey?x.supplier:'—'}</td><td>${fmt(x.last)}</td><td>${x.shipments}</td><td><span class="score ${scoreClass(x.score)}">${x.score}/100</span></td></tr>`).join('')}</tbody></table></div>`}
function exporterMini(){return exporters.slice(0,3).map(e=>`<div class="contact-row"><div><strong>${e.name}</strong><div class="small muted">${e.city} • ${e.products}</div></div><button class="ghost exporter-search" data-exporter="${e.name}">${e.buyers} alıcı</button></div>`).join('')}
function pipelineBars(){const stages=['new','contact','sample','offer','won']; return stages.map(s=>{const n=state.buyers.filter(x=>x.status===s).length;return `<div class="bar-row"><span>${statusLabel[s]}</span><div class="bar-track"><span style="width:${Math.min(100,n*22)}%"></span></div><b>${n}</b></div>`}).join('')}

function filteredBuyers(){let b=state.buyers.slice(); const q=(state.query||'').toLowerCase().trim(); if(q)b=b.filter(x=>[x.name,x.country,x.city,x.segment,x.supplier,...x.products].join(' ').toLowerCase().includes(q)); if(state.country)b=b.filter(x=>x.country===state.country); if(state.turkey==='yes')b=b.filter(x=>x.turkey); if(state.turkey==='no')b=b.filter(x=>!x.turkey); if(state.product)b=b.filter(x=>x.products.join(' ').toLowerCase().includes(state.product.toLowerCase())); b=b.filter(x=>x.score>=Number(state.minScore||0)); return b.sort((a,b)=>b.score-a.score)}
function renderBuyers(){
 const countries=[...new Set(state.buyers.map(x=>x.country))].sort();
 $('#view-buyers').innerHTML=`<div class="card"><div class="card-head"><div><h2>Alıcı İstihbaratı</h2><div class="muted small">Ürün, ülke, Türk tedarikçi ve PuduBag uyum skoruyla filtrele</div></div><span class="demo-pill">ŞİMDİLİK DEMO</span></div>
 <div class="filters"><input id="buyerQuery" placeholder="Firma / ürün / tedarikçi" value="${escapeHtml(state.query)}"><select id="countryFilter"><option value="">Tüm ülkeler</option>${countries.map(c=>`<option ${state.country===c?'selected':''}>${c}</option>`).join('')}</select><select id="turkeyFilter"><option value="">Tedarik ülkesi</option><option value="yes" ${state.turkey==='yes'?'selected':''}>Türkiye’den alım yapan</option><option value="no" ${state.turkey==='no'?'selected':''}>Türkiye dışı</option></select><select id="scoreFilter"><option value="0">Tüm skorlar</option><option value="90" ${state.minScore==90?'selected':''}>90+</option><option value="80" ${state.minScore==80?'selected':''}>80+</option></select><input id="productFilter" placeholder="Ürün: tote bag…" value="${escapeHtml(state.product)}"></div>
 <div id="buyerResultMeta" class="muted small" style="margin-bottom:12px"></div><div id="buyerGrid" class="grid buyer-cards"></div></div>`;
 updateBuyerGrid();
 ['buyerQuery','countryFilter','turkeyFilter','scoreFilter','productFilter'].forEach(id=>$('#'+id).addEventListener('input',()=>{state.query=$('#buyerQuery').value;state.country=$('#countryFilter').value;state.turkey=$('#turkeyFilter').value;state.minScore=$('#scoreFilter').value;state.product=$('#productFilter').value;updateBuyerGrid()}));
}
function updateBuyerGrid(){const b=filteredBuyers(); $('#buyerResultMeta').textContent=`${b.length} firma bulundu • ${b.filter(x=>x.turkey).length} tanesi Türkiye’den alım yapıyor`; $('#buyerGrid').innerHTML=b.length?b.map(buyerCard).join(''):'<div class="empty">Filtreye uyan firma bulunamadı.</div>'; bindDynamic()}
function buyerCard(x){return `<article class="buyer-card" data-buyer-id="${x.id}"><div class="top"><div><div class="name">${x.name}</div><div class="meta">${x.city}, ${x.country} • ${x.segment}</div></div><span class="score ${scoreClass(x.score)}">${x.score}</span></div><div class="tags">${x.products.slice(0,3).map(p=>`<span class="tag">${p}</span>`).join('')}</div><div class="small">${x.turkey?'✓ Türkiye’den alım geçmişi':'Türkiye kaydı yok'} • ${x.supplier}</div><div class="foot"><div class="metric-mini"><strong>${x.shipments}</strong><span>Sevkiyat</span></div><div class="metric-mini"><strong>${fmt(x.last).split(' ')[0]}</strong><span>Son alım</span></div><div class="metric-mini"><strong>${x.volume}</strong><span>Hacim</span></div></div></article>`}

function renderExporters(){
 $('#view-exporters').innerHTML=`<div class="card"><div class="card-head"><div><h2>Türk İhracatçıdan Yabancı Alıcı Bul</h2><div class="muted small">Bir Türk tekstil/çanta ihracatçısını seç; müşterilerini hedef havuzuna dönüştür.</div></div></div><div class="notice">Bu ekran gerçek ticaret verisi bağlandığında sistemin ana satış istihbaratı modülü olacak.</div><div style="margin-top:16px">${exporters.map(e=>`<div class="contact-row"><div><strong>${e.name}</strong><div class="small muted">${e.city} • ${e.products}</div><div class="small" style="margin-top:5px">${e.countries} ülke • son hareket ${fmt(e.last)}</div></div><button class="primary exporter-search" data-exporter="${e.name}">${e.buyers} alıcıyı incele</button></div>`).join('')}</div></div>`; bindDynamic();
}
function renderWatchlist(){const b=state.buyers.filter(x=>x.watch); $('#view-watchlist').innerHTML=`<div class="card"><div class="card-head"><div><h2>Takip Listesi</h2><div class="muted small">Yeni sevkiyat, iletişim ve fırsat değişiklikleri için öncelikli şirketler</div></div><span class="tag">${b.length} firma</span></div>${b.length?buyerTable(b):'<div class="empty">Henüz takip edilen firma yok.</div>'}</div>`; bindDynamic()}
function renderCRM(){const stages=['new','contact','sample','offer','won']; $('#view-crm').innerHTML=`<div class="card"><div class="card-head"><div><h2>PuduBag Satış CRM</h2><div class="muted small">Lead → iletişim → numune → teklif → sipariş</div></div></div><div class="kanban">${stages.map(s=>`<div class="kanban-col"><h3>${statusLabel[s]} · ${state.buyers.filter(x=>x.status===s).length}</h3>${state.buyers.filter(x=>x.status===s).map(x=>`<div class="lead-card" data-buyer-id="${x.id}"><strong>${x.name}</strong><div class="meta">${x.country} • Skor ${x.score}</div><div class="next">Sonraki adım: ${nextAction(s)}</div></div>`).join('')||'<div class="small muted">Kayıt yok</div>'}</div>`).join('')}</div></div>`; bindDynamic()}
function nextAction(s){return ({new:'İlk temas / buyer araştır',contact:'Katalog + fiyat aralığı',sample:'Numune takibi',offer:'Teklif takibi',won:'Tekrar sipariş planı'})[s]}
function renderCountries(){ $('#view-countries').innerHTML=`<div class="grid two-col"><div class="card"><div class="card-head"><div><h2>Hedef Pazar Sıralaması</h2><div class="muted small">PuduBag ürün uyumu + demo alıcı yoğunluğu</div></div></div>${countryScores.map(c=>`<div class="contact-row"><div style="min-width:120px"><strong>${c.country}</strong><div class="small muted">${c.buyers} alıcı • ${c.turkey} Türkiye bağlantılı</div></div><div style="width:45%"><div class="progress"><span style="width:${c.score}%"></span></div></div><span class="score ${scoreClass(c.score)}">${c.score}</span></div>`).join('')}</div><div class="card"><h2>Öncelikli Strateji</h2><p class="muted">İlk veri zenginleştirmede Türkiye’den alım geçmişi olan ve PuduBag ürün grubuna yakın şirketleri öne çıkaracağız.</p><div class="opportunity-map"></div></div></div>`}
function renderContacts(){const b=state.buyers.filter(x=>x.status!=='new'); $('#view-contacts').innerHTML=`<div class="card"><div class="card-head"><div><h2>İletişim Merkezi</h2><div class="muted small">E-posta / telefon / buyer / satın alma kişi doğrulaması</div></div></div><div class="notice">Demo şirketlerde gerçek iletişim bilgisi özellikle bulunmuyor. Gerçek sistemde iletişim kaynağı, doğrulama tarihi ve güven skoru tutulacak.</div><div style="margin-top:14px">${b.map(x=>`<div class="contact-row"><div><strong>${x.name}</strong><div class="small muted">${x.domain} • ${x.country}</div></div><div><span class="status ${x.status}">${statusLabel[x.status]}</span> <button class="ghost" data-buyer-id="${x.id}">Profili aç</button></div></div>`).join('')}</div></div>`; bindDynamic()}
function renderSettings(){ $('#view-settings').innerHTML=`<div class="grid two-col"><div class="card"><div class="card-head"><div><h2>Veri Kaynakları</h2><div class="muted small">Planlanan entegrasyon katmanları</div></div></div><div class="source-list">${source('Trade Data','UN Comtrade','Ülke + ürün/HS kodu seviyesinde pazar büyüklüğü ve akış analizi','Planlandı')}${source('Shipment Intelligence','ImportYeti / lisanslı trade data','Şirket / tedarikçi / konşimento seviyesinde alıcı-tedarikçi ilişkileri','Planlandı')}${source('Contact Enrichment','Hunter / alternatif sağlayıcı','Domain, e-posta bulma ve iletişim zenginleştirme','Planlandı')}${source('Verification','Hunter Email Verifier','E-posta geçerlilik ve güven skoru','Planlandı')}</div></div><div class="card"><h2>PuduBag Veri İlkeleri</h2><div class="hr"></div><p><b>1.</b> Kaynaksız iletişim bilgisi üretme.</p><p><b>2.</b> Her lead için veri kaynağı ve tarihini sakla.</p><p><b>3.</b> Gerçek kişi e-postasını yalnız iş amaçlı ve uygun hukuki temelde kullan.</p><p><b>4.</b> “Doğrulanmış / tahmini / genel kurumsal” ayrımını görünür tut.</p><p><b>5.</b> Satış ekibine gereksiz milyonlarca kayıt yükleme; önce yüksek niyetli firmaları zenginleştir.</p></div></div>`}
function source(type,name,desc,status){return `<div class="source"><strong>${type} · ${name}</strong><div class="source-meta">${desc}</div><div style="margin-top:9px"><span class="tag">${status}</span></div></div>`}

function openBuyer(id){const x=state.buyers.find(b=>b.id==id); if(!x)return; $('#modalContent').innerHTML=`<div class="profile-head"><div class="profile-title"><div class="eyebrow">BUYER INTELLIGENCE</div><h2>${x.name}</h2><div class="muted">${x.city}, ${x.country} • ${x.segment}</div></div><div class="profile-actions"><button class="ghost" id="watchBtn">${x.watch?'★ Takipte':'☆ Takibe Al'}</button><button class="primary" id="stageBtn">CRM Aşamasını İlerle</button></div></div><div class="metric-row" style="margin-top:18px">${metric('PuduBag Skoru',x.score+'/100')}${metric('Sevkiyat',x.shipments)}${metric('Son Alım',fmt(x.last))}${metric('Türkiye',x.turkey?'Evet':'Hayır')}</div><div class="profile-grid"><div class="card" style="box-shadow:none"><h3 class="section-title">Satın Alma Profili</h3><div class="tags">${x.products.map(p=>`<span class="tag">${p}</span>`).join('')}</div><p><b>Bilinen tedarikçi:</b> ${x.supplier}</p><p><b>Hacim:</b> ${x.volume}</p><p><b>Mevcut CRM aşaması:</b> <span class="status ${x.status}">${statusLabel[x.status]}</span></p><div class="hr"></div><h3 class="section-title">Neden PuduBag?</h3><p class="muted">Ürün eşleşmesi, hedef pazar ve Türkiye tedarik alışkanlığına göre yüksek potansiyel. Gerçek sürümde skorun gerekçeleri tek tek gösterilecek.</p></div><div class="card" style="box-shadow:none"><h3 class="section-title">İletişim İstihbaratı</h3><div class="contact-row"><div><b>Website / domain</b><div class="small muted">${x.domain}</div></div><span class="tag">Demo</span></div><div class="contact-row"><div><b>Buyer / Purchasing</b><div class="small muted">Gerçek veri bağlanınca zenginleştirilecek</div></div><span class="tag">Bekliyor</span></div><div class="contact-row"><div><b>E-posta doğrulama</b><div class="small muted">Kaynak + güven skoru</div></div><span class="tag">Bekliyor</span></div><div class="hr"></div><h3 class="section-title">Önerilen İlk Temas</h3><p class="muted">İngilizce katalog + 2–3 uygun ürün + düşük riskli numune teklifi. Körfez firmalarında Arapça kısa WhatsApp takibi eklenebilir.</p></div></div><div class="card" style="box-shadow:none;margin-top:15px"><h3 class="section-title">Sevkiyat Zaman Çizgisi</h3><div class="timeline"><div class="shipment"><b>${fmt(x.last)}</b><div class="small muted">Son bilinen hareket • ${x.products[0]}</div></div><div class="shipment"><b>Önceki dönem</b><div class="small muted">Demo sevkiyat geçmişi • gerçek BOL verisi daha sonra</div></div></div></div>`;
 $('#modal').classList.remove('hidden'); $('#modal').setAttribute('aria-hidden','false');
 $('#watchBtn').onclick=()=>{x.watch=!x.watch;save();openBuyer(x.id)}; $('#stageBtn').onclick=()=>{const flow=['new','contact','sample','offer','won']; x.status=flow[Math.min(flow.length-1,flow.indexOf(x.status)+1)];save();openBuyer(x.id)};
}
function metric(a,b){return `<div class="metric-box"><span>${a}</span><strong>${b}</strong></div>`}
function bindDynamic(){ $$('[data-buyer-id]').forEach(el=>el.onclick=()=>openBuyer(el.dataset.buyerId)); $$('.exporter-search').forEach(el=>el.onclick=()=>{state.query=el.dataset.exporter;switchView('buyers')}); $$('[data-view-jump]').forEach(b=>b.onclick=()=>switchView(b.dataset.viewJump)) }
function closeModal(){ $('#modal').classList.add('hidden');$('#modal').setAttribute('aria-hidden','true')}
function exportCsv(){const rows=filteredBuyers();const cols=['name','country','city','segment','products','turkey','shipments','last','score','supplier','status'];const csv=[cols.join(','),...rows.map(r=>cols.map(c=>`"${String(Array.isArray(r[c])?r[c].join(' | '):r[c]??'').replaceAll('"','""')}"`).join(','))].join('\n'); const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pudubag-export-radar-buyers.csv';a.click();URL.revokeObjectURL(a.href)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

$$('.nav-item').forEach(b=>b.onclick=()=>switchView(b.dataset.view)); $$('[data-view-jump]').forEach(b=>b.onclick=()=>switchView(b.dataset.viewJump)); $$('[data-close-modal]').forEach(b=>b.onclick=closeModal); document.addEventListener('keydown',e=>e.key==='Escape'&&closeModal());
$('#globalSearchBtn').onclick=()=>{state.query=$('#globalSearchInput').value;switchView('buyers')}; $('#globalSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#globalSearchBtn').click()}); $$('.quick-filters button').forEach(b=>b.onclick=()=>{state.query=b.dataset.query;$('#globalSearchInput').value=b.dataset.query;switchView('buyers')}); $('#exportCsvBtn').onclick=exportCsv;
renderDashboard();

// ===== v0.2 REAL DATA CONNECTOR =====
const PUDU = window.PUDU_CONFIG || {};
function realDataConfigured(){ return !!(PUDU.realDataEnabled && PUDU.supabaseUrl && PUDU.supabaseAnonKey); }
async function callEdge(functionName, payload){
  if(!realDataConfigured()) throw new Error('Gerçek veri bağlantısı henüz yapılandırılmadı. assets/config.js ve Supabase kurulumu gerekli.');
  const token = localStorage.getItem('pudu_access_token') || '';
  const r = await fetch(`${PUDU.supabaseUrl}/functions/v1/${functionName}`, {
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':PUDU.supabaseAnonKey,'Authorization':`Bearer ${token}`},
    body:JSON.stringify(payload)
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error || data?.message || `HTTP ${r.status}`);
  return data;
}
async function importYetiProductSearch(product){
  return callEdge(PUDU.functions.importYetiSearch,{action:'product_companies',product});
}
async function hunterCompanyEnrich(domain){
  return callEdge(PUDU.functions.hunterEnrich,{action:'company_enrich',domain});
}
function updateDataModeBadge(){
  const pill=document.getElementById('dataModePill'), text=document.getElementById('dataModeText');
  if(!pill||!text)return;
  if(realDataConfigured()){pill.textContent='GERÇEK VERİ'; text.textContent='Supabase Edge Functions üzerinden güvenli API modu açık.';}
  else {pill.textContent='ENTEGRASYON HAZIR'; text.textContent='Supabase + ImportYeti + Hunter anahtarları bağlanınca gerçek veri modu açılır.';}
}
updateDataModeBadge();
