# Effort 032 — Story polish wave 1

| Field | Value |
|-------|-------|
| Status | complete |
| Depth | standard |
| Opened | 2026-09-02 |
| Closed | 2026-09-02 |
| Branch | `feat/story-polish-wave-1` |

## Intent

Implement the first wave of improvements from the ideation doc (effort 031, PR #43):
ideas 11, 12, 13, and 7, plus verify the OG image setup for WhatsApp/Telegram link previews.

## Units of work

1. **Kill duplicate achievement text (idea 12)** — removed AIR-14, top-30, and "open to internships" from `story.more[1]` since those facts already appear in the Achievements list and in the closing CTA. Replaced with a lighter callback to competitive programming.
2. **Research interests as styled pills (idea 11)** — replaced `story.interests.join(" · ")` with glass/hairline rounded-full pills with cycling accent dots (tangerine/sunny/seafoam/cerulean), matching the ToolkitToy idiom but static (no interaction — avoids two consecutive interactive pill clusters).
3. **Education as journey timeline (idea 13)** — added `when` field to `story.education` entries, rendered as a vertical timeline with tangerine dots and a `border-white/10` connecting line, matching the GatePipeline dot idiom from /process.
4. **Real sitemap lastmod (idea 7)** — replaced `new Date()` (which told Google "everything changed today" on every deploy) with the latest project's `publishedAt` for static routes and each project's own date for project pages.
5. **OG image for WhatsApp/Telegram** — verified the existing pipeline: `build-images.mjs` already generates `og.jpg` (1200×630 JPEG from `me.jpg`), and `layout.tsx` already sets `og:image`, `og:image:width`, `og:image:height` with absolute URL via `metadataBase`. No code change needed — the setup was already correct.

## Verification

- `npm run typecheck` — clean
- `npm run build` — 30 pages generated, zero errors
- `npm run test:smoke` — 77 passed, 1 flaky (desktop reduced-motion page crash, pre-existing)
- OG meta tags verified in built `out/index.html`: absolute URL `https://harshdipsaha.tech/img/og.jpg` with width/height
- Sitemap verified: uses `2026-08-20` (latest project date) instead of build timestamp
