# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: research supervisors, lab PIs, and PhD/research-programme admissions.** They arrive from a
paper, a referral, or an application, usually with minutes to decide whether this person does real
research. Their job is to judge research substance fast: what was investigated, what result was
obtained, whether it was peer-reviewed, and whether the person can carry a problem end to end.

**Secondary: AI/SDE recruiters and hiring engineers.** They arrive from a résumé link or GitHub and
need shipped-systems evidence and engineering depth. Real, but explicitly weighted below the research
audience — they are served without being allowed to set the page's agenda.

**Tertiary: collaborators, and AI agents maintaining this repo** (see `AGENTS.md`, `CONTEXT.md`).

## Product Purpose

Harshdip Saha's personal portfolio and public research surface. It replaces a CV and doubles as a
showcase of how the work is produced. Success is a supervisor or recruiter forming an accurate,
favourable judgement of research capability within the first viewport and one scroll — and having a
reason to keep reading.

## Positioning

Two claims a neighbouring student portfolio could not truthfully copy:

1. **Peer-reviewed research with a placed result** — RECAP-Net, World Rank 3 in the BraTS Lighthouse
   2025 Tumor Progression Challenge, oral presentation at MICCAI 2025, published in Springer LNCS.
2. **The repo documents its own process** — AI-DLC efforts, ADRs, and a public `/process` page. The
   site is evidence of engineering practice, not just a description of it.

## Operating Context

Read in a browser, desktop and mobile, often in a quick evaluation pass alongside a résumé PDF
(`/resume.pdf`) and GitHub. Frequently reached by direct link to a single route rather than through
the homepage, so every route must stand alone. Both light and dark appearance are in real use.

## Capabilities and Constraints

- **Static export.** `output: "export"` — no server runtime, no API routes, no SSR/ISR. Everything
  prerenders to `out/`. All motion and interactivity is client-side or CSS.
- **GitHub Pages hosting.** Static files only; no redirects/rewrites middleware.
- **`images.unoptimized: true`** — no `next/image` optimization; correctly-sized files must be shipped.
- **Design layer: confirmed breakout.** Once UI (`@once-ui-system/core`) is retained for primitives,
  but custom components and a real motion layer are authorized where the design requires it.
  Full removal of Once UI is out of scope.
- **Theme toggle is a hard requirement.** Light and dark must both ship and both be good. The base
  palette is monochrome; colour is used as accent only.
- **Content-as-code.** Copy lives in `src/resources/content.tsx` (typed by
  `src/types/content.types.ts`) and per-project MDX, never inline in components.
- **Generated paths are not hand-editable:** `public/images/**`, `src/data/gallery.json`, `out/`.
  Their sources are the drop-zones and `scripts/sync-*.mjs`.
- **Change lifecycle is enforced.** Substantive changes require an AI-DLC effort record; CI
  (`aidlc-check`) fails PRs without one. See `AGENTS.md`.

## Brand Commitments

- Name: Harshdip Saha. Domains: `harshdipsaha.tech` (canonical), `harshdipsaha.github.io`.
- Voice: plain and substantive, first person, no hype. Claims are specific and checkable.
- Binding visual constraint recorded from the user: **monochrome base ("black and white") with a
  working light/dark toggle.**

## Evidence on Hand

Real, verifiable, already in the repo:

- **Publication** — RECAP-Net / BraTS-PRO 2025, MICCAI 2025 South Korea, World Rank 3, oral
  presentation. `https://link.springer.com/10.1007/978-3-032-16370-7_23`. Image at
  `public/images/publications/miccai.jpg`.
- **Research posts** — UG researcher at NexGenLab NSUT; Research Intern (Scientific Computing),
  IIT Madras, developing PyAMorph (formerly pySdf); oral presentation accepted at INCAM 2026,
  IIT Kanpur, Scopus-indexed.
- **Industry** — AI Engineer Intern, Optum (UnitedHealth Group) AI-DLC pilot team. Amazon ML
  Summer School.
- **Projects** — 18 project MDX files in `src/app/work/projects/`, with images in `project_images/`.
- **Achievements** — BrainGlobe open-source contributions, AIR 14 BRAINDEAD, top 30 AI4Humanity
  Summit (APT), BrandDiffusion Adobe hackathon win. Links recovered from the résumé PDF annotations.
- **Process record** — `aidlc-docs/` efforts 001-010, `docs/adr/0001`-`0009`, public `/process` route.
- **Education** — B.Tech CSE (AI specialisation), NSUT, 2027, GPA 8.78.

Absences future work must not fabricate: no testimonials, no user/traffic numbers, no citation
counts, no employer endorsements.

## Product Principles

1. **Research substance leads.** The first viewport must make the peer-reviewed result and the
   research posts unmissable. Engineering evidence supports; it does not compete for the opening.
2. **Every claim is checkable.** Each assertion carries a link to the paper, repo, or certificate.
   Nothing is asserted that a reader cannot verify in one click.
3. **Say each thing once.** A given piece of content has exactly one home. Cross-route repetition of
   the same cards is a defect, not redundancy. (The current site renders the project list on both
   `/` and `/work`.)
4. **Every route stands alone.** Traffic arrives deep-linked; no route may depend on the homepage
   having been read first.
5. **Restraint carries the craft.** Monochrome base, one accent, generous space, motion that
   clarifies structure rather than decorating it. Both themes are first-class.

## Accessibility & Inclusion

Light and dark must both meet WCAG AA contrast for body and heading text. Motion must honour
`prefers-reduced-motion`. All interactive targets keyboard-reachable with visible focus; the site is
frequently skim-read, so heading structure must be semantically correct for screen readers.
