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

export const structuredData = (page, knowledgeBase) => {
  const url = SITE_URL + page.path;
  const contact = knowledgeBase.contact || {};
  const graph = [
    {
      "@type": "Person", "@id": personId,
      name: "Arda Altunel", alternateName: "ardaltunel", url: `${SITE_URL}/`,
      jobTitle: "Full Stack Developer",
      description: "İstanbul merkezli Full Stack Developer ve Frontend Developer. React, JavaScript, PHP, MySQL ve Supabase ile web uygulamaları geliştiriyor.",
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
      "@type": page.path === "/hakkimda/" ? "ProfilePage" : page.path === "/" ? "WebPage" : "CollectionPage",
      "@id": `${url}#webpage`, url, name: page.title, description: page.description,
      inLanguage: "tr-TR", isPartOf: { "@id": websiteId }, about: { "@id": personId }, author: { "@id": personId },
      ...(page.path === "/hakkimda/" ? { mainEntity: { "@id": personId } } : {}),
      ...(page.path !== "/" ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    },
  ];
  if (page.path !== "/") graph.push({
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana sayfa", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: page.heading, item: url },
    ],
  });
  return { "@context": "https://schema.org", "@graph": graph };
};

export const renderSeoHead = (page, knowledgeBase) => {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = SITE_URL + page.path;
  const prefix = page.path === "/" ? "" : "../";
  const jsonLd = JSON.stringify(structuredData(page, knowledgeBase)).replaceAll("<", "\\u003c");
  return `<title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="author" content="Arda Altunel">
    <link rel="canonical" href="${url}">
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

const relativeLink = (url) => url.startsWith("/") ? `..${url}` : url;
const renderLinks = (links = []) => links.length ? `<ul class="article-links">${links.map((link) =>
  `<li><a href="${escapeHtml(relativeLink(link.url))}"${link.url.startsWith("https:") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a></li>`
).join("\n")}</ul>` : "";

export const renderDetailMain = (page) => `<main id="main-content" class="article-main" tabindex="-1">
    <div class="container article-layout">
        <nav class="breadcrumbs" aria-label="İçerik yolu"><a href="../">Ana sayfa</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(page.heading)}</span></nav>
        <header class="article-heading"><p class="eyebrow">Arda Altunel · Portfolyo</p><h1>${escapeHtml(page.heading)}</h1><p class="article-intro">${escapeHtml(page.intro)}</p></header>
        <div class="article-content">${page.sections.map((section) => `<section class="article-section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
            ${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
            ${renderLinks(section.links)}
        </section>`).join("\n")}</div>
        <aside class="article-contact"><h2>Projenizi konuşalım</h2><p>Web sitesi veya uygulama ihtiyacınızı, mevcut bağlantıları ve beklediğiniz özellikleri paylaşabilirsiniz.</p><a class="btn-primary" href="mailto:arifardaaltunel@gmail.com">Arda Altunel'e e-posta gönder</a><a class="text-link" href="../#contact">Diğer iletişim kanalları</a></aside>
    </div>
</main>`;

export const renderDetailPage = (template, page, knowledgeBase, year) => template
  .replace(/<main id="main-content"[^>]*>[\s\S]*?<\/main>/, renderDetailMain(page))
  .replace(/href="#(about|work|services|stack|experience|contact)"/g, 'href="../#$1"')
  .replace('href="#top" aria-label="Arda Altunel ana sayfa"', 'href="../" aria-label="Arda Altunel ana sayfa"')
  .replaceAll('href="hakkimda/"', 'href="../hakkimda/"')
  .replaceAll('href="projeler/"', 'href="../projeler/"')
  .replaceAll('href="hizmetler/"', 'href="../hizmetler/"')
  .replace(/(href|src)="\/?assets\//g, '$1="../assets/')
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
