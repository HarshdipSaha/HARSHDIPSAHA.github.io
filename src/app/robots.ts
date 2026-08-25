import type { MetadataRoute } from "next";
import { person } from "@/content/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${person.siteUrl}/sitemap.xml`,
  };
}
