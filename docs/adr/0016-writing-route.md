# 0016 — Publish `content/writing/*.mdx` at `/writing`, outside the factuality gate

**Status:** Accepted · **Date:** 2026-09-03 · **Supersedes:** —

## Context

`content/writing/` has held three first-person posts (LiveKit voice-agent interruption handling, an
Adobe Express hackathon add-on, a Smart India Hackathon WhatsApp health chatbot) since before the
thine.com rebuild (ADR 0011). CONTEXT.md and AGENTS.md both documented them as "content only — no
route reads them". Idea 5 of the effort-031 improvement-ideation document flagged this as dead weight:
real, already-written material that no visitor can reach.

Two design questions had to be settled before publishing them:

1. **Do they belong under the factuality gate (ADR 0013)?** That gate fetches each project's source
   repository README and fails the build on any claim it can't trace. Project case studies have that
   anchor because every one links a repository. These three posts are first-person narrative accounts —
   two describe hackathon builds with a linked demo/repo, one has no verifiable source at all — so there
   is no single ground-truth document to check every claim against the way there is for a project. Folding
   them into the same gate would mean either fabricating a source mapping that doesn't exist, or the gate
   silently skipping them, which is worse than being honest that they are unchecked.
2. **What happens to claims that no longer hold up?** The posts predate this rebuild by up to a year.
   Reading all three surfaced one genuine defect (the Sehat Sathee post's source draft cut off mid-Dockerfile,
   with an unclosed code fence) and two claims worth a second look (an unsourced rural-population/internet
   stat, and a government API integration against an endpoint that was restricted after the post was
   plausibly written). The owner's standing evidence rule — never silently rewrite, never invent — applies
   here as much as it does to `content/projects/`.

## Decision

**1. Two new routes, built exactly like the project pair.** `src/app/writing/page.tsx` (list) and
`src/app/writing/[slug]/page.tsx` (post) mirror `src/app/projects/page.tsx` /
`src/app/projects/[slug]/page.tsx`: `gray-matter` frontmatter + `next-mdx-remote/rsc` body inside
`.prose measure`, the same header idiom (back-link, `.display` H1, summary, metadata row), a "next"
link at the foot. `src/lib/writing.ts` mirrors `src/lib/projects.ts` — slug is the lowercased MDX
filename, newest first — with two differences the type reflects: posts carry an optional `tag`
instead of `images[]`/`link`, and there is no image manifest to join against.

**2. `/writing` is a normal nav route.** `{ label: "Writing", href: "/writing" }` was added to `nav` in
`site.ts`. `Nav.tsx`, `Footer.tsx` and `sitemap.ts` all read that one array (AGENTS.md, "Routes need two
edits"), so no other wiring was needed for those three. `sitemap.ts` additionally gained a
`writingPages` block using each post's own `publishedAt` as `lastModified` — the same pattern effort
032 established for `projectPages`, rather than the generic site-wide `lastModified` the plain nav
pages get.

**3. Writing posts are explicitly outside the factuality gate.** `evals/factuality/` and its CI job
(`.github/workflows/evals.yml`) are path-filtered to `content/projects/**`; this effort does not touch
that filter, and `src/lib/writing.ts`'s docstring records the reasoning inline so a future reader does
not have to reconstruct it. This is a deliberate scope boundary, not an oversight: the two posts that
do link a source (LiveKit repo context, the Adobe hackathon's linked GitHub repo and demo) still don't
give the deterministic extractor a single README to check every claim against, and the third has none
at all.

**4. Stale or unverifiable claims get a dated editor's note, never a silent rewrite.** All three posts
were read in full before publishing. Two were left untouched — no claim in the LiveKit or Adobe posts
reads as stale, and the Adobe post's GitHub repo and demo video were confirmed live. The Sehat Sathee
post received one dated note (`*Editor's note (2026-09-03): ...*`) covering three things: an unsourced
rural-population/internet-access statistic, a CoWIN API integration that queries an endpoint India
restricted after the post's likely hackathon window, and the fact that the source draft itself cut off
mid-Dockerfile with no conclusion — the unclosed code fence was closed so the page renders correctly,
without inventing the missing ending. The full list is in the effort record's `## Stale claims` section
and the PR body.

**5. `llms.txt` and `llms-full.txt` gain a `## Writing` section.** `scripts/lib/llms-txt.mjs`'s
`renderLlmsTxt(site, projects, posts)` grew a third, optional parameter (defaulting to `[]`, so every
existing two-argument call site and test stays valid) and a `## Writing` section in both documents,
following the same index/full-text-inline shape as `## Projects`. `scripts/build-llms-txt.mjs` gained a
`loadPosts()` mirroring `loadProjects()`. The call was: agents reading `llms.txt` to answer "what has
this person built" should see the same three routes a human visitor now can, and the shape already
existed to copy.

**6. Lighthouse gains one more URL, not one per post.** `/writing` was added to both
`lighthouserc.desktop.json` and `lighthouserc.mobile.json`'s `url` arrays, matching the existing pattern
of asserting the list page plus one representative detail page for `/projects` (`/projects/atomnet`) —
here the effort's own instruction was to add the list page only, keeping the assertion budget (three
runs × N routes) from growing per-post as more writing goes up later.

## Consequences

- `/writing` and `/writing/[slug]` are real, indexed routes: in `nav`, in `sitemap.xml`, discovered
  automatically by `tests/smoke.spec.ts` (it walks `out/`, so no smoke-suite edit was needed), and
  present in `llms.txt`/`llms-full.txt`.
- The Sehat Sathee post is publishable but visibly imperfect — it says so, in its own text, rather than
  reading as more finished or more current than it is.
- A future post that *does* have a checkable source (a linked repo with a README) still won't be
  factuality-gated unless a later effort explicitly extends the path filter and the extractor's claim
  model. That is a deliberate non-goal here, not a limitation to fix quietly later.
- `renderLlmsTxt`'s signature grew from two required arguments to two required plus one optional; no
  existing call site broke, and the unit test suite gained six cases for the new parameter without
  changing any existing assertion.

## Alternatives considered

- **Fold writing posts into the same factuality pipeline as projects.** Rejected: the deterministic
  extractor's contract is "every number traces to the one linked README"; two of three posts have no
  single such document, and forcing a mapping would either be dishonest (a fake source) or silently
  inert (an entry that never checks anything) — worse than the explicit exclusion this ADR records.
- **Silently correct the stale claims found while reading the posts.** Rejected: same rule as
  `content/projects/` — "don't make up and write" applies to deletion and correction, not only addition.
  An editor's note is reviewable; a quiet edit is not.
- **Leave the Sehat Sathee post's broken fence and missing ending as-is.** Rejected for the syntax only:
  an unclosed fence is technically valid CommonMark (it closes at EOF), so it would have rendered, but
  leaving it unclosed reads as an oversight rather than a disclosed fact about the source material.
  Closing the fence is a formatting fix with no new claims in it; the missing content itself was left
  missing, and said so.
- **A separate `renderLlmsTxt` function for posts, called alongside the existing one.** Rejected: two
  render passes producing two documents to stitch together is more surface than one function with one
  more optional argument, for content that already has an obvious parallel section.
- **Add every post's detail page to the Lighthouse route lists, matching `/projects/atomnet`.**
  Rejected for now, per the effort's own scope: the instruction was the list page only, and three posts
  is not yet enough variety to justify doubling the per-run route count on both presets.

## What would reverse this

- A later post that arrives with a genuine, single checkable source would be a reason to open a new
  effort extending the factuality gate's path filter — not to revisit this one.
- If the owner decides the Sehat Sathee post isn't worth keeping in its current state, deleting it (or
  rewriting it properly, not silently) is a follow-up effort's job, not a reversal of the routing
  decision here.

## Evidence

- Effort record: `aidlc-docs/efforts/038-writing-route/effort-state.md`.
- `content/writing/sehat-sathee-chatbot-blog.mdx` — the editor's note and the closed fence, in place.
- Improvement-ideation source: `docs/plans/2026-09-01-site-improvement-ideas.md` (effort 031), idea 5.
