import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Requires sharp. ARDA_SHARP_MODULE_PATH can point to an existing installation,
// allowing asset generation without adding dependencies to the static website.
const require = createRequire(import.meta.url);
const resolveSharp = () => {
  if (process.env.ARDA_SHARP_MODULE_PATH) return require(process.env.ARDA_SHARP_MODULE_PATH);

  // npm exec adds its temporary node_modules/.bin directory to PATH. Packages
  // there are not ancestors of this script, so normal require() cannot find them.
  const npmExecPaths = (process.env.PATH || process.env.Path || "")
    .split(path.delimiter)
    .map((entry) => entry.replace(/^"|"$/g, ""))
    .filter((entry) => path.basename(entry).toLowerCase() === ".bin"
      && path.basename(path.dirname(entry)).toLowerCase() === "node_modules")
    .map((entry) => path.dirname(entry));
  const resolved = require.resolve("sharp", {
    paths: [path.dirname(fileURLToPath(import.meta.url)), ...npmExecPaths],
  });
  return require(resolved);
};
const sharp = resolveSharp();
const servicesOnly = process.argv.includes("--services-only");
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

let socialCover;
if (!servicesOnly) {
  const coverDirectory = path.join(root, "assets", "img");
  const cover = await sharp(path.join(coverDirectory, "og-arda-altunel.svg"))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(coverDirectory, "og-arda-altunel.png"));
  socialCover = { width: cover.width, height: cover.height, bytes: cover.size };
}
console.log(JSON.stringify({
  serviceImages: {
    count: originals.length,
    originalBytes,
    optimizedBytes,
    reductionPercent: Number(((1 - optimizedBytes / originalBytes) * 100).toFixed(1)),
  },
  ...(socialCover ? { socialCover } : {}),
}));
