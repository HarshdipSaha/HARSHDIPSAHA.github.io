# Effort 006 — AtoM-Net project

| Field | Value |
|-------|-------|
| Ref | 006-atomnet-project |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-23 |
| Closed | 2026-08-23 |
| Baseline | aidlc-docs/inception/ |
| ADRs | none — follows the project model already established in docs/adr/0007-*.md |
| Commits | `1cde09f` (PR #2) |
| Reconstructed | yes — backfilled 2026-08-23 from commit diffs |

## Intent
Publish AtoM-Net as a project on the site: an MDX project page describing the four-stage cognitive neuro-symbolic pipeline, its architecture diagram, and two additional research interests.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | Recorded in the PR #2 body. |
| Functional design | No new components or routes — an MDX file under the existing `src/app/work/projects/` collection (model set by ADR 0007). |
| NFRs | Type safety: `npx tsc --noEmit`. Image delivered through the effort-004 sync pipeline. |
| Code | `src/app/work/projects/AtomNet.mdx` (24 lines); `project_images/atomnet.png`; `src/resources/content.tsx` (+2). |
| Build & test | `npx tsc --noEmit` clean; dev server compiled `/work` and `/about` with no errors. |

## Units of work
- [x] Project page — `src/app/work/projects/AtomNet.mdx` (24 lines)
- [x] Architecture diagram — `project_images/atomnet.png`, synced to `public/images/projects/atomnet.png`
- [x] Research interests extended with "LLM Safety" and "Alignment" — `src/resources/content.tsx` (+2)

### Pipeline documented in the MDX
| Stage | Content |
|-------|---------|
| 1 | Atomic inference — LLM semantic parsing of cheap talk + deterministic parsing of costly signals |
| 2 | Economic consistency validator — symbolic contradiction function, decay factor, deception risk |
| 3 | Symbolic decision engine — exhaustive 64-deal enumeration + expected-utility maximization |
| 4 | Reflexion layer — inter-game learning via LLM self-critique |

Status published as "in review at EMNLP 2026"; link `https://github.com/HarshdipSaha/AtomNet`.

## Verification
`npx tsc --noEmit` clean. Dev server compiled `/work` and `/about` with no errors; the project card and diagram rendered. Reviewed as PR #2.

## Notes
- The image was added without a `FILE_MAP` entry in `scripts/sync-project-images.mjs` and relied on the kebab-case fallback (R-020). Harmless here because `atomnet.png` is already kebab-case, but it is exactly the foot-gun flagged in effort 004. Follow-up: add an explicit `FILE_MAP` entry.
- No ADR: this follows the established project-as-MDX model rather than deciding anything new.
