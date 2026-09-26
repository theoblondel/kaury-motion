import { type Targets } from '../core/animate';
import type { Playback } from '../core/playback';
export interface InViewOptions {
    /** 0..1 share of the element that must be visible. Default 0.2. */
    threshold?: number;
    rootMargin?: string;
    /** Fire only the first time (default true). */
    once?: boolean;
}
/** Calls `onEnter` when an element scrolls into view (and `onLeave` if `once: false`). */
export declare function inView(targets: Targets, onEnter: (el: Element) => void | (() => void), opts?: InViewOptions): () => void;
/** Smoothed page scroll velocity in px per ms, shared by every scroll-reactive effect. */
export declare const scrollVelocity: {
    start: () => void;
    read: () => number;
};
export interface ParallaxOptions {
    /** Fraction of scroll distance to move. Negative moves against the scroll. Default 0.2. */
    speed?: number;
    axis?: 'x' | 'y';
}
/** Moves elements at a different speed than the page. */
export declare function parallax(targets: Targets, opts?: ParallaxOptions): () => void;
export interface ScrubOptions {
    /** Element whose position drives the animation. */
    trigger: Targets;
    /** Viewport position (0 top .. 1 bottom) where the trigger's top starts the animation. Default 1. */
    start?: number;
    /** Viewport position where the trigger's bottom ends it. Default 0. */
    end?: number;
    /** 0 = locked to the scrollbar, closer to 1 = lazier catch-up. Default 0.12. */
    smooth?: number;
}
/** Links any animation or timeline to the scroll position. */
export declare function scrub(anim: Playback, opts: ScrubOptions): () => void;
