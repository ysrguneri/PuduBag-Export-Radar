(function () {
  'use strict';

  var cfg = window.PUDU_CONFIG || {};
  var supabaseUrl = cfg.supabaseUrl || 'https://leldkwovorbspnzkedhd.supabase.co';
  var anonKey = cfg.supabaseAnonKey || '';
  var base = supabaseUrl + '/functions/v1/';
  var importUrl = base + 'pudubag-importyeti-search';
  var hunterUrl = base + 'pudubag-hunter-enrich';
  var rpcUrl = supabaseUrl + '/rest/v1/rpc/update_export_lead';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m];
    });
  }

  function request(url, body) {
    if (!anonKey) return Promise.reject(new Error('Supabase publishable key bulunamadı.'));
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': 'Bearer ' + anonKey
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = JSON.parse(text); } catch (_) {}
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || data.message || 'İstek başarısız (' + res.status + ')');
        }
        return data;
      });
    });
  }

  function calculateScore(row) {
    var shipments = Number(row.shipments || row.totalShipments || 0);
    var score = Math.min(45, shipments * 5);
    var recent = String(row.last || row.mostRecentShipment || '');
    if (/2024|2025|2026/.test(recent)) score += 35;
    else if (/2022|2023/.test(recent)) score += 20;
    else if (recent) score += 10;
    return Math.min(100, Math.round(score));
  }

  function saveLead(id, status, watchlisted, score) {
    return request(rpcUrl, {
      p_source_external_id: id,
      p_status: status,
      p_watchlisted: watchlisted,
      p_score: score
    });
  }

  function enrich(company, box, button) {
    box.textContent = 'Hunter aranıyor: ' + company + '...';
    button.disabled = true;
    request(hunterUrl, { action: 'domain_finder', company: company, limit: 5 })
      .then(function (data) {
        var list = Array.isArray(data.data) ? data.data : [];
        var domain = list.length && list[0].domain ? list[0].domain : '';
        if (!domain) throw new Error('Hunter domain bulamadı.');
        return request(hunterUrl, { action: 'domain_search', domain: domain, limit: 10 })
          .then(function (search) {
            var emails = search.data && Array.isArray(search.data.emails) ? search.data.emails : [];
            box.innerHTML = '<b>Hunter sonucu</b><br>🌐 ' + esc(domain) + '<br>' +
              (emails.length ? emails.map(function (item) { return esc(item.value || item.email || ''); }).filter(Boolean).join('<br>') : 'E-posta bulunamadı.');
          });
      })
      .catch(function (error) {
        box.textContent = 'Hunter hata: ' + error.message;
      })
      .then(function () {
        button.disabled = false;
      });
  }

  function renderCard(row) {
    var score = calculateScore(row);
    var id = row.source_external_id || row.url || row.sourceUrl || '';
    var name = row.name || row.title || 'Bilinmeyen firma';
    return '<div class="lead-card" data-id="' + esc(id) + '" data-score="' + score + '" style="padding:16px;border:1px solid #ddd;border-radius:10px;margin:8px 0;background:#fff">' +
      '<b>' + esc(name) + '</b><br>' +
      esc(row.country || row.countryCode || '') + ' · ' + esc(row.role || row.type || '') + '<br>' +
      '<small>' + esc(row.address || '') + '</small><br>' +
      '<small>Sevkiyat: ' + esc(row.shipments || row.totalShipments || 0) + ' · Son: ' + esc(row.last || row.mostRecentShipment || '—') + '</small>' +
      '<div style="margin:10px 0"><strong>PuduBag Skoru: ' + score + '/100</strong></div>' +
      '<button type="button" class="hunter-btn">Hunter ile Zenginleştir</button> ' +
      '<button type="button" class="watch-btn">⭐ Takibe Al</button> ' +
      '<button type="button" class="crm-btn">CRM Ekle</button>' +
      '<div class="hunter-box" style="margin-top:10px;padding:10px;background:#f5f5f5"></div>' +
      '<div class="lead-msg" style="margin-top:8px"></div>' +
      '</div>';
  }

  function bindCards() {
    document.querySelectorAll('#realImportResults .lead-card').forEach(function (card) {
      var id = card.getAttribute('data-id');
      var score = Number(card.getAttribute('data-score'));
      var message = card.querySelector('.lead-msg');
      var watch = card.querySelector('.watch-btn');
      var crm = card.querySelector('.crm-btn');
      var hunter = card.querySelector('.hunter-btn');
      var hunterBox = card.querySelector('.hunter-box');
      var nameEl = card.querySelector('b');

      watch.addEventListener('click', function () {
        message.textContent = '⏳ Takibe alınıyor...';
        watch.disabled = true;
        saveLead(id, 'qualified', true, score).then(function () {
          message.textContent = '⭐ Takip listesine eklendi.';
          watch.textContent = '✓ Takipte';
        }).catch(function (error) {
          message.textContent = '❌ Takip hatası: ' + error.message;
          watch.disabled = false;
        });
      });

      crm.addEventListener('click', function () {
        message.textContent = '⏳ CRM kaydediliyor...';
        crm.disabled = true;
        saveLead(id, 'contacted', false, score).then(function () {
          message.textContent = '✓ CRM kaydedildi.';
        }).catch(function (error) {
          message.textContent = '❌ CRM hatası: ' + error.message;
          crm.disabled = false;
        });
      });

      hunter.addEventListener('click', function () {
        enrich(nameEl ? nameEl.textContent : '', hunterBox, hunter);
      });
    });
  }

  function mount() {
    var view = document.getElementById('view-buyers');
    if (!view) return;

    view.innerHTML = '<div style="padding:20px">' +
      '<h2>ImportYeti Gerçek Veri Arama</h2>' +
      '<div style="display:flex;gap:10px;max-width:800px">' +
      '<input id="liveBuyerQuery" type="text" placeholder="Ürün veya firma: backpack" style="flex:1;padding:12px">' +
      '<button id="liveBuyerSearch" type="button" style="padding:12px 22px">GERÇEK VERİYİ ARA</button>' +
      '</div>' +
      '<div id="realImportStatus" style="margin:14px 0"></div>' +
      '<div id="realImportResults"></div>' +
      '</div>';

    var input = document.getElementById('liveBuyerQuery');
    var button = document.getElementById('liveBuyerSearch');
    var status = document.getElementById('realImportStatus');
    var results = document.getElementById('realImportResults');

    function run() {
      var query = input.value.trim();
      if (!query) {
        status.textContent = 'Önce bir ürün veya firma yazın.';
        return;
      }
      button.disabled = true;
      status.textContent = 'ImportYeti aranıyor...';
      results.innerHTML = '';
      request(importUrl, { query: query, page: 1 })
        .then(function (data) {
          var rows = Array.isArray(data.results) ? data.results : [];
          status.textContent = rows.length + ' gerçek sonuç bulundu.';
          results.innerHTML = rows.length ? rows.map(renderCard).join('') : '<p>ImportYeti sonuç döndürmedi.</p>';
          bindCards();
        })
        .catch(function (error) {
          status.textContent = 'Hata: ' + error.message;
        })
        .then(function () {
          button.disabled = false;
        });
    }

    button.addEventListener('click', run);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') run();
    });
  }

  window.renderLiveBuyers = mount;
  window.runImportYetiSearch = function (query) {
    return request(importUrl, { query: query, page: 1 });
  };
})();