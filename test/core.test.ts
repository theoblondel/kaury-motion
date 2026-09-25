import { describe, expect, it } from 'vitest';
import { animate, config, cubicBezier, easings, interpolator, resolveEase, set, spring, stagger, timeline, getTransform } from '../src';

describe('easing', () => {
  it('cubic-bezier matches endpoints and linear identity', () => {
    const e = cubicBezier(0.16, 1, 0.3, 1);
    expect(e(0)).toBe(0);
    expect(e(1)).toBe(1);
    expect(e(0.5)).toBeGreaterThan(0.9);
    expect(cubicBezier(0, 0, 1, 1)(0.3)).toBeCloseTo(0.3);
  });
  it('resolves names and functional strings', () => {
    expect(resolveEase('outQuad')(0.5)).toBe(0.75);
    expect(resolveEase('cubic-bezier(0,0,1,1)')(0.4)).toBeCloseTo(0.4, 4);
    expect(() => resolveEase('nope')).toThrow(/Unknown easing/);
  });
  it('spring settles at 1 and reports a duration', () => {
    const s = spring({ stiffness: 200, damping: 10 });
    expect(s.duration).toBeGreaterThan(200);
    expect(s(1)).toBe(1);
    // an underdamped spring overshoots
    const peak = Math.max(...Array.from({ length: 100 }, (_, i) => s(i / 100)));
    expect(peak).toBeGreaterThan(1);
  });
  it('all named easings start at 0 and end at 1', () => {
    for (const [name, e] of Object.entries(easings)) {
      expect(e(0), name).toBeCloseTo(0, 5);
      expect(e(1), name).toBeCloseTo(1, 5);
    }
  });
});

describe('interpolator', () => {
  it('blends units, colours and multi-value strings', () => {
    expect(interpolator('0px', '100px')(0.25)).toBe('25px');
    expect(interpolator(0, '10rem')(0.5)).toBe('5rem');
    expect(interpolator('110%', '0px')(0.5)).toBe('55%');
    expect(interpolator('#000000', '#ffffff')(0.5)).toBe('rgba(128, 128, 128, 1)');
    expect(interpolator('rgba(0, 0, 0, 0)', '#F56E2E')(1)).toBe('rgba(245, 110, 46, 1)');
    expect(interpolator('blur(12px)', 'blur(0px)')(0.5)).toBe('blur(6px)');
  });
  it('keeps alpha fractional', () => {
    expect(interpolator('rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)')(0.5)).toBe('rgba(0, 0, 0, 0.5)');
  });
  it('snaps incompatible values at the end', () => {
    const f = interpolator('auto', '10px');
    expect(f(0.5)).toBe('auto');
    expect(f(1)).toBe('10px');
  });
});

describe('animate', () => {
  it('tweens object values when seeked', () => {
    const o = { v: 0 };
    const a = animate(o, { v: 100 }, { duration: 1000, ease: 'linear', autoplay: false });
    a.seek(250);
    expect(o.v).toBe(25);
    a.seek(1000);
    expect(o.v).toBe(100);
  });
  it('writes composed transforms in a stable order', () => {
    const el = document.createElement('div');
    const a = animate(el, { x: [0, 100], rotate: [0, 90], scale: [1, 2] }, { duration: 100, ease: 'linear', autoplay: false });
    a.seek(50);
    expect(el.style.transform).toBe('translateX(50px) rotate(45deg) scale(1.5)');
    expect(getTransform(el, 'x')).toBe('50px');
  });
  it('applies explicit from values immediately', () => {
    const el = document.createElement('div');
    animate(el, { opacity: [0, 1] }, { duration: 500, autoplay: false });
    expect(el.style.opacity).toBe('0');
  });
  it('supports relative values and per-target functions', () => {
    const els = [0, 1, 2].map(() => document.createElement('div'));
    set(els, { x: 10 });
    const a = animate(els, { x: '+=20' }, { duration: 100, delay: stagger(100), ease: 'linear', autoplay: false });
    expect(a.duration).toBe(300);
    a.seek(300);
    expect(els.map((e) => e.style.transform)).toEqual(['translateX(30px)', 'translateX(30px)', 'translateX(30px)']);
  });
  it('yoyo loops come back to the start', () => {
    const o = { v: 0 };
    const a = animate(o, { v: [0, 10] }, { duration: 100, ease: 'linear', loop: 2, yoyo: true, autoplay: false });
    expect(a.totalDuration).toBe(200);
    a.seek(150);
    expect(o.v).toBe(5);
    a.seek(200);
    expect(o.v).toBe(0);
  });
  it('infinite loops with zero duration finish at the end state (reduced motion)', async () => {
    config.reducedMotion = 'always';
    const o = { v: 0 };
    const a = animate(o, { v: [0, 10] }, { duration: 500, loop: true, yoyo: true });
    config.reducedMotion = 'auto';
    expect(a.totalDuration).toBe(0);
    await a.finished;
    expect(o.v).toBe(10);
  });
  it('runs on the ticker and resolves finished', async () => {
    const o = { v: 0 };
    const a = animate(o, { v: 1 }, { duration: 40 });
    await a.finished;
    expect(o.v).toBe(1);
    expect(a.completed).toBe(true);
  });
});

describe('stagger', () => {
  it('spreads from first, center and grid', () => {
    const s = stagger(100);
    expect([0, 1, 2].map((i) => s(null, i, 3))).toEqual([0, 100, 200]);
    const c = stagger(100, { from: 'center' });
    expect([0, 1, 2].map((i) => c(null, i, 3))).toEqual([100, 0, 100]);
    const r = stagger([0, 1000]);
    expect(r(null, 4, 5)).toBe(1000);
    const g = stagger(10, { grid: [3, 3], from: 'center' });
    expect(g(null, 4, 9)).toBe(0);
    expect(g(null, 0, 9)).toBeCloseTo(Math.SQRT2 * 10);
  });
});

describe('timeline', () => {
  it('sequences children with relative positions', () => {
    const o = { a: 0, b: 0 };
    const tl = timeline({ autoplay: false, defaults: { ease: 'linear' } })
      .add(o, { a: [0, 1] }, { duration: 100 })
      .add(o, { b: [0, 1] }, { duration: 100 }, '-=50');
    expect(tl.duration).toBe(150);
    tl.seek(75);
    expect(o.a).toBe(0.75);
    expect(o.b).toBe(0.25);
    tl.seek(0);
    expect(o.b).toBe(0);
  });
  it('fires calls once when passed', () => {
    let n = 0;
    const tl = timeline({ autoplay: false }).call(() => n++, 100);
    tl.seek(50);
    tl.seek(150);
    tl.seek(160);
    expect(n).toBe(1);
  });
});
