'use client';

import { useEffect, useRef, useState } from 'react';
import { END, type Lang, lines } from './demo-call';

/**
 * An example call played back the way a call's page shows it: talk bars, the transcript
 * following along, then Tonet's summary, sources, tags and next steps. Made-up call, real
 * labels. The whole call is in the server HTML, so search engines and no-JS readers get it all;
 * the playback only starts once the reader scrolls to it.
 */
const languages: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English · original' },
  { id: 'es', label: 'Spanish' },
  { id: 'tl', label: 'Tagalog' },
];

const summary =
  "The caller's home AC is blowing warm air. Front Desk quoted $89 for a diagnostic visit, which goes toward the repair, and booked Thursday at 10 AM.";
const sources = [5, 21, 34];
const nextSteps = [
  { text: 'Text the caller a confirmation', add: '+ Task', added: 'Task added' },
  { text: 'Diagnostic visit, Thursday 10 AM', add: '+ Calendar', added: 'On the calendar' },
];

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const lineEnd = (i: number) => (i + 1 < lines.length ? lines[i + 1].t : END);

// Steps: 0..lines.length are transcript lines shown; then the summary writes itself word by word.
const words = summary.split(' ');
const DONE = lines.length + words.length;

export function CallDemo() {
  const [step, setStep] = useState(DONE);
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [kept, setKept] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const [lit, setLit] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const started = useRef(false);

  // Play once, the first time the example scrolls into view.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setStep(0);
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
    if (step >= DONE) {
      setPlaying(false);
      return;
    }
    const wait = step < lines.length ? 1300 : 70;
    const id = window.setTimeout(() => setStep((s) => s + 1), wait);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  const shown = Math.min(step, lines.length);
  const current = lit ?? (step > 0 && step <= lines.length ? step - 1 : null);
  const writing = step >= lines.length && step < DONE;
  const summaryText = step >= lines.length ? words.slice(0, step - lines.length).join(' ') : '';
  const reviewReady = step >= DONE;
  const at = current !== null ? lines[current].t : step >= lines.length ? END : 0;

  // Keep the lit line in view inside the transcript box, without moving the page.
  useEffect(() => {
    const box = list.current;
    const li = current !== null ? (box?.children[current] as HTMLElement | undefined) : undefined;
    if (!box || !li) return;
    const top = li.offsetTop; // the list is position: relative, so this is from its top
    if (top < box.scrollTop || top + li.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: 'smooth' });
    }
  }, [current]);

  const replay = () => {
    setLit(null);
    setStep(0);
    setPlaying(true);
  };

  return (
    <figure ref={root} className="tn-demo not-prose" aria-label="Example: a call's page with Tonet's transcript and summary">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Example call</span>
        <div className="tn-demo-actions">
          <label className="tn-demo-select">
            <span>Translate</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="tn-chip" onClick={replay} disabled={playing}>
            {playing ? 'Playing…' : '▶ Play again'}
          </button>
        </div>
      </div>

      <div className="tn-demo-grid">
        <div className="tn-demo-call">
          <div className="tn-bars" aria-hidden>
            {(['us', 'them'] as const).map((who) => (
              <div key={who} className={who === 'us' ? 'tn-bars-row' : 'tn-bars-row tn-bars-them'}>
                <span className="tn-bars-name">{who === 'us' ? 'Front Desk' : 'Caller'}</span>
                <div className="tn-bars-track">
                  {lines.map((l, i) =>
                    l.who === who ? (
                      <span
                        key={i}
                        className={i < shown ? 'tn-bar tn-bar-on' : 'tn-bar'}
                        style={{ left: `${(l.t / END) * 100}%`, width: `${((lineEnd(i) - l.t - 0.6) / END) * 100}%` }}
                      />
                    ) : null,
                  )}
                  {who === 'us' &&
                    lines.map((l, i) =>
                      l.mark ? (
                        <span key={`m${i}`} className="tn-bars-mark" style={{ left: `${(l.t / END) * 100}%` }}>
                          {l.mark}
                        </span>
                      ) : null,
                    )}
                </div>
              </div>
            ))}
            <div className="tn-bars-time">
              <span>{clock(at)}</span>
              <span>{clock(END)}</span>
            </div>
          </div>

          {lang !== 'en' && <p className="tn-demo-translated">Translated by Tonet AI</p>}
          <ol ref={list} className="tn-transcript">
            {lines.map((l, i) => (
              <li
                key={i}
                className={[
                  'tn-line',
                  l.who === 'us' ? 'tn-line-us' : 'tn-line-them',
                  i < shown || step >= DONE ? 'tn-line-in' : 'tn-line-wait',
                  current === i ? 'tn-line-now' : '',
                ].join(' ')}
              >
                <span className="tn-line-time">{clock(l.t)}</span>
                <span className="tn-line-who">{l.who === 'us' ? 'Front Desk' : 'Caller'}</span>
                <span className="tn-line-text">{l.text[lang]}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="tn-review" aria-live="polite">
          <div className="tn-review-head">
            <strong>Call review</strong>
            {(writing || reviewReady) && <span className="tn-badge">AI draft</span>}
          </div>
          {step < lines.length ? (
            <p className="tn-review-wait">Tonet is writing the summary…</p>
          ) : (
            <p className="tn-review-summary">
              {summaryText}
              {writing && <span className="tn-caret" aria-hidden />}
            </p>
          )}
          <div className={reviewReady ? 'tn-review-rest tn-review-rest-in' : 'tn-review-rest'}>
            <div className="tn-review-row">
              <span className="tn-review-label">Sources</span>
              {sources.map((s) => {
                const i = lines.findIndex((l) => l.t === s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="tn-chip tn-chip-sm"
                    onMouseEnter={() => setLit(i)}
                    onMouseLeave={() => setLit(null)}
                    onFocus={() => setLit(i)}
                    onBlur={() => setLit(null)}
                    onClick={() => setLit(i)}
                  >
                    {clock(s)}
                  </button>
                );
              })}
            </div>
            <div className="tn-review-row">
              <span className="tn-review-label">Call tags</span>
              {['booking', 'AC repair'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={!!kept[tag]}
                  title={kept[tag] ? 'Kept' : "Tonet's suggestion: click to keep it"}
                  className={kept[tag] ? 'tn-tag tn-tag-kept' : 'tn-tag'}
                  onClick={() => setKept((k) => ({ ...k, [tag]: !k[tag] }))}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="tn-review-steps">
              <span className="tn-review-label">Next steps</span>
              <ul>
                {nextSteps.map((n, i) => (
                  <li key={n.text}>
                    <span>{n.text}</span>
                    <button
                      type="button"
                      className={added[i] ? 'tn-chip tn-chip-sm tn-chip-on' : 'tn-chip tn-chip-sm'}
                      onClick={() => setAdded((a) => ({ ...a, [i]: true }))}
                    >
                      {added[i] ? n.added : n.add}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
      <figcaption>
        A made-up call, shown the way a call&apos;s page shows it. Hover a source to find it in the transcript.
        Dashed tags are Tonet&apos;s suggestions: click one to keep it.
      </figcaption>
    </figure>
  );
}
