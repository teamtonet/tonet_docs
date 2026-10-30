'use client';

import { CopyCheckIcon, LinkIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

type HeadingProps = ComponentProps<'h2'> & { as: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' };

// Fumadocs' own heading puts "Copy Anchor Link" inside every heading as screen-reader text,
// so search engines read it as part of the heading. This one names the button with aria-label.
export function Heading({ as: As, id, className, children, ...props }: HeadingProps) {
  const [copied, setCopied] = useState(false);
  if (!id) return <As className={className} {...props}>{children}</As>;

  const copy = () => {
    const url = new URL(window.location.href);
    url.hash = id;
    navigator.clipboard.writeText(url.href).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => undefined,
    );
  };

  return (
    <As
      id={id}
      className={['group/heading flex scroll-m-28 flex-row items-center gap-1', className].filter(Boolean).join(' ')}
      {...props}
    >
      <a data-card="" href={`#${id}`}>
        {children}
      </a>
      <button
        type="button"
        aria-label={copied ? 'Link copied' : 'Copy a link to this section'}
        onClick={copy}
        className="inline-flex items-center justify-center rounded-md p-1 duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4 not-prose shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <CopyCheckIcon aria-hidden="true" /> : <LinkIcon aria-hidden="true" />}
      </button>
    </As>
  );
}
