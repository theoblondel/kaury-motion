import { counter, reveal, scramble, wave } from './fx/text';
import { marquee } from './fx/marquee';
import { ring } from './fx/ring';
import { magnetic, tilt } from './fx/pointer';
import { inView, parallax } from './fx/scroll';
import { extrude, float } from './fx/depth';

/** Reads `data-km-*` attributes into an options object with numbers and booleans parsed. */
export function readOptions(el: HTMLElement): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, raw] of Object.entries(el.dataset)) {
    if (!k.startsWith('km') || k === 'km' || raw === undefined) continue;
    const key = k[2].toLowerCase() + k.slice(3);
    out[key] = raw === '' || raw === 'true' ? true : raw === 'false' ? false : raw.trim() !== '' && !isNaN(+raw) ? +raw : raw;
  }
  return out;
}

type Handler = (el: HTMLElement, o: Record<string, any>) => void | (() => void) | { destroy(): void };

const handlers: Record<string, Handler> = {
  marquee: (el, o) => marquee(el, o),
  ring: (el, o) => ring(el, o),
  magnetic: (el, o) => magnetic(el, o),
  tilt: (el, o) => tilt(el, o),
  parallax: (el, o) => parallax(el, o),
  extrude: (el, o) => extrude(el, o),
  float: (el, o) => float(el, o),
  scramble: (el, o) => inView(el, () => void scramble(el, o), o),
  counter: (el, o) => inView(el, () => void counter(el, { ...o, to: +o.to }), o),
  wave: (el, o) => wave(el, o),
};

/**
 * Wires up every `[data-km]` element under `root`. Several effects can be
 * combined with spaces: `data-km="extrude tilt float"`.
 *
 * Text reveals: `data-km="rise|fade|blur|flip|pop|slide|swing|zoom|type"`, with
 * `data-km-by="chars"`, `data-km-each="40"`, `data-km-delay="200"`…
 */
export function auto(root: ParentNode = document) {
  const cleanups: Array<() => void> = [];
  root.querySelectorAll<HTMLElement>('[data-km]').forEach((el) => {
    if (el.dataset.kmReady) return;
    el.dataset.kmReady = 'true';
    const o = readOptions(el);
    for (const name of (el.dataset.km || '').split(/\s+/).filter(Boolean)) {
      const h = handlers[name];
      if (h) {
        const r = h(el, o);
        if (typeof r === 'function') cleanups.push(r);
        else if (r && 'destroy' in r) cleanups.push(() => r.destroy());
        continue;
      }
      // Anything else is a reveal preset: hide now, play when in view.
      el.style.visibility = 'hidden';
      cleanups.push(
        inView(el, () => {
          el.style.visibility = '';
          reveal(el, { effect: name, ...o });
        }, o),
      );
    }
  });
  return () => cleanups.forEach((c) => c());
}
