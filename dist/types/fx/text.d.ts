import { type AnimateOptions, type PropValue, type Targets } from '../core/animate';
import { type StaggerOptions } from '../core/stagger';
/** Ready-made entrance looks. Each is a set of `animate()` props. */
export declare const presets: Record<string, Record<string, PropValue>>;
export interface RevealOptions extends AnimateOptions {
    /** A preset name or your own props. Default 'rise'. */
    effect?: keyof typeof presets | string | Record<string, PropValue>;
    /** 'chars' | 'words' | 'lines'. Default 'words'. */
    by?: 'chars' | 'words' | 'lines';
    /** Gap between units in ms. Default 60 (chars 28). */
    each?: number;
    staggerFrom?: StaggerOptions['from'];
}
/**
 * Splits text and plays a staggered entrance.
 * ```js
 * reveal('h1', { effect: 'rise', by: 'chars' })
 * ```
 */
export declare function reveal(targets: Targets, opts?: RevealOptions): import("..").Tween;
export interface ScrambleOptions extends AnimateOptions {
    /** Final text. Defaults to the element's current text. */
    text?: string;
    /** Pool of random characters. */
    chars?: string;
}
/** Decodes text from random glyphs, left to right, like a terminal. */
export declare function scramble(target: Targets, opts?: ScrambleOptions): import("..").Tween;
export interface CounterOptions extends AnimateOptions {
    from?: number;
    to: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    /** Thousands separator. Default a thin space. */
    separator?: string;
}
/** Counts a number up (or down) with formatting. */
export declare function counter(target: Targets, opts: CounterOptions): import("..").Tween;
export interface WaveOptions {
    /** Height of the wave in px. Default 14. */
    amplitude?: number;
    /** One full wave in ms. Default 1400. */
    duration?: number;
    /** Phase shift between neighbours, 0..1 of a wave. Default 0.08. */
    offset?: number;
    by?: 'chars' | 'words';
    /** Also rotate each piece a little, in degrees. Default 0. */
    rotate?: number;
}
/** A never-ending wave running through the letters. Returns a function that stops it. */
export declare function wave(targets: Targets, opts?: WaveOptions): () => void;
