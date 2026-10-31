'use client';

import { useMemo, useState } from 'react';

/**
 * Checks a 10DLC registration draft for the reasons carriers most often reject one, the same
 * list the "Registration rejected?" page explains. Runs in the browser: nothing is sent anywhere.
 * It can't promise approval; it catches the common, checkable mistakes.
 */
type Draft = { business: string; useCase: string; description: string; sample1: string; sample2: string };
type Check = { level: 'ok' | 'warn' | 'bad'; title: string; fix?: string };

const useCases = [
  'Customer Care',
  'Account Notifications',
  'Delivery Notifications',
  'Marketing',
  'Mixed',
  '2FA',
  'Fraud Alert Messaging',
  'Higher Education',
  'Polling and voting',
  'Public Service Announcement',
  'Security Alert',
];

const examples: Record<string, Draft> = {
  rejected: {
    business: 'Cool Air HVAC',
    useCase: 'Customer Care',
    description: 'Customer outreach',
    sample1: 'Hi! Get 20% off a tune-up this week: bit.ly/coolair',
    sample2: '',
  },
  approved: {
    business: 'Cool Air HVAC',
    useCase: 'Customer Care',
    description:
      'Cool Air HVAC is a heating and cooling company in Las Vegas, NV. We text customers who book a job with us: appointment confirmations, arrival updates, estimates, and answers to their questions. Customers opt in on our online booking form.',
    sample1: 'Cool Air HVAC: Your appointment is confirmed for [date], between [time window]. Reply here with any questions. Reply STOP to opt out.',
    sample2: 'Cool Air HVAC: Your technician is on the way and should arrive in about [30] minutes. Reply STOP to opt out.',
  },
};

const SHORTENERS = /\b(bit\.ly|tinyurl\.com|goo\.gl|t\.co|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|tiny\.cc|rb\.gy)\//i;
const LINK = /\b(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|net|org|io|ai|co|us|biz|info)(\/\S*)?\b/i;
const PHONE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const PROMO = /(\d+\s?%\s?off|\bsale\b|\bdiscount|\bcoupon|\bpromo|\bcode\s+[A-Z0-9]{3,}|\bdeal\b|\bfree gift|\blimited time|\bthis week only)/i;
const VAGUE = /^(customer outreach|marketing|notifications?|alerts?|updates?|reminders?|texts?|messaging|sms|customer service)[.!]?$/i;
// The content the form lists as not permitted from local numbers, by the words that usually give it away.
const RESTRICTED: [RegExp, string][] = [
  [/\b(beer|wine|liquor|cocktails?|happy hour|vodka|whiskey|brewery)\b/i, 'alcohol'],
  [/\b(guns?|firearms?|ammo|ammunition|rifles?)\b/i, 'firearms'],
  [/\b(tobacco|cigars?|cigarettes?|vapes?|vaping|e-?cig)\b/i, 'tobacco or vaping'],
  [/\b(cannabis|marijuana|weed|thc|dispensary)\b/i, 'cannabis'],
  [/\b(casino|betting|bets?|sportsbook|gambling|lottery)\b/i, 'gambling'],
  [/\b(payday|debt relief|debt forgiveness|debt collection|credit repair|cash advance)\b/i, 'high-risk financial services or debt'],
  [/\b(get rich|work from home and earn|mlm|multi-level)\b/i, 'get-rich-quick or multi-level marketing'],
];

function check(d: Draft): Check[] {
  const out: Check[] = [];
  const samples = [d.sample1, d.sample2].filter((s) => s.trim());
  const all = `${d.description}\n${samples.join('\n')}`;
  const name = d.business.trim().toLowerCase();

  // Campaign description
  const desc = d.description.trim();
  if (desc.length < 40) {
    out.push({ level: 'bad', title: `The description is ${desc.length} characters. It needs at least 40.`, fix: 'Say who you are, who you text and why.' });
  } else if (VAGUE.test(desc) || desc.split(/\s+/).length < 12) {
    out.push({ level: 'warn', title: 'The description looks vague.', fix: 'Say who you are, who gets your texts and why. "Customer outreach" isn’t enough.' });
  } else {
    out.push({ level: 'ok', title: 'The description says who you are and why you text.' });
  }
  if (desc && !/opt[ -]?in|sign[ -]?up|consent|booking form|intake form|checkbox|subscribe/i.test(desc)) {
    out.push({ level: 'warn', title: "The description doesn't say how people sign up.", fix: 'Add one sentence, like "Customers opt in on our online booking form."' });
  }

  // Samples
  if (samples.length < 2) {
    out.push({ level: 'bad', title: `${samples.length} sample message${samples.length === 1 ? '' : 's'}. Registrations need two.`, fix: 'Fill in Sample message #2 too, even though it’s marked optional.' });
  } else {
    out.push({ level: 'ok', title: 'Two sample messages.' });
  }
  if (samples.length && !samples.some((s) => /\bstop\b/i.test(s))) {
    out.push({ level: 'bad', title: 'No sample says how to opt out.', fix: 'Add "Reply STOP to opt out." Tonet won’t submit without it.' });
  } else if (samples.length) {
    out.push({ level: 'ok', title: 'A sample says how to opt out.' });
  }
  if (name && samples.length) {
    const missing = samples.filter((s) => !s.toLowerCase().includes(name)).length;
    out.push(
      missing
        ? { level: 'warn', title: `${missing === samples.length ? 'No sample names' : 'One sample doesn’t name'} your business.`, fix: `Start each with "${d.business.trim()}:".` }
        : { level: 'ok', title: 'Each sample names your business.' },
    );
  }
  if (SHORTENERS.test(all)) {
    out.push({ level: 'bad', title: 'A link uses a URL shortener.', fix: 'Use the full link on your own website. bit.ly, TinyURL and other public shorteners are rejected.' });
  }
  if (LINK.test(samples.join(' '))) {
    out.push({ level: 'warn', title: 'Your samples have a link.', fix: 'Tick "Messages will include embedded links" under Message content.' });
  }
  if (PHONE.test(samples.join(' '))) {
    out.push({ level: 'warn', title: 'Your samples have a phone number.', fix: 'Tick "Messages will include phone numbers" under Message content.' });
  }

  // Use case
  const promo = PROMO.test(all);
  if (promo && !['Marketing', 'Mixed'].includes(d.useCase)) {
    out.push({ level: 'bad', title: `The texts look like promotions, but the use case is ${d.useCase}.`, fix: 'Promotions are Marketing. Several kinds of texts are Mixed. Promotions also need their own opt-in checkbox.' });
  } else if (d.useCase === 'Marketing' && !promo) {
    out.push({ level: 'warn', title: "The use case is Marketing, but the samples don't look like promotions.", fix: 'Pick the use case your samples show, like Customer Care for appointment texts.' });
  } else if (desc) {
    out.push({ level: 'ok', title: `The samples fit ${d.useCase}.` });
  }

  // Content that rewording can't fix
  for (const [re, what] of RESTRICTED) {
    if (re.test(all)) {
      out.push({ level: 'bad', title: `This mentions ${what}.`, fix: "That's on the list of content not permitted from local numbers. Rewording won't fix it, so leave it out of your texts." });
    }
  }
  return out;
}

const icon = { ok: '✓', warn: '!', bad: '✕' } as const;

export function TextingChecker() {
  const [d, setD] = useState<Draft>(examples.rejected);
  const checks = useMemo(() => check(d), [d]);
  const bad = checks.filter((c) => c.level === 'bad').length;
  const warn = checks.filter((c) => c.level === 'warn').length;
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [k]: e.target.value }));

  return (
    <figure className="tn-check not-prose" aria-label="Check your texting registration before you submit">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Check your registration</span>
        <div className="tn-flow-moments">
          <button type="button" className="tn-chip" onClick={() => setD(examples.rejected)}>
            Example that gets rejected
          </button>
          <button type="button" className="tn-chip" onClick={() => setD(examples.approved)}>
            Example that passes
          </button>
          <button type="button" className="tn-chip" onClick={() => setD({ business: '', useCase: 'Customer Care', description: '', sample1: '', sample2: '' })}>
            Start empty
          </button>
        </div>
      </div>

      <div className="tn-check-grid">
        <div className="tn-check-form">
          <label>
            <span>Business name</span>
            <input value={d.business} onChange={set('business')} placeholder="As in your texts" />
          </label>
          <label>
            <span>Use case</span>
            <select value={d.useCase} onChange={set('useCase')}>
              {useCases.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Campaign description</span>
            <textarea rows={4} value={d.description} onChange={set('description')} />
          </label>
          <label>
            <span>Sample message #1</span>
            <textarea rows={2} value={d.sample1} onChange={set('sample1')} />
          </label>
          <label>
            <span>Sample message #2</span>
            <textarea rows={2} value={d.sample2} onChange={set('sample2')} />
          </label>
        </div>

        <div className="tn-check-result" aria-live="polite">
          <p className={bad ? 'tn-check-sum tn-check-sum-bad' : warn ? 'tn-check-sum tn-check-sum-warn' : 'tn-check-sum tn-check-sum-ok'}>
            {bad ? `${bad} thing${bad === 1 ? '' : 's'} carriers reject` : warn ? `${warn} thing${warn === 1 ? '' : 's'} to check` : 'Nothing we can spot'}
          </p>
          <ul>
            {checks.map((c) => (
              <li key={c.title} className={`tn-check-${c.level}`}>
                <span className="tn-check-icon" aria-hidden>
                  {icon[c.level]}
                </span>
                <span>
                  <b>{c.title}</b>
                  {c.fix && <span className="tn-check-fix">{c.fix}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption>
        The check runs in your browser: nothing you type is sent anywhere. It catches the common mistakes, but the carriers
        decide, and they also check your website, legal name and opt-in. See{' '}
        <a href="/phones/sms-registration/rejected#why-10dlc-campaigns-get-rejected">why campaigns get rejected</a>.
      </figcaption>
    </figure>
  );
}
