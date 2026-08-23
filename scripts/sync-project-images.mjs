import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceDir = path.join(root, "project_images");
const destDir = path.join(root, "public", "images", "projects");

/**
 * Maps project_images filenames → public path (under /images/projects/).
 * When you add or rename files in project_images, update this map.
 */
const FILE_MAP = {
  "agentic loan.png": "agentic-loan.png",
  "branddiffusion.png": "branddiffusion.png",
  "ai generated text detector.jpg": "ai-generated-text-detector.jpg",
  "ai helathcare diagonistics.jpg": "ai-healthcare.jpg",
  "aline invasion pygame.png": "alien-invasion-pygame.png",
  "anime recommender system.webp": "anime-recommender.webp",
  "apt.png": "apt.png",
  "aquila.jpg": "aquila.jpg",
  "brats response.png": "brats-response.png",
  "gui cansat.png": "gui-cansat.png",
  "missing person detection in crowd.jpg": "missing-person.jpg",
  "museum ticketing chatbot.jpg": "museum-ticketing-chatbot.jpg",
  "object tennis tracker.jpg": "object-tennis-tracker.jpg",
  "pysdf.jpg": "pysdf.jpg",
  "tinysafetynet.png": "tinysafetynet.png",
  "tomato disease.webp": "tomato-disease.webp",
  "yotube langchain.jpg": "youtube-langchain.jpg",
  "zombies learning.png": "zombies-learning.png",
};

function toKebab(name) {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/gi, "")
    .toLowerCase();
}

function syncProjectImages() {
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log("sync-project-images: project_images/ not found, skipping.");
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });
  let count = 0;
  const seen = new Set();

  for (const [sourceName, destName] of Object.entries(FILE_MAP)) {
    const srcPath = path.join(sourceDir, sourceName);
    if (!fs.existsSync(srcPath)) continue;
    const destPath = path.join(destDir, destName);
    fs.copyFileSync(srcPath, destPath);
    seen.add(sourceName);
    count++;
  }

  const ext = (f) => path.extname(f).toLowerCase();
  const imgExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
  const rest = fs.readdirSync(sourceDir).filter((f) => imgExt.has(ext(f)) && !seen.has(f));
  for (const f of rest) {
    const base = path.basename(f, ext(f));
    const destName = toKebab(base) + ext(f);
    fs.copyFileSync(path.join(sourceDir, f), path.join(destDir, destName));
    count++;
  }

  console.log(`Synced ${count} project images from project_images/ → public/images/projects/`);
}

syncProjectImages();
