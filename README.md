# Arda Altunel Portfolio

GitHub Pages üzerinde yayınlanmak için hazırlanmış statik portfolio sitesi.

Site HTML, CSS ve JavaScript ile çalışır. Bionluk hizmetleri ve GitHub pinned projeleri `build-static.mjs` ile canlı kaynaklardan çekilir, `cache/*.json` dosyalarına kaydedilir ve `index.html` içine statik olarak işlenir.

## Yayına Alma

1. Bu klasörün içeriğini GitHub repository kök dizinine yükleyin.
2. Repository ayarlarından **Pages** bölümüne girin.
3. Source olarak ilgili branch'i ve root klasörü seçin.
4. GitHub Actions sekmesinden **Update static site data** workflow'unu manuel çalıştırarak ilk veri güncellemesini test edin.

## Yerelde Çalıştırma

```bash
node build-static.mjs
python -m http.server 4173 --bind 127.0.0.1
```

Sonra tarayıcıda:

```text
http://127.0.0.1:4173/
```

## Otomatik Veri Güncelleme

`.github/workflows/update-static-site.yml` workflow'u:

- Bionluk hizmetlerini çeker.
- GitHub profilindeki pinned projeleri çeker.
- `cache/*.json` dosyalarını günceller.
- `index.html` dosyasını yeniden üretir.
- Değişiklikleri otomatik commit eder.

Deneme sırasında workflow 5 dakikada bir çalışacak şekilde ayarlanmıştır:

```yaml
cron: "*/5 * * * *"
```

Canlı kullanımda daha sakin bir aralık için örnek:

```yaml
cron: "17 */6 * * *"
```

## Dosya Yapısı

- `index.html`: GitHub Pages'in yayınladığı statik sayfa.
- `index.template.html`: Dinamik alanlar için kullanılan HTML şablonu.
- `build-static.mjs`: Canlı verileri çekip statik HTML üreten build script'i.
- `assets/`: CSS, JavaScript, görseller, fontlar ve PDF dosyaları.
- `cache/`: Son çekilen Bionluk ve GitHub verileri.
- `.nojekyll`: GitHub Pages'in dosyaları Jekyll işleminden geçirmemesi için.

## Notlar

GitHub Pages PHP çalıştırmadığı için eski `index.php` dosyası kaldırıldı. Apache'ye özel `.htaccess` dosyası da GitHub Pages üzerinde kullanılmadığı için projeden çıkarıldı.
