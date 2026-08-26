import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const year = new Date().getFullYear();
const serviceDescriptionLimit = 110;
const bionlukHeaders = {
  "Content-Type": "application/x-www-form-urlencoded; Charset=utf-8",
  Accept: "application/json",
  "User-Agent": "ArdaAltunelPortfolio/1.0",
  "SUPER-KEY": "1e291318-f4b6-4a65-8323-a1823dbd7564",
};
const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "ArdaAltunelPortfolio/1.0",
};

const htmlEscape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const turkishVowels = new Set(Array.from("aeıioöuüâîû"));

const hyphenateTurkishWord = (word) => {
  const letters = Array.from(word);
  if (letters.length < 8) {
    return word;
  }

  const vowelIndexes = [];
  letters.forEach((letter, index) => {
    if (turkishVowels.has(letter.toLocaleLowerCase("tr-TR"))) {
      vowelIndexes.push(index);
    }
  });

  if (vowelIndexes.length < 2) {
    return word;
  }

  const breakpoints = new Set();
  for (let index = 0; index < vowelIndexes.length - 1; index += 1) {
    const currentVowel = vowelIndexes[index];
    const nextVowel = vowelIndexes[index + 1];
    const consonantsBetween = nextVowel - currentVowel - 1;
    const breakpoint = consonantsBetween === 0 ? currentVowel + 1 : nextVowel - 1;

    if (breakpoint >= 3 && letters.length - breakpoint >= 3) {
      breakpoints.add(breakpoint);
    }
  }

  return letters
    .map((letter, index) => `${breakpoints.has(index) ? "\u00AD" : ""}${letter}`)
    .join("");
};

const addServiceSoftHyphens = (value) =>
  String(value ?? "").replace(/\p{L}{8,}/gu, hyphenateTurkishWord);

const readJson = (file) => {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  return Array.isArray(data) ? data : [];
};

const writeJson = (file, data) => {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
};

const cleanText = (value, limit = 150) => {
  const text = repairMojibake(String(value ?? ""))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const cleanServiceDescription = (value) => {
  const text = cleanText(value, Number.MAX_SAFE_INTEGER);
  const wasTruncated = text.endsWith("...");
  const source = wasTruncated ? text.slice(0, -3).trimEnd() : text;

  if (!wasTruncated && source.length <= serviceDescriptionLimit) {
    return source;
  }

  const clipped = source.slice(0, serviceDescriptionLimit - 1).trimEnd();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const wordSafeText = (lastWordBoundary > 0 ? clipped.slice(0, lastWordBoundary) : clipped)
    .replace(/[.,;:!?-]+$/g, "");

  return `${wordSafeText}…`;
};

const repairMojibake = (value) =>
  String(value ?? "")
    .replaceAll("Ä°", "İ")
    .replaceAll("Ä±", "ı")
    .replaceAll("ÄŸ", "ğ")
    .replaceAll("Äž", "Ğ")
    .replaceAll("Ã¼", "ü")
    .replaceAll("Ãœ", "Ü")
    .replaceAll("Ã¶", "ö")
    .replaceAll("Ã–", "Ö")
    .replaceAll("Ã§", "ç")
    .replaceAll("Ã‡", "Ç")
    .replaceAll("ÅŸ", "ş")
    .replaceAll("Å", "Ş")
    .replaceAll("â€“", "–")
    .replaceAll("â€™", "'")
    .replaceAll("â€œ", '"')
    .replaceAll("â€", '"')
    .replaceAll("â€¦", "...");

const parseBionlukPrice = (value) => Number(String(value ?? "").replace(/\D+/g, "")) || 0;

const bionlukPost = async (endpoint, payload) => {
  const response = await fetch(`https://bionluk.com/api${endpoint}`, {
    method: "POST",
    headers: bionlukHeaders,
    body: new URLSearchParams(payload),
  });

  if (!response.ok) {
    throw new Error(`Bionluk ${endpoint} failed: ${response.status}`);
  }

  return response.json();
};

const fetchBionlukServices = async () => {
  const json = await bionlukPost("/general/get_all_gigs_by_user/", {
    username: "ardaltunel",
    page: 1,
    count: 6,
  });
  const gigs = json?.data?.gigs;

  if (!Array.isArray(gigs) || gigs.length === 0) {
    throw new Error("Bionluk response did not include gigs");
  }

  const sortedGigs = gigs
    .slice()
    .sort((first, second) => parseBionlukPrice(second.priceText) - parseBionlukPrice(first.priceText))
    .slice(0, 6);

  const services = [];
  for (const gig of sortedGigs) {
    const portfolio = gig.portfolios?.[0] ?? {};
    const slug = String(gig.slug ?? "");
    const detailSlug = slug.split("/").filter(Boolean).pop() ?? "";
    let revision = 0;

    try {
      const detail = await bionlukPost("/general/gig_detail/", { slug: detailSlug });
      revision = Number(detail?.data?.packages?.basic?.revisions) || 0;
    } catch {
      revision = 0;
    }

    const price = cleanText(gig.priceText, 24);
    services.push({
      title: cleanText(gig.title, 92),
      description: cleanServiceDescription(gig.description_m),
      price,
      priceValue: parseBionlukPrice(price),
      duration: Number(gig.duration) || 0,
      revision,
      image: portfolio.imageURLSmall ?? portfolio.image_url_small ?? portfolio.imageURL ?? "",
      url: slug.startsWith("http") ? slug : `https://bionluk.com${slug}`,
    });
  }

  return services.sort((first, second) => second.priceValue - first.priceValue);
};

const githubLanguageColor = (language) => {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    PHP: "#4F5D95",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    "C#": "#178600",
    SCSS: "#c6538c",
  };

  return colors[language ?? ""] ?? "#3ddc97";
};

const extractPinnedRepoNames = (html) => {
  const names = [];
  const patterns = [
    /href="\/ardaltunel\/([^"/?#]+)"[^>]*class="[^"]*pinned-item-list-item-content[^"]*"/g,
    /href="\/ardaltunel\/([^"]+)"[^>]*class="[^"]*text-bold[^"]*"/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      names.push(match[1].replace(/&amp;/g, "&"));
    }

    if (names.length > 0) {
      break;
    }
  }

  return [...new Set(names)].slice(0, 6);
};

const fetchGithubPinnedProjects = async () => {
  const profileResponse = await fetch("https://github.com/ardaltunel", {
    headers: { "User-Agent": "ArdaAltunelPortfolio/1.0" },
  });

  if (!profileResponse.ok) {
    throw new Error(`GitHub profile failed: ${profileResponse.status}`);
  }

  const repoNames = extractPinnedRepoNames(await profileResponse.text());
  if (repoNames.length === 0) {
    throw new Error("Could not find pinned repositories");
  }

  const projects = [];
  for (const repoName of repoNames) {
    const repoResponse = await fetch(`https://api.github.com/repos/ardaltunel/${encodeURIComponent(repoName)}`, {
      headers: githubHeaders,
    });

    if (!repoResponse.ok) {
      continue;
    }

    const repo = await repoResponse.json();
    if (!repo?.html_url) {
      continue;
    }

    projects.push({
      name: cleanText(repo.name ?? repoName, 60),
      description: cleanText(repo.description ?? "GitHub üzerinde pinlediğim açık kaynak projelerimden biri.", 150),
      language: cleanText(repo.language ?? "Code", 24),
      color: githubLanguageColor(repo.language),
      stars: Number(repo.stargazers_count) || 0,
      forks: Number(repo.forks_count) || 0,
      updated: repo.updated_at
        ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
            new Date(repo.updated_at)
          )
        : "",
      url: String(repo.html_url),
      homepage: String(repo.homepage ?? ""),
    });
  }

  if (projects.length === 0) {
    throw new Error("Could not fetch pinned repository details");
  }

  return projects.slice(0, 6);
};

const refreshData = async (label, file, fetcher) => {
  if (process.argv.includes("--cache-only")) {
    return readJson(file);
  }

  try {
    const data = await fetcher();
    writeJson(file, data);
    console.log(`${label}: fetched ${data.length} items`);
    return data;
  } catch (error) {
    console.warn(`${label}: using cache (${error.message})`);
    return readJson(file);
  }
};

const localizeServiceImages = async (services) => {
  const imageDirectory = path.join(root, "assets", "img", "services");
  fs.mkdirSync(imageDirectory, { recursive: true });
  const expectedFiles = new Set();

  const localizedServices = await Promise.all(
    services.map(async (service) => {
      const imageUrl = String(service.image ?? "");
      if (!/^https?:\/\//i.test(imageUrl)) {
        const localName = path.basename(imageUrl);
        if (localName) {
          expectedFiles.add(localName);
          return { ...service, image: `assets/img/services/${localName}` };
        }
        return service;
      }

      const remoteName = path.basename(new URL(imageUrl).pathname);
      const fileName = remoteName.replace(/[^a-zA-Z0-9._-]/g, "");
      if (!fileName) {
        return service;
      }

      const outputPath = path.join(imageDirectory, fileName);
      try {
        const response = await fetch(imageUrl, {
          headers: {
            Accept: "image/*",
            "User-Agent": "ArdaAltunelPortfolio/1.0",
          },
        });
        if (!response.ok) {
          throw new Error(`image request failed: ${response.status}`);
        }

        fs.writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
        expectedFiles.add(fileName);
        return { ...service, image: `assets/img/services/${fileName}` };
      } catch (error) {
        if (fs.existsSync(outputPath)) {
          expectedFiles.add(fileName);
          return { ...service, image: `assets/img/services/${fileName}` };
        }
        console.warn(`Bionluk image: using remote URL (${error.message})`);
        return service;
      }
    })
  );

  for (const fileName of fs.readdirSync(imageDirectory)) {
    if (!expectedFiles.has(fileName)) {
      fs.unlinkSync(path.join(imageDirectory, fileName));
    }
  }

  return localizedServices;
};

const renderGithubProjects = (projects) => {
  if (projects.length === 0) {
    return "";
  }

  const cards = projects
    .slice(0, 6)
    .map(
      (project) => `                            <article class="github-card">
                                <div class="github-card-top">
                                    <i class="bi bi-git"></i>
                                    <span>Public Repo</span>
                                </div>
                                <h3>${htmlEscape(project.name)}</h3>
                                <p>${htmlEscape(project.description)}</p>
                                <div class="github-meta">
                                    <span>
                                        <i style="background: ${htmlEscape(project.color)}"></i>
                                        ${htmlEscape(project.language)}
                                    </span>
                                    <span><i class="bi bi-star"></i>${Number(project.stars) || 0}</span>
                                    <span><i class="bi bi-diagram-2"></i>${Number(project.forks) || 0}</span>
                                </div>
                                <div class="github-card-footer">
                                    ${project.updated ? `<span>Güncelleme: ${htmlEscape(project.updated)}</span>` : ""}
                                    <a href="${htmlEscape(project.url)}" target="_blank" rel="nofollow">
                                        GitHub
                                        <i class="bi bi-arrow-up-right"></i>
                                    </a>
                                </div>
                            </article>`
    )
    .join("\n");

  return `                <div class="github-projects">
                    <div class="subsection-heading">
                        <p class="eyebrow">GitHub</p>
                        <h3>GitHub profilimde pinlediğim projeler.</h3>
                    </div>

                    <div class="github-grid">
${cards}
                    </div>
                </div>`;
};

const renderServices = (services) => {
  if (services.length === 0) {
    return `                <div class="service-empty">
                    <p>Aktif ilanlarımı Bionluk profilimden görüntüleyebilirsin.</p>
                    <a class="btn-primary" href="https://bionluk.com/ardaltunel" target="_blank" rel="nofollow">
                        <i class="bi bi-box-arrow-up-right"></i>
                        Bionluk Profilim
                    </a>
                </div>`;
  }

  const cards = services
    .slice(0, 6)
    .map((service) => {
      const duration = Number(service.duration) || 0;
      const revision = Number(service.revision) || 0;

      return `                        <article class="service-card">
                            ${
                              service.image
                                ? `<a class="service-media" href="${htmlEscape(service.url)}" target="_blank"
                                   rel="nofollow" aria-label="${htmlEscape(service.title)}">
                                    <img src="${htmlEscape(service.image)}"
                                         alt="${htmlEscape(service.title)}" loading="lazy" referrerpolicy="no-referrer">
                                </a>`
                                : ""
                            }
                            <div class="service-body">
                                <div class="service-meta">
                                    <span>${htmlEscape(service.price)}</span>
                                    ${duration > 0 ? `<span>${duration} günde teslim</span>` : ""}
                                    <span>${revision > 0 ? `${revision} revizyon` : "Revizyon yok"}</span>
                                </div>
                                <h3>${htmlEscape(service.title)}</h3>
                                <p>${htmlEscape(addServiceSoftHyphens(service.description))}</p>
                                <a href="${htmlEscape(service.url)}" target="_blank" rel="nofollow">
                                    Bionluk'ta İncele
                                    <i class="bi bi-arrow-up-right"></i>
                                </a>
                            </div>
                        </article>`;
    })
    .join("\n");

  return `                <div class="service-grid">
${cards}
                </div>`;
};

const buildChatbotContext = (services, projects) => ({
  generatedAt: new Date().toISOString(),
  identity: {
    name: "Arda Altunel",
    title: "Full Stack Developer",
    location: "Tuzla, Istanbul, Turkiye",
    availability: "Freelance bazli calismalar icin uygun",
    summary:
      "Arda Altunel; React, JavaScript, PHP, MySQL ve Supabase ile responsive web uygulamalari gelistiren, WEATRA ajans deneyimine sahip Istanbul merkezli bir Full Stack Developer ve Frontend Developer'dir.",
  },
  about: [
    "WEATRA'da frontend stajyerliginden full-time gelistirici rolune gecerek responsive ve kullanici odakli web arayuzleri gelistirdi.",
    "REST API entegrasyonu, Git ve GitHub, Vite ve Vercel yayin surecleri ile temel UI/UX prensiplerinde uygulamali deneyime sahiptir.",
    "Istanbul Okan Universitesi Mobil Teknolojileri on lisans programinda egitimine devam etmektedir.",
  ],
  focus: [
    "Full stack web siteleri",
    "Responsive UI ve UX",
    "React tabanli web uygulamalari",
    "REST API ve Supabase entegrasyonlari",
    "PHP ve MySQL tabanli web siteleri",
    "Kurumsal web siteleri",
    "Portfolyo ve landing page projeleri",
    "Icerik odakli web projeleri",
  ],
  skills: {
    artificialIntelligence: ["Yapay Zeka", "Vibe Kodlama", "Codex", "Makine Ogrenimi", "Dogal Dil Isleme"],
    frontend: ["Web Gelistirme", "On Yuz Web Gelistirmesi", "Uyumlu Web Tasarimi", "Web Uygulamalari", "HTML", "CSS", "JavaScript", "React.js", "Tailwind CSS", "Bootstrap 5", "Sass", "jQuery"],
    backendAndData: ["Arka Plan Web Gelistirmesi", "PHP", "MySQL", "SQL", "Supabase", "Web Services API", "REST API", "Veritabanlari", "JSON", "XML"],
    tools: ["C#", "Python", "Kotlin", "Git", "GitHub", "Node.js", "npm", "Vite", "Vercel", "GitHub Pages", "Linux", "Android Studio", "Cisco Packet Tracer", "cPanel", "VS Code", "Siber Guvenlik", "SEO", "Web Performansi Temelleri"],
    workAreas: [
      "Kurumsal web",
      "Panel arayuzleri",
      "PHP tabanli akislar",
      "Responsive duzen",
      "Form, kayit, listeleme ve icerik yonetimi akislari",
    ],
  },
  experience: [
    {
      label: "09/2022 - 06/2023 - Istanbul",
      title: "Full Stack Developer - WEATRA",
      description:
        "Frontend staji sonrasinda tam zamanli role gecerek responsive web arayuzleri, proje gelistirme surecleri ve temel UI/UX uygulamalarinda aktif sorumluluk aldi.",
    },
    {
      label: "01/2022 - 09/2022 - Istanbul",
      title: "Frontend Developer Stajyer - WEATRA",
      description:
        "HTML, CSS ve JavaScript ile tasarimlari farkli ekran boyutlarina uyumlu, calisan web arayuzlerine donusturdu.",
    },
    {
      label: "Freelance - Guncel",
      title: "Full Stack Developer",
      description: "Portfolyo, kurumsal site, landing page ve web uygulamalarinda gelistirme, entegrasyon ve yayina alma destegi sunuyor.",
    },
  ],
  education: [
    {
      period: "2025 - 2027",
      school: "Istanbul Okan Universitesi",
      program: "Mobil Teknolojileri - On Lisans",
    },
    {
      period: "2018 - 2023 - Istanbul",
      school: "Tuzla MTAL",
      program: "Bilgisayar Programciligi",
    },
  ],
  certifications: [
    "Artificial Intelligence Fundamentals - IBM - Agustos 2026",
    "What Is Generative AI - LinkedIn Learning - Agustos 2026",
    "Introduction to Responsible AI - Google Cloud Skills Boost - Agustos 2026",
    "Microsoft Certified Solutions Developer - SmartPro Teknoloji - Subat-Eylul 2024",
    "Complete Applied Web Development Training - Udemy - Mayis 2023",
    "Version Controls: Git and GitHub - BTK Akademi - Nisan 2023",
    "Bootstrap 5 - BTK Akademi - Nisan 2023",
    "Web Development with HTML5 - BTK Akademi - Nisan 2023",
    "Ethical Hacker (Linux) - Udemy - Nisan 2023",
    "Search Engine Optimization - Udemy - Nisan 2023",
  ],
  languages: ["Turkce - Ana dil", "Ingilizce - Sinirli calisma yetkinligi"],
  contact: {
    email: "arifardaaltunel@gmail.com",
    phone: "+90 545 648 25 30",
    linkedin: "https://linkedin.com/in/ardaltunel/",
    github: "https://github.com/ardaltunel/",
    instagram: "https://instagram.com/ardaltunel/",
    bionluk: "https://bionluk.com/ardaltunel",
    cv: "https://ardaltunel.vercel.app/assets/pdf/arda-altunel-cv.pdf",
  },
  selectedProjects: [
    {
      name: "Omni Tools",
      description: "React, React Router, Tailwind CSS ve REST API'lerle gelistirilen, 50'den fazla arac ve modulu bir araya getiren uygulama.",
      url: "https://ardaltunel.github.io/omni-tools",
    },
    {
      name: "Blog Platformu",
      description: "JavaScript ve Supabase ile kayit, kimlik dogrulama, admin paneli, icerik ve gorsel yonetimi sunan platform.",
      url: "https://blog.ardaltunel.com",
    },
    {
      name: "Emlak Kraliceleri",
      description: "Responsive ilan arayuzu ve frontend-backend entegrasyonu bulunan full stack emlak web projesi.",
      url: "https://emlakkraliceleri.com",
    },
  ],
  highlightedProjects: projects.slice(0, 6).map((project) => ({
    name: project.name,
    description: project.description,
    language: project.language,
    stars: project.stars,
    forks: project.forks,
    updated: project.updated,
    url: project.url,
    homepage: project.homepage,
  })),
  services: services.slice(0, 6).map((service) => ({
    title: service.title,
    description: service.description,
    price: service.price,
    durationDays: service.duration,
    revisions: service.revision,
    url: service.url,
  })),
  notes: [
    {
      title: "DevOps Nedir?",
      topic: "DevOps",
      url: "https://ardaltunel.github.io/blog/post.html?id=15",
    },
    {
      title: "PHP Nedir?",
      topic: "Backend",
      url: "https://ardaltunel.github.io/blog/post.html?id=19",
    },
    {
      title: "CMS Nedir?",
      topic: "CMS",
      url: "https://ardaltunel.github.io/blog/post.html?id=17",
    },
  ],
  sourceUrls: [
    "https://ardaltunel.vercel.app/",
    "https://www.ardaltunel.com/",
    "https://www.linkedin.com/in/ardaltunel/",
    "https://github.com/ardaltunel/",
    "https://bionluk.com/ardaltunel",
  ],
});

const template = fs.readFileSync(path.join(root, "index.template.html"), "utf8");
let output = template;
let bionlukServices = await refreshData(
  "Bionluk services",
  "cache/bionluk-services.json",
  fetchBionlukServices
);
bionlukServices = bionlukServices.map((service) => ({
  ...service,
  description: cleanServiceDescription(service.description),
}));
bionlukServices = await localizeServiceImages(bionlukServices);
writeJson("cache/bionluk-services.json", bionlukServices);
const githubPinnedProjects = await refreshData(
  "GitHub pinned projects",
  "cache/github-pinned-projects.json",
  fetchGithubPinnedProjects
);
writeJson("cache/last-updated.json", {
  generatedAt: new Date().toISOString(),
  bionlukServices: bionlukServices.length,
  githubPinnedProjects: githubPinnedProjects.length,
});
writeJson("cache/chatbot-context.json", buildChatbotContext(bionlukServices, githubPinnedProjects));

output = output
  .replace("{{CURRENT_YEAR}}", String(year))
  .replace("<!-- GITHUB_PROJECTS -->", renderGithubProjects(githubPinnedProjects))
  .replace("<!-- BIONLUK_SERVICES -->", renderServices(bionlukServices));

fs.writeFileSync(path.join(root, "index.html"), output, "utf8");
fs.writeFileSync(path.join(root, ".nojekyll"), "", "utf8");
