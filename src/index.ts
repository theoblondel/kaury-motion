export { animate, set, getTransform, Tween, type AnimateOptions, type PropValue, type Targets } from './core/animate';
export { timeline, Timeline, type TimelineOptions, type Position } from './core/timeline';
export { Playback, type PlaybackOptions } from './core/playback';
export { stagger, type StaggerOptions } from './core/stagger';
export { easings, cubicBezier, spring, resolveEase, type Easing, type SpringOptions } from './core/ease';
export { interpolator, clamp, lerp, mapRange } from './core/interpolate';
export { ticker, config, prefersReducedMotion } from './core/ticker';

export { split, type SplitOptions, type SplitResult } from './fx/split';
export { reveal, scramble, counter, presets, type RevealOptions, type ScrambleOptions, type CounterOptions } from './fx/text';
export { marquee, type MarqueeOptions, type MarqueeControls } from './fx/marquee';
export { ring, type RingOptions } from './fx/ring';
export { magnetic, tilt, cursor, type MagneticOptions, type TiltOptions, type CursorOptions } from './fx/pointer';
export { inView, parallax, scrub, scrollVelocity, type InViewOptions, type ParallaxOptions, type ScrubOptions } from './fx/scroll';
export { extrude, float, type ExtrudeOptions, type FloatOptions } from './fx/depth';
import { auto } from './auto';
export { auto, readOptions } from './auto';

export const version = '0.1.0';

// <script src="kaury-motion.min.js" data-auto> wires up [data-km] on load.
if (typeof document !== 'undefined') {
  const s = document.currentScript;
  if (s && s.hasAttribute('data-auto')) {
    const run = () => auto();
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();
  }
}
