# Why static export

This site is built with `output: "export"` in `next.config.ts` and served from GitHub Pages. `npm run build` produces a folder, `out/`, and the folder *is* the website. Nothing runs in production.

See [../adr/0002-static-export-github-pages.md](../adr/0002-static-export-github-pages.md) for the decision record. The 2026 rebuild (ADR 0011) changed the whole front end and kept this decision untouched — nothing in the new design needed a server.

## What was on the table

Next.js is normally deployed to a runtime — Vercel, or a Node server you operate. Both were plausible. Both were rejected.

A hosted runtime buys you server rendering, incremental regeneration, API routes, image optimization and edge middleware. For a personal portfolio, none of those are load-bearing. What you pay for them is a permanent operational surface: an account that can expire, a plan that can change, a cold start on the first request after a quiet hour, a build platform whose failure modes you inherit. Running your own Node server is the same trade with the bill replaced by your own time.

GitHub Pages is free, has no cold starts, serves from a CDN, supports a custom domain (`harshdipsaha.tech` alongside `harshdipsaha.github.io`), and has no runtime to secure or patch. The deploy artifact is a directory of HTML, CSS, JS and images. If GitHub Pages ever became unattractive, that directory could be dropped on any static host in an afternoon — there is no lock-in because there is nothing to lock in.

The deeper argument is legibility. A static export has one failure mode: the build was wrong. There is no "works locally, breaks in production" caused by a runtime you cannot see. What you inspect in `out/` is byte-for-byte what visitors get.

## What it costs

The constraints are real and they are not negotiable at the margin:

- **No API routes or route handlers.** There is no server to route to. `sitemap.ts` and `robots.ts` are `force-static` and emitted at build.
- **No server actions.** Forms cannot post to the app; the contact CTA is a `mailto:`.
- **No SSR or ISR.** Every page is rendered once, at build time. `/projects/[slug]` enumerates its pages with `generateStaticParams`.
- **No middleware, redirects or rewrites.** GitHub Pages serves files; there is no request-time hook.
- **No `next/image` optimization.** `images.unoptimized: true` is mandatory. You ship correctly-sized files or you ship oversized ones — which is exactly why `scripts/build-images.mjs` exists: sharp resizes and encodes every drop-zone image to WebP at build time and records its dimensions in `src/data/images.json`, so every `<img>` has a real `width`/`height` (see [../adr/0005-drop-zone-image-sync-pipeline.md](../adr/0005-drop-zone-image-sync-pipeline.md)).
- **No server-side search.** Any search would be a client-side index shipped as part of the bundle.
- **Every content change is a rebuild and a deploy.** Fixing a typo means a commit, a CI run, and a Pages deployment. There is no "edit and save".

Anything dynamic must live in one of two places: resolved at build time, or executed in the browser. The home page is the illustration — the brain sequence (`BrainSequence.tsx`) decodes 160 committed WebP frames and scrubs them on a canvas from scroll position, the card stack and word-highlight passage are `useScroll` transforms, and Lenis smooths the wheel. All of it is client-side JavaScript over static files, and all of it degrades to plain markup under `prefers-reduced-motion`. The server that would otherwise have been involved does not exist.

That constraint propagates upward into how content works. Content cannot be fetched at request time, so it must be present in the repo at build time — which is the reason site copy is a TypeScript module and projects are MDX files. See [content-as-code.md](content-as-code.md).

## When you would outgrow it

The honest boundary. Static export stops being the right answer as soon as you need:

- **Authentication** or any per-user view. There is no session, and client-side auth against a static origin is a different architecture, not a tweak.
- **Comments or any user-submitted content.** Possible via a third-party embed, but the moment you want to own that data you want a backend.
- **Real search over a growing corpus.** A client-side index is fine for eighteen projects; it is not fine for a thousand documents.
- **Content that changes without a deploy.** A CMS with editors who do not use git, or anything driven by an external feed.
- **Anything request-aware** — geo-routing, A/B tests, rate limiting, signed URLs.

None of those apply to a portfolio with eighteen projects and one author. Until one does, `output: "export"` remains the cheapest correct answer, and the constraints it imposes are a feature: they make the wrong architecture impossible to accidentally build.
