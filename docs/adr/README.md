# Architecture Decision Records

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-onceui-nextjs-portfolio-template.md) | Adopt the Once UI "Magic Portfolio" Next.js template | Superseded by 0011 | 2026-01-27 |
| [0002](0002-static-export-github-pages.md) | Static export to GitHub Pages via Actions | Accepted | 2026-01-27 |
| [0003](0003-flatten-template-into-repo-root.md) | Flatten `template/` into the repo root | Accepted | 2026-01-28 |
| [0004](0004-content-as-code-typed-schema.md) | Content as code, typed against a schema | Accepted | 2026-01-28 |
| [0005](0005-drop-zone-image-sync-pipeline.md) | Drop-zone image directories synced into `public/` by build hooks | Accepted | 2026-01-28 |
| [0006](0006-prune-template-demo-content.md) | Delete the template's demo content and dark the `/blog` route | Accepted | 2026-01-28 |
| [0007](0007-mdx-per-project-content-model.md) | One MDX file per project | Accepted | 2026-01-27 |
| [0008](0008-adopt-ai-dlc-and-docs-first-structure.md) | Adopt AI-DLC and a docs-first repo structure | Accepted | 2026-08-23 |
| [0009](0009-ci-enforced-aidlc-recording.md) | CI-enforced AI-DLC recording | Accepted | 2026-08-23 |
| [0010](0010-segmentation-overlay-design-system.md) | Segmentation-overlay design system, and a home page that is not the catalogue | Superseded by 0011 | 2026-08-25 |
| [0011](0011-rebuild-from-scratch-on-thine-model.md) | Rebuild the site from scratch on the thine.com model | Accepted | 2026-08-25 |
| [0012](0012-pr-quality-gates-smoke-and-lighthouse.md) | PR quality gates: browser smoke test and Lighthouse CI | Accepted | 2026-08-27 |
| [0013](0013-factuality-evals-for-case-studies.md) | Factuality evals: case-study claims gated against their source repositories | Accepted | 2026-08-28 |
| [0014](0014-agent-facing-site-llms-txt-and-webmcp.md) | An agent-facing surface: generated `llms.txt`, and WebMCP as progressive enhancement | Accepted | 2026-08-28 |
| [0015](0015-ai-crawler-access-policy.md) | AI crawler access policy at the edge: allow retrieval, deny training | Accepted | 2026-08-31 |
| [0016](0016-writing-route.md) | Publish `content/writing/*.mdx` at `/writing`, outside the factuality gate | Superseded by 0017 | 2026-09-03 |
| [0017](0017-remove-writing-route.md) | Remove the `/writing` route; the three posts are not the owner's own writing | Accepted | 2026-09-03 |

Every record uses the same four-part shape — a `Status / Date / Supersedes` line, then
`Context`, `Decision`, `Consequences`, and an optional `Evidence` section citing the commits
that ground it. One decision per file: if a change involves two decisions, it gets two records.
Records are append-only — to reverse one, write a new ADR and mark the old one superseded.
ADRs 0001-0007 were backfilled on 2026-08-23 and are reconstructions from commit diffs, not
contemporaneous records; ADR 0008 explains why.
