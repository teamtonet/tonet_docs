'use client';

import { AppWindow, Globe, Phone, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * One call to a person rings every place they're signed in, and stops everywhere once it's
 * answered on one. Click a device to answer there. The device list is plain text in the page.
 */
const devices = [
  { id: 'browser', name: 'Browser', at: 'in the browser', note: 'dashboard.tonet.ai, open in a tab', Icon: Globe },
  { id: 'desktop', name: 'Desktop app', at: 'in the desktop app', note: 'Rings with the window closed', Icon: AppWindow },
  { id: 'iphone', name: 'iPhone', at: 'on the iPhone', note: 'On the lock screen too', Icon: Smartphone },
  { id: 'android', name: 'Android', at: 'on the Android phone', note: 'On the lock screen too', Icon: Smartphone },
  { id: 'desk', name: 'Desk phone', at: 'on the desk phone', note: 'Any SIP phone', Icon: Phone },
] as const;

type Id = (typeof devices)[number]['id'];

export function RingEverywhere() {
  const [answered, setAnswered] = useState<Id | null>(null);
  const [ringing, setRinging] = useState(false);
  const root = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const ring = () => {
    window.clearTimeout(timer.current);
    setAnswered(null);
    setRinging(true);
    // Nobody picks up in 6 seconds? The phone app answers, so the example always finishes.
    timer.current = window.setTimeout(() => answer('iphone'), 6000);
  };

  const answer = (id: Id) => {
    window.clearTimeout(timer.current);
    setRinging(false);
    setAnswered(id);
  };

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let seen = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen) {
          seen = true;
          ring();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const where = devices.find((d) => d.id === answered);

  return (
    <figure ref={root} className="tn-ring not-prose" aria-label="Example: one call rings all your devices">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">One call, every device</span>
        <button type="button" className="tn-chip" onClick={ring} disabled={ringing}>
          {ringing ? 'Ringing…' : '☎ Call me'}
        </button>
      </div>
      <ul className="tn-ring-row">
        {devices.map(({ id, name, note, Icon }) => {
          const state = ringing ? 'ringing' : answered === id ? 'answered' : answered ? 'stopped' : 'idle';
          return (
            <li key={id}>
              <button
                type="button"
                className={`tn-ring-device tn-ring-${state}`}
                onClick={() => (ringing ? answer(id) : undefined)}
                aria-label={ringing ? `Answer on ${name}` : name}
              >
                <span className="tn-ring-icon" aria-hidden>
                  <Icon />
                </span>
                <b>{name}</b>
                <span className="tn-ring-note">
                  {state === 'ringing' ? 'Ringing · tap to answer' : state === 'answered' ? 'On the call' : state === 'stopped' ? 'Stopped ringing' : note}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <figcaption>
        {where
          ? `Answered ${where.at}. Everywhere else stopped ringing.`
          : 'A call to you rings everywhere you’re signed in, all at once. Answer on one and the rest stop.'}
      </figcaption>
    </figure>
  );
}
