# Effort 041 — Revert the `/writing` route

| Field | Value |
|-------|-------|
| Ref | 041-revert-writing-route |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Baseline | aidlc-docs/inception/ |
| ADRs | 0017 (supersedes 0016) |
| Commits | branch `revert/writing-route` |
| Reconstructed | no — recorded live |

## Intent

Effort 038 (PR #52) published three `content/writing/*.mdx` posts at `/writing` and
`/writing/[slug]`. Shortly after that PR merged, the owner clarified in chat that the three posts
are not his own writing, and that approving PR #52 was a mistake — they should never have been
made public on the site. This effort removes the route and everything effort 038 added, and
deletes the three `.mdx` files, so no content of uncertain/incorrect authorship is attributed to
the site owner.

Two scope questions were resolved directly with the owner before any deletion happened:

1. **Keep the `.mdx` files with no route, or delete them entirely?** Deleted — there is no reason
   to keep someone else's unpublished writing sitting in the repo once there is no route for it.
2. **Delete going forward, or rewrite all of git history (the files predate this session)?**
   Delete going forward only. A full history rewrite (`git filter-repo` + force-push) would break
   every commit hash in the repository, require anyone with a clone to re-clone, and was judged
   disproportionate — the posts were live at `/writing` for a matter of hours between PR #52
   merging and this effort, and the owner explicitly chose the smaller-blast-radius option.

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | Scope clarified directly with the owner (two follow-up questions, see Intent) |
| Functional design | Revert `bc2f6b6` (effort 038's squash-merge commit), resolved by hand rather than a mechanical `git revert` so the effort-038 record and ADR 0016 could be *kept and marked reverted/superseded* instead of silently disappearing |
| NFRs | None — content/route removal only, no new architecture |
| Code | Removed `src/app/writing/**`, `src/lib/writing.ts`, the `nav` entry, `sitemap.ts`'s writing block, both `lighthouserc.*.json` route entries, the `llms.txt`/`llms-full.txt` Writing section wiring in `scripts/build-llms-txt.mjs` / `scripts/lib/llms-txt.mjs` / `scripts/llms-txt.test.mjs`; deleted all three `content/writing/*.mdx` files; synced `AGENTS.md`, `CONTEXT.md`, `README.md` to drop the now-false `content/writing/` mentions |
| Build & test | See Verification |

## Units of work

- [x] Revert effort 038's code changes (route, nav, lib, sitemap, Lighthouse configs, llms.txt pipeline)
- [x] Delete `content/writing/*.mdx` (all three files)
- [x] Keep effort 038's record, mark `Status: reverted — see effort 041`
- [x] Keep ADR 0016, mark `Status: Superseded by ADR 0017`; write ADR 0017 documenting the reversal and the history-scope decision
- [x] Sync `AGENTS.md` / `CONTEXT.md` / `README.md` off the removed feature
- [x] Registry: 038's row status changed to `reverted — see 041`; new `041` row added; new `reverted` bucket added to the Status summary table (the existing four terminal statuses — `blocked`/`failed`/`abandoned` — didn't fit a shipped-then-undone effort)
- [x] Audit: two new rows (Planning, Construction) appended; 038's and 039's original rows left untouched — the audit log is a chronological record of what happened, not a mirror of current status

## Verification

```
npm run typecheck
npm run build
npm run test:unit
npm run test:smoke
npm run check:aidlc
```

(paste real output before merging)

## Notes

- This is not a `git revert <sha>` commit in the end — a straight revert would have deleted the
  effort-038 folder and the ADR 0016 file outright (since revert undoes their addition), which
  contradicts this repo's own convention that effort folders are never deleted, only moved to a
  terminal status (`docs/how-to/run-an-aidlc-effort.md`). Both files were restored after the
  revert's conflicts were resolved, then hand-edited to reflect the new status.
- `docs/adr/0016-writing-route.md` reasoned carefully about the factuality gate and stale-claim
  handling for these posts — none of that reasoning was wrong, it was simply answering the wrong
  question. ADR 0017 supersedes it on the actual, different problem: content origin, not content
  accuracy.
