'use client';

import { useState } from 'react';

/**
 * "Where does this call go?" on an example setup. It follows the order the Phones page
 * documents (a calendar event happening now, then the schedule, then Go To). It explains
 * the order; it does not read anyone's real settings.
 */
type Moment = 'weekday' | 'weekend' | 'holiday';

const moments: { id: Moment; label: string; when: string }[] = [
  { id: 'weekday', label: 'Tuesday, 10 AM', when: 'A normal weekday morning' },
  { id: 'weekend', label: 'Saturday, 2 PM', when: 'Outside office hours' },
  { id: 'holiday', label: 'December 25', when: 'A holiday on your calendar' },
];

const checks = [
  {
    id: 'calendar',
    title: '1. A calendar event happening now?',
    setting: 'Calendars: "Holiday closure"',
    yes: 'Voicemail',
  },
  {
    id: 'schedule',
    title: '2. Inside the schedule?',
    setting: 'Schedule: "Office hours", Mon–Fri 9 AM–5 PM',
    yes: 'Main menu: "Press 1 for sales, 2 for support"',
  },
  {
    id: 'goto',
    title: '3. Otherwise, Go To',
    setting: 'Go To: Features › Phone Number',
    yes: 'Your on-call phone',
  },
] as const;

function resolve(moment: Moment): (typeof checks)[number]['id'] {
  if (moment === 'holiday') return 'calendar';
  if (moment === 'weekday') return 'schedule';
  return 'goto';
}

export function CallFlow() {
  const [moment, setMoment] = useState<Moment>('weekday');
  const stop = resolve(moment);
  const stopIndex = checks.findIndex((c) => c.id === stop);

  return (
    <figure className="tn-flow not-prose" aria-label="Example: where an incoming call goes">
      <div className="tn-flow-head">
        <span className="tn-flow-kicker">Example setup</span>
        <div className="tn-flow-moments" role="radiogroup" aria-label="When the call comes in">
          {moments.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={moment === m.id}
              className={moment === m.id ? 'tn-chip tn-chip-on' : 'tn-chip'}
              onClick={() => setMoment(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="tn-flow-steps" key={moment}>
        <li className="tn-flow-call">
          <span className="tn-flow-dot" aria-hidden />
          <div>
            <strong>A call comes in</strong>
            <span>{moments.find((m) => m.id === moment)?.when}</span>
          </div>
        </li>
        {checks.map((check, i) => {
          const state = i < stopIndex ? 'pass' : i === stopIndex ? 'stop' : 'skip';
          return (
            <li key={check.id} className={`tn-flow-step tn-flow-${state}`} style={{ animationDelay: `${(i + 1) * 0.35}s` }}>
              <span className="tn-flow-dot" aria-hidden />
              <div>
                <strong>{check.title}</strong>
                <span className="tn-flow-setting">{check.setting}</span>
                {state === 'pass' && <span className="tn-flow-verdict">No, next check</span>}
                {state === 'stop' && (
                  <span className="tn-flow-verdict tn-flow-answer">
                    {check.id === 'goto' ? 'Goes to' : 'Yes, goes to'} <b>{check.yes}</b>
                  </span>
                )}
                {state === 'skip' && <span className="tn-flow-verdict">Not checked</span>}
              </div>
            </li>
          );
        })}
      </ol>
      <figcaption>
        Tonet checks a number's settings in this order and stops at the first match. Set them in{' '}
        <b>Manage › Phones</b>, on the number's <b>Route &amp; settings</b> tab.
      </figcaption>
    </figure>
  );
}
