# How to update site content

Goal: change copy on `/`, `/story`, `/process`, the nav, or the footer.

Every word that is not a project case study lives in **`src/content/site.ts`**, one exported object per section. Components destructure those exports; they do not carry copy of their own. Do not edit copy inside components.

## Steps

1. Open `src/content/site.ts` and find the export for the section: `person`, `nav`, `hero`, `sequence`, `passage`, `threads`, `experience`, `selectedProjects`, `closing`, `story`, `publication`, `footer`, `process`.
2. Edit the field. Shapes are listed in [../reference/content-schema.md](../reference/content-schema.md).
3. Run `npm run typecheck`.

## Common edits

| Change | Where |
| --- | --- |
| Role / email / GitHub / LinkedIn / résumé path | `person.role`, `person.email`, `person.github`, `person.linkedin`, `person.resume` |
| Site description (meta + OG) | `person.description` |
| Hero headline (two halves) and sub-line | `hero.left`, `hero.right`, `hero.subline` |
| Copy over the brain sequence | `sequence.stages[0..2]` — `{ kicker, title, body, links? }`; keep exactly three |
| The scroll-lit passage | `passage` — one string; wrap a word in `*asterisks*` to colour it tangerine |
| Three-card stack | `threads.cards[]` — `{ title, body, href, cta, image }`; `image` is `"gallery:N"` or `"project:<slug>"` |
| Add a job | push onto `experience.items[]` — `{ company, role, when, points: [] }` |
| Which six projects show on `/` | `selectedProjects.slugs[]` — must be real project slugs |
| Closing CTA | `closing.title`, `closing.body` |
| Story intro / statement / later paragraphs | `story.intro[]`, `story.statement`, `story.more[]` |
| Add a degree/school | push onto `story.education[]` — `{ name, detail }` |
| Add an achievement | push onto `story.achievements[]` — `{ title, body, href }` |
| Skills / interests chips | `story.skills[]`, `story.interests[]` (plain strings) |
| Lead publication | `publication` — `{ title, venue, result, links[] }` |
| Footer colophon lines | `footer.colophon[]` — keep the ICBM 152 copyright line; the template's licence requires it |
| Process page stats / ADR list | `process.stats[]`, `process.decisions[]` — update when an effort or ADR lands |
| Nav / footer links | `nav[]` — `{ label, href }`; see [add-a-route.md](add-a-route.md) |

## Emphasis

There are no inline accent classes. Copy fields are plain strings. The only inline emphasis mechanism is `*word*` inside `passage`, which `ScrollWords` renders in tangerine. In MDX bodies, `_italic_` renders in the display serif via `.prose em`.

## Verify

```
npm run typecheck                 # clean
npm run build                     # succeeds
```

Then check the page in the browser. If you changed `nav` or `selectedProjects.slugs`, the build is the test — the sitemap and static params come from them.

## Gotchas

- `site.ts` has no separate types file. Shapes are inferred from the literals, and components destructure them, so removing a field a component reads is a **compile error, not a runtime one**. Adding a field nothing reads is silent — it just doesn't render.
- `selectedProjects.slugs` and `threads.cards[].href` / `image` are not type-checked against real slugs. A typo yields a missing card (`getProjectsBySlugs` filters it out) or a fallback image, not an error. Check the page.
- Long-form project bodies do **not** live here — they are MDX under `content/projects/`. See [add-a-project.md](add-a-project.md).
- `content/writing/*.mdx` (three old blog posts) is not rendered by any route. Editing it changes nothing on the site.
- Gallery images come from generated `src/data/images.json`; edit the `gallery/` drop-zone instead. See [add-a-gallery-image.md](add-a-gallery-image.md).
