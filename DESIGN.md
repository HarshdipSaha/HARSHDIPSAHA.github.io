---
name: Harshdip Saha
description: A dark, editorial research portfolio — one ink, one paper, one tangerine; italic serif display over a scroll-scrubbed brain.
colors:
  ink: "#171519"
  ink-2: "#211e23"
  ink-3: "#2f2b31"
  paper: "#ebe5e1"
  tangerine: "#f49752"
  tangerine-lift: "#f7a86c"
  sunny: "#f4e382"
  seafoam: "#8ad7b6"
  cerulean: "#9bc8d6"
typography:
  display:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.75rem, 7.2vw, 8.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.4rem, 5.5vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Commissioner, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.2vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Commissioner, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "-0.005em"
  label:
    fontFamily: "Commissioner, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.2em"
rounded:
  pill: "9999px"
  card: "1.75rem"
  image: "1rem"
  code: "0.75rem"
  focus: "2px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.5rem"
  lg: "3rem"
  section: "7rem"
  section-lg: "10rem"
components:
  pill-glass:
    backgroundColor: "color-mix(in oklab, white 8%, transparent)"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.25rem"
  pill-glass-hover:
    backgroundColor: "color-mix(in oklab, white 15%, transparent)"
  pill-accent:
    backgroundColor: "{colors.tangerine}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.25rem"
  pill-accent-hover:
    backgroundColor: "{colors.tangerine-lift}"
  pill-sm:
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
  card-photo:
    backgroundColor: "{colors.ink-2}"
    textColor: "#ffffff"
    rounded: "{rounded.card}"
    padding: "3rem"
  nav-pill-current:
    backgroundColor: "color-mix(in oklab, white 15%, transparent)"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
---

# Design System: Harshdip Saha

## Overview

**Creative North Star: "The Reading Room Light-Box"**

A radiologist's reading room is dark so the film can be bright. This site works the same way:
one tinted near-black fills every viewport, and the only luminous objects are the words and the
brain. The visual world was derived from thine.com (ADR 0011) and kept its discipline rather than
its palette: an italic serif for anything that speaks, a humanist sans for anything that
explains, pills as the only button shape, a fixed nav behind a ramped blur, a scroll-scrubbed
image sequence as the centrepiece, and a sticky card stack. Every neutral on the site is paper or
white at an alpha; there is deliberately no grey ramp and one accent.

Density is low and the pace is slow. Sections are separated by 7–10rem of ink, display type is
set fluidly and never snaps at a breakpoint, and motion is scroll-linked rather than triggered,
so the reader feels they are moving through material, not watching it arrive. The site is an
Experience surface: the artifact (the brain, the photographs, the case studies) leads and the
interface recedes. Where the interface must appear, it appears as chrome — small, tracked caps in
the margin — not as furniture.

**Key Characteristics:**
- One ink, one paper, one tangerine; every other neutral is paper or white at an alpha.
- Instrument Serif italic for display (always italic, -0.03em, leading 0.95), Commissioner for everything else.
- Pills are the only button shape; glass by default, tangerine for the single primary action.
- Motion is scroll-scrubbed or blur-in; nothing bounces, nothing loops except the scroll hint.
- Depth comes from alpha and backdrop blur, never from shadows on flat surfaces.

## Colors

A dark reading-room palette: one warm near-black, one warm paper, one tangerine, and three
tiny-mark tints that almost never appear.

### Primary
- **Tangerine** (`{colors.tangerine}`): the single accent. Spent on the primary pill (Résumé, Read the paper, Email me), text selection, focus rings, list markers, prose link underlines, and one 6px dot per experience bullet. Its hover lift is **Tangerine Lift** (`{colors.tangerine-lift}`).

### Neutral
- **Ink** (`{colors.ink}`): the page. Also the canvas fill behind the brain frames and the theme colour.
- **Ink 2** (`{colors.ink-2}`): card and code-block surface, one step lighter than the page.
- **Ink 3** (`{colors.ink-3}`): reserved third step; rarely used.
- **Paper** (`{colors.paper}`): all text at full strength. Secondary text is paper at 80–82%, tertiary at 60–70%, labels at 45%, hairlines and dates at 40–50%.
- **Alpha white**: glass fills (8%, 15% on hover), borders (10%, 14%), hairline rules (10%). Never a hex grey.

### Tertiary
- **Sunny** (`{colors.sunny}`), **Seafoam** (`{colors.seafoam}`), **Cerulean** (`{colors.cerulean}`): tiny marks only (status dots, data glyphs). Never for text, fills, or buttons.

### Named Rules
**The No-Grey Rule.** There is no grey ramp. Every neutral is `paper` or `white` at an alpha (`text-paper/60`, `border-white/10`). Introducing a hex grey is a defect.

**The One Accent Rule.** Tangerine appears on at most one pill per viewport and on marks under 8px. If two things are tangerine, one of them is wrong.

## Typography

**Display Font:** Instrument Serif (with Iowan Old Style, Georgia, serif)
**Body Font:** Commissioner (with ui-sans-serif, system-ui)
**Label/Mono Font:** Commissioner for labels; `ui-monospace` only inside `.prose code`

**Character:** A tight italic serif that reads as a voice against a plain, slightly warm sans that
reads as an explanation. The contrast is high on purpose: the serif is never used for more than a
sentence, and the sans is never used for a headline larger than 2rem.

### Hierarchy
- **Display** (400 italic, `clamp(2.75rem, 7.2vw, 8.5rem)`, 0.95): the hero spread and the closing line. Always italic, `-0.03em`, `text-wrap: balance`. Two halves of the hero set as a spread across the viewport.
- **Headline** (400 italic, `clamp(2.4rem, 5.5vw, 4.6rem)`, 0.95): section and stage titles over the brain, page titles on `/story`, `/process`.
- **Title** (500, 1.6–2rem, 1.1): sans headings inside content — experience company names, card titles (600 white over photos), project titles at 1.15rem.
- **Body** (400, 1.125rem, 1.8 in prose; 1.05–1.2rem, relaxed elsewhere): paper at 80–82%. Prose measure is `40rem` (`.measure`); the story page holds a hard 640px column.
- **Label** (500, 0.8125rem, 0.2em tracking, uppercase): section labels and viewer chrome at paper 45%. Viewer readouts drop to 11px and use tabular numerals.

### Named Rules
**The Italic-Speaks Rule.** Instrument Serif is always italic and is used only for text that speaks in the owner's voice (headlines, the wordmark, prose `em`). Sans for anything that explains or lists.

**The Fluid Type Rule.** Display sizes are `clamp()`s; they never snap at a breakpoint. Track at `-0.03em` for display and `-0.015em` for sans headings; never tighter than `-0.04em`.

## Layout

Two container widths: 1200px for reading content, 1400px for wide compositions and the nav.
Horizontal padding is 1.5rem on mobile and 2.5–3rem on desktop. Vertical rhythm is deliberate
contrast: tight inside a group (0.5–1.5rem), generous between sections (7rem mobile, 10–13rem
desktop). Long-form pages (`/story`, `/process`, case studies) hold a single 40rem measure.

Scroll-driven sections own their own height in viewport units: the brain sequence is a 450vh
runway with a sticky 100vh viewer; the card stack is `cards × 100vh` with each card pinned 28px
lower than the last. The hero is `min-height: 100svh` with the headline centred and the subline
anchored to the bottom. The nav is fixed at 80px with a 128px progressive blur beneath it; page
content starts at `pt-32`.

Breakpoints follow Tailwind defaults (`sm` 640, `md` 768, `lg` 1024). Under `md` the nav pills
collapse into a full-screen menu; grids fall to one column; the brain draws zoomed 12% to fill a
phone's width; stage copy becomes a bottom overlay.

## Elevation & Depth

Flat with tonal layering. There are no `box-shadow`s on any surface. Depth is conveyed by alpha
(a glass pill is 8% white over ink), by backdrop blur (16px on glass, a 0.5→64px ramp under the
nav), by the `ink → ink-2` step for cards and code, and by the scroll-scrubbed dim (a black layer
that rises to 60% over the brain as the section progresses). The only text shadows are
`.over-photo` on titles set over photographs, two layers at 0.9 and 0.75 black.

### Named Rules
**The Blur-Is-Depth Rule.** Depth is backdrop blur and alpha, never a shadow. A `box-shadow` on a card or pill is a defect.

## Shapes

Two silhouettes: the pill and the soft rectangle. Pills are fully round (`9999px`) and are the
only button. Cards are `1.75rem`; images, code blocks and thumbnails are `0.75–1rem`; focus rings
are `2px`. Borders are 1px alpha white (10–14%). Rules are hairlines (`.hairline`, 10% white).
Nothing is squared off except the brain canvas, which fills the viewport edge to edge.

## Components

### Buttons (Pill)
- **Shape:** fully round (`9999px`), `whitespace-nowrap`, `inline-flex` with a `0.5rem` gap for a trailing glyph.
- **Glass (default):** 8% white fill, 14% white 1px border, 16px backdrop blur, paper text; `sm` is `0.5rem 1rem` at 14px, `md` is `0.625rem 1.25rem` at 15px.
- **Accent:** tangerine fill, ink text, hover to Tangerine Lift. One per viewport.
- **Ghost:** paper 80% text, hover paper 100% and 8% white fill.
- **Hover / Focus / Active:** 300ms `ease-out-cubic` on background and colour; `active:scale-[0.98]`; focus ring 2px tangerine, 3px offset.
- **External links** open in a new tab and carry a trailing `↗`; internal CTAs carry `→`.

### Navigation
- Fixed 80px header. Wordmark (`display`, 1.55rem, "Harshdip" paper + " Saha" paper 45%) centred on desktop, left on mobile. Route pills left, Résumé accent pill right.
- **Current route:** the pill for the current path takes the glass hover fill (15% white) and `aria-current="page"`.
- **Mobile:** a `Menu`/`Close` glass button opens a full-screen `ink/95` sheet with route links at `display` 3rem and the Résumé pill; scroll is locked while open.

### Cards / Containers
- **Photo card (card stack):** `1.75rem` radius, 1px 10% white border, `ink-2` fill, full-bleed photo with a black gradient (85% → 35% → 10%) from the bottom, white title and 85% white body, one glass pill.
- **Project tile:** 16:10 image at `1rem` radius, 1px 10% white border, title 1.15rem/500, year at 40% paper tabular, two-line summary at 60%.
- **Experience row:** hairline-separated grid (200px date column), tangerine 6px bullet dots.

### Labels
- `.label`: 13px, 500, 0.2em tracking, uppercase, paper 45%. Section labels and viewer chrome. Readouts use tabular numerals at 11px.

### Brain Sequence (signature)
A sticky 100vh viewer over a 450vh runway. A canvas draws the nearest loaded frame of 160 axial
MRI slices as scroll progresses; a black dim layer rises from 0 to 60%. Viewer chrome (a caption
top-left, a `slice NNN / 160` readout top-right) sits at 11px label style. Three copy stages fade
in over scroll windows `[0.1,0.3]`, `[0.4,0.6]`, `[0.72,0.96]` with a 0.06 blur-fade edge. Under
`prefers-reduced-motion` it renders one still frame and three static columns. All `useTransform`
inputs stay inside `[0, 1]`.

### Motion
- **Enter-on-view:** `Reveal` blur-diagonal (opacity 0→1, blur 6px→0, x/y −16→0, 0.7s) is the default everywhere; `blur-up` for centred headlines.
- **Per-word:** `TextAnimate` blur-in for the hero; `ScrollWords` for the scroll-linked passage.
- **Easing:** `--ease-out-cubic` `cubic-bezier(0.33,1,0.68,1)` for state, `--ease-out-expo` `cubic-bezier(0.16,1,0.3,1)` for image scale.
- **Smooth scroll:** Lenis `lerp 0.09`, disabled under reduced motion.

## Do's and Don'ts

### Do:
- **Do** set every neutral as `paper` or `white` at an alpha; the only solid fills are `ink`, `ink-2`, and `tangerine`.
- **Do** use the italic serif only for headlines and voice; keep sans for explanation, at or under 2rem.
- **Do** give every animated component a reduced-motion path that renders the same content statically.
- **Do** keep `useScroll`-driven `useTransform` input ranges inside `[0, 1]`.
- **Do** place copy over imagery only where the image is dark or dimmed; keep the brain and the words in separate regions on desktop.
- **Do** keep copy in `src/content/site.ts`; components render, they do not write.

### Don't:
- **Don't** introduce a hex grey, a second accent, or a gradient on text.
- **Don't** add a `box-shadow` to cards, pills, or the nav; depth is blur and alpha.
- **Don't** add a second button shape; every action is a pill.
- **Don't** upright the display serif or use it for body copy.
- **Don't** let two tangerine pills share a viewport.
