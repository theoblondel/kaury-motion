import { type Targets } from '../core/animate';
export interface RingOptions {
    /** Text that runs round the circle. Defaults to the element's text. */
    text?: string;
    /** Radius in px. Default 90. */
    radius?: number;
    fontSize?: number;
    /** Degrees per second; negative spins anticlockwise. Default 18. */
    speed?: number;
    /** Extra spin from scrolling. Default 0. */
    scrollBoost?: number;
    color?: string;
    fontWeight?: number | string;
    letterSpacing?: number;
}
/** Circular text badge that spins, optionally faster while the page scrolls. */
export declare function ring(target: Targets, opts?: RingOptions): {
    el: SVGSVGElement;
    destroy(): void;
};
