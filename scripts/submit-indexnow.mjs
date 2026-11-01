import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { indexNowConfig } from "../content/search-discovery.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const endpoint = "https://api.indexnow.org/indexnow";
const internalPaths = new Set(["api", "assets", "cache", "lib", "content", "tests", "cloudflare", "scripts", "admin"]);

const validateUrlList = (urls, config = indexNowConfig) => {
  if (!/^[a-f0-9]{32}$/.test(config.key)
      || config.keyLocation !== `https://${config.host}/${config.key}.txt`) {
    throw new Error("Invalid IndexNow ownership configuration.");
  }
  if (!Array.isArray(urls) || !urls.length || urls.length > 10000 || urls.some((url) => typeof url !== "string")) {
    throw new Error("The sitemap must contain 1–10,000 public HTML URLs.");
  }
  for (const value of urls) {
    let url;
    try { url = new URL(value); } catch { throw new Error("The sitemap contains an invalid absolute URL."); }
    const firstSegment = url.pathname.split("/")[1];
    if (url.protocol !== "https:" || url.host !== config.host || url.username || url.password
        || url.search || url.hash || url.href !== value
        || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/.test(url.pathname)
        || internalPaths.has(firstSegment)) {
      throw new Error(`Not a canonical public HTML URL: ${value}`);
    }
  }
  return { host: config.host, key: config.key, keyLocation: config.keyLocation, urlList: [...new Set(urls)] };
};

export const createIndexNowPayload = (sitemapXml, config = indexNowConfig) => {
  if (typeof sitemapXml !== "string" || !/<urlset\b/.test(sitemapXml)
      || /<!DOCTYPE|<!ENTITY/i.test(sitemapXml)) {
    throw new Error("Expected a sitemap URL set without external entities.");
  }
  const urls = [...sitemapXml.matchAll(/<loc\s*>([^<]*)<\/loc\s*>/g)].map((match) => match[1].trim());
  return validateUrlList(urls, config);
};

const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]])
);

export const validateGeneratedPages = async (urlList, root = repositoryRoot) => {
  for (const url of urlList) {
    const pathname = new URL(url).pathname;
    const htmlFile = path.join(root, ...pathname.split("/").filter(Boolean), "index.html");
    let html;
    try { html = await fs.readFile(htmlFile, "utf8"); } catch {
      throw new Error(`Generated HTML is missing for ${url}. Rebuild the website first.`);
    }
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]));
    const canonicals = links.filter((link) => link.rel?.toLowerCase() === "canonical");
    const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
    if (canonicals.length !== 1 || canonicals[0].href !== url
        || metas.some((meta) => /^(robots|bingbot|googlebot)$/i.test(meta.name || "") && /noindex/i.test(meta.content || ""))) {
      throw new Error(`Generated page is not indexable with the expected canonical: ${url}`);
    }
  }
};

export const submitIndexNow = async (payload, { fetchImpl = fetch, timeoutMs = 15000 } = {}) => {
  // Revalidate even when called by another script instead of through this CLI.
  const validated = validateUrlList(payload.urlList, payload);
  const controller = new AbortController();
  let timer;
  const operation = async () => {
    const proof = await fetchImpl(validated.keyLocation, {
      method: "GET", redirect: "error", signal: controller.signal, headers: { Accept: "text/plain" },
    });
    if (proof.status !== 200 || await proof.text() !== validated.key) {
      throw new Error("The public IndexNow key file is unavailable or does not exactly match. Deploy it before submitting.");
    }

    const response = await fetchImpl(endpoint, {
      method: "POST", redirect: "error", signal: controller.signal,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(validated),
    });
    if (![200, 202].includes(response.status)) {
      const reasons = {
        400: "invalid submission format", 403: "ownership verification rejected",
        422: "host or URL validation rejected", 429: "rate limit exceeded; do not retry immediately",
      };
      const error = new Error(`IndexNow submission rejected: HTTP ${response.status} (${reasons[response.status] || "provider error"}).`);
      error.status = response.status;
      throw error;
    }
    return {
      status: response.status,
      urlCount: validated.urlList.length,
      verificationPending: response.status === 202,
      message: "URL notification received. This does not guarantee crawling, indexing, or AI recommendations.",
    };
  };
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          const error = new Error(`IndexNow request timed out after ${timeoutMs} ms.`);
          error.name = "TimeoutError";
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

export const main = async (args = process.argv.slice(2), {
  root = repositoryRoot, fetchImpl = fetch, output = console.log,
} = {}) => {
  if (args.some((arg) => arg !== "--dry-run")) throw new Error("Usage: node scripts/submit-indexnow.mjs [--dry-run]");
  const payload = createIndexNowPayload(await fs.readFile(path.join(root, "sitemap.xml"), "utf8"));
  await validateGeneratedPages(payload.urlList, root);
  if (args.includes("--dry-run")) {
    const summary = {
      dryRun: true, host: payload.host, keyLocation: payload.keyLocation,
      urlCount: payload.urlList.length, sampleUrls: payload.urlList.slice(0, 10), networkRequests: 0,
    };
    output(JSON.stringify(summary));
    return summary;
  }
  const result = await submitIndexNow(payload, { fetchImpl });
  output(JSON.stringify(result));
  return result;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
