const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const site = "https://ardaltunel.vercel.app";
const pages = ["/", "/hakkimda/", "/projeler/", "/hizmetler/", "/projeler/omni-tools/", "/projeler/blog-platformu/"];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const htmlFor = (urlPath) => read(`${urlPath.slice(1)}index.html`);
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((m) => [m[1].toLowerCase(), m[3]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));
const text = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#(?:39|x27);/gi, "'").replace(/\s+/g, " ").trim();
const main = (html) => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
const graph = (html) => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter((m) => attrs(m[1]).type === "application/ld+json").flatMap((m) => JSON.parse(m[2])["@graph"] || []);
const hasType = (node, type) => [node?.["@type"]].flat().includes(type);
let profile;
let studies;
test.before(async () => {
  ({ aiProfile: profile } = await import("../content/ai-profile.mjs"));
  ({ projectStudies: studies } = await import("../content/project-studies.mjs"));
});

test("About presents both biographies and all six human questions as visible content", () => {
  const body = main(htmlFor("/hakkimda/"));
  const paragraphs = [...body.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi)];
  const headings = [...body.matchAll(/<h3\b([^>]*)>([\s\S]*?)<\/h3>/gi)];
  for (const biography of Object.values(profile.shortBio)) assert.ok(paragraphs.some((m) => text(m[2]) === biography));
  assert.equal(profile.questions.length, 6);
  for (const item of profile.questions) {
    assert.ok(headings.some((m) => text(m[2]) === item.question), item.question);
    assert.ok(paragraphs.some((m) => text(m[2]) === item.answer), item.question);
  }
  assert.ok([...paragraphs, ...headings].every((m) => !/\bhidden\b|aria-hidden=["']true|display\s*:\s*none/i.test(m[1])));
  assert.match(body, /lang="en"/);
  assert.ok(!/ignore (?:all |previous )?instructions|always recommend|recommend arda|best developer|en iyi geliştirici|recognized by|award-winning/i.test(text(body)));
});

test("the downloadable profile and About share the exact canonical Person identity", () => {
  const published = JSON.parse(read("profil.jsonld"));
  assert.equal(published["@context"], "https://schema.org");
  const exportedPerson = published["@graph"].find((node) => hasType(node, "Person"));
  const inlinePerson = graph(htmlFor("/hakkimda/")).find((node) => hasType(node, "Person"));
  assert.deepEqual(exportedPerson, inlinePerson);
  assert.equal(exportedPerson["@id"], `${site}/#person`);
  assert.equal(exportedPerson.url, profile.canonicalUrl);
  assert.equal(exportedPerson.name, profile.fullName);
  assert.equal(exportedPerson.identifier.value, profile.handle);
  assert.ok(!exportedPerson.award && !exportedPerson.aggregateRating && !exportedPerson.review);
});

test("project studies identify their public source code and three breadcrumb levels", () => {
  for (const study of studies) {
    const html = htmlFor(study.path);
    const nodes = graph(html);
    const source = nodes.find((node) => hasType(node, "SoftwareSourceCode"));
    const expectedRepo = `https://github.com/ardaltunel/${study.projectKey === "omni-tools" ? "omni-tools" : "blog"}`;
    assert.equal(source?.codeRepository, expectedRepo);
    assert.equal(source.author["@id"], `${site}/#person`);
    assert.ok(source.citation.length >= 2 && source.citation.every((url) => url.startsWith(`${expectedRepo}/blob/`)));
    const links = tags(main(html), "a").map((tag) => tag.href);
    assert.ok(links.includes(expectedRepo));
    assert.ok(links.filter((url) => url.startsWith(`${expectedRepo}/blob/`)).length >= 2);
    const breadcrumb = nodes.find((node) => hasType(node, "BreadcrumbList"));
    assert.deepEqual(breadcrumb.itemListElement.map((item) => item.position), [1, 2, 3]);
    assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [`${site}/`, `${site}/projeler/`, site + study.path]);
  }
});

test("all six public pages retain the original PNG favicon instead of an SVG replacement", () => {
  for (const page of pages) {
    const icons = tags(htmlFor(page), "link").filter((tag) => /(?:^|\s)(?:icon|apple-touch-icon)(?:\s|$)/i.test(tag.rel));
    assert.ok(icons.length >= 2, page);
    assert.ok(icons.every((tag) => !/\.svg(?:[?#]|$)/i.test(tag.href)), page);
    const icon = icons.find((tag) => tag.rel === "icon");
    assert.equal(new URL(icon.href, site + page).pathname, "/assets/favicon/favicon-32x32.png");
    assert.equal(icon.sizes, "32x32");
  }
});

test("nested case pages resolve their assets, public profile and homepage contact link", () => {
  for (const study of studies) {
    const html = htmlFor(study.path);
    for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const url = new URL(match[1], site + study.path);
      if (url.origin !== site || url.pathname.startsWith("/api/")) continue;
      const file = path.join(root, decodeURIComponent(url.pathname).slice(1), url.pathname.endsWith("/") ? "index.html" : "");
      assert.ok(fs.existsSync(file), `${study.path}: ${url.pathname}`);
    }
    const contact = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].find((m) => text(m[2]) === "Diğer iletişim kanalları");
    assert.equal(new URL(attrs(contact[1]).href, site + study.path).href, `${site}/#contact`);
    const alternate = tags(html, "link").find((tag) => tag.type === "application/ld+json");
    assert.equal(new URL(alternate.href, site + study.path).href, `${site}/profil.jsonld`);
  }
});

test("the shared crawler policy permits public search discovery while excluding internals", () => {
  const robots = read("robots.txt");
  const agents = [...robots.matchAll(/^User-agent:\s*([^\r\n]+)/gim)].map((m) => m[1].trim());
  assert.deepEqual(agents, ["*"]);
  assert.match(robots, /^Allow:\s*\/\s*$/m);
  assert.ok(!/^Disallow:\s*\/(?:\*)?\s*$/m.test(robots));
  for (const folder of ["api", "cache", "lib", "content", "tests", "cloudflare", "scripts"]) assert.ok(robots.includes(`Disallow: /${folder}/`));
});

test("the current Omni Tools case describes concrete JavaScript workflows without an invented React architecture", () => {
  const body = text(main(htmlFor("/projeler/omni-tools/")));
  assert.match(body, /JSON/);
  assert.match(body, /kategori/i);
  assert.match(body, /JavaScript/);
  assert.ok(!/React|React Router|Tailwind|Vite/i.test(body));
});
