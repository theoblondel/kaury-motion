import { animate, toArray, type Targets } from '../core/animate';

export interface ExtrudeOptions {
  /** Thickness in px. Default 36. */
  depth?: number;
  /** Number of slices; more is smoother. Default 18. */
  layers?: number;
  /** Darkening of the deepest slice, 0..1. Default 0.45. */
  shade?: number;
}

/**
 * Gives flat content (SVG logo, image, big type) real thickness by stacking
 * shaded slices in 3D space. Pair with `tilt()` or `float()` to show it off.
 */
export function extrude(targets: Targets, opts: ExtrudeOptions = {}) {
  const { depth = 36, layers = 18, shade = 0.45 } = opts;
  const cleanups = (toArray(targets) as HTMLElement[]).map((el) => {
    const face = el.firstElementChild as HTMLElement | null;
    if (!face) return () => {};
    el.style.transformStyle = 'preserve-3d';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    face.style.transform = 'translateZ(0.5px)';
    face.style.position = 'relative';
    const slices: HTMLElement[] = [];
    for (let i = 1; i <= layers; i++) {
      const s = face.cloneNode(true) as HTMLElement;
      s.setAttribute('aria-hidden', 'true');
      s.classList.add('km-slice');
      const k = i / layers;
      s.style.position = 'absolute';
      s.style.left = face.offsetLeft + 'px';
      s.style.top = face.offsetTop + 'px';
      s.style.transform = `translateZ(${-k * depth}px)`;
      s.style.filter = `brightness(${1 - shade * (0.35 + 0.65 * k)})`;
      s.style.pointerEvents = 'none';
      el.insertBefore(s, face);
      slices.push(s);
    }
    return () => {
      slices.forEach((s) => s.remove());
      face.style.transform = '';
    };
  });
  return () => cleanups.forEach((c) => c());
}

export interface FloatOptions {
  /** Vertical travel in px. Default 14. */
  y?: number;
  /** Rocking in degrees. Default 3. */
  rotate?: number;
  /** 3D sway around the vertical axis, degrees. Default 0. */
  sway?: number;
  /** One bob in ms. Default 3600. */
  duration?: number;
}

/** Gentle idle levitation, with slightly out-of-phase loops so it never looks mechanical. */
export function float(targets: Targets, opts: FloatOptions = {}) {
  const { y = 14, rotate = 3, sway = 0, duration = 3600 } = opts;
  const loops = [
    animate(targets, { y: [-y / 2, y / 2] }, { duration: duration / 2, ease: 'inOutSine', loop: true, yoyo: true }),
    rotate ? animate(targets, { rotate: [-rotate, rotate] }, { duration: duration * 0.69, ease: 'inOutSine', loop: true, yoyo: true }) : null,
    sway ? animate(targets, { rotateY: [-sway, sway] }, { duration: duration * 0.91, ease: 'inOutSine', loop: true, yoyo: true }) : null,
  ].filter(Boolean);
  return {
    pause: () => loops.forEach((l) => l!.pause()),
    play: () => loops.forEach((l) => l!.play()),
    destroy: () => loops.forEach((l) => l!.pause()),
  };
}
