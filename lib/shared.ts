import { createGetUrl } from 'fumadocs-core/source';

export const siteUrl = 'https://docs.tonet.ai';
export const appName = 'Tonet Docs';
export const signInUrl = 'https://dashboard.tonet.ai';
export const signUpUrl = 'https://dashboard.tonet.ai/signup';

// Ask Tonet's launcher already allows docs.tonet.ai, but the API still refuses the docs origin
// (tonet.io_fast/__init__.py `origins`). Turn this on once that list includes https://docs.tonet.ai.
export const askTonetEnabled = false;

export const docsImageRoute = '/og';
export const docsContentRoute = '/llms.mdx';

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
