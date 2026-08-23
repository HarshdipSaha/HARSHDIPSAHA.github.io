# How to add a gallery image

Goal: a new image on `/gallery`.

## Steps

1. Copy the image into the `gallery/` folder at the repo root. Recognised extensions: `.jpeg` `.jpg` `.png` `.webp` `.gif`.

2. Run the sync:

   ```
   node scripts/sync-gallery.mjs
   ```

   or `npm run dev`, whose `predev` step runs it.

The script sorts `gallery/` by filename (natural/numeric sort), copies each file to `public/images/gallery/gallery-N.<ext>` and rewrites `src/data/gallery.json` from scratch.

## Verify

```
node scripts/sync-gallery.mjs
# Synced 9 gallery images from gallery/ → public/images/gallery, wrote gallery.json
```

The count should be one higher than before (8 at time of writing). Then open `http://localhost:3000/gallery`.

## Notes

- **`src/data/gallery.json` is generated. Do not hand-edit it** — the next `predev` or `prebuild` overwrites the file wholesale. Same for `public/images/gallery/`.
- Each generated entry is `{ "src": "/images/gallery/gallery-N.ext", "alt": "Gallery", "orientation": "horizontal" }`. The script writes `orientation: "horizontal"` for every image; it does not inspect image dimensions. If a specific image needs `"vertical"`, that requires changing `scripts/sync-gallery.mjs`, not the JSON.
- Filenames are positional: inserting a file that sorts earlier renumbers everything after it. Nothing links to `gallery-N` by name, so this is safe.
- `/gallery` is on in the `routes` object of `src/resources/once-ui.config.ts`. If it is off, the page will not render regardless of the JSON.

## See also

- [../reference/build-scripts.md](../reference/build-scripts.md)
