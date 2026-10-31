'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * The same five calls reach a team set to Ring together and to Queue. It plays the rules the
 * "Ring group vs call queue" page documents: ring together rings 25 seconds then voicemail;
 * a queue holds callers until someone is free. Times are seconds into a busy two minutes.
 */
const calls = [
  { id: 'A', at: 0, talk: 100 },
  { id: 'B', at: 6, talk: 80 },
  { id: 'C', at: 12, talk: 55 },
  { id: 'D', at: 24, talk: 40 },
  { id: 'E', at: 33, talk: 30 },
];
const people = ['Owner', 'Front Desk', 'Sales', 'Support'];
const END = 150;
const RING = 25;

type Result = { id: string; at: number; answered?: number; by?: string; ends?: number; voicemail?: number };

function run(mode: 'ring' | 'queue', size: number): Result[] {
  const free = people.slice(0, size).map((name) => ({ name, at: 0 }));
  const out: Result[] = [];
  for (const c of calls) {
    const next = free.reduce((a, b) => (b.at < a.at ? b : a));
    const start = Math.max(c.at, next.at);
    if (mode === 'ring' && start - c.at > RING) {
      out.push({ id: c.id, at: c.at, voicemail: c.at + RING });
      continue;
    }
    next.at = start + c.talk;
    out.push({ id: c.id, at: c.at, answered: start, by: next.name, ends: start + c.talk });
  }
  return out;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;
const pct = (s: number) => `${(s / END) * 100}%`;

function Lane({ title, rule, results, t }: { title: string; rule: string; results: Result[]; t: number }) {
  const answered = results.filter((r) => r.answered !== undefined).length;
  const vm = results.length - answered;
  const longest = Math.max(0, ...results.filter((r) => r.answered !== undefined).map((r) => (r.answered as number) - r.at));
  return (
    <section className="tn-rq-lane" aria-label={title}>
      <header>
        <strong>{title}</strong>
        <span>{rule}</span>
      </header>
      <ol>
        {results.map((r) => {
          const wait = (r.answered ?? r.voicemail ?? r.at) - r.at;
          const waitShown = Math.max(0, Math.min(t - r.at, wait));
          const talkShown = r.answered !== undefined ? Math.max(0, Math.min(t, r.ends as number) - r.answered) : 0;
          let state = 'Not yet';
          if (t >= r.at) state = r.voicemail !== undefined ? (t >= r.voicemail ? 'Voicemail' : 'Ringing…') : t < (r.answered as number) ? 'On hold' : t < (r.ends as number) ? `With ${r.by}` : `Done · ${r.by}`;
          return (
            <li key={r.id}>
              <span className="tn-rq-id">Call {r.id}</span>
              <span className="tn-rq-track">
                {t >= r.at && <span className={r.voicemail !== undefined ? 'tn-rq-wait tn-rq-ringing' : 'tn-rq-wait'} style={{ left: pct(r.at), width: pct(waitShown) }} />}
                {talkShown > 0 && <span className="tn-rq-talk" style={{ left: pct(r.answered as number), width: pct(talkShown) }} />}
                {r.voicemail !== undefined && t >= r.voicemail && <span className="tn-rq-vm" style={{ left: pct(r.voicemail) }} aria-hidden>✉</span>}
              </span>
              <span className={`tn-rq-state${state === 'Voicemail' ? ' tn-rq-state-vm' : state === 'On hold' || state === 'Ringing…' ? ' tn-rq-state-wait' : ''}`}>{state}</span>
            </li>
          );
        })}
      </ol>
      <p className={t >= END ? 'tn-rq-sum' : 'tn-rq-sum tn-rq-sum-wait'}>
        <b>{answered}</b> answered · <b>{vm}</b> to voicemail
        {longest > 0 ? (
          <>
            {' '}
            · longest wait <b>{clock(longest)}</b>
          </>
        ) : null}
      </p>
    </section>
  );
}

export function RingVsQueue() {
  const [size, setSize] = useState(3);
  const [t, setT] = useState(END);
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLElement>(null);
  const ring = useMemo(() => run('ring', size), [size]);
  const queue = useMemo(() => run('queue', size), [size]);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let seen = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !seen) {
          seen = true;
          setT(0);
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
    if (t >= END) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setT((x) => Math.min(END, x + 2)), 80);
    return () => window.clearTimeout(id);
  }, [playing, t]);

  const replay = (n = size) => {
    setSize(n);
    setT(0);
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setT(END);
  };

  return (
    <figure ref={root} className="tn-rq not-prose" aria-label="Example: the same five calls, ring together and queue">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Five calls in two busy minutes</span>
        <div className="tn-flow-moments" role="radiogroup" aria-label="People on the team">
          {[2, 3, 4].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={size === n} className={size === n ? 'tn-chip tn-chip-on' : 'tn-chip'} onClick={() => replay(n)}>
              {n} people
            </button>
          ))}
          <button type="button" className="tn-chip" onClick={() => replay()} disabled={playing}>
            {playing ? clock(t) : '▶ Play again'}
          </button>
        </div>
      </div>
      <div className="tn-rq-grid">
        <Lane title="Ring together" rule="Everyone rings for 25 seconds, then voicemail" results={ring} t={t} />
        <Lane title="Queue" rule="Callers hold with music until someone is free" results={queue} t={t} />
      </div>
      <div className="tn-rq-key" aria-hidden>
        <span><i className="tn-rq-wait" /> Ringing or on hold</span>
        <span><i className="tn-rq-talk" /> Talking</span>
        <span>✉ Voicemail</span>
      </div>
      <figcaption>
        A made-up rush: calls A to E arrive within 33 seconds and last a minute or more. Pick how many people are on
        the team. Ring together sends what nobody can take to voicemail; a queue makes callers wait for a person.
      </figcaption>
    </figure>
  );
}
