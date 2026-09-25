export type TickFn = (time: number, delta: number) => void;

const subs = new Set<TickFn>();
let running = false;
let last = 0;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const raf: (cb: (t: number) => void) => unknown =
  typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (cb) => setTimeout(() => cb(now()), 16);

function loop(t: number) {
  const delta = Math.min(t - last, 64);
  last = t;
  subs.forEach((fn) => fn(t, delta));
  if (subs.size) raf(loop);
  else running = false;
}

/** One shared requestAnimationFrame loop for every animation and effect. */
export const ticker = {
  add(fn: TickFn) {
    subs.add(fn);
    if (!running) {
      running = true;
      last = now();
      raf(loop);
    }
    return () => ticker.remove(fn);
  },
  remove(fn: TickFn) {
    subs.delete(fn);
  },
  now,
};

export const config = {
  /** 'auto' follows the OS "reduce motion" setting; 'always' / 'never' force it. */
  reducedMotion: 'auto' as 'auto' | 'always' | 'never',
};

export function prefersReducedMotion(): boolean {
  if (config.reducedMotion !== 'auto') return config.reducedMotion === 'always';
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
