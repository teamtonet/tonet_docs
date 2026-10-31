'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A port request from submit to ringing on Tonet, with the statuses the Port a Number tab shows.
 * Click a stop to read it. "If something's wrong" swaps in the two statuses that send it back.
 */
const happy = [
  {
    status: 'Submitted',
    when: 'When you submit',
    what: 'Tonet has your request and checks it before filing it with the carrier.',
    you: 'Nothing. Keep using your number as usual.',
  },
  {
    status: 'In progress',
    when: 'Most ports: 7 to 10 business days',
    what: 'Your old carrier is releasing the number. They set the pace, so no date is guaranteed.',
    you: "Don't cancel your old service yet. Calls still reach you there.",
  },
  {
    status: 'Approved',
    when: 'The switch',
    what: 'The number moves to Tonet and shows under My Phone Numbers.',
    you: 'Choose where its calls go and who can use it.',
  },
  {
    status: 'Ringing on Tonet',
    when: 'Done',
    what: 'Calls to your number ring in Tonet: browser, apps and desk phones.',
    you: 'Call your number to check it rings in Tonet. Only then close anything left with your old carrier.',
  },
];

const trouble = [
  {
    status: 'More information needed',
    what: 'The porting team needs something, like a different PIN or a bill.',
    you: 'Read the message, answer under Messages and click Send reply.',
  },
  {
    status: 'Not approved',
    what: 'The old carrier refused it, often over a name, address or PIN that doesn’t match.',
    you: 'Read the reason, fix it, and click Edit and resubmit.',
  },
];

export function PortTimeline() {
  const [at, setAt] = useState(happy.length - 1);
  const [showTrouble, setShowTrouble] = useState(false);
  const root = useRef<HTMLElement>(null);

  // Walk the steps once when the timeline scrolls into view.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setAt(0);
        let i = 0;
        id = window.setInterval(() => {
          i += 1;
          setAt(i);
          if (i >= happy.length - 1) window.clearInterval(id);
        }, 1400);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, []);

  const step = happy[at];

  return (
    <figure ref={root} className="tn-port not-prose" aria-label="How a port goes, status by status">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Your port, step by step</span>
        <button type="button" className={showTrouble ? 'tn-chip tn-chip-on' : 'tn-chip'} aria-pressed={showTrouble} onClick={() => setShowTrouble((t) => !t)}>
          If something&apos;s wrong
        </button>
      </div>

      <div className="tn-port-keep">
        <span className="tn-port-keep-bar" style={{ width: `${(Math.min(at, 2) / 2) * 100}%` }} aria-hidden />
        <span>Your number keeps working with your old carrier until the switch</span>
      </div>

      <ol className="tn-port-track">
        {happy.map((s, i) => (
          <li key={s.status}>
            <button
              type="button"
              className={i < at ? 'tn-port-stop tn-port-done' : i === at ? 'tn-port-stop tn-port-now' : 'tn-port-stop'}
              aria-current={i === at ? 'step' : undefined}
              onClick={() => setAt(i)}
            >
              <span className="tn-port-dot" aria-hidden />
              <b>{s.status}</b>
              <span>{s.when}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="tn-port-detail" aria-live="polite">
        <p>
          <b>{step.status}.</b> {step.what}
        </p>
        <p>
          <span className="tn-port-you">You:</span> {step.you}
        </p>
      </div>

      {showTrouble && (
        <ul className="tn-port-trouble">
          {trouble.map((t) => (
            <li key={t.status}>
              <b>{t.status}</b>
              <span>{t.what}</span>
              <span>
                <span className="tn-port-you">You:</span> {t.you}
              </span>
            </li>
          ))}
        </ul>
      )}
      <figcaption>The statuses are the ones on Manage › Phones › Port a Number. Click one to read it.</figcaption>
    </figure>
  );
}
