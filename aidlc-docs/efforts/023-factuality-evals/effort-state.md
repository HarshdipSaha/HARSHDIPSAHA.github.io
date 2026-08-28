# Effort 023 — Factuality evals for AI-written case studies

| Field | Value |
|-------|-------|
| Ref | 023-factuality-evals |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-28 |
| Closed | 2026-08-28 |
| Baseline | effort 022 (branch `extremechange`, merged as PR #11) |
| ADRs | 0013 |
| Commits | branch `feat/factuality-evals` |
| Reconstructed | no — recorded live |

## Intent

Spec #12, tickets #14 → #15 → #16 → #17.

Twenty case studies under `content/projects/` were written by an AI agent (efforts 017 and 019) from
the source repositories' READMEs, under a rule the owner stated himself: *"tell me if u can actually
fetch their details using github api if not then don't make up and write."* That rule was unenforced
prose. A fabricated figure would render identically to a true one and pass `typecheck`, `build`, the
Playwright smoke suite and Lighthouse CI — none of which asks whether the page is *true*.

This effort makes the rule a gate: a regression suite that extracts every quantitative claim from
each case study, fetches the source repository's README through the GitHub API, and fails when a
claim is not traceable to that source. ADR 0013 records the decisions.

## Stages

| Stage | Outcome |
|-------|---------|
| Planning | Read spec #12 and tickets #14–#17. Inventoried the content: 20 MDX files, 18 with a `link`, two (BrainwavesFinland, SAAKSHI) without because their repositories are private. Confirmed `gray-matter` is already a dependency and that no test framework exists, so `node --test` (built in on Node 20) is the runner. Chose the pure-core seam — extraction and grounding separated from fetching — so the pass/fail logic is testable with no network. |
| #14 Pure core | `evals/factuality/claims.mjs` (`normalise`, `stripMarkdown`, `extractClaims`, `isGrounded`) and `evals/factuality/verdict.mjs` (classification, baseline indexing, stale rule). Neither imports anything — a test asserts that. 32 `node --test` cases over two local fixtures. |
| #15 CLI | `evals/factuality/run.mjs` reads the MDX with `gray-matter`, resolves a token (`GITHUB_TOKEN`/`GH_TOKEN`, else `gh auth token`, else unauthenticated), fetches each README with exponential backoff, classifies, prints a human report and writes JSON. Four exit codes; network exhaustion is deliberately distinct from a factuality failure. Optional judge tier in `judge.mjs`, advisory and skipped without a key. |
| #16 Triage & baseline | First run: 22 grounded, 0 baselined, **8 ungrounded**, 43 unverifiable. Every ungrounded claim triaged by hand against the README, `resume.pdf`, `src/content/site.ts` and the effort records. Two real defects fixed in the content; three claims baselined with their real source named; two more baselined as README config literals; four contained extractor precision fixes made. |
| #17 CI, docs, record | `.github/workflows/evals.yml` (**Evals / factuality**, path-filtered, report uploaded as an artifact). `AGENTS.md` commands block, CI list, Definition of done, and the evidence rule restated as enforced. `CONTEXT.md` glossary. `evals/README.md` rewritten — it previously claimed "there is no test runner wired up", which is no longer true. PR template line. ADR 0013. This record. |

## Units of work

- [x] `evals/factuality/claims.mjs` — pure extraction + normalisation + grounding, imports nothing
- [x] `evals/factuality/verdict.mjs` — pure classification, baseline indexing, stale-entry rule
- [x] `evals/factuality/sources.mjs` — the only network code: token resolution, README fetch, retry/backoff, 404 → `unverifiable`
- [x] `evals/factuality/judge.mjs` — optional LLM tier, advisory, skipped without an API key
- [x] `evals/factuality/run.mjs` — the CLI, the report, the exit codes, `--write-baseline`
- [x] `evals/factuality/claims.test.mjs` + `verdict.test.mjs` — 32 cases, no network
- [x] `evals/factuality/fixtures/` — synthetic case study + source
- [x] `evals/factuality/baseline.json` — 5 entries, each with a written reason
- [x] `content/projects/Missing-person-identification.mdx` — **defect fixed** (see below)
- [x] `content/projects/Agentic-Loan-Assistant-Chatbot.mdx` — **defect fixed** (see below)
- [x] `.github/workflows/evals.yml` — the `Evals / factuality` check
- [x] `package.json` — `test:unit`, `eval:factuality`; `@anthropic-ai/sdk` devDependency (judge tier only)
- [x] `.gitignore` — `/.evals/` (the report is a CI artifact, never committed)
- [x] `AGENTS.md`, `CONTEXT.md`, `evals/README.md`, `.github/pull_request_template.md`
- [x] `docs/adr/0013-factuality-evals-for-case-studies.md` + a row in `docs/adr/README.md`

## Triage of the first run (ticket #16)

Eight ungrounded claims. None was reflexively baselined.

### Real defects — fixed in the content, not baselined

| File | Claim as published | What the sources say | Fix |
|---|---|---|---|
| `Missing-person-identification.mdx` | "Built by team … for **Smart India Hackathon 2024**, where it placed in the **top 45**." | The README (fetched live) names the team, the stack and the deployment, and says nothing about SIH, 2024, or any placement. `resume.pdf` does not list this project at all. `src/content/site.ts` has no such achievement. No corroboration anywhere in the repository. | Rewritten to `Built by team "ERROR 404 : CHANGE FOUND?" — six members, led by me — for the Simhastha Ujjain mass-gathering problem statement, as listed in the README.` (The team roster and the Simhastha Ujjain framing *are* in the README.) |
| `Agentic-Loan-Assistant-Chatbot.mdx` | "Built for **EY Hackathon 2025**." | The README describes the system, the stack and the WhatsApp flow, and names no competition or client. `resume.pdf` dates the project "Dec 2025" but attributes it to no hackathon. | The `## Context` section now states what is true: the README records no competition or client, so none is claimed. |

Both are exactly the failure this gate exists to catch — an AI agent, instructed to write only from
the README, wrote a specific competition result that the README does not contain. Neither is
necessarily *false*; both are **unsupported**, and the honest move was to stop asserting them rather
than to invent a baseline reason. If the owner has a certificate for either, the claim can be
restored with a baseline entry naming it.

### True but not in the README — baselined, with the real source named

| File | Claim | Recorded source |
|---|---|---|
| `APT.mdx` | `top 30` (AI4Humanity Summit) | `resume.pdf`, Projects → *Accurate Precise Timely*: "Selected among the top 30 teams to pitch offline at the AI4Humanity Summit … in a hackathon of 150+ teams (Certificate)"; restated in `src/content/site.ts` (`experience` achievements). |
| `pySdf.mdx` | `INCAM 2026` | `resume.pdf`, Research Intern – IIT Madras: "Selected for oral presentation at INCAM 2026, at IIT Kanpur"; restated in `src/content/site.ts` line 117. |
| `AtomNet.mdx` | `EMNLP 2026` | Owner-supplied submission status, recorded in `aidlc-docs/efforts/006-atomnet-project/effort-state.md` and `requirements-delta.md` R-027. The AtomNet README's only EMNLP mention is a citation of ASTRA (Kwon et al., **EMNLP 2025**) — a different paper. |
| `tinySafetyNet.mdx` | `22050 Hz` | In the README, as the config literal `"sample_rate": 22050,  # Audio Hz (Must match model training)`. The unit sits on the far side of a comment marker, so the unit-binding rule cannot attach it. Baselined rather than loosening that rule. |
| `tinySafetyNet.mdx` | `0.5 s` | In the README, as the config literal `"chunk_duration": 0.5,  # Responsiveness`. The seconds unit appears only in the case study's prose. Same reasoning. |

### Extractor false positives — fixed in the core, not baselined

None of the eight ungrounded claims was a false positive; all eight were genuine claims. Four
precision defects were nonetheless visible among the *grounded* and *unverifiable* claims and were
fixed in `claims.mjs`, each with a test:

- `FY2025-26` yielded a spurious count `26`. The tail of a fiscal-year range is now excluded.
- `Theme 05` yielded a spurious count `05`. `theme`/`track`/`round` joined the enumeration
  deny-list alongside `stage`, `step`, `figure`, `table`, `channel`, `label`.
- `labels 0 = background, 1 = edema, 2 = tumor` yielded `2` as a count. A number immediately
  followed by `=` is now read as a legend key — unless it carries a currency symbol or a unit, so an
  arithmetic line (`₹2.4 L + ₹2.9 L = ₹5.3 L`) keeps all three of its figures.
- Separately, `₹2.4 L` was extracted without its magnitude. `L` is now recognised as a lakh
  magnitude, so the claim is `₹2.4 L` and matches `Rs 2.4 lakh` in a source.

Known and accepted imprecision: `404` in the team name `"ERROR 404 : CHANGE FOUND?"` is extracted as
a count. It is grounded in all three case studies that mention it (the name is in each README), so it
costs nothing; excluding digits inside proper nouns is not a contained fix and was not attempted.

## Report counts (ticket #16 acceptance criterion)

| Run | grounded | baselined | ungrounded | unverifiable | total | exit |
|---|---|---|---|---|---|---|
| First, before triage | 22 | 0 | **8** | 43 | 73 | 1 |
| After extractor fixes and the two content fixes | 21 | 0 | 5 | 41 | 67 | 1 |
| **Final, with the committed baseline** | **21** | **5** | **0** | **41** | **67** | **0** |

The 41 unverifiable claims are the two case studies whose source repositories are private:
`BrainwavesFinland.mdx` (23) and `SAAKSHI.mdx` (18). Both are named in the report on every run, with
the reason printed, rather than skipped silently.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean, exit 0 |
| `npm run build` | succeeds, 30 static pages, postbuild mirrored 25 prefetch payloads |
| `npm run test:unit` | 32 tests, 32 pass, 0 fail (`node --test evals`, no network) |
| `npm run eval:factuality` | exit 0 — 21 grounded, 5 baselined, 0 ungrounded, 41 unverifiable |
| Judge tier with no API key | skipped with a printed notice; run still exits 0 |
| Private-source case studies | `BrainwavesFinland.mdx` and `SAAKSHI.mdx` reported by name as unverifiable |
| **The gate actually gates** | Scratch commit `9692e3a` added an invented sentence to `BrandDiffusion.mdx` — *"scoring 97.3 % on brand compliance across 1,842 generated layouts"*. Run went **red, exit 1**, `2 ungrounded`, naming the file, both claims (`97.3 %` percentage, `1,842` count), the surrounding phrase and the source (`Cubix33/brand-aware-generation README`). Scratch commit reverted and dropped: **exit 0**, `21 grounded · 5 baselined · 0 ungrounded · 41 unverifiable`. |
| Stale baseline entry | Covered by a unit test; deleting a baselined claim from the content makes the run exit 1 with the entry named |
| `npm run check:aidlc` | passes |
| `npm run test:smoke` / Lighthouse | not run locally — no rendering code was touched and the ports were in use by a parallel effort; CI's *Quality gates* workflow covers both |

## Notes

- The gate is a **regression** gate by design. It fails on claims that are new relative to the
  committed baseline, not on every unsourced number. Tightening the baseline — for example by
  chasing down the 41 unverifiable claims when those repositories go public — is later, deliberate
  work.
- The judge tier is real code that never runs here. That is deliberate: spec #12 requires the suite
  to work with no API key configured, because a gate that is dead by default is worse than no gate.
  Its verdicts are advisory even when it does run.
- `evals/README.md` previously stated "There is no test runner wired up … nothing fails a build if
  one regresses". That is now false for `evals/factuality/` and true only for
  `repo-conventions.eval.md`; the file was rewritten to separate the two.
- One devDependency added: `@anthropic-ai/sdk`, imported dynamically and used only by the judge tier.
