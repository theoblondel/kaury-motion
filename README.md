# Kaury Motion

Spectacular web animation in one small file, by [Kaury Studio](https://kaury.studio).

A zero-dependency motion framework: a tween engine with real springs, timelines and staggers, plus ready-made effects (split-text reveals, marquees, text rings, magnetic buttons, 3D tilt, 3D extrusion, scramble, counters, scroll-linked animation) and a visual **studio** where you tune every effect and export the code.

- **~11 KB** gzipped, **0** dependencies, TypeScript types included
- ESM build and a `<script>` build exposing `KauryMotion`
- Respects the OS "reduce motion" setting automatically
- 26 unit tests

## The studio

`studio/index.html` is a playground for every effect, written in French for non-developers: pick an effect by what it is for, start from a ready-made style (or hit *Surprise*), tune it, then download a **standalone page** with the framework inlined, copy a self-contained block for WordPress / Webflow / Wix, or copy the ES module code.

```bash
npm install
npm run build
npx serve .        # then open http://localhost:3000/studio/
```

`node studio/bundle.mjs out.html` builds the studio as one self-contained file.

## Quick start

With a bundler:

```js
import { animate, stagger, reveal } from 'kaury-motion';

reveal('h1', { effect: 'rise', by: 'chars' });
animate('.card', { y: [60, 0], opacity: [0, 1] }, { delay: stagger(80) });
```

Without JavaScript, using data attributes:

```html
<script src="dist/kaury-motion.min.js" data-auto></script>

<h1 data-km="rise" data-km-by="chars">Give brands character</h1>
<div data-km="marquee" data-km-speed="120" data-km-scroll-boost="1">…</div>
<div data-km="extrude tilt float" data-km-depth="40"><svg>…</svg></div>
```

## Core API

| Function | What it does |
|---|---|
| `animate(targets, props, options)` | Tweens CSS properties, transforms (`x`, `y`, `rotate`, `scale`…), SVG attributes, CSS variables or plain objects. Values can be `[from, to]`, relative (`'+=100'`) or per-target functions. Colours and units blend. |
| `timeline(options)` | `.add(targets, props, options, position)` sequences tweens. Positions: `500`, `'+=200'`, `'-=200'`, `'<'`. `.call(fn, position)` runs code at a moment. |
| `stagger(each, { from, grid, ease })` | Per-target delays from `first`, `last`, `center`, `edges`, `random` or an index, in 1D or 2D grids. |
| `spring({ mass, stiffness, damping })` | Physical spring easing; its settle time becomes the duration. Also as a string: `'spring(1,120,12)'`. |
| `set(targets, props)` | Applies values instantly, keeping transforms composable. |

Every tween and timeline can `play()`, `pause()`, `seek(ms)`, `reverse()`, `restart()`, `finish()`, has `loop`, `yoyo`, `speed`, callbacks (`onBegin`, `onUpdate`, `onLoop`, `onComplete`) and a `finished` promise.

Easings: `kaury` (the house curve), `linear`, `in/out/inOut` + `Quad`, `Cubic`, `Quart`, `Quint`, `Sine`, `Expo`, `inBack`, `outBack`, `outElastic`, `outBounce`, `cubic-bezier(…)`, `spring(…)` or any function.

## Effects

| Effect | Notes |
|---|---|
| `split(el, { type, mask })` | Chars, words or lines, screen-reader friendly, `revert()` restores the markup. |
| `reveal(el, { effect, by, each })` | Presets: `rise`, `fade`, `blur`, `flip`, `pop`, `slide`, `swing`, `zoom`, `type` (typewriter). |
| `wave(el, { amplitude, duration, offset, rotate })` | A never-ending wave running through the letters. |
| `scramble(el, { text, chars })` | Decodes text from random glyphs. |
| `counter(el, { to, prefix, suffix, decimals })` | Formatted count-up. |
| `marquee(el, { speed, direction, scrollBoost, skew, pauseOnHover })` | Seamless infinite band, reacts to scroll speed and direction. |
| `ring(el, { text, radius, speed, scrollBoost })` | Spinning circular text. |
| `magnetic(el, { strength, radius, inner })` | Elements pulled towards the cursor. |
| `tilt(el, { max, perspective, glare })` | 3D tilt with a moving reflection. |
| `extrude(el, { depth, layers, shade })` | Gives flat SVG, images or type real thickness. Pair with `tilt` or `float`. |
| `float(el, { y, rotate, sway })` | Idle levitation. |
| `cursor({ color, blend, hoverScale })` | Custom cursor with labels from `data-km-cursor`. |
| `inView`, `parallax`, `scrub(animation, { trigger })` | Scroll triggers, parallax and scroll-linked playback. |

Ongoing effects return a function (or `{ destroy }`) that stops them.

## Development

```bash
npm test          # vitest + jsdom
npm run typecheck
npm run build     # dist/kaury-motion.js (ESM), dist/kaury-motion.min.js (script), dist/types
```

## Licence

MIT © Théo Blondel, Kaury Studio
