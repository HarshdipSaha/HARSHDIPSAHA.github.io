"use client";

import { LightboxImage } from "@/components/LightboxImage";
import { gallery } from "@/resources";
import { MasonryGrid } from "@once-ui-system/core";

export default function GalleryView() {
  return (
    <MasonryGrid columns={2} s={{ columns: 1 }}>
      {gallery.images.map((image, index) => (
        <LightboxImage
          key={image.src}
          src={image.src}
          alt={image.alt}
          priority={index < 4}
          sizes="(max-width: 560px) 100vw, 50vw"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
        />
      ))}
    </MasonryGrid>
  );
}
