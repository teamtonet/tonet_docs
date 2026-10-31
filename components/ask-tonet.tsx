'use client';

import Script from 'next/script';
import { askTonetEnabled } from '@/lib/shared';

/** Loads Ask Tonet's chat button, the same one tonet.ai shows, once the API accepts the docs. */
export function AskTonet() {
  if (!askTonetEnabled) return null;
  return <Script src="https://dashboard.tonet.ai/tonet-widget.js" strategy="lazyOnload" />;
}

/** "Ask about this page": opens Ask Tonet with a question about the page already typed. */
export function AskAboutPage({ title }: { title: string }) {
  if (!askTonetEnabled) return null;
  return (
    <button
      type="button"
      className="tn-ask"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent('tonet:open-assistant', { detail: { draft: `About "${title}": ` } }),
        )
      }
    >
      Ask about this page
    </button>
  );
}
