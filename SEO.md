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

The sitemap contains four canonical URLs. It deliberately omits fragment links,
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

Use Search Console to submit `sitemap.xml`, inspect the four canonical URLs and
check indexing. Compare query/page performance over complete 28-day periods
after Google has recrawled the changes. A lower average-position number is not
by itself proof that a particular search term moved up; use comparable queries,
devices and countries. Search Console reporting is delayed and rare query text
may be withheld. No analytics tracking or ad campaigns were added to the site.

Continue with original project write-ups and real work samples when new facts
are available. Keep professional profile links pointing to the same working
site. Do not add invented reviews, unsupported project outcomes, purchased link
schemes or keyword-stuffed location pages.

References: [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
[sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[profile structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content),
[font performance](https://web.dev/articles/font-best-practices).
