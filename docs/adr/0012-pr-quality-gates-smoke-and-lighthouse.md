# 0012 — PR quality gates: browser smoke test and Lighthouse CI

**Status:** Accepted · **Date:** 2026-08-27 · **Supersedes:** —

## Context

Until now the only automated check on a pull request was `aidlc-check` (ADR 0009), which
verifies that a change ships with its record. Whether the change *works* was left to the
author: `npm run typecheck` and `npm run build` in the Definition of done, plus whatever
manual browsing happened. A green build is a weak signal for this site — the export can
succeed while a page throws at runtime (Motion's `useScroll` ranges outside `[0, 1]` throw
only when scrolled), while a prefetch payload 404s, or while an accessibility regression
lands in shared chrome.

That last one happened. The owner ran Lighthouse on the live site on 2026-08-27 and found
accessibility at 96 on every route (`.label` contrast 3.86:1, footer text 3.30:1, a wordmark
`aria-label` that did not contain the visible text) and, on the home page, `aria-label` on
`<p>`/`<span>` elements — prohibited ARIA that also scored the agentic-browsing category at
50. None of it was caught before deploy because nothing was looking. Efforts 020 and 021
fixed the defects; this ADR makes sure the next ones are caught before merge.

## Decision

1. **A second workflow, `.github/workflows/quality-gates.yml`, runs on every PR to `main`**
   alongside `aidlc-check`. It builds once and fans out into three jobs, each a separate
   status check:

   - **Build** — `npm ci`, `npm run typecheck`, `npm run build`; uploads `out/` as an
     artifact so the other jobs test exactly the files that would deploy.
   - **Smoke (Playwright)** — `tests/smoke.spec.ts` discovers every prerendered route from
     `out/` and, on desktop Chrome and a Pixel 7 profile, asserts: HTTP 200, a visible
     `<h1>`, a link home, a full scroll-through, and **zero** console errors, page errors or
     failed requests. It also checks the reduced-motion fallbacks on `/` and that an unknown
     URL returns the 404 page *with a 404 status*. New pages are covered the moment they exist.
   - **Lighthouse (desktop, mobile)** — Google's Lighthouse CI (`@lhci/cli`, the official
     `GoogleChrome/lighthouse-ci` package) audits six representative routes three times each
     and asserts on the **median run**. Thresholds are in `lighthouserc.desktop.json` and
     `lighthouserc.mobile.json`.

2. **Thresholds are floors that hold today's scores, not aspirations.** Accessibility,
   best-practices and SEO must be **1.0** on both presets — they are 100 today and there is no
   reason to allow a drop. Performance is **≥ 0.9 on desktop** (100 today) and **≥ 0.7 on
   mobile** (77–89 today; CI runners are noisy under mobile emulation, so the floor sits below
   the measured range to fail only on real regressions). Raising a floor is a `[trivial]` edit;
   lowering one needs an effort record that says why.

3. **The gates test the static export through `serve`,** not `next dev`: clean URLs
   (`/story` → `story.html`) and a real 404 status are what GitHub Pages does, and it is what
   the tests should see. `serve` is pinned as a devDependency for that reason.

4. **Reports stay in the repo's Actions artifacts** (`.lighthouseci/<preset>/`, the Playwright
   HTML report on failure) rather than Lighthouse CI's temporary public storage. The site is
   public, but there is no need to publish audit reports to a third party to read them.

5. **Local parity.** `npm run test:smoke`, `npm run lighthouse:desktop` and
   `npm run lighthouse:mobile` run the same gates against a local `out/`. The Definition of
   done in `AGENTS.md` adds the smoke test.

## Consequences

- A PR now needs five green checks: `aidlc-check`, Build, Smoke, Lighthouse (desktop),
  Lighthouse (mobile). Roughly six to eight extra minutes of CI per PR; the three test jobs
  run in parallel off one build.
- Category-level thresholds catch *regressions*, not every audit. A change that fails a
  single audit while the category stays at 1.0 (impossible for a11y/SEO/BP, since any failing
  weighted audit lowers the category) or that shaves a few perf points inside the floor will
  pass. That is the intended trade: block real drops, tolerate CI noise.
- The smoke test's "zero console errors" rule is strict on purpose. A third-party script or a
  benign warning-as-error would fail the gate; the fix is to remove the noise, not to
  allow-list it, unless a specific message is documented in the test.
- Lighthouse audits a local server, so host-specific results (GitHub Pages `Cache-Control`,
  CDN latency, the real domain's canonical) are not what the live report shows. The gate
  protects the parts of the score the repo controls.
- These are status checks, not branch protection. Making them *required* is one settings
  change (`gh api -X PUT repos/…/branches/main/protection`); it was left to the owner because
  it also changes who can push to `main`.

## Evidence

- Live Lighthouse reports, 2026-08-27 (`/story` × 4, `/` × 2, mobile and desktop):
  accessibility 96 on all six; agentic-browsing 50 on `/`; every other category 100 or, for
  performance, 77–100.
- Root causes fixed in efforts 020 (`.label` and footer contrast, wordmark name) and 021
  (`aria-label` on `<p>`/`<span>` in `TextAnimate` and `ScrollWords`).
- First local run of the gates against the effort-021 build: see the effort record's
  verification table.
