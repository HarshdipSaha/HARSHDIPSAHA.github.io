# Effort 034 — Tool icons

| Field | Value |
|-------|-------|
| Ref | 034-tool-icons |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Baseline | aidlc-docs/inception/ |
| ADRs | none |
| Commits | pending |
| Reconstructed | no |
| Branch | `feat/tool-icons` |

## Intent

Implement idea 1 from the improvement-ideation document (effort 031, PR #43): bring official
monochrome brand marks back into the `/story` Tools pills. The old site (pre-rebuild, ADR 0011)
showed brand icons — Python, PyTorch, OpenCV — next to each tool name; today's interactive
click/tap-to-reshuffle pills (effort 028) show only text and a coloured dot. Revive the icons
inside the existing pills without duplicating the section or introducing brand colour (palette
rule: ink / paper / tangerine only, plus the three small marks sunny/seafoam/cerulean already used
for the fallback dots).

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | Scoped to `story.skills` (17 tools) against `simple-icons` v16.29.0's named exports; 13 have an official glyph, 4 (MONAI, SQL, MATLAB, AWS) do not and keep the existing coloured dot. |
| Functional design | One new pure module (`src/lib/tool-icons.ts`, name → 24×24 SVG path), one new presentational subcomponent (`ToolMark` in `ToolkitToy.tsx`) used in both the interactive and reduced-motion static pill lists. |
| NFRs | Bundle impact: only 13 named icons imported from `simple-icons` (tree-shakeable ESM), not the ~3,200-icon package — adds ~1–2 KB gzipped. No new brand hex colour; every glyph renders `fill-current` so it inherits the pill's existing text colour in both themes. |
| Code | `tool-icons.ts` added; `ToolkitToy.tsx` renders `ToolMark` before each pill label in both branches (interactive + reduced-motion); the active-pill pulse animation's scale target is reduced from 2× to 1.4× when a glyph is present (a 14px glyph pulsing to 2× would bump the label, unlike the 6px dot). |
| Build & test | `npm run typecheck`, `npm run build`, `npm run test:smoke` (temporary isolated port — see Verification) all green. |

## Units of work

- [x] Unit 1 — `npm i -D simple-icons` (`package.json`, `package-lock.json`)
- [x] Unit 2 — `src/lib/tool-icons.ts`: name → `{path}` map for the 13 `story.skills` entries with
      a simple-icons glyph (Python, C++, PyTorch, TensorFlow, scikit-learn, OpenCV, Pandas, Docker,
      Git, GCP, Hugging Face, LangChain, TypeScript) and `toolIconPath(name)` lookup helper
- [x] Unit 3 — `src/components/story/ToolkitToy.tsx`: new `ToolMark` subcomponent (glyph SVG or
      fallback dot), wired into both the interactive pill list and the reduced-motion static list;
      active-pill pulse scale adjusted per mark type
- [x] Unit 4 — `tests/smoke.spec.ts`: new "pills carry the official brand glyph where one exists,
      the coloured dot otherwise" assertion (interactive list) plus an assertion on the reduced-motion
      static list, both driven by `toolIconPath` (the map), not a hard-coded count

## Verification

All commands run from `H:\mywebsite\wt-034-tool-icons` (branch `feat/tool-icons`).

```
$ npm run typecheck
> harshdipsaha-portfolio@2.0.0 typecheck
> tsc --noEmit -p tsconfig.json
(clean — no output, exit 0)
```

```
$ npm run build
...
✓ Compiled successfully in 1238ms
  Running TypeScript ...
  Finished TypeScript in 6.1s ...
✓ Generating static pages using 11 workers (30/30) in 11.7s
  Finalizing page optimization ...
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /gallery
├ ○ /icon.svg
├ ○ /process
├ ○ /projects
├   /projects/[slug]  (20 project pages)
├ ○ /robots.txt
├ ○ /sitemap.xml
└ ○ /story
> postbuild: segments: mirrored 25 prefetch payload(s) under dotted names
(30 static pages, exit 0)
```

```
$ npm run test:smoke
```
Local runs share Node/serve port 3100 with six sibling agents (efforts 035–040) working in
parallel worktrees; `playwright.config.ts` sets `reuseExistingServer: !process.env.CI`, so a local
run can silently attach to a *different* worktree's server. Verified against this worktree's own
`out/` by running Playwright directly with a temporary, uncommitted local config
(`playwright.local.config.ts`, port 3034 — free at the time, distinct from the 3100/3200/3201/3417
already in use) mirroring `playwright.config.ts` with `reuseExistingServer: false`; deleted after
the run (not part of the diff, confirmed with `git status`).

- Full suite: **78 passed, 2 failed** (2.6 min) — both failures `net::ERR_NETWORK_CHANGED` on
  `/gallery` (desktop) and `/projects/gui-cansat` (mobile), unrelated image-loading resource errors
  under the parallel-agent system load documented as a known flake pattern in effort 033's audit
  row. Re-run of just those two tests in isolation: **4/4 passed** (both projects × both failing
  routes), confirming the flake.
- Every `story Tools toy` test passed on both `desktop` and `mobile` projects, including the two new
  icon assertions:
  - `every tool name is real DOM text`
  - `pills carry the official brand glyph where one exists, the coloured dot otherwise`
  - `clicking a tool measurably reshuffles the order`
  - `reduced motion › renders the same tool names as a static list with zero console errors`

```
$ npm run test:unit
# tests 42
# pass 42
# fail 0
```

```
$ npm run check:aidlc
aidlc-check: OK — substantive changes are accompanied by an aidlc-docs update.
```

Icon coverage confirmed directly against the installed `simple-icons@16.29.0` package: all 13
named exports used in `tool-icons.ts` (`siPython`, `siCplusplus`, `siPytorch`, `siTensorflow`,
`siScikitlearn`, `siOpencv`, `siPandas`, `siDocker`, `siGit`, `siGooglecloud`, `siHuggingface`,
`siLangchain`, `siTypescript`) resolve to a real icon; no `siMonai`, `siSql`, `siMatlab`, or any
`aws`/`amazon`-matching export exists in this version, confirming the 4-tool fallback list (MONAI,
SQL, MATLAB, AWS) is correct, not a guess.

## Notes

- Inherited uncommitted work from an interrupted prior agent session in this same worktree: the
  `simple-icons` dependency, `src/lib/tool-icons.ts`, the `ToolkitToy.tsx` wiring, and the smoke
  test additions were already complete and correct on review — no functional changes were needed,
  only verification. `src/data/images.json` showed as modified in `git status` both before and
  after `npm run build` but `git diff` was empty both times (pure CRLF line-ending noise from the
  image-manifest generator); reverted with `git checkout -- src/data/images.json` each time so it
  is not part of this effort's diff.
- Branch was 1 commit behind `origin/main` (effort 031's ideation doc, PR #43, merged after this
  worktree was created) with no file overlap against this effort's changes; fast-forwarded before
  committing so the PR base is current.
- No ADR: this is a presentational addition to an existing component with no architectural or IA
  decision (no new dependency category, no new route, no palette exception — `simple-icons` is a
  devDependency exactly like the existing `sharp`/`playwright` precedent).
