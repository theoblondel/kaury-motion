import { set, toArray, type Targets } from '../core/animate';
import { clamp, lerp } from '../core/interpolate';
import type { Playback } from '../core/playback';
import { prefersReducedMotion, ticker } from '../core/ticker';

export interface InViewOptions {
  /** 0..1 share of the element that must be visible. Default 0.2. */
  threshold?: number;
  rootMargin?: string;
  /** Fire only the first time (default true). */
  once?: boolean;
}

/** Calls `onEnter` when an element scrolls into view (and `onLeave` if `once: false`). */
export function inView(targets: Targets, onEnter: (el: Element) => void | (() => void), opts: InViewOptions = {}) {
  const { threshold = 0.2, rootMargin = '0px', once = true } = opts;
  const els = toArray(targets) as Element[];
  if (typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => onEnter(el));
    return () => {};
  }
  const leaves = new Map<Element, () => void>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const leave = onEnter(e.target);
          if (once) io.unobserve(e.target);
          else if (typeof leave === 'function') leaves.set(e.target, leave);
        } else if (leaves.has(e.target)) {
          leaves.get(e.target)!();
          leaves.delete(e.target);
        }
      }
    },
    { threshold, rootMargin },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/** Smoothed page scroll velocity in px per ms, shared by every scroll-reactive effect. */
export const scrollVelocity = (() => {
  let v = 0, lastY = 0, lastT = 0, started = false;
  const state = { get value() { return v; } };
  const start = () => {
    if (started || typeof window === 'undefined') return;
    started = true;
    lastY = window.scrollY;
    lastT = ticker.now();
    ticker.add((t) => {
      const y = window.scrollY;
      const dt = Math.max(1, t - lastT);
      const raw = (y - lastY) / dt;
      v = lerp(v, raw, 0.2);
      if (Math.abs(v) < 0.001) v = 0;
      lastY = y;
      lastT = t;
    });
  };
  return { start, read: () => (start(), state.value) };
})();

export interface ParallaxOptions {
  /** Fraction of scroll distance to move. Negative moves against the scroll. Default 0.2. */
  speed?: number;
  axis?: 'x' | 'y';
}

/** Moves elements at a different speed than the page. */
export function parallax(targets: Targets, opts: ParallaxOptions = {}) {
  const { speed = 0.2, axis = 'y' } = opts;
  const els = toArray(targets) as HTMLElement[];
  if (prefersReducedMotion()) return () => {};
  return ticker.add(() => {
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      set(el, { [axis]: offset });
    }
  });
}

export interface ScrubOptions {
  /** Element whose position drives the animation. */
  trigger: Targets;
  /** Viewport position (0 top .. 1 bottom) where the trigger's top starts the animation. Default 1. */
  start?: number;
  /** Viewport position where the trigger's bottom ends it. Default 0. */
  end?: number;
  /** 0 = locked to the scrollbar, closer to 1 = lazier catch-up. Default 0.12. */
  smooth?: number;
}

/** Links any animation or timeline to the scroll position. */
export function scrub(anim: Playback, opts: ScrubOptions) {
  const el = toArray(opts.trigger)[0] as HTMLElement;
  const { start = 1, end = 0, smooth = 0.12 } = opts;
  anim.pause();
  let current = 0;
  return ticker.add((_, dt) => {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const from = r.top - start * vh;
    const to = r.bottom - end * vh;
    const p = clamp(-from / (to - from || 1));
    const k = smooth ? 1 - Math.pow(smooth, dt / 16.67 / 4) : 1;
    current = Math.abs(p - current) < 0.0005 ? p : lerp(current, p, smooth ? k : 1);
    const total = anim.totalDuration === Infinity ? anim.duration : anim.totalDuration;
    anim.seek(current * total);
  });
}
