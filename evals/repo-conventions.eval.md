# Eval: repo conventions

Assertions that must hold in a healthy checkout. Run from the repo root. Commands are bash (Git Bash on Windows) unless marked otherwise. `manual` means no practical one-liner — inspect by hand.

No runner executes these; see [README.md](README.md).

## Build integrity

### C-01 — Type-check is clean
**Assertion:** `tsc` reports no errors.
**Verify:** `npm run typecheck; echo "exit=$?"`
**Expected:** `exit=0`, no diagnostics.
**Automatable:** yes.

### C-02 — Build succeeds and produces `out/`
**Assertion:** `npm run build` exits 0 and `out/index.html`, `out/sitemap.xml` exist.
**Verify:** `npm run build && test -f out/index.html && test -f out/sitemap.xml && echo PASS`
**Expected:** `PASS`.
**Automatable:** yes.

## Content contract

### C-03 — Every project MDX has the required frontmatter
**Assertion:** every `.mdx` in `content/projects/` declares `title`, `publishedAt` and `summary`.
**Verify:**
```bash
for f in content/projects/*.mdx; do
  for k in title publishedAt summary; do
    grep -q "^$k:" "$f" || echo "MISSING $k -> $f"
  done
done
```
**Expected:** no output.
**Automatable:** yes.

### C-04 — `publishedAt` is a valid `YYYY-MM-DD`
**Assertion:** every `publishedAt` matches the date format that sorts `/projects`.
**Verify:**
```bash
grep -h "^publishedAt:" content/projects/*.mdx |
  grep -vE "^publishedAt: *.[0-9]{4}-[0-9]{2}-[0-9]{2}"
```
**Expected:** no output.
**Automatable:** yes.

### C-05 — Every `images:` path in project MDX resolves to a manifest key
**Assertion:** each `/img/projects/<slug>.webp` referenced in project frontmatter has a `projects.<slug>` entry in `src/data/images.json` (which is what `src/lib/projects.ts` actually looks up).
**Verify:**
```bash
grep -ho "/img/projects/[A-Za-z0-9._-]*\.webp" content/projects/*.mdx | sort -u |
  sed -E 's|/img/projects/(.*)\.webp|\1|' |
  while read -r s; do grep -q "\"$s\":" src/data/images.json || echo "NO MANIFEST KEY $s"; done
```
**Expected:** no output.
**Automatable:** yes.

### C-06 — Every `images:` path resolves to a real file after the build
**Assertion:** after `npm run images`, every referenced path exists under `public/`.
**Verify:**
```bash
npm run images >/dev/null
grep -ho "/img/[A-Za-z0-9._/-]*" content/projects/*.mdx | sort -u |
  while read -r p; do test -f "public$p" || echo "MISSING public$p"; done
```
**Expected:** no output.
**Automatable:** yes.

## Asset pipeline

### C-07 — Manifest project count equals the drop-zone file count
**Assertion:** `src/data/images.json` has one `projects` key per file in `project_images/`.
**Verify:**
```bash
npm run images >/dev/null
node -e 'const m=require("./src/data/images.json");console.log(Object.keys(m.projects).length)'
ls -1 project_images | wc -l
```
**Expected:** equal (19 at time of writing). A lower manifest count means two sources collapsed to one slug — a `PROJECT_MAP` collision.
**Automatable:** yes.

### C-08 — Manifest gallery count equals the recognised file count in `gallery/`
**Assertion:** the generated gallery list is in sync with the drop-zone.
**Verify:**
```bash
node -e 'const m=require("./src/data/images.json");console.log(m.gallery.length)'
find gallery -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | wc -l
```
**Expected:** equal (8 at time of writing).
**Automatable:** yes.

### C-09 — Every `PROJECT_MAP` source exists
**Assertion:** each key in `PROJECT_MAP` (`scripts/build-images.mjs`) names a file present in `project_images/`. A dangling key is a stale entry.
**Verify:**
```bash
sed -n '/^const PROJECT_MAP = {/,/^};/p' scripts/build-images.mjs |
  sed -nE 's/^  "([^"]+)".*/\1/p' |
  while IFS= read -r f; do test -f "project_images/$f" || echo "DANGLING PROJECT_MAP $f"; done
```
**Expected:** no output.
**Automatable:** yes.

### C-10 — `public/img/**` is fully regenerable
**Assertion:** nothing under `public/img/` is hand-placed — deleting it and rebuilding restores everything the site references.
**Verify:** destructive — run on a clean tree.
```bash
rm -rf public/img && npm run images >/dev/null && npm run build >/dev/null && echo PASS
git ls-files public/img | wc -l
```
**Expected:** `PASS` and `0` (nothing under `public/img/` is tracked). Only `public/brain/**` and `public/resume.pdf` are committed under `public/`.
**Automatable:** yes, with care.

## Routing

### C-11 — Every `nav` href has a page component
**Assertion:** every `href` in the `nav` array of `src/content/site.ts` has a matching `src/app/<route>/page.tsx`.
**Verify:**
```bash
sed -n '/^export const nav = \[/,/^\];/p' src/content/site.ts |
  grep -oE 'href: "/[a-z-]+"' | sed -E 's|href: "/(.*)"|\1|' |
  while read -r r; do test -f "src/app/$r/page.tsx" || echo "MISSING src/app/$r/page.tsx"; done
```
**Expected:** no output.
**Automatable:** yes.

### C-12 — Every top-level page is in `nav` (no orphan pages)
**Assertion:** every `src/app/<route>/page.tsx` (excluding the home page and dynamic segments) appears as a `nav` href.
**Verify:**
```bash
for p in src/app/*/page.tsx; do
  r=$(basename "$(dirname "$p")")
  case "$r" in \[*\]) continue;; esac
  grep -q "href: \"/$r\"" src/content/site.ts || echo "NO NAV ENTRY /$r"
done
```
**Expected:** no output.
**Automatable:** yes.

### C-13 — `site.ts` slug references point at real projects
**Assertion:** every slug in `selectedProjects.slugs` and every `project:<slug>` card image is a real project (lowercased filename in `content/projects/`) or manifest key respectively.
**Verify:**
```bash
ls content/projects | sed 's/\.mdx$//' | tr 'A-Z' 'a-z' | sort > /tmp/slugs
sed -n '/slugs: \[/,/\]/p' src/content/site.ts | grep -oE '"[a-z0-9-]+"' | tr -d '"' |
  while read -r s; do grep -qx "$s" /tmp/slugs || echo "UNKNOWN PROJECT SLUG $s"; done
grep -oE 'image: "project:[a-z0-9-]+"' src/content/site.ts | sed -E 's/.*project:(.*)"/\1/' |
  while read -r s; do grep -q "\"$s\":" src/data/images.json || echo "UNKNOWN IMAGE KEY $s"; done
```
**Expected:** no output.
**Automatable:** yes.

### C-14 — Nav, Footer and sitemap all read the same array
**Assertion:** no component hard-codes a route list; `nav` from `@/content/site` is the single source.
**Verify:**
```bash
grep -L "nav" src/components/Nav.tsx src/components/Footer.tsx src/app/sitemap.ts
```
**Expected:** no output (every file mentions `nav`).
**Automatable:** yes.

## Motion

### C-15 — Every animated component honours reduced motion
**Assertion:** every file importing from `motion/react` also calls `useReducedMotion`, or receives a `reduced` flag from a parent that does.
**Verify:**
```bash
grep -l "from \"motion/react\"" -r src | xargs grep -L "useReducedMotion"
```
**Expected:** no output. (`SmoothScroll.tsx` uses `matchMedia` directly and does not import `motion/react`, so it is out of scope here — check it by hand.)
**Automatable:** yes.

### C-16 — Scroll-driven `useTransform` ranges stay within `[0, 1]`
**Assertion:** every `useTransform(progress, [a, b, ...], ...)` whose first argument comes from `useScroll().scrollYProgress` has all input stops in `[0, 1]`. Motion 13 binds these to native scroll timelines and throws otherwise.
**Verify:** manual — read `src/components/home/BrainSequence.tsx`, `CardStack.tsx`, `src/components/motion/ScrollWords.tsx`. Look for literal stops and for computed ranges (`[i / n, (i + 1) / n]`, `[index / total, 1]`) and confirm the arithmetic cannot leave `[0, 1]`.
**Expected:** all in range.
**Automatable:** no.

### C-17 — Word spans keep their space outside the span
**Assertion:** in `TextAnimate.tsx` the separating `{" "}` follows the inline-block `<motion.span>`, not inside it (otherwise words run together).
**Verify:** `grep -n '</motion.span>{" "}' src/components/motion/TextAnimate.tsx`
**Expected:** one match.
**Automatable:** yes.

## Secrets hygiene

### C-18 — No secrets committed
**Assertion:** no `.env` file with real values is tracked; only `.env.example`.
**Verify:**
```bash
git ls-files | grep -E '(^|/)\.env'
```
**Expected:** nothing, or `.env.example` only.
**Automatable:** yes.

### C-19 — No credential-shaped strings in tracked source
**Assertion:** no API keys or tokens in `src/`, `scripts/`, `content/` or config files.
**Verify:** manual — scan for `sk-`, `ghp_`, `AKIA`, `BEGIN PRIVATE KEY` across tracked files and in `git log -p`. Automated secret scanning is not wired up.
**Expected:** no hits.
**Automatable:** partially.

## Process integrity

### C-20 — Every effort folder has both required files
**Assertion:** each `aidlc-docs/efforts/*/` contains `effort-state.md` and `requirements-delta.md`.
**Verify:**
```bash
for d in aidlc-docs/efforts/*/; do
  test -f "$d/effort-state.md" || echo "MISSING effort-state.md in $d"
  test -f "$d/requirements-delta.md" || echo "MISSING requirements-delta.md in $d"
done
```
**Expected:** no output.
**Automatable:** yes.

### C-21 — Registry row count equals effort folder count
**Assertion:** `aidlc-docs/registry.md`, a derived view, matches the filesystem.
**Verify:**
```bash
grep -cE '^\| [0-9]{3} \|' aidlc-docs/registry.md
ls -d aidlc-docs/efforts/*/ | wc -l
```
**Expected:** equal (13 at time of writing). On mismatch, regenerate `registry.md` from the effort files — do not patch the row. The filesystem wins.
**Automatable:** yes.

### C-22 — Registry statuses match the effort files
**Assertion:** every `Status` in the registry table equals the `Status` row of the corresponding `effort-state.md`.
**Verify:** manual — compare column by column, or regenerate the registry and diff it against the committed one.
**Expected:** identical.
**Automatable:** yes, once a generator exists.

### C-23 — Reconstructed efforts are flagged
**Assertion:** efforts backfilled from commit diffs carry a `Reconstructed` field, so they are not mistaken for contemporaneous records.
**Verify:**
```bash
grep -L "Reconstructed" aidlc-docs/efforts/*/effort-state.md
```
**Expected:** no output.
**Automatable:** yes.

### C-24 — The CI gate passes for the current branch
**Assertion:** a substantive diff against `main` is accompanied by an `aidlc-docs/` change.
**Verify:** `npm run check:aidlc; echo "exit=$?"`
**Expected:** `exit=0`. This is the one check that CI already enforces (`.github/workflows/aidlc-check.yml`).
**Automatable:** yes — already automated.

## See also

- [../docs/reference/commands.md](../docs/reference/commands.md) — definition of done.
- [../docs/reference/build-scripts.md](../docs/reference/build-scripts.md) — what the image build owns.
- [../docs/how-to/run-an-aidlc-effort.md](../docs/how-to/run-an-aidlc-effort.md) — when to run these.
