import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

const logo = `data:image/svg+xml;base64,${readFileSync(
  join(process.cwd(), 'public/brand/tonet-logo-on-dark.svg'),
).toString('base64')}`;

// The stock template sets every page's title at 82px in a fixed height, so a two-line title ran
// into the description. Titles run to 57 characters and descriptions to 160: these sizes hold
// two lines of title and three of description, and each block keeps its own height.
const clip = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, text.lastIndexOf(' ', max))}…`;

export async function GET(_req: Request, { params }: RouteContext<'/og/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '64px 72px',
        color: 'white',
        backgroundColor: '#0c0c0c',
        borderBottom: '12px solid #F45F1F',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo} width={196} height={43} />
        <div style={{ display: 'flex', fontSize: 34, color: 'rgba(240,240,240,0.6)' }}>Docs</div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', flexShrink: 0, fontSize: 66, fontWeight: 700, lineHeight: 1.12 }}>
          {clip(page.data.title, 60)}
        </div>
        <div
          style={{
            display: 'flex',
            flexShrink: 0,
            fontSize: 34,
            lineHeight: 1.35,
            color: 'rgba(240,240,240,0.75)',
          }}
        >
          {clip(page.data.description ?? '', 165)}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}
