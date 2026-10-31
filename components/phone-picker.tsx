'use client';

import { useState } from 'react';

/**
 * Pick a desk phone and get only its steps, with the values to type. Paste the Domain and User Name
 * from SIP Information and they're filled in, split the way that phone wants them (Yealink takes
 * the server and port apart; Grandstream takes them together). Nothing typed leaves the browser,
 * and it never asks for the SIP password.
 */
type Field = [label: string, value: (v: Vals) => string];
type Vals = { host: string; port: string; domain: string; user: string };
type Model = {
  name: string;
  guide: string;
  open: string;
  login: string;
  line: { where: string; fields: Field[]; save: string };
  stun: string[];
  after?: string;
};

const USER = (v: Vals) => v.user || 'The User Name from SIP Information';
const PASS = () => 'The Password from SIP Information';
const NAME = () => "The person's name";

const yealinkNew = (model: string, slug: string): Model => ({
  name: `Yealink ${model}`,
  guide: `/ip_phones/yealink/${slug}`,
  open: "In a browser on the same network, go to https:// and the phone's IP address. If the browser warns about the connection, click Advanced and continue.",
  login: 'Sign in with admin / admin. The first time, the phone makes you set a new password.',
  line: {
    where: 'Account › Register, then Account 1',
    fields: [
      ['Line Active', () => 'Enabled'],
      ['Label', NAME],
      ['Display Name', NAME],
      ['Register Name', USER],
      ['User Name', USER],
      ['Password', PASS],
      ['Server Host (SIP Server 1)', (v) => v.host || 'The Domain, up to the colon'],
      ['Port (SIP Server 1)', (v) => v.port || 'The number after the colon'],
    ],
    save: 'Confirm',
  },
  stun: [
    'Network › NAT: set STUN Active to Enabled, STUN Server to stun.tonet.ai and STUN Port to 3478. Click Confirm.',
    'Account › Register, Account 1: set NAT to STUN. Click Confirm.',
  ],
});

const grandstream = (model: string, slug: string, stunPath: string): Model => ({
  name: `Grandstream ${model}`,
  guide: `/ip_phones/grandstream/${slug}`,
  open:
    slug === 'grp2612'
      ? "In a browser on the same network, type the phone's IP address."
      : "In a browser on the same network, go to https:// and the phone's IP address (http:// on firmware older than 1.0.11.98).",
  login:
    slug === 'grp2612'
      ? 'Sign in as admin with the password on the sticker on the back. The first time, set a new password.'
      : 'Sign in with admin / admin. The first time, the phone makes you set a new password.',
  line: {
    where: 'Accounts › Account 1 › General Settings',
    fields: [
      ['Account Active', () => 'Yes'],
      ['Account Name', NAME],
      ['SIP Server', (v) => v.domain || 'The whole Domain, colon and port included'],
      ['SIP User ID', USER],
      ['SIP Authentication ID', USER],
      ['SIP Authentication Password', PASS],
      ['Name', NAME],
    ],
    save: 'Save and Apply',
  },
  stun: [
    `${stunPath}: set STUN Server to stun.tonet.ai:3478. Click Save and Apply.`,
    'Accounts › Account 1 › Network Settings: set NAT Traversal to STUN. Click Save and Apply.',
  ],
});

const models: Record<string, Model> = {
  t33g: yealinkNew('T33G', 't33g'),
  t31p: { ...yealinkNew('T31P', 't33g'), name: 'Yealink T31P (same steps as the T33G)' },
  t46u: yealinkNew('T46U', 't46u'),
  t43u: { ...yealinkNew('T43U', 't46u'), name: 'Yealink T43U (same steps as the T46U)' },
  t54w: yealinkNew('T54W', 't54w'),
  t57w: { ...yealinkNew('T53W or T57W', 't54w'), name: 'Yealink T53W or T57W (same steps as the T54W)' },
  t26p: {
    name: 'Yealink T26P',
    guide: '/ip_phones/yealink/t26p',
    open: "In a browser on the same network, type the phone's IP address.",
    login: 'Sign in with admin / admin and click Confirm.',
    line: {
      where: 'Account › Register, then Account 1. STUN is on this page too.',
      fields: [
        ['Line Active', () => 'Enabled'],
        ['Label', NAME],
        ['Display Name', NAME],
        ['Register Name', USER],
        ['User Name', USER],
        ['Password', PASS],
        ['NAT', () => 'STUN'],
        ['STUN Server', () => 'stun.tonet.ai, with 3478 in the Port box next to it'],
        ['Server Host (SIP Server 1)', (v) => v.host || 'The Domain, up to the colon'],
        ['Port (next to Server Host)', (v) => v.port || 'The number after the colon'],
      ],
      save: 'Confirm',
    },
    stun: [],
  },
  grp2612: grandstream('GRP2612', 'grp2612', 'Phone Settings › General Settings'),
  gxp2130: grandstream('GXP2130', 'gxp2130', 'Settings › General Settings'),
  gxp2170: grandstream('GXP2170', 'gxp2170', 'Settings › General Settings'),
  ht801: {
    name: 'Grandstream HT801 or HT802 (for a regular phone)',
    guide: '/ip_phones/grandstream/ht801',
    open: "Pick up the phone, dial *** then 02 to hear the adapter's IP address. Type it in a browser (https:// first on a V2).",
    login: 'Sign in as admin with admin (V2: the password on the sticker). The first time, set a new password.',
    line: {
      where: 'The FXS PORT tab (HT802: FXS PORT1 for the first phone). On a V2: Port Settings › FXS port › General Settings.',
      fields: [
        ['Account Active', () => 'Yes'],
        ['Primary SIP Server', (v) => v.domain || 'The whole Domain, colon and port included'],
        ['SIP User ID', USER],
        ['Authenticate ID', USER],
        ['Authenticate Password', PASS],
        ['Name', NAME],
        ['NAT Traversal', () => 'STUN'],
      ],
      save: 'Apply (V2: Save and Apply)',
    },
    stun: ['ADVANCED SETTINGS tab: set STUN Server is to stun.tonet.ai:3478. Click Apply. (V2: System Settings › Basic Settings › ATA Settings.)'],
    after: 'Restart the adapter: unplug the power for a few seconds.',
  },
};

const groups: [string, string[]][] = [
  ['Yealink', ['t33g', 't31p', 't46u', 't43u', 't54w', 't57w', 't26p']],
  ['Grandstream', ['grp2612', 'gxp2130', 'gxp2170', 'ht801']],
];

export function PhonePicker() {
  const [id, setId] = useState('t33g');
  const [domain, setDomain] = useState('');
  const [user, setUser] = useState('');
  const m = models[id];
  const clean = domain.trim().replace(/^sips?:/i, '');
  const [host, port] = clean.includes(':') ? [clean.slice(0, clean.lastIndexOf(':')), clean.slice(clean.lastIndexOf(':') + 1)] : [clean, ''];
  const v: Vals = { host, port, domain: clean, user: user.trim() };
  const noPort = clean && !/^\d+$/.test(port);

  return (
    <figure className="tn-pick not-prose" aria-label="Pick your desk phone and get its steps">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Your phone, your steps</span>
      </div>
      <div className="tn-pick-inputs">
        <label>
          <span>Phone</span>
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {groups.map(([g, ids]) => (
              <optgroup key={g} label={g}>
                {ids.map((k) => (
                  <option key={k} value={k}>
                    {models[k].name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          <span>Domain (optional)</span>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="pbx.example.com:5080" spellCheck={false} autoComplete="off" />
        </label>
        <label>
          <span>User Name (optional)</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="u12345" spellCheck={false} autoComplete="off" />
        </label>
      </div>
      {noPort && <p className="tn-pick-warn">Copy the whole Domain, including the number after the colon. That number is your port.</p>}

      <ol className="tn-pick-steps" key={id}>
        <li>
          <b>Open the phone&apos;s web page.</b> {m.open}
        </li>
        <li>
          <b>Sign in.</b> {m.login}
        </li>
        <li>
          <b>Enter your Tonet line</b> in {m.line.where}:
          <table>
            <tbody>
              {m.line.fields.map(([label, val]) => {
                const value = val(v);
                const filled = value !== val({ host: '', port: '', domain: '', user: '' });
                return (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td className={filled ? 'tn-pick-filled' : undefined}>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          Click <b>{m.line.save}</b>.{m.after ? ` ${m.after}` : ''}
        </li>
        {m.stun.length > 0 && (
          <li>
            <b>Turn on STUN.</b>
            <ul>
              {m.stun.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        )}
        <li>
          <b>Check that it registered,</b> then call another extension. <a href={`${m.guide}#check-that-it-registered`}>What to look for</a>
        </li>
      </ol>
      <figcaption>
        What you type stays in your browser, and you never need to type your SIP password here. Pictures, firmware and
        factory resets are in the <a href={m.guide}>full guide for the {m.name.replace(/ \(.*\)$/, '')}</a>.
      </figcaption>
    </figure>
  );
}
