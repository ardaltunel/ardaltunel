const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const site = "https://ardaltunel.vercel.app";
const pages = ["/hakkimda/", "/projeler/", "/hizmetler/"];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const htmlFor = (page) => read(`${page.slice(1)}index.html`);
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((m) => [m[1].toLowerCase(), m[3]]));
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const anchors = (html, page) => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ ...attrs(m[1]), label: text(m[2]), url: new URL(attrs(m[1]).href, site + page) }));
const articles = (html) => [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)].filter((m) => attrs(m[1]).class?.split(/\s+/).includes("portfolio-project"));

function webpDimensions(bytes) {
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  for (let offset = 12; offset + 8 < bytes.length;) {
    const type = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === "VP8X") return [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1];
    if (type === "VP8 ") return [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
    if (type === "VP8L") {
      const bits = bytes.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = data + size + (size & 1);
  }
  assert.fail("WebP contains no image dimension header");
}

test("each redesigned page has one main heading and three usable section links with its own current state", () => {
  for (const page of pages) {
    const html = htmlFor(page);
    assert.equal([...html.matchAll(/<main\b/gi)].length, 1, page);
    assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, page);
    assert.match(html, /<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    const tabs = [...html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)].find((m) => attrs(m[1])["aria-label"] === "Portfolyo bölümleri");
    assert.ok(tabs, page);
    const links = anchors(tabs[2], page);
    assert.deepEqual(links.map((link) => link.url.href), pages.map((target) => site + target));
    assert.deepEqual(links.filter((link) => link["aria-current"] === "page").map((link) => link.url.pathname), [page]);
    for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
      for (const id of match[1].split(/\s+/)) assert.ok(html.includes(`id="${id}"`), `missing label ${id}`);
    }
  }
});

test("the three project cards route to the correct case studies and verified external destinations", () => {
  const cards = articles(htmlFor("/projeler/"));
  assert.equal(cards.length, 3);
  const expected = [
    { name: "Omni Tools", study: `${site}/projeler/omni-tools/`, demo: "https://ardaltunel.github.io/omni-tools/", repository: "https://github.com/ardaltunel/omni-tools" },
    { name: "Blog Platformu", study: `${site}/projeler/blog-platformu/`, demo: "https://ardaltunel.github.io/blog/", repository: "https://github.com/ardaltunel/blog" },
    { name: "Emlak Kraliçeleri", demo: "https://emlakkraliceleri.com/" },
  ];
  cards.forEach((card, index) => {
    const project = expected[index];
    assert.ok(text(card[2]).includes(project.name));
    const links = anchors(card[2], "/projeler/");
    const primary = links.find((link) => link.label === (project.study ? "Projeyi incele" : "Siteyi ziyaret et"));
    assert.equal(primary?.url.href, project.study || project.demo);
    assert.ok(links.some((link) => link.url.href === project.demo));
    if (project.repository) assert.ok(links.some((link) => link.url.href === project.repository));
    else assert.ok(!links.some((link) => link.url.hostname === "github.com" || link.url.pathname.startsWith("/projeler/")));
  });
});

test("project preview dimensions match the image files and each preview has an accessible description", () => {
  for (const card of articles(htmlFor("/projeler/"))) {
    const image = attrs(card[2].match(/<img\b[^>]*>/i)?.[0] || "");
    assert.ok(image.alt?.trim());
    const url = new URL(image.src, site + "/projeler/");
    assert.equal(url.origin, site);
    const bytes = fs.readFileSync(path.join(root, url.pathname.slice(1)));
    assert.deepEqual([Number(image.width), Number(image.height)], webpDimensions(bytes));
    assert.ok(Number(image.width) > 0 && Number(image.height) > 0);
  }
});

test("Services exposes all six real Bionluk offers without adding fixed package prices", () => {
  const html = htmlFor("/hizmetler/");
  const body = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
  const expected = JSON.parse(read("cache/bionluk-services.json")).map((service) => service.url).sort();
  const listingLinks = anchors(body, "/hizmetler/").filter((link) => link.url.href.startsWith("https://bionluk.com/ardaltunel/"));
  assert.equal(expected.length, 6);
  assert.deepEqual([...new Set(listingLinks.map((link) => link.url.href))].sort(), expected);
  assert.ok(listingLinks.every((link) => link.label.length > 0 && link.rel?.includes("noopener")));
  assert.ok(!/\d[\d.,]*\s*(?:TL|₺)/.test(text(body)));
});
