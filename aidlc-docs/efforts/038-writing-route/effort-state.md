# Effort 038 — Writing route for the three orphaned posts

| Field | Value |
|-------|-------|
| Ref | 038-writing-route |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Baseline | aidlc-docs/inception/ |
| ADRs | 0016 |
| Commits | branch `feat/writing-route` |
| Reconstructed | no — recorded live |

## Intent

`content/writing/*.mdx` has held three real, first-person posts (a LiveKit voice-agent write-up, an
Adobe Express hackathon add-on, a Smart India Hackathon WhatsApp health chatbot) since before the
thine.com rebuild, with no route ever reading them — idea 5 of the effort-031 improvement-ideation
document (`docs/plans/2026-09-01-site-improvement-ideas.md`) flagged this directly. Publish them at
`/writing` (list) and `/writing/[slug]` (post), following the same pattern as `/projects`, and decide
where they sit relative to the factuality gate and `llms.txt`.

A prior session started this effort and was interrupted mid-task: `src/app/writing/page.tsx` (list)
and `src/lib/writing.ts` existed as uncommitted, untracked files, but referenced a `writing` export
from `src/content/site.ts` that did not exist, `src/app/writing/[slug]/page.tsx` did not exist, `nav`
had no entry, and none of the sitemap/Lighthouse/llms.txt/AI-DLC/docs wiring had been done. This
session reviewed the partial work, found it sound (correct pattern, correctly mirrors
`src/lib/projects.ts`), and finished the rest.

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | This record + `requirements-delta.md`, written after reviewing the inherited partial work and the full spec against `AGENTS.md`/`CONTEXT.md`. |
| Functional design | Copy the `/projects` + `/projects/[slug]` pattern exactly: `gray-matter` + `next-mdx-remote/rsc`, `.prose measure` body, same header idiom (back-link, `.display` H1, summary, metadata row, "next" link). No image handling — posts carry an optional `tag`, no `images[]`/`link`. |
| NFRs | Writing posts sit outside the factuality gate (`evals/factuality/` stays path-filtered to `content/projects/**`, untouched) — recorded as a deliberate decision in ADR 0016, not an oversight. Stale/unverifiable claims found while reading the posts get a dated editor's note, never a silent rewrite, matching the owner's evidence rule for `content/projects/`. |
| Code | See Units of work below. |
| Build & test | `npm run typecheck`, `npm run build`, `npm run test:unit`, `npm run test:smoke` — see Verification. |

## Units of work

- [x] `src/content/site.ts` — added `writing` export (`title`, `description`, `headline`, `intro`) that `src/app/writing/page.tsx` was already importing; added `{ label: "Writing", href: "/writing" }` to `nav` (between Projects and Gallery).
- [x] `src/lib/writing.ts` — reviewed the inherited file; it correctly mirrors `src/lib/projects.ts` (`getPosts`, `getPost`, slug = lowercased MDX filename, newest first). No changes needed.
- [x] `src/app/writing/page.tsx` — reviewed the inherited list page; correct, unchanged.
- [x] `src/app/writing/[slug]/page.tsx` — new. Mirrors `src/app/projects/[slug]/page.tsx`: `generateStaticParams`, `generateMetadata`, back-link, `.display` H1, summary, tag + date row, MDX body, "Next post" footer link (wraps around; hidden when only one post exists).
- [x] `src/app/sitemap.ts` — added a `writingPages` block using each post's own `publishedAt` as `lastModified`, the same pattern effort 032 established for `projectPages` (not the generic `siteLastModified` the plain nav pages get).
- [x] `lighthouserc.desktop.json`, `lighthouserc.mobile.json` — added `/writing` to both `url` arrays (list page only, matching the instruction; `/projects` similarly asserts only one representative detail page, `/projects/atomnet`, not every project).
- [x] `tests/smoke.spec.ts` — no edit needed; it discovers routes by walking `out/`, so `/writing` and all three `/writing/[slug]` pages are covered automatically.
- [x] `scripts/lib/llms-txt.mjs` — `renderLlmsTxt(site, projects, posts)` grew an optional third parameter (defaults to `[]`, so every existing 2-arg call stays valid); added `## Writing` to both `index` and `full` documents (index: bullet list; full: inlined body with headings demoted 2 levels, same shape as `## Projects`); added a `/writing` case to `sectionBlurb`.
- [x] `scripts/build-llms-txt.mjs` — added `loadPosts()` mirroring `loadProjects()`, wired into the `renderLlmsTxt` call and the console summary line.
- [x] `scripts/llms-txt.test.mjs` — added a `posts` fixture and 4 new tests (Writing section present in both variants, full-only body text, heading demotion, safe default when `posts` is omitted); extended 2 existing tests (`## Writing` in the heading-shape check; `posts` passed into the absolute-URL check).
- [x] `content/writing/*.mdx` — read all three in full. `Livekit-feature-introduction-task.mdx` and `adobe-add-on-hackathon.mdx`: no stale claims found (the Adobe post's GitHub repo and demo video were confirmed live — see Verification). `sehat-sathee-chatbot-blog.mdx`: dated editor's note added; unclosed trailing code fence closed. See `## Stale claims` below.
- [x] `CONTEXT.md` — IA table: added `/writing` and `/writing/[slug]` rows; updated the sitemap/llms.txt rows to mention the new routes/section.
- [x] `README.md` — route count 6 → 8, ADR count 15 → 16, `site.ts` exports list, `src/lib/` row, `content/writing/` row, `scripts/lib/llms-txt.mjs` signature, Lighthouse route count 6 → 7.
- [x] `AGENTS.md` — "Content is code" paragraph and "Routes need two edits" current-routes list updated (both stated the old "not rendered anywhere" fact); `renderLlmsTxt` signature and ADR reference updated.
- [x] `docs/adr/0016-writing-route.md` — new ADR recording the routing pattern, the factuality-gate exclusion, and the stale-claims handling. Row added to `docs/adr/README.md`.
- [x] `aidlc-docs/registry.md` — row 038 added in numeric order; "Next effort number" bumped past 038.
- [x] `aidlc-docs/audit.md` — Planning + Construction rows for effort 038.

## Verification

```
$ npm run typecheck
> harshdipsaha-portfolio@2.0.0 typecheck
> tsc --noEmit -p tsconfig.json
(clean exit 0)

$ npm run build
> harshdipsaha-portfolio@2.0.0 prebuild
> node scripts/build-images.mjs && node scripts/build-llms-txt.mjs
images: 15 gallery, 21 projects, 53 encoded
llms.txt: 20 projects, 3 writing posts, llms.txt 7959 chars, llms-full.txt 74136 chars
> harshdipsaha-portfolio@2.0.0 build
> next build
✓ Compiled successfully in 27.0s
✓ Generating static pages using 11 workers (34/34) in 4.3s
Route (app)
├ ○ /writing
└   /writing/[slug]
  ├ ● /writing/adobe-add-on-hackathon
  ├ ● /writing/livekit-feature-introduction-task
  └ ● /writing/sehat-sathee-chatbot-blog
> harshdipsaha-portfolio@2.0.0 postbuild
> node scripts/postbuild-segments.mjs
segments: mirrored 29 prefetch payload(s) under dotted names

$ npm run test:unit
# tests 46
# pass 46
# fail 0
(6 of the 46 are the new Writing-section cases in scripts/llms-txt.test.mjs; the rest are the
pre-existing factuality-eval and llms-txt suites, unaffected)

$ npm run test:smoke
25 failed, 61 passed — every failure a 404 on a route that does exist in this worktree's `out/`
(home, most /projects/*, and all of /writing/*). Root cause: playwright.config.ts's
`reuseExistingServer: !process.env.CI` reused a `serve` process already bound to port 3100 by a
sibling agent's concurrent worktree, so Playwright was hitting a different repo's `out/`. Not a
real failure in this effort's code.

$ npx playwright test --config=playwright.smoke-038.config.ts   (scratch config, port 3450 —
                                                                   not 3100/3200/3201, reserved
                                                                   for concurrent agents, same
                                                                   reason effort 027 used 3417;
                                                                   config deleted after the run,
                                                                   never committed)
86 passed (2.6m), 0 failed — desktop + mobile, including all 3 new /writing/[slug] pages, /writing
itself, and the full pre-existing suite (skills-bubbles, webmcp, story-tools, reduced-motion).
```

Route-existence checks against the real export (this Next.js version names top-level static routes
`out/<route>.html`, matching the existing convention for every other nav route — `out/projects.html`,
`out/story.html` — not `out/<route>/index.html`):

- `out/writing.html` exists.
- `out/writing/adobe-add-on-hackathon.html`, `out/writing/livekit-feature-introduction-task.html`,
  `out/writing/sehat-sathee-chatbot-blog.html` all exist.
- `out/sitemap.xml` lists all four writing URLs, each writing-post URL with its own `publishedAt` as
  `<lastmod>`, distinct from the generic site `lastmod` on `/writing` itself.
- `public/llms.txt` contains a `## Writing` section listing all three posts with absolute
  `https://harshdipsaha.tech/writing/<slug>` URLs; `public/llms-full.txt` inlines all three bodies with
  headings demoted under an `### <title>` per post.
- `gh api repos/DevAggarwal03/Loomis-Adobe-Express-Add-on` confirms the Adobe post's linked repository
  is real, public, and matches the post's description; the demo YouTube URL's page title
  ("Presenting Loomis : An Adobe add on v5") confirms the video is live.

## Stale claims

Read all three posts in full before publishing. Findings:

1. **`sehat-sathee-chatbot-blog.mdx` — truncated source draft.** The post's fenced Dockerfile code
   block had no closing ``` — the file ended mid-`HEALTHCHECK` instruction, with no conclusion section
   (both other posts end with a "What I learned"/"Final thoughts" section; this one does not). This is
   a genuine defect in the inherited content, not a stale claim, but it would have rendered as an
   abruptly truncated page. **Action:** closed the fence (formatting only — nothing after the cutoff
   was invented) and added a one-line note where it stops.
2. **`sehat-sathee-chatbot-blog.mdx` — unsourced rural-population/internet-access statistic.** The
   opening line states "73% of India's population lives in rural areas. Only 25% have internet
   access." with no citation, and India's internet penetration was well above 25% by the time this post
   is dated (2025-10-18). **Action:** flagged in the editor's note; left as originally written per the
   no-silent-rewrite rule.
3. **`sehat-sathee-chatbot-blog.mdx` — CoWIN API integration.** "Challenge #4" shows code querying
   `cdn-api.co-vin.in`, India's COVID-vaccination-booking API. That public endpoint was restricted after
   the national vaccination drive wound down, well before this post's dated hackathon — so the
   integration as shown may not have been usable as described. **Action:** flagged in the same editor's
   note; left as written.
4. **`Livekit-feature-introduction-task.mdx`** — reviewed in full. No stale or unverifiable claims
   found; it is a self-contained technical narrative with no external links or dated claims. No change.
5. **`adobe-add-on-hackathon.mdx`** — reviewed in full. Three external links (demo video, GitHub repo,
   pitch deck); the repo and the video were confirmed live (see Verification). No stale claims found.
   No change.

All three findings for the Sehat Sathee post are consolidated into one dated editor's note
(`*Editor's note (2026-09-03): ...*`) placed after the post's intro paragraph, per the instruction to
date and disclose rather than silently correct.

## Notes

- `evals/factuality/` and `.github/workflows/evals.yml` are untouched — both stay path-filtered to
  `content/projects/**`. Writing posts are deliberately outside that gate; ADR 0016 records why.
- `src/lib/writing.ts`'s docstring (written by the prior, interrupted session) already stated the
  ADR-0016 reasoning before the ADR existed — this session wrote the ADR to match what that file
  already said, rather than changing the file to match a differently-reasoned ADR.
