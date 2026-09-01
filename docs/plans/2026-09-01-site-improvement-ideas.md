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

## 11. Research interests as styled pills, not one muted line

**What.** On `/story` today, Interests renders as a single joined text line
(`story.interests.join(" · ")` at `text-paper/75`) — eight topics including "LLM safety &
alignment" compressed into something the eye slides straight past. The pre-rebuild site had a
dedicated `ResearchInterestsBlock` (commit `7eba8fd`): each interest as its own colored pill
(cyan/amber/coral/emerald/violet rotation), scannable at a glance.

**Why.** For a research-flavoured portfolio, the interests are a first-class signal for a PI
deciding whether to reply to an email. Right now they're the most under-dressed section on the
page. Owner has asked for this directly.

**How.**
1. Render `story.interests` as pills using the existing `.glass`/`.hairline` rounded-full idiom
   the Tools section already established — same shape, so the page reads as one system.
2. Color: do NOT resurrect the old five-hue rotation — the current palette rule is
   ink/paper/tangerine with sunny/seafoam/cerulean for tiny marks only. Use the ToolkitToy dot
   pattern: a small accent dot per pill cycling those three mark tokens, text stays `paper/85`.
3. One consideration against interactivity: the Tools toy sits directly above. Two consecutive
   interactive pill clusters would read as repetition — keep Interests static pills, visually
   quieter (no border? smaller?) so hierarchy holds: Tools = toy, Interests = tags.
4. Data is already in `site.ts`; zero content work.

**Cost.** Two hours. **Risk.** Low.

---

## 12. Say each achievement once — kill the /story duplication

**What.** `story.more[1]` (site.ts line ~150) narrates "1000+ solved problems … All India Rank 14
in the BRAINDEAD data-science competition, and a top-30 finish among 150+ teams at the AI4Humanity
Summit. I'm open to software-engineering and research internships." Directly below on the same
page, the Achievements list states AIR-14 and the top-30 again as linked entries — and "open to
internships" appears a third time in the home page's closing CTA. Same page, same facts, twice.

**Why.** The site's own copy rule (effort 015 era) was "say each thing once." A reader hits the
same two ranks eleven lines apart; repetition reads as padding and dilutes both mentions.

**How.**
1. Rewrite `story.more[1]` to carry only what the Achievements list does NOT: the 1000+ problems
   line and the LeetCode/GeeksforGeeks context can stay (they're not achievement entries), the
   AIR-14 and top-30 sentences go, and the "open to internships" sentence goes (the closing CTA
   owns it).
2. The factuality gate doesn't cover `site.ts`, but the numbers being removed here are the
   *duplicates* — the canonical, linked statements in `achievements` stay untouched.
3. Verify with a grep: `AIR 14|Rank 14` and `top-30|Top 30` should each appear exactly once in
   `site.ts` after the edit.

**Cost.** Half an hour. Pure copy edit, `[trivial]`-adjacent but gets a minimal effort record
since it deletes sentences. **Risk.** None.

---

## 13. Education as a journey, not two rows

**What.** Education on `/story` is currently two plain rows (NSUT, KV No. 2). The pre-rebuild
site rendered it as a `journey-timeline`: a vertical line with a dot per institution, each entry
carrying its own name/detail block — school → university reading as a path, not a table.

**Why.** A two-entry list is the least a section can do. The journey framing matches the page's
name — Story — and gives the section room to grow (Amazon ML Summer School, future MS) without
redesign. Owner has asked for this directly.

**How.**
1. Extend `story.education` entries with a `when` field (`"2009 – 2023"`, `"2023 – 2027
   (expected)"`) — data-only change, content already known.
2. Render as a vertical timeline in the existing design language: a `border-l border-white/10`
   line, a `size-2 rounded-full bg-tangerine` dot per entry (the GatePipeline already established
   this exact dot idiom on /process), name in `text-paper` medium, detail in `paper/60`, `when` in
   the mono `.label` style. No new component library — ~20 lines of JSX in `story/page.tsx`.
3. Order: earliest at top (a journey runs forward) or latest at top (résumé convention)? Take
   latest-first to match the Experience section above it — consistency inside the page wins.
4. Reduced motion: it's static markup already; the `Reveal` wrapper handles entrance like every
   other section.

**Cost.** Half a day. **Risk.** Low.

---

## 14. Restore the publication image — it's still in git

**What.** The Publication card on `/story` is text-only. The pre-rebuild site showed a photo with
it (`/images/publications/miccai.jpg` — the MICCAI moment). The rebuild dropped the image, but
**the file is still recoverable from git history**: `git show 7eba8fd:public/images/publications/miccai.jpg`
(415,657 bytes) — no one needs to hunt for the original.

**Why.** The publication is the site's single strongest fact, and it's the only card on /story
with no visual anchor. A real photo from the venue does what no layout trick can.

**How.**
1. `git show 7eba8fd:public/images/publications/miccai.jpg > project_images/miccai-publication.jpg`
   — recover into the existing drop-zone, add a `PROJECT_MAP` entry
   (`"miccai-publication.jpg": "miccai-publication"`), and let `build-images.mjs` publish it as a
   properly sized WebP like every other image (never hand-copy into `public/` — that's the
   boundary rule).
2. Render it in the Publication section: small, right of the text on desktop (`md:grid-cols-[1fr_200px]`),
   above it on mobile, `rounded-2xl border border-white/10` matching the project-card frame.
3. Real `alt` text describing the actual photo (owner confirms what it shows — one line).
4. Check the gallery for overlap first: if the same MICCAI photo is already one of the 15 gallery
   images, reuse that manifest entry instead of adding a duplicate file.

**Cost.** Two hours. **Risk.** None — additive, image pipeline already handles sizing.

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
| One line of alt text for the recovered MICCAI photo (what does it show?) | Idea 14, fully |
| "3rd of **N** teams" for BraTS, MICCAI talk video link, INCAM slides | Long-standing case-study gaps |
| Cloudflare bot toggle (issue #25) | Already documented in ADR 0015, still un-flipped |

## Suggested order

**First wave — the /story polish set (11 → 12 → 13 → 14 → 1):** five small changes, all on one
page, shippable as a single effort/PR with one before/after screenshot review. Interests pills,
the duplication cut, the education journey, the recovered publication photo, and the tool logos
together turn /story from "good bones" into the strongest page on the site.

**Then:** 2 → 3 (small, each visible) → 4 (perf, then raise the floor) → 6 → 7 → 5 → 8 (when
captions arrive) → 9 → 10. Every one lands as its own numbered effort through the normal gates.
