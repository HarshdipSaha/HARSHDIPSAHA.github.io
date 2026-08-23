# Effort 003 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-011 | About page displays a research-interests block | Signals research direction to academic readers |
| R-012 | About page displays a tech-stack strip with icons | Fast scannable capability signal for recruiters |
| R-013 | All page content is typed via `src/types/content.types.ts` | Content errors surface at compile time, not render time |
| R-014 | Icons resolve through a single registry, `src/resources/icons.ts` | Avoids scattered icon imports across components |
| R-015 | Copy may embed accent spans (JSX) for inline emphasis | Styling control inside prose without a markdown pipeline |

## CHANGED
| ID | Was | Now | Rationale |
|----|-----|-----|-----------|
| R-001 | About page rendered with template-supplied sections | About page renders hand-written project-specific components | Template sections did not match the content Harshdip needed to present |

## UNCHANGED but affected
- R-007 repo-root `src/**` layout — new components slot into it unchanged.
- R-009 `src/utils/meta.ts` — About metadata continues to flow through it.

## Acceptance criteria
- [x] `ResearchInterestsBlock.tsx` and `TechStackStrip.tsx` exist and render on `/about`
- [x] `techStack` and `researchInterests` data live in `src/resources/content.tsx`
- [x] New content shapes are typed in `src/types/content.types.ts`
- [x] Every icon used resolves through `src/resources/icons.ts`
- [x] Accent-span classes styled in `custom.css`
