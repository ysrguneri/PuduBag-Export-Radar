# PuduBag Export Radar v0.2 — Gerçek Veri Kurulumu

## Güvenlik mimarisi
ImportYeti ve Hunter API anahtarlarını **index.html, app.js veya config.js içine yazmayın**.
Anahtarlar yalnız Supabase Edge Function secret olarak tutulur.

## 1) Yeni Supabase projesi
PuduBag için MMK ve Elmas Hıfz'dan tamamen ayrı bir Supabase projesi kullanın.

## 2) Migration
`supabase/migrations/001_export_radar_core.sql` dosyasını migration olarak uygulayın.

## 3) Secret'lar
Edge Functions için:
- HUNTER_API_KEY
- IMPORTYETI_API_KEY
- IMPORTYETI_AUTH_MODE = query | bearer | header
- IMPORTYETI_AUTH_NAME = hesabınızın dokümantasyonunda belirtilen parametre/header adı

ImportYeti API dokümanı endpointleri ve kredi tüketimini açıklar; anahtarın hangi header/query adıyla verileceğini API hesabınızda verilen erişim talimatına göre ayarlayın.

## 4) Edge Functions
Deploy:
- pudubag-importyeti-search
- pudubag-hunter-enrich
- pudubag-buyer-pipeline

JWT doğrulaması açık olmalıdır. Fonksiyonlar ayrıca çağıran kullanıcıyı `auth.getUser()` ile doğrular.

## 5) Frontend config
`assets/config.js`:
- supabaseUrl
- supabaseAnonKey (publishable/anon key)
- realDataEnabled: true

Secret key'leri bu dosyaya KOYMAYIN.

## 6) İlk pilot arama
Önerilen ImportYeti ürün sorguları:
- tote bag
- textile bag
- cosmetic bag
- travel organizer
- packing cube
- pouch
- drawstring bag
- toiletry bag
- laundry bag
- storage bag

ABD alıcı havuzunu ImportYeti ile çıkarın. Sonra en güçlü 100–500 firmayı Hunter Domain Finder / Domain Search / Company Enrichment ile zenginleştirin.

## 7) Maliyet kontrolü
- ImportYeti: her endpoint data credit tüketebilir; response'taki `requestCost` ve `creditsRemaining` integration_runs'a kaydedilir.
- Hunter: önce ücretsiz Discover/Domain Finder gibi düşük maliyetli keşif; Domain Search/Verifier yalnız yüksek skorlu leadlerde çalıştırılmalı.
