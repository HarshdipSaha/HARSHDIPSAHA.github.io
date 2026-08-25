/**
 * Build-time responsive image pipeline.
 *
 * Runs AFTER sync-me / sync-gallery / sync-project-images have published the
 * originals into public/images/**. For every raster image it:
 *
 *   1. Rewrites the original in place as an optimised fallback (never upscaled,
 *      capped at MAX_WIDTH, PNG re-encoded losslessly, JPEG/WebP left alone if
 *      already lean — so repeated builds can never compound generation loss).
 *   2. Emits an AVIF + WebP ladder into public/images/responsive/** at
 *      RESPONSIVE_WIDTHS, never wider than the source's intrinsic width.
 *   3. Writes src/data/image-manifest.json so components can build srcSet /
 *      sizes / width / height without guessing.
 *
 * Idempotent + cached: state lives in .cache/image-pipeline.json plus a copy of
 * each optimised fallback in .cache/images/. A file is only re-encoded when its
 * bytes or the pipeline config actually changed. When a sync script re-copies a
 * raw drop-zone file over an already-optimised destination, the cached fallback
 * is restored with a plain copy instead of a fresh encode.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imagesDir = path.join(root, "public", "images");
const responsiveDirName = "responsive";
const responsiveDir = path.join(imagesDir, responsiveDirName);
const manifestPath = path.join(root, "src", "data", "image-manifest.json");
const cacheDir = path.join(root, ".cache");
const cacheStatePath = path.join(cacheDir, "image-pipeline.json");
const cacheBlobDir = path.join(cacheDir, "images");

const CONFIG = {
  version: 1,
  /** Ladder of candidate widths. Anything >= the source width is dropped. */
  responsiveWidths: [480, 960, 1440],
  /** Hard cap for the fallback (and the top rung of the ladder). */
  maxWidth: 1920,
  /**
   * A width is skipped when it is within this fraction of the cap width, so we
   * don't ship e.g. both 1440w and 1378w.
   */
  nearDuplicateRatio: 0.9,
  /**
   * Two encoder profiles. "graphic" (PNG sources — screenshots, diagrams, UI)
   * keeps full chroma so coloured text and thin strokes stay crisp; "photo"
   * (JPEG/WebP sources) can subsample chroma safely.
   */
  avif: {
    photo: { quality: 60, effort: 5, chromaSubsampling: "4:2:0" },
    graphic: { quality: 60, effort: 5, chromaSubsampling: "4:4:4" },
  },
  webp: {
    photo: { quality: 78, effort: 5 },
    graphic: { quality: 80, effort: 5, smartSubsample: true },
  },
  jpeg: { quality: 82, mozjpeg: true, progressive: true },
  png: { compressionLevel: 9, effort: 10 },
  /**
   * Already-lean lossy sources (bytes per pixel below this) keep their original
   * bytes. Re-encoding them would be generation loss for a negligible win.
   */
  lossyBppFloor: 0.15,
  /** Only replace a lossy fallback when the re-encode saves at least this much. */
  minLossyGain: 0.05,
  /** Directories (relative to public/images) that get a fallback pass only. */
  fallbackOnly: ["og"],
};

const CONFIG_HASH = sha1(Buffer.from(JSON.stringify(CONFIG)));

const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function sha1(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (path.relative(imagesDir, full) === responsiveDirName) continue;
      walk(full, acc);
    } else if (SOURCE_EXT.has(path.extname(entry.name).toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

function readState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(cacheStatePath, "utf8"));
    if (parsed.configHash !== CONFIG_HASH) return {};
    return parsed.entries ?? {};
  } catch {
    return {};
  }
}

function ladderFor(intrinsicWidth) {
  const cap = Math.min(intrinsicWidth, CONFIG.maxWidth);
  const widths = CONFIG.responsiveWidths.filter((w) => w < cap * CONFIG.nearDuplicateRatio);
  widths.push(cap);
  return { cap, widths: [...new Set(widths)].sort((a, b) => a - b) };
}

function encoderFor(format, pipeline, profile = "photo") {
  if (format === "avif") return pipeline.avif(CONFIG.avif[profile]);
  if (format === "webp") return pipeline.webp(CONFIG.webp[profile]);
  if (format === "jpeg") return pipeline.jpeg(CONFIG.jpeg);
  if (format === "png") return pipeline.png(CONFIG.png);
  throw new Error(`unsupported format: ${format}`);
}

/**
 * PNG is re-encoded losslessly (always safe). Lossy formats are only touched
 * when they must be downscaled or when they are wastefully large for their
 * pixel count — this is what stops repeated builds from stacking JPEG
 * generations on top of each other.
 */
function shouldRecompressFallback({ format, bytes, width, height, needsResize }) {
  if (needsResize) return true;
  if (format === "png") return true;
  return bytes / (width * height) > CONFIG.lossyBppFloor;
}

async function buildFallback(srcBuffer, meta) {
  const needsResize = meta.width > CONFIG.maxWidth;
  const format = meta.format === "jpg" ? "jpeg" : meta.format;

  if (!shouldRecompressFallback({ format, bytes: srcBuffer.length, width: meta.width, height: meta.height, needsResize })) {
    return { buffer: srcBuffer, width: meta.width, height: meta.height, changed: false };
  }

  let pipeline = sharp(srcBuffer, { failOn: "none" });
  if (needsResize) pipeline = pipeline.resize({ width: CONFIG.maxWidth, withoutEnlargement: true, fit: "inside" });
  const { data, info } = await encoderFor(format, pipeline).toBuffer({ resolveWithObject: true });

  // Never regress: keep the smaller bytes, and require a real win before
  // accepting a lossy re-encode.
  if (!needsResize) {
    const gain = (srcBuffer.length - data.length) / srcBuffer.length;
    const threshold = format === "png" ? 0 : CONFIG.minLossyGain;
    if (gain <= threshold) {
      return { buffer: srcBuffer, width: meta.width, height: meta.height, changed: false };
    }
  }
  return { buffer: data, width: info.width, height: info.height, changed: true };
}

async function processFile(absPath, state, stats) {
  const rel = toPosix(path.relative(imagesDir, absPath));
  const publicUrl = `/images/${rel}`;
  const current = fs.readFileSync(absPath);
  const currentHash = sha1(current);
  const cached = state[rel];
  const cacheBlobPath = path.join(cacheBlobDir, `${rel.replace(/[\\/]/g, "__")}`);

  if (cached) {
    const outputsPresent = cached.outputs.every((p) => fs.existsSync(path.join(root, p)));
    if (outputsPresent && currentHash === cached.outHash) {
      stats.skipped++;
      return [publicUrl, cached.entry, cached];
    }
    if (outputsPresent && currentHash === cached.srcHash && fs.existsSync(cacheBlobPath)) {
      // A sync script re-copied the raw drop-zone file over our optimised
      // output. Restore from cache — a copy, not an encode.
      fs.copyFileSync(cacheBlobPath, absPath);
      stats.restored++;
      return [publicUrl, cached.entry, cached];
    }
  }

  const meta = await sharp(current, { failOn: "none" }).metadata();
  if (!meta.width || !meta.height) {
    stats.errors.push(`${rel}: could not read dimensions`);
    return null;
  }

  const fallback = await buildFallback(current, meta);
  const fallbackOnly = CONFIG.fallbackOnly.some((d) => rel === d || rel.startsWith(`${d}/`));
  const { cap, widths } = ladderFor(fallback.width);

  const outputs = [];
  const variants = { avif: [], webp: [] };

  if (!fallbackOnly) {
    const outDir = path.join(responsiveDir, path.dirname(rel));
    fs.mkdirSync(outDir, { recursive: true });
    const base = path.basename(rel, path.extname(rel));
    const profile = meta.format === "png" ? "graphic" : "photo";

    for (const format of ["avif", "webp"]) {
      const rungs = [];
      for (const width of widths) {
        const outName = `${base}-${width}.${format}`;
        const outAbs = path.join(outDir, outName);
        const pipeline = sharp(fallback.buffer, { failOn: "none" }).resize({
          width,
          withoutEnlargement: true,
          fit: "inside",
        });
        const { data, info } = await encoderFor(format, pipeline, profile).toBuffer({ resolveWithObject: true });
        stats.encoded++;
        // Never ship a "responsive" file that is heavier than simply using the
        // fallback — that would make the page slower, not faster.
        if (data.length >= fallback.buffer.length) {
          stats.rejected++;
          continue;
        }
        fs.writeFileSync(outAbs, data);
        rungs.push({
          w: info.width,
          h: info.height,
          src: `/images/${responsiveDirName}/${toPosix(path.join(path.dirname(rel), outName))}`,
          bytes: data.length,
          abs: outAbs,
        });
      }
      // If the top rung lost, the browser would have to upscale a narrower
      // variant to fill a wide slot. Drop the whole format instead.
      const topRung = rungs.at(-1);
      if (!topRung || topRung.w < Math.min(cap, fallback.width)) {
        for (const rung of rungs) fs.rmSync(rung.abs, { force: true });
        continue;
      }
      for (const rung of rungs) {
        outputs.push(toPosix(path.relative(root, rung.abs)));
        variants[format].push({ w: rung.w, h: rung.h, src: rung.src, bytes: rung.bytes });
      }
    }
  }

  if (fallback.changed) {
    fs.writeFileSync(absPath, fallback.buffer);
    stats.fallbackBytesSaved += current.length - fallback.buffer.length;
    stats.fallbacksRewritten++;
  }

  fs.mkdirSync(cacheBlobDir, { recursive: true });
  fs.writeFileSync(cacheBlobPath, fallback.buffer);

  const toSrcSet = (list) => list.map((v) => `${v.src} ${v.w}w`).join(", ");
  const entry = {
    src: publicUrl,
    width: fallback.width,
    height: fallback.height,
    aspectRatio: Number((fallback.width / fallback.height).toFixed(6)),
    bytes: fallback.buffer.length,
    sources: ["avif", "webp"]
      .filter((format) => variants[format].length > 0)
      .map((format) => ({ type: `image/${format}`, srcSet: toSrcSet(variants[format]) })),
    variants,
    maxWidth: variants.avif.at(-1)?.w ?? variants.webp.at(-1)?.w ?? fallback.width,
  };

  return [
    publicUrl,
    entry,
    {
      srcHash: currentHash,
      outHash: sha1(fallback.buffer),
      outputs,
      entry,
    },
  ];
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

function pruneOrphans(keptOutputs) {
  if (!fs.existsSync(responsiveDir)) return 0;
  let removed = 0;
  const stack = [responsiveDir];
  const files = [];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else files.push(full);
    }
  }
  for (const file of files) {
    if (!keptOutputs.has(toPosix(path.relative(root, file)))) {
      fs.unlinkSync(file);
      removed++;
    }
  }
  return removed;
}

async function main() {
  if (!fs.existsSync(imagesDir)) {
    console.log("optimize-images: public/images not found, skipping.");
    return;
  }

  const files = walk(imagesDir).sort();
  const state = readState();
  const stats = { encoded: 0, rejected: 0, skipped: 0, restored: 0, fallbacksRewritten: 0, fallbackBytesSaved: 0, errors: [] };

  const results = await mapWithConcurrency(files, 4, (file) => processFile(file, state, stats));

  const images = {};
  const nextState = {};
  const keptOutputs = new Set();
  for (const result of results) {
    if (!result) continue;
    const [publicUrl, entry, cacheEntry] = result;
    images[publicUrl] = entry;
    nextState[publicUrl.slice("/images/".length)] = cacheEntry;
    for (const out of cacheEntry.outputs) keptOutputs.add(out);
  }

  const pruned = pruneOrphans(keptOutputs);

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        config: {
          widths: CONFIG.responsiveWidths,
          maxWidth: CONFIG.maxWidth,
          formats: ["avif", "webp"],
        },
        images,
      },
      null,
      2,
    )}\n`,
  );

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheStatePath, `${JSON.stringify({ configHash: CONFIG_HASH, entries: nextState }, null, 2)}\n`);

  const savedKb = Math.round(stats.fallbackBytesSaved / 1024);
  console.log(
    `optimize-images: ${files.length} sources | encoded ${stats.encoded} variants ` +
      `(${stats.rejected} rejected as no-win) | ` +
      `restored ${stats.restored} | up-to-date ${stats.skipped} | ` +
      `fallbacks rewritten ${stats.fallbacksRewritten} (-${savedKb} KB)` +
      (pruned ? ` | pruned ${pruned} stale` : ""),
  );
  for (const err of stats.errors) console.warn(`optimize-images: ${err}`);
}

main().catch((err) => {
  console.error("optimize-images failed:", err);
  process.exit(1);
});
