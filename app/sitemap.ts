import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

// lastModified is each page's last git commit, so Google can trust it. A page without git
// history gets no date rather than a made-up one.
export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: new URL(page.url, siteUrl).toString(),
    ...(page.data.lastModified ? { lastModified: page.data.lastModified } : {}),
  }));
}
