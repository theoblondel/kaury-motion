export type Easing = ((t: number) => number) & { duration?: number };

/** CSS-compatible cubic-bezier, solved with Newton-Raphson then bisection. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  if (x1 === y1 && x2 === y2) return (t) => t;
  const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
  const slopeX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  const solve = (x: number) => {
    let s = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - x;
      if (Math.abs(err) < 1e-6) return s;
      const d = slopeX(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    let lo = 0, hi = 1;
    s = x;
    while (lo < hi) {
      const v = sampleX(s);
      if (Math.abs(v - x) < 1e-6) return s;
      if (x > v) lo = s; else hi = s;
      s = (lo + hi) / 2;
      if (hi - lo < 1e-7) break;
    }
    return s;
  };
  return (t) => (t <= 0 ? 0 : t >= 1 ? 1 : sampleY(solve(t)));
}

export interface SpringOptions {
  mass?: number;
  stiffness?: number;
  damping?: number;
  velocity?: number;
}

/**
 * Physical damped spring used as an easing. The returned function carries a
 * `duration` (ms) long enough for the spring to settle, which `animate()`
 * uses when no explicit duration is given.
 */
export function spring({ mass = 1, stiffness = 120, damping = 12, velocity = 0 }: SpringOptions = {}): Easing {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const a = 1, b = zeta < 1 ? (zeta * w0 - velocity) / wd : -velocity + w0;
  const at = (sec: number) => {
    let p: number;
    if (zeta < 1) p = Math.exp(-sec * zeta * w0) * (a * Math.cos(wd * sec) + b * Math.sin(wd * sec));
    else p = (a + b * sec) * Math.exp(-sec * w0);
    return 1 - p;
  };
  // Settle time: first moment after which the motion stays within 0.1%.
  let settle = 0, still = 0;
  for (let s = 0; s < 10; s += 1 / 120) {
    if (Math.abs(1 - at(s)) < 0.001) {
      if (++still > 12) { settle = s; break; }
    } else still = 0;
  }
  if (!settle) settle = 10;
  const ease: Easing = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : at(t * settle));
  ease.duration = Math.round(settle * 1000);
  return ease;
}

const pow = (p: number) => ({
  in: (t: number) => t ** p,
  out: (t: number) => 1 - (1 - t) ** p,
  inOut: (t: number) => (t < 0.5 ? 2 ** (p - 1) * t ** p : 1 - (-2 * t + 2) ** p / 2),
});
const q = pow(2), c = pow(3), qu = pow(4), qi = pow(5);
const c1 = 1.70158, c3 = c1 + 1;

export const easings: Record<string, Easing> = {
  linear: (t) => t,
  inQuad: q.in, outQuad: q.out, inOutQuad: q.inOut,
  inCubic: c.in, outCubic: c.out, inOutCubic: c.inOut,
  inQuart: qu.in, outQuart: qu.out, inOutQuart: qu.inOut,
  inQuint: qi.in, outQuint: qi.out, inOutQuint: qi.inOut,
  inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inExpo: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  outExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  inOutExpo: (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
  inBack: (t) => c3 * t ** 3 - c1 * t ** 2,
  outBack: (t) => 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2,
  outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  outBounce: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
  /** The Kaury Studio house curve: fast start, long silky finish. */
  kaury: cubicBezier(0.16, 1, 0.3, 1),
};

export type EaseInput = string | Easing | undefined;

/** Accepts a name, `cubic-bezier(a,b,c,d)`, `spring(mass,stiffness,damping,velocity)` or a function. */
export function resolveEase(e: EaseInput): Easing {
  if (typeof e === 'function') return e;
  if (!e) return easings.kaury;
  const m = /^(cubic-bezier|spring)\(([^)]*)\)$/.exec(e.replace(/\s/g, ''));
  if (m) {
    const n = m[2].split(',').filter(Boolean).map(Number);
    if (m[1] === 'cubic-bezier' && n.length === 4) return cubicBezier(n[0], n[1], n[2], n[3]);
    if (m[1] === 'spring') return spring({ mass: n[0], stiffness: n[1], damping: n[2], velocity: n[3] });
  }
  const found = easings[e];
  if (!found) throw new Error(`[kaury-motion] Unknown easing "${e}"`);
  return found;
}
