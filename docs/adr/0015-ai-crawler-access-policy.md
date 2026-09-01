# 0015 — AI crawler access policy at the edge

**Status:** Accepted · **Date:** 2026-08-31 · **Supersedes:** —

## Context

Issue #25: after pointing `harshdipsaha.tech` at Cloudflare, an AI assistant fetching the site
went from retrieving any page in one request to only ever retrieving the home page — silently
defeating the purpose of `robots.txt`, `llms.txt` and `llms-full.txt` (ADR 0014), which exist
specifically so an agent *can* fetch the whole site cheaply.

The repository's own `src/app/robots.ts` is unchanged and still emits only `Allow: /` and the
sitemap URL. The live `robots.txt` served from `harshdipsaha.tech` is different: Cloudflare
injects a **"Managed content" block** ahead of it, at the edge, outside this repository's control.
Fetched live on 2026-08-31, that block:

- Sets, for `User-agent: *`, `Content-Signal: search=yes, ai-train=no, use=reference` — an
  implementation of the 2025 Content Signals extension to `robots.txt` (backed by Cloudflare and
  under IETF discussion), which is a *statement of licensing terms*, separate from the older
  `Disallow` mechanism.
- Then, for nine specific user agents — `Amazonbot`, `Applebot-Extended`, `Bytespider`, `CCBot`,
  `ClaudeBot`, `CloudflareBrowserRenderingCrawler`, `Google-Extended`, `GPTBot`,
  `meta-externalagent` — sets `Disallow: /` outright, overriding the nuanced signal above.

This is Cloudflare's default "Block AI Bots" posture, auto-enabled for newly onboarded domains.
It does not distinguish *why* a request from `ClaudeBot` arrives: the same user agent string
covers both bulk training-corpus crawling and a one-off fetch triggered by a person asking an
assistant "what does this site say about X". The owner's problem report — "before: fetched all
webpages in one go; after: only home page" — is that blanket block acting exactly as configured.

## Decision

**Distinguish training from retrieval, and allow retrieval.** This site's entire purpose (a
portfolio meant to be read, and per ADR 0014, meant to be *legible to agents on a visitor's
behalf*) is undermined by blocking retrieval-time fetches. Bulk, uncredited training-corpus
harvesting is a different act with different consequences and no benefit to the site's purpose.

Recorded policy, in Content-Signal terms:

- `ai-train = no` — stays denied, for every crawler. Training absorbs the text permanently into a
  model with no reference back to the source or the byline; the EU DSM Directive Article 4
  reservation Cloudflare's header cites exists for exactly this, and there's no reason to grant it
  by default on a personal site.
- `search = yes`, `ai-input = yes` (or the blanket `use=reference` already set at `*`) — should
  hold for **all** crawlers, not just the ones Cloudflare left unblocked. An assistant fetching a
  page to answer a question about the owner's work, or a search index returning a link and an
  excerpt, is the site being *read*, which is the entire point of publishing it.
- The nine-bot `Disallow: /` block is **not this site's policy** — it is Cloudflare's default,
  and it collapses the training/retrieval distinction the Content-Signal line above already draws
  correctly. It should be turned off.

**Action required, and it is out of this repository's reach:** in the Cloudflare dashboard for
`harshdipsaha.tech`, under **Security → Bots** (the "AI Scrapers and Crawlers" / "Content Signals"
section), turn off the blanket block for `ClaudeBot`, `GPTBot`, `Google-Extended`,
`Applebot-Extended`, `Amazonbot`, `CloudflareBrowserRenderingCrawler` and
`meta-externalagent` and rely on the `Content-Signal: ai-train=no` line to carry the actual policy.
`Bytespider` and `CCBot` — general-purpose scraping/training crawlers with no retrieval-assistant
use case reported against them — may reasonably stay blocked; there is no cost to that beyond
the same training data they'd otherwise absorb.

`llms.txt` and `llms-full.txt` themselves need no change: they already state, correctly, what the
site is; the block preventing them from being fetched was the entire defect.

## Consequences

- Once applied, an assistant given this URL should again be able to fetch any page — including
  `/llms.txt` and `/llms-full.txt` — in one request, restoring what ADR 0014 was built for.
- Training crawlers (`Bytespider`, `CCBot`) remain blocked; nothing about this decision opens the
  site to bulk uncredited scraping.
- This is a dashboard toggle, not a deploy. It carries no CI check, and nothing in this repository
  enforces it — a future Cloudflare default change or a dashboard reset could silently revert it.
  If that recurs, re-fetching `https://harshdipsaha.tech/robots.txt` and diffing it against this
  ADR's quoted block is the fastest way to notice.
- No repository file changes: `src/app/robots.ts` is deliberately left as-is — it was never the
  source of the restriction and adding `Allow` rules there would have no effect on an edge-layer
  block.

## Evidence

- Live `https://harshdipsaha.tech/robots.txt`, fetched 2026-08-31, quoted in Context above.
- Issue #25, filed by the owner after observing the fetch-scope regression firsthand.
