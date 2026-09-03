# Effort 040 — Publication image

| Field | Value |
|-------|-------|
| Status | complete |
| Depth | standard |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Branch | `feat/publication-image` |

## Intent

Implement idea 14 from the site-improvement ideation doc (effort 031, PR #43,
`docs/plans/2026-09-01-site-improvement-ideas.md`): the Publication card on `/story` has been
text-only since the rebuild (ADR 0011), but the pre-rebuild site showed a photo with it
(`public/images/publications/miccai.jpg` at commit `7eba8fd`). The file is still recoverable
byte-for-byte from git history, so no owner re-supply is needed beyond confirming the alt text.

## Units of work

1. **Recover the file** — `git show 7eba8fd:public/images/publications/miccai.jpg` into
   `project_images/miccai-publication.jpg`. Verified byte-for-byte: 415,657 bytes, SHA-256
   `3ab21306594bd883a6318fbecbf4d607cb7c0e7172a1885ccaa7b7fea10038ae` on both the recovered file
   and the git-history blob.
2. **Wire the drop-zone** — added `"miccai-publication.jpg": "miccai-publication"` to
   `PROJECT_MAP` in `scripts/build-images.mjs` with a comment noting it's not a project, it's the
   `/story` Publication photo. `npm run build`'s `prebuild` step runs `build-images.mjs`, which
   published it as `public/img/projects/miccai-publication.webp` (161,790 bytes; source is
   1200×1600, manifest records the WebP at 750×1000) and regenerated `src/data/images.json` with
   a `projects.miccai-publication` entry — never hand-copied.
3. **Render on `/story`** — `publication.image = "miccai-publication"` in `src/content/site.ts`
   resolves through `projectImages` (from `src/lib/projects.ts`) in `src/app/story/page.tsx`. The
   Publication `<section>` became a `grid gap-8 md:grid-cols-[1fr_200px] md:items-start`: a plain
   `<img>` with `width`/`height` from the manifest, `rounded-2xl border border-white/10` matching
   the project-card frame, `md:order-2` so it sits right of the text on desktop and above it on
   mobile (matching the existing hero-portrait idiom two sections up). Whole section still wrapped
   in the same `<Reveal>` idiom as its neighbours.
4. **Alt text** — read the recovered JPEG directly (not the old alt text, if any existed pre-rebuild
   — there was none to inherit) and wrote a literal description of what's actually in frame: *"The
   MICCAI 2025 photo wall at the Daejeon conference venue: two flower-covered mascots, one pink and
   one yellow, standing on artificial grass in front of a living green wall beneath the conference
   banner."* Verified against the image — matches (MICCAI 2025 banner, Daejeon Korea, plant wall,
   pink and yellow flower mascots on turf). **Owner should still confirm/refine this** — flagged in
   the PR body per idea 14's own instruction ("owner confirms what it shows").
5. **Gallery-overlap check** — compared against all 15 `gallery/*.jpeg` files. No SHA-256 match.
   Four gallery photos share the recovered image's exact dimensions (1200×1600) and are plausibly
   from the same Korea trip, so each was opened and visually confirmed distinct: the Expo Tower lit
   up at night with a MICCAI2025 projection, the Bank of Korea building in the rain, a street-level
   shot of the venue's "MICCAI2025 WELCOME" banner, and a rainy Seoul street. None is the photo-wall
   shot. No duplicate; no gallery entry reused.

This session picked up an interrupted prior run that had already completed units 1–4 in the
worktree (uncommitted). This session verified each against the source of truth (git-history hash,
`PROJECT_MAP`, manifest, rendered HTML, and the image itself), ran unit 5 fresh, then completed
verification and this record.

## Verification

- `npm run typecheck` — clean (`tsc --noEmit -p tsconfig.json`, no output).
- `npm run build` — succeeds. `prebuild` reports `images: 15 gallery, 22 projects, 0 encoded`
  (cache hit on re-run only for unchanged files — `miccai-publication` was encoded on the run that
  produced the current `src/data/images.json`); `next build` compiles 30 static pages including
  `/story`.
- Confirmed in `out/`: `out/img/projects/miccai-publication.webp` exists (161,790 bytes);
  `out/story.html` contains `<img src="/img/projects/miccai-publication.webp" alt="The MICCAI 2025
  photo wall …" width="750" height="1000" loading="lazy" class="aspect-[4/3] w-full rounded-2xl
  border border-white/10 object-cover md:order-2 md:aspect-auto"/>`.
- `npm run test:smoke` — 78/78 passed on the clean re-run. (One run hit a single flaky timeout on
  the unrelated `renders / without errors` desktop case under six-way parallel machine load from
  sibling worktree agents — the same home-page flake documented in efforts 028 and 033's audit
  rows; re-ran in isolation, passed in 18.3s, then re-ran the full suite clean: 78/78.)
- Visual check with Playwright against the built `out/` on `localhost:3100`: at 1400×900 the image
  renders at 200×266px right of the text with the correct rounded/bordered frame; at 390×844 it
  renders full-width above the text. Screenshots reviewed, matched the spec, then deleted (not
  committed — verification artifacts only).

## Notes

- No ADR needed — purely additive content/rendering change, no architectural or IA decision.
- `aidlc-docs/efforts/031-improvement-ideation/` and `docs/plans/2026-09-01-site-improvement-ideas.md`
  (the source of idea 14) are not present in this worktree's checked-out tree: this branch's base
  predates PR #43 (`89b8cc8`) by exactly one commit — `git log --oneline HEAD..origin/main` shows
  only `89b8cc8` ahead. Not a lost or reverted file, just a branch cut moments before that PR
  merged. Confirmed idea 14's text directly from the merge commits (`89b8cc8`, `60349f2`) via
  `git show` and quoted it above; this effort's own commit does not attempt to rebase onto the
  newer `origin/main` tip, to keep the diff minimal while other efforts (034–039) are in flight —
  the integrator reconciles branch bases when merging.
