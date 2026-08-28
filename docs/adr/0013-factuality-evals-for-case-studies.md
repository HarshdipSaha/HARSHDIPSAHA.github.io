# 0013 — Factuality evals: case-study claims gated against their source repositories

**Status:** Accepted · **Date:** 2026-08-28 · **Supersedes:** —

## Context

Twenty project case studies under `content/projects/` were written by an AI agent (effort 017,
extended by effort 019) from the source repositories' READMEs, under a rule the owner stated in his
own words: *"tell me if u can actually fetch their details using github api if not then don't make up
and write."*

That rule was **unenforced**. It lived in prose in an effort record and in `AGENTS.md`. Nothing
stopped a future agent — or a future owner — from writing "1.4 cm median error" or
"462 instances · ₹1.19 crore" into an MDX file from memory, from a hallucination, or from a source
that has since changed. The claim would render identically to a true one and ship through every
existing gate.

The existing gates each answer a different question, and none of them is this one:

| Gate | Question it answers |
|---|---|
| `npm run typecheck` | Does the code compile? |
| `npm run build` | Does the site export? |
| Smoke (Playwright), ADR 0012 | Does every page load, render and scroll? |
| Lighthouse CI, ADR 0012 | Is it fast and accessible? |
| `aidlc-check`, ADR 0009 | Did the change ship with its record? |
| — | **Is what it says true?** |

That last row is the one category of defect this repo's gates could not see, on a portfolio whose
entire value proposition is that its claims are verifiable. Running the first version of this gate
found two case studies stating competition results that appear in neither the source README, the
owner's résumé, nor `src/content/site.ts` — exactly the failure mode predicted.

## Decision

1. **A standalone eval harness under `evals/factuality/`, invoked as an npm script, not folded into
   Playwright.** The smoke suite answers "does the site work"; this answers "is the site true". They
   fail for unrelated reasons, need unrelated debugging, and should be separately readable in the
   checks list. It is Node ESM run directly, consistent with the existing `scripts/*.mjs` convention.

2. **Ground truth is the source repository's README, fetched at run time through the GitHub API,**
   identified by the `link` field already in each case study's frontmatter. Nothing is vendored: a
   committed copy would drift from the source and reintroduce exactly the staleness the gate exists to
   prevent. Every repository read is public, so the workflow's `GITHUB_TOKEN` (which cannot read other
   repositories) is sufficient; it buys a rate limit, not access.

3. **Claim extraction is deterministic and quantitative.** The extractor pulls digit-bearing claims —
   measurements, percentages, counts, currency, ranks, years — from the MDX body, keeping the
   surrounding phrase for the report. Prose assertions without numbers are out of scope for this tier:
   a regex cannot judge them, and pretending otherwise would produce false confidence.

4. **Grounding is normalised literal matching, biased toward "ungrounded".** Normalisation equates
   thousands separators, unit spacing, unicode punctuation, spelled-out percent and degree, and Indian
   currency magnitudes. A unit binds to its number, so `1.4 cm` is never grounded by an unrelated
   `1.4`. A false "grounded" verdict is the single failure mode that defeats the gate's purpose, so
   ambiguity resolves to ungrounded and is settled by the baseline — not by a looser matcher.

5. **A committed baseline makes this a regression gate, not a purity gate.** Twenty case studies
   already existed; a check that went red on all of them on day one would be switched off within a
   week. `evals/factuality/baseline.json` records each currently-accepted ungrounded claim with a
   **mandatory written reason naming where the number actually comes from**. Three rules keep it
   honest: an empty reason is an error; the `TODO` placeholder the `--write-baseline` skeleton leaves
   is an error; and a **stale** entry — one whose claim no longer appears in any case study — is an
   error, so the baseline cannot silently accumulate dead entries.

6. **Case studies with no fetchable source are `unverifiable`, reported by name.** Two exist
   (BrainwavesFinland, SAAKSHI); both point at private repositories and carry no `link`. A 404 from
   GitHub — repository gone, renamed or made private — is handled the same way, with the reason
   printed. "Unverified" is a visible number in the report rather than an absence.

7. **An optional LLM-judge tier, gated on an API key being present, and advisory only.** When a key
   exists, prose assertions are judged against the source with a rubric and reported. When no key
   exists — the current state of this repository — the tier prints a skip notice and the run still
   succeeds. **The gate must never be dead by default:** a check that requires a secret this repo does
   not have would be worse than no check at all. Its verdicts never change the exit code, because a
   model's opinion is not a gate.

8. **Exit code is the contract, and network failure is a distinct code.**
   `0` grounded/baselined/unverifiable · `1` factuality failure · `2` network exhaustion after retries
   · `3` harness error. Separating 1 from 2 means a red check is never ambiguous between "the network
   broke" and "you published a false claim".

9. **The pure core is the test seam.** `claims.mjs` (extraction, normalisation, grounding) and
   `verdict.mjs` (classification, baseline, stale rule) import nothing — no filesystem, no network —
   and are covered by `node --test` over local fixtures in milliseconds. Fetching lives alone in
   `sources.mjs`. Tests assert verdicts and exit codes, never the report's prose, which will change.

10. **`.github/workflows/evals.yml` runs the gate on pull requests to `main`, filtered to diffs that
    touch `content/projects/**` or `evals/**`.** Running it on a diff that cannot change the result
    spends GitHub API budget for nothing. The JSON report is uploaded as the `factuality-report`
    artifact so a reviewer reads the full result without re-running anything.

## Consequences

- The evidence rule in `AGENTS.md` moves from advisory prose to an enforced gate. An agent can no
  longer violate it by accident; it can only violate it by writing a baseline entry that lies, which
  is visible in a diff and reviewable like any other change.
- Adding a case study now carries a small obligation: numbers must be traceable, or baselined with a
  reason. That is the intended cost.
- Tightening the baseline is later, deliberate work. Five entries exist today; each names a real
  source (the owner's `resume.pdf`, `src/content/site.ts`, an effort record, or a config literal in
  the README that the unit-binding rule cannot match).
- The gate cannot see the 41 claims in the two private-source case studies. It says so, by name, on
  every run. That is a visible limit rather than a silent one.
- Case studies whose numbers are all grounded pass silently, so editing prose without adding claims
  costs nothing.
- One devDependency was added, `@anthropic-ai/sdk`, used only by the judge tier and imported
  dynamically so a checkout without it still runs the suite end to end.

## Evidence

- First run against the twenty case studies, before triage: 22 grounded, 0 baselined, 8 ungrounded,
  43 unverifiable.
- Triage found two real defects. `Missing-person-identification.mdx` claimed "Smart India Hackathon
  2024, where it placed in the top 45" and `Agentic-Loan-Assistant-Chatbot.mdx` claimed "Built for EY
  Hackathon 2025" — neither appears in the project's README, in `resume.pdf`, or anywhere in the
  repository. Both sentences were rewritten to state only what the README supports.
- Three ungrounded claims were true but sourced elsewhere and were baselined with the source named:
  APT's "top 30" (`resume.pdf` and `site.ts`), pySdf's "INCAM 2026" (`resume.pdf` and `site.ts`),
  AtoM-Net's "EMNLP 2026" (effort 006's record). Two more — tinySafetyNet's `22050 Hz` and `0.5 s` —
  are in the README as configuration literals whose units live in an adjacent comment, and were
  baselined rather than relaxing the unit-binding rule.
- Final run: 21 grounded, 5 baselined, 0 ungrounded, 41 unverifiable, exit 0.
- The gate was proved to gate: adding an invented figure to a case study on a scratch commit turned
  the run red naming the file, the claim and the source; reverting turned it green. Recorded in
  effort 023's verification table.
