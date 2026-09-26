import { type Targets } from '../core/animate';
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
/**
 * Splits text into animatable spans (screen readers still read the sentence).
 * ```js
 * const { chars } = split('h1', { type: 'chars', mask: true })
 * ```
 */
export declare function split(targets: Targets, opts?: SplitOptions): SplitResult;
