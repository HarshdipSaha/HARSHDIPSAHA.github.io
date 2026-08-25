"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ResponsiveImage } from "@/components/ResponsiveImage";

interface LightboxImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  aspectRatio?: string;
  className?: string;
}

/**
 * A responsive image that enlarges into a native `<dialog>`.
 *
 * This exists because the gallery previously had to choose between Once UI's
 * `<Media enlarge>` (a working lightbox, but no `srcset` — every photo shipped
 * at full resolution) and `ResponsiveImage` (responsive, no lightbox). Keeping
 * both means building the lightbox on top of the responsive picture.
 *
 * `<dialog showModal()>` is doing real work here rather than being decoration:
 * the platform gives focus trapping, Escape-to-close, inertness of the page
 * behind, and a top-layer that cannot be clipped by an ancestor's overflow or
 * stacking context — all of which a hand-rolled `div` overlay has to
 * reimplement, usually incorrectly.
 */
export function LightboxImage({
  src,
  alt,
  sizes,
  priority = false,
  aspectRatio,
  className,
}: LightboxImageProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onClose = () => setOpen(false);
    node.addEventListener("close", onClose);
    return () => node.removeEventListener("close", onClose);
  }, []);

  const openLightbox = () => {
    setOpen(true);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        className={["lightbox-trigger", className].filter(Boolean).join(" ")}
        onClick={openLightbox}
        aria-label={`Enlarge image: ${alt}`}
      >
        <ResponsiveImage
          src={src}
          alt={alt}
          sizes={sizes}
          priority={priority}
          aspectRatio={aspectRatio}
        />
      </button>

      <dialog
        ref={dialogRef}
        className="lightbox"
        // Clicking the backdrop closes. The check compares against the dialog
        // itself, because the image is a child and must not close on click.
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        {open && (
          <figure className="lightbox-figure">
            <ResponsiveImage
              src={src}
              alt={alt}
              // Full-viewport in the lightbox, so the browser is free to pick
              // the largest rung rather than the card-sized one.
              sizes="100vw"
              priority
              style={{ maxHeight: "88vh", width: "auto", objectFit: "contain" }}
            />
            {/* No caption: every gallery image currently carries the same
                generic alt ("Gallery"), so a caption would render the word
                "GALLERY" under each photo and add nothing. Descriptive alt
                text is a content fix in sync-gallery.mjs, not a layout one. */}
          </figure>
        )}
        <button type="button" className="lightbox-close" onClick={close} aria-label="Close">
          ✕
        </button>
      </dialog>
    </>
  );
}

export default LightboxImage;
