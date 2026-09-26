import { type EaseInput } from './ease';
import { Playback, type PlaybackOptions } from './playback';
export type Targets = string | Element | ArrayLike<Element> | object | null | undefined;
type Fn<T> = (el: any, index: number, total: number) => T;
type Scalar = number | string;
export type PropValue = Scalar | [Scalar, Scalar] | Fn<Scalar | [Scalar, Scalar]> | {
    from?: Scalar;
    to: Scalar;
    duration?: number;
    delay?: number;
    ease?: EaseInput;
};
export interface AnimateOptions extends PlaybackOptions {
    /** ms, or a function per target (use `stagger()`). Default 800, or the spring's settle time. */
    duration?: number | Fn<number>;
    delay?: number | Fn<number>;
    /** Name (`kaury`, `outExpo`...), `cubic-bezier(...)`, `spring(m,k,c)` or a function. */
    ease?: EaseInput;
}
export declare function toArray(targets: Targets): any[];
/** Reads a transform value previously set by kaury-motion (or its identity). */
export declare function getTransform(el: Element, prop: string): string;
/** Instantly sets transforms through kaury-motion so later tweens start from them. */
export declare function set(targets: Targets, props: Record<string, Scalar | Fn<Scalar>>): void;
/** A tween over one or more targets. Create with `animate()`. */
export declare class Tween extends Playback {
    readonly targets: any[];
    private items;
    constructor(targets: Targets, props: Record<string, PropValue>, opts?: AnimateOptions);
    private prepare;
    private flush;
    protected render(local: number): void;
}
/**
 * Animates CSS properties, transforms (`x`, `y`, `rotate`, `scale`...), SVG
 * attributes, CSS variables or plain object values.
 *
 * ```js
 * animate('.card', { y: [40, 0], opacity: [0, 1] }, { delay: stagger(80), ease: 'kaury' })
 * ```
 */
export declare function animate(targets: Targets, props: Record<string, PropValue>, opts?: AnimateOptions): Tween;
export {};
