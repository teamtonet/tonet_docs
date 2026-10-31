import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The old docs published their sitemap at /sitemap-0.xml, which Search Console may still read.
  async redirects() {
    return [{ source: '/sitemap-0.xml', destination: '/sitemap.xml', permanent: true }];
  },
};

export default withMDX(config);
