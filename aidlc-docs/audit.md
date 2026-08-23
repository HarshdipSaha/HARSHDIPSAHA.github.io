# Approval-gate audit log

Records every approval-gate response in the project's history.

**Honesty note.** Efforts 001-004 predate AI-DLC adoption in this repo. No approval gates existed at the time — there was no planning stage, no construction gate, and no review step; changes were committed directly with messages like "lets see" and "hmmm". Their rows below are **reconstructions of what happened, not records of approvals**, and are marked `n/a — pre-adoption`. No genuine approval was given or recorded for those efforts. Efforts 005 and 006 were gated by GitHub PR review. Effort 007 is the first to run an explicit AI-DLC scope-approval gate.

| Date | Effort | Gate | Response | Notes |
|------|--------|------|----------|-------|
| 2026-01-27 | 001 | Planning | `n/a — pre-adoption` | No approval gate existed at the time. Reconstructed 2026-08-23 from commits `d9e0d8a`..`faf40ff`. No rationale recorded. |
| 2026-01-27 | 001 | Construction | `n/a — pre-adoption` | No gate. Committed direct to default branch; two corrective `deploy.yml` commits followed. |
| 2026-01-28 | 002 | Planning | `n/a — pre-adoption` | No approval gate existed at the time. Reconstructed from the rename/deletion sets in `e3d7eea`..`c91a044`. |
| 2026-01-28 | 002 | Construction | `n/a — pre-adoption` | No gate. The decision to abandon upstream rebase (ADR 0003) was never reviewed at the time. |
| 2026-01-28 | 003 | Planning | `n/a — pre-adoption` | No approval gate existed at the time. Reconstructed from `7eba8fd`..`e6629aa`. |
| 2026-01-28 | 003 | Construction | `n/a — pre-adoption` | No gate. The JSX-in-content trade-off (ADR 0004) was written retroactively, not approved up front. |
| 2026-01-28 | 004 | Planning | `n/a — pre-adoption` | No approval gate existed at the time. Reconstructed from single commit `0814927`. |
| 2026-01-28 | 004 | Construction | `n/a — pre-adoption` | No gate. `public/images/**` became generated output without review. |
| 2026-08-23 | 005 | Planning | GitHub PR review (PR #1) | Scope and rationale stated in the PR #1 body — the first written rationale in this repo's history. |
| 2026-08-23 | 005 | Construction | Approved and merged (PR #1) | Reviewed on GitHub and merged. `npx tsc --noEmit` clean at merge. Commit `6799e4b`. |
| 2026-08-23 | 006 | Planning | GitHub PR review (PR #2) | Scope stated in the PR #2 body. |
| 2026-08-23 | 006 | Construction | Approved and merged (PR #2) | Reviewed on GitHub and merged. `npx tsc --noEmit` clean; dev server compiled `/work` and `/about`. Commit `1cde09f`. |
| 2026-08-23 | 007 | Planning (scope approval) | `Continue` | User selected scope "Docs structure + a live /process page" and depth `standard`. |
| 2026-08-23 | 007 | Construction | Approved and merged (PR #3) | Reviewed on GitHub and merged. `npx tsc --noEmit` clean; `npm run build` succeeded; `/process` verified reachable from nav. Commit `ac2a0a3`. Registry/audit rows for this effort were left `in-progress`/`pending` after merge and were only corrected during effort 009's sync pass on 2026-08-23. |
| 2026-08-23 | 008 | Planning | GitHub PR review (PR #4) | Scope and rationale stated in the PR #4 body. No `aidlc-docs` effort record was created at the time; backfilled during effort 009's sync pass. |
| 2026-08-23 | 008 | Construction | Approved and merged (PR #4) | Reviewed on GitHub and merged. `npx tsc --noEmit` clean; `npm run build` succeeded (30 static pages). Commit `953ac4f`. |
| 2026-08-23 | 009 | Planning | User request (chat) | User asked to fix the RECAP-Net publication link, drop the duplicate Projects card, and move Amazon ML Summer School into Work Experience; scoped and executed directly, no ADR needed. |
| 2026-08-23 | 009 | Construction | Approved and merged (PR #5) | Reviewed on GitHub and merged. `npx tsc --noEmit` clean; `npm run build` succeeded. Commit `1f71772`. During this effort, discovered and corrected stale registry/audit rows for effort 007 and a missing record for effort 008. |
