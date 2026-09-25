import { resolveEase, type EaseInput, type Easing } from './ease';
import { interpolator, parse, unitOf } from './interpolate';
import { Playback, type PlaybackOptions } from './playback';
import { prefersReducedMotion } from './ticker';

export type Targets = string | Element | ArrayLike<Element> | object | null | undefined;
type Fn<T> = (el: any, index: number, total: number) => T;
type Scalar = number | string;
export type PropValue =
  | Scalar
  | [Scalar, Scalar]
  | Fn<Scalar | [Scalar, Scalar]>
  | { from?: Scalar; to: Scalar; duration?: number; delay?: number; ease?: EaseInput };

export interface AnimateOptions extends PlaybackOptions {
  /** ms, or a function per target (use `stagger()`). Default 800, or the spring's settle time. */
  duration?: number | Fn<number>;
  delay?: number | Fn<number>;
  /** Name (`kaury`, `outExpo`...), `cubic-bezier(...)`, `spring(m,k,c)` or a function. */
  ease?: EaseInput;
}

export function toArray(targets: Targets): any[] {
  if (!targets) return [];
  if (typeof targets === 'string') return typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(targets));
  if (typeof Element !== 'undefined' && targets instanceof Element) return [targets];
  if (Array.isArray(targets)) return targets.flatMap((t) => toArray(t));
  if (typeof (targets as ArrayLike<Element>).length === 'number' && typeof targets !== 'function') {
    return Array.from(targets as ArrayLike<Element>);
  }
  return [targets];
}

// ---------- transforms ----------
const TRANSFORMS = ['x', 'y', 'z', 'translateX', 'translateY', 'translateZ', 'perspective', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'];
const ALIAS: Record<string, string> = { x: 'translateX', y: 'translateY', z: 'translateZ' };
const ORDER = ['perspective', 'translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'];
const defaultUnit = (p: string) => (/^(translate|perspective)/.test(p) ? 'px' : /^(rotate|skew)/.test(p) ? 'deg' : '');
const defaultValue = (p: string) => (p.startsWith('scale') ? '1' : '0' + defaultUnit(p));

const transformState = new WeakMap<Element, Record<string, string>>();
function stateOf(el: Element) {
  let s = transformState.get(el);
  if (!s) transformState.set(el, (s = {}));
  return s;
}
function writeTransform(el: HTMLElement | SVGElement) {
  const s = stateOf(el);
  let out = '';
  for (const p of ORDER) if (s[p] !== undefined) out += `${p}(${s[p]}) `;
  (el as HTMLElement).style.transform = out.trim();
}
/** Reads a transform value previously set by kaury-motion (or its identity). */
export function getTransform(el: Element, prop: string) {
  const p = ALIAS[prop] || prop;
  return stateOf(el)[p] ?? defaultValue(p);
}
/** Instantly sets transforms through kaury-motion so later tweens start from them. */
export function set(targets: Targets, props: Record<string, Scalar | Fn<Scalar>>) {
  const els = toArray(targets);
  els.forEach((el, i) => {
    for (const k in props) {
      const raw = props[k];
      const v = typeof raw === 'function' ? raw(el, i, els.length) : raw;
      const kind = kindOf(el, k);
      apply(el, k, kind, withUnit(k, kind, v));
    }
    if (isEl(el) && Object.keys(props).some((k) => TRANSFORMS.includes(k))) writeTransform(el);
  });
}

// ---------- property kinds ----------
type Kind = 'transform' | 'css' | 'attr' | 'prop';
const isEl = (t: any): t is HTMLElement => typeof Element !== 'undefined' && t instanceof Element;
const UNITLESS = new Set(['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flexGrow', 'flexShrink', 'order', 'zoom', 'fillOpacity', 'strokeOpacity', 'strokeDashoffset', 'scale']);

function kindOf(t: any, p: string): Kind {
  if (!isEl(t)) return 'prop';
  if (TRANSFORMS.includes(p)) return 'transform';
  if (p.startsWith('--') || p in (t as HTMLElement).style) return 'css';
  if (t.hasAttribute(p) || (typeof SVGElement !== 'undefined' && t instanceof SVGElement)) return 'attr';
  return 'prop';
}

function read(t: any, p: string, kind: Kind): Scalar {
  if (kind === 'transform') return getTransform(t, p);
  if (kind === 'css') {
    const cs = getComputedStyle(t);
    const v = p.startsWith('--') ? cs.getPropertyValue(p) : (cs as any)[p];
    return v === '' || v == null ? (t.style as any)[p] || '0' : v;
  }
  if (kind === 'attr') return t.getAttribute(p) ?? '0';
  return t[p] ?? 0;
}

function apply(t: any, p: string, kind: Kind, v: Scalar) {
  if (kind === 'transform') stateOf(t)[ALIAS[p] || p] = String(v);
  else if (kind === 'css') p.startsWith('--') ? t.style.setProperty(p, String(v)) : ((t.style as any)[p] = v);
  else if (kind === 'attr') t.setAttribute(p, String(v));
  else t[p] = v;
}

function withUnit(p: string, kind: Kind, v: Scalar): Scalar {
  if (typeof v !== 'number') return v;
  if (kind === 'transform') return v + defaultUnit(ALIAS[p] || p);
  if (kind === 'css' && !UNITLESS.has(p) && !p.startsWith('--')) return v + 'px';
  return v;
}

function relative(from: Scalar, to: Scalar): Scalar {
  const m = typeof to === 'string' && /^([+\-*])=(.*)$/.exec(to);
  if (!m) return to;
  const a = parse(from).nums[0] ?? 0;
  const b = parseFloat(m[2]);
  const unit = unitOf(m[2]) || unitOf(from);
  const r = m[1] === '+' ? a + b : m[1] === '-' ? a - b : a * b;
  return typeof from === 'number' && !unit ? r : r + unit;
}

interface Item {
  target: any;
  prop: string;
  kind: Kind;
  from?: Scalar;
  to: Scalar;
  delay: number;
  duration: number;
  ease: Easing;
  mix?: (t: number) => Scalar;
}

/** A tween over one or more targets. Create with `animate()`. */
export class Tween extends Playback {
  readonly targets: any[];
  private items: Item[] = [];

  constructor(targets: Targets, props: Record<string, PropValue>, opts: AnimateOptions = {}) {
    super(opts);
    this.targets = toArray(targets);
    const reduce = prefersReducedMotion();
    const n = this.targets.length;
    const baseEase = resolveEase(opts.ease);
    this.targets.forEach((target, i) => {
      const call = <T>(v: T | Fn<T> | undefined, d: T): T => (typeof v === 'function' ? (v as Fn<T>)(target, i, n) : v ?? d);
      for (const prop in props) {
        let raw: any = props[prop];
        if (typeof raw === 'function') raw = raw(target, i, n);
        const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : null;
        const ease = obj?.ease ? resolveEase(obj.ease) : baseEase;
        const kind = kindOf(target, prop);
        const pair = Array.isArray(raw) ? raw : obj ? [obj.from, obj.to] : [undefined, raw];
        const item: Item = {
          target,
          prop,
          kind,
          from: pair[0] === undefined ? undefined : withUnit(prop, kind, pair[0]),
          to: withUnit(prop, kind, pair[1]),
          delay: reduce ? 0 : obj?.delay ?? call(opts.delay, 0),
          duration: reduce ? 0 : obj?.duration ?? call(opts.duration, ease.duration ?? 800),
          ease,
        };
        // Explicit start values apply immediately so entrances don't flash.
        if (item.from !== undefined) this.prepare(item);
        this.items.push(item);
      }
    });
    this.duration = this.items.reduce((m, it) => Math.max(m, it.delay + it.duration), 0);
    if (this.items.some((it) => it.from !== undefined)) this.flush(new Set(this.items.filter((it) => it.from !== undefined)));
    if (opts.autoplay !== false) this.play();
  }

  private prepare(it: Item) {
    const from = it.from ?? read(it.target, it.prop, it.kind);
    const to = relative(from, it.to);
    it.mix = interpolator(from, to);
    if (it.from !== undefined) apply(it.target, it.prop, it.kind, it.mix(0));
  }

  private flush(items: Set<Item>) {
    const dirty = new Set<any>();
    items.forEach((it) => it.kind === 'transform' && dirty.add(it.target));
    dirty.forEach(writeTransform);
  }

  protected render(local: number) {
    const dirty = new Set<any>();
    for (const it of this.items) {
      if (!it.mix) {
        if (local < it.delay && it.from === undefined) continue;
        this.prepare(it);
      }
      const p = it.duration === 0 ? (local >= it.delay ? 1 : 0) : Math.max(0, Math.min(1, (local - it.delay) / it.duration));
      apply(it.target, it.prop, it.kind, it.mix!(it.ease(p)));
      if (it.kind === 'transform') dirty.add(it.target);
    }
    dirty.forEach(writeTransform);
  }
}

/**
 * Animates CSS properties, transforms (`x`, `y`, `rotate`, `scale`...), SVG
 * attributes, CSS variables or plain object values.
 *
 * ```js
 * animate('.card', { y: [40, 0], opacity: [0, 1] }, { delay: stagger(80), ease: 'kaury' })
 * ```
 */
export function animate(targets: Targets, props: Record<string, PropValue>, opts?: AnimateOptions) {
  return new Tween(targets, props, opts);
}
