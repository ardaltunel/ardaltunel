import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Requires sharp. ARDA_SHARP_MODULE_PATH can point to an existing installation,
// allowing asset generation without adding dependencies to the static website.
const require = createRequire(import.meta.url);
const sharp = require(process.env.ARDA_SHARP_MODULE_PATH || "sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serviceDirectory = path.join(root, "assets", "img", "services");
const originals = (await fs.readdir(serviceDirectory)).filter((file) => file.endsWith(".png")).sort();
let originalBytes = 0;
let optimizedBytes = 0;

for (const file of originals) {
  const source = path.join(serviceDirectory, file);
  const target = source.replace(/\.png$/, ".webp");
  const before = await fs.stat(source);
  const metadata = await sharp(source).metadata();
  const result = await sharp(source)
    .rotate()
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(target);

  originalBytes += before.size;
  optimizedBytes += result.size;
  console.log(JSON.stringify({
    source: path.relative(root, source),
    target: path.relative(root, target),
    original: { width: metadata.width, height: metadata.height, bytes: before.size },
    optimized: { width: result.width, height: result.height, bytes: result.size },
  }));
}

const coverDirectory = path.join(root, "assets", "img");
const cover = await sharp(path.join(coverDirectory, "og-arda-altunel.svg"))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(coverDirectory, "og-arda-altunel.png"));
console.log(JSON.stringify({
  serviceImages: {
    count: originals.length,
    originalBytes,
    optimizedBytes,
    reductionPercent: Number(((1 - optimizedBytes / originalBytes) * 100).toFixed(1)),
  },
  socialCover: { width: cover.width, height: cover.height, bytes: cover.size },
}));
