// Editorial sources: index.template.html and cache/chatbot-context.json.
// Keep employment dates historical and service prices on the linked Bionluk listings.
export const homeIntroduction = "Ben Arda Altunel, İstanbul merkezli bir Full Stack Developer ve Frontend Developer'ım. React, JavaScript, PHP, MySQL ve Supabase ile web projeleri geliştiriyorum. Geçmiş iş deneyimimi, proje örneklerimi ve sunduğum hizmetleri bu portfolyoda inceleyebilirsiniz.";

export const seoPages = [
  {
    path: "/hakkimda/",
    title: "Arda Altunel Kimdir? | Full Stack Developer · İstanbul",
    description: "İstanbul merkezli Full Stack Developer Arda Altunel'in web geliştirme deneyimini, React ve PHP yeteneklerini, eğitimini ve çalışmalarını tanıyın.",
    heading: "Arda Altunel kimdir?",
    intro: "Ben Arda Altunel. İstanbul'da, Tuzla merkezli çalışan bir Full Stack Developer ve Frontend Developer'ım. Web teknolojileri, kullanıcı arayüzleri ve veriyle çalışan uygulamalar geliştiriyorum. Bu sayfada teknik çalışma alanlarımı, WEATRA'daki geçmiş iş deneyimimi ve eğitim bilgilerimi bir arada bulabilirsiniz. Yaptığım işleri değerlendirmek için projeler sayfasındaki örneklere ve GitHub profilime de göz atabilirsiniz.",
    sections: [
      {
        heading: "Arayüzden veri akışına web geliştirme",
        paragraphs: [
          "Çalışmalarımın odağında responsive web arayüzleri, React tabanlı uygulamalar ve full stack web projeleri bulunuyor. Telefon, tablet ve masaüstü ekranları için sayfa düzenleri oluşturuyor; form, kayıt, listeleme ve içerik yönetimi gibi ihtiyaçlarla ilgileniyorum. Portfolyo siteleri, kurumsal web siteleri ve landing page çalışmaları da bu alanın parçası.",
          "Frontend geliştirme ile backend ve veri yönetimini birlikte ele alıyorum. REST API entegrasyonları, PHP tabanlı akışlar, MySQL ve Supabase ile çalışıyorum. Git ve GitHub sürüm kontrolü; Vite, Vercel ve GitHub Pages ise geliştirme ve yayın süreçlerinde kullandığım araçlar arasında yer alıyor.",
        ],
        links: [{ label: "Proje örneklerimi inceleyin", url: "/projeler/" }],
      },
      {
        heading: "WEATRA'daki geçmiş iş deneyimim",
        paragraphs: [
          "Ocak 2022 ile Eylül 2022 arasında WEATRA'da Frontend Developer Stajyer olarak çalıştım. HTML, CSS ve JavaScript kullanarak tasarımları farklı ekran boyutlarına uyumlu web arayüzlerine dönüştürdüm ve ekip içindeki proje süreçlerine katkı sağladım.",
          "Eylül 2022 ile Haziran 2023 arasında aynı ajansta Full Stack Developer rolünde görev aldım. Staj dönemini izleyen bu tam zamanlı görevde responsive web arayüzleri, proje geliştirme süreçleri ve temel UI/UX uygulamalarında sorumluluk üstlendim. Bu tarihler geçmiş iş deneyimimi gösteriyor; güncel çalışmalarımı freelance web geliştirme alanında sürdürüyorum.",
        ],
        links: [{ label: "LinkedIn profilim", url: "https://linkedin.com/in/ardaltunel/" }],
      },
      {
        heading: "Kullandığım teknolojiler",
        paragraphs: [
          "Frontend tarafında HTML, CSS, JavaScript, React, Tailwind CSS, Bootstrap ve Sass ile çalışıyorum. Sunucu ve veri tarafındaki araçlarım arasında PHP, MySQL, SQL ve Supabase var. Web servisleriyle iletişim kurarken REST API, JSON ve XML kullanıyorum.",
          "Teknik ilgi alanlarım web geliştirmeyle sınırlı değil. C#, Python, Kotlin, Linux ve yapay zekâ konuları da sitedeki yetenek listemde yer alıyor. Yapay zekâ destekli geliştirme, makine öğrenimi ve doğal dil işleme konularındaki öğrenme çalışmalarımı sertifikalar bölümünde paylaşıyorum.",
        ],
        links: [],
      },
      {
        heading: "Eğitimim ve öğrenme çalışmalarım",
        paragraphs: [
          "İstanbul Okan Üniversitesi Mobil Teknolojileri ön lisans programında eğitimime devam ediyorum; portfolyomdaki eğitim dönemi 2025–2027 olarak yer alıyor. Öncesinde, 2018–2023 döneminde Tuzla MTAL'de Bilgisayar Programcılığı eğitimi aldım.",
          "Sertifikalarım arasında 2024 tarihli Microsoft Certified Solutions Developer eğitimi ve 2023 tarihli web geliştirme, HTML5, Bootstrap, Git/GitHub ve SEO eğitimleri bulunuyor. Ağustos 2026'da IBM, LinkedIn Learning ve Google Cloud Skills Boost üzerinden aldığım yapay zekâ eğitimlerini de ana sayfada listeliyorum.",
        ],
        links: [{ label: "Özgeçmişimi açın", url: "/assets/pdf/arda-altunel-cv.pdf" }],
      },
      {
        heading: "Bir web projesini görüşmek için",
        paragraphs: [
          "Yeni bir web sitesi, mevcut arayüzü yenileme veya küçük bir web uygulaması için benimle iletişime geçebilirsiniz. İlk mesajınızda projenin amacını, beklediğiniz sayfaları ve varsa referans bağlantılarını paylaşmanız, ihtiyacı anlamama yardımcı olur. Hizmet detaylarımı Bionluk profilimde, kod çalışmalarımı ise GitHub'da bulabilirsiniz.",
        ],
        links: [
          { label: "Web geliştirme hizmetleri", url: "/hizmetler/" },
          { label: "E-posta ile iletişim", url: "mailto:arifardaaltunel@gmail.com" },
        ],
      },
    ],
  },
  {
    path: "/projeler/",
    title: "Arda Altunel'in Projeleri | React ve Full Stack Web",
    description: "Arda Altunel'in Omni Tools, Blog Platformu ve Emlak Kraliçeleri projelerini; kullanılan teknolojileri, özellikleri ve proje bağlantılarıyla inceleyin.",
    heading: "Web geliştirme projelerim",
    intro: "Ben Arda Altunel. Bu sayfada React tabanlı araç uygulaması, içerik yönetimi sunan blog platformu ve full stack emlak projesi gibi çalışmalarımı tanıtıyorum. Her örnek, portfolyomda yer alan teknoloji ve özellik bilgileriyle birlikte sunuluyor. Proje bağlantıları ile GitHub depolarını ayrı ayrı inceleyerek arayüzlere, kullanım akışlarına ve paylaşılan koda ulaşabilirsiniz.",
    sections: [
      {
        heading: "Omni Tools: React tabanlı araç uygulaması",
        paragraphs: [
          "Omni Tools, farklı araçları ve modülleri bir araya getiren bir web uygulaması. Projede React, React Router, Tailwind CSS ve REST API'ler kullanılıyor. Portfolyomdaki bu örnek, bileşen tabanlı arayüz geliştirme ile farklı araçları ortak bir uygulama içinde sunma yaklaşımını bir araya getiriyor.",
          "Uygulama, üretkenlik araçları ve dashboard deneyimleri üzerine kurulu. React uygulamalarına ilgi duyuyorsanız bu proje üzerinden araçların sunumunu ve sayfa düzenlerini inceleyebilirsiniz. Kaynak koduna bakmak isteyenler için ayrı GitHub deposu da bulunuyor; böylece yalnızca ekran görüntülerine bağlı kalmadan projeyi değerlendirebilirsiniz.",
        ],
        links: [
          { label: "Omni Tools uygulamasını açın", url: "https://ardaltunel.github.io/omni-tools/" },
          { label: "Omni Tools GitHub deposu", url: "https://github.com/ardaltunel/omni-tools" },
        ],
      },
      {
        heading: "Blog Platformu: içerik ve kullanıcı yönetimi",
        paragraphs: [
          "Blog Platformu, JavaScript ve Supabase ile geliştirdiğim içerik odaklı bir çalışma. Kayıt, kimlik doğrulama, admin paneli, içerik yönetimi ve görsel yönetimi sunuyor. Bu özellikler, ziyaretçiye görünen yazı sayfalarının yanında içeriğin hazırlanması ve yönetilmesi için de farklı ekranlara ihtiyaç duyan bir uygulama yapısı oluşturuyor.",
          "Proje, web arayüzüyle kullanıcı ve içerik verilerinin birlikte ele alındığı çalışmalarım arasında yer alıyor. Blogun bağlantısını ve GitHub deposunu aşağıda bulabilirsiniz. Kendi içerik projenizi görüşürken yazıların kim tarafından yönetileceğini, kullanıcı kaydı gerekip gerekmediğini ve hangi yönetim ekranlarına ihtiyaç duyduğunuzu bu örnek üzerinden anlatabilirsiniz.",
        ],
        links: [
          { label: "Blog Platformu'nu açın", url: "https://ardaltunel.github.io/blog/" },
          { label: "Blog GitHub deposu", url: "https://github.com/ardaltunel/blog" },
        ],
      },
      {
        heading: "Emlak Kraliçeleri: full stack emlak web projesi",
        paragraphs: [
          "Emlak Kraliçeleri, responsive ilan arayüzü ve frontend-backend entegrasyonu bulunan bir full stack web projesi. Portfolyomdaki bu örnek, emlak ilanlarının sunulduğu arayüz ile uygulamanın sunucu tarafının birlikte çalışmasını kapsıyor. Projenin bağlantısını aşağıda bulabilirsiniz.",
          "İlan temelli bir web sitesi düşünüyorsanız, bu çalışma konuşmaya başlamak için bir örnek olabilir. Kendi projenizde hangi ilan bilgilerinin gösterileceğini, sayfa düzenlerini ve yönetim ihtiyaçlarını ayrıca paylaşabilirsiniz. İçeriklerin nasıl hazırlanacağını ve ziyaretçinin hangi bilgilere ulaşmasını istediğinizi belirtmeniz, ihtiyaç duyulan ekranları görüşmemize yardımcı olur.",
        ],
        links: [{ label: "Emlak Kraliçeleri sitesini açın", url: "https://emlakkraliceleri.com" }],
      },
      {
        heading: "GitHub'daki diğer çalışmalarım",
        paragraphs: [
          "GitHub profilimde kişisel portfolyomun yanı sıra müzik paylaşım uygulaması, no-hello bilgilendirme sayfası ve Phantaso bot tanıtım sitesi gibi farklı çalışmalar da yer alıyor. Bu bölüm, GitHub üzerinde paylaştığım kod ve arayüz örneklerini bir araya getiriyor. Ana sayfadaki proje kartları üzerinden ilgili depolara ulaşabilirsiniz.",
        ],
        links: [{ label: "Tüm GitHub depolarımı inceleyin", url: "https://github.com/ardaltunel/" }],
      },
      {
        heading: "Benzer bir proje için iletişim",
        paragraphs: [
          "Bir projedeki yaklaşımı kendi web siteniz için görüşmek isterseniz, ilgilendiğiniz örneği ve ihtiyacınızı kısa bir mesajla paylaşabilirsiniz. Kapsamı anlamak için mevcut site adresi, beklenen sayfalar ve gerekli entegrasyonlar gibi bilgiler yararlı olur.",
        ],
        links: [
          { label: "Hizmetlerimi inceleyin", url: "/hizmetler/" },
          { label: "Projenizi e-posta ile paylaşın", url: "mailto:arifardaaltunel@gmail.com" },
        ],
      },
    ],
  },
  {
    path: "/hizmetler/",
    title: "Web Geliştirme Hizmetleri | Arda Altunel · İstanbul",
    description: "Arda Altunel'in mobil uyumlu portfolyo, blog, kurumsal site ve web geliştirme hizmetlerini keşfedin. Kapsam ve güncel teklifler için iletişime geçin.",
    heading: "Web geliştirme hizmetlerim",
    intro: "Ben Arda Altunel, İstanbul merkezli bir Full Stack Developer'ım. Portfolyo, kurumsal web sitesi, landing page ve küçük web uygulamaları için geliştirme, entegrasyon ve yayına alma desteği sunuyorum. Bu sayfada çalışma alanlarımı ve Bionluk üzerinden sunduğum hizmetleri bulabilirsiniz. Yeni bir site hazırlatmak veya mevcut sitenizdeki bir ihtiyacı görüşmek için kısa bir brief paylaşabilirsiniz.",
    sections: [
      {
        heading: "Mobil uyumlu portfolyo ve tanıtım siteleri",
        paragraphs: [
          "Kişisel markanızı, çalışmalarınızı ve yeteneklerinizi tanıtmak için portfolyo web sitesi geliştirebilirim. Kurumsal site ve landing page çalışmaları da sunduğum web geliştirme alanları arasında bulunuyor. Telefon, tablet ve masaüstünde kullanılabilecek responsive sayfa düzenleriyle ilgileniyorum.",
          "Projenizi anlatırken tanıtmak istediğiniz hizmetleri, sayfa başlıklarını, iletişim bilgilerini ve beğendiğiniz tasarım örneklerini paylaşabilirsiniz. Hazır metinlerinizin ve görsellerinizin olup olmadığını belirtmeniz de kapsamı konuşmayı kolaylaştırır. Bionluk'taki portfolyo hizmeti sayfamda ilgili ilanın ayrıntılarını inceleyebilirsiniz.",
        ],
        links: [{ label: "Bionluk'ta portfolyo sitesi hizmeti", url: "https://bionluk.com/ardaltunel/mobil-uyumlu-portfolio-web-sitesi-yaparim-855157" }],
      },
      {
        heading: "Blog, içerik yönetimi ve link in bio",
        paragraphs: [
          "İçerik paylaşmak isteyenler için mobil uyumlu blog sitesi hizmetim bulunuyor. JavaScript ve Supabase ile geliştirdiğim Blog Platformu, içerik ve görsel yönetimi, kayıt ve kimlik doğrulama gibi akışları inceleyebileceğiniz bir proje örneği. İhtiyacınıza göre hangi ekranların ve içerik yönetimi özelliklerinin gerekli olduğunu görüşebiliriz.",
          "Sosyal medya profilleriniz, web siteniz ve diğer bağlantılarınız için kişiye özel link in bio sitesi de hazırlıyorum. Blog ve bağlantı sayfası farklı ihtiyaçlara karşılık geldiğinden, ziyaretçinin hangi bilgilere ulaşmasını istediğini ilk mesajınızda belirtmeniz yararlı olur.",
        ],
        links: [
          { label: "Bionluk'ta blog sitesi hizmeti", url: "https://bionluk.com/ardaltunel/mobil-uyumlu-blog-sitesi-yaparim-613069" },
          { label: "Bionluk'ta link in bio hizmeti", url: "https://bionluk.com/ardaltunel/kisiye-ozel-modern-link-in-bio-sitesi-yaparim-855072" },
        ],
      },
      {
        heading: "Mevcut siteler, arayüz ve entegrasyon ihtiyaçları",
        paragraphs: [
          "Mevcut web sitelerindeki teknik, görsel ve kullanım sorunlarının tespiti ve giderilmesi için hizmet sunuyorum. Arayüz yenileme, responsive düzenler, form ve listeleme ekranları, PHP tabanlı akışlar ve REST API entegrasyonları çalışma alanlarım arasında yer alıyor. React, JavaScript, PHP, MySQL ve Supabase kullandığım temel teknolojilerden bazıları.",
          "Bir hata için iletişime geçerken sorunun görüldüğü sayfayı, hangi işlemden sonra ortaya çıktığını ve kullandığınız cihazı belirtmeniz yardımcı olur. Varsa ekran görüntüsü ve hata mesajını da ekleyebilirsiniz. Böylece görüşme, genel bir sorun tarifinden belirli bir kullanım akışına ilerleyebilir.",
        ],
        links: [{ label: "Bionluk'ta web sitesi hata giderme hizmeti", url: "https://bionluk.com/ardaltunel/web-sitenizdeki-hatalari-tespit-eder-ve-gideririm-536375" }],
      },
      {
        heading: "Proje kapsamını nasıl görüşebiliriz?",
        paragraphs: [
          "İlk mesajınızda sitenin amacını, hedeflediğiniz kullanıcıları ve beklediğiniz temel özellikleri paylaşabilirsiniz. Yeni bir site için sayfalar ve içerikler; mevcut bir uygulama için kullanılan teknolojiler ve değiştirilmesi istenen bölümler iyi bir başlangıç noktasıdır. Gerekli entegrasyonları, varsa mevcut alan adını ve düşündüğünüz takvimi de belirtmeniz yararlı olur.",
          "Kapsam, teslim beklentileri ve hizmet detayları üzerinde iletişim kurmak için e-posta veya Bionluk profilimi kullanabilirsiniz. Önceki çalışmalarımı görmek isterseniz projeler sayfasında farklı ihtiyaçlara yönelik örnekleri bulabilirsiniz.",
        ],
        links: [
          { label: "Proje örneklerim", url: "/projeler/" },
          { label: "E-posta ile proje görüşmesi", url: "mailto:arifardaaltunel@gmail.com" },
        ],
      },
      {
        heading: "Güncel hizmet detayları ve fiyat bilgisi",
        paragraphs: [
          "Hizmetlerin güncel paket, fiyat ve teslim ayrıntıları için Bionluk ilanlarımı inceleyebilirsiniz. Ayrıca profilimde SEO uyumlu blog yazısı ve İngilizce–Türkçe çeviri hizmetleri de bulunuyor. İhtiyacınızı ilgili ilan üzerinden veya doğrudan benimle paylaşarak projenizin kapsamını görüşebilirsiniz.",
        ],
        links: [{ label: "Bionluk profilim ve tüm hizmetler", url: "https://bionluk.com/ardaltunel" }],
      },
    ],
  },
];
