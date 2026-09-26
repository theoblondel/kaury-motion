import { type Targets } from '../core/animate';
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
export declare function extrude(targets: Targets, opts?: ExtrudeOptions): () => void;
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
export declare function float(targets: Targets, opts?: FloatOptions): {
    pause: () => void;
    play: () => void;
    destroy: () => void;
};
