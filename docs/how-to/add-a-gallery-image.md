# How to add a gallery image

Goal: a new image on `/gallery`.

## Steps

1. Copy the image into the `gallery/` folder at the repo root. Recognised extensions: `.jpeg` `.jpg` `.png` `.webp`.

2. Run the image build:

   ```
   npm run images
   ```

   or `npm run dev`, whose `predev` step runs it.

The script sorts `gallery/` by filename, encodes each file with sharp to `public/img/gallery/NN.webp` (max 1600px, q80) and a thumbnail `public/img/gallery/NN-s.webp` (max 640px, q74), and rewrites the `gallery` array in `src/data/images.json` from scratch.

## Verify

```
npm run images
# images: 9 gallery, 19 projects, 2 encoded
```

The gallery count should be one higher than before (8 at time of writing) and `encoded` should be 2 (full + thumb). Then open `http://localhost:3000/gallery`.

## Notes

- **`src/data/images.json` and `public/img/gallery/` are generated. Do not hand-edit them** — the next `predev`, `prebuild` or `npm run images` overwrites them. `public/img/` is gitignored; the manifest is committed.
- Each manifest entry is `{ "src": "/img/gallery/NN.webp", "thumb": "/img/gallery/NN-s.webp", "w": <px>, "h": <px> }`. Width and height are the real encoded dimensions, so the masonry grid reserves the right aspect ratio before the image loads. There is no `alt` field — `Gallery.tsx` writes `Photograph N`.
- Numbering is positional (`01`, `02`, …): inserting a file that sorts earlier renumbers everything after it. One thing references gallery images by number — `threads.cards[].image` in `src/content/site.ts` (`"gallery:5"`, `"gallery:1"`), which feeds the home-page card stack. Check those still point at the photo you meant.
- Encoding is cached by source mtime in `.cache/images.json`; a warm run re-encodes nothing.

## See also

- [../reference/build-scripts.md](../reference/build-scripts.md)
