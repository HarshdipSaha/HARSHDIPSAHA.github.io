import { expect, test, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { story } from "../src/content/site";

/**
 * "Nothing breaks" gate. Every prerendered route in `out/` must load with a
 * 200, render its <h1>, offer a way home, survive a full scroll (that is where
 * Motion's scroll timelines throw), and log zero console errors, page errors
 * or failed requests. Routes are discovered from the build, so a new page is
 * covered the moment it exists.
 */

const OUT = join(process.cwd(), "out");
const SKIP_DIRS = new Set(["_next", "brain", "img"]);
const SKIP_FILES = new Set(["404.html", "_not-found.html"]);

function routesFromOut(dir = OUT): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) routes.push(...routesFromOut(join(dir, entry.name)));
      continue;
    }
    if (!entry.name.endsWith(".html") || SKIP_FILES.has(entry.name)) continue;
    const rel = relative(OUT, join(dir, entry.name)).split(sep).join("/").replace(/\.html$/, "");
    routes.push(rel === "index" ? "/" : `/${rel}`);
  }
  return routes.sort();
}

const routes = routesFromOut();

type Problems = string[];

function watch(page: Page): Problems {
  const problems: Problems = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console.error: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  return problems;
}

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(300);
}

test("the build contains the site's routes", () => {
  // 5 top-level pages + one per project. A collapse here means the export
  // silently dropped pages — the deploy would still "succeed".
  expect(routes.length).toBeGreaterThanOrEqual(10);
  for (const must of ["/", "/story", "/projects", "/process", "/gallery"]) expect(routes).toContain(must);
});

for (const route of routes) {
  test(`renders ${route} without errors`, async ({ page }) => {
    const problems = watch(page);

    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status(), `status for ${route}`).toBe(200);

    await expect(page.locator("h1").first()).toBeVisible();
    expect(await page.locator('a[href="/"]').count(), "a link home exists").toBeGreaterThan(0);

    await scrollThrough(page);

    expect(problems, `problems on ${route}`).toEqual([]);
  });
}

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("the home page renders its static fallbacks without errors", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("h1").first()).toBeVisible();
    await scrollThrough(page);
    expect(problems).toEqual([]);
  });
});

test.describe("story Tools toy", () => {
  test("every tool name is real DOM text", async ({ page }) => {
    await page.goto("/story", { waitUntil: "load" });
    for (const tool of story.skills) {
      await expect(page.getByRole("button", { name: tool, exact: true })).toBeVisible();
    }
  });

  test("clicking a tool measurably reshuffles the order", async ({ page }) => {
    await page.goto("/story", { waitUntil: "load" });
    const orderBefore = await page.$$eval("li button", (els) => els.map((el) => el.textContent?.trim()));
    await page.getByRole("button", { name: story.skills[0], exact: true }).click();
    // The spring `layout` animation takes ~500ms; give the reshuffle time to settle.
    await page.waitForTimeout(700);
    const orderAfter = await page.$$eval("li button", (els) => els.map((el) => el.textContent?.trim()));
    expect(orderAfter).not.toEqual(orderBefore);
    expect([...orderAfter].sort()).toEqual([...orderBefore].sort());
  });

  test.describe("reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("renders the same tool names as a static list with zero console errors", async ({ page }) => {
      const problems = watch(page);
      await page.goto("/story", { waitUntil: "load" });
      for (const tool of story.skills) {
        await expect(page.getByText(tool, { exact: true })).toBeVisible();
      }
      await expect(page.locator("li button")).toHaveCount(0);
      expect(problems).toEqual([]);
    });
  });
});

test("an unknown route returns the 404 page with a 404 status", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist", { waitUntil: "load" });
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).not.toBeEmpty();
});
