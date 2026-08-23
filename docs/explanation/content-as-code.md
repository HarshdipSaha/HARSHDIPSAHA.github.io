# Content as code

Every word on this site lives in the repository. Site copy is a TypeScript module, `src/resources/content.tsx`, typed against `src/types/content.types.ts`. Long-form project bodies are MDX files under `src/app/work/projects/`. There is no CMS, no headless backend, no admin panel.

Decision records: [../adr/0004-content-as-code-typed-schema.md](../adr/0004-content-as-code-typed-schema.md) and [../adr/0007-mdx-per-project-content-model.md](../adr/0007-mdx-per-project-content-model.md).

## Why not a CMS

The first reason is architectural and non-negotiable: the site is statically exported, so nothing can be fetched at request time (see [why-static-export.md](why-static-export.md)). Content must be present at build. A headless CMS would therefore be a build-time fetch — an external service that has to be reachable, authenticated and non-empty for `npm run build` to succeed, and whose contents are not in the repo you just cloned. That converts a deterministic build into a networked one, and adds a system whose state you cannot see in a diff.

The second reason is types. Because content is TypeScript, `src/types/content.types.ts` is a contract, not documentation. `about.work.experiences[]` must have `company`, `timeframe`, `role`, `achievements`. `icon` fields are typed `IconName`, a union derived from the keys of `src/resources/icons.ts`, so a typo'd icon name is a compile error rather than a blank square in production. A malformed entry fails `npx tsc --noEmit`; it does not ship. That is the entire argument in one line: **broken content becomes a build failure instead of a visual bug.**

The third is refactoring. Renaming a field or restructuring a section is type-guided — the compiler enumerates every call site. In a CMS, the equivalent change is a schema migration plus a hunt through templates.

The fourth is git. Content is greppable, diffable, blameable, revertable and reviewable in a pull request, with the code change that consumes it in the same commit. "When did the role change, and why?" is `git log -p`, not a support ticket.

## What it costs

Being honest about the trade:

- **The editor must be TypeScript-literate.** Copy fields are typed `React.ReactNode`, so editing a headline means editing JSX. There is no non-technical editing path, and there will not be one.
- **Every change is a rebuild and a deploy.** No live editing, no preview URL for a draft, no scheduled publish.
- **JSX in content couples copy to styling.** The accent spans — `.intro-cyan`, `.intro-amber`, `.intro-violet`, `.intro-emerald`, `.intro-coral` in `src/resources/custom.css` — are the concrete example. Writing `<span className="intro-cyan">neuro-symbolic</span>` inside a headline puts a presentation decision inside a content field. A stricter design would keep them separate; this one accepts the coupling because a single author writing their own copy is also the person choosing the emphasis, and a five-class vocabulary is small enough to hold in your head.
- **Merge conflicts in one big file.** `content.tsx` is a single module. With one author this is a non-issue; with five it would not be.

For a single-author portfolio these costs land almost entirely on someone who is already comfortable paying them.

## Two systems, deliberately

There are two content mechanisms in this repo, and that is not an accident of history.

**`content.tsx` holds structured site copy** — `person`, `social`, `home`, `about`, `blog`, `work`, `gallery`. These are records with known shapes, consumed by components that need to know which field is which. `about.work.experiences[]` is iterated and rendered into a specific layout; the type has to hold.

**MDX holds long-form prose** — one file per project, with a small frontmatter header (`title`, `publishedAt`, `summary`, `images`, `link`) parsed by `gray-matter` in `src/utils/utils.ts`. A project write-up is paragraphs, headings, lists and code blocks. Expressing that as a TypeScript object would mean either a giant `React.ReactNode` blob (unreadable, unwritable) or an invented block schema (a worse markdown).

The split follows the shape of the data. Structured, field-addressed content gets a type. Unstructured prose gets a markup language and a typed frontmatter *header* — the structured part of an MDX file is still under contract; only the body is free-form. Adding a project touches exactly one new file plus one `FILE_MAP` line, which is as low as the cost of publishing can reasonably go.

One system for both would have meant either losing type safety on the structured half, or making the prose half miserable to write. Two is the right number.
