import { toArray, type Targets } from '../core/animate';
import { lerp } from '../core/interpolate';
import { prefersReducedMotion, ticker } from '../core/ticker';
import { scrollVelocity } from './scroll';

export interface MarqueeOptions {
  /** px per second. Default 80. */
  speed?: number;
  direction?: 'left' | 'right';
  /** Space between repeats, px. Default 48. */
  gap?: number;
  /** Slow to a stop while hovered. */
  pauseOnHover?: boolean;
  /** How strongly page scrolling speeds the band up (and flips it). 0 disables. Default 0. */
  scrollBoost?: number;
  /** Lean the content in the direction of scroll speed, in degrees at full speed. Default 0. */
  skew?: number;
}

export interface MarqueeControls {
  setSpeed(pxPerSecond: number): void;
  pause(): void;
  play(): void;
  destroy(): void;
}

/** An endless, seamless band of content. Reacts to hover and scroll if asked. */
export function marquee(target: Targets, opts: MarqueeOptions = {}): MarqueeControls {
  const el = toArray(target)[0] as HTMLElement;
  let { speed = 80 } = opts;
  const { direction = 'left', gap = 48, pauseOnHover = false, scrollBoost = 0, skew = 0 } = opts;
  const original = el.innerHTML;
  el.style.overflow = 'hidden';

  const track = document.createElement('div');
  track.className = 'km-marquee-track';
  track.setAttribute('style', 'display:flex;width:max-content;will-change:transform');
  const group = document.createElement('div');
  group.className = 'km-marquee-group';
  group.setAttribute('style', `display:flex;align-items:center;gap:${gap}px;padding-right:${gap}px;flex-shrink:0`);
  while (el.firstChild) group.appendChild(el.firstChild);
  track.appendChild(group);
  el.appendChild(track);

  let groupWidth = 0;
  const fill = () => {
    while (track.children.length > 1) track.lastChild!.remove();
    groupWidth = group.getBoundingClientRect().width;
    const needed = Math.ceil((el.clientWidth * 2) / Math.max(groupWidth, 1)) + 1;
    for (let i = 1; i < Math.min(needed, 40); i++) {
      const c = group.cloneNode(true) as HTMLElement;
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    }
  };
  fill();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fill) : null;
  ro?.observe(el);

  let offset = 0, hover = 1, hoverTarget = 1, running = true, sign = direction === 'left' ? -1 : 1, lean = 0;
  const enter = () => (hoverTarget = 0);
  const leave = () => (hoverTarget = 1);
  if (pauseOnHover) {
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
  }
  if (scrollBoost) scrollVelocity.start();

  const reduce = prefersReducedMotion();
  const stop = ticker.add((_, dt) => {
    if (!running || reduce || !groupWidth) return;
    hover = lerp(hover, hoverTarget, 1 - Math.pow(0.001, dt / 1000));
    let v = speed;
    if (scrollBoost) {
      const sv = scrollVelocity.read();
      if (Math.abs(sv) > 0.05) sign = (sv > 0 ? -1 : 1) * (direction === 'left' ? 1 : -1);
      v *= 1 + Math.abs(sv) * scrollBoost;
      lean = lerp(lean, Math.max(-1, Math.min(1, sv / 3)) * skew, 0.15);
    }
    offset += (sign * v * hover * dt) / 1000;
    offset = ((offset % groupWidth) - groupWidth) % groupWidth;
    track.style.transform = `translate3d(${offset}px,0,0)${lean ? ` skewX(${-lean}deg)` : ''}`;
  });

  return {
    setSpeed: (s) => (speed = s),
    pause: () => (running = false),
    play: () => (running = true),
    destroy() {
      stop();
      ro?.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.innerHTML = original;
    },
  };
}
