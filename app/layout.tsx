import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { ATTRIBUTION, Analytics } from '@/components/analytics';
import { AskTonet } from '@/components/ask-tonet';
import { appName, siteUrl } from '@/lib/shared';
import './global.css';

// The same faces as tonet.ai: Space Grotesk for text, Instrument Serif for headlines.
const sans = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Tonet Help', template: `%s – ${appName}` },
  description: 'How to set up and use Tonet, the business phone system that runs in your browser.',
  applicationName: appName,
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: { siteName: appName, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ATTRIBUTION }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <Analytics />
        <AskTonet />
      </body>
    </html>
  );
}
