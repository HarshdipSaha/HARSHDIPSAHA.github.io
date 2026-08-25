import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery";
import { Reveal } from "@/components/motion/Reveal";
import { Container, Label } from "@/components/ui";
import { gallery } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from MICCAI 2025, hackathons, and beyond.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <Container className="pb-28 pt-36 md:pt-40">
      <Reveal variant="blur-up">
        <Label>Gallery</Label>
        <h1 className="display mt-5 text-[clamp(3rem,8vw,6.5rem)] text-paper">Off the page.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/65">MICCAI in South Korea, hackathon floors, and the people in between.</p>
      </Reveal>
      <div className="mt-16">
        <Gallery photos={gallery} />
      </div>
    </Container>
  );
}
