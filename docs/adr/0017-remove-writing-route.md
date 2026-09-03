# 0017 — Remove the `/writing` route; the three posts are not the owner's own writing

**Status:** Accepted · **Date:** 2026-09-03 · **Supersedes:** [ADR 0016](0016-writing-route.md)

## Context

ADR 0016 published `content/writing/*.mdx` (three first-person posts) at `/writing` and
`/writing/[slug]`, reasoning through where they sit relative to the factuality gate and
`llms.txt`. Shortly after that PR merged, the owner clarified directly: the three posts are not
his own writing, and approving the PR that published them was a mistake. A personal portfolio
attributing someone else's first-person account to the site owner is a real problem — this isn't
a stale-claim or copy-polish issue like the ones ADR 0016 already weighed, it's a content-origin
one that invalidates the whole premise of publishing them at all.

## Decision

Remove the `/writing` and `/writing/[slug]` routes, the `nav` entry, `src/lib/writing.ts`, the
sitemap/Lighthouse/`llms.txt` wiring ADR 0016 added, and ADR 0016's own `docs/adr/` entry from
the live design record (kept, marked superseded — not deleted, matching how ADR 0001 and ADR 0010
are handled). Delete the three `content/writing/*.mdx` files from the repository going forward.

**Scope of the deletion:** these files predate this session and were already committed to the
repo's history before any effort here touched them. The owner was asked explicitly whether to
also rewrite all of git history to remove them from every past commit (via `git filter-repo` or
equivalent, requiring a force-push and breaking every commit hash in the repository) versus a
normal forward deletion. The owner chose the forward deletion: the files are gone from the
working tree and every commit from this point on; they remain visible only to someone who
deliberately digs through pre-2026-09-03 commit history, the same as any ordinary file removal.
A full history rewrite was judged disproportionate to the actual risk (the posts were live at
`/writing` only briefly, between PR #52 merging and this ADR) and would have broken every
downstream clone, fork, and branch reference.

## Consequences

- `/writing` and `/writing/[slug]` no longer exist; `nav` in `site.ts` drops the `Writing` entry.
- `content/writing/` is removed entirely from the working tree.
- `llms.txt`/`llms-full.txt` no longer carry a Writing section; `scripts/build-llms-txt.mjs` and
  `scripts/lib/llms-txt.mjs` revert to their pre-ADR-0016 shape (project-only).
- `sitemap.ts` and both `lighthouserc.*.json` route lists drop the `/writing` entries.
- Effort 038's record is kept with its status changed to `reverted`, not deleted — the audit
  trail records that this work happened and was undone, and why.
- If genuinely original, owner-authored writing is added in the future, a new effort can restore
  a `/writing` route from scratch; nothing about this decision blocks that.
