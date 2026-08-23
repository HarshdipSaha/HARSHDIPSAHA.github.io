# 0002 — Static export to GitHub Pages via Actions

Status: Accepted   Date: 2026-01-27   Supersedes: —

## Context
The portfolio needed a host the day the template landed. It has no accounts, no database, no
authenticated surface — every page is knowable at build time. The domain `harshdipsaha.tech`
had to point at it.

Options considered:

- **Vercel.** The default for Next.js and the least friction, with ISR and image optimization
  for free. Lost on ownership and cost surface: it introduces a vendor account in the critical
  path of a site whose whole point is being a durable, self-owned artifact, and the free tier's
  limits are the host's to change.
- **A Node server on a VPS / container host.** Full Next.js runtime, but it means patching,
  TLS renewal, uptime monitoring and a monthly bill for a page that changes a few times a year.
- **GitHub Pages with `output: "export"`.** The repo already lives on GitHub; Pages is free,
  serves a custom domain with managed TLS, has no cold starts and nothing to operate.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
Build with Next.js `output: "export"` and publish the `out/` directory to GitHub Pages from a
GitHub Actions workflow (Node 20, `npm install`, `npm run build`, upload `out/`,
`actions/deploy-pages@v4`).

## Consequences
There is no server runtime. That rules out API routes, server actions, ISR, on-demand
revalidation, middleware and `next/image` optimization — `images.unoptimized: true` is forced,
so images must be pre-sized at source (see ADR 0005). Anything dynamic has to be client-side or
resolved at build time, and every content change requires a full rebuild and redeploy. In
exchange: zero ops, zero cost, no cold starts, and the deployed artifact is a plain directory
of files.

## Evidence
- `b39a13d` and `50be3ad` (2026-01-27) — two successive edits to `.github/workflows/deploy.yml`
  converging on the working Pages job. Getting the export/publish path right took two passes,
  which is the real cost of this decision.
