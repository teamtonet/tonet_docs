import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { signInUrl, signUpUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="tn-brand">
          <img src="/brand/tonet-logo-on-light.svg" alt="Tonet" className="tn-logo dark:hidden" />
          <img src="/brand/tonet-logo-on-dark.svg" alt="Tonet" className="tn-logo hidden dark:block" />
          <span className="tn-docs-tag">Docs</span>
        </span>
      ),
      url: '/',
    },
    links: [
      { text: 'tonet.ai', url: 'https://tonet.ai', external: true },
      { text: 'Prices', url: '/billing', active: 'none' },
      // Buttons in the top bar, styled like tonet.ai's Login / Get Started.
      {
        type: 'custom',
        on: 'nav',
        secondary: true,
        children: (
          <a className="tn-btn tn-btn-ghost" href={signInUrl}>
            Sign in
          </a>
        ),
      },
      {
        type: 'custom',
        on: 'nav',
        secondary: true,
        children: (
          <a className="tn-btn tn-btn-cta" href={signUpUrl}>
            Start with $15
          </a>
        ),
      },
      // The phone menu lists them as plain links.
      { text: 'Sign in', url: signInUrl, external: true, on: 'menu' },
      { text: 'Start with $15', url: signUpUrl, external: true, on: 'menu' },
    ],
  };
}
