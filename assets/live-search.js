(function () {
  'use strict';

  var cfg = window.PUDU_CONFIG || {};
  var supabaseUrl = cfg.supabaseUrl || 'https://leldkwovorbspnzkedhd.supabase.co';
  var supabaseKey = cfg.supabaseAnonKey || '';
  var importUrl = supabaseUrl + '/functions/v1/pudubag-importyeti-search';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }

  function search(query) {
    if (!supabaseKey) return Promise.reject(new Error('Supabase publishable key bulunamadı.'));
    return fetch(importUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey
      },
      body: JSON.stringify({query: query, page: 1})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok || data.ok === false) throw new Error(data.error || ('İstek başarısız (' + r.status + ')'));
        return data;
      });
    });
  }

  function card(x) {
    return '<div style="padding:16px;border:1px solid #ddd;border-radius:10px;margin:8px 0;background:#fff">' +
      '<b>' + esc(x.name || x.title) + '</b><br>' +
      '<span>' + esc(x.country || x.countryCode || '') + '</span> · ' +
      '<span>' + esc(x.role || x.type || '') + '</span><br>' +
      '<small>' + esc(x.address || '') + '</small><br>' +
      '<small>Sevkiyat: ' + esc(x.shipments || x.totalShipments || 0) + ' · Son: ' + esc(x.last || x.mostRecentShipment || '—') + '</small>' +
      '</div>';
  }

  function mount() {
    var host = document.getElementById('view-buyers');
    if (!host) return;

    host.innerHTML = '<div style="padding:20px">' +
      '<h2>ImportYeti Gerçek Veri Arama</h2>' +
      '<div style="display:flex;gap:10px;max-width:800px">' +
      '<input id="realImportQuery" type="text" placeholder="Ürün veya firma: backpack" style="flex:1;padding:12px">' +
      '<button id="realImportSearch" type="button" style="padding:12px 22px;cursor:pointer">GERÇEK VERİYİ ARA</button>' +
      '</div>' +
      '<div id="realImportStatus" style="margin:14px 0"></div>' +
      '<div id="realImportResults"></div>' +
      '</div>';

    var input = document.getElementById('realImportQuery');
    var button = document.getElementById('realImportSearch');
    var status = document.getElementById('realImportStatus');
    var results = document.getElementById('realImportResults');

    function run() {
      var q = input.value.trim();
      if (!q) { status.textContent = 'Önce bir ürün veya firma yazın.'; return; }
      button.disabled = true;
      status.textContent = 'ImportYeti aranıyor...';
      results.innerHTML = '';
      search(q).then(function (data) {
        var rows = Array.isArray(data.results) ? data.results : [];
        status.textContent = rows.length + ' gerçek sonuç bulundu.';
        results.innerHTML = rows.length ? rows.map(card).join('') : '<p>ImportYeti sonuç döndürmedi.</p>';
      }).catch(function (err) {
        status.textContent = 'Hata: ' + err.message;
      }).then(function () { button.disabled = false; });
    }

    button.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  }

  window.renderLiveBuyers = mount;
  window.runImportYetiSearch = search;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
})();
