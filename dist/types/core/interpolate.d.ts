/** Normalises colours so `#f56e2e`, `rgb()` and `rgba()` share one template. */
export declare function normalise(v: string | number): string;
export interface Parsed {
    nums: number[];
    parts: string[];
}
export declare function parse(v: string | number): Parsed;
export declare function unitOf(v: string | number): string;
/**
 * Returns an interpolator between two CSS-ish values. Numbers, units, colours,
 * and multi-number strings (`translate(10px, 5px)`, `0 0 20px rgba(...)`) are
 * blended number by number; incompatible shapes snap at the end.
 */
export declare function interpolator(from: string | number, to: string | number): (t: number) => string | number;
export declare const clamp: (v: number, lo?: number, hi?: number) => number;
export declare const lerp: (a: number, b: number, t: number) => number;
export declare const mapRange: (v: number, a: number, b: number, c: number, d: number) => number;
