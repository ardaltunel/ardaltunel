import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const year = new Date().getFullYear();
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
      description: cleanText(gig.description_m, 138),
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
                                         alt="${htmlEscape(service.title)}" loading="lazy">
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
                                <p>${htmlEscape(service.description)}</p>
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

const template = fs.readFileSync(path.join(root, "index.template.html"), "utf8");
let output = template;
const bionlukServices = await refreshData(
  "Bionluk services",
  "cache/bionluk-services.json",
  fetchBionlukServices
);
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

output = output
  .replace("{{CURRENT_YEAR}}", String(year))
  .replace("<!-- GITHUB_PROJECTS -->", renderGithubProjects(githubPinnedProjects))
  .replace("<!-- BIONLUK_SERVICES -->", renderServices(bionlukServices));

fs.writeFileSync(path.join(root, "index.html"), output, "utf8");
fs.writeFileSync(path.join(root, ".nojekyll"), "", "utf8");
