import { animate, set, toArray, type AnimateOptions, type PropValue, type Targets } from '../core/animate';
import { prefersReducedMotion, ticker } from '../core/ticker';
import { stagger, type StaggerOptions } from '../core/stagger';
import { split } from './split';

/** Ready-made entrance looks. Each is a set of `animate()` props. */
export const presets: Record<string, Record<string, PropValue>> = {
  rise: { y: ['110%', '0%'] },
  fade: { opacity: [0, 1], y: [18, 0] },
  blur: { opacity: [0, 1], filter: ['blur(12px)', 'blur(0px)'], y: [10, 0] },
  flip: { rotateX: [-95, 0], opacity: [0, 1], y: ['40%', '0%'] },
  pop: { scale: [0, 1], opacity: [0, 1] },
  slide: { x: ['-60%', '0%'], opacity: [0, 1] },
  swing: { rotate: [14, 0], y: ['120%', '0%'] },
  zoom: { scale: [2.2, 1], opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] },
  /** Typewriter: each piece appears at once, the stagger sets the typing speed. */
  type: { opacity: [0, 1] },
};

export interface RevealOptions extends AnimateOptions {
  /** A preset name or your own props. Default 'rise'. */
  effect?: keyof typeof presets | string | Record<string, PropValue>;
  /** 'chars' | 'words' | 'lines'. Default 'words'. */
  by?: 'chars' | 'words' | 'lines';
  /** Gap between units in ms. Default 60 (chars 28). */
  each?: number;
  staggerFrom?: StaggerOptions['from'];
}

/**
 * Splits text and plays a staggered entrance.
 * ```js
 * reveal('h1', { effect: 'rise', by: 'chars' })
 * ```
 */
export function reveal(targets: Targets, opts: RevealOptions = {}) {
  const { effect = 'rise', by = 'words', each, staggerFrom, ...anim } = opts;
  const props = typeof effect === 'string' ? presets[effect] : effect;
  if (!props) throw new Error(`[kaury-motion] Unknown reveal effect "${effect}"`);
  const needsMask = effect === 'rise' || effect === 'swing' || effect === 'flip';
  const s = split(targets, { type: by, mask: needsMask });
  if (effect === 'flip') s.units.forEach((u) => (u.parentElement!.style.perspective = '600px'));
  return animate(s.units, props, {
    duration: effect === 'type' ? 1 : 1100,
    ease: 'kaury',
    ...anim,
    delay: stagger(each ?? (by === 'chars' ? 28 : by === 'lines' ? 110 : 60), { from: staggerFrom, start: typeof anim.delay === 'number' ? anim.delay : 0 }),
  });
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\?!';

export interface ScrambleOptions extends AnimateOptions {
  /** Final text. Defaults to the element's current text. */
  text?: string;
  /** Pool of random characters. */
  chars?: string;
}

/** Decodes text from random glyphs, left to right, like a terminal. */
export function scramble(target: Targets, opts: ScrambleOptions = {}) {
  const el = toArray(target)[0] as HTMLElement;
  const final = opts.text ?? el.textContent ?? '';
  const pool = opts.chars ?? GLYPHS;
  const state = { p: 0 };
  el.setAttribute('aria-label', final);
  let lastFrame = -1;
  let cached = '';
  return animate(state, { p: [0, 1] }, {
    duration: Math.max(600, final.length * 45),
    ease: 'linear',
    ...opts,
    onUpdate: (self: any) => {
      // Re-roll random glyphs ~30 times a second, not every frame.
      const frame = Math.floor(self.currentTime / 33);
      if (frame !== lastFrame || state.p === 1) {
        lastFrame = frame;
        cached = Array.from(final)
          .map((ch, i) => (ch === ' ' || state.p >= (i + 1) / final.length ? ch : pool[(Math.random() * pool.length) | 0]))
          .join('');
        el.textContent = cached;
      }
      opts.onUpdate?.(self);
    },
  });
}

export interface CounterOptions extends AnimateOptions {
  from?: number;
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Thousands separator. Default a thin space. */
  separator?: string;
}

/** Counts a number up (or down) with formatting. */
export function counter(target: Targets, opts: CounterOptions) {
  const el = toArray(target)[0] as HTMLElement;
  const { from = 0, to, decimals = 0, prefix = '', suffix = '', separator = ' ', ...anim } = opts;
  const state = { v: from };
  const fmt = (v: number) => {
    const [int, dec] = v.toFixed(decimals).split('.');
    return prefix + int.replace(/\B(?=(\d{3})+(?!\d))/g, separator) + (dec ? '.' + dec : '') + suffix;
  };
  el.textContent = fmt(from);
  return animate(state, { v: [from, to] }, {
    duration: 1800,
    ease: 'outExpo',
    ...anim,
    onUpdate: (self: any) => {
      el.textContent = fmt(state.v);
      anim.onUpdate?.(self);
    },
  });
}

export interface WaveOptions {
  /** Height of the wave in px. Default 14. */
  amplitude?: number;
  /** One full wave in ms. Default 1400. */
  duration?: number;
  /** Phase shift between neighbours, 0..1 of a wave. Default 0.08. */
  offset?: number;
  by?: 'chars' | 'words';
  /** Also rotate each piece a little, in degrees. Default 0. */
  rotate?: number;
}

/** A never-ending wave running through the letters. Returns a function that stops it. */
export function wave(targets: Targets, opts: WaveOptions = {}) {
  const { amplitude = 14, duration = 1400, offset = 0.08, by = 'chars', rotate = 0 } = opts;
  const s = split(targets, { type: by });
  if (prefersReducedMotion()) return () => s.revert();
  const start = ticker.now();
  const stop = ticker.add((t) => {
    const phase = ((t - start) / duration) * Math.PI * 2;
    s.units.forEach((u, i) => {
      const k = Math.sin(phase - i * offset * Math.PI * 2);
      set(u, rotate ? { y: +(-k * amplitude).toFixed(2), rotate: +(k * rotate).toFixed(2) } : { y: +(-k * amplitude).toFixed(2) });
    });
  });
  return () => {
    stop();
    s.revert();
  };
}
