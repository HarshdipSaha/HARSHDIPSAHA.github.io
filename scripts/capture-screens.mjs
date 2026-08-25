#!/usr/bin/env node
/**
 * Visual capture for design review.
 *
 * Serves the built static export and screenshots each route across viewports
 * and both themes into `.impeccable/review/`, which is where the impeccable
 * finish reviewer looks for evidence.
 *
 * Two rules from that review process are enforced here rather than left to
 * chance, because a malformed capture invalidates a whole review round:
 *   1. Entrance motion is settled before the shutter. An element still mid
 *      transition reads as a missing element and gets "fixed" into a regression.
 *   2. Every file is validated after writing — a capture below a plausible byte
 *      floor is reported as suspect instead of being passed off as evidence.
 *
 * Usage:
 *   npm run build
 *   node scripts/capture-screens.mjs [--port 4173]
 */
import { createServer } from "node:http";
import { readFile, mkdir, stat, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const ROOT = resolve(process.cwd(), "out");
const OUT_DIR = resolve(process.cwd(), ".impeccable/review");
const PORT = Number(process.argv[process.argv.indexOf("--port") + 1]) || 4173;

const ROUTES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about.html" },
  { name: "work", path: "/work.html" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const THEMES = ["dark", "light"];

/** Anything smaller than this is almost certainly a blank or half-loaded frame. */
const MIN_PLAUSIBLE_BYTES = 12_000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};

function serve() {
  const server = createServer(async (req, res) => {
    try {
      let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (urlPath.endsWith("/")) urlPath += "index.html";
      let filePath = join(ROOT, urlPath);
      // Mirror GitHub Pages: extensionless paths resolve to <path>.html
      if (!extname(filePath)) {
        try {
          await stat(`${filePath}.html`);
          filePath = `${filePath}.html`;
        } catch {
          /* fall through to 404 */
        }
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
    }
  });
  return new Promise((ok) => server.listen(PORT, "127.0.0.1", () => ok(server)));
}

async function main() {
  await stat(ROOT).catch(() => {
    throw new Error(`No build found at ${ROOT}. Run \`npm run build\` first.`);
  });
  await mkdir(OUT_DIR, { recursive: true });

  const server = await serve();
  const browser = await chromium.launch();
  const written = [];

  try {
    for (const theme of THEMES) {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
          deviceScaleFactor: 2,
          reducedMotion: "no-preference",
        });
        const page = await context.newPage();

        for (const route of ROUTES) {
          const url = `http://127.0.0.1:${PORT}${route.path}`;
          await page.goto(url, { waitUntil: "networkidle" });

          // Settle entrance motion before the shutter: reveal everything the
          // observer would have revealed, then let transitions finish.
          await page.evaluate(() => {
            for (const el of document.querySelectorAll("[data-reveal]")) {
              el.setAttribute("data-reveal", "in");
            }
          });

          // Force lazy images to decode. Without this, anything below the fold
          // captures as an empty box and reads as a missing image — which is
          // exactly the kind of false defect that wastes a review round.
          await page.evaluate(async () => {
            const step = window.innerHeight;
            for (let y = 0; y < document.body.scrollHeight; y += step) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
          });
          await page.evaluate(() =>
            Promise.all(
              [...document.images]
                .filter((i) => !i.complete)
                .map((i) => i.decode().catch(() => {})),
            ),
          );
          const undecoded = await page.evaluate(
            () => [...document.images].filter((i) => i.naturalWidth === 0).length,
          );
          if (undecoded > 0) {
            console.warn(`  ! ${route.name}/${vp.name}/${theme}: ${undecoded} image(s) undecoded`);
          }
          await page.waitForTimeout(900);
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(200);

          const file = join(OUT_DIR, `${route.name}-${vp.name}-${theme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          written.push(file);
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Validate: open every file and confirm it is a plausible capture.
  const suspect = [];
  for (const f of written) {
    const { size } = await stat(f);
    if (size < MIN_PLAUSIBLE_BYTES) suspect.push(`${f} (${size} B)`);
  }

  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".png")).sort();
  console.log(`Captured ${written.length} screenshots into ${OUT_DIR}\n`);
  for (const f of files) {
    const { size } = await stat(join(OUT_DIR, f));
    console.log(`  ${f.padEnd(34)} ${(size / 1024).toFixed(0)} KB`);
  }
  if (suspect.length) {
    console.error(`\nSUSPECT (below ${MIN_PLAUSIBLE_BYTES} B, likely blank):`);
    for (const s of suspect) console.error(`  ${s}`);
    process.exit(1);
  }
  console.log("\nAll captures above the plausibility floor.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
