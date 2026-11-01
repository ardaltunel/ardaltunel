const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const site = "https://ardaltunel.vercel.app";
const pages = [
  { path: "/", file: "index.html" },
  { path: "/hakkimda/", file: "hakkimda/index.html" },
  { path: "/projeler/", file: "projeler/index.html", heading: "Web geliştirme projelerim" },
  { path: "/hizmetler/", file: "hizmetler/index.html", heading: "Web geliştirme hizmetlerim" },
  { path: "/projeler/omni-tools/", file: "projeler/omni-tools/index.html", heading: "Omni Tools: tek panelde farklı web araçları" },
  { path: "/projeler/blog-platformu/", file: "projeler/blog-platformu/index.html", heading: "Blog Platformu: yazı hazırlamadan yönetici incelemesine" },
];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => attributes(match[0]));
const meta = (html, name) => tags(html, "meta").find((tag) => tag.name === name || tag.property === name)?.content;
const types = (item) => [item?.["@type"]].flat();
const plainText = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const graphs = (html) => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => attributes(match[1]).type === "application/ld+json")
  .map((match) => JSON.parse(match[2]));

test("all generated pages have unique titles, descriptions and canonical URLs", () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const page of pages) {
    const html = read(page.file);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
    const description = meta(html, "description");
    assert.ok(title && description, page.file);
    assert.ok(!titles.has(title), `duplicate title in ${page.file}`);
    assert.ok(!descriptions.has(description), `duplicate description in ${page.file}`);
    titles.add(title);
    descriptions.add(description);
    assert.equal(tags(html, "link").find((tag) => tag.rel === "canonical")?.href, site + page.path);
    assert.equal(tags(html, "html")[0]?.lang, "tr");
    assert.equal(meta(html, "google-site-verification"), "IKQZppVFgKz3yuioh6ZYzdu_vtUVYJ2z0E28i6QLvSA");
    assert.ok(!tags(html, "meta").some((tag) => /^(robots|googlebot)$/i.test(tag.name || "") && /noindex/i.test(tag.content || "")), page.file);
    assert.ok(!/\{\{[^}]+\}\}|<!--\s*(?:GITHUB_PROJECTS|BIONLUK_SERVICES)/.test(html), page.file);
    const headings = [...html.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi)];
    assert.equal(headings.length, 1, page.file);
    assert.ok(!/\bhidden\b|aria-hidden=["']true|display\s*:\s*none/i.test(headings[0][1]), page.file);
    if (page.heading) assert.equal(plainText(headings[0][2]), page.heading);
    else assert.match(plainText(headings[0][2]), /Arda Altunel/);
  }
});

test("JSON-LD describes the real person, website and each page with child breadcrumbs", () => {
  for (const page of pages) {
    const documents = graphs(read(page.file));
    assert.ok(documents.length, page.file);
    const graph = documents.flatMap((document) => document["@graph"] || []);
    assert.ok(graph.length, `missing @graph in ${page.file}`);
    const person = graph.find((item) => types(item).includes("Person"));
    assert.equal(person?.name, "Arda Altunel");
    assert.ok(person?.["@id"]);
    assert.ok(graph.some((item) => types(item).includes("WebSite")), page.file);
    assert.ok(graph.some((item) => types(item).some((type) => /Page$/.test(type))), page.file);
    const profile = graph.find((item) => types(item).includes("ProfilePage"));
    if (page.path === "/hakkimda/") assert.equal(profile?.mainEntity?.["@id"], person["@id"]);
    else assert.equal(profile, undefined, `unexpected ProfilePage in ${page.file}`);
    if (page.path !== "/") {
      const breadcrumb = graph.find((item) => types(item).includes("BreadcrumbList"));
      assert.ok(breadcrumb?.itemListElement?.length >= 2, page.file);
      const destination = breadcrumb.itemListElement.at(-1).item;
      assert.equal(typeof destination === "string" ? destination : destination?.["@id"], site + page.path);
    }
    assert.ok(!graph.some((item) => types(item).some((type) => ["Review", "AggregateRating"].includes(type))));
    assert.ok(!/"(?:review|aggregateRating)"\s*:/.test(JSON.stringify(documents)));
    assert.ok(!/(?:placehold\.co|placeholder\.com|dummyimage\.com|https?:\/\/example\.com)/i.test(JSON.stringify(documents)));
  }
});

test("social cards use the absolute PNG asset and its actual dimensions", () => {
  const imagePath = path.join(root, "assets/img/og-arda-altunel.png");
  const png = fs.readFileSync(imagePath);
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  for (const page of pages) {
    const html = read(page.file);
    assert.equal(meta(html, "og:image"), site + "/assets/img/og-arda-altunel.png");
    assert.equal(meta(html, "og:image:width"), "1200");
    assert.equal(meta(html, "og:image:height"), "630");
  }
});

test("the homepage links to all child pages and all local assets resolve", () => {
  const homeLinks = tags(read("index.html"), "a").map((tag) => new URL(tag.href, site + "/").href);
  for (const page of pages.slice(1).filter((page) => page.path.split("/").filter(Boolean).length === 1)) assert.ok(homeLinks.includes(site + page.path), page.path);
  for (const page of pages) {
    for (const match of read(page.file).matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const value = match[1].split(/[?#]/)[0];
      if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value) || value.startsWith("/api/")) continue;
      const local = value.startsWith("/") ? path.join(root, value.slice(1)) : path.resolve(root, path.dirname(page.file), value);
      assert.ok(fs.existsSync(local), `${page.file}: missing ${value}`);
      if (value.endsWith("/")) assert.ok(fs.existsSync(path.join(local, "index.html")), `${page.file}: missing directory index ${value}`);
    }
  }
});

test("sitemap and robots expose only canonical public pages", () => {
  const urls = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls.sort(), pages.map((page) => site + page.path).sort());
  assert.ok(urls.every((url) => !url.includes("#")));
  const robots = read("robots.txt");
  assert.match(robots, /Sitemap:\s*https:\/\/ardaltunel\.vercel\.app\/sitemap\.xml/i);
  const disallowed = [...robots.matchAll(/^Disallow:\s*([^\r\n]*)/gim)].map((match) => match[1].trim()).filter(Boolean);
  assert.ok(!disallowed.some((value) => /^\/assets(?:\/|$)/.test(value) || ["/", "/*", ...pages.slice(1).map((page) => page.path)].includes(value)));
});

test("Vercel redirects the HTML duplicate permanently and preserves the chat function", () => {
  const config = JSON.parse(read("vercel.json"));
  assert.ok(config.redirects?.some((item) => item.source === "/index.html" && item.destination === "/" && item.permanent === true));
  assert.ok(config.functions?.["api/chat.js"]);
  assert.ok(config.functions["api/chat.js"].includeFiles.includes("cache/chatbot-context.json"));
  for (const rule of config.headers || []) {
    const noindex = rule.headers.some((header) => header.key.toLowerCase() === "x-robots-tag" && /noindex/i.test(header.value));
    if (!noindex) continue;
    const publicPath = pages.some((page) => [page.path, page.path.replace(/\/$/, "")].includes(rule.source));
    const catchall = /^\/(?:\*|\(\.\*\)|:[^/]+)\/?$/.test(rule.source) && !rule.source.endsWith(".md");
    assert.ok(!publicPath && !catchall && !/^\/assets(?:\/|$)/.test(rule.source), `public noindex: ${rule.source}`);
  }
});
