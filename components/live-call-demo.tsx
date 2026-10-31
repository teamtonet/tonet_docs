'use client';

import { useEffect, useRef, useState } from 'react';
import { lines } from './demo-call';

/**
 * The example call as the live call view shows it while it happens: the transcript growing in the
 * middle, Tonet filling "This call" on the left as things are said, and a Knowledge answer showing
 * beside the caller's question. Made-up call, real labels. The finished state is the server HTML.
 */
type Field = { label: string; value: string; after: number };

// `after` is the index of the line that, once said, lets Tonet fill the field.
const fields: Field[] = [
  { label: 'Calling about', value: 'AC blowing warm air, at home', after: 3 },
  { label: 'Quote', value: '$89 diagnostic visit, goes toward the repair', after: 4 },
  { label: 'When', value: 'Thursday, 10 AM', after: 7 },
  { label: 'Promised', value: 'A confirmation text with the address', after: 8 },
  { label: 'Next step', value: 'Text the confirmation', after: 8 },
  { label: 'Call tags', value: 'booking · AC repair', after: 9 },
];

const answer = {
  after: 3,
  text: 'A diagnostic visit is $89. It goes toward the repair if they go ahead.',
  source: 'Knowledge · what your team tells callers',
};

const ALL = lines.length;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function LiveCallDemo() {
  const [shown, setShown] = useState(ALL);
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setShown(0);
          setPlaying(true);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (shown >= ALL) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 500 : 1500);
    return () => window.clearTimeout(id);
  }, [playing, shown]);

  // The newest line stays in view inside the transcript, without moving the page.
  useEffect(() => {
    const box = list.current;
    if (box && playing) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
  }, [shown, playing]);

  const ended = shown >= ALL;
  const replay = () => {
    setShown(0);
    setPlaying(true);
  };

  return (
    <figure ref={root} className="tn-live not-prose" aria-label="Example: the live call view during a call">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Example: the live call view</span>
        <button type="button" className="tn-chip" onClick={replay} disabled={playing}>
          {playing ? 'On the call…' : '▶ Play again'}
        </button>
      </div>

      <div className="tn-live-grid">
        <section className="tn-live-this" aria-label="This call">
          <div className="tn-live-who">
            <b>(555) 010-0142</b>
            <span>{ended ? 'Call ended · 0:52' : `On the call · ${clock(lines[Math.max(0, shown - 1)].t)}`}</span>
          </div>
          <strong className="tn-live-h">This call</strong>
          <p className="tn-live-hint">✦ Tonet fills these as you talk · × removes</p>
          <dl>
            {fields.map((f) => {
              const on = shown > f.after;
              return (
                <div key={f.label} className={on ? 'tn-live-field tn-live-field-on' : 'tn-live-field'}>
                  <dt>{f.label}</dt>
                  <dd>{on ? <><span className="tn-live-star" aria-hidden>✦</span> {f.value}</> : '—'}</dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="tn-live-talk" aria-label="What's said">
          <ol ref={list} className="tn-live-lines">
            {lines.slice(0, shown).map((l, i) => (
              <li key={i} className={l.who === 'us' ? 'tn-live-us tn-live-in' : 'tn-live-them tn-live-in'}>
                <span className="tn-line-who">{l.who === 'us' ? 'You' : 'Caller'}</span>
                <span>{l.text.en}</span>
                {i === answer.after && shown > answer.after ? (
                  <div className="tn-live-answer">
                    <span className="tn-live-answer-head">✦ Answer</span>
                    <span>{answer.text}</span>
                    <span className="tn-live-answer-src">{answer.source}</span>
                  </div>
                ) : (
                  <span aria-hidden />
                )}
              </li>
            ))}
          </ol>
          {ended && <p className="tn-live-after">Call ended. Tonet checks it in about 40 s, against the recording.</p>}
        </section>
      </div>

      <div className="tn-live-bar" aria-hidden>
        <span className="tn-live-input">Ask Tonet, write a note, or say “text them …”</span>
        <span className="tn-live-buttons">
          {['Mute', 'Hold', 'Keypad', 'Transfer', 'Text'].map((b) => (
            <span key={b} className="tn-chip tn-chip-sm">
              {b}
            </span>
          ))}
          <span className="tn-chip tn-chip-sm tn-live-end">End</span>
        </span>
      </div>
      <figcaption>
        A made-up call. Tonet fills in the left as things are said, and answers the caller&apos;s question from what your
        business knows, before you have to look it up.
      </figcaption>
    </figure>
  );
}
