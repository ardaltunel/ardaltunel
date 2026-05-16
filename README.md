# Arda Altunel Portfolio

Modern, responsive ve GitHub Pages destekli kişisel portfolio websitesi.

Bu proje; projelerimi, freelance hizmetlerimi, sosyal bağlantılarımı ve teknik yeteneklerimi modern bir arayüz ile sergilemek amacıyla geliştirilmiştir.

## 🌍 Live Website

🔗 https://ardaltunel.github.io/

---

## 📸 Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/ardaltunel/ardaltunel.github.io/main/assets/images/preview.png" width="100%">
</p>

---

# ✨ Özellikler

- Modern ve responsive tasarım
- GitHub Pages desteği
- Otomatik veri güncelleme sistemi
- GitHub pinned repository entegrasyonu
- Bionluk servis entegrasyonu
- Tamamen statik yapı
- SEO dostu yapı
- Hızlı yükleme performansı
- Mobil uyumlu kullanıcı deneyimi

---

# 🚀 Kullanılan Teknolojiler

<p align="left">
  <img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/GitHub_Pages-121013?style=for-the-badge&logo=github&logoColor=white">
</p>

---

# 📂 Proje Yapısı

```text
.
├── assets/                  # CSS, JS, görseller, fontlar
├── cache/                   # Cache verileri
├── .github/workflows/       # GitHub Actions workflow dosyaları
├── build-static.mjs         # Static build script
├── index.template.html      # HTML template
├── index.html               # Build sonrası oluşan statik sayfa
└── .nojekyll
```

---

# ⚙️ Yerelde Çalıştırma

```bash
node build-static.mjs
python -m http.server 4173 --bind 127.0.0.1
```

Daha sonra tarayıcı üzerinden:

```text
http://127.0.0.1:4173/
```

adresine gidin.

---

# 🚀 GitHub Pages Yayına Alma

1. Repository dosyalarını GitHub repository kök dizinine yükleyin.
2. Repository ayarlarından `Pages` bölümüne girin.
3. Source olarak ilgili branch ve root klasörü seçin.
4. GitHub Actions üzerinden:

```text
Update static site data
```

workflow'unu çalıştırın.

---

# 🔄 Otomatik Veri Güncelleme Sistemi

`.github/workflows/update-static-site.yml` workflow'u:

- Bionluk hizmetlerini çeker
- GitHub pinned projelerini çeker
- `cache/*.json` dosyalarını günceller
- Statik HTML çıktısı oluşturur
- Değişiklikleri otomatik commit eder

---

# 🎯 Proje Amacı

Bu proje;

- Modern portfolio geliştirmek
- GitHub Pages pratiği yapmak
- Static site generation mantığını öğrenmek
- Otomatik veri güncelleme sistemleri geliştirmek
- Responsive frontend deneyimi oluşturmak

amacıyla geliştirilmiştir.

---

# 📄 License

This project is licensed under the MIT License.

For more details:
<a href="LICENSE">LICENSE</a>
