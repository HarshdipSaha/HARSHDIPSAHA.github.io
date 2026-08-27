# Effort 020 — Accessibility AA pass: label and footer contrast, logo accessible name

| Field | Value |
|-------|-------|
| Ref | 020-accessibility-aa-pass |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-27 |
| Closed | 2026-08-27 |
| Baseline | effort 019 (branch `extremechange`) |
| ADRs | none — refinement within ADR 0011; no visual world or IA change |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Owner ran Lighthouse against the live site (`harshdipsaha.tech/story`, four runs) and asked to raise
the scores without lowering any other category. The reports were read out of
`H:\mywebsite\rports\*.html`.

Scores as reported:

| Run | Form factor | Mode | Perf | A11y | Best-practices | SEO | Agentic-browsing |
|-----|-------------|------|------|------|----------------|-----|------------------|
| 1027 | mobile | navigation | 89 | **96** | 100 | 100 | 100 |
| 1029 | desktop | navigation | 100 | **96** | 100 | 100 | 100 |
| 1030 | mobile | snapshot | n/a¹ | **96** | 100 | 100 | 100 |
| 1031 | desktop | snapshot | n/a¹ | **96** | 100 | 100 | 100 |

¹ Snapshot mode does not measure performance metrics; it reports 0 by design, not a real regression.
The timespan report was not uploaded because it was already full marks.

Accessibility was the one category below 100, and identically 96 on **every** run — so the defect is
in shared chrome (footer, nav, the `.label` style), not on `/story` specifically. Fixing it lifts
accessibility on every route. The two failing audits, with the exact nodes from the report JSON:

- **`color-contrast`** — `.label` is `color-mix(… paper 45% …)` = `#767373` on ink `#171519`, measured
  3.86:1 (need 4.5:1). The footer colophon and copyright lines are `text-paper/40` = `#6c6869`,
  measured 3.30:1. Both below AA for text at 13 px.
- **`label-content-name-mismatch`** — the wordmark link had `aria-label="Harshdip Saha — home"` while
  its visible text is "Harshdip Saha"; axe flagged the visible text as not contained in the accessible
  name.

This closes the follow-up recorded in effort 015's notes ("`.label` … below AA … left for a
follow-up because the owner pinned the incumbent look").

## Stages

| Stage | Outcome |
|-------|---------|
| Planning | Parsed the four Lighthouse JSON blobs, isolated the two failing a11y audits and their DOM nodes; confirmed best-practices/SEO/agentic-browsing already 100 and that the fixes are CSS-colour and one attribute only — no JS, markup weight or route change, so performance cannot regress. |
| Fix | Computed the minimum paper-on-ink opacity for 4.5:1 (50 % = 4.46, fails; 55 % = 5.14, passes with margin). Lifted `.label` 45 % → 55 %; footer colophon/copyright `/40` → `/55`; replaced the wordmark `aria-label` with a visually-hidden `, home` suffix so the accessible name is a superset of the visible text. Decorative `.corners` border stays 45 % (not text) and the `aria-hidden` `↗` stays `/40` (exempt). |
| Build & verify | `npm run typecheck` clean; `npm run build` succeeds (30 static pages); grepped the emitted `out/` to confirm each fix landed and that every remaining `text-paper/40` is the `aria-hidden` arrow. |

## Units of work

- [x] `src/app/globals.css` — `.label` colour `color-mix(… paper 45% …)` → `55%` (3.86:1 → 5.14:1)
- [x] `src/components/Footer.tsx` — colophon lines and copyright `text-paper/40` → `text-paper/55` (3.30:1 → 5.14:1)
- [x] `src/components/Nav.tsx` — wordmark: dropped `aria-label`, appended `<span class="sr-only">, home</span>`; " Saha" span `text-paper/45` → `/60` (cosmetic, still large-text AA)

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 static pages, postbuild mirrored 25 prefetch payloads |
| `.label` contrast on ink | 3.86:1 → 5.14:1 (AA pass; AAA for large, AA for normal) |
| Footer colophon/copyright contrast | 3.30:1 → 5.14:1 (AA pass) |
| Wordmark accessible name ⊇ visible text | was "Harshdip Saha — home" vs "Harshdip Saha" (fail) → "Harshdip Saha, home" ⊇ "Harshdip Saha" (pass) |
| Remaining `text-paper/40` in emitted HTML | only the `aria-hidden="true"` `↗` arrow (contrast-exempt) |
| Categories that could regress | none — no JS, bundle, markup-weight, metadata or route change; perf/SEO/best-practices/agentic-browsing untouched |

## Notes

- 55 % (not the minimum-passing 51 %) was chosen for a comfortable margin against sub-pixel
  anti-aliasing at 13 px while keeping the muted look the owner pinned.
- Performance was left alone deliberately. Desktop is already 100; mobile 89's largest remaining
  levers are `cache-insight` (Cache-Control lifetimes — GitHub Pages does not honour custom headers
  or `_headers`, so this is not fixable from the repo) and JS execution from Motion/Lenis (the owner
  pinned the animations). Neither is touched here, so mobile performance holds at 89.
