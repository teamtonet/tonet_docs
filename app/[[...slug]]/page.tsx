import { getBreadcrumbItems } from 'fumadocs-core/breadcrumb';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/notebook/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AskAboutPage } from '@/components/ask-tonet';
import { getMDXComponents } from '@/components/mdx';
import { appName, getPageImageUrl, getPageMarkdownUrl, siteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

type DocPage = NonNullable<ReturnType<typeof source.getPage>>;

const absolute = (path: string) => new URL(path, siteUrl).toString();

/** BreadcrumbList and TechArticle, so Google sees the page's place, owner and real date. */
function structuredData(page: DocPage) {
  const crumbs = getBreadcrumbItems(page.url, source.getPageTree(), { includePage: true, includeRoot: false })
    .filter((item) => item.url)
    .map((item, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: typeof item.name === 'string' ? item.name : page.data.title,
      item: absolute(item.url!),
    }));
  const tonet = { '@type': 'Organization', name: 'Tonet', url: 'https://tonet.ai', logo: absolute('/brand/apple-touch-icon.png') };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: appName, item: absolute('/') }, ...crumbs],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: page.data.title,
      description: page.data.description,
      url: absolute(page.url),
      inLanguage: 'en',
      author: tonet,
      publisher: tonet,
      image: absolute(getPageImageUrl(page).url),
      ...(page.data.lastModified ? { dateModified: page.data.lastModified.toISOString() } : {}),
    },
  ];
}

export default async function Page(props: PageProps<'/[[...slug]]'>) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} tableOfContent={{ style: 'clerk' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(page)) }} />
      <DocsTitle className="tn-title">{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="tn-page-meta">
        {page.data.lastModified && <PageLastUpdate date={page.data.lastModified} />}
        <MarkdownCopyButton markdownUrl={getPageMarkdownUrl(page).url} />
        <AskAboutPage title={page.data.title} />
      </div>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/[[...slug]]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const image = getPageImageUrl(page).url;
  return {
    title: page.data.title,
    description: page.data.description,
    // Absolute and query-free, so tonet.ai's ?ref= links don't make second copies of a page.
    alternates: { canonical: page.url },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630 }],
      ...(page.data.lastModified ? { modifiedTime: page.data.lastModified.toISOString() } : {}),
    },
    twitter: { card: 'summary_large_image', title: page.data.title, description: page.data.description, images: [image] },
  };
}
