import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
import { locales, localeTag } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [localeTag[l], `${site.url}/${l}`]));
  return locales.map((l) => ({
    url: `${site.url}/${l}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
  }));
}
