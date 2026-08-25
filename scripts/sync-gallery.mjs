import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const gallerySource = path.join(root, "gallery");
const galleryDest = path.join(root, "public", "images", "gallery");
const dataDir = path.join(root, "src", "data");
const galleryJsonPath = path.join(dataDir, "gallery.json");

const IMG_EXT = new Set([".jpeg", ".jpg", ".png", ".webp", ".gif"]);

/**
 * Read the real orientation off the file.
 *
 * Every entry used to be hardcoded `"horizontal"`, but 7 of the 8 photos are
 * portrait (1200x1600 and similar). GalleryView renders horizontal at 16/9 and
 * vertical at 3/4, so those seven were being cropped into landscape boxes.
 */
async function orientationOf(filePath) {
  try {
    const { width, height } = await sharp(filePath).metadata();
    if (!width || !height) return "horizontal";
    return height > width ? "vertical" : "horizontal";
  } catch {
    // Never fail the build over a metadata read; fall back to the old default.
    return "horizontal";
  }
}

async function syncGallery() {
  if (!fs.existsSync(gallerySource)) {
    fs.mkdirSync(galleryDest, { recursive: true });
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(galleryJsonPath, JSON.stringify([], null, 2));
    console.log("Gallery source gallery/ not found; wrote empty gallery.json");
    return;
  }

  const files = fs
    .readdirSync(gallerySource)
    .filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  fs.mkdirSync(galleryDest, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  const images = [];
  for (const [i, file] of files.entries()) {
    const ext = path.extname(file).toLowerCase();
    const destName = `gallery-${i + 1}${ext}`;
    const srcPath = path.join(gallerySource, file);
    const destPath = path.join(galleryDest, destName);
    fs.copyFileSync(srcPath, destPath);
    images.push({
      src: `/images/gallery/${destName}`,
      alt: "Gallery",
      orientation: await orientationOf(srcPath),
    });
  }

  fs.writeFileSync(galleryJsonPath, JSON.stringify(images, null, 2));
  console.log(`Synced ${images.length} gallery images from gallery/ → public/images/gallery, wrote gallery.json`);
}

await syncGallery();
