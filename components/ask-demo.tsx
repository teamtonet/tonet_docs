'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Ask Tonet running a task, as an example: the request, the steps it takes, its reply and the
 * changes it made with their status. Made-up account, real labels from the Ask Tonet page.
 * Every example is complete in the server HTML; playback starts when it scrolls into view.
 */
type Status = 'Verified' | 'Already set' | 'Needs attention';
type Example = {
  id: string;
  label: string;
  ask: string;
  steps: string[];
  reply: string;
  results?: { what: string; status: Status }[];
  found?: { when: string; who: string; said: string }[];
};

const examples: Example[] = [
  {
    id: 'prices',
    label: 'Find calls',
    ask: "Find this week's calls where someone asked about prices",
    steps: ['Searching this week’s calls for prices', 'Reading the matching transcripts'],
    reply: '3 calls this week asked about prices. Two were new callers.',
    found: [
      { when: 'Mon 10:12 AM', who: '(555) 010-0142', said: '“What does a visit cost?”' },
      { when: 'Tue 3:47 PM', who: 'Front Desk → (555) 010-0187', said: '“Is the $89 credited if we go ahead?”' },
      { when: 'Thu 9:05 AM', who: '(555) 010-0163', said: '“Do you charge extra on weekends?”' },
    ],
  },
  {
    id: 'team',
    label: 'Change a team',
    ask: 'Add extension 104 to the Sales team',
    steps: ['Looking up extension 104', 'Adding 104 to Sales', 'Checking the team'],
    reply: 'Done. Extension 104 is in Sales and rings with the team from now on.',
    results: [
      { what: 'Sales: add extension 104', status: 'Verified' },
    ],
  },
  {
    id: 'hours',
    label: 'Set hours',
    ask: 'Send calls on the main line to voicemail after 6 PM on weekdays',
    steps: ['Making the schedule', 'Setting Mon–Fri, 9 AM–6 PM', 'Giving the main line the schedule'],
    reply: 'Your main line now follows Office hours. Outside them, calls go to voicemail.',
    results: [
      { what: 'Schedule “Office hours”: Mon–Fri, 9 AM–6 PM', status: 'Verified' },
      { what: 'Main line: outside hours, go to Voicemail', status: 'Verified' },
      { what: 'Main line: inside hours, go to Front Desk', status: 'Already set' },
    ],
  },
];

// Stages of one example: 0 typing the ask, 1..steps working, then the reply, then the results.
const total = (e: Example) => 1 + e.steps.length + 2;

export function AskDemo() {
  const [pick, setPick] = useState(0);
  const [stage, setStage] = useState(total(examples[0]));
  const [typed, setTyped] = useState(examples[0].ask.length);
  const root = useRef<HTMLElement>(null);
  const started = useRef(false);
  const reduce = useRef(false);
  const ex = examples[pick];

  const play = (i: number) => {
    setPick(i);
    if (reduce.current) {
      setStage(total(examples[i]));
      setTyped(examples[i].ask.length);
      return;
    }
    setStage(0);
    setTyped(0);
  };

  useEffect(() => {
    const el = root.current;
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          play(0);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const end = total(ex);
    if (stage >= end) return;
    if (stage === 0) {
      if (typed < ex.ask.length) {
        const id = window.setTimeout(() => setTyped((t) => t + 1), 28);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setStage(1), 450);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStage((s) => s + 1), stage <= ex.steps.length ? 900 : 600);
    return () => window.clearTimeout(id);
  }, [stage, typed, ex]);

  const working = stage >= 1 && stage <= ex.steps.length;
  const replied = stage > ex.steps.length;
  const showResults = stage > ex.steps.length + 1;

  return (
    <figure ref={root} className="tn-ask-demo not-prose" aria-label="Example: Ask Tonet running a task">
      <div className="tn-demo-head">
        <span className="tn-flow-kicker">Example: Run a task</span>
        <div className="tn-flow-moments" role="radiogroup" aria-label="Pick a task">
          {examples.map((e, i) => (
            <button
              key={e.id}
              type="button"
              role="radio"
              aria-checked={pick === i}
              className={pick === i ? 'tn-chip tn-chip-on' : 'tn-chip'}
              onClick={() => play(i)}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tn-chat">
        <div className="tn-chat-me">
          {ex.ask.slice(0, typed)}
          {stage === 0 && <span className="tn-caret" aria-hidden />}
        </div>

        {stage >= 1 && (
          <ul className="tn-chat-steps">
            {ex.steps.map((s, i) => {
              const state = stage > i + 1 ? 'done' : stage === i + 1 ? 'now' : 'next';
              if (state === 'next') return null;
              return (
                <li key={s} className={`tn-chat-step tn-chat-step-${state}`}>
                  <span className="tn-chat-tick" aria-hidden>
                    {state === 'done' ? '✓' : ''}
                  </span>
                  {s}
                </li>
              );
            })}
            {working && (
              <li className="tn-chat-stop">
                <span className="tn-chip tn-chip-sm">Stop work</span>
              </li>
            )}
          </ul>
        )}

        {replied && <div className="tn-chat-ai">{ex.reply}</div>}

        {showResults && ex.found && (
          <ul className="tn-chat-found">
            {ex.found.map((f) => (
              <li key={f.when}>
                <span className="tn-chat-when">{f.when}</span>
                <span className="tn-chat-who">{f.who}</span>
                <span className="tn-chat-said">{f.said}</span>
              </li>
            ))}
          </ul>
        )}

        {showResults && ex.results && (
          <ul className="tn-chat-results">
            {ex.results.map((r) => (
              <li key={r.what}>
                <span>{r.what}</span>
                <span className={r.status === 'Verified' ? 'tn-status tn-status-ok' : 'tn-status'}>{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <figcaption>
        A made-up account. Ask Tonet changes things only when you clearly ask. In Tonet, click a change for its
        details and a <b>Review in Tonet</b> link.
      </figcaption>
    </figure>
  );
}
