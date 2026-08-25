import manifest from "@/data/image-manifest.json";

type Variant = { w: number; h: number; src: string; bytes: number };
type Entry = {
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
  bytes: number;
  sources: Array<{ type: string; srcSet: string }>;
  variants: Record<string, Variant[]>;
};

const IMAGES = (manifest as { images: Record<string, Entry> }).images;

interface ResponsiveImageProps {
  src: string;
  alt: string;
  /** The `sizes` attribute. Get this right or srcset picks the wrong file. */
  sizes: string;
  /** Above-the-fold images opt out of lazy loading and get fetch priority. */
  priority?: boolean;
  className?: string;
  /** CSS aspect-ratio override, e.g. "16 / 10". Defaults to the intrinsic one. */
  aspectRatio?: string;
  radius?: string;
  style?: React.CSSProperties;
}

/**
 * A responsive `<picture>` built from the build-time image manifest.
 *
 * `output: "export"` forces `images.unoptimized: true`, so `next/image` does no
 * work at all and the `sizes` props scattered around the codebase were inert.
 * Every image shipped at its authored resolution — one project PNG was 6 MB,
 * served whole to phones. `scripts/optimize-images.mjs` now emits AVIF and WebP
 * at several widths and records them in the manifest; this reads it.
 *
 * Intrinsic `width`/`height` are always emitted so the browser can reserve the
 * box before the bytes arrive, which is what keeps Cumulative Layout Shift at
 * zero. Unknown sources fall through to a plain `<img>` rather than breaking.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  aspectRatio,
  radius = "var(--radius-m)",
  style,
}: ResponsiveImageProps) {
  const entry = IMAGES[src];

  const common = {
    alt,
    className,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: priority ? ("sync" as const) : ("async" as const),
    ...(priority ? { fetchPriority: "high" as const } : {}),
    style: {
      display: "block",
      width: "100%",
      height: "auto",
      objectFit: "cover" as const,
      borderRadius: radius,
      aspectRatio: aspectRatio ?? (entry ? `${entry.width} / ${entry.height}` : undefined),
      ...style,
    },
  };

  // Not in the manifest (an external or newly dropped file) — ship it plainly.
  if (!entry) {
    return <img src={src} sizes={sizes} {...common} />;
  }

  return (
    <picture>
      {entry.sources.map((s) => (
        <source key={s.type} type={s.type} srcSet={s.srcSet} sizes={sizes} />
      ))}
      <img src={entry.src} width={entry.width} height={entry.height} sizes={sizes} {...common} />
    </picture>
  );
}

export default ResponsiveImage;
