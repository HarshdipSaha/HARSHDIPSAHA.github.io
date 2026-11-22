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

  // Grab the bubble where it is actually the top element. On the narrow
  // mobile cluster its centre sits under a neighbouring bubble
  // ("dispatching-parallel-agents"), so a centre press dragged that one
  // instead and this test only ever measured idle drift (6.9px in CI, 2026-11-22).
  const grab = await bubble.evaluate((el) => {
    const r = el.getBoundingClientRect();
    for (const fy of [0.5, 0.3, 0.7]) {
      for (const fx of [0.5, 0.25, 0.75, 0.1, 0.9]) {
        const x = r.left + r.width * fx;
        const y = r.top + r.height * fy;
        const hit = document.elementFromPoint(x, y);
        if (hit && el.contains(hit)) return { x, y };
      }
    }
    return null;
  });
  if (!grab) throw new Error("no point on the bubble is uncovered; it cannot be grabbed");

  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 90, grab.y + 40, { steps: 12 });

  // Measure while the pointer is still held. After release the idle drift
  // resumes, so a post-release reading mixes drag with drift.
  const held = await bubble.boundingBox();
  await page.mouse.up();
  if (!held) throw new Error("bubble lost its bounding box during the drag");

  // The bubble follows the pointer (~98px on a 90x40 gesture). dragConstraints
  // can clamp that near the container edge, so the bar is 30px along the
  // gesture: far more than idle drift (<=21px), far less than the full gesture.
  const along = ((held.x - box.x) * 90 + (held.y - box.y) * 40) / Math.hypot(90, 40);
  expect(along, "bubble must follow the drag gesture").toBeGreaterThan(30);
});

test("at rest, no two bubbles overlap and none is clipped by the box", async ({ page }) => {
  await page.goto("/process", { waitUntil: "load" });
  const first = page.getByRole("button", { name: EXPECTED_SKILLS[0], exact: true });
  await first.evaluate((el) => el.scrollIntoView({ block: "center" }));

  // Rest boxes come from offset* (layout position, ignoring the drift
  // transform), so idle drift cannot make this flaky. Before effort 054 a
  // 412px phone had 19 overlapping pairs and one label cut off at the edge.
  await expect
    .poll(
      () =>
        first.evaluate((btn) => {
          const box = btn.parentElement!;
          const rects = [...box.querySelectorAll<HTMLButtonElement>(":scope > button")].map((b) => ({
            name: b.textContent,
            l: b.offsetLeft,
            t: b.offsetTop,
            r: b.offsetLeft + b.offsetWidth,
            b: b.offsetTop + b.offsetHeight,
          }));
          const problems: string[] = [];
          for (const a of rects) {
            if (a.l < 0 || a.t < 0 || a.r > box.clientWidth || a.b > box.clientHeight) problems.push(`clipped: ${a.name}`);
          }
          for (let i = 0; i < rects.length; i++)
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i], b = rects[j];
              if (Math.min(a.r, b.r) > Math.max(a.l, b.l) && Math.min(a.b, b.b) > Math.max(a.t, b.t)) problems.push(`${a.name} × ${b.name}`);
            }
          return problems;
        }),
      { timeout: 5_000 },
    )
    .toEqual([]);
});

test("dropping a dragged bubble does not fire the click nudge", async ({ page }) => {
  await page.goto("/process", { waitUntil: "load" });

  const bubble = page.getByRole("button", { name: EXPECTED_SKILLS[0], exact: true });
  await bubble.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(100);

  const grab = await bubble.evaluate((el) => {
    const r = el.getBoundingClientRect();
    for (const fx of [0.5, 0.25, 0.75, 0.1, 0.9]) {
      const x = r.left + r.width * fx;
      const y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      if (hit && el.contains(hit)) return { x, y };
    }
    return null;
  });
  if (!grab) throw new Error("no point on the bubble is uncovered; it cannot be grabbed");

  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + 60, grab.y + 20, { steps: 10 });
  const held = await bubble.boundingBox();
  await page.mouse.up();
  await page.waitForTimeout(300);
  const dropped = await bubble.boundingBox();
  if (!held || !dropped) throw new Error("bubble lost its bounding box");

  // The nudge kicks 60-130px; idle drift moves at most ~21px in 300ms.
  const jump = Math.hypot(dropped.x - held.x, dropped.y - held.y);
  expect(jump, "a drop must not fling the bubble with the click nudge").toBeLessThan(40);
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
