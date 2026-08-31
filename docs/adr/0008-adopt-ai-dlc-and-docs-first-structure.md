# 0008 — Adopt AI-DLC and a docs-first repo structure

Status: Accepted   Date: 2026-08-23   Supersedes: —

## Context
Early commits in this repository lacked clear, descriptive messages and did not record the reasoning behind architectural decisions. For instance, a single early commit included over 12,000 insertions across more than 100 files without detailing the intent. Writing ADRs 0001-0007 required reverse-engineering intent from diffs — reading which files a commit deleted to infer what was rejected. That is a recoverable cost once and an unpayable one at scale.

Options considered:

- **Keep ad-hoc commits and rely on PR descriptions for rationale.** No new ceremony. Rejected:
  PRs #1 and #2 are the only two in the repo's history that carry any rationale at all, and PR
  bodies are not greppable from a clone — the "why" would live on a website, detached from the
  code it explains.
- **Adopt ADRs alone, without AI-DLC.** Captures decisions where they belong, in-tree and
  versioned. Rejected as insufficient: ADRs record the output of a decision but not the
  unit-of-work loop that produced it — the intent, the plan, the approval gate — which is
  precisely the part an agent-assisted workflow needs to be reproducible.

## Decision
Adopt the Agent-Repo Structure Playbook layout — an `AGENTS.md` / `CLAUDE.md` / `CONTEXT.md` /
`AGENT_WORKFLOWS.md` context layer, `docs/` organized on the Diataxis quadrants, `docs/adr/` as
the why-log, and `evals/` — together with the AI-DLC methodology: an `aidlc-docs/inception/`
baseline plus numbered `aidlc-docs/efforts/` folders.

## Consequences
Every non-trivial change now costs an effort folder and an approval gate. That is real ceremony
for a personal site, and it is justified only because this repo is itself a showcase of
AI-assisted engineering — the process is part of the artifact. ADRs 0001-0007 are backfilled
and explicitly marked as reconstructed from diffs rather than contemporaneous records; they
state intent inferred after the fact, and should be read as such. This ADR is also surfaced
publicly on the site's `/process` page, so it is written for an external reader as well as for
a future maintainer.

## Evidence
- `1613523` (2023-10-30) through `0814927` (2026-01-28) — the ad-hoc era: early undocumented commits.
- `ce54d2a` (2026-01-27) — 12,517 insertions under a two-word message; the single largest undocumented decision in the history.
- `6799e4b`, `1cde09f` (2026-08-23) — the first content changes made under this structure.
