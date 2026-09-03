# Requirements delta — Effort 037 (mobile home performance)

Delta against the AI-DLC baseline (`aidlc-docs/inception/`) and the quality-gate requirements
established by ADR 0012 / effort 021.

## CHANGED

- **Home page below-the-fold delivery.** `CardStack`, `MatrixRibbon`, `Experience` and
  `ProjectGrid` on `/` are now loaded via `next/dynamic` (`ssr: true`, the default) instead of
  static imports. Server-rendered markup is unchanged — the static export still contains every
  section's full HTML — but each component's client JavaScript now ships in its own chunk instead
  of the page's critical/above-the-fold bundle. No component's props, behaviour, or rendered
  output changed.
- **Lenis smooth-scroll initialisation.** `SmoothScroll` (`src/components/SmoothScroll.tsx`) no
  longer instantiates Lenis on hydration. It now waits for the first scroll-intent signal
  (`wheel`, `touchstart` or `keydown`, each attached with `{ passive: true, once: true }`) before
  mounting `<ReactLenis root>`. Until that first signal, the page uses plain native scroll — this
  is not a behaviour a user can distinguish from smoothed scroll before they've scrolled at all.
  `prefers-reduced-motion: reduce` still disables Lenis entirely, same as before.
- **Hero subline entrance timing.** `Hero.tsx`'s subline `TextAnimate` (`trigger="mount"`) delay
  changed from `1.1` to `0.5` seconds; `duration` (`1.1`) is unchanged. The subline is the home
  page's LCP element, so this moves the point at which its animation completes and it becomes the
  page's largest painted content — verified at ≈ 2.17 s post-navigation in a real browser (down
  from ≈ 2.77 s), with the exact same visual end-state (same words, same final position, same
  blur/fade curve).

## NOT CHANGED

- `lighthouserc.mobile.json`'s performance floor stays at **0.7**. The effort's own acceptance
  criterion (raise to 0.85 only if home reaches ≥ 0.9 across 3 medians) was not met in this
  session's local measurements — see `effort-state.md` Verification and Notes for why local
  numbers on this shared, contended machine could not be trusted at face value, and for the
  paired same-session comparison that was used instead. `lighthouserc.desktop.json` is untouched
  (0.9 floor; desktop was already 0.92–1.00 before and after, unaffected by these changes).
- No visual, layout, copy or animation *end-state* changed. `useScroll`-driven `useTransform`
  ranges (`CardStack`) are untouched and still within `[0, 1]`. Every animated component still
  honours `useReducedMotionSafe()` / `prefers-reduced-motion`.
- No new routes, no new content, no `src/content/site.ts` copy changes.

## NEW

- None — this effort is pure performance tuning within the existing ADR 0012 gate; no new
  requirement, route, or architectural decision was introduced. No ADR was needed.
