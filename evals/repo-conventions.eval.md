# Eval: repo conventions

Assertions that must hold in a healthy checkout. Run from the repo root. Commands are bash (Git Bash on Windows) unless marked otherwise. `manual` means no practical one-liner — inspect by hand.

No runner executes these; see [README.md](README.md).

## Build integrity

### C-01 — Type-check is clean
**Assertion:** `tsc` reports no errors.
**Verify:** `npx tsc --noEmit -p tsconfig.json; echo "exit=$?"`
**Expected:** `exit=0`, no diagnostics.
**Automatable:** yes.

### C-02 — Build succeeds and produces `out/`
**Assertion:** `npm run build` exits 0 and `out/index.html` exists.
**Verify:** `npm run build && test -f out/index.html && echo PASS`
**Expected:** `PASS`.
**Automatable:** yes.

## Content contract

### C-03 — Every project MDX has the required frontmatter
**Assertion:** every `.mdx` in `src/app/work/projects/` declares `title`, `publishedAt` and `summary`.
**Verify:**
```bash
for f in src/app/work/projects/*.mdx; do
  for k in title publishedAt summary; do
    grep -q "^$k:" "$f" || echo "MISSING $k -> $f"
  done
done
```
**Expected:** no output.
**Automatable:** yes.

### C-04 — `publishedAt` is a valid `YYYY-MM-DD`
**Assertion:** every `publishedAt` matches the date format that sorts the `/work` index.
**Verify:**
```bash
grep -h "^publishedAt:" src/app/work/projects/*.mdx |
  grep -vE "^publishedAt: *.[0-9]{4}-[0-9]{2}-[0-9]{2}"
```
**Expected:** no output.
**Automatable:** yes.

### C-05 — Every `images:` path in project MDX resolves to a real file
**Assertion:** each public image path referenced in project frontmatter exists under `public/`.
**Verify:**
```bash
grep -ho "/images/[A-Za-z0-9._/-]*" src/app/work/projects/*.mdx | sort -u |
  while read -r p; do test -f "public$p" || echo "MISSING public$p"; done
```
**Expected:** no output.
**Automatable:** yes.

## Asset pipeline

### C-06 — Every drop-zone project image reaches `public/images/projects/`
**Assertion:** after `node scripts/sync-project-images.mjs`, the published count matches the recognised source count.
**Verify:**
```bash
node scripts/sync-project-images.mjs
find project_images -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) | wc -l
find public/images/projects -maxdepth 1 -type f | wc -l
```
**Expected:** the two counts are equal (18 at time of writing). A higher published count means stale files from deleted sources — the sync scripts never delete.
**Automatable:** yes.

### C-07 — `src/data/gallery.json` entry count equals the file count in `gallery/`
**Assertion:** the generated gallery manifest is in sync with the drop-zone.
**Verify:**
```bash
node scripts/sync-gallery.mjs
grep -c '"src"' src/data/gallery.json
find gallery -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) | wc -l
```
**Expected:** equal (8 at time of writing).
**Automatable:** yes.

### C-08 — `public/images/**` contains no hand-copied asset
**Assertion:** every file under `public/images/` traces to a drop-zone: `me.jpg` / `og/home.jpg` from root `me.jpg`, `gallery/*` from `gallery/`, `projects/*` from `project_images/`.
**Verify:** destructive — run on a clean tree.
```bash
rm -rf public/images
node scripts/sync-me.mjs && node scripts/sync-gallery.mjs && node scripts/sync-project-images.mjs
git status --porcelain public/images
```
**Expected:** no output. Any deleted (` D `) line is a hand-placed asset that no drop-zone reproduces.
**Automatable:** yes, with care.

## Routing

### C-09 — Every enabled route has a page component
**Assertion:** every path set `true` in the `routes` object of `src/resources/once-ui.config.ts` has a matching `src/app/<route>/page.tsx` (`/` maps to `src/app/page.tsx`).
**Verify:**
```bash
grep -oE '"/[a-z]*": *true' src/resources/once-ui.config.ts |
  sed -E 's|"/([a-z]*)": *true|\1|' |
  while read -r r; do
    if [ -z "$r" ]; then p="src/app/page.tsx"; else p="src/app/$r/page.tsx"; fi
    test -f "$p" || echo "MISSING $p"
  done
```
**Expected:** no output.
**Automatable:** yes.

### C-10 — Every enabled route has a nav entry (no orphan pages)
**Assertion:** each `true` route appears as an `href="/route"` `<ToggleButton>` in `src/components/Header.tsx`.
**Verify:**
```bash
grep -oE '"/[a-z]*": *true' src/resources/once-ui.config.ts |
  sed -E 's|": *true||; s|"||' |
  while read -r r; do
    grep -q "href=\"$r\"" src/components/Header.tsx || echo "NO NAV ENTRY $r"
  done
```
**Expected:** no output.
**Automatable:** yes.

### C-11 — No nav entry points at a disabled route (no broken links)
**Assertion:** every `href` in `Header.tsx` sits inside its `routes[...]` guard, with both responsive variants present.
**Verify:** manual — read `src/components/Header.tsx` and confirm each `<ToggleButton href="/x">` is inside `{routes["/x"] && (...)}`, and that both the desktop `<Row s={{hide:true}}>` and mobile `<Row hide s={{hide:false}}>` variants exist.
**Expected:** all guarded, both variants present.
**Automatable:** no.

## Icon registry

### C-12 — Every icon name referenced in content exists in the registry
**Assertion:** every `icon:` value in `src/resources/content.tsx` is a key of `src/resources/icons.ts`.
**Verify:**
```bash
grep -oE 'icon: *"[A-Za-z0-9]+"' src/resources/content.tsx |
  grep -oE '"[A-Za-z0-9]+"' | tr -d '"' | sort -u |
  while read -r i; do
    grep -qE "^[[:space:]]+$i:" src/resources/icons.ts || echo "UNREGISTERED ICON $i"
  done
```
**Expected:** no output. `tsc` also catches this for fields typed `IconName`, but not for `about.technical.skills[].tags[].icon`, which is plain `string`.
**Automatable:** yes.

## Secrets hygiene

### C-13 — No secrets committed
**Assertion:** no `.env` file with real values is tracked; only `.env.example`.
**Verify:**
```bash
git ls-files | grep -E '(^|/)\.env'
```
**Expected:** nothing, or `.env.example` only.
**Automatable:** yes.

### C-14 — No credential-shaped strings in tracked source
**Assertion:** no API keys or tokens in `src/`, `scripts/` or config files.
**Verify:** manual — scan for `sk-`, `ghp_`, `AKIA`, `BEGIN PRIVATE KEY` across tracked files and in `git log -p`. Automated secret scanning is not wired up.
**Expected:** no hits.
**Automatable:** partially.

## Process integrity

### C-15 — Every effort folder has both required files
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

### C-16 — Registry row count equals effort folder count
**Assertion:** `aidlc-docs/registry.md`, a derived view, matches the filesystem.
**Verify:**
```bash
grep -cE '^\| [0-9]{3} \|' aidlc-docs/registry.md
ls -d aidlc-docs/efforts/*/ | wc -l
```
**Expected:** equal (7 at time of writing). On mismatch, regenerate `registry.md` from the effort files — do not patch the row. The filesystem wins.
**Automatable:** yes.

### C-17 — Registry statuses match the effort files
**Assertion:** every `Status` in the registry table equals the `Status` row of the corresponding `effort-state.md`.
**Verify:** manual — compare column by column, or regenerate the registry and diff it against the committed one.
**Expected:** identical.
**Automatable:** yes, once a generator exists.

### C-18 — Reconstructed efforts are flagged
**Assertion:** efforts backfilled from commit diffs carry a `Reconstructed` field, so they are not mistaken for contemporaneous records.
**Verify:**
```bash
grep -L "Reconstructed" aidlc-docs/efforts/*/effort-state.md
```
**Expected:** no output.
**Automatable:** yes.

## See also

- [../docs/reference/commands.md](../docs/reference/commands.md) — definition of done.
- [../docs/reference/build-scripts.md](../docs/reference/build-scripts.md) — what each sync script owns.
- [../docs/how-to/run-an-aidlc-effort.md](../docs/how-to/run-an-aidlc-effort.md) — when to run these.
