import { ticker } from './ticker';

export interface PlaybackOptions {
  /** Number of iterations, `true` for infinite. Default 1. */
  loop?: number | boolean;
  /** Play every other iteration backwards (ping-pong). */
  yoyo?: boolean;
  /** Time multiplier. 2 plays twice as fast. */
  speed?: number;
  autoplay?: boolean;
  onBegin?: (self: any) => void;
  onUpdate?: (self: any) => void;
  onLoop?: (self: any) => void;
  onComplete?: (self: any) => void;
}

/**
 * Shared clock for tweens and timelines: play, pause, seek, reverse, loops,
 * yoyo, speed, and a `finished` promise (`await anim.finished`).
 */
export abstract class Playback {
  /** Length of one iteration in ms. */
  duration = 0;
  currentTime = 0;
  paused = true;
  reversed = false;
  completed = false;
  speed: number;
  iterations: number;
  yoyo: boolean;
  protected opts: PlaybackOptions;
  private began = false;
  private lastIteration = 0;
  private resolveFinished!: (v: any) => void;
  finished!: Promise<this>;

  constructor(opts: PlaybackOptions = {}) {
    this.opts = opts;
    this.speed = opts.speed ?? 1;
    this.iterations = opts.loop === true ? Infinity : typeof opts.loop === 'number' ? Math.max(1, opts.loop) : 1;
    this.yoyo = !!opts.yoyo;
    this.resetPromise();
  }

  private resetPromise() {
    this.finished = new Promise((r) => (this.resolveFinished = r));
  }

  get totalDuration() {
    // 0 × Infinity is NaN: a zero-length loop (e.g. under reduced motion) simply has no length.
    return this.duration === 0 ? 0 : this.duration * this.iterations;
  }

  /** 0..1 over the whole playback (all iterations). */
  get progress() {
    const total = this.totalDuration;
    return total === Infinity ? (this.currentTime % this.duration) / this.duration : total ? this.currentTime / total : 1;
  }

  protected abstract render(localTime: number): void;

  seek(time: number): this {
    const total = this.totalDuration;
    const t = Math.max(0, Math.min(time, total));
    this.currentTime = t;
    const d = this.duration;
    let iteration = d > 0 ? Math.floor(t / d) : 0;
    let local = d > 0 ? t - iteration * d : 0;
    if (d > 0 && t === total && total !== Infinity) {
      iteration = this.iterations - 1;
      local = d;
    }
    if (iteration !== this.lastIteration) {
      this.lastIteration = iteration;
      this.opts.onLoop?.(this);
    }
    if (this.yoyo && iteration % 2 === 1) local = d - local;
    this.render(local);
    this.opts.onUpdate?.(this);
    return this;
  }

  private tick = (_: number, delta: number) => {
    if (this.paused) return;
    if (!this.began) {
      this.began = true;
      this.opts.onBegin?.(this);
    }
    const next = this.currentTime + delta * this.speed * (this.reversed ? -1 : 1);
    this.seek(next);
    const done = this.reversed ? next <= 0 : next >= this.totalDuration;
    if (done) this.complete();
  };

  private complete() {
    this.paused = true;
    this.completed = true;
    ticker.remove(this.tick);
    this.opts.onComplete?.(this);
    this.resolveFinished(this);
  }

  play(): this {
    if (this.completed) {
      this.completed = false;
      this.resetPromise();
      this.seek(this.reversed ? this.totalDuration : 0);
    }
    if (this.totalDuration === 0) {
      this.render(0);
      this.opts.onUpdate?.(this);
      this.complete();
      return this;
    }
    this.paused = false;
    ticker.add(this.tick);
    return this;
  }

  pause(): this {
    this.paused = true;
    ticker.remove(this.tick);
    return this;
  }

  /** Flips direction and keeps playing from the current point. */
  reverse(): this {
    this.reversed = !this.reversed;
    if (this.completed) {
      this.completed = false;
      this.resetPromise();
    }
    return this.play();
  }

  restart(): this {
    this.pause();
    this.completed = false;
    this.began = false;
    this.resetPromise();
    this.seek(this.reversed ? this.totalDuration : 0);
    return this.play();
  }

  /** Jumps to the end state and resolves. */
  finish(): this {
    this.pause();
    if (this.totalDuration !== Infinity) this.seek(this.reversed ? 0 : this.totalDuration);
    this.complete();
    return this;
  }
}
