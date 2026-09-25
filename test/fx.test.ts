import { describe, expect, it } from 'vitest';
import { split, reveal, counter, auto, readOptions, ring, marquee } from '../src';

describe('split', () => {
  it('splits words and chars, keeps an accessible label and reverts', () => {
    const el = document.createElement('h1');
    el.innerHTML = 'Hello <b>big</b> world';
    const r = split(el, { type: 'chars', mask: true });
    expect(r.words).toHaveLength(3);
    expect(r.chars.map((c) => c.textContent).join('')).toBe('Hellobigworld');
    expect(el.getAttribute('aria-label')).toBe('Hello big world');
    r.revert();
    expect(el.innerHTML).toBe('Hello <b>big</b> world');
  });
  it('reveal animates the split units', () => {
    const el = document.createElement('p');
    el.textContent = 'one two three';
    const a = reveal(el, { effect: 'fade', autoplay: false });
    expect(a.targets).toHaveLength(3);
    a.seek(a.duration);
    expect((a.targets[2] as HTMLElement).style.opacity).toBe('1');
  });
});

describe('counter', () => {
  it('formats with separators and suffix', () => {
    const el = document.createElement('span');
    const a = counter(el, { to: 12500, suffix: '+', separator: ',', autoplay: false });
    a.seek(a.duration);
    expect(el.textContent).toBe('12,500+');
  });
});

describe('ring and marquee', () => {
  it('ring builds a textPath', () => {
    const el = document.createElement('div');
    el.textContent = 'Kaury Studio · Vevey ·';
    document.body.appendChild(el);
    const r = ring(el, { radius: 60 });
    expect(el.querySelector('textPath')?.textContent).toBe('Kaury Studio · Vevey ·');
    r.destroy();
    expect(el.textContent).toBe('Kaury Studio · Vevey ·');
  });
  it('marquee wraps content in a track and restores it', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span>A</span><span>B</span>';
    document.body.appendChild(el);
    const m = marquee(el);
    expect(el.querySelector('.km-marquee-track')).not.toBeNull();
    m.destroy();
    expect(el.innerHTML).toBe('<span>A</span><span>B</span>');
  });
});

describe('auto', () => {
  it('parses data options', () => {
    const el = document.createElement('div');
    el.setAttribute('data-km', 'rise');
    el.setAttribute('data-km-each', '40');
    el.setAttribute('data-km-by', 'chars');
    el.setAttribute('data-km-once', 'false');
    expect(readOptions(el)).toEqual({ each: 40, by: 'chars', once: false });
  });
  it('wires elements once', () => {
    document.body.innerHTML = '<h2 data-km="rise">Hi there</h2>';
    auto();
    auto();
    const h = document.querySelector('h2')!;
    expect(h.dataset.kmReady).toBe('true');
    // jsdom has no IntersectionObserver, so the reveal runs straight away
    expect(h.querySelectorAll('.km-word')).toHaveLength(2);
  });
});
