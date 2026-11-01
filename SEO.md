# Portfolio search setup

The canonical site is https://ardaltunel.vercel.app/. As checked on 1 November
2026, `ardaltunel.com` and `www.ardaltunel.com` do not resolve. Do not change the
canonical domain until a custom domain is owned, connected and serving the site;
a later move also needs permanent redirects and Search Console migration checks.

## Pages and publishing

`index.template.html` is the homepage source. `content/seo-pages.mjs` contains the
visible About, Projects and Services content. `lib/seo.mjs` generates per-page
metadata, person/site/page structured data, breadcrumbs, robots and the sitemap.

```sh
node build-static.mjs --cache-only
node --test
```

Omit `--cache-only` to refresh Bionluk and GitHub data. The existing Actions
workflow rebuilds, tests and commits generated HTML and crawl files. Keep the
Google verification token. Do not hand-edit generated HTML.

The sitemap contains six canonical URLs, including two source-backed project
studies. It deliberately omits fragment links,
API routes, source files and manufactured freshness timestamps. The GitHub Pages
copy points to Vercel through canonical tags. Vercel redirects duplicate HTML
paths, excludes source documents from indexing and caches versioned assets.

Fonts are self-hosted with `font-display: swap` and their original OFL license.
Service cards use WebP with PNG fallback, lazy decoding and intrinsic dimensions.
The Actions workflow re-optimizes refreshed source images before rendering and
testing the final pages. For a manual refresh without adding project dependencies:

```sh
npm exec --yes --package=sharp@0.35.5 -- node scripts/optimize-images.mjs --services-only
node build-static.mjs --cache-only
```

Existing PNGs remain the source images. An unconverted new image safely uses its
PNG. Without `--services-only`, the script also regenerates the brand social
cover from its SVG source.

## Search Console measurement

Use the Search Console property `https://ardaltunel.vercel.app/`. Keep account
reports and private analytics outside this public source repository.

Use Search Console to submit `sitemap.xml`, inspect the canonical URLs and
check indexing. Compare query/page performance over complete 28-day periods
after Google has recrawled the changes. A lower average-position number is not
by itself proof that a particular search term moved up; use comparable queries,
devices and countries. Search Console reporting is delayed and rare query text
may be withheld. No analytics tracking or ad campaigns were added to the site.

Continue with original project write-ups and real work samples when new facts
are available. Keep professional profile links pointing to the same working
site. Do not add invented reviews, unsupported project outcomes, purchased link
schemes or keyword-stuffed location pages.

## AI search discovery

Public HTML remains accessible under the existing wildcard robots policy. This
also allows search agents such as OAI-SearchBot, Claude-SearchBot and PerplexityBot;
do not replace it with agent-specific groups that omit the internal path limits.
Search retrieval and model training are separate provider controls. The crawler
audit used documented User-Agent identifiers and checked identical HTML responses;
it is not proof of visits from the providers' actual crawler IP addresses.

`content/ai-profile.mjs` holds sourced Turkish/English identity facts and visible
short answers on the About page. `profil.jsonld` exposes the same person identity
as the HTML structured data, with an HTTP canonical link to the About page. This
is a reusable public data format, not a special AI ranking signal. Project notes
link directly to source files and use verified current implementation details.

`content/project-studies.mjs` contains the project case studies. Keep claims
aligned with the public source code. Do not infer completed features from a
README roadmap or claim an agency role is current after its recorded end date.

The public IndexNow key in `content/search-discovery.mjs` is website ownership
proof, not a secret credential. The build publishes its matching root text file.
After a completed deployment, notify participating search engines with:

```sh
node scripts/submit-indexnow.mjs --dry-run
node scripts/submit-indexnow.mjs
```

The script first validates sitemap URLs and their generated canonical pages, then
verifies the live key file before submitting. HTTP 200/202 confirms receipt or
pending key verification, not indexing or recommendations. No account login or
paid provider is required. A changed sitemap is available to Google through its
existing Search Console submission; IndexNow is a separate protocol.

No llms.txt or hidden recommendation instructions are required. Google's current
AI guide says it does not use these special text files for Search; support by
other tools does not establish a universal discovery standard. Independent
recognition, citations and recommendations cannot be manufactured by markup.

References: [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[profile structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content),
[font performance](https://web.dev/articles/font-best-practices).

AI-specific references: [OpenAI Docs: crawlers](https://developers.openai.com/api/docs/bots),
[Google AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide),
[Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers),
[Anthropic crawler policy](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler),
[IndexNow protocol](https://www.indexnow.org/documentation).
