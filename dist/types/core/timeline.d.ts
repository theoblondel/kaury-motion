import { type AnimateOptions, type PropValue, type Targets } from './animate';
import { Playback, type PlaybackOptions } from './playback';
/**
 * Where a child starts:
 * - `500` absolute ms
 * - `'+=200'` / `'-=200'` relative to the end of the timeline so far
 * - `'<'` with the previous child, `'<+=100'` shortly after it starts
 */
export type Position = number | string;
export interface TimelineOptions extends PlaybackOptions {
    /** Options merged into every tween added with `.add(targets, props)`. */
    defaults?: AnimateOptions;
}
/** Sequences tweens (and other timelines) on one controllable clock. */
export declare class Timeline extends Playback {
    private children;
    private defaults;
    private scheduled;
    constructor(opts?: TimelineOptions);
    private resolve;
    /** `.add(targets, props, options?, position?)` or `.add(tweenOrTimeline, position?)` */
    add(target: Playback, position?: Position): this;
    add(targets: Targets, props: Record<string, PropValue>, opts?: AnimateOptions, position?: Position): this;
    /** Runs a function at a point in time. */
    call(fn: () => void, position?: Position): this;
    play(): this;
    pause(): this;
    protected render(local: number): void;
}
export declare function timeline(opts?: TimelineOptions): Timeline;
