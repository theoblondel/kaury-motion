import { resolveEase, type EaseInput } from './ease';

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
export function stagger(each: number | [number, number], opts: StaggerOptions = {}) {
  const { from = 'first', start = 0, grid, axis } = opts;
  const ease = opts.ease ? resolveEase(opts.ease) : null;
  let cache: number[] | null = null;
  let cachedFor = -1;
  return (_el: unknown, i: number, total: number): number => {
    if (!cache || cachedFor !== total) {
      cachedFor = total;
      const origin = from === 'first' ? 0 : from === 'last' ? total - 1 : from === 'center' || from === 'edges' ? (total - 1) / 2 : typeof from === 'number' ? from : 0;
      const dist: number[] = [];
      for (let k = 0; k < total; k++) {
        if (from === 'random') dist.push(Math.random() * (total - 1));
        else if (grid) {
          const [cols] = grid;
          const ox = origin % cols, oy = Math.floor(origin / cols);
          const fx = from === 'center' ? (cols - 1) / 2 : ox;
          const fy = from === 'center' ? (grid[1] - 1) / 2 : oy;
          const dx = (k % cols) - fx, dy = Math.floor(k / cols) - fy;
          dist.push(axis === 'x' ? Math.abs(dx) : axis === 'y' ? Math.abs(dy) : Math.hypot(dx, dy));
        } else dist.push(Math.abs(origin - k));
      }
      let max = Math.max(...dist, 0);
      if (from === 'edges') {
        for (let k = 0; k < total; k++) dist[k] = max - dist[k];
        max = Math.max(...dist, 0);
      }
      cache = dist.map((d) => {
        const norm = max ? d / max : 0;
        const e = ease ? ease(norm) * max : d;
        if (Array.isArray(each)) return start + each[0] + (each[1] - each[0]) * (max ? e / max : 0);
        return start + e * each;
      });
    }
    return cache[i];
  };
}
