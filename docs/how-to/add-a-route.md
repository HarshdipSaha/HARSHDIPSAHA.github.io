# How to add a route

Goal: a new top-level page that is both reachable and linked. This is a **two-place edit** — the routes toggle and `Header.tsx` — plus the page itself.

## Steps

1. **Toggle it on.** In `src/resources/once-ui.config.ts`, add the path to the `routes` object:

   ```ts
   const routes: RoutesConfig = {
     "/": true,
     "/about": true,
     "/work": true,
     "/blog": false,
     "/gallery": true,
     "/newroute": true,
   };
   ```

2. **Create the page.** `src/app/newroute/page.tsx`, a standard App Router page component. Static-export rules apply: no server actions, no route handlers, no dynamic server rendering. See [../explanation/why-static-export.md](../explanation/why-static-export.md).

3. **Add the nav entry.** In `src/components/Header.tsx`, inside the `<Row gap="4" ...>` group, copy the shape used by the existing routes — a guarded pair, labelled on desktop, icon-only on small screens:

   ```tsx
   {routes["/newroute"] && (
     <>
       <Row s={{ hide: true }}>
         <ToggleButton
           prefixIcon="rocket"
           href="/newroute"
           label={newroute.label}
           selected={pathname.startsWith("/newroute")}
         />
       </Row>
       <Row hide s={{ hide: false }}>
         <ToggleButton
           prefixIcon="rocket"
           href="/newroute"
           selected={pathname.startsWith("/newroute")}
         />
       </Row>
     </>
   )}
   ```

   `<Row s={{ hide: true }}>` is the desktop variant (hidden at the `s` breakpoint); `<Row hide s={{ hide: false }}>` is the inverse, the mobile icon-only variant. Both are needed. Use `pathname === "/newroute"` if the route has no child pages, `pathname.startsWith(...)` if it does (as `/work` and `/gallery` do).

4. **Check the icon exists.** `prefixIcon` must be a key in `src/resources/icons.ts`. Existing keys include `home`, `person`, `grid`, `book`, `gallery`, `rocket`, `document`, `calendar`, `globe`. If yours is missing, import the react-icons component and register it there first — `IconName` is derived from that registry, so an unknown name is a type error.

5. **Wire the label.** `Header.tsx` imports its labels from `@/resources` (`about.label`, `work.label`, ...). If your page has a content object in `src/resources/content.tsx`, export it and use `<object>.label`; otherwise pass a literal string.

## Verify

```
npx tsc --noEmit -p tsconfig.json     # clean
npm run build                          # succeeds; out/newroute/index.html exists
```

Then load `http://localhost:3000/newroute` **and** confirm the link is visible in the header on both a wide and a narrow viewport.

## Gotchas

- **Toggle without nav entry** = an orphan page. It renders if you type the URL, but nothing links to it.
- **Nav entry without toggle** = the `routes["/newroute"] &&` guard is falsy, so the link silently disappears; if you omit the guard you get a link to a page you meant to keep hidden.
- **Page without toggle** — the file exists and Next will still export it. The `routes` object controls navigation and page-level gating in this codebase, not the router.
- Removing a route means undoing all three edits, not just flipping the boolean. `/blog` is the live example of a toggled-off route: `"/blog": false`, posts still present in `src/app/blog/posts/`.

## Precedent

The `/process` route was added by this exact procedure. See [../adr/0008-adopt-ai-dlc-and-docs-first-structure.md](../adr/0008-adopt-ai-dlc-and-docs-first-structure.md).
