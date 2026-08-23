# Reference: content schema

All site copy is exported from `src/resources/content.tsx`. The authority for every shape below is **`src/types/content.types.ts`**; where this page and that file disagree, the type file wins.

`React.ReactNode` fields accept JSX, including the accent spans listed at the bottom.
`IconName` is the union of keys in `src/resources/icons.ts`.
`IANATimeZone` is an IANA zone string, e.g. `Asia/Calcutta`.

## `person` — type `Person`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `firstName` | `string` | yes | |
| `lastName` | `string` | yes | |
| `name` | `string` | yes | Display name; may differ from first + last |
| `role` | `string` | yes | Job title |
| `avatar` | `string` | yes | Public path; sourced from root `me.jpg` via `sync-me.mjs` |
| `email` | `string` | yes | |
| `location` | `IANATimeZone` | yes | Drives the header clock in `Header.tsx` |
| `languages` | `string[]` | no | |

## `social` — type `Social` (array)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | `string` | yes | Platform name |
| `icon` | `IconName` | yes | Must be registered in `src/resources/icons.ts` |
| `link` | `string` | yes | Not validated at build time |
| `essential` | `boolean` | no | Shown on the about page when true |

## `BasePageConfig` — inherited by `home`, `about`, `blog`, `work`, `gallery`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `path` | `` `/${string}` `` \| `string` | yes | Route path |
| `label` | `string` | yes | Nav label, consumed by `Header.tsx` |
| `title` | `string` | yes | Page title / metadata |
| `description` | `string` | yes | SEO description |
| `image` | `` `/images/${string}` `` \| `string` | no | OG image; must live under `public/images/` |

## `home` — type `Home extends BasePageConfig`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `image` | `` `/images/${string}` `` | yes | Required here (optional on the base). `sync-me.mjs` writes `public/images/og/home.jpg` |
| `headline` | `React.ReactNode` | yes | |
| `featured` | object | yes | Badge above the headline |
| `featured.display` | `boolean` | yes | |
| `featured.title` | `React.ReactNode` | yes | |
| `featured.href` | `string` | yes | |
| `subline` | `React.ReactNode` | yes | Below the headline |

## `about` — type `About extends BasePageConfig`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `tableOfContent.display` | `boolean` | yes | |
| `tableOfContent.subItems` | `boolean` | yes | Show nested entries |
| `avatar.display` | `boolean` | yes | |
| `calendar.display` | `boolean` | yes | |
| `calendar.link` | `string` | yes | |
| `intro.display` | `boolean` | yes | |
| `intro.title` | `string` | yes | |
| `intro.description` | `React.ReactNode` | yes | |
| `work.display` | `boolean` | yes | |
| `work.title` | `string` | yes | |
| `work.experiences` | `Experience[]` | yes | See below |
| `studies.display` | `boolean` | yes | |
| `studies.title` | `string` | yes | |
| `studies.institutions` | `Institution[]` | yes | See below |
| `technical.display` | `boolean` | yes | |
| `technical.title` | `string` | yes | |
| `technical.techStack` | `TechStackItem[]` | no | Icon strip |
| `technical.skills` | `Skill[]` | yes | See below |
| `researchInterests` | object | no | Rendered after technical skills |
| `researchInterests.display` | `boolean` | yes (if present) | |
| `researchInterests.title` | `string` | yes (if present) | |
| `researchInterests.items` | `string[]` | yes (if present) | Plain strings, not JSX |

### `about.work.experiences[]`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `company` | `string` | yes | |
| `timeframe` | `string` | yes | Free text, e.g. `2025 — present` |
| `role` | `string` | yes | |
| `achievements` | `React.ReactNode[]` | yes | Rendered as bullets |
| `images` | `ContentImage[]` | no | See below |

### `about.studies.institutions[]`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | `string` | yes | |
| `description` | `React.ReactNode` | yes | |

### `about.technical.techStack[]`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | `string` | yes | Label under the icon |
| `icon` | `IconName` | yes | Must be registered in `src/resources/icons.ts` |

### `about.technical.skills[]`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | `string` | yes | |
| `description` | `React.ReactNode` | no | |
| `tags` | `Array<{ name: string; icon?: string }>` | no | `icon` here is `string`, not `IconName` |
| `images` | `ContentImage[]` | no | See below |

### `ContentImage` (used by `experiences[].images` and `skills[].images`)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `src` | `string` | yes | Public path |
| `alt` | `string` | yes | |
| `width` | `number` | yes | Ratio, not pixels |
| `height` | `number` | yes | Ratio, not pixels |

## `blog` — type `Blog extends BasePageConfig`

No fields beyond `BasePageConfig`. Route currently toggled off (`"/blog": false`).

## `work` — type `Work extends BasePageConfig`

No fields beyond `BasePageConfig`. Project bodies are MDX files, not content fields.

## `gallery` — type `Gallery extends BasePageConfig`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `images` | `Array<{ src, alt, orientation }>` | yes | Sourced from generated `src/data/gallery.json` |
| `images[].src` | `string` | yes | `/images/gallery/gallery-N.ext` |
| `images[].alt` | `string` | yes | `sync-gallery.mjs` writes `"Gallery"` for every entry |
| `images[].orientation` | `string` | yes | `sync-gallery.mjs` writes `"horizontal"` for every entry |

## `process` — type `Process extends BasePageConfig`

A `Process` type exists in `src/types/content.types.ts` for the `/process` page (headline, stats, layers, and related sections). It is being introduced by effort 007 and its field set is still in flux — read the type file for the current shape.

## Project MDX frontmatter

One file per project in `src/app/work/projects/*.mdx`. Parsed by `gray-matter` in `src/utils/utils.ts`. The `.mdx` filename is the URL slug.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | `string` | yes | |
| `publishedAt` | `string` | yes | `YYYY-MM-DD`. Sorts the `/work` index, newest first |
| `summary` | `string` | yes | Card copy |
| `images` | `string[]` | no (defaults `[]`) | **Public** paths, e.g. `/images/projects/atomnet.png` |
| `link` | `string` | no | External URL, usually the GitHub repo |
| `subtitle` | `string` | no | Tolerated by `utils.ts` |
| `image` | `string` | no | Tolerated by `utils.ts` |
| `tag` | `string` | no | Tolerated by `utils.ts` |
| `team` | `Team[]` | no | Tolerated by `utils.ts`; `{ name, role, avatar, linkedIn }` |

Blog posts in `src/app/blog/posts/*.mdx` use the same reader.

## Accent CSS classes

Defined in `src/resources/custom.css`, for inline emphasis in `React.ReactNode` copy fields.

| Class |
| --- |
| `.intro-cyan` |
| `.intro-amber` |
| `.intro-violet` |
| `.intro-emerald` |
| `.intro-coral` |
