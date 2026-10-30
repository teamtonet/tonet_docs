import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function Layout({ children }: LayoutProps<'/[[...slug]]'>) {
  const base = baseOptions();
  // A top bar like tonet.ai's, with Sign in and Start with $15 as real buttons.
  return (
    <DocsLayout tree={source.getPageTree()} {...base} nav={{ ...base.nav, mode: 'top' }}>
      {children}
    </DocsLayout>
  );
}
