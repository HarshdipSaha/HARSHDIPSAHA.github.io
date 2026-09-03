# Requirements delta — Effort 041

## Removed

- **`/writing` route** (list page) and **`/writing/[slug]`** (individual post page). Added by
  effort 038 (ADR 0016); removed here because the underlying content was not the site owner's own
  writing.
- **`nav` entry** `{ label: "Writing", href: "/writing" }` in `src/content/site.ts`.
- **`src/lib/writing.ts`** — the data-loading helper effort 038 wrote to mirror `src/lib/projects.ts`.
- **`content/writing/*.mdx`** — all three files (`Livekit-feature-introduction-task.mdx`,
  `adobe-add-on-hackathon.mdx`, `sehat-sathee-chatbot-blog.mdx`) deleted from the working tree.
  They remain visible in commits made before this effort; see the ADR 0017 for why a full history
  rewrite was not done.
- **`sitemap.ts`'s writing block** — per-post `lastmod` entries for the three posts.
- **`/writing` entries in both `lighthouserc.*.json`** route lists.
- **The `## Writing` section in `llms.txt`/`llms-full.txt`** — `renderLlmsTxt`'s third `posts`
  parameter (added by effort 038, default `[]`) is no longer called with any posts; the function
  signature itself is left in place since removing it isn't necessary to remove the output, and
  changing a shared pure function's signature back and forth across two same-day effort records
  would be churn without benefit.

## Changed

- **ADR 0016** — `Status` changed from `Accepted` to `Superseded by ADR 0017`.
- **Effort 038's record** — `Status` changed from `complete` to `reverted — see effort 041`; a
  `## Reverted (2026-09-03)` section appended explaining why and pointing here. The record itself
  (Intent, Stages, Units of work, Verification) is untouched — it accurately describes what was
  built and shipped; only the current status changed.
- **`aidlc-docs/registry.md`** — 038's row status updated; new `041` row added; a `reverted` row
  added to the Status summary table (a new terminal status alongside `complete`/`in-progress`/
  `blocked`/`failed`/`abandoned` — none of the existing four accurately describe work that shipped
  and was then intentionally undone).
- **`AGENTS.md`** — the "Content is code" paragraph's mention of `content/writing/*.mdx` removed.
- **`CONTEXT.md`** — the route table's `content/writing/*.mdx` row removed.
- **`README.md`** — the content table's `content/writing/` row removed.

## Added

- **ADR 0017** — documents the reversal decision and the git-history-scope call made with the
  owner.
- **This effort's own record** (`aidlc-docs/efforts/041-revert-writing-route/`).
