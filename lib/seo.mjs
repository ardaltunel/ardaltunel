import { aiProfile } from "../content/ai-profile.mjs";
import { renderPortfolioMain } from "./page-layouts.mjs";

export const SITE_URL = "https://ardaltunel.vercel.app";
export const HOME_PAGE = {
  path: "/",
  title: "Arda Altunel | Full Stack Developer · İstanbul",
  description: "Arda Altunel'in resmi portfolyosu. İstanbul merkezli Full Stack Developer; React, JavaScript, PHP ve Supabase projeleri, deneyimi ve web geliştirme hizmetleri.",
};

export const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const personId = `${SITE_URL}/#person`;
const websiteId = `${SITE_URL}/#website`;
const cover = `${SITE_URL}/assets/img/og-arda-altunel.png`;
const assetPrefix = (pagePath) => "../".repeat(pagePath.split("/").filter(Boolean).length);
const projectForPage = (page) => page.projectKey === "omni-tools" ? aiProfile.selectedProjects[0]
  : page.projectKey === "blog-platformu" ? aiProfile.selectedProjects[1] : null;
const breadcrumbsFor = (page) => [
  { name: "Ana sayfa", path: "/" },
  ...(page.kind === "project" ? [{ name: "Projeler", path: "/projeler/" }] : []),
  { name: page.heading, path: page.path },
];

export const structuredData = (page, knowledgeBase) => {
  const url = SITE_URL + page.path;
  const contact = knowledgeBase.contact || {};
  const project = projectForPage(page);
  const graph = [
    {
      "@type": "Person", "@id": personId,
      name: "Arda Altunel", alternateName: "ardaltunel", url: `${SITE_URL}/`,
      jobTitle: "Full Stack Developer",
      description: aiProfile.shortBio.tr,
      identifier: { "@type": "PropertyValue", propertyID: "GitHub username", value: aiProfile.handle },
      homeLocation: { "@type": "Place", name: "İstanbul, Türkiye" },
      knowsAbout: ["React", "JavaScript", "PHP", "MySQL", "Supabase", "Responsive Web Design", "REST API"],
      sameAs: [contact.linkedin, contact.github, contact.instagram, contact.bionluk].filter(Boolean),
    },
    {
      "@type": "WebSite", "@id": websiteId, url: `${SITE_URL}/`,
      name: "Arda Altunel", alternateName: "Arda Altunel Portfolyo", inLanguage: "tr-TR",
      publisher: { "@id": personId },
    },
    {
      "@type": page.path === "/hakkimda/" ? "ProfilePage" : page.path === "/" || project ? "WebPage" : "CollectionPage",
      "@id": `${url}#webpage`, url, name: page.title, description: page.description,
      inLanguage: "tr-TR", isPartOf: { "@id": websiteId }, about: { "@id": personId }, author: { "@id": personId },
      ...(page.path === "/hakkimda/" ? { mainEntity: { "@id": personId } } : {}),
      ...(project ? { mainEntity: { "@id": `${url}#source-code` } } : {}),
      ...(page.path !== "/" ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    },
  ];
  if (page.path !== "/") graph.push({
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
    itemListElement: breadcrumbsFor(page).map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: SITE_URL + item.path,
    })),
  });
  if (project) graph.push({
    "@type": "SoftwareSourceCode", "@id": `${url}#source-code`,
    name: project.name, description: project.summary.tr, url,
    codeRepository: project.repository, author: { "@id": personId },
    programmingLanguage: project.technologies.filter((name) => ["JavaScript", "HTML", "CSS", "PHP"].includes(name)),
    citation: page.sections.flatMap((section) => (section.links || []).map((link) => link.url)).filter((link) => link.includes("github.com/") && link.includes("/blob/")),
  });
  return { "@context": "https://schema.org", "@graph": graph };
};

export const renderSeoHead = (page, knowledgeBase) => {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = SITE_URL + page.path;
  const prefix = assetPrefix(page.path);
  const jsonLd = JSON.stringify(structuredData(page, knowledgeBase)).replaceAll("<", "\\u003c");
  return `<title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="author" content="Arda Altunel">
    <link rel="canonical" href="${url}">
    <link rel="alternate" type="application/ld+json" href="${prefix}profil.jsonld" title="Arda Altunel — yapılandırılmış profil">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="tr_TR">
    <meta property="og:site_name" content="Arda Altunel">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${cover}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Arda Altunel — Full Stack Developer. React, JavaScript, PHP, MySQL ve Supabase. İstanbul, Türkiye.">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${cover}">
    <meta name="twitter:image:alt" content="Arda Altunel, Full Stack Developer — İstanbul">
    <link rel="preload" href="${prefix}assets/font/open-sans-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
    <script type="application/ld+json">${jsonLd}</script>`;
};

const renderLinks = (links = []) => links.length ? `<ul class="article-links">${links.map((link) =>
  `<li><a href="${escapeHtml(link.url)}"${link.url.startsWith("https:") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a></li>`
).join("\n")}</ul>` : "";

const renderIdentity = () => `<section class="profile-summary" aria-labelledby="profile-summary-title">
    <h2 id="profile-summary-title">Kısa profil ve bağlantılar</h2>
    <p>${escapeHtml(aiProfile.shortBio.tr)}</p>
    <dl class="profile-facts"><div><dt>Ad ve kullanıcı adı</dt><dd>${escapeHtml(aiProfile.fullName)} · ${escapeHtml(aiProfile.handle)}</dd></div><div><dt>Çalışma alanı</dt><dd>Full Stack Developer · Frontend Developer</dd></div><div><dt>Konum</dt><dd>İstanbul, Türkiye</dd></div><div><dt>Diller</dt><dd>Türkçe (ana dil), İngilizce (sınırlı çalışma yetkinliği)</dd></div></dl>
    ${renderLinks([{ label: "LinkedIn profili", url: aiProfile.contact.linkedin }, { label: "GitHub profili ve kaynak kodları", url: aiProfile.contact.github }, { label: "Bionluk hizmet profili", url: aiProfile.contact.bionluk }])}
    <div lang="en" class="profile-english"><h3>Arda Altunel — brief profile</h3><p>${escapeHtml(aiProfile.shortBio.en)}</p></div>
</section>`;

const renderQuestions = () => `<section class="profile-questions" aria-labelledby="profile-questions-title"><h2 id="profile-questions-title">Arda Altunel hakkında kısa yanıtlar</h2>${aiProfile.questions.map((item) => `<div lang="${item.language}"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join("\n")}</section>`;

export const renderDetailMain = (page) => renderPortfolioMain(page) || `<main id="main-content" class="article-main" tabindex="-1">
    <div class="container article-layout">
        <nav class="breadcrumbs" aria-label="İçerik yolu">${breadcrumbsFor(page).map((item, index, items) => index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${item.path}">${escapeHtml(item.name)}</a><span aria-hidden="true">/</span>`).join("")}</nav>
        <header class="article-heading"><p class="eyebrow">Arda Altunel · Portfolyo</p><h1>${escapeHtml(page.heading)}</h1><p class="article-intro">${escapeHtml(page.intro)}</p></header>
        ${page.path === "/hakkimda/" ? renderIdentity() : ""}
        <div class="article-content">${page.sections.map((section) => `<section class="article-section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
            ${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
            ${renderLinks(section.links)}
        </section>`).join("\n")}</div>
        ${page.path === "/hakkimda/" ? renderQuestions() : ""}
        <aside class="article-contact"><h2>Projenizi konuşalım</h2><p>Web sitesi veya uygulama ihtiyacınızı, mevcut bağlantıları ve beklediğiniz özellikleri paylaşabilirsiniz.</p><a class="btn-primary" href="mailto:arifardaaltunel@gmail.com">Arda Altunel'e e-posta gönder</a><a class="text-link" href="/#contact">Diğer iletişim kanalları</a></aside>
    </div>
</main>`;

export const renderDetailPage = (template, page, knowledgeBase, year) => template
  .replace(/<main id="main-content"[^>]*>[\s\S]*?<\/main>/, renderDetailMain(page))
  .replace("</head>", ["/hakkimda/", "/projeler/", "/hizmetler/"].includes(page.path) ? '<link rel="stylesheet" href="/assets/css/portfolio.css">\n</head>' : "</head>")
  .replace(/href="#(about|work|services|stack|experience|contact)"/g, `href="${assetPrefix(page.path)}#$1"`)
  .replace('href="#top" aria-label="Arda Altunel ana sayfa"', `href="${assetPrefix(page.path)}" aria-label="Arda Altunel ana sayfa"`)
  .replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_match, attribute, target) => `${attribute}="${assetPrefix(page.path)}${target}"`)
  .replace(/(href|src)="(assets|hakkimda|projeler|hizmetler)\//g, `$1="${assetPrefix(page.path)}$2/`)
  .replace("<!-- SEO_HEAD -->", renderSeoHead(page, knowledgeBase))
  .replace("{{CURRENT_YEAR}}", String(year));

export const renderSitemap = (pages) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${SITE_URL}${escapeHtml(page.path)}</loc></url>`).join("\n")}
</urlset>
`;

export const renderRobots = () => `User-agent: *
Allow: /
Disallow: /api/
Disallow: /cache/
Disallow: /lib/
Disallow: /content/
Disallow: /tests/
Disallow: /cloudflare/
Disallow: /scripts/
Disallow: /index.template.html
Disallow: /build-static.mjs

Sitemap: ${SITE_URL}/sitemap.xml
`;
