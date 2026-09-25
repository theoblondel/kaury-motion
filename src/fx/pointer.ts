import { set, toArray, type Targets } from '../core/animate';
import { lerp } from '../core/interpolate';
import { prefersReducedMotion, ticker } from '../core/ticker';

const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * (dt / 1000)));
const fine = () => typeof matchMedia === 'undefined' || matchMedia('(pointer: fine)').matches;

let px = -9999, py = -9999, listening = false;
function trackPointer() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('pointermove', (e) => ((px = e.clientX), (py = e.clientY)), { passive: true });
}

export interface MagneticOptions {
  /** Share of the pointer offset the element follows. Default 0.4. */
  strength?: number;
  /** Extra reach around the element, px. Default 80. */
  radius?: number;
  /** Follow speed; higher is snappier. Default 10. */
  stiffness?: number;
  /** A child that moves further, for a layered parallax feel. */
  inner?: string;
}

/** Buttons and icons that lean towards the cursor and snap back. */
export function magnetic(targets: Targets, opts: MagneticOptions = {}) {
  const { strength = 0.4, radius = 80, stiffness = 10, inner } = opts;
  const els = toArray(targets) as HTMLElement[];
  if (prefersReducedMotion() || !fine()) return () => {};
  trackPointer();
  const state = els.map((el) => ({ el, x: 0, y: 0, inner: inner ? (el.querySelector(inner) as HTMLElement | null) : null }));
  return ticker.add((_, dt) => {
    for (const s of state) {
      const r = s.el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - s.x, cy = r.top + r.height / 2 - s.y;
      const dx = px - cx, dy = py - cy;
      const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
      s.x = damp(s.x, near ? dx * strength : 0, stiffness, dt);
      s.y = damp(s.y, near ? dy * strength : 0, stiffness, dt);
      set(s.el, { x: +s.x.toFixed(2), y: +s.y.toFixed(2) });
      if (s.inner) set(s.inner, { x: +(s.x * 0.5).toFixed(2), y: +(s.y * 0.5).toFixed(2) });
    }
  });
}

export interface TiltOptions {
  /** Max rotation in degrees. Default 14. */
  max?: number;
  perspective?: number;
  /** Scale while hovered. Default 1.04. */
  scale?: number;
  /** Adds a moving light reflection. Default true. */
  glare?: boolean;
  stiffness?: number;
}

/** 3D cards that tilt towards the pointer, with a travelling glare. */
export function tilt(targets: Targets, opts: TiltOptions = {}) {
  const { max = 14, perspective = 900, scale = 1.04, glare = true, stiffness = 9 } = opts;
  const els = toArray(targets) as HTMLElement[];
  if (prefersReducedMotion()) return () => {};
  const state = els.map((el) => {
    el.style.transformStyle = 'preserve-3d';
    let g: HTMLElement | null = null;
    if (glare) {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      g = document.createElement('div');
      g.className = 'km-glare';
      g.setAttribute('style', 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;mix-blend-mode:soft-light;opacity:0;transition:opacity .3s');
      el.appendChild(g);
    }
    const s = { el, g, rx: 0, ry: 0, sc: 1, tx: 0, ty: 0, ts: 1, gx: 50, gy: 50 };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      s.ty = (nx - 0.5) * 2 * max;
      s.tx = -(ny - 0.5) * 2 * max;
      s.ts = scale;
      s.gx = nx * 100;
      s.gy = ny * 100;
      if (g) g.style.opacity = '1';
    });
    el.addEventListener('pointerleave', () => {
      s.tx = s.ty = 0;
      s.ts = 1;
      if (g) g.style.opacity = '0';
    });
    return s;
  });
  return ticker.add((_, dt) => {
    for (const s of state) {
      s.rx = damp(s.rx, s.tx, stiffness, dt);
      s.ry = damp(s.ry, s.ty, stiffness, dt);
      s.sc = damp(s.sc, s.ts, stiffness, dt);
      set(s.el, { perspective, rotateX: +s.rx.toFixed(3), rotateY: +s.ry.toFixed(3), scale: +s.sc.toFixed(4) });
      if (s.g) s.g.style.background = `radial-gradient(circle at ${s.gx}% ${s.gy}%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%)`;
    }
  });
}

export interface CursorOptions {
  size?: number;
  color?: string;
  /** Blend mode; 'difference' inverts whatever is underneath. */
  blend?: string;
  /** Scale over links, buttons and [data-km-cursor]. Default 3.2. */
  hoverScale?: number;
  stiffness?: number;
}

/** A custom cursor that trails the pointer, grows over links and shows labels from `data-km-cursor`. */
export function cursor(opts: CursorOptions = {}) {
  const { size = 14, color = '#F56E2E', blend = 'normal', hoverScale = 3.2, stiffness = 16 } = opts;
  if (!fine() || prefersReducedMotion()) return () => {};
  trackPointer();
  const dot = document.createElement('div');
  dot.className = 'km-cursor';
  dot.setAttribute('style', `position:fixed;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:${color};pointer-events:none;z-index:2147483647;mix-blend-mode:${blend};display:grid;place-items:center;will-change:transform`);
  const label = document.createElement('span');
  label.setAttribute('style', `font:700 ${Math.max(3, size / 4.2)}px/1 system-ui,sans-serif;color:#fff;white-space:nowrap;opacity:0;transition:opacity .2s;letter-spacing:.02em`);
  dot.appendChild(label);
  document.body.appendChild(dot);
  let x = px, y = py, s = 0, ts = 1;
  const over = (e: Event) => {
    const t = (e.target as Element).closest?.('a,button,[data-km-cursor],[data-km="magnetic"]');
    ts = t ? hoverScale : 1;
    const txt = t?.getAttribute('data-km-cursor') || '';
    label.textContent = txt;
    label.style.opacity = txt ? '1' : '0';
  };
  const down = () => (ts *= 0.7);
  const up = (e: Event) => over(e);
  document.addEventListener('pointerover', over);
  document.addEventListener('pointerdown', down);
  document.addEventListener('pointerup', up);
  const stop = ticker.add((_, dt) => {
    x = damp(x, px, stiffness, dt);
    y = damp(y, py, stiffness, dt);
    s = damp(s, px < -1000 ? 0 : ts, 12, dt);
    dot.style.transform = `translate3d(${x}px,${y}px,0) scale(${s})`;
    label.style.transform = `scale(${1 / Math.max(s, 0.01)})`;
  });
  return () => {
    stop();
    dot.remove();
    document.removeEventListener('pointerover', over);
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointerup', up);
  };
}
