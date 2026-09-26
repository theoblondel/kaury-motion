export type TickFn = (time: number, delta: number) => void;
declare const now: () => number;
/** One shared requestAnimationFrame loop for every animation and effect. */
export declare const ticker: {
    add(fn: TickFn): () => void;
    remove(fn: TickFn): void;
    now: typeof now;
};
export declare const config: {
    /** 'auto' follows the OS "reduce motion" setting; 'always' / 'never' force it. */
    reducedMotion: 'auto' | 'always' | 'never';
};
export declare function prefersReducedMotion(): boolean;
export {};
