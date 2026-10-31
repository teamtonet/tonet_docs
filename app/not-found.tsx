import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import Link from 'next/link';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function NotFound() {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()} nav={{ ...baseOptions().nav, mode: 'top' }}>
      <main className="tn-404">
        <p className="tn-404-code">404</p>
        <h1 className="tn-title">That page isn't here</h1>
        <p>It may have moved. Search with the box at the top, or start from one of these:</p>
        <ul>
          <li><Link href="/">Start here</Link></li>
          <li><Link href="/phones">Phones</Link></li>
          <li><Link href="/billing">Billing and prices</Link></li>
          <li><Link href="/ip_phones">Desk phones</Link></li>
        </ul>
      </main>
    </DocsLayout>
  );
}
