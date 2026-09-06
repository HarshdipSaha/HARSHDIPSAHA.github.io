# Does AI-DLC actually help? What the external evidence says

## The question, stated plainly

This repo runs AI-DLC: every non-trivial change gets a numbered effort record, architectural
decisions get an ADR, and a CI gate (`aidlc-check`) fails a PR that skips the paperwork. ADR 0019
already settled *which tool* implements that idea (this repo's own AI-DLC over GitHub's Spec Kit).
This document asks a different, more basic question: is the underlying practice — writing
structured records instead of relying on `git log` — actually supported by evidence on token cost
and agent performance, or is it decoration?

The honest answer is **mixed, and more mixed than this repo's own framing has previously stated
outright.** The mechanism that motivated AI-DLC here (`docs/explanation/ai-dlc-in-this-repo.md`:
"a diff cannot tell you what was rejected") is real and well-supported. The specific claim that
*more* written record equals *better or cheaper* agent output is not — the best controlled study
available found the opposite for auto-generated content, and a null result for hand-written
content. This document exists so that claim is checkable, the way every other claim on this site
is expected to be.

## Why "just read the commit history" doesn't substitute

Git history looks like it should already contain what an effort record captures. Empirically, it
usually doesn't. Studies of real open-source commit corpora find a large share of commit messages
carry little or no rationale — one widely-cited analysis of five popular OSS projects found an
average of 44% low-quality messages; a separate survey of over 23,000 projects found 14% of commit
messages were completely empty and only about 10% contained a normal descriptive sentence at all
(see References). This repo's own history is the worked example: the first ~20 commits read `lets
see`, `hmmm`, `okays`, `soz` — one of them 12,517 lines — and the reasoning behind adopting the
Once UI template, committing to static export, and building the drop-zone image pipeline had to be
reconstructed from diffs in August 2026 (`docs/explanation/ai-dlc-in-this-repo.md`). A diff shows
what changed. It is structurally silent on what was *rejected*, which is usually the more valuable
half of a decision record.

So the premise "the model can just read commit history instead" fails for a mechanical reason, not
a philosophical one: the information a decision record is meant to hold frequently does not exist
anywhere else in the repository to be read. This part of the case for AI-DLC holds up.

## Where the evidence gets uncomfortable

The question that matters for a coding-agent workflow is narrower than "should decisions be
recorded" — it's "does giving the agent more persistent written context make it faster, cheaper,
or more correct." Four pieces of recent, controlled research bear on this directly, and none of
them was available when ADR 0008 adopted AI-DLC:

**1. The best-designed study found no benefit and a real cost.** ETH Zurich's SRI Lab built
AGENTbench — 138 real coding tasks across niche public repositories, tested against Claude Code
(Sonnet 4.5), Codex (GPT-5.2 and GPT-5.1-mini), and Qwen3-Coder (arXiv:2602.11988, Feb 2026).
Auto-generated context files changed success rate by roughly −0.5% to −2% depending on benchmark
(not statistically significant, p = 0.87 and p = 0.37) while increasing inference cost by
20–23%. Developer-written files did marginally better — about +2.4% on one benchmark, significant
against the auto-generated condition (p = 0.038) but **not significant against having no file at
all** (p = 0.21) — and still cost up to 19% more. No content category (architecture, testing,
conventions) showed a significant effect in isolation. Most tellingly: when the researchers
stripped a repository's existing documentation, context files started helping *more*. The
implication is that a meaningful share of the harm is **redundancy** — a file that duplicates what
the README or the code already states costs tokens without adding signal.

**2. File structure doesn't matter; session length does.** A separate factorial study (1,650
Claude Code CLI sessions, 16,050 function-level observations, arXiv:2605.10039) manipulated
config-file size, instruction position, architecture, and conflicting instructions. None of the
four produced a detectable effect on instruction compliance — the size and conflict nulls are
affirmatively supported by Bayes factors, not just failures to find a difference. What *did* show
an effect, found during analysis rather than hypothesized in advance: compliance drops
approximately 5.6% in odds per additional function the agent generates within a session (OR =
0.944), regardless of how the config file was written. A well-written record helps most at the
start of a session — its influence measurably decays the longer the agent works, which is a
limitation no amount of better writing fixes.

**3. The one clearly positive result measures a narrower claim than "better."** A paired study
of 124 small pull requests (≤100 lines, ≤5 files) across 10 repositories with existing AGENTS.md
files (arXiv:2601.20404) found real efficiency gains running Codex with the file present: 20–29%
faster wall-clock time, 17–20% fewer output tokens. This is the strongest positive data point for
this repo's own practice — but the study did not measure success rate or correctness, only
speed and token count, with a single agent/model on a small, favorably-selected sample. It shows a
context file can save an agent from re-discovering commands and layout. It does not show that a
narrative decision record makes the agent's output *better*.

**4. What real context files contain, empirically, is not decision rationale.** A survey of 2,303
CLAUDE.md/AGENTS.md files across 1,925 repositories (arXiv:2511.12884) found the dominant content
is operational — testing (75%), implementation details (69.9%), architecture (67.7%), build
commands (62.3%) — not historical rationale or rejected alternatives. These files are also
actively maintained (59–67% receive multiple commits, updated roughly daily in short bursts), which
makes them closer to a living operating manual than an append-only decision log. This repo's split
— `AGENTS.md` as the living operating manual, `docs/adr/` as the append-only decision log,
`aidlc-docs/efforts/` as the per-change record — is a structurally *better* separation of these
concerns than the single-file convention most repositories use, which may be part of why ADR
0019's argument about CI enforcement (not content volume) is the load-bearing one.

## Applying this to the repo's own practice — two worked examples

**A record that is clearly justified by this evidence.** ADR 0011's decision to rebuild the site
from scratch on the thine.com model records that two prior redesigns on the Once UI template "hit
the same ceiling" — a rejected-alternatives statement no diff could ever recover, because the
alternatives were abandoned, not merged. This is exactly the category the redundancy finding says
*doesn't* hurt: it exists nowhere else, so writing it down adds signal rather than duplicating it.

**A record shape the evidence says to watch for.** Several `aidlc-docs/audit.md` construction
entries (e.g. effort 039, 040, 047) restate verification output — test counts, build output, file
byte counts — that also exists in the PR's own CI logs and `git show` output. That's not wasted by
accident; per `docs/how-to/run-an-aidlc-effort.md` step 8, "paste real output, not a claim" is the
whole point of the verification step, and CI logs are not guaranteed to be retained or searchable
by a future agent the way a committed markdown file is. But it is worth naming plainly, per the
evidence above: this is the redundant category, kept deliberately for durability rather than for
any token-efficiency reason, and if this repo's process ever grows in the direction of trimming
ceremony, this is where the trim has the least evidential cost.

## What this doesn't settle

None of the four studies above tested this repo's exact instrument — a numbered effort record plus
an append-only ADR log plus a CI enforcement gate. The closest is the AGENTbench redundancy finding,
which is about a single CLAUDE.md/AGENTS.md file, not a multi-file structured log. ADR 0019's core
argument — that AI-DLC's value-add *is* the CI enforcement, not the volume of prose it produces —
is not contradicted by any of this; if anything, the redundancy finding sharpens it: enforcement
guarantees a record *exists*, which is the part with no substitute, while the evidence above is
silent on whether writing more of it than the `minimal` depth dial already asks for buys anything
further. This document does not propose changing that dial. It exists so the next time someone —
human or agent — asks whether the ceremony is worth it, the answer is sourced rather than assumed,
on either side.

## References

- Gloaguen, Mündler, Müller, Raychev, Vechev — *Evaluating AGENTS.md: Are Repository-Level Context
  Files Helpful for Coding Agents?* ETH Zurich SRI Lab, arXiv:2602.11988 (Feb 2026).
  <https://arxiv.org/pdf/2602.11988>
- McMillan, D. (HxAI Australia) — *Instruction Adherence in Coding Agent Configuration Files: A
  Factorial Study of Four File-Structure Variables.* arXiv:2605.10039.
  <https://arxiv.org/pdf/2605.10039>
- *On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents.* arXiv:2601.20404.
  <https://arxiv.org/html/2601.20404v2>
- *Agent READMEs: An Empirical Study of Context Files for Agentic Coding.* arXiv:2511.12884.
  <https://arxiv.org/html/2511.12884v1>
- Anthropic — *Effective context engineering for AI agents.*
  <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- Tian et al. / commit-message quality literature — *Commit Message Matters: Investigating Impact
  and Evolution of Commit Message Quality*, ICSE 2023.
  <https://dl.acm.org/doi/abs/10.1109/ICSE48619.2023.00076>
- Chroma — *Context Rot: How Increasing Input Tokens Impacts LLM Performance.*
  <https://www.trychroma.com/research/context-rot>
- AWS — *The Answer to AI Development Chaos: Systematic AI-DLC Practices* (AI-DLC's own framing:
  three phases, enterprise/regulated-industry flagship use case).
  <https://builder.aws.com/content/35b5OaMGqCxMm3y3yOTjUSnMaj3/the-answer-to-ai-development-chaos-systematic-ai-dlc-practices>
- AWS — *AI-Driven Development Lifecycle for Financial Services.*
  <https://aws.amazon.com/blogs/industries/ai-driven-development-lifecycle-for-financial-services/>
- GitHub — `github/spec-kit` (Spec-Driven Development toolkit, the alternative ADR 0019 declined).
  <https://github.com/github/spec-kit>

## See also

- [ai-dlc-in-this-repo.md](./ai-dlc-in-this-repo.md) — what AI-DLC is and why this repo adopted it.
- [../adr/0019-keep-aidlc-over-github-spec-kit.md](../adr/0019-keep-aidlc-over-github-spec-kit.md)
  — the adjacent, already-settled question ("which tool"), not the question this document asks
  ("does the practice pay for itself").
- [../how-to/run-an-aidlc-effort.md](../how-to/run-an-aidlc-effort.md) — the `minimal` depth dial
  this document's findings are consistent with, not a proposal to change.
