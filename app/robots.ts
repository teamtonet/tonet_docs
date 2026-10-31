import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';

// Every crawler is welcome, AI ones included: these are public help pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
