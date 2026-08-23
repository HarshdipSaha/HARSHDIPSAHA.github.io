# 0009 — CI-enforced AI-DLC recording

**Status:** Accepted · **Date:** 2026-08-23 · **Supersedes:** —

## Context

AI-DLC was adopted in ADR 0008, but the recording rule lived only in `CLAUDE.md` (a
Claude-specific file other AI tools never read) and was purely advisory. It also carried a
wide-open loophole — "trivial changes skip the effort" with no hard definition of trivial.

The predictable result arrived within hours of adoption: PR #4 (a multi-section content
change with a project addition and a file deletion) and PR #5 (a link fix that deleted a
route) both merged with **no effort record at all**, and effort 007's own registry rows were
left stale after its PR merged. The drift was only found and backfilled during a manual audit
(effort 009). An advisory rule that AI tools follow "when they remember" is
indistinguishable from no rule.

## Decision

1. **The rule moves to the shared contract.** The change lifecycle (effort record → registry
   → audit → ADR iff architectural → docs sync iff drifted) is stated in `AGENTS.md`, which
   every AI tool reads, and is item 7 of the Definition of done. `CLAUDE.md` only adds the
   Claude-specific instruction to invoke the `ai-dlc` skill at the *start* of a change.

2. **CI enforces it.** `.github/workflows/aidlc-check.yml` runs
   `scripts/check-aidlc-sync.mjs` on every PR to `main`: if the diff touches substantive
   paths (`src/`, `scripts/`, `package.json`, `next.config.*`, `tsconfig.json`,
   `biome.json`, `.github/workflows/`) without touching `aidlc-docs/`, the check fails.
   Generated and drop-zone paths (`public/`, `out/`, `src/data/gallery.json`, `gallery/`,
   `project_images/`, root `me.jpg`, `resume.pdf`) are exempt on their own.

3. **"Trivial" is defined narrowly.** A change is trivial iff it is a typo or a one-line copy
   tweak that deletes nothing, adds no route, and changes no structure. Such a PR carries
   `[trivial]` in its title, which is the check's only escape hatch. Deleting a file, moving
   content between sections, or changing a link target is not trivial — it gets at least a
   `depth: minimal` effort record.

4. **A PR template** (`.github/pull_request_template.md`) carries the lifecycle checklist, so
   the record is visible at review time, with explicit "only if needed" guards on the ADR and
   docs-sync items — the goal is synced docs, not ceremonial ones.

## Consequences

- A substantive change and its record are now atomic: one PR, or the PR does not merge.
- The recording burden is bounded — a `depth: minimal` effort-state file is a few lines —
  and the ADR/docs-sync steps stay conditional, so the check cannot force busywork.
- The check is diff-shape-based, not content-based: it can be satisfied by a low-quality
  effort file. Review quality still matters; CI only removes the "forgot entirely" failure
  mode, which is the one that actually occurred.
- `[trivial]` is honor-system. If it gets abused, the next ADR tightens it (e.g. max-lines
  threshold in the script).

## Evidence

- PRs #4 and #5 merged 2026-08-23 with no `aidlc-docs` change; backfilled as efforts 008-009.
- Effort 007's registry/audit rows stayed `in-progress`/`pending` after PR #3 merged;
  corrected in the effort-009 sync commit.
