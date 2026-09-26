import { type EaseInput } from './ease';
export interface StaggerOptions {
    /** Where the wave starts: 'first' | 'last' | 'center' | 'edges' | 'random' | index. */
    from?: 'first' | 'last' | 'center' | 'edges' | 'random' | number;
    /** Added to every value. */
    start?: number;
    /** Distributes the delays along a curve instead of evenly. */
    ease?: EaseInput;
    /** Treat targets as a [columns, rows] grid and ripple outwards in 2D. */
    grid?: [number, number];
    axis?: 'x' | 'y';
}
/**
 * Builds per-target values that grow with distance from an origin.
 * `stagger(60)` → 0, 60, 120… · `stagger([0, 400])` spreads a range.
 */
export declare function stagger(each: number | [number, number], opts?: StaggerOptions): (_el: unknown, i: number, total: number) => number;
