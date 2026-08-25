# Content as code

Every word on this site lives in the repository. Site copy is a TypeScript module, `src/content/site.ts` — one exported object literal per section. Long-form project bodies are MDX files under `content/projects/`. There is no CMS, no headless backend, no admin panel.

Decision records: [../adr/0004-content-as-code-typed-schema.md](../adr/0004-content-as-code-typed-schema.md) and [../adr/0007-mdx-per-project-content-model.md](../adr/0007-mdx-per-project-content-model.md). The rebuild (ADR 0011) kept both decisions and simplified their implementation.

## Why not a CMS

The first reason is architectural and non-negotiable: the site is statically exported, so nothing can be fetched at request time (see [why-static-export.md](why-static-export.md)). Content must be present at build. A headless CMS would therefore be a build-time fetch — an external service that has to be reachable, authenticated and non-empty for `npm run build` to succeed, and whose contents are not in the repo you just cloned. That converts a deterministic build into a networked one, and adds a system whose state you cannot see in a diff.

The second reason is types. Because content is TypeScript, the components that destructure it are the contract. `Experience.tsx` reads `experience.items[].company`, `role`, `when`, `points`; remove or rename one of those in `site.ts` and `npm run typecheck` fails. A malformed entry does not ship. That is the entire argument in one line: **broken content becomes a build failure instead of a visual bug.** The rebuild dropped the separate `content.types.ts` file — with a single author and inferred literal types, the consumers already enforce every shape that matters, and one fewer file has to be kept in step.

The third is refactoring. Renaming a field or restructuring a section is type-guided — the compiler enumerates every call site. In a CMS, the equivalent change is a schema migration plus a hunt through templates.

The fourth is git. Content is greppable, diffable, blameable, revertable and reviewable in a pull request, with the code change that consumes it in the same commit. "When did the role change, and why?" is `git log -p`, not a support ticket.

## What it costs

Being honest about the trade:

- **The editor must be comfortable in a code editor.** Copy is string literals in a `.ts` file. Easier than the JSX it replaced, but there is no non-technical editing path, and there will not be one.
- **Every change is a rebuild and a deploy.** No live editing, no preview URL for a draft, no scheduled publish.
- **Some references are not type-checked.** `selectedProjects.slugs`, `threads.cards[].image` (`"gallery:5"`, `"project:pysdf"`) and `nav[].href` are strings that point at files or manifest keys. A typo yields a missing card or a 404 link, not a compile error. The build and a look at the page are the test for those.
- **Merge conflicts in one big file.** `site.ts` is a single module. With one author this is a non-issue; with five it would not be.

For a single-author portfolio these costs land almost entirely on someone who is already comfortable paying them.

## Two systems, deliberately

There are two content mechanisms in this repo, and that is not an accident of history.

**`site.ts` holds structured site copy** — `person`, `nav`, `hero`, `sequence`, `threads`, `experience`, `story`, `process` and the rest. These are records with known shapes, consumed by components that need to know which field is which. `experience.items[]` is iterated and rendered into a specific layout; `sequence.stages[]` is exactly three because the brain sequence has three scroll windows. The shape has to hold.

**MDX holds long-form prose** — one file per project in `content/projects/`, with a small frontmatter header (`title`, `publishedAt`, `summary`, `images`, `link`) parsed by `gray-matter` in `src/lib/projects.ts` and a body rendered by `next-mdx-remote/rsc` with GitHub-flavoured markdown. A project write-up is paragraphs, headings, lists and code blocks. Expressing that as a TypeScript object would mean either a giant string blob (unreadable, unwritable) or an invented block schema (a worse markdown).

The split follows the shape of the data. Structured, field-addressed content gets a typed object. Unstructured prose gets a markup language and a typed frontmatter *header* — the structured part of an MDX file is still under contract; only the body is free-form. Adding a project touches exactly one new file plus one `PROJECT_MAP` line in `scripts/build-images.mjs`, which is as low as the cost of publishing can reasonably go.

One system for both would have meant either losing type safety on the structured half, or making the prose half miserable to write. Two is the right number.

## Where emphasis lives

The old site let copy carry presentation via JSX accent spans. The rebuild removed that: `site.ts` is strings only. The one inline emphasis left is `*word*` inside `passage`, a markup convention that `ScrollWords` turns into the accent colour — content states *what* is emphasised and the component decides *how*. In MDX, `_italic_` is rendered in the display serif by `.prose em`. That is the whole vocabulary, on purpose.
