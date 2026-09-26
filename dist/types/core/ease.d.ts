export type Easing = ((t: number) => number) & {
    duration?: number;
};
/** CSS-compatible cubic-bezier, solved with Newton-Raphson then bisection. */
export declare function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing;
export interface SpringOptions {
    mass?: number;
    stiffness?: number;
    damping?: number;
    velocity?: number;
}
/**
 * Physical damped spring used as an easing. The returned function carries a
 * `duration` (ms) long enough for the spring to settle, which `animate()`
 * uses when no explicit duration is given.
 */
export declare function spring({ mass, stiffness, damping, velocity }?: SpringOptions): Easing;
export declare const easings: Record<string, Easing>;
export type EaseInput = string | Easing | undefined;
/** Accepts a name, `cubic-bezier(a,b,c,d)`, `spring(mass,stiffness,damping,velocity)` or a function. */
export declare function resolveEase(e: EaseInput): Easing;
