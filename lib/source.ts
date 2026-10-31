import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // `nav` is the short sidebar label; `title` stays the full, searchable page title.
    schema: pageSchema.extend({ nav: z.string().optional() }),
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  pageTree: {
    transformers: [
      {
        file(node, filePath) {
          if (!filePath) return node;
          const file = this.storage.read(filePath);
          const nav = file?.format === 'page' ? (file.data as { nav?: string }).nav : undefined;
          return nav ? { ...node, name: nav } : node;
        },
      },
    ],
  },
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
