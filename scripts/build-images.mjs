#!/usr/bin/env node
/**
 * Publish the drop-zone images into public/img/ and write src/data/images.json.
 *
 *   gallery/*.jpeg          -> public/img/gallery/<n>.webp (+ <n>-s.webp thumb)
 *   project_images/<name>   -> public/img/projects/<slug>.webp
 *   me.jpg                  -> public/img/me.webp, public/img/og.jpg
 *
 * Runs on predev/prebuild. Output is cached by source mtime, so a warm run is
 * a few milliseconds. public/img/ is gitignored; the manifest is committed so
 * the type-checker has something to import in a fresh clone.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = join(ROOT, "public/img");
const MANIFEST = join(ROOT, "src/data/images.json");
const CACHE = join(ROOT, ".cache/images.json");

// Source file in project_images/ -> slug used by content/projects/*.mdx.
const PROJECT_MAP = {
  "agentic loan.png": "agentic-loan",
  "branddiffusion.png": "branddiffusion",
  "ai generated text detector.jpg": "ai-generated-text-detector",
  "ai helathcare diagonistics.jpg": "ai-healthcare",
  "aline invasion pygame.png": "alien-invasion-pygame",
  "anime recommender system.webp": "anime-recommender",
  "apt.png": "apt",
  "aquila.jpg": "aquila",
  "atomnet.png": "atomnet",
  "brats response.png": "brats-response",
  "gui cansat.png": "gui-cansat",
  "missing person detection in crowd.jpg": "missing-person",
  "museum ticketing chatbot.jpg": "museum-ticketing-chatbot",
  "object tennis tracker.jpg": "object-tennis-tracker",
  "pysdf.jpg": "pysdf",
  "tinysafetynet.png": "tinysafetynet",
  "tomato disease.webp": "tomato-disease",
  "yotube langchain.jpg": "youtube-langchain",
  "zombies learning.png": "zombies-learning",
  "brainwaves finland.png": "brainwaves-finland",
  "saakshi.png": "saakshi",
};

const cache = await readFile(CACHE, "utf8").then(JSON.parse).catch(() => ({}));
const manifest = { gallery: [], projects: {}, me: null };
let encoded = 0;

async function fingerprint(path) {
  const s = await stat(path);
  return createHash("sha1").update(`${path}:${s.size}:${s.mtimeMs}`).digest("hex");
}

async function emit(src, dest, { width, height, quality = 80, fit = "inside", format = "webp" }) {
  const key = `${dest}@${width}x${height ?? ""}`;
  const fp = await fingerprint(src);
  if (cache[key]?.fp === fp && (await stat(dest).catch(() => null))) return cache[key].meta;
  await mkdir(join(dest, ".."), { recursive: true });
  let img = sharp(src).rotate().resize({ width, height, fit, withoutEnlargement: true });
  img = format === "jpeg" ? img.jpeg({ quality, mozjpeg: true }) : img.webp({ quality, effort: 5 });
  const info = await img.toFile(dest);
  encoded++;
  const meta = { w: info.width, h: info.height };
  cache[key] = { fp, meta };
  return meta;
}

// Gallery — sort by filename so numbering is stable between runs.
const galleryDir = join(ROOT, "gallery");
const galleryFiles = (await readdir(galleryDir))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();
for (const [i, f] of galleryFiles.entries()) {
  const n = String(i + 1).padStart(2, "0");
  const src = join(galleryDir, f);
  const full = await emit(src, join(OUT, "gallery", `${n}.webp`), { width: 1600, height: 1600 });
  await emit(src, join(OUT, "gallery", `${n}-s.webp`), { width: 640, height: 640, quality: 74 });
  manifest.gallery.push({ src: `/img/gallery/${n}.webp`, thumb: `/img/gallery/${n}-s.webp`, ...full });
}

// Projects
const projDir = join(ROOT, "project_images");
for (const f of await readdir(projDir)) {
  const slug = PROJECT_MAP[f] ?? basename(f, extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const meta = await emit(join(projDir, f), join(OUT, "projects", `${slug}.webp`), {
    width: 1400,
    height: 1000,
  });
  manifest.projects[slug] = { src: `/img/projects/${slug}.webp`, ...meta };
}

// Portrait + Open Graph card
const me = join(ROOT, "me.jpg");
manifest.me = { src: "/img/me.webp", ...(await emit(me, join(OUT, "me.webp"), { width: 960, height: 960 })) };
await emit(me, join(OUT, "og.jpg"), { width: 1200, height: 630, fit: "cover", format: "jpeg", quality: 82 });

await mkdir(join(MANIFEST, ".."), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
await mkdir(join(CACHE, ".."), { recursive: true });
await writeFile(CACHE, JSON.stringify(cache));
console.log(
  `images: ${manifest.gallery.length} gallery, ${Object.keys(manifest.projects).length} projects, ${encoded} encoded`,
);
