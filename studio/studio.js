/* Kaury Motion Studio: live playground + code export for every effect. */
(function () {
  'use strict';
  const KM = window.KauryMotion;
  const $ = (s, r = document) => r.querySelector(s);
  const LOGO = $('#hero-logo svg').outerHTML.replace(' class="k-logo"', '');

  // ---------- code values ----------
  // C() marks a value that must be printed as code in the export and
  // evaluated as `value` when the studio runs it.
  const C = (code, value) => ({ __code: code, value });
  const isC = (v) => v && typeof v === 'object' && '__code' in v;
  const plain = (v) => v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
  const resolve = (v) => (isC(v) ? v.value : Array.isArray(v) ? v.map(resolve) : plain(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)])) : v);
  const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  const key = (k) => (/^[a-z_$][\w$]*$/i.test(k) ? k : q(k));
  function lit(v, ind = '') {
    if (isC(v)) return v.__code;
    if (typeof v === 'string') return q(v);
    if (typeof v !== 'object' || v === null) return String(v);
    if (Array.isArray(v)) return `[${v.map((x) => lit(x, ind)).join(', ')}]`;
    const entries = Object.entries(v).filter(([, x]) => x !== undefined);
    if (!entries.length) return '{}';
    const one = `{ ${entries.map(([k, x]) => `${key(k)}: ${lit(x, ind)}`).join(', ')} }`;
    if (one.length < 64) return one;
    const inner = ind + '  ';
    return `{\n${entries.map(([k, x]) => `${inner}${key(k)}: ${lit(x, inner)},`).join('\n')}\n${ind}}`;
  }
  const easeVal = (e) => (e.startsWith('spring') ? C(`'${e}'`, e) : e);

  // ---------- effect catalogue ----------
  const EASES = ['kaury', 'outExpo', 'outBack', 'outElastic', 'outBounce', 'inOutQuart', 'inOutSine', 'linear', 'spring(1,120,12)'];
  const BASE_CSS = `:root { --display: 'Cabinet Grotesk', 'Arial Black', sans-serif; --text: 'Satoshi', 'Helvetica Neue', Arial, sans-serif; --mono: ui-monospace, Menlo, monospace; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; overflow-x: hidden; background: #1C1A1A; color: #F1E8CB; font-family: var(--text); }`;

  const FX = [
    {
      id: 'reveal', name: 'Text reveal', tag: 'reveal()',
      hint: 'Splits the text and animates each piece. “lines” regroups words by row.',
      controls: [
        { k: 'text', type: 'text', label: 'Text', def: 'Give brands real character' },
        { k: 'effect', type: 'seg', label: 'Effect', options: ['rise', 'fade', 'blur', 'flip', 'pop', 'slide', 'swing', 'zoom'], def: 'rise' },
        { k: 'by', type: 'seg', label: 'Split by', options: ['chars', 'words', 'lines'], def: 'chars' },
        { k: 'each', type: 'range', label: 'Stagger', min: 5, max: 200, step: 1, def: 26, unit: 'ms' },
        { k: 'duration', type: 'range', label: 'Duration', min: 200, max: 3000, step: 50, def: 1100, unit: 'ms' },
        { k: 'ease', type: 'select', label: 'Easing', options: EASES, def: 'kaury' },
        { k: 'size', type: 'range', label: 'Font size', min: 24, max: 140, step: 1, def: 84, unit: 'px' },
        { k: 'color', type: 'color', label: 'Colour', def: '#F1E8CB' },
      ],
      html: (o) => `<h1 class="km-title">${esc(o.text)}</h1>`,
      css: (o) => `.km-title { margin: 0; padding: 0 6%; font: 800 ${o.size}px/0.95 var(--display); letter-spacing: -0.03em; text-align: center; color: ${o.color}; }`,
      calls: (o) => [{ fn: 'reveal', args: ['.km-title', { effect: o.effect, by: o.by, each: o.each, duration: o.duration, ease: easeVal(o.ease) }] }],
    },
    {
      id: 'scramble', name: 'Scramble', tag: 'scramble()',
      hint: 'Random glyphs lock into place from left to right.',
      controls: [
        { k: 'text', type: 'text', label: 'Text', def: 'KAURY STUDIO' },
        { k: 'pool', type: 'seg', label: 'Glyphs', options: ['symbols', 'binary', 'blocks', 'katakana'], def: 'symbols' },
        { k: 'duration', type: 'range', label: 'Duration', min: 300, max: 5000, step: 50, def: 1800, unit: 'ms' },
        { k: 'size', type: 'range', label: 'Font size', min: 20, max: 120, step: 1, def: 64, unit: 'px' },
        { k: 'color', type: 'color', label: 'Colour', def: '#F56E2E' },
      ],
      html: () => `<p class="km-scramble">&nbsp;</p>`,
      css: (o) => `.km-scramble { margin: 0; padding: 0 6%; font: 600 ${o.size}px/1.1 var(--mono); letter-spacing: 0.04em; text-align: center; color: ${o.color}; }`,
      calls: (o) => {
        const pools = { symbols: undefined, binary: '01', blocks: '▖▗▘▙▚▛▜▝▞▟', katakana: 'アイウエオカキクケコサシスセソタチツテト' };
        return [{ fn: 'scramble', args: ['.km-scramble', { text: o.text, duration: o.duration, chars: pools[o.pool] }] }];
      },
    },
    {
      id: 'counter', name: 'Counter', tag: 'counter()',
      hint: 'Counts with thousands separators, prefix and suffix.',
      controls: [
        { k: 'to', type: 'range', label: 'Count to', min: 10, max: 100000, step: 10, def: 12500 },
        { k: 'prefix', type: 'text', label: 'Prefix', def: '' },
        { k: 'suffix', type: 'text', label: 'Suffix', def: '+' },
        { k: 'decimals', type: 'seg', label: 'Decimals', options: ['0', '1', '2'], def: '0' },
        { k: 'duration', type: 'range', label: 'Duration', min: 300, max: 5000, step: 50, def: 2200, unit: 'ms' },
        { k: 'ease', type: 'select', label: 'Easing', options: EASES, def: 'outExpo' },
        { k: 'size', type: 'range', label: 'Font size', min: 30, max: 200, step: 1, def: 140, unit: 'px' },
        { k: 'color', type: 'color', label: 'Colour', def: '#F1E8CB' },
      ],
      html: () => `<div class="km-count">0</div>`,
      css: (o) => `.km-count { font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: ${o.color}; }`,
      calls: (o) => [{ fn: 'counter', args: ['.km-count', { to: o.to, prefix: o.prefix || undefined, suffix: o.suffix || undefined, decimals: +o.decimals || undefined, duration: o.duration, ease: easeVal(o.ease) }] }],
    },
    {
      id: 'marquee', name: 'Marquee', tag: 'marquee()',
      hint: 'Scroll the page: the band speeds up, leans and follows your direction.',
      controls: [
        { k: 'words', type: 'text', label: 'Words (comma separated)', def: 'Branding, Web design, Video, Photography, Social media' },
        { k: 'speed', type: 'range', label: 'Speed', min: 10, max: 400, step: 5, def: 110, unit: 'px/s' },
        { k: 'direction', type: 'seg', label: 'Direction', options: ['left', 'right'], def: 'left' },
        { k: 'gap', type: 'range', label: 'Gap', min: 10, max: 140, step: 2, def: 40, unit: 'px' },
        { k: 'scrollBoost', type: 'range', label: 'Scroll boost', min: 0, max: 4, step: 0.1, def: 1.2 },
        { k: 'skew', type: 'range', label: 'Scroll lean', min: 0, max: 20, step: 1, def: 8, unit: '°' },
        { k: 'pauseOnHover', type: 'toggle', label: 'Slow down on hover', def: true },
        { k: 'size', type: 'range', label: 'Font size', min: 20, max: 140, step: 1, def: 72, unit: 'px' },
        { k: 'bg', type: 'color', label: 'Band colour', def: '#F56E2E' },
        { k: 'color', type: 'color', label: 'Text colour', def: '#1C1A1A' },
      ],
      html: (o) => `<div class="km-band">\n  ${o.words.split(',').map((w) => w.trim()).filter(Boolean).map((w) => `<span>${esc(w)}</span><i></i>`).join('\n  ')}\n</div>`,
      css: (o) => `.km-band { width: 100%; display: flex; align-items: center; padding-block: 22px; background: ${o.bg}; color: ${o.color}; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.02em; text-transform: uppercase; white-space: nowrap; }
.km-band i { width: 0.45em; height: 0.45em; flex: none; background: currentColor; clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); }`,
      calls: (o) => [{ fn: 'marquee', args: ['.km-band', { speed: o.speed, direction: o.direction, gap: o.gap, scrollBoost: o.scrollBoost, skew: o.skew, pauseOnHover: o.pauseOnHover }] }],
    },
    {
      id: 'ring', name: 'Text ring', tag: 'ring()',
      hint: 'Circular text that spins. Add scroll boost and scroll the page.',
      controls: [
        { k: 'text', type: 'text', label: 'Text', def: 'Kaury Studio · Vevey · Switzerland ·' },
        { k: 'radius', type: 'range', label: 'Radius', min: 60, max: 220, step: 1, def: 150, unit: 'px' },
        { k: 'fontSize', type: 'range', label: 'Font size', min: 10, max: 32, step: 1, def: 17, unit: 'px' },
        { k: 'speed', type: 'range', label: 'Spin', min: -180, max: 180, step: 1, def: 24, unit: '°/s' },
        { k: 'scrollBoost', type: 'range', label: 'Scroll boost', min: 0, max: 3, step: 0.1, def: 1 },
        { k: 'logo', type: 'toggle', label: 'Logo in the middle', def: true },
        { k: 'color', type: 'color', label: 'Colour', def: '#F1E8CB' },
      ],
      html: (o) => `<div class="km-ring-wrap">\n  <div class="km-ring">${esc(o.text)}</div>${o.logo ? `\n  <div class="km-ring-logo">${LOGO}</div>` : ''}\n</div>`,
      css: (o) => `.km-ring-wrap { position: relative; display: grid; place-items: center; color: ${o.color}; font-family: var(--text); }
.km-ring-wrap > * { grid-area: 1 / 1; }
.km-ring-logo { width: ${Math.round(o.radius * 0.9)}px; }
.km-ring-logo svg { display: block; width: 100%; height: auto; }`,
      calls: (o) => [{ fn: 'ring', args: ['.km-ring', { radius: o.radius, fontSize: o.fontSize, speed: o.speed, scrollBoost: o.scrollBoost || undefined }] }],
    },
    {
      id: 'magnetic', name: 'Magnetic', tag: 'magnetic()',
      hint: 'Move your cursor near the button. The label moves further for depth.',
      controls: [
        { k: 'label', type: 'text', label: 'Label', def: 'Start a project' },
        { k: 'strength', type: 'range', label: 'Pull', min: 0.05, max: 1, step: 0.05, def: 0.45 },
        { k: 'radius', type: 'range', label: 'Reach', min: 0, max: 240, step: 5, def: 100, unit: 'px' },
        { k: 'stiffness', type: 'range', label: 'Snap', min: 2, max: 30, step: 1, def: 10 },
        { k: 'size', type: 'range', label: 'Size', min: 100, max: 280, step: 2, def: 190, unit: 'px' },
        { k: 'bg', type: 'color', label: 'Colour', def: '#F56E2E' },
      ],
      html: (o) => `<button class="km-magnet" type="button"><span>${esc(o.label)}</span></button>`,
      css: (o) => `.km-magnet { display: grid; place-items: center; width: ${o.size}px; height: ${o.size}px; padding: 20px; border: 0; border-radius: 50%; background: ${o.bg}; color: #1C1A1A; font: 800 ${Math.round(o.size / 8.5)}px/1 var(--display); cursor: pointer; }
.km-magnet span { display: block; pointer-events: none; }`,
      calls: (o) => [{ fn: 'magnetic', args: ['.km-magnet', { strength: o.strength, radius: o.radius, stiffness: o.stiffness, inner: 'span' }] }],
    },
    {
      id: 'tilt', name: '3D tilt card', tag: 'tilt()',
      hint: 'Hover the card: it tilts towards the pointer with a moving reflection.',
      controls: [
        { k: 'title', type: 'text', label: 'Card title', def: 'Make it impossible to confuse' },
        { k: 'max', type: 'range', label: 'Max tilt', min: 2, max: 40, step: 1, def: 16, unit: '°' },
        { k: 'perspective', type: 'range', label: 'Perspective', min: 300, max: 2000, step: 50, def: 900, unit: 'px' },
        { k: 'scale', type: 'range', label: 'Hover scale', min: 1, max: 1.2, step: 0.01, def: 1.05 },
        { k: 'glare', type: 'toggle', label: 'Glare', def: true },
        { k: 'bg', type: 'color', label: 'Card colour', def: '#F56E2E' },
      ],
      html: (o) => `<article class="km-card">\n  <span>Kaury Studio</span>\n  <b>${esc(o.title)}</b>\n  <span>Vevey · CH</span>\n</article>`,
      css: (o) => `.km-card { width: min(320px, 70vw); aspect-ratio: 3 / 4; padding: 26px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; background: ${o.bg}; color: #1C1A1A; box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.7); }
.km-card b { font: 800 40px/0.95 var(--display); letter-spacing: -0.03em; }
.km-card span { font: 700 12px/1 var(--text); letter-spacing: 0.16em; text-transform: uppercase; }`,
      calls: (o) => [{ fn: 'tilt', args: ['.km-card', { max: o.max, perspective: o.perspective, scale: o.scale, glare: o.glare }] }],
    },
    {
      id: 'extrude', name: '3D logo', tag: 'extrude()',
      hint: 'A flat SVG gets real thickness. It sways on its own; hover to turn it further.',
      controls: [
        { k: 'depth', type: 'range', label: 'Thickness', min: 0, max: 120, step: 1, def: 44, unit: 'px' },
        { k: 'layers', type: 'range', label: 'Slices', min: 2, max: 40, step: 1, def: 24 },
        { k: 'shade', type: 'range', label: 'Side shading', min: 0, max: 0.9, step: 0.05, def: 0.5 },
        { k: 'tilt', type: 'toggle', label: 'Tilt on hover', def: true },
        { k: 'max', type: 'range', label: 'Max tilt', min: 5, max: 45, step: 1, def: 30, unit: '°' },
        { k: 'float', type: 'toggle', label: 'Float', def: true },
        { k: 'sway', type: 'range', label: 'Idle sway', min: 0, max: 45, step: 1, def: 30, unit: '°' },
      ],
      html: () => `<div class="km-scene">\n  <div class="km-logo">${LOGO}</div>\n</div>`,
      css: () => `.km-scene { display: grid; place-items: center; padding: 60px; perspective: 900px; }
.km-logo { width: min(240px, 50vw); }
.km-logo svg { display: block; width: 100%; height: auto; }`,
      calls: (o) => [
        { fn: 'extrude', args: ['.km-logo', { depth: o.depth, layers: o.layers, shade: o.shade }] },
        o.tilt && { fn: 'tilt', args: ['.km-scene', { max: o.max, glare: false, scale: 1 }] },
        o.float
          ? { fn: 'float', args: ['.km-logo', { y: 18, rotate: 3, sway: o.sway }] }
          : { fn: 'set', args: ['.km-logo', { rotateY: -o.sway, rotateX: 8 }] },
      ].filter(Boolean),
    },
    {
      id: 'stagger', name: 'Stagger grid', tag: 'stagger()',
      hint: 'Click any dot to send a wave from it.',
      controls: [
        { k: 'cols', type: 'range', label: 'Columns', min: 4, max: 22, step: 1, def: 16 },
        { k: 'rows', type: 'range', label: 'Rows', min: 3, max: 12, step: 1, def: 9 },
        { k: 'from', type: 'seg', label: 'Wave starts at', options: ['center', 'first', 'last', 'edges', 'random'], def: 'center' },
        { k: 'look', type: 'seg', label: 'Look', options: ['pop', 'spin', 'lift', 'flare'], def: 'flare' },
        { k: 'each', type: 'range', label: 'Stagger', min: 5, max: 150, step: 1, def: 55, unit: 'ms' },
        { k: 'duration', type: 'range', label: 'Duration', min: 200, max: 3000, step: 50, def: 1200, unit: 'ms' },
        { k: 'ease', type: 'select', label: 'Easing', options: EASES, def: 'outElastic' },
      ],
      html: (o) => `<div class="km-grid">\n  ${'<i></i>'.repeat(o.cols * o.rows)}\n</div>`,
      css: (o) => `.km-grid { display: grid; grid-template-columns: repeat(${o.cols}, 14px); gap: 12px; }
.km-grid i { display: block; width: 14px; height: 14px; border-radius: 50%; background: #F1E8CB; cursor: pointer; }`,
      looks: {
        pop: { scale: [0, 1] },
        spin: { rotate: [180, 0], scale: [0.2, 1], borderRadius: ['0%', '50%'] },
        lift: { y: [-40, 0], opacity: [0, 1] },
        flare: { scale: [2.2, 1], backgroundColor: ['#F56E2E', '#F1E8CB'] },
      },
      script(o) {
        const props = lit(this.looks[o.look], '  ');
        const ease = o.ease.startsWith('spring') ? `'${o.ease}'` : `'${o.ease}'`;
        return `const dots = document.querySelectorAll('.km-grid i');

function wave(from) {
  animate(dots, ${props}, {
    delay: stagger(${o.each}, { grid: [${o.cols}, ${o.rows}], from }),
    duration: ${o.duration},
    ease: ${ease},
  });
}

wave('${o.from}');
dots.forEach((dot, i) => dot.addEventListener('click', () => wave(i)));`;
      },
      run(o, stage, track) {
        const dots = stage.querySelectorAll('.km-grid i');
        const wave = (from) => track(KM.animate(dots, this.looks[o.look], { delay: KM.stagger(o.each, { grid: [o.cols, o.rows], from }), duration: o.duration, ease: o.ease }));
        wave(o.from);
        dots.forEach((d, i) => d.addEventListener('click', () => wave(i)));
      },
      uses: ['animate', 'stagger'],
    },
    {
      id: 'timeline', name: 'Timeline', tag: 'timeline()',
      hint: 'Three steps on one clock. Overlap makes them flow into each other.',
      controls: [
        { k: 'title', type: 'text', label: 'Title', def: 'Motion with character' },
        { k: 'overlap', type: 'range', label: 'Overlap', min: 0, max: 900, step: 25, def: 500, unit: 'ms' },
        { k: 'speed', type: 'range', label: 'Speed', min: 0.25, max: 3, step: 0.05, def: 1, unit: '×' },
        { k: 'ease', type: 'select', label: 'Easing', options: EASES, def: 'kaury' },
        { k: 'loop', type: 'toggle', label: 'Loop back and forth', def: true },
      ],
      html: (o) => `<div class="km-tl">\n  <div class="km-tl-logo">${LOGO}</div>\n  <h2>${o.title.split(/\s+/).filter(Boolean).map((w) => `<span>${esc(w)}</span>`).join(' ')}</h2>\n  <span class="km-tl-pill">kaury.studio →</span>\n</div>`,
      css: () => `.km-tl { display: grid; justify-items: center; gap: 22px; text-align: center; }
.km-tl-logo { width: 110px; }
.km-tl-logo svg { display: block; width: 100%; height: auto; }
.km-tl h2 { margin: 0; overflow: hidden; padding: 0 6% 0.08em; font: 800 clamp(34px, 6vw, 72px)/0.95 var(--display); letter-spacing: -0.03em; }
.km-tl h2 span { display: inline-block; }
.km-tl-pill { padding: 12px 22px; border-radius: 999px; background: #F1E8CB; color: #1C1A1A; font: 700 15px/1 var(--text); }`,
      calls: (o) => [{
        fn: 'timeline',
        args: [{ defaults: { ease: easeVal(o.ease) }, speed: o.speed === 1 ? undefined : o.speed, loop: o.loop || undefined, yoyo: o.loop || undefined }],
        chain: [
          ['add', '.km-tl-logo', { scale: [0, 1], rotate: [-120, 0] }, { duration: 1200, ease: C(`spring({ stiffness: 160, damping: 11 })`, KM.spring({ stiffness: 160, damping: 11 })) }],
          ['add', '.km-tl h2 span', { y: ['110%', '0%'] }, { duration: 1000, delay: C('stagger(70)', KM.stagger(70)) }, `-=${o.overlap}`],
          ['add', '.km-tl-pill', { opacity: [0, 1], y: [24, 0], scale: [0.8, 1] }, { duration: 900 }, `-=${Math.round(o.overlap * 0.8)}`],
        ],
      }],
    },
    {
      id: 'spring', name: 'Spring physics', tag: 'spring()',
      hint: 'The curve is the real physics. Less damping means more bounce.',
      controls: [
        { k: 'mass', type: 'range', label: 'Mass', min: 0.2, max: 5, step: 0.1, def: 1 },
        { k: 'stiffness', type: 'range', label: 'Stiffness', min: 20, max: 600, step: 5, def: 180 },
        { k: 'damping', type: 'range', label: 'Damping', min: 1, max: 60, step: 0.5, def: 9 },
      ],
      html: () => `<div class="km-spring">\n  <div class="km-track"><div class="km-ball"></div></div>\n</div>`,
      css: () => `.km-spring { width: min(640px, 86vw); }
.km-track { position: relative; height: 72px; border-bottom: 1px dashed rgba(241, 232, 203, 0.25); }
.km-ball { position: absolute; left: 0; bottom: 8px; width: 56px; height: 56px; border-radius: 16px; background: #F56E2E; }`,
      calls: (o) => {
        const code = `spring({ mass: ${o.mass}, stiffness: ${o.stiffness}, damping: ${o.damping} })`;
        return [{
          fn: 'animate',
          args: ['.km-ball', { x: C('(el) => el.parentElement.clientWidth - el.offsetWidth', (el) => el.parentElement.clientWidth - el.offsetWidth) }, { ease: C(code, KM.spring(o)), loop: true, yoyo: true }],
        }];
      },
      after(o, stage) {
        const s = KM.spring(o);
        const cv = document.createElement('canvas');
        cv.className = 'km-curve';
        cv.setAttribute('aria-label', 'Spring curve');
        cv.style.cssText = 'display:block;width:100%;height:140px;margin-top:26px';
        stage.querySelector('.km-spring').appendChild(cv);
        const w = (cv.width = cv.clientWidth * 2), h = (cv.height = 280);
        const g = cv.getContext('2d');
        let peak = 1;
        for (let i = 0; i <= 200; i++) peak = Math.max(peak, s(i / 200));
        const pad = 20, top = 16, base = h - 40;
        const y = (v) => base - (v / peak) * (base - top);
        g.strokeStyle = 'rgba(241,232,203,.18)';
        g.setLineDash([6, 8]);
        g.beginPath(); g.moveTo(0, y(1)); g.lineTo(w, y(1)); g.stroke();
        g.setLineDash([]);
        g.strokeStyle = '#F56E2E'; g.lineWidth = 4;
        g.beginPath();
        for (let i = 0; i <= 200; i++) { const t = i / 200; const X = pad + t * (w - pad * 2); i ? g.lineTo(X, y(s(t))) : g.moveTo(X, y(s(t))); }
        g.stroke();
        g.fillStyle = 'rgba(241,232,203,.6)'; g.font = '600 22px ui-monospace, monospace';
        g.textAlign = 'right';
        g.fillText(`settles in ${s.duration} ms · peak ${(peak * 100).toFixed(0)}%`, w - pad, h - 8);
      },
    },
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  }

  // ---------- state ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const values = {};
  FX.forEach((fx) => (values[fx.id] = Object.fromEntries(fx.controls.map((c) => [c.k, c.def]))));
  let current = FX.find((f) => f.id === (location.hash.slice(1) || store.get('km-fx'))) || FX[0];
  let tab = 'js';
  let cleanups = [];

  const stage = $('#stage');
  const style = document.createElement('style');
  document.head.appendChild(style);

  // ---------- running ----------
  function track(r) {
    if (!r) return r;
    if (typeof r === 'function') cleanups.push(r);
    else if (typeof r.destroy === 'function') cleanups.push(() => r.destroy());
    else if (typeof r.pause === 'function') cleanups.push(() => r.pause());
    return r;
  }
  function stop() {
    cleanups.forEach((c) => { try { c(); } catch { /* already gone */ } });
    cleanups = [];
  }
  function mount() {
    stop();
    const o = values[current.id];
    style.textContent = current.css(o).replace(/(^|\})\s*([^{}@]+)\{/g, (m, a, sel) => `${a}\n${sel.split(',').map((s) => '#stage ' + s.trim()).join(', ')} {`);
    stage.innerHTML = current.html(o);
    if (current.run) current.run(o, stage, track);
    else for (const c of current.calls(o)) {
      let r = track(KM[c.fn](...resolve(scopeArgs(c.args))));
      for (const [m, ...args] of c.chain || []) r = r[m](...resolve(scopeArgs(args)));
    }
    current.after?.(o, stage);
    renderCode();
  }
  // Selectors in the calls are page-level; scope them to the stage.
  const scopeArgs = (args) => args.map((a) => (typeof a === 'string' && /^[.#]/.test(a) ? stage.querySelectorAll(a) : a));

  // ---------- code export ----------
  function usedNames(fx, o) {
    const names = new Set(fx.uses || []);
    const walk = (v) => {
      if (isC(v)) (v.__code.match(/\b(stagger|spring)\(/g) || []).forEach((m) => names.add(m.slice(0, -1)));
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    if (!fx.run) for (const c of fx.calls(o)) { names.add(c.fn); walk(c.args); (c.chain || []).forEach(walk); }
    return [...names];
  }
  function jsBody(fx, o) {
    if (fx.script) return fx.script(o);
    return fx.calls(o).map((c) => {
      let s = `${c.fn}(${c.args.map((a) => lit(a)).join(', ')})`;
      for (const [m, ...args] of c.chain || []) s += `\n  .${m}(${args.map((a) => lit(a, '  ')).join(', ')})`;
      return s;
    }).join('\n');
  }
  function jsModule(fx, o) {
    return `import { ${usedNames(fx, o).join(', ')} } from 'kaury-motion';\n\n${jsBody(fx, o)}\n`;
  }
  async function libSource() {
    const el = $('#km-lib');
    if (!el.src) return el.textContent.trim();
    try { return (await (await fetch(el.src)).text()).trim(); } catch { return `/* Paste kaury-motion.min.js here */`; }
  }
  async function fullPage(fx, o) {
    const lib = await libSource();
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fx.name} · Kaury Motion</title>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700&f[]=satoshi@500,700&display=swap">
<style>
${BASE_CSS}
${fx.css(o)}
</style>
</head>
<body>
${fx.html(o)}

<script>${lib}</script>
<script>
const { ${usedNames(fx, o).join(', ')} } = KauryMotion;

${jsBody(fx, o)}
</script>
</body>
</html>
`;
  }
  function htmlSnippet(fx, o) {
    return `<!-- markup -->\n${fx.html(o)}\n\n<style>\n${fx.css(o)}\n</style>\n\n<script src="kaury-motion.min.js"></script>\n<script>\nconst { ${usedNames(fx, o).join(', ')} } = KauryMotion;\n\n${jsBody(fx, o)}\n</script>\n`;
  }
  async function codeFor(t) {
    const o = values[current.id];
    if (t === 'js') return jsModule(current, o);
    if (t === 'html') return htmlSnippet(current, o);
    return fullPage(current, o);
  }

  function highlight(src, lang) {
    const out = [];
    const re = lang === 'js'
      ? /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(import|from|const|let|function|return|new|true|false|undefined)\b|(\b\d+(?:\.\d+)?\b)|\b([a-zA-Z_$][\w$]*)(?=\()/g
      : /(<!--[\s\S]*?-->)|("(?:[^"\\]|\\.)*")|(<\/?[a-zA-Z][\w-]*|\/?>)|()()/g;
    let last = 0, m;
    while ((m = re.exec(src))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      out.push(esc(src.slice(last, m.index)));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? (lang === 'js' ? 'k' : 't') : m[4] ? 'n' : 't';
      out.push(`<span class="${cls}">${esc(m[0])}</span>`);
      last = re.lastIndex;
    }
    out.push(esc(src.slice(last)));
    return out.join('');
  }

  let codeCache = '';
  async function renderCode() {
    const t = tab;
    const src = await codeFor(t);
    if (t !== tab) return;
    codeCache = src;
    const shown = t === 'file' ? src.replace(/<script>[^\n]{400,}<\/script>/, '<script>/* Kaury Motion (framework inlined here, ~27 KB) */</script>') : src;
    $('#code code').innerHTML = highlight(shown, t === 'js' ? 'js' : 'html');
  }

  // ---------- controls ----------
  function renderControls() {
    const form = $('#controls');
    const o = values[current.id];
    form.innerHTML = current.controls.map((c) => {
      const id = `c-${current.id}-${c.k}`;
      const v = o[c.k];
      let field = '';
      if (c.type === 'range') field = `<input type="range" id="${id}" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${v}">`;
      if (c.type === 'text') field = `<input type="text" id="${id}" data-k="${c.k}" value="${esc(v)}" autocomplete="off" spellcheck="false">`;
      if (c.type === 'color') field = `<input type="color" id="${id}" data-k="${c.k}" value="${v}">`;
      if (c.type === 'select') field = `<select id="${id}" data-k="${c.k}">${c.options.map((x) => `<option${x === v ? ' selected' : ''}>${x}</option>`).join('')}</select>`;
      if (c.type === 'seg') field = `<div class="seg" role="group" aria-labelledby="${id}-l">${c.options.map((x) => `<button type="button" data-k="${c.k}" data-v="${x}" aria-pressed="${x === v}">${x}</button>`).join('')}</div>`;
      if (c.type === 'toggle') return `<div class="ctl"><label class="toggle" for="${id}"><input type="checkbox" id="${id}" data-k="${c.k}"${v ? ' checked' : ''}> ${c.label}</label></div>`;
      const out = c.type === 'range' ? `<output id="${id}-o">${fmt(v, c)}</output>` : '';
      const lab = c.type === 'seg' ? `<span class="lbl" id="${id}-l">${c.label}</span>` : `<label for="${id}">${c.label}</label>`;
      return `<div class="ctl"><div class="ctl-head">${lab}${out}</div>${field}</div>`;
    }).join('') + `<div class="ctl"><button type="button" class="chip" id="reset">Reset to defaults</button></div>`;
  }
  const fmt = (v, c) => `${v}${c.unit ? (c.unit === '×' || c.unit === '°' ? c.unit : ' ' + c.unit) : ''}`;

  let debounce;
  function change(k, v, instant) {
    const c = current.controls.find((x) => x.k === k);
    values[current.id][k] = c.type === 'range' ? +v : v;
    if (c.type === 'range') $(`#c-${current.id}-${k}-o`).textContent = fmt(+v, c);
    clearTimeout(debounce);
    debounce = setTimeout(mount, instant ? 0 : 160);
  }
  $('#controls').addEventListener('input', (e) => {
    const t = e.target;
    if (!t.dataset.k) return;
    change(t.dataset.k, t.type === 'checkbox' ? t.checked : t.value, t.type === 'checkbox' || t.tagName === 'SELECT');
  });
  $('#controls').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'reset') {
      values[current.id] = Object.fromEntries(current.controls.map((c) => [c.k, c.def]));
      renderControls();
      return mount();
    }
    if (b.dataset.v === undefined) return;
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    change(b.dataset.k, b.dataset.v, true);
  });
  $('#controls').addEventListener('submit', (e) => e.preventDefault());

  // ---------- effect list ----------
  function renderList() {
    $('#fx-list').innerHTML = FX.map((f) => `<button type="button" class="fx-item" data-id="${f.id}" aria-current="${f === current}">${f.name}<small>${f.tag}</small></button>`).join('');
  }
  $('#fx-list').addEventListener('click', (e) => {
    const b = e.target.closest('.fx-item');
    if (!b) return;
    select(FX.find((f) => f.id === b.dataset.id));
  });
  function select(fx) {
    current = fx;
    store.set('km-fx', fx.id);
    $('#stage-name').textContent = fx.name;
    $('#stage-hint').textContent = fx.hint;
    renderList();
    renderControls();
    mount();
  }

  // ---------- export actions ----------
  document.querySelectorAll('.tab').forEach((b) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab;
      document.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      renderCode();
    }),
  );
  function flash(btn, text) {
    const was = btn.dataset.label || btn.textContent;
    btn.dataset.label = was;
    btn.textContent = text;
    setTimeout(() => (btn.textContent = was), 1600);
  }
  $('#copy').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const text = await codeFor(tab);
    try {
      await navigator.clipboard.writeText(text);
      flash(btn, 'Copied');
    } catch {
      const r = document.createRange();
      r.selectNodeContents($('#code code'));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      flash(btn, 'Selected, press Ctrl+C');
    }
  });
  // Inside claude.ai the page asks the viewer's permission to save;
  // anywhere else a plain blob download does the job.
  const hosted = window.claude && typeof window.claude.use === 'function';
  const downloads = hosted ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  if (hosted) downloads.then((d) => ($('#download').hidden = !d));
  $('#download').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const html = await fullPage(current, values[current.id]);
    const filename = `kaury-motion-${current.id}.html`;
    const d = await downloads;
    if (d) {
      try {
        await d.save({ filename, data: html });
        flash(btn, 'Saved');
      } catch (err) {
        flash(btn, err && err.code === 'declined' ? 'Cancelled' : 'Use Copy code instead');
      }
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    flash(btn, 'Downloading');
  });
  $('#replay').addEventListener('click', mount);

  // ---------- hero ----------
  function hero() {
    KM.reveal('#hero-title', { effect: 'rise', by: 'chars', each: 32, duration: 1300 });
    KM.animate('#hero-dot', { scale: [0, 1] }, { delay: 700, ease: KM.spring({ stiffness: 260, damping: 9 }) });
    const art = $('.hero-art');
    const r = Math.max(90, art.clientWidth / 2 - 30);
    KM.ring('#hero-ring', { radius: r, fontSize: Math.max(12, r / 11), speed: 16, scrollBoost: 1.5 });
    KM.extrude('#hero-logo', { depth: 42, layers: 22, shade: 0.5 });
    KM.tilt('.hero-art', { max: 22, glare: false, scale: 1, perspective: 1100 });
    KM.float('#hero-logo', { y: 16, rotate: 3, sway: 24 });
    KM.magnetic('.hero-actions .btn', { strength: 0.3, radius: 40 });
    document.querySelectorAll('[data-count]').forEach((el, i) =>
      KM.counter(el, { to: +el.dataset.count, delay: 600 + i * 120, duration: 1600 }),
    );
    KM.marquee('#band', { speed: 90, gap: 40, scrollBoost: 1.2, skew: 8 });
  }
  let stopCursor = () => {};
  function cursorOn(on) {
    stopCursor();
    stopCursor = on ? KM.cursor({ color: '#F1E8CB', blend: 'difference', size: 16 }) : () => {};
    store.set('km-cursor', on ? '1' : '0');
  }
  $('#cursor-toggle').checked = store.get('km-cursor') !== '0';
  $('#cursor-toggle').addEventListener('change', (e) => cursorOn(e.target.checked));

  hero();
  cursorOn($('#cursor-toggle').checked);
  select(current);
})();
