(() => {
  const CFG = window.PUDU_CONFIG || {};
  const SUPABASE_URL = CFG.supabaseUrl || 'https://leldkwovorbspnzkedhd.supabase.co';
  const SUPABASE_KEY = CFG.supabaseAnonKey || '';
  const IMPORT_URL = SUPABASE_URL + '/functions/v1/pudubag-importyeti-search';

  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (m) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));

  async function importSearch(query) {
    if (!SUPABASE_KEY) throw new Error('Supabase publishable key bulunamadı.');
    const response = await fetch(IMPORT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY
      },
      body: JSON.stringify({ query: query, page: 1 })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || ('İstek başarısız (' + response.status + ')'));
    }
    return data;
  }

  function renderCard(row) {
    const role = row.role === 'company' ? 'Alıcı' : row.role === 'supplier' ? 'Tedarikçi' : (row.role || 'Kayıt');
    return '<article class="buyer-card live-buyer-card">' +
      '<div class="top"><div><div class="name">' + esc(row.name) + '</div>' +
      '<div class="meta">' + esc(row.city) + (row.city && row.country ? ', ' : '') + esc(row.country) + ' • ' + esc(role) + '</div></div>' +
      '<span class="score medium">' + esc(row.score || 50) + '</span></div>' +
      '<div class="tags"><span class="tag">ImportYeti</span><span class="tag">' + esc(row.shipments || 0) + ' sevkiyat</span></div>' +
      '<div class="small">Son alım: ' + esc(row.last || '—') + ' • ' + esc(row.address || 'Adres yok') + '</div>' +
      '<div class="foot"><a class="ghost" href="' + esc(row.url || '#') + '" target="_blank" rel="noopener">ImportYeti ↗</a></div>' +
      '</article>';
  }

  window.renderLiveBuyers = function(initialQuery) {
    const host = document.querySelector('#view-buyers');
    if (!host) return;

    host.innerHTML = '<div class="card">' +
      '<div class="card-head"><div><h2>ImportYeti Gerçek Veri Arama</h2>' +
      '<div class="muted small">Canlı ImportYeti verisi</div></div><span class="demo-pill">CANLI VERİ</span></div>' +
      '<div class="filters"><input id="liveBuyerQuery" placeholder="Ürün veya firma: backpack, luggage, cosmetic bag…" value="' + esc(initialQuery || '') + '">' +
      '<button id="liveBuyerSearch" class="primary" type="button">Ara</button></div>' +
      '<div id="liveBuyerMeta" class="muted small" style="margin:12px 0"></div>' +
      '<div id="liveBuyerGrid" class="grid buyer-cards"><div class="empty">Bir ürün veya firma yazıp Ara butonuna basın.</div></div></div>';

    const input = document.querySelector('#liveBuyerQuery');
    const button = document.querySelector('#liveBuyerSearch');
    const meta = document.querySelector('#liveBuyerMeta');
    const grid = document.querySelector('#liveBuyerGrid');

    async function run() {
      const query = input.value.trim();
      if (!query) {
        meta.textContent = 'Önce bir ürün veya firma yazın.';
        input.focus();
        return;
      }
      button.disabled = true;
      button.textContent = 'Aranıyor…';
      meta.textContent = 'ImportYeti sorgulanıyor…';
      grid.innerHTML = '<div class="empty">Gerçek veri alınıyor…</div>';
      try {
        const data = await importSearch(query);
        const rows = Array.isArray(data.results) ? data.results : [];
        meta.textContent = (data.found != null ? data.found : rows.length) + ' sonuç bulundu • ' + (data.saved || 0) + ' kayıt işlendi • Toplam: ' + (data.totalHits != null ? data.totalHits : '—');
        grid.innerHTML = rows.length ? rows.map(renderCard).join('') : '<div class="empty">ImportYeti sonuç döndürmedi.</div>';
      } catch (error) {
        meta.textContent = 'Canlı arama hatası';
        grid.innerHTML = '<div class="empty">' + esc(error.message) + '</div>';
        console.error('ImportYeti live search:', error);
      } finally {
        button.disabled = false;
        button.textContent = 'Ara';
      }
    }

    button.addEventListener('click', run);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') run();
    });
    if (initialQuery) run();
  };

  window.renderBuyers = window.renderLiveBuyers;
})();
