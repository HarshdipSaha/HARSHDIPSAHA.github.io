import { expect, test, type Page } from "@playwright/test";

/**
 * WebMCP registration gate.
 *
 * Chrome ships `document.modelContext` behind an origin trial (Chrome 149+);
 * without this site's own trial token it is undefined in every real visitor's
 * browser today, including the one running this suite, so there is nothing
 * real to drive. Two claims are testable and both are checked here:
 *
 *  1. With the API absent — every browser today, including the one running the
 *     smoke suite — /projects behaves exactly as before: no console error, no
 *     page error, no failed request, no extra DOM.
 *  2. With a stub of the API injected on `document`, the page registers exactly
 *     one tool with a valid input schema, its handler returns a string in the
 *     declared shape, and the registration is cleaned up on client-side
 *     navigation away.
 *
 * Testing the browser's own dispatch is not possible and is not attempted.
 */

type StubTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (input: unknown) => Promise<string>;
};

type StubState = {
  active: Map<string, StubTool>;
  registrations: string[];
  unregistrations: string[];
};

declare global {
  interface Window {
    __webmcp: StubState;
  }
}

/** Install a capture-only `document.modelContext` before any page script runs. */
async function stubModelContext(page: Page) {
  await page.addInitScript(() => {
    const state = { active: new Map(), registrations: [], unregistrations: [] } as StubState;
    window.__webmcp = state;
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool(tool: StubTool) {
          state.registrations.push(tool.name);
          state.active.set(tool.name, tool);
        },
        unregisterTool(name: string) {
          state.unregistrations.push(name);
          state.active.delete(name);
        },
      },
    });
  });
}

function readState(page: Page) {
  return page.evaluate(() => ({
    active: [...window.__webmcp.active.keys()],
    registrations: window.__webmcp.registrations,
    unregistrations: window.__webmcp.unregistrations,
  }));
}

test("with no WebMCP support the projects page is inert", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console.error: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));

  await page.goto("/projects", { waitUntil: "load" });
  await expect(page.locator("h1").first()).toBeVisible();

  expect(await page.evaluate(() => "modelContext" in document || "modelContext" in navigator)).toBe(false);
  // The component renders null: the grid is the whole page, as before.
  expect(await page.locator('a[href^="/projects/"]').count()).toBeGreaterThan(0);
  expect(problems).toEqual([]);
});

test("registers exactly one tool with a valid schema", async ({ page }) => {
  await stubModelContext(page);
  await page.goto("/projects", { waitUntil: "load" });

  await expect.poll(async () => (await readState(page)).active).toEqual(["searchProjects"]);

  const tool = await page.evaluate(() => {
    const t = window.__webmcp.active.get("searchProjects")!;
    return { name: t.name, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations };
  });

  expect(tool.name).toBe("searchProjects");
  expect(tool.description.length).toBeGreaterThan(20);
  expect(tool.annotations).toEqual({ readOnlyHint: true, consequentialHint: false });

  const schema = tool.inputSchema;
  expect(schema.type).toBe("object");
  expect(typeof schema.properties).toBe("object");
  expect(Array.isArray(schema.required)).toBe(true);
  // Every declared required key must exist in properties, or an agent cannot satisfy it.
  for (const key of schema.required as string[]) {
    expect(Object.keys(schema.properties as object)).toContain(key);
  }
  expect(Object.keys(schema.properties as object).sort()).toEqual(["limit", "query"]);
});

test("the handler answers a query with a plain string, per Chrome's shipped execute contract", async ({ page }) => {
  await stubModelContext(page);
  await page.goto("/projects", { waitUntil: "load" });
  await expect.poll(async () => (await readState(page)).active).toEqual(["searchProjects"]);

  const onPage = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/projects/"]')].map((a) => (a as HTMLAnchorElement).getAttribute("href")),
  );

  const text = await page.evaluate(async () => {
    const t = window.__webmcp.active.get("searchProjects")!;
    return t.execute({ query: "brain", limit: 3 });
  });

  expect(typeof text).toBe("string");
  const lines = text.split("\n");
  expect(lines.length).toBeGreaterThan(0);
  expect(lines.length).toBeLessThanOrEqual(3);
  for (const line of lines) {
    expect(line.toLowerCase()).toContain("brain");
    // Every matched project's case-study URL is one the page actually renders.
    const url = new URL(line.match(/https?:\/\/\S+$/)![0]);
    expect(onPage).toContain(url.pathname);
  }

  const noMatch = await page.evaluate(async () => {
    const t = window.__webmcp.active.get("searchProjects")!;
    return t.execute({ query: "zzz-no-such-project-zzz", limit: 5 });
  });
  expect(noMatch).toBe('No projects match "zzz-no-such-project-zzz".');

  const allText = await page.evaluate(async () => {
    const t = window.__webmcp.active.get("searchProjects")!;
    return t.execute({ query: "", limit: 50 });
  });
  expect(allText.split("\n").length).toBe(new Set(onPage).size);
});

test("navigating away and back leaves exactly one registration", async ({ page }) => {
  await stubModelContext(page);
  await page.goto("/projects", { waitUntil: "load" });
  await expect.poll(async () => (await readState(page)).active).toEqual(["searchProjects"]);

  // Footer links are present at every viewport; clicking one is a client-side
  // navigation, so the stub's state survives (a full reload would reset it).
  await page.locator('a[href="/story"]').last().click();
  await expect(page).toHaveURL(/\/story$/);
  await expect.poll(async () => (await readState(page)).active).toEqual([]);

  await page.locator('a[href="/projects"]').last().click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect.poll(async () => (await readState(page)).active).toEqual(["searchProjects"]);

  const state = await readState(page);
  expect(state.registrations).toEqual(["searchProjects", "searchProjects"]);
  expect(state.unregistrations).toEqual(["searchProjects"]);
  expect(state.active).toHaveLength(1);
});
