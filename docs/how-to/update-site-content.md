# How to update site content

Goal: change copy on `/`, `/about`, `/work` or `/gallery`.

All site copy lives in **`src/resources/content.tsx`**, typed against `src/types/content.types.ts`. Do not edit copy inside components.

## Steps

1. Open `src/resources/content.tsx` and find the exported object for the page: `person`, `social`, `home`, `about`, `blog`, `work`, `gallery`.
2. Edit the field. Field names and types are listed in [../reference/content-schema.md](../reference/content-schema.md).
3. Run `npx tsc --noEmit -p tsconfig.json`.

## Common edits

| Change | Where |
| --- | --- |
| Role / job title | `person.role` |
| Home headline, sub-line, featured badge | `home.headline`, `home.subline`, `home.featured` |
| About intro paragraph | `about.intro.description` |
| Add a job | push onto `about.work.experiences[]` — `{ company, timeframe, role, achievements: [], images?: [] }` |
| Add a degree/school | push onto `about.studies.institutions[]` — `{ name, description }` |
| Add a tech-stack icon | push onto `about.technical.techStack[]` — `{ name, icon }`, where `icon` is a key of `src/resources/icons.ts` |
| Add a skill block | push onto `about.technical.skills[]` — `{ title, description?, tags?, images? }` |
| Add a research interest | push a string onto `about.researchInterests.items[]` |
| Hide a whole section | set its `display: false` (`about.calendar`, `about.studies`, `about.tableOfContent`, ...) |
| Social links | `social[]` — `{ name, icon, link, essential? }` |

## Accent spans

`src/resources/custom.css` defines five accent classes for inline emphasis inside `React.ReactNode` copy fields:

`.intro-cyan` `.intro-amber` `.intro-violet` `.intro-emerald` `.intro-coral`

```tsx
headline: <>Building <span className="intro-cyan">neuro-symbolic</span> systems</>,
```

Use the existing classes; adding a sixth means editing `custom.css`.

## Verify

```
npx tsc --noEmit -p tsconfig.json     # clean
npm run biome-write                    # formatting
npm run build                          # succeeds
```

Then check the page in the browser.

## Gotchas

- Content fields typed `React.ReactNode` hold JSX. A malformed entry — unclosed tag, wrong field name, missing required key — is a **compile error, not a runtime one**. That is the point of the design; see [../explanation/content-as-code.md](../explanation/content-as-code.md).
- `icon` fields are typed `IconName`, derived from `src/resources/icons.ts`. An unregistered name fails `tsc`.
- Long-form project bodies do **not** live here — they are MDX under `src/app/work/projects/`. See [add-a-project.md](add-a-project.md).
- `gallery.images` comes from generated `src/data/gallery.json`; edit the `gallery/` drop-zone instead. See [add-a-gallery-image.md](add-a-gallery-image.md).
