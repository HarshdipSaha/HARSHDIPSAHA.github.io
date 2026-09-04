# 0019 — Keep AI-DLC; do not adopt GitHub Spec Kit

**Status:** Accepted · **Date:** 2026-09-05 · **Supersedes:** —

## Context

GitHub's Spec Kit (`github/spec-kit`) is a public "Spec-Driven Development" toolkit: slash
commands (`/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`,
`/speckit.implement`, `/speckit.converge`, plus optional `/speckit.clarify`/`/speckit.analyze`/
`/speckit.checklist`) that generate a per-feature `spec.md` → `plan.md` → `tasks.md` chain,
governed by a repo-level `constitution.md`. It advertises 30+ supported coding agents and an
optional `/speckit.taskstoissues` bridge to GitHub Issues.

This repo already runs its own version of "write the plan before the code": AI-DLC
(ADR 0008), a numbered `aidlc-docs/efforts/NNN-<ref>/` record (`effort-state.md` +
`requirements-delta.md`) per non-trivial change, a derived `registry.md`, an `audit.md`
approval log, and — critically — a CI gate (ADR 0009, `.github/workflows/aidlc-check.yml` →
`scripts/check-aidlc-sync.mjs`) that fails any PR touching `src/`, `scripts/`, configs, or
workflows without a matching `aidlc-docs/` change. The question raised (issue #59): given a
mature public alternative exists, should this repo switch to it, adopt pieces of it, or stay
on its own process?

## Options considered

1. **Adopt Spec Kit wholesale**, replacing `aidlc-docs/` with `.specify/`'s
   constitution/spec/plan/tasks chain.
2. **Adopt pieces of Spec Kit** — e.g. its `/speckit.clarify` pre-spec question pass, or its
   `constitution.md` — layered onto the existing AI-DLC records.
3. **Keep AI-DLC as-is.**

## Decision

**Option 3 — keep AI-DLC unchanged.** Concretely, for this repo:

1. **Spec Kit has no CI enforcement; AI-DLC's entire value-add over its own 2026-08-23
   predecessor *is* CI enforcement.** Spec Kit's spec/plan/tasks files are prompt-and-template
   output with nothing verifying they exist, stay current, or accompany a given change — by
   design, it is agent-and-discipline-driven, same as AI-DLC's very first (pre-ADR-0009)
   incarnation. That incarnation was tried here and failed within hours: PRs #4 and #5 merged
   with zero effort record because an advisory-only rule "that AI tools follow when they
   remember is indistinguishable from no rule" (ADR 0009). Adopting Spec Kit would be
   re-adopting the exact failure mode this repo already paid to fix, with no CI story of its
   own to fix it a second time — `scripts/check-aidlc-sync.mjs` would still have to be
   hand-ported to gate on `.specify/` paths instead, which is all the enforcement value and
   none of the "just use the standard tool" benefit.
2. **Granularity is a mismatch for a solo portfolio site.** Spec Kit's constitution → spec →
   plan → tasks chain is sized for changes big enough to need four separate governing
   documents. This repo's own AI-DLC already dials that down: `depth: minimal` (a
   `effort-state.md` a few lines long, per ADR 0009 and `docs/how-to/run-an-aidlc-effort.md`)
   covers the common case of a one-file content edit or a small component tweak, which is most
   of this repo's 41 recorded efforts. Forcing every one of those through a four-document
   pipeline would be pure ceremony for a single maintainer working through one agent (Claude
   Code) most of the time.
3. **Retrofit is already solved here, on this codebase's own terms.** AI-DLC's
   `aidlc-docs/inception/` brownfield baseline (effort 008, ADR 0008) exists specifically to
   bolt process onto an already-built site; Spec Kit's `specify init` model assumes a project
   adopting it from the start (or willing to backfill a constitution and specs for existing
   features some other way). There is no migration path documented for Spec Kit that is
   cheaper than what already exists here.
4. **Tool-agnosticism is already won.** Spec Kit's 30+-agent support is a real differentiator
   *against* a Claude-only process — but this repo's AI-DLC rule already lives in `AGENTS.md`
   ("applies to every AI tool, not just Claude"), not in a Claude-specific file; `CLAUDE.md`
   only adds the instruction to invoke the `ai-dlc` skill at the *start* of a change. Spec
   Kit's agent breadth is not a gap AI-DLC has.
5. **Tracker coupling is a wash.** Both are tracker-agnostic by default (local markdown
   records); Spec Kit's GitHub-issue bridge is optional and additive, same shape as this
   repo's own `docs/agents/issue-tracker.md` convention for the separately-adopted engineering
   skills (`to-spec`/`to-tickets`/`triage`). Neither tool forces a tracker choice on the other.
6. **Nothing in Spec Kit's process fills a gap AI-DLC has.** `/speckit.clarify`'s pre-spec
   question pass is already covered by this repo's own `brainstorming` skill, named in
   `CLAUDE.md`'s skills table for exactly "fuzzy request, unclear scope." There is no piece of
   Spec Kit worth grafting on (option 2) that isn't already present in a shape suited to this
   repo's size.

## Consequences

- No code, workflow, or `aidlc-docs/` structure changes. This ADR is a decision *not* to
  change anything; it exists so the question doesn't get re-litigated from scratch next time
  someone (human or agent) notices Spec Kit exists.
- If a future need actually appears that AI-DLC can't serve — e.g. this repo grows a second
  contributor and needs Spec Kit's team-oriented `constitution.md`/role "bundles" — that is new
  evidence and gets its own ADR; this one only settles the question as of 2026-09.
- This decision does not touch the separately-adopted engineering skill pack
  (`to-spec`/`to-tickets`/`ask-matt`/etc., `docs/agents/issue-tracker.md`), which is a different
  layer (pre-effort ideation → ticket splitting) from AI-DLC's per-change record-keeping; the
  two already coexist and this ADR doesn't change that.

## Evidence

- `github/spec-kit` README and command reference (fetched 2026-09-05): prompt/template-driven,
  no CI enforcement; 30+ agent integrations; optional `/speckit.taskstoissues`.
- This repo's own `docs/adr/0009-ci-enforced-aidlc-recording.md`: the advisory-only version of
  this exact idea already failed here once (PRs #4, #5).
- `docs/how-to/run-an-aidlc-effort.md`: the `minimal`/`standard`/`comprehensive` depth dial and
  the `aidlc-docs/inception/` brownfield-retrofit mechanism.
- `AGENTS.md` "Change lifecycle" (tool-agnostic) vs `CLAUDE.md`'s much shorter Claude-specific
  addendum.
