# PuduBag Export Radar — Veri Entegrasyon Planı

## 1. Trade / Market Intelligence
- UN Comtrade: ülke, ürün/HS kodu, ticaret akışı, hedef pazar analizi.
- Amaç: hangi ülke ve ürün grubunda talep büyüyor sorusunu cevaplamak.

## 2. Company / Shipment Intelligence
- ImportYeti (özellikle ABD şirket/ticaret bağlantıları) veya lisanslı global trade-data sağlayıcısı.
- Amaç: Türk tedarikçi -> yabancı alıcı -> sevkiyat geçmişi ilişkisini kurmak.

## 3. Company & Contact Enrichment
- Hunter Discover / Domain Search / Email Finder / Company Enrichment veya alternatif sağlayıcı.
- Amaç: şirket domaini, kurumsal e-posta, buyer/purchasing temasları.

## 4. Email Verification
- Hunter Email Verifier veya eşdeğer servis.
- Her e-posta için: status, confidence/score, verify date, source.

## 5. Data Governance
Her kayıt en az şu metadata ile saklanmalı:
- source_provider
- source_url / source_record_id
- observed_at
- verified_at
- confidence_score
- contact_type: generic / person / predicted / verified

## 6. Pilot
1. 50–100 Türk çanta/tekstil ihracatçısı belirle.
2. Bilinen yabancı alıcılarını çıkar.
3. Aynı alıcıları normalize et / birleştir.
4. Ürün ve ülke uyum skorunu hesapla.
5. İlk 500 yüksek potansiyelli firmayı contact enrichment'e gönder.
6. CRM'e otomatik lead oluştur.
