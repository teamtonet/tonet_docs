'use client';

import { useState } from 'react';

/**
 * A screenshot with numbered spots on it, and the same numbers in a list underneath.
 * Hovering or focusing either one lights up the other. The list is plain text in the page,
 * so what each spot means is readable without the picture.
 *
 * <Shot src="/images/x.webp" alt="..." width={1600} height={1000}
 *   spots={[{ x: 12, y: 30, title: 'Calls', text: 'Every call, newest first.' }]} />
 * x and y are percentages of the picture's width and height.
 */
type Spot = { x: number; y: number; title: string; text?: string };

export function Shot({
  src,
  alt,
  width,
  height,
  spots,
  caption,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  spots: Spot[];
  caption?: string;
}) {
  const [on, setOn] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);

  return (
    <figure className="tn-shot not-prose">
      <div className="tn-shot-frame">
        <button type="button" className="tn-shot-open" onClick={() => setZoom(true)} aria-label={`Open full size: ${alt}`}>
          <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
        </button>
        {spots.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={on === i ? 'tn-spot tn-spot-on' : 'tn-spot'}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-label={`${i + 1}. ${s.title}`}
            onMouseEnter={() => setOn(i)}
            onMouseLeave={() => setOn(null)}
            onFocus={() => setOn(i)}
            onBlur={() => setOn(null)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ol className="tn-shot-list">
        {spots.map((s, i) => (
          <li
            key={s.title}
            className={on === i ? 'tn-shot-item tn-shot-item-on' : 'tn-shot-item'}
            onMouseEnter={() => setOn(i)}
            onMouseLeave={() => setOn(null)}
          >
            <span className="tn-shot-num" aria-hidden>
              {i + 1}
            </span>
            <span>
              <b>{s.title}</b>
              {s.text ? ` ${s.text}` : ''}
            </span>
          </li>
        ))}
      </ol>
      {caption && <figcaption>{caption}</figcaption>}
      {zoom && (
        <div className="tn-shot-zoom" role="dialog" aria-label={alt} onClick={() => setZoom(false)}>
          <img src={src} alt="" />
        </div>
      )}
    </figure>
  );
}
