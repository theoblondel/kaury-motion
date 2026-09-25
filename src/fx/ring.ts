import { toArray, type Targets } from '../core/animate';
import { lerp } from '../core/interpolate';
import { prefersReducedMotion, ticker } from '../core/ticker';
import { scrollVelocity } from './scroll';

export interface RingOptions {
  /** Text that runs round the circle. Defaults to the element's text. */
  text?: string;
  /** Radius in px. Default 90. */
  radius?: number;
  fontSize?: number;
  /** Degrees per second; negative spins anticlockwise. Default 18. */
  speed?: number;
  /** Extra spin from scrolling. Default 0. */
  scrollBoost?: number;
  color?: string;
  fontWeight?: number | string;
  letterSpacing?: number;
}

let uid = 0;

/** Circular text badge that spins, optionally faster while the page scrolls. */
export function ring(target: Targets, opts: RingOptions = {}) {
  const el = toArray(target)[0] as HTMLElement;
  const original = el.innerHTML;
  const text = (opts.text ?? el.textContent ?? '').trim();
  const { radius = 90, fontSize = 14, speed = 18, scrollBoost = 0, color = 'currentColor', fontWeight = 700, letterSpacing = 0 } = opts;
  const size = radius * 2 + fontSize * 2.4;
  const c = size / 2;
  const id = `km-ring-${++uid}`;
  const circumference = 2 * Math.PI * radius;
  el.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;overflow:visible;will-change:transform" aria-label="${text.replace(/"/g, '&quot;')}" role="img">
<defs><path id="${id}" d="M${c},${c} m-${radius},0 a${radius},${radius} 0 1,1 ${radius * 2},0 a${radius},${radius} 0 1,1 -${radius * 2},0"/></defs>
<text font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" letter-spacing="${letterSpacing}" style="text-transform:uppercase"><textPath href="#${id}" textLength="${circumference - fontSize * 0.5}" lengthAdjust="spacing">${text.replace(/</g, '&lt;')}</textPath></text></svg>`;
  const svg = el.firstElementChild as SVGSVGElement;
  if (scrollBoost) scrollVelocity.start();
  let angle = 0, extra = 0;
  const reduce = prefersReducedMotion();
  const stop = ticker.add((_, dt) => {
    if (reduce) return;
    if (scrollBoost) extra = lerp(extra, scrollVelocity.read() * scrollBoost * 60, 0.1);
    angle = (angle + ((speed + extra) * dt) / 1000) % 360;
    svg.style.transform = `rotate(${angle}deg)`;
  });
  return {
    el: svg,
    destroy() {
      stop();
      el.innerHTML = original;
    },
  };
}
