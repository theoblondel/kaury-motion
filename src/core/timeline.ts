import { Tween, type AnimateOptions, type PropValue, type Targets } from './animate';
import { Playback, type PlaybackOptions } from './playback';

/**
 * Where a child starts:
 * - `500` absolute ms
 * - `'+=200'` / `'-=200'` relative to the end of the timeline so far
 * - `'<'` with the previous child, `'<+=100'` shortly after it starts
 */
export type Position = number | string;

interface Child {
  anim: Playback;
  start: number;
  touched: boolean;
}

export interface TimelineOptions extends PlaybackOptions {
  /** Options merged into every tween added with `.add(targets, props)`. */
  defaults?: AnimateOptions;
}

/** Sequences tweens (and other timelines) on one controllable clock. */
export class Timeline extends Playback {
  private children: Child[] = [];
  private defaults: AnimateOptions;
  private scheduled = false;

  constructor(opts: TimelineOptions = {}) {
    super(opts);
    this.defaults = opts.defaults ?? {};
    // Autoplay on the next microtask so the chain of .add() calls lands first.
    if (opts.autoplay !== false) {
      this.scheduled = true;
      queueMicrotask(() => this.scheduled && this.play());
    }
  }

  private resolve(pos: Position | undefined): number {
    const end = this.duration;
    const prev = this.children[this.children.length - 1];
    if (pos === undefined) return end;
    if (typeof pos === 'number') return pos;
    const m = /^(<)?([+-]=)?(-?\d*\.?\d+)?$/.exec(pos.replace(/\s/g, ''));
    if (!m) throw new Error(`[kaury-motion] Bad timeline position "${pos}"`);
    const base = m[1] ? prev?.start ?? 0 : end;
    const n = m[3] ? parseFloat(m[3]) : 0;
    if (!m[2]) return m[1] ? base + n : n;
    return m[2] === '+=' ? base + n : base - n;
  }

  /** `.add(targets, props, options?, position?)` or `.add(tweenOrTimeline, position?)` */
  add(target: Playback, position?: Position): this;
  add(targets: Targets, props: Record<string, PropValue>, opts?: AnimateOptions, position?: Position): this;
  add(a: any, b?: any, c?: any, d?: any): this {
    let anim: Playback, pos: Position | undefined;
    if (a instanceof Playback) {
      anim = a.pause();
      pos = b;
    } else {
      anim = new Tween(a, b, { ...this.defaults, ...c, autoplay: false });
      pos = d;
    }
    const start = Math.max(0, this.resolve(pos));
    this.children.push({ anim, start, touched: false });
    this.duration = Math.max(this.duration, start + anim.totalDuration);
    return this;
  }

  /** Runs a function at a point in time. */
  call(fn: () => void, position?: Position): this {
    const at = Math.max(0, this.resolve(position));
    let fired = false;
    const cb = new (class extends Playback {
      protected render(local: number) {
        if (local > 0 && !fired) (fired = true), fn();
        if (local === 0) fired = false;
      }
    })();
    cb.duration = 1;
    this.children.push({ anim: cb, start: at, touched: false });
    this.duration = Math.max(this.duration, at + 1);
    return this;
  }

  play(): this {
    this.scheduled = false;
    return super.play();
  }

  pause(): this {
    this.scheduled = false;
    return super.pause();
  }

  protected render(local: number) {
    for (const c of this.children) {
      const t = local - c.start;
      if (t >= 0) {
        c.anim.seek(t);
        c.touched = true;
      } else if (c.touched) {
        c.anim.seek(0);
        c.touched = false;
      }
    }
  }
}

export function timeline(opts?: TimelineOptions) {
  return new Timeline(opts);
}
