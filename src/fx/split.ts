import { toArray, type Targets } from '../core/animate';

export interface SplitOptions {
  /** Any mix of 'chars', 'words', 'lines'. Default 'words'. */
  type?: string;
  /** Wraps the smallest unit in an overflow:hidden box, for "rise from nowhere" reveals. */
  mask?: boolean;
}

export interface SplitResult {
  el: HTMLElement;
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  /** The units a reveal should animate (the smallest requested). */
  units: HTMLElement[];
  revert(): void;
}

const originals = new WeakMap<HTMLElement, string>();

function span(cls: string, style: string, text?: string) {
  const s = document.createElement('span');
  s.className = cls;
  s.setAttribute('style', style);
  if (text !== undefined) s.textContent = text;
  return s;
}

const MASK_STYLE = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em';

function splitOne(el: HTMLElement, opts: SplitOptions): SplitResult {
  if (!originals.has(el)) originals.set(el, el.innerHTML);
  else el.innerHTML = originals.get(el)!;
  const type = opts.type ?? 'words';
  const wantChars = type.includes('chars');
  const wantLines = type.includes('lines');
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text.trim().replace(/\s+/g, ' '));
  el.textContent = '';

  const words: HTMLElement[] = [];
  const chars: HTMLElement[] = [];
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  tokens.forEach((token, wi) => {
    const w = span('km-word', 'display:inline-block;white-space:nowrap');
    w.setAttribute('aria-hidden', 'true');
    if (wantChars) {
      for (const ch of Array.from(token)) {
        const c = span('km-char', 'display:inline-block', ch);
        chars.push(c);
        w.appendChild(opts.mask && !wantLines ? wrapMask(c) : c);
      }
    } else w.textContent = token;
    words.push(w);
    el.appendChild(opts.mask && !wantChars && !wantLines ? wrapMask(w) : w);
    if (wi < tokens.length - 1) el.appendChild(document.createTextNode(' '));
  });

  const lines: HTMLElement[] = [];
  if (wantLines) {
    // Group words that share a baseline, then rebuild the element line by line.
    const rows: HTMLElement[][] = [];
    let top: number | null = null;
    for (const w of words) {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 2) rows.push([]), (top = t);
      rows[rows.length - 1].push(w);
    }
    el.textContent = '';
    rows.forEach((row) => {
      const line = span('km-line', 'display:block');
      const inner = span('km-line-inner', 'display:inline-block');
      row.forEach((w, i) => {
        inner.appendChild(w);
        if (i < row.length - 1) inner.appendChild(document.createTextNode(' '));
      });
      line.appendChild(inner);
      if (opts.mask) line.setAttribute('style', 'display:block;overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em');
      el.appendChild(line);
      lines.push(inner);
    });
  }

  const units = wantChars ? chars : wantLines ? lines : words;
  return {
    el,
    chars,
    words,
    lines,
    units,
    revert() {
      el.innerHTML = originals.get(el) ?? text;
      originals.delete(el);
      el.removeAttribute('aria-label');
    },
  };
}

function wrapMask(child: HTMLElement) {
  const m = span('km-mask', MASK_STYLE);
  m.appendChild(child);
  return m;
}

/**
 * Splits text into animatable spans (screen readers still read the sentence).
 * ```js
 * const { chars } = split('h1', { type: 'chars', mask: true })
 * ```
 */
export function split(targets: Targets, opts: SplitOptions = {}): SplitResult {
  const results = toArray(targets).map((el) => splitOne(el as HTMLElement, opts));
  if (results.length === 1) return results[0];
  const pick = (k: 'chars' | 'words' | 'lines' | 'units') => results.flatMap((r) => r[k]);
  return {
    el: results[0]?.el,
    chars: pick('chars'),
    words: pick('words'),
    lines: pick('lines'),
    units: pick('units'),
    revert: () => results.forEach((r) => r.revert()),
  };
}
