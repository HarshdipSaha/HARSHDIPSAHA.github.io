# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: research supervisors, lab PIs, and research-programme admissions.** They arrive from a
paper, a referral, or an application with a few minutes to decide whether this person does real
research. Their job: judge research substance fast — what was investigated, what result came out,
whether it was peer-reviewed, whether the person can carry a problem end to end.

**Secondary: AI/SDE recruiters and hiring engineers.** They arrive from a résumé link or GitHub and
need shipped-systems evidence and engineering depth.

**Both audiences are non-specialists in the specific field.** A recruiter does not know what
"BraTS", "RANO" or "World Rank 3" mean; a PI outside neuro-oncology does not either. Every claim
must be understandable without domain knowledge, then verifiable by a link.

**Tertiary: friends and peers who visit from a shared link, and AI agents maintaining this repo**
(see `AGENTS.md`, `CONTEXT.md`).

## Product Purpose

Harshdip Saha's personal portfolio and public research surface. It replaces a CV and doubles as a
showcase of how the work is produced. Success is a visitor forming an accurate, favourable judgement
of *what Harshdip does* within the first viewport and one scroll — and being able to say it back in
one sentence — then having a reason to keep reading.

Confirmed failure mode (owner feedback, 2026-08-25): the UI was rated great but visitors could not
say what he does or what "World Rank 3" means; the `/process` page was opaque; there was no obvious
way back to the home page from other routes; the brain sequence's text overlapped the image.

## Positioning

Two claims a neighbouring student portfolio could not truthfully copy:

1. **Peer-reviewed research with a placed result** — RECAP-Net, ranked 3rd in the world in the
   BraTS Lighthouse 2025 Tumor Progression Challenge (an international competition where teams'
   models are scored on the same hidden brain-tumour MRI data), presented as an oral at MICCAI 2025,
   published in Springer LNCS.
2. **The repo documents its own process** — every change is a numbered, written-up effort and every
   structural decision an ADR; the story is public at `/process`. The site is evidence of engineering
   practice, not a description of it.

## Operating Context

Read in a browser, desktop and mobile, often in a quick evaluation pass alongside a résumé PDF
(`/resume.pdf`) and GitHub. Frequently reached by direct link to a single route rather than through
the homepage, so every route must stand alone and lead back to the whole. Dark appearance only.

## Capabilities and Constraints

- **Static export.** `output: "export"` — no server runtime. Everything prerenders to `out/`;
  motion and interactivity are client-side or CSS.
- **GitHub Pages hosting.** Static files only; no redirects.
- **Stack:** Next.js 16 App Router, Tailwind CSS v4 (`@theme` in `src/app/globals.css`), Motion 13,
  Lenis. Fonts: Instrument Serif (italic display) + Commissioner. Design decisions are recorded in
  ADR 0011; visual system in `DESIGN.md` when present.
- **Content-as-code.** Copy lives in `src/content/site.ts` and `content/projects/*.mdx`, never
  inline in components.
- **Generated paths are not hand-editable:** `public/img/**`, `src/data/images.json`, `out/`,
  `public/brain/**` (rendered by `scripts/render-brain-frames.py`).
- **Change lifecycle is enforced.** Substantive changes require an AI-DLC effort record; CI
  (`aidlc-check`) fails PRs without one. See `AGENTS.md`.
- **Motion 13:** `useScroll`-driven `useTransform` ranges must stay within `[0, 1]`. Every animated
  component must render static markup under `prefers-reduced-motion`.

## Brand Commitments

- Name: Harshdip Saha. Domains: `harshdipsaha.tech` (canonical), `harshdipsaha.github.io`.
- Voice: plain and substantive, first person, no hype. Claims are specific and checkable. Domain
  terms are either explained in the same breath or not used.
- Binding visual constraint recorded from the owner (2026-08-25): **keep the current UI** — the
  thine.com-derived world (ink/paper/tangerine, italic serif display, pills, scroll-scrubbed brain,
  card stack). Work is UX, copy, and navigation, not a new look.
- The owner does not want the employer name "Optum" foregrounded on the `/process` page; the
  methodology (AI-DLC) is the subject there, not where he learned it.

## Evidence on Hand

Real, verifiable, already in the repo (`src/content/site.ts`):

- **Publication** — RECAP-Net, MICCAI 2025 South Korea, World Rank 3 in the BraTS Lighthouse 2025
  Tumor Progression Challenge, oral presentation.
  `https://link.springer.com/10.1007/978-3-032-16370-7_23`; code
  `https://github.com/HARSHDIPSAHA/brats_response_project`.
- **Research posts** — UG researcher at NexGenLab NSUT; Research Intern (Scientific Computing),
  IIT Madras, developing PyAMorph; oral presentation accepted at INCAM 2026, IIT Kanpur.
- **Industry** — AI Engineer Intern, Optum (UnitedHealth Group) AI-DLC pilot team, Jun–Aug 2026;
  Amazon ML Summer School 2026.
- **Projects** — 18 MDX case studies in `content/projects/`, images in `project_images/`.
- **Achievements** — BrainGlobe open-source (15+ merged PRs), AIR 14 BRAINDEAD, top 30 AI4Humanity
  Summit, BrandDiffusion Adobe hackathon win.
- **Process record** — `aidlc-docs/` efforts 001–014, `docs/adr/0001`–`0011`, public `/process`.
- **Education** — B.Tech CSE (AI), NSUT, class of 2027, GPA 8.78.

Absences future work must not fabricate: no testimonials, no user/traffic numbers, no citation
counts, no employer endorsements.

## Product Principles

1. **Say what he does in one sentence, early, in plain words.** Then prove it.
2. **Every claim is checkable and explained.** Each assertion carries a link, and any competition,
   venue or acronym is glossed where it appears.
3. **Say each thing once.** A piece of content has exactly one home.
4. **Every route stands alone and leads home.** Deep-linked visitors must see where they are and
   have a one-click way back.
5. **Restraint carries the craft.** One accent, generous space, motion that clarifies structure.

## Accessibility & Inclusion

Body and heading text meet WCAG AA on the ink background. Motion honours `prefers-reduced-motion`.
All interactive targets keyboard-reachable with visible focus; heading structure must be
semantically correct for screen readers, since the site is skim-read.
