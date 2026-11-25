import type { MetadataRoute } from "next";
import { heroSrc, site } from "@/lib/config";
import { gallerySrc, photos } from "@/lib/photos";
import { locales, localeTag } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [localeTag[l], `${site.url}/${l}`]));
  // Lets Google Images index the photos (searches like "villa pool Brač").
  const images = [heroSrc, ...photos.map((p) => gallerySrc(p.id))].map((src) => `${site.url}${src}`);
  return locales.map((l) => ({
    url: `${site.url}/${l}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
    images,
  }));
}
