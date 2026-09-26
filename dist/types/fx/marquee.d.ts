import { type Targets } from '../core/animate';
export interface MarqueeOptions {
    /** px per second. Default 80. */
    speed?: number;
    direction?: 'left' | 'right';
    /** Space between repeats, px. Default 48. */
    gap?: number;
    /** Slow to a stop while hovered. */
    pauseOnHover?: boolean;
    /** How strongly page scrolling speeds the band up (and flips it). 0 disables. Default 0. */
    scrollBoost?: number;
    /** Lean the content in the direction of scroll speed, in degrees at full speed. Default 0. */
    skew?: number;
}
export interface MarqueeControls {
    setSpeed(pxPerSecond: number): void;
    pause(): void;
    play(): void;
    destroy(): void;
}
/** An endless, seamless band of content. Reacts to hover and scroll if asked. */
export declare function marquee(target: Targets, opts?: MarqueeOptions): MarqueeControls;
