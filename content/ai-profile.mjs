// Provenance: cache/chatbot-context.json (identity, projects, languages and dates),
// index.template.html (public contact and credential links), content/seo-pages.mjs.
// Self-published portfolio facts; no claim of independent recognition or endorsement.
const canonicalUrl = "https://ardaltunel.vercel.app/";
const contribution = {
  tr: "Arda Altunel'in herkese açık portfolyosunda yer alan proje.",
  en: "Project listed in Arda Altunel's public portfolio.",
};
const credentials = [
  { name: "Artificial Intelligence Fundamentals", issuer: "IBM", issued: "2026-08",
    url: "https://www.credly.com/badges/76641118-d199-4273-a7c9-19996f3032e6/public_url" },
  { name: "What Is Generative AI", issuer: "LinkedIn Learning", issued: "2026-08",
    url: "https://www.linkedin.com/learning/certificates/712db996b4eb0159558e4692adbe3c9d96c577d83fcf26f94593a2b3647a400a" },
  { name: "Introduction to Responsible AI", issuer: "Google Cloud Skills Boost", issued: "2026-08",
    url: "https://www.skills.google/public_profiles/2e0082cc-4e27-42e2-baf2-ae9ff90f7562/badges/27208182" },
  { name: "Microsoft Certified Solutions Developer", issuer: "SmartPro Teknoloji", period: "2024-02/2024-09",
    url: `${canonicalUrl}assets/pdf/microsoft-certified-solutions.pdf` },
  { name: "Complete Applied Web Development Training", issuer: "Udemy", issued: "2023-05",
    url: "https://www.udemy.com/certificate/UC-fb7eecd7-cc9f-4ea9-8119-26185b349318/" },
  { name: "Version Controls: Git and GitHub", issuer: "BTK Akademi", issued: "2023-04",
    url: "https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=XV1hW46LML" },
  { name: "Bootstrap 5", issuer: "BTK Akademi", issued: "2023-04",
    url: "https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=WJ1SM81KAg" },
  { name: "Web Development with HTML5", issuer: "BTK Akademi", issued: "2023-04",
    url: "https://www.btkakademi.gov.tr/portal/certificate/validate?certificateId=mKEhv48Zp9" },
  { name: "Ethical Hacker (Linux)", issuer: "Udemy", issued: "2023-04",
    url: "https://www.udemy.com/certificate/UC-22f4cd93-4920-4aaa-9791-c01081db462e/" },
  { name: "Search Engine Optimization", issuer: "Udemy", issued: "2023-04",
    url: "https://www.udemy.com/certificate/UC-1138201e-6d1e-4a87-98b8-195311486dff/" },
];

export const aiProfile = {
  fullName: "Arda Altunel",
  handle: "ardaltunel",
  jobTitle: "Full Stack Developer",
  shortBio: {
    tr: "Arda Altunel, İstanbul merkezli bir Full Stack Developer ve Frontend Developer'dır. React, JavaScript, PHP, MySQL ve Supabase ile responsive web siteleri ve web uygulamaları geliştirir. WEATRA'da geçmiş ajans deneyimi bulunur; freelance web geliştirme çalışmaları yapar.",
    en: "Arda Altunel is a Full Stack Developer and Frontend Developer based in Istanbul, Türkiye. He builds responsive websites and web applications with React, JavaScript, PHP, MySQL and Supabase. His background includes agency experience at WEATRA and freelance web development work.",
  },
  location: { city: "İstanbul", country: "Türkiye" },
  languages: [
    { code: "tr", name: "Türkçe", proficiency: { tr: "Ana dil", en: "Native" } },
    { code: "en", name: "English", proficiency: { tr: "Sınırlı çalışma yetkinliği", en: "Limited working proficiency" } },
  ],
  canonicalUrl,
  aboutUrl: `${canonicalUrl}hakkimda/`,
  projectsUrl: `${canonicalUrl}projeler/`,
  servicesUrl: `${canonicalUrl}hizmetler/`,
  contact: {
    email: "arifardaaltunel@gmail.com", linkedin: "https://linkedin.com/in/ardaltunel/",
    github: "https://github.com/ardaltunel/", bionluk: "https://bionluk.com/ardaltunel",
  },
  selectedProjects: [
    {
      name: "Omni Tools", url: "https://ardaltunel.github.io/omni-tools/", repository: "https://github.com/ardaltunel/omni-tools",
      summary: {
        tr: "Arama ve kategori filtreleriyle araçları bir araya getiren web uygulaması. JSON biçimlendirme ve görsel sıkıştırma gibi ayrı JavaScript araçları içerir.",
        en: "A web application that groups tools with search and category filters, including separate JavaScript tools for JSON formatting and image compression.",
      },
      technologies: ["HTML", "CSS", "JavaScript"], contribution,
    },
    {
      name: "Blog Platformu", url: "https://ardaltunel.github.io/blog/", repository: "https://github.com/ardaltunel/blog",
      summary: {
        tr: "Kayıt, kimlik doğrulama, admin paneli, içerik ve görsel yönetimi sunan JavaScript ve Supabase tabanlı blog platformu.",
        en: "A JavaScript and Supabase blog platform with registration, authentication, an admin panel, and content and image management.",
      },
      technologies: ["JavaScript", "Supabase"], contribution,
    },
    {
      name: "Emlak Kraliçeleri", url: "https://emlakkraliceleri.com",
      summary: {
        tr: "Responsive ilan arayüzü ve frontend-backend entegrasyonu bulunan full stack emlak web projesi.",
        en: "A full stack real estate web project with a responsive listing interface and frontend-backend integration.",
      },
      technologies: [], contribution, // The portfolio does not identify this project's implementation stack.
    },
  ],
  professionalHistory: [
    { organization: "WEATRA", role: "Frontend Developer Stajyer", startDate: "2022-01", endDate: "2022-09",
      summary: { tr: "HTML, CSS ve JavaScript ile responsive web arayüzleri geliştirme.", en: "Developed responsive web interfaces with HTML, CSS and JavaScript." } },
    { organization: "WEATRA", role: "Full Stack Developer", startDate: "2022-09", endDate: "2023-06",
      summary: { tr: "Responsive web arayüzleri, proje geliştirme süreçleri ve temel UI/UX uygulamalarında görev aldı.", en: "Worked on responsive web interfaces, project development processes and basic UI/UX practices." } },
  ],
  education: [
    { institution: "İstanbul Okan Üniversitesi", program: "Mobil Teknolojileri — Ön Lisans", startYear: 2025, expectedEndYear: 2027, status: "ongoing" },
    { institution: "Tuzla MTAL", program: "Bilgisayar Programcılığı", startYear: 2018, endYear: 2023 },
  ],
  credentials,
  questions: [
    { language: "tr", question: "Arda Altunel kimdir?", answer: "Arda Altunel, İstanbul merkezli bir Full Stack Developer ve Frontend Developer'dır. Responsive web siteleri ve web uygulamaları geliştirir." },
    { language: "tr", question: "Arda Altunel hangi teknolojilerle çalışıyor?", answer: "React, JavaScript, PHP, MySQL ve Supabase temel çalışma araçları arasındadır. REST API entegrasyonu, responsive arayüz ve içerik yönetimi akışları üzerinde çalışır." },
    { language: "tr", question: "Arda Altunel'in portfolyosunda hangi projeler var?", answer: "Portfolyoda Omni Tools, Blog Platformu ve Emlak Kraliçeleri yer alır. Omni Tools ve Blog projelerinin kaynak kodu GitHub'da paylaşılır." },
    { language: "tr", question: "Arda Altunel'e nasıl ulaşabilirim?", answer: "Web projeleri için arifardaaltunel@gmail.com adresinden, LinkedIn'deki ardaltunel profilinden veya Bionluk üzerinden iletişime geçebilirsiniz." },
    { language: "en", question: "Who is Arda Altunel?", answer: "Arda Altunel is a Full Stack Developer and Frontend Developer based in Istanbul, Türkiye. He works with React, JavaScript, PHP, MySQL and Supabase on responsive websites and web applications." },
    { language: "en", question: "What projects are listed in Arda Altunel's portfolio?", answer: "His portfolio lists Omni Tools, a multi-tool web application with search and category filters; Blog Platformu, a JavaScript and Supabase blog platform; and Emlak Kraliçeleri, a full stack real estate web project." },
  ],
  sources: [
    { label: "Public portfolio", url: canonicalUrl },
    { label: "About Arda Altunel", url: `${canonicalUrl}hakkimda/` },
    { label: "LinkedIn profile", url: "https://linkedin.com/in/ardaltunel/" },
    { label: "GitHub profile", url: "https://github.com/ardaltunel/" },
    { label: "Bionluk profile", url: "https://bionluk.com/ardaltunel" },
    { label: "Portfolio source repository", url: "https://github.com/ardaltunel/ardaltunel" },
    { label: "Omni Tools source repository", url: "https://github.com/ardaltunel/omni-tools" },
    { label: "Blog source repository", url: "https://github.com/ardaltunel/blog" },
    ...credentials.map(({ name, url }) => ({ label: name, url })),
  ],
};
