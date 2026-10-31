'use client';

import { useId, useState } from 'react';
import { breakEvenMinutes, prices } from '@/lib/prices';

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Field({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  const id = useId();
  return (
    <div className="tn-calc-field">
      <div className="tn-calc-label">
        <label htmlFor={id}>{label}</label>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="tn-calc-hint">{hint}</span>
    </div>
  );
}

/** Monthly cost on both plans for a team. Starts on a worked example so the page reads complete. */
export function PriceCalculator() {
  const [people, setPeople] = useState(3);
  const [minutes, setMinutes] = useState(400);
  const [texts, setTexts] = useState(200);
  const [numbers, setNumbers] = useState(1);

  const shared = texts * prices.perText + numbers * prices.perNumberMonth;
  const payg = people * (prices.payg.perPersonMonth + minutes * prices.payg.perMinute) + shared;
  const unlimited = people * prices.unlimited.perPersonMonth + shared;
  const cheaper = payg === unlimited ? null : payg < unlimited ? 'payg' : 'unlimited';

  return (
    <div className="tn-calc not-prose">
      <div className="tn-calc-inputs">
        <Field label="People on calls" hint="Each person gets a line" value={people} min={1} max={100} step={1} onChange={setPeople} />
        <Field
          label="Minutes a person a month"
          hint="Calls in and out, US and Canada"
          value={minutes}
          min={0}
          max={3000}
          step={50}
          onChange={setMinutes}
        />
        <Field label="Texts a month" hint="Whole team, sent and received" value={texts} min={0} max={10000} step={50} onChange={setTexts} />
        <Field label="Phone numbers" hint="Local or toll-free" value={numbers} min={1} max={50} step={1} onChange={setNumbers} />
      </div>
      <div className="tn-calc-results" aria-live="polite">
        <div className={cheaper === 'payg' ? 'tn-plan tn-plan-best' : 'tn-plan'}>
          <span className="tn-plan-name">Pay as you go</span>
          <span className="tn-plan-total">{money(payg)}</span>
          <span className="tn-plan-sub">a month · about {money(payg / 30)} a day</span>
          {cheaper === 'payg' && <span className="tn-plan-tag">Costs less</span>}
        </div>
        <div className={cheaper === 'unlimited' ? 'tn-plan tn-plan-best' : 'tn-plan'}>
          <span className="tn-plan-name">Unlimited</span>
          <span className="tn-plan-total">{money(unlimited)}</span>
          <span className="tn-plan-sub">a month · about {money(unlimited / 30)} a day</span>
          {cheaper === 'unlimited' && <span className="tn-plan-tag">Costs less</span>}
        </div>
        <p className="tn-calc-note">
          Unlimited costs less once each person talks more than {breakEvenMinutes} minutes a month. Texts are{' '}
          {Math.round(prices.perText * 100)}¢ and numbers are {money(prices.perNumberMonth)} a month on both plans. Calls
          that come in on a toll-free number, and calls outside the US and Canada, are charged by the minute and aren't
          counted here.
        </p>
      </div>
    </div>
  );
}
