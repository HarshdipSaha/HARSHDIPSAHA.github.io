# Requirements delta — 038-writing-route

## NEW

- **R-WRITE-1** `content/writing/*.mdx` must be rendered at two routes: `/writing` (a list, newest
  first) and `/writing/[slug]` (one page per post, slug = lowercased MDX filename), following the same
  render pattern as `/projects` / `/projects/[slug]` (`gray-matter` frontmatter + `next-mdx-remote/rsc`
  body inside `.prose`).
- **R-WRITE-2** `/writing` must be a normal `nav` entry (`{ label: "Writing", href: "/writing" }`) so
  `Nav.tsx`, `Footer.tsx` and `sitemap.ts` pick it up with no separate wiring (AGENTS.md, "Routes need
  two edits").
- **R-WRITE-3** Each `/writing/[slug]` page's sitemap entry must carry that post's own `publishedAt` as
  `lastModified`, not the generic site-wide value the plain nav pages get — the same pattern effort 032
  established for `/projects/[slug]`.
- **R-WRITE-4** Writing posts are explicitly **outside** the factuality gate (`evals/factuality/`,
  path-filtered to `content/projects/**`). This is a scoped, documented exclusion (ADR 0016), not an
  oversight: two of the three posts have no single checkable source repository, and the third is a
  first-person account with none at all.
- **R-WRITE-5** Any claim in the three inherited posts that reads as stale, outdated, or unverifiable
  must get a dated editor's note (`*Editor's note (YYYY-MM-DD): ...*`) in the MDX body — never a silent
  rewrite or deletion. Every such note found, and the reasoning, must be listed in both the effort
  record and the PR body for owner review.
- **R-WRITE-6** `/writing` must be added to both Lighthouse route lists (`lighthouserc.desktop.json`,
  `lighthouserc.mobile.json`) so the existing performance/accessibility/SEO/best-practices floors apply
  to it.
- **R-WRITE-7** `llms.txt` / `llms-full.txt` gain a `## Writing` section (index: bullet list; full:
  inlined post bodies with headings demoted), generated the same way the `## Projects` section is —
  from the site's own content at build time, so it cannot drift from the published pages.

## CHANGED

- **R-CONTENT-1** (baseline, `aidlc-docs/inception/requirements.md`'s content-as-code rule) `src.
  content/site.ts` gains a `writing` export (`title`, `description`, `headline`, `intro`) alongside the
  existing section exports. The rule itself — every word that is not a project case study or writing
  post lives in `site.ts` or a content MDX file — is unchanged; the exports list it applies to grows by
  one.
- **R-LLMSTXT-1** (effort 024 / ADR 0014) `renderLlmsTxt(site, projects)` becomes
  `renderLlmsTxt(site, projects, posts)`, with `posts` optional and defaulting to `[]` so every existing
  two-argument call site and test remains valid without modification.
- **R-SITEMAP-1** (effort 032) The per-page `lastModified` pattern first applied to
  `/projects/[slug]` now also applies to `/writing/[slug]`, via the same shape (`{ url, lastModified: new
  Date(post.date) }`).

## UNCHANGED / constraints honoured

- `output: "export"` — no server runtime, no route handlers; `/writing/[slug]` uses
  `generateStaticParams()` exactly like `/projects/[slug]`.
- `tests/smoke.spec.ts` needed no edit: it discovers every route by walking `out/`, so `/writing` and
  all three post pages are covered automatically the moment the build produces them.
- The factuality gate's path filter (`content/projects/**`) is unchanged — `content/writing/**` is
  deliberately not added to it (see R-WRITE-4 / ADR 0016).
- No new production dependency: `gray-matter`, `next-mdx-remote/rsc` and `remark-gfm` were already in
  use by the `/projects` route.
