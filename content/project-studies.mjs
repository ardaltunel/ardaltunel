// Verified against public GitHub main-branch README/source files on 2026-11-01.
// Omni Tools: index.js, tools/json-formatter/app.js, tools/image-compressor/app.js.
// Blog: README.md, assets/js/auth-pages.js, assets/js/app.js, database/supabase/schema.sql.
const omniRepository = "https://github.com/ardaltunel/omni-tools";
const blogRepository = "https://github.com/ardaltunel/blog";

export const projectStudies = [
  {
    kind: "project",
    projectKey: "omni-tools",
    path: "/projeler/omni-tools/",
    title: "Omni Tools Projesi | Arda Altunel'in Araç Uygulaması",
    description: "Omni Tools'un araç arama, kategori filtreleme ve JSON biçimlendirme akışlarını inceleyin. Arda Altunel'in projesinden somut özellikler ve kaynak kodu.",
    heading: "Omni Tools: tek panelde farklı web araçları",
    intro: "Omni Tools, farklı günlük işleri aynı uygulama içinde sunan web projem. Araç kataloğundan bir uygulama seçilebilir; arama ve kategori filtreleriyle liste daraltılabilir. Bu inceleme, projenin herkese açık kaynak kodunda görülen gezinme ve JSON işleme akışlarına odaklanıyor. Arayüzün güncel uygulamasında HTML, CSS ve JavaScript dosyaları kullanılıyor.",
    sections: [
      {
        heading: "Araç bulma ve kategori filtreleri",
        paragraphs: [
          "Ana ekrandaki araç kartları, arama alanına yazılan sözcüklere ve seçilen kategorilere göre süzülüyor. Arama yalnızca araç adına bakmıyor; kategori, açıklama ve araçla ilişkili arama metni de eşleşmeye katılıyor. Birden fazla kategori seçilebiliyor. Sonuç sayısı arayüzde güncellenirken eşleşmeyen kartlar ve boş kalan kategori bölümleri gizleniyor.",
          "Bir araç açıldığında ilgili panel etkinleşiyor ve tarayıcı geçmişi güncelleniyor. Bu yapı, araç listesinden çalışma ekranına geçişi aynı arayüz içinde tutuyor. Araç etkinleştirme, kartları oluşturma ve filtreleme davranışları ana JavaScript dosyasında ayrı işlevlerle tanımlanıyor.",
        ],
        links: [{ label: "Arama, filtreleme ve gezinme kaynak kodu", url: `${omniRepository}/blob/main/index.js` }],
      },
      {
        heading: "JSON biçimlendirme: girdiden kopyalanabilir çıktıya",
        paragraphs: [
          "JSON aracında kullanıcı metnini yapıştırıp okunabilir biçime dönüştürebiliyor veya tek satıra sıkıştırabiliyor. İşlem, JavaScript'in JSON ayrıştırma ve serileştirme işlevleriyle yapılıyor. Başarılı sonuçta anahtarlar, metinler, sayılar ve diğer JSON öğeleri farklı görsel sınıflarla gösteriliyor; çıktı panoya kopyalanabiliyor.",
          "Boş giriş ve geçersiz sözdizimi için ayrı hata durumları bulunuyor. Tarayıcının hata bilgisi uygun olduğunda satır ve sütun konumu da gösteriliyor. Kullanıcı girdiyi değiştirdiğinde önceki sonuç temizleniyor; böylece eski çıktı, yeni metnin işlenmiş sonucu gibi sunulmuyor.",
        ],
        links: [{ label: "JSON aracının kaynak kodu", url: `${omniRepository}/blob/main/tools/json-formatter/app.js` }],
      },
      {
        heading: "Projeyi incelemek için",
        paragraphs: [
          "Bu örnek, ortak bir araç kataloğu ile her aracın kendi giriş, sonuç ve hata durumlarını birlikte ele alıyor. GitHub deposunda görsel sıkıştırma, QR işlemleri ve diğer araçların dosyaları da bulunuyor. Kaynak üzerinden uygulama davranışlarını ve araçların nasıl ayrıldığını inceleyebilirsiniz.",
        ],
        links: [{ label: "Omni Tools GitHub deposu", url: omniRepository }],
      },
    ],
  },
  {
    kind: "project",
    projectKey: "blog-platformu",
    path: "/projeler/blog-platformu/",
    title: "Blog Platformu Projesi | Arda Altunel · Supabase",
    description: "Arda Altunel'in JavaScript ve Supabase blog projesinde yazı hazırlama, kategori, kapak görseli ve yönetici incelemesi akışlarını kaynaklarıyla keşfedin.",
    heading: "Blog Platformu: yazı hazırlamadan yönetici incelemesine",
    intro: "Blog Platformu, HTML, CSS ve JavaScript ön yüzünü Supabase servisleriyle birleştiren web projem. GitHub Pages üzerinde yayınlanabilen statik sayfalar; kullanıcı oturumu, yazı verileri ve görseller için Supabase ile çalışıyor. Projede okuma ekranlarının yanında kayıt, giriş, yazı hazırlama ve yönetim paneli de bulunuyor.",
    sections: [
      {
        heading: "Yazı hazırlama ve incelemeye gönderme",
        paragraphs: [
          "Yazı ekleme ekranı önce kullanıcı oturumunu ve yazar profilini kontrol ediyor. Oturumu bulunmayan kullanıcı giriş ekranına yönlendiriliyor. Yazar, başlık ve içerik hazırlıyor, kategori seçiyor ve kapak görseli ekliyor. Zorunlu alanlar eksik olduğunda form, gönderimden önce ilgili hata mesajını gösteriyor.",
          "Görsel yüklemesi tamamlandıktan sonra yazı; başlık, içerik, görsel bağlantısı, kategori ve yazar bilgisiyle kaydediliyor. Yeni yazı onaylanmamış durumda oluşturuluyor ve kullanıcıya yönetici incelemesine gönderildiği bildiriliyor. Yönetim panelindeki yayın durumu denetimi, yazının yayında olup olmadığını değiştirmek için ayrı bir arayüz sunuyor.",
        ],
        links: [{ label: "Yazı gönderme ve yönetim ekranlarının kaynak kodu", url: `${blogRepository}/blob/main/assets/js/auth-pages.js` }],
      },
      {
        heading: "Kategori, yazar ve görsel ilişkileri",
        paragraphs: [
          "Veri yapısı kategorileri, yazarları ve yazıları ayrı tablolarda tutuyor. Yazılar kategori ve yazar kayıtlarıyla ilişkilendiriliyor; yayın ve öne çıkarma durumları ayrı alanlarda saklanıyor. Böylece yazı içeriğiyle yayın durumunun aynı kayıt içinde izlenebildiği bir yapı oluşuyor.",
          "Kapak görselleri Supabase Storage'a yükleniyor ve bağlantıları yazılara ekleniyor. Yazı formu PNG, JPEG ve WebP görsellerini dosya sınırıyla kontrol ediyor. Düzenleme ekranında yeni kapak seçilmediğinde mevcut görsel korunuyor; yönetim bölümünde kategorileri ekleme ve düzenleme ekranları da yer alıyor.",
        ],
        links: [{ label: "Kategori, yazar ve yazı tabloları", url: `${blogRepository}/blob/main/database/supabase/schema.sql` }],
      },
      {
        heading: "Statik ön yüz ve servis entegrasyonu",
        paragraphs: [
          "Bu proje, statik olarak yayınlanan sayfalarla veri ve oturum servislerinin birlikte kullanılmasına örnek oluşturuyor. Okuma arayüzü, yayınlanmış yazıları ve kategorileri alırken içerik üretme işlemleri ayrı form ve panel ekranlarından yürütülüyor. GitHub deposunda ön yüz dosyaları, veri şeması ve kurulum açıklamaları birlikte incelenebilir.",
        ],
        links: [{ label: "Blog Platformu GitHub deposu", url: blogRepository }],
      },
    ],
  },
];
