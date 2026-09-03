# Requirements delta — 034-tool-icons

## NEW

- **R-TOOLICON-1** Every tool name in `story.skills` that has an official monochrome brand mark in
  `simple-icons` must render that mark (24×24 SVG path, `fill-current`) as the leading element of
  its Tools pill, in both the interactive (click/tap-to-reshuffle) list and the reduced-motion
  static list.
- **R-TOOLICON-2** A tool with no `simple-icons` glyph must keep the existing coloured accent dot —
  the fallback is not optional; every `story.skills` entry renders a leading mark of one kind or
  the other, never neither.
- **R-TOOLICON-3** The icon-to-name map (`src/lib/tool-icons.ts`) must import only the named
  `simple-icons` exports actually used (currently 13 of ~3,200), never the package's default/bulk
  export, so the production bundle grows by the sum of those icons' path strings, not the whole
  icon set.
- **R-TOOLICON-4** No brand hex colour is introduced. Every glyph is drawn in the current text
  colour via `fill-current`; the palette stays ink / paper / tangerine (plus the pre-existing
  sunny/seafoam/cerulean fallback-dot accents) — unchanged from the constraint already stated in
  `AGENTS.md` → "Design tokens".

## CHANGED

- **R-STORY-TOOLS-1** (effort 028, `ToolkitToy.tsx`) The pill's leading mark is no longer always a
  coloured dot — it is the tool's brand glyph when one exists, the dot otherwise. The
  click/tap-to-reshuffle interaction, the Fisher–Yates shuffle, and the reduced-motion static
  fallback are all unchanged in behaviour. The active-pill pulse's scale target changes from a flat
  `2` to `toolIconPath(name) ? 1.4 : 2` — the 14px glyph only needs a smaller jump than the 6px dot
  to read as a pulse without visually bumping the label text.
- **R-SMOKE-STORY-1** (effort 028, `tests/smoke.spec.ts`) The `story Tools toy` smoke-test block
  gains two glyph/fallback assertions (interactive list + reduced-motion static list), both driven
  by `toolIconPath` against the live `story.skills` array rather than a hard-coded icon count, so
  the test does not silently go stale if `story.skills` or the icon map changes later.

## UNCHANGED / constraints honoured

- `story.skills` (`src/content/site.ts`) itself is untouched — no tool added, removed, or renamed.
- No new route, no new page, no IA change.
- `output: "export"` / static-only constraint honoured: `simple-icons` path strings are inlined at
  build time via `tool-icons.ts`, no runtime fetch or icon CDN.
- `simple-icons` is a devDependency only (same category as `sharp`, `playwright`), not a runtime
  dependency change to the shipped bundle's dependency graph beyond the ~1–2 KB of inlined path
  data.
