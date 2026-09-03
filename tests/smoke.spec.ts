import { expect, test, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { story } from "../src/content/site";
import { factualityBadge, factualityCountsFor } from "../src/lib/factuality";
import { getProjects } from "../src/lib/projects";
import { toolIconPath } from "../src/lib/tool-icons";

const TOOLS_WITH_ICON = story.skills.filter((t) => toolIconPath(t) !== undefined);
const TOOLS_WITHOUT_ICON = story.skills.filter((t) => toolIconPath(t) === undefined);

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

  test("pills carry the official brand glyph where one exists, the coloured dot otherwise", async ({ page }) => {
    await page.goto("/story", { waitUntil: "load" });
    // 13 of the 17 tools have a simple-icons glyph; the map is the source of truth, not a magic number.
    expect(TOOLS_WITH_ICON.length).toBeGreaterThanOrEqual(10);
    await expect(page.locator("li button svg")).toHaveCount(TOOLS_WITH_ICON.length);
    for (const tool of TOOLS_WITH_ICON) {
      const pill = page.getByRole("button", { name: tool, exact: true });
      await expect(pill.locator("svg[aria-hidden='true'] path")).toHaveCount(1);
      await expect(pill.locator("svg")).toHaveClass(/fill-current/);
    }
    for (const tool of TOOLS_WITHOUT_ICON) {
      const pill = page.getByRole("button", { name: tool, exact: true });
      await expect(pill.locator("svg")).toHaveCount(0);
      await expect(pill.locator("span.rounded-full[aria-hidden='true']")).toHaveCount(1);
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
      // The static list carries the same glyphs as the interactive one.
      const list = page.getByText(story.skills[0], { exact: true }).locator("xpath=ancestor::ul[1]");
      await expect(list.locator("li svg")).toHaveCount(TOOLS_WITH_ICON.length);
      expect(problems).toEqual([]);
    });
  });
});

test.describe("factuality badge", () => {
  // Real per-project counts from the committed manifest, not invented expectations
  // (effort 036) — a stale manifest would make this test as wrong as the page.
  const projects = getProjects();

  test("a grounded+baselined project states its real counts and links to the eval", async ({ page }) => {
    const p = projects.find((proj) => proj.slug === "atomnet");
    if (!p) test.skip(true, "atomnet case study not found");
    const badge = factualityBadge(Boolean(p!.link), factualityCountsFor(p!.slug));
    if (!badge) test.skip(true, "atomnet has no factuality badge to check");
    await page.goto(`/projects/${p!.slug}`, { waitUntil: "load" });
    const link = page.getByRole("link", { name: badge!.text, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", badge!.href);
  });

  test("a private-source project states that plainly, with no invented count", async ({ page }) => {
    const p = projects.find((proj) => proj.slug === "brainwavesfinland");
    if (!p) test.skip(true, "brainwavesfinland case study not found");
    expect(p!.link).toBeUndefined();
    await page.goto(`/projects/${p!.slug}`, { waitUntil: "load" });
    await expect(page.getByText("Source repository is private — claims stated as written")).toBeVisible();
  });
});

test("an unknown route returns the 404 page with a 404 status", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist", { waitUntil: "load" });
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).not.toBeEmpty();
});
