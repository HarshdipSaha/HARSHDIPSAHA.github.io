# Effort 006 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-027 | AtoM-Net appears as a project under `/work` | Current research work, in review at EMNLP 2026 |
| R-028 | The AtoM-Net page documents all four pipeline stages (atomic inference, economic consistency validator, symbolic decision engine, reflexion layer) | The architecture is the substance of the work |
| R-029 | The project page carries publication status and a source link (`https://github.com/HarshdipSaha/AtomNet`) | Reviewer-facing credibility |
| R-030 | The AtoM-Net architecture diagram ships as `public/images/projects/atomnet.png` via the sync pipeline | Complies with R-016/R-017 — no hand-placed images |
| R-031 | Research interests include "LLM Safety" and "Alignment" | Aligns the About page with current research direction |

## CHANGED
_None._

## UNCHANGED but affected
- R-011 research-interests block — extended with two entries, shape unchanged.
- R-016/R-017 drop-zone image pipeline — used as-is to deliver the diagram.
- R-019/R-020 `FILE_MAP` — the fallback path was exercised rather than the mapped path.
- Projects-as-MDX model from ADR 0007 — followed, not redefined.

## Acceptance criteria
- [x] `src/app/work/projects/AtomNet.mdx` exists and renders under `/work`
- [x] All four pipeline stages described
- [x] Status "in review at EMNLP 2026" and GitHub link present
- [x] `project_images/atomnet.png` syncs to `public/images/projects/atomnet.png`
- [x] "LLM Safety" and "Alignment" present in `about.researchInterests`
- [x] `npx tsc --noEmit` clean and dev server compiles `/work` and `/about` without errors
