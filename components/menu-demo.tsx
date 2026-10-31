'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A phone menu you can press keys on. It follows what the Menus page documents: keys can be pressed
 * while the greeting plays, a key you didn't set says "not valid" and plays the greeting again
 * (5 wrong keys end the call), and pressing nothing goes to No_response.
 */
type Dest = { kind: 'Users' | 'Teams' | 'IVRs' | 'Voicemail' | 'Features'; to: string; note: string; menu?: string };
type Menu = { name: string; greeting: string; keys: Record<string, Dest> };

const menus: Record<string, Menu> = {
  main: {
    name: 'Main menu',
    greeting:
      'Thanks for calling Cool Air. For sales, press 1. For service, press 2. For billing, press 3. To reach the front desk, press 0. To hear this again, press 9.',
    keys: {
      '1': { kind: 'Teams', to: 'Sales', note: 'The Sales team rings together.' },
      '2': { kind: 'IVRs', to: 'Service menu', note: 'A menu inside the menu.', menu: 'service' },
      '3': { kind: 'Voicemail', to: 'Billing voicemail', note: 'Straight to the billing mailbox.' },
      '0': { kind: 'Users', to: 'Front Desk', note: 'Rings one person.' },
      '9': { kind: 'IVRs', to: 'Main menu', note: 'The greeting plays again.', menu: 'main' },
      none: { kind: 'Users', to: 'Front Desk', note: 'No_response: callers who press nothing.' },
    },
  },
  service: {
    name: 'Service menu',
    greeting: 'To book a visit, press 1. For no heat or no cooling right now, press 2. To go back, press star.',
    keys: {
      '1': { kind: 'Teams', to: 'Dispatch', note: 'The Dispatch team queues callers.' },
      '2': { kind: 'Features', to: 'Phone Number: the on-call cell', note: 'Forwarded to an outside number.' },
      '*': { kind: 'IVRs', to: 'Main menu', note: 'Back to the main menu.', menu: 'main' },
      none: { kind: 'Teams', to: 'Dispatch', note: 'No_response: callers who press nothing.' },
    },
  },
};

const pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
type Log = { text: string; tone: 'say' | 'go' | 'bad' | 'end' };

export function MenuDemo() {
  const [menu, setMenu] = useState('main');
  const [words, setWords] = useState(menus.main.greeting.split(' ').length);
  const [wrong, setWrong] = useState(0);
  const [log, setLog] = useState<Log[]>([]);
  const [done, setDone] = useState<Dest | 'hangup' | null>(null);
  const [noResponse, setNoResponse] = useState(true);
  const [silent, setSilent] = useState(0);
  const root = useRef<HTMLElement>(null);
  const live = useRef(false);

  const m = menus[menu];
  const all = m.greeting.split(' ');

  // The greeting reads out word by word once the example is on screen; the server HTML has all of it.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWords(all.length);
      return;
    }
    let seen = false;
    const io = new IntersectionObserver(
      ([e]) => {
        live.current = e.isIntersecting;
        if (e.isIntersecting && !seen) {
          seen = true;
          setWords(0);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done) return;
    if (words >= all.length) return;
    const id = window.setTimeout(() => setWords((w) => (live.current ? w + 1 : w)), 170);
    return () => window.clearTimeout(id);
  }, [words, all.length, done]);

  const say = (text: string, tone: Log['tone']) => setLog((l) => [...l.slice(-5), { text, tone }]);

  const go = (dest: Dest, how: string) => {
    if (dest.menu) {
      say(`${how} → ${dest.to}`, 'go');
      setMenu(dest.menu);
      setWords(0);
      setSilent(0);
      return;
    }
    say(`${how} → ${dest.kind}: ${dest.to}`, 'go');
    setDone(dest);
  };

  const press = (key: string) => {
    if (done) return;
    const dest = m.keys[key];
    if (dest) {
      go(dest, `Pressed ${key}${words < all.length ? ' during the greeting' : ''}`);
      return;
    }
    const n = wrong + 1;
    setWrong(n);
    if (n >= 5) {
      say(`Pressed ${key}: not valid. That's 5 wrong keys, so Tonet ends the call.`, 'end');
      setDone('hangup');
      return;
    }
    say(`Pressed ${key}: "That's not a valid option." The greeting plays again.`, 'bad');
    setWords(0);
  };

  const wait = () => {
    if (done) return;
    if (noResponse && m.keys.none) {
      go(m.keys.none, 'Pressed nothing');
      return;
    }
    const n = silent + 1;
    setSilent(n);
    if (n >= 3) {
      say('Pressed nothing, 3 times. Tonet says goodbye and ends the call.', 'end');
      setDone('hangup');
      return;
    }
    say(`Pressed nothing: the greeting plays again (${n + 1} of 3).`, 'bad');
    setWords(0);
  };

  const restart = () => {
    setMenu('main');
    setWords(0);
    setWrong(0);
    setSilent(0);
    setLog([]);
    setDone(null);
  };

  return (
    <figure ref={root} className="tn-menu not-prose" aria-label="Example: a phone menu you can press keys on">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Example menu: press a key</span>
        <label className="tn-menu-toggle">
          <input type="checkbox" checked={noResponse} onChange={(e) => setNoResponse(e.target.checked)} />
          <span>
            <b>No_response</b> set
          </span>
        </label>
      </div>

      <div className="tn-menu-grid">
        <div className="tn-menu-call">
          <div className="tn-menu-now">
            <span className="tn-menu-label">{done ? 'Call' : `Playing: ${m.name}`}</span>
            {done ? (
              done === 'hangup' ? (
                <p className="tn-menu-say">The call ended.</p>
              ) : (
                <p className="tn-menu-say">
                  Goes to <b>{done.to}</b>
                  <span className="tn-menu-kind">
                    {done.kind} · {done.note}
                  </span>
                </p>
              )
            ) : (
              <p className="tn-menu-say" aria-label={m.greeting}>
                {all.map((w, i) => (
                  <span key={`${menu}${i}`} className={i < words ? 'tn-menu-w tn-menu-w-on' : 'tn-menu-w'}>
                    {w}{' '}
                  </span>
                ))}
              </p>
            )}
          </div>
          <ol className="tn-menu-log" aria-live="polite">
            {log.map((l, i) => (
              <li key={i} className={`tn-menu-${l.tone}`}>
                {l.text}
              </li>
            ))}
          </ol>
          {done && (
            <button type="button" className="tn-chip" onClick={restart}>
              ↺ Call again
            </button>
          )}
        </div>

        <div className="tn-menu-pad" role="group" aria-label="Keypad">
          {pad.map((k) => (
            <button key={k} type="button" className={m.keys[k] ? 'tn-key tn-key-set' : 'tn-key'} onClick={() => press(k)} disabled={!!done}>
              {k}
            </button>
          ))}
          <button type="button" className="tn-key tn-key-wait" onClick={wait} disabled={!!done}>
            Press nothing
          </button>
        </div>
      </div>

      <table className="tn-menu-keys">
        <caption>{m.name}: where each key goes</caption>
        <tbody>
          {Object.entries(m.keys).map(([k, d]) => (
            <tr key={k}>
              <th scope="row">{k === 'none' ? 'No_response' : k}</th>
              <td>
                {d.kind} › {d.to}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        A made-up menu. Callers can press a key before the greeting ends. Untick No_response to hear what happens when
        a menu doesn&apos;t set it.
      </figcaption>
    </figure>
  );
}
