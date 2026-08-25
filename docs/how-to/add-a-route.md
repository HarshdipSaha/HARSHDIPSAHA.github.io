# How to add a route

Goal: a new top-level page that is both reachable and linked. This is a **two-place edit** — the page file and the `nav` array — nothing else.

## Steps

1. **Create the page.** `src/app/newroute/page.tsx`, a standard App Router page component. Static-export rules apply: no server actions, no route handlers, no dynamic server rendering. See [../explanation/why-static-export.md](../explanation/why-static-export.md).

   Copy the shape of an existing page (`src/app/story/page.tsx` or `src/app/process/page.tsx`):

   ```tsx
   import type { Metadata } from "next";
   import { Reveal } from "@/components/motion/Reveal";
   import { Container, Label } from "@/components/ui";
   import { newroute } from "@/content/site";

   export const metadata: Metadata = {
     title: newroute.title,
     description: "...",
     alternates: { canonical: "/newroute" },
   };

   export default function NewRoutePage() {
     return (
       <Container className="pb-28 pt-36 md:pt-40">
         <Reveal variant="blur-up">
           <Label>{newroute.title}</Label>
           <h1 className="display mt-5 text-[clamp(3rem,8vw,6.5rem)] text-paper">{newroute.headline}</h1>
         </Reveal>
       </Container>
     );
   }
   ```

   Copy lives in a new export in `src/content/site.ts` (`export const newroute = { title: "...", headline: "..." }`), not in the component.

2. **Add the nav entry.** In `src/content/site.ts`:

   ```ts
   export const nav = [
     { label: "Story", href: "/story" },
     { label: "Projects", href: "/projects" },
     { label: "Gallery", href: "/gallery" },
     { label: "Process", href: "/process" },
     { label: "New route", href: "/newroute" },
   ];
   ```

   `src/components/Nav.tsx` (desktop pills and the mobile menu), `src/components/Footer.tsx` (the "Site" column) and `src/app/sitemap.ts` all iterate this array. One edit, three surfaces.

3. **Style with what exists.** `Container`, `Label`, `Pill`, `Arrow` from `src/components/ui.tsx`; `.display` for the headline, `.prose` for long copy, `.measure` for a 40rem column; `Reveal` / `Group` / `Item` for entrances. Colours are `text-paper/NN`, `border-white/10`, `bg-ink-2`, and `tangerine` for one accent. No new hex values.

## Verify

```
npm run typecheck                 # clean
npm run build                     # succeeds; out/newroute/index.html exists
grep newroute out/sitemap.xml     # sitemap picked it up
```

Then load `http://localhost:3000/newroute` **and** confirm the link is visible in the nav on both a wide viewport (pill row) and a narrow one (menu button → full-screen list), and in the footer.

## Gotchas

- **Page without nav entry** = an orphan. Next still exports it and it renders if you type the URL, but nothing links to it and it is missing from the sitemap.
- **Nav entry without page** = a 404 link in the header, footer and sitemap. `tsc` will not catch it — `nav` is an untyped array of strings.
- The home route `/` is deliberately **not** in `nav`: the wordmark in `Nav.tsx` links home and `Footer.tsx` adds "Home" explicitly. Don't add it.
- Removing a route means deleting the page **and** the `nav` entry. There is no toggle to flip.
- Detail pages under a route (`/projects/[slug]`) use `generateStaticParams`; they are not nav entries.

## Precedent

`/process` and `/story` were built by this procedure in the rebuild recorded as ADR 0011 / effort 013.
