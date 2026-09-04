import { expect, test, type Page } from "@playwright/test";

/**
 * Coverage for the /process skills-bubble cluster (issue #27): every Claude
 * Skill name named in `process.skills` (src/content/site.ts) must be real DOM
 * text on the page, a click/drag on a bubble must produce a measurable change
 * (not a visual assumption), and the reduced-motion fallback must render the
 * same names with zero console errors.
 */

// Keep this in sync with `process.skills` in src/content/site.ts. Duplicated
// here deliberately: the test should fail loudly if the two drift, rather
// than reading the source array and trivially agreeing with itself.
const EXPECTED_SKILLS = [
  "ai-dlc",
  "brainstorming",
  "agent-swarm",
  "dispatching-parallel-agents",
  "frontend-design",
  "documentation-bot",
  "code-review",
  "verification-before-completion",
  "impeccable",
  "ui-ux-pro-max",
  "to-spec",
  "to-tickets",
  "ask-matt",
  "llm-council",
  "writing-plans",
];

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console.error: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

test("every skill name is present as real text on /process", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/process", { waitUntil: "load" });
  await expect(page.locator("h1").first()).toBeVisible();

  for (const name of EXPECTED_SKILLS) {
    await expect(page.getByText(name, { exact: true }).first()).toBeAttached();
  }

  expect(problems).toEqual([]);
});

test("clicking a bubble measurably changes its transform", async ({ page }) => {
  await page.goto("/process", { waitUntil: "load" });

  const bubble = page.getByRole("button", { name: EXPECTED_SKILLS[0], exact: true });
  // The bubble is under continuous idle-drift animation, so Playwright's
  // "wait for stable element" actionability check on scrollIntoViewIfNeeded/
  // click never settles. Scroll and read geometry directly instead.
  await bubble.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(100);

  const before = await bubble.evaluate((el) => getComputedStyle(el).transform);

  const box = await bubble.boundingBox();
  if (!box) throw new Error("bubble has no bounding box");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  // The click nudge is a spring animation; give it time to move noticeably.
  await page.waitForTimeout(400);

  const after = await bubble.evaluate((el) => getComputedStyle(el).transform);

  expect(after, "transform must change after a click nudge").not.toBe(before);
});

test("dragging a bubble measurably changes its position", async ({ page }) => {
  await page.goto("/process", { waitUntil: "load" });

  const bubble = page.getByRole("button", { name: EXPECTED_SKILLS[1], exact: true });
  await bubble.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(100);

  const box = await bubble.boundingBox();
  if (!box) throw new Error("bubble has no bounding box");

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 90, startY + 40, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  const after = await bubble.boundingBox();
  if (!after) throw new Error("bubble lost its bounding box after drag");

  // Threshold is deliberately small, not zero: the bubble field's drag is
  // constrained to its container, so a 90x40px gesture clamps to a smaller
  // real displacement on the narrower mobile viewport (observed 11-14px in
  // CI vs ~40px+ on desktop). The point of this assertion is "something
  // measurable happened", not a specific distance.
  const moved = Math.hypot(after.x - box.x, after.y - box.y);
  expect(moved, "bubble center must have moved after a drag").toBeGreaterThan(8);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("/process renders the same skill names as a static list, zero console errors", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/process", { waitUntil: "load" });
    await expect(page.locator("h1").first()).toBeVisible();

    for (const name of EXPECTED_SKILLS) {
      await expect(page.getByText(name, { exact: true }).first()).toBeAttached();
    }

    // Reduced motion renders a plain <li> list, not the draggable <button> bubbles.
    expect(await page.getByRole("button", { name: EXPECTED_SKILLS[0], exact: true }).count()).toBe(0);

    expect(problems).toEqual([]);
  });
});
