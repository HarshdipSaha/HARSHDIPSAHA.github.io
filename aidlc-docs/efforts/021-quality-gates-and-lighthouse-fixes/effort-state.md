# Effort 021 — PR quality gates (smoke + Lighthouse CI) and the defects they found

| Field | Value |
|-------|-------|
| Ref | 021-quality-gates-and-lighthouse-fixes |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-27 |
| Closed | 2026-08-27 |
| Baseline | effort 020 (branch `extremechange`) |
| ADRs | 0012 — PR quality gates: browser smoke test and Lighthouse CI |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Owner, after effort 020: "is there some official Lighthouse GitHub integration we can add as a check
(gate), like the aidlc-check that runs on each PR? Also something like a frontend check — nothing breaks."
Plus two new live reports for `/` (mobile, desktop) in `H:\mywebsite\rports\`: accessibility 96 and
**agentic-browsing 50** on both, performance 77 (mobile) / 99 (desktop).

Two deliverables: (1) the gates, from official tooling only — Google's Lighthouse CI (`@lhci/cli`) and
Microsoft's Playwright test runner; (2) fix what the new reports and the gates themselves surfaced, without
lowering any other category.

## Stages

| Stage | Outcome |
|-------|---------|
| Planning | Parsed the two new report JSONs: both failures trace to one root cause — `aria-label` on `<p>`/`<span>` in `TextAnimate` and `ScrollWords` (axe `aria-prohibited-attr`), which also malforms the accessibility tree that the agentic-browsing category checks. Chose `@lhci/cli` (GoogleChrome/lighthouse-ci) over third-party wrappers; Playwright `@playwright/test` for the smoke gate; `serve` so both run against the export the way Pages hosts it. |
| Build gates | `quality-gates.yml` (Build → Smoke, Lighthouse desktop, Lighthouse mobile), `lighthouserc.desktop.json` / `.mobile.json`, `playwright.config.ts`, `tests/smoke.spec.ts`, npm scripts, `.gitignore`. |
| First local run | Smoke: 56/56 pass. Lighthouse desktop **failed** — and found what the owner's two reports could not: `/process` mono text at 45 % (3.86:1), `/projects/atomnet` date at 50 % (4.45:1), `/projects` heading order h1→h3, and home LCP 2.6 s. |
| Fix | ARIA: visually-hidden `sr-only` copy replaces `aria-label` in both split-text components. Contrast: process mono → 55 %, project date → 55 %, Experience date 50 → 55 %, project-card year 40 → 55 %, image-less card initial 30 → 45 %. Heading order: `ProjectGrid` gains `headingLevel`; `/projects` passes `h2`. LCP: `TextAnimate trigger="mount"` now renders CSS-animated words (`.word-in`, same curve/values) so the hero starts at first paint instead of after hydration — the LCP element's render delay was 95 % of a 2.6 s LCP. `siteUrl` corrected from `harshdipsaha.github.io` to `harshdipsaha.tech` (canonical, sitemap, robots, OG). |
| Second local run | All 12 route×preset assertions pass (table below). |
| Docs | ADR 0012; AGENTS.md (commands, CI list, DoD item 3, split-text ARIA rule, `.label` 55 %, live URL); CONTEXT.md (Label 55 %, Quality gates / Smoke test / Threshold rows); PR template; `/process` copy (Verify step, stats, decision 0012, pills). |

## Units of work

- [x] `.github/workflows/quality-gates.yml` — Build (typecheck + export → `out/` artifact) → Smoke (Playwright, desktop + Pixel 7) + Lighthouse (matrix desktop/mobile); reports as artifacts
- [x] `lighthouserc.desktop.json`, `lighthouserc.mobile.json` — six routes × 3 runs, median-run; floors a11y/BP/SEO 1.0, perf 0.9 desktop / 0.7 mobile
- [x] `playwright.config.ts`, `tests/smoke.spec.ts` — routes discovered from `out/`; 200 + `<h1>` + link home + full scroll + zero console/page/network errors; reduced-motion pass on `/`; unknown URL → 404 status
- [x] `package.json` — `test:smoke`, `lighthouse:desktop`, `lighthouse:mobile`; devDeps `@lhci/cli@0.15.1`, `@playwright/test@1.62.1`, `serve@14.2.6`
- [x] `src/components/motion/TextAnimate.tsx` — `sr-only` copy instead of `aria-label`; `trigger="mount"` is CSS-driven (`.word-in`), `trigger="view"` keeps Motion
- [x] `src/components/motion/ScrollWords.tsx` — `sr-only` copy instead of `aria-label`
- [x] `src/app/globals.css` — `@keyframes word-in` + `.word-in` with reduced-motion override
- [x] `src/app/process/page.tsx` — mono text 45 → 55 %; pills "All 12 decisions", "All 22 change records"
- [x] `src/app/projects/[slug]/page.tsx` — date 50 → 55 %
- [x] `src/components/ProjectGrid.tsx` — `headingLevel` prop; year 40 → 55 %; placeholder initial 30 → 45 %
- [x] `src/app/projects/page.tsx` — `headingLevel="h2"`
- [x] `src/components/home/Experience.tsx` — date 50 → 55 %
- [x] `src/content/site.ts` — `siteUrl` → `https://harshdipsaha.tech`; process stats (22 / 12 / 2 / 3 gates), Verify step, decision 0012
- [x] `docs/adr/0012-pr-quality-gates-smoke-and-lighthouse.md` + README row
- [x] `AGENTS.md`, `CONTEXT.md`, `.github/pull_request_template.md`, `.gitignore`

## Verification

Local, against the final `out/`, `serve`, Lighthouse 12.6.1 via `@lhci/cli` 0.15.1, median of 3:

| Route | Desktop perf / a11y / BP / SEO | Mobile perf / a11y / BP / SEO |
|---|---|---|
| `/` | **0.99** (was 0.84) / 1 / 1 / 1 | **0.82** (was 0.59) / 1 / 1 / 1 |
| `/story` | 1 / 1 / 1 / 1 | 0.94 / 1 / 1 / 1 |
| `/projects` | 1 / **1** (was 0.98) / 1 / 1 | 0.78 / 1 / 1 / 1 |
| `/projects/atomnet` | 1 / **1** (was 0.96) / 1 / 1 | 0.89 / 1 / 1 / 1 |
| `/process` | 1 / **1** (was 0.96) / 1 / 1 | 0.85 / 1 / 1 / 1 |
| `/gallery` | 0.99 / 1 / 1 / 1 | 0.86 / 1 / 1 / 1 |

| Check | Result |
|---|---|
| Home desktop LCP | 2.6 s (render delay 2.47 s, 95 %) → **0.8 s**; TBT 120 → 50 ms |
| Home mobile LCP | 9.7 s → 3.5 s; TBT 540 → 390 ms |
| `aria-label` on `<p>`/`<span>` in `out/index.html` | 5 → 0; six `sr-only` copies present |
| `/projects` heading levels | h1 ×1, h2 ×20 (was h1 → h3) |
| Canonical / sitemap / robots host | `harshdipsaha.github.io` → `harshdipsaha.tech` |
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 static pages |
| `npm run test:smoke` | 56 passed (25 routes × 2 profiles + route-set, reduced-motion, 404) |
| `npm run lighthouse:desktop` / `:mobile` | "All results processed!" — both pass |
| `npm run check:aidlc` | OK |

## Notes

- Lighthouse audits a local `serve`, so host effects (Pages `Cache-Control`, CDN, HTTP/2) differ from the
  live report. The floors protect what the repo controls. Mobile floor 0.7 sits under the measured 0.78–0.94
  on purpose: CI runners are noisy under 4× CPU emulation.
- Mobile home is still the weakest page (0.82): TBT 390 ms from the Motion/Lenis/brain-sequence bundle
  (`444agm…js` 2.4 s CPU under emulation) and an LCP of 3.5 s on the subline, whose entrance is
  deliberately delayed 1.1 s. Trimming that delay or code-splitting the below-fold motion would lift it;
  both change the pinned feel, so left for the owner.
- The gates are status checks, not required checks. Making them required is a one-line branch-protection
  change the owner can make; it also restricts who can push to `main`.
- Effort 022 (résumé + gallery) ran in parallel in a worktree and was merged into this branch.
