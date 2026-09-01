# Site improvement ideas — 2026-09-01

Ideation pass over the whole site (brainstorming skill, owner-requested). Each idea carries what
it is, why it's worth doing, and exactly how to implement it in this repo. Ordered by
impact-per-effort, not by category. Ideas the owner green-lights become numbered efforts; nothing
here is committed work yet.

Current state for reference: accessibility/SEO/best-practices 100 everywhere (gated), desktop
perf 99–100, mobile home perf ~0.82, four PR gates, 30 efforts, 15 ADRs.

---

## 1. Official tech logos on the /story Tools pills

**What.** The old site (commit `7eba8fd`, the `/about` era) showed brand icons — Python, PyTorch,
OpenCV — next to each tool name via the Once-UI icon set. The rebuild dropped them; today's
interactive Tools pills are text + a colored dot. Bring the real logos back inside the pills.

**Why.** Logos are scanned faster than words. A recruiter skimming /story recognises the PyTorch
flame and the OpenCV mark before reading a single label. The owner has asked for this directly.

**How.**
1. `npm i -D simple-icons` (v16.29.0 — MIT-licensed package of official brand SVGs; the marks
   themselves remain each brand's property, which is fine for referencing the tech you use).
2. New build-time module `src/lib/tool-icons.ts`: a map from `story.skills` names to
   `simple-icons` slugs — `Python→siPython`, `C++→siCplusplus`, `PyTorch→siPytorch`,
   `TensorFlow→siTensorflow`, `scikit-learn→siScikitlearn`, `OpenCV→siOpencv`, `Pandas→siPandas`,
   `Docker→siDocker`, `Git→siGit`, `Hugging Face→siHuggingface`, `LangChain→siLangchain`,
   `TypeScript→siTypescript`, `GCP→siGooglecloud`. Import only the named icons (each is a small
   `{path, hex}` object) so the bundle grows by ~1–2 KB, not the whole icon set.
3. In `ToolkitToy.tsx`: render `<svg viewBox="0 0 24 24" className="size-3.5 fill-current"><path d={icon.path}/></svg>`
   before the label, `fill-current` so it inherits `text-paper/85` (single-color icons match the
   site's no-ad-hoc-hex rule; do NOT use each brand's hex — 17 clashing brand colors would fight
   the ink/paper/tangerine palette).
4. **Fallback is mandatory:** `MONAI`, generic `SQL`, `MATLAB` (removed from simple-icons on
   trademark grounds) and possibly `AWS` (same) have no icon. Keep the existing colored dot for
   those. Verify each slug against the installed version at implement time — availability is the
   one uncertain fact here.
5. Same treatment in the reduced-motion static list. Smoke test already asserts names as DOM
   text; add an assertion that at least N pills contain an `svg`.

**Cost.** Half a day. **Risk.** Low — additive, reduced-motion path unchanged, ~2 KB.

---

## 2. Compute the /process stats from the repo at build time

**What.** The four numbers on /process ("29 changes", "15 decisions"...) and the two pill labels
are hardcoded in `site.ts` — they've drifted three times already and been fixed by hand in
efforts 021, 029/030, and the parallel-merge reconciliations.

**Why.** A page whose whole pitch is "the record can't drift" should not have hand-maintained
counts. This kills a recurring class of bug permanently.

**How.**
1. New script `scripts/build-process-stats.mjs`, run on `predev`/`prebuild` beside the other two
   generators: count `aidlc-docs/efforts/*/` dirs, `docs/adr/[0-9]*.md` files, grep the ADR
   README for `Superseded`, count workflow files with a `pull_request` trigger.
2. Write `src/data/process-stats.json` (committed, like `images.json`, so `tsc` works on a fresh
   clone). Page reads counts from it; `site.ts` keeps only the label templates
   (`"changes recorded, numbered 001–{n}"`).
3. Guard in the script: fail the build if any count went *down* (catches a deleted effort dir).
4. Update `AGENTS.md` boundaries table (one more generated-manifest row).

**Cost.** Half a day. **Risk.** Low. Removes work rather than adding it.

---

## 3. "Verified" badge on every project page, fed by the factuality gate

**What.** Each case study page gets one quiet line under its header: `✓ 21 claims checked
against the source repository · 3 verified by certificate` (real counts, per project), linking to
the eval code. Private-source projects say what's actually true: `Source repository is private —
claims stated as written`.

**Why.** The factuality gate is the single most unusual thing this site has, and right now it's
invisible on the pages it protects. This makes every project page carry its own proof. No other
portfolio does this.

**How.**
1. The eval already writes `.evals/factuality-report.json` with per-file verdicts. Add a
   `--write-summary src/data/factuality.json` flag to `evals/factuality/run.mjs` emitting
   `{slug: {grounded, baselined, unverifiable}}` (committed manifest, same pattern as ideas 2).
2. CI's `Evals / factuality` job regenerates it; a stale-manifest diff check fails the PR if the
   committed copy doesn't match (same shape as `check-aidlc-sync`).
3. `src/app/projects/[slug]/page.tsx`: render the line from the manifest under the date. `.label`
   sizing, `text-paper/55`, links to `evals/factuality/` on GitHub.
4. Copy is per-state: grounded-only / grounded+baselined / private-source. No green shields, no
   drama — one sentence.

**Cost.** One day. **Risk.** Medium-low — touches the eval CLI, needs the stale-check to avoid
drift; the payoff is the site's best differentiator becoming visible.

---

## 4. Mobile home performance: 0.82 → 0.9+, then raise the CI floor

**What.** The one score still below green-solid. Known levers, never pulled because they touch
pinned animations — but all three below preserve the visuals exactly.

**How.**
1. `next/dynamic` the below-fold home sections (`CardStack`, `MatrixRibbon`, `Experience`,
   `ProjectGrid`) with `ssr: true` — markup stays prerendered, their JS leaves the critical
   bundle. TBT (390 ms) is the target.
2. Lazy-init Lenis on first scroll intent (`wheel`/`touchstart`, once) instead of on hydration.
3. Trim the subline entrance delay 1.1 s → 0.5 s in `Hero.tsx` — LCP is that subline; this is
   copy-timing, not a visual change anyone will name.
4. Measure with `npm run lighthouse:mobile` before/after; if home lands ≥ 0.9 across 3 medians,
   raise `lighthouserc.mobile.json`'s floor 0.7 → 0.85 in the same PR so the win is locked in.

**Cost.** One day incl. measurement. **Risk.** Medium — touches motion wiring; the smoke suite's
zero-console-error rule and reduced-motion tests are the safety net.

---

## 5. `/writing` route for the three orphaned posts

**What.** `content/writing/*.mdx` holds three real posts that no route renders. Publish them.

**Why.** Written thinking is the highest-signal content a research-flavoured portfolio can have,
and it's already written. Also unlocks an RSS feed later.

**How.**
1. `src/app/writing/page.tsx` (list) + `src/app/writing/[slug]/page.tsx` (post) — copy the
   projects-route pattern: `gray-matter` + `next-mdx-remote/rsc`, `.prose` body, same header
   idiom. New `src/lib/writing.ts` mirroring `projects.ts`.
2. Add `{ label: "Writing", href: "/writing" }` to `nav` in `site.ts` — Nav, Footer and sitemap
   all follow automatically (that's the existing one-array rule).
3. Smoke suite picks the new routes up automatically (it walks `out/`). Lighthouse configs: add
   `/writing` to both route lists.
4. Read all three posts first — they predate the rebuild; anything stale gets a dated editor's
   note, not a silent rewrite.

**Cost.** One day. **Risk.** Low — but it's a content decision too; owner should skim the posts
before they go live.

---

## 6. Per-project Open Graph images

**What.** Sharing a project link on LinkedIn/X/WhatsApp today unfurls with the generic
`og.jpg`. Generate one card per project at build: title + one stat, ink background, tangerine
accent, Instrument Serif italic.

**How.**
1. `satori` + `sharp` (already a dep) in `scripts/build-og-images.mjs`, same `prebuild` hook and
   caching pattern as `build-images.mjs`. Writes `public/img/og/<slug>.png` (gitignored).
2. Card layout: 1200×630, `--color-ink` ground, title in the display face, the project's one
   headline number if the frontmatter has one, `harshdipsaha.tech` bottom-left.
3. `generateMetadata` in `[slug]/page.tsx`: point `openGraph.images` at the per-slug card
   (falls back to the banner image today — keep that as the fallback for projects without one).
4. Verify with an unfurl debugger after deploy (opengraph.xyz) on 2–3 slugs.

**Cost.** One day (satori font wiring is the fiddly part — needs the .ttf files, not the Google
Fonts CSS). **Risk.** Low.

---

## 7. Real `lastmod` in the sitemap

**What.** `sitemap.ts` stamps `new Date()` on every URL every build — every deploy tells Google
"everything changed today", which is noise and mildly hurts crawl trust.

**How.** In `sitemap.ts` (or a tiny prebuild manifest, since `output: "export"` runs it at build
anyway): per project use `publishedAt` (already in frontmatter); per static route use
`git log -1 --format=%cI -- <page file>` gathered by a prebuild script into a small JSON. Fall
back to build date only for genuinely new files.

**Cost.** Two hours. **Risk.** None.

---

## 8. Gallery captions + alt text (needs the owner)

**What.** All 15 photos are `alt="Photograph N"` — the one flagged accessibility item left, and
a missed storytelling surface (where was the MICCAI photo taken?).

**How.** Extend the gallery manifest flow: a `gallery/captions.json` drop-zone file
(`{"01": "MICCAI 2025, Daejeon — after the oral"}`), merged by `build-images.mjs` into
`images.json`; `Gallery.tsx` renders caption in the lightbox and as `alt`. Blocker: **only the
owner can write the 15 captions** — the pipeline is an hour of work once the words exist.

**Cost.** One hour + owner's captions. **Risk.** None.

---

## 9. ⌘K command palette over projects, ADRs and efforts

**What.** Power-user search: press ⌘K anywhere, type "brats", jump to the case study, the ADR, or
the effort record.

**How.** `pagefind` (static search index, no server — fits `output: "export"`): run it over
`out/` in `postbuild`, load its JS lazily only when the palette opens (zero cost to LCP/TBT), a
small `CommandPalette.tsx` in the existing glass/pill idiom, `⌘K`/`ctrl+K` listener in `Nav`.
Index `/projects/*`, `/writing/*` (idea 5) — ADR/effort *files* aren't pages, so either link out
to GitHub results or skip them in v1.

**Cost.** One–two days. **Risk.** Medium — new interactive surface; must stay out of the initial
bundle or idea 4's win is undone. Do after 4, never before.

---

## 10. Portrait-first brain sequence on phones

**What.** The home brain section is a landscape design squeezed onto portrait: canvas at 63 %
width leaves the copy cramped. Weakest mobile moment on the site.

**How.** In `BrainSequence.tsx`, branch on `orientation: portrait` (CSS, not JS, where possible):
canvas full-width on top, stage copy below it, stages as horizontally-swipeable chips instead of
stacked overlays. Same frames, same scrub logic, different composition. Screenshot at 390×844
against today's as the review artefact.

**Cost.** Two days — the component is the most intricate on the site. **Risk.** Medium-high;
prototype on a branch with screenshots before committing to it (the #28 debate pattern worked;
reuse it).

---

## Considered and rejected

- **Light theme.** The one-dark-world look is pinned by ADR 0011; a theme toggle doubles every
  contrast obligation for zero stated demand.
- **Brand-colored tech icons (idea 1 variant).** 17 brand hexes vs. a three-color palette —
  loses. Monochrome `fill-current` only.
- **Blog comments / analytics scripts.** Third-party JS would show up as console noise and
  third-party requests in the smoke gate and TBT in Lighthouse. The gates are the reason to say
  no; that's them working.
- **PDF résumé inline viewer.** `<embed>` PDFs are an accessibility dead zone; the link is fine.

## Needs the owner (blocking specific ideas)

| Input | Unblocks |
|---|---|
| 15 photo captions (one line each: where/when) | Idea 8 |
| Skim/approve the three old posts | Idea 5 |
| "3rd of **N** teams" for BraTS, MICCAI talk video link, INCAM slides | Long-standing case-study gaps |
| Cloudflare bot toggle (issue #25) | Already documented in ADR 0015, still un-flipped |

## Suggested order

1 → 2 → 3 (each small, each visible) → 4 (perf, then raise the floor) → 6 → 7 → 5 → 8 (when
captions arrive) → 9 → 10. Every one lands as its own numbered effort through the normal gates.
