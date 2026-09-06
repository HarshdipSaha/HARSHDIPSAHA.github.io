# Requirements delta — Effort 050

## Added

- **`docs/explanation/ai-dlc-external-evidence.md`** — a sourced review of external research
  (web + arXiv) on whether structured decision/effort records measurably help agent token cost and
  performance, versus relying on `git log`/commit history. Cites four controlled studies
  (arXiv:2602.11988, 2605.10039, 2601.20404, 2511.12884) plus commit-message-quality literature,
  Anthropic's context-engineering guidance, and AWS's own AI-DLC framing.
- **A "See also" cross-link** in `docs/explanation/ai-dlc-in-this-repo.md` pointing to the new
  document.
- **This effort's own record** (`aidlc-docs/efforts/050-ai-dlc-external-evidence/`).

## Not changed

- **No code, config, or existing content changed.** This is a docs-only effort; nothing under
  `src/`, `scripts/`, or `content/` was touched (the one regenerated file, `src/data/process-stats.json`,
  is a **build output**, not hand-edited — its effort/ADR counts update automatically because effort
  050 now exists, per `scripts/build-process-stats.mjs`'s own contract).
- **ADR 0019 is not amended or superseded.** It answers a different question (which tool implements
  AI-DLC) and this repo's append-only ADR convention means it is never edited after acceptance; this
  effort only adds a cross-reference to it from the new document.
- **The `minimal` depth dial in `docs/how-to/run-an-aidlc-effort.md` is not changed.** The new
  document's findings are presented as consistent with that existing dial, not as a proposal to
  loosen or tighten it.
