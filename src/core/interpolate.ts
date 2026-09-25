const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

function hexToRgba(hex: string): string {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${+a.toFixed(3)})`;
}

/** Normalises colours so `#f56e2e`, `rgb()` and `rgba()` share one template. */
export function normalise(v: string | number): string {
  let s = String(v).trim();
  s = s.replace(/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, hexToRgba);
  s = s.replace(/rgb\(\s*([^,)]+),\s*([^,)]+),\s*([^,)]+)\)/g, 'rgba($1, $2, $3, 1)');
  return s;
}

export interface Parsed {
  nums: number[];
  parts: string[];
}

export function parse(v: string | number): Parsed {
  const s = normalise(v);
  const nums = (s.match(NUM) || []).map(Number);
  const parts = s.split(NUM);
  return { nums, parts };
}

export function unitOf(v: string | number): string {
  const m = /^-?\d*\.?\d+(?:e[-+]?\d+)?([a-z%]*)$/i.exec(String(v).trim());
  return m ? m[1] : '';
}

/**
 * Returns an interpolator between two CSS-ish values. Numbers, units, colours,
 * and multi-number strings (`translate(10px, 5px)`, `0 0 20px rgba(...)`) are
 * blended number by number; incompatible shapes snap at the end.
 */
export function interpolator(from: string | number, to: string | number): (t: number) => string | number {
  if (typeof from === 'number' && typeof to === 'number') return (t) => from + (to - from) * t;
  let a = parse(from);
  const b = parse(to);
  // "0" -> "100px" or "110%" -> "0px": a unitless or zero side borrows the other unit.
  let b2 = b;
  if (a.nums.length === 1 && b.nums.length === 1 && a.parts.join('|') !== b.parts.join('|')) {
    if (a.parts.join('') === '' || a.nums[0] === 0) a = { nums: a.nums, parts: b.parts };
    else if (b.parts.join('') === '' || b.nums[0] === 0) b2 = { nums: b.nums, parts: a.parts };
  }
  const bb = b2;
  if (a.nums.length !== bb.nums.length || a.parts.join('|') !== bb.parts.join('|')) {
    return (t) => (t < 1 ? from : to);
  }
  const { parts } = bb;
  // Red, green and blue channels of rgba() must stay integers; alpha must not.
  const channel: boolean[] = [];
  let prefix = '';
  for (let i = 0; i < bb.nums.length; i++) {
    prefix += parts[i];
    const open = prefix.lastIndexOf('rgba(');
    const inside = open >= 0 && prefix.indexOf(')', open) < 0;
    channel.push(inside && (prefix.slice(open).match(/,/g) || []).length < 3);
    prefix += '0';
  }
  return (t) => {
    let out = parts[0];
    for (let i = 0; i < bb.nums.length; i++) {
      const n = a.nums[i] + (bb.nums[i] - a.nums[i]) * t;
      out += (channel[i] ? Math.round(clamp(n, 0, 255)) : Math.round(n * 1e4) / 1e4) + parts[i + 1];
    }
    return out;
  };
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);
