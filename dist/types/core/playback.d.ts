export interface PlaybackOptions {
    /** Number of iterations, `true` for infinite. Default 1. */
    loop?: number | boolean;
    /** Play every other iteration backwards (ping-pong). */
    yoyo?: boolean;
    /** Time multiplier. 2 plays twice as fast. */
    speed?: number;
    autoplay?: boolean;
    onBegin?: (self: any) => void;
    onUpdate?: (self: any) => void;
    onLoop?: (self: any) => void;
    onComplete?: (self: any) => void;
}
/**
 * Shared clock for tweens and timelines: play, pause, seek, reverse, loops,
 * yoyo, speed, and a `finished` promise (`await anim.finished`).
 */
export declare abstract class Playback {
    /** Length of one iteration in ms. */
    duration: number;
    currentTime: number;
    paused: boolean;
    reversed: boolean;
    completed: boolean;
    speed: number;
    iterations: number;
    yoyo: boolean;
    protected opts: PlaybackOptions;
    private began;
    private lastIteration;
    private resolveFinished;
    finished: Promise<this>;
    constructor(opts?: PlaybackOptions);
    private resetPromise;
    get totalDuration(): number;
    /** 0..1 over the whole playback (all iterations). */
    get progress(): number;
    protected abstract render(localTime: number): void;
    seek(time: number): this;
    private tick;
    private complete;
    play(): this;
    pause(): this;
    /** Flips direction and keeps playing from the current point. */
    reverse(): this;
    restart(): this;
    /** Jumps to the end state and resolves. */
    finish(): this;
}
