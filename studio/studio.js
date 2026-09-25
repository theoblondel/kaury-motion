/* Kaury Motion Studio : aperçu en direct et export du code pour chaque effet. */
(function () {
  'use strict';
  const KM = window.KauryMotion;
  const $ = (s, r = document) => r.querySelector(s);
  const LOGO = $('#hero-logo svg').outerHTML.replace(' class="k-logo"', '');

  // ---------- valeurs « code » ----------
  // C() marque une valeur qui s'écrit comme du code dans l'export et
  // s'évalue comme `value` quand le studio la joue.
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
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  }

  // ---------- vocabulaire partagé ----------
  const EASES = [
    ['kaury', 'Kaury (doux)'],
    ['outExpo', 'Freinage net'],
    ['outBack', 'Petit dépassement'],
    ['outElastic', 'Élastique'],
    ['outBounce', 'Rebond'],
    ['inOutQuart', 'Démarre et freine'],
    ['inOutSine', 'Très doux'],
    ['linear', 'Constant'],
    ['spring(1,120,12)', 'Ressort'],
  ];
  const EASE_HELP = 'La façon dont ça accélère et freine.';
  const PALETTE = ['#F1E8CB', '#F56E2E', '#1C1A1A', '#3D5C3D', '#FFFFFF', '#F7C548'];
  const GROUPS = ['Texte', 'Mouvement', 'Souris et 3D', 'Avancé'];

  const BASE_CSS = `:root { --display: 'Cabinet Grotesk', 'Arial Black', sans-serif; --text: 'Satoshi', 'Helvetica Neue', Arial, sans-serif; --mono: ui-monospace, Menlo, monospace; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; overflow-x: hidden; background: #1C1A1A; color: #F1E8CB; font-family: var(--text); }`;

  // ---------- catalogue des effets ----------
  const FX = [
    {
      id: 'reveal', group: 'Texte', name: 'Titre qui apparaît', use: 'Pour un grand titre d’accueil qui arrive avec style.',
      tip: null,
      controls: [
        { k: 'text', type: 'text', label: 'Ton texte', def: 'Donne du caractère à ta marque' },
        { k: 'effect', type: 'seg', label: 'Style d’apparition', options: [['rise', 'Monte'], ['fade', 'Fondu'], ['blur', 'Flou'], ['flip', 'Bascule'], ['pop', 'Pop'], ['slide', 'Glisse'], ['swing', 'Balance'], ['zoom', 'Zoom'], ['type', 'Machine à écrire']], def: 'rise' },
        { k: 'by', type: 'seg', label: 'Animer', options: [['chars', 'Lettre par lettre'], ['words', 'Mot par mot'], ['lines', 'Ligne par ligne']], def: 'chars' },
        { k: 'each', type: 'range', label: 'Écart entre chaque morceau', help: 'Plus c’est grand, plus le titre se dévoile lentement.', min: 5, max: 200, step: 1, def: 26, unit: 'ms' },
        { k: 'duration', type: 'range', label: 'Durée de chaque morceau', min: 200, max: 3000, step: 50, def: 1100, unit: 'ms' },
        { k: 'ease', type: 'select', label: 'Mouvement', help: EASE_HELP, options: EASES, def: 'kaury' },
        { k: 'size', type: 'range', label: 'Taille du texte', min: 24, max: 140, step: 1, def: 84, unit: 'px' },
        { k: 'color', type: 'color', label: 'Couleur du texte', def: '#F1E8CB' },
      ],
      presets: [
        ['Élégant', { effect: 'rise', by: 'words', each: 90, duration: 1400, ease: 'kaury' }],
        ['Punchy', { effect: 'pop', by: 'chars', each: 22, duration: 900, ease: 'outBack' }],
        ['Machine à écrire', { effect: 'type', by: 'chars', each: 55, ease: 'linear' }],
        ['Cinéma', { effect: 'blur', by: 'words', each: 160, duration: 1800, ease: 'inOutQuart' }],
      ],
      html: (o) => `<h1 class="km-title">${esc(o.text)}</h1>`,
      css: (o) => `.km-title { margin: 0; padding: 0 6%; font: 800 ${o.size}px/0.95 var(--display); letter-spacing: -0.03em; text-align: center; color: ${o.color}; }`,
      calls: (o) => [{ fn: 'reveal', args: ['.km-title', { effect: o.effect, by: o.by, each: o.each, duration: o.effect === 'type' ? undefined : o.duration, ease: o.ease }] }],
    },
    {
      id: 'wave', group: 'Texte', name: 'Texte en vague', use: 'Pour un slogan qui bouge en continu et attire l’œil.',
      tip: null,
      controls: [
        { k: 'text', type: 'text', label: 'Ton texte', def: 'Toujours en mouvement' },
        { k: 'amplitude', type: 'range', label: 'Hauteur de la vague', min: 2, max: 60, step: 1, def: 16, unit: 'px' },
        { k: 'duration', type: 'range', label: 'Vitesse', help: 'Temps pour une vague complète. Plus petit = plus rapide.', min: 400, max: 5000, step: 50, def: 1600, unit: 'ms' },
        { k: 'offset', type: 'range', label: 'Longueur de la vague', help: 'Petit = une longue houle, grand = des vaguelettes.', min: 0.01, max: 0.3, step: 0.01, def: 0.07 },
        { k: 'rotate', type: 'range', label: 'Balancement des lettres', min: 0, max: 30, step: 1, def: 0, unit: '°' },
        { k: 'size', type: 'range', label: 'Taille du texte', min: 24, max: 140, step: 1, def: 76, unit: 'px' },
        { k: 'color', type: 'color', label: 'Couleur du texte', def: '#F56E2E' },
      ],
      presets: [
        ['Houle', { amplitude: 14, duration: 2400, offset: 0.04, rotate: 0 }],
        ['Joyeux', { amplitude: 22, duration: 1100, offset: 0.1, rotate: 10 }],
        ['Nerveux', { amplitude: 8, duration: 600, offset: 0.18, rotate: 4 }],
      ],
      html: (o) => `<p class="km-wave">${esc(o.text)}</p>`,
      css: (o) => `.km-wave { margin: 0; padding: 0 6%; font: 800 ${o.size}px/1.1 var(--display); letter-spacing: -0.02em; text-align: center; color: ${o.color}; }`,
      calls: (o) => [{ fn: 'wave', args: ['.km-wave', { amplitude: o.amplitude, duration: o.duration, offset: o.offset, rotate: o.rotate || undefined }] }],
    },
    {
      id: 'scramble', group: 'Texte', name: 'Texte qui se décode', use: 'Pour un effet tech ou agence créative.',
      tip: null,
      controls: [
        { k: 'text', type: 'text', label: 'Ton texte', def: 'KAURY STUDIO' },
        { k: 'pool', type: 'seg', label: 'Caractères au hasard', options: [['symbols', 'Symboles'], ['binary', '0 et 1'], ['blocks', 'Blocs'], ['katakana', 'Japonais']], def: 'symbols' },
        { k: 'duration', type: 'range', label: 'Durée', min: 300, max: 5000, step: 50, def: 1800, unit: 'ms' },
        { k: 'size', type: 'range', label: 'Taille du texte', min: 20, max: 120, step: 1, def: 64, unit: 'px' },
        { k: 'color', type: 'color', label: 'Couleur du texte', def: '#F56E2E' },
      ],
      presets: [
        ['Hacker', { pool: 'binary', duration: 2600, color: '#8DB58D' }],
        ['Rapide', { pool: 'symbols', duration: 700 }],
        ['Tokyo', { pool: 'katakana', duration: 2000, color: '#F1E8CB' }],
      ],
      html: () => `<p class="km-scramble">&nbsp;</p>`,
      css: (o) => `.km-scramble { margin: 0; padding: 0 6%; font: 600 ${o.size}px/1.1 var(--mono); letter-spacing: 0.04em; text-align: center; color: ${o.color}; }`,
      calls: (o) => {
        const pools = { symbols: undefined, binary: '01', blocks: '▖▗▘▙▚▛▜▝▞▟', katakana: 'アイウエオカキクケコサシスセソタチツテト' };
        return [{ fn: 'scramble', args: ['.km-scramble', { text: o.text, duration: o.duration, chars: pools[o.pool] }] }];
      },
    },
    {
      id: 'counter', group: 'Texte', name: 'Chiffre qui compte', use: 'Pour tes chiffres clés : clients, projets, années.',
      tip: null,
      controls: [
        { k: 'to', type: 'range', label: 'Nombre final', min: 10, max: 100000, step: 10, def: 12500 },
        { k: 'prefix', type: 'text', label: 'Avant le nombre', help: 'Par exemple « CHF » ou « + ».', def: '' },
        { k: 'suffix', type: 'text', label: 'Après le nombre', help: 'Par exemple « + », « % » ou « clients ».', def: '+' },
        { k: 'decimals', type: 'seg', label: 'Décimales', options: [['0', 'Aucune'], ['1', '1'], ['2', '2']], def: '0' },
        { k: 'duration', type: 'range', label: 'Durée', min: 300, max: 5000, step: 50, def: 2200, unit: 'ms' },
        { k: 'ease', type: 'select', label: 'Mouvement', help: EASE_HELP, options: EASES, def: 'outExpo' },
        { k: 'size', type: 'range', label: 'Taille', min: 30, max: 200, step: 1, def: 140, unit: 'px' },
        { k: 'color', type: 'color', label: 'Couleur', def: '#F1E8CB' },
      ],
      presets: [
        ['Clients', { to: 250, prefix: '', suffix: '+', decimals: '0' }],
        ['Pourcentage', { to: 98, prefix: '', suffix: '%', decimals: '0', ease: 'outBack' }],
        ['Chiffre d’affaires', { to: 48500, prefix: 'CHF ', suffix: '', decimals: '0' }],
      ],
      html: () => `<div class="km-count">0</div>`,
      css: (o) => `.km-count { font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: ${o.color}; }`,
      calls: (o) => [{ fn: 'counter', args: ['.km-count', { to: o.to, prefix: o.prefix || undefined, suffix: o.suffix || undefined, decimals: +o.decimals || undefined, duration: o.duration, ease: o.ease }] }],
    },
    {
      id: 'marquee', group: 'Mouvement', name: 'Bandeau défilant', use: 'Pour lister tes services ou tes clients en continu.',
      tip: 'Fais défiler la page : le bandeau accélère et penche',
      controls: [
        { k: 'words', type: 'text', label: 'Tes mots', help: 'Sépare-les par des virgules.', def: 'Branding, Web design, Vidéo, Photo, Réseaux sociaux' },
        { k: 'speed', type: 'range', label: 'Vitesse', min: 10, max: 400, step: 5, def: 110, unit: 'px/s' },
        { k: 'direction', type: 'seg', label: 'Sens', options: [['left', 'Vers la gauche'], ['right', 'Vers la droite']], def: 'left' },
        { k: 'gap', type: 'range', label: 'Espace entre les mots', min: 10, max: 140, step: 2, def: 40, unit: 'px' },
        { k: 'scrollBoost', type: 'range', label: 'Réaction au défilement', help: 'À 0, le bandeau ignore le scroll de la page.', min: 0, max: 4, step: 0.1, def: 1.2 },
        { k: 'skew', type: 'range', label: 'Penche quand on défile', min: 0, max: 20, step: 1, def: 8, unit: '°' },
        { k: 'pauseOnHover', type: 'toggle', label: 'Ralentir au survol de la souris', def: true },
        { k: 'size', type: 'range', label: 'Taille du texte', min: 20, max: 140, step: 1, def: 72, unit: 'px' },
        { k: 'bg', type: 'color', label: 'Couleur du bandeau', def: '#F56E2E' },
        { k: 'color', type: 'color', label: 'Couleur du texte', def: '#1C1A1A' },
      ],
      presets: [
        ['Calme', { speed: 50, scrollBoost: 0.4, skew: 0 }],
        ['Énergique', { speed: 220, scrollBoost: 2.5, skew: 14 }],
        ['Discret', { speed: 70, size: 32, bg: '#1C1A1A', color: '#F1E8CB', scrollBoost: 0.8, skew: 4 }],
      ],
      html: (o) => `<div class="km-band">\n  ${o.words.split(',').map((w) => w.trim()).filter(Boolean).map((w) => `<span>${esc(w)}</span><i></i>`).join('\n  ')}\n</div>`,
      css: (o) => `.km-band { width: 100%; display: flex; align-items: center; padding-block: 22px; background: ${o.bg}; color: ${o.color}; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.02em; text-transform: uppercase; white-space: nowrap; }
.km-band i { width: 0.45em; height: 0.45em; flex: none; background: currentColor; clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); }`,
      calls: (o) => [{ fn: 'marquee', args: ['.km-band', { speed: o.speed, direction: o.direction, gap: o.gap, scrollBoost: o.scrollBoost, skew: o.skew, pauseOnHover: o.pauseOnHover }] }],
    },
    {
      id: 'ring', group: 'Mouvement', name: 'Badge rotatif', use: 'Pour un badge « Disponible » ou autour de ton logo.',
      tip: 'Fais défiler la page pour le faire tourner plus vite',
      controls: [
        { k: 'text', type: 'text', label: 'Ton texte', help: 'Termine par « · » pour que la boucle se raccorde bien.', def: 'Kaury Studio · Vevey · Suisse ·' },
        { k: 'radius', type: 'range', label: 'Taille du cercle', min: 60, max: 220, step: 1, def: 150, unit: 'px' },
        { k: 'fontSize', type: 'range', label: 'Taille du texte', min: 10, max: 32, step: 1, def: 17, unit: 'px' },
        { k: 'speed', type: 'range', label: 'Vitesse de rotation', help: 'Négatif = sens inverse.', min: -180, max: 180, step: 1, def: 24, unit: '°/s' },
        { k: 'scrollBoost', type: 'range', label: 'Réaction au défilement', min: 0, max: 3, step: 0.1, def: 1 },
        { k: 'logo', type: 'toggle', label: 'Logo au centre', def: true },
        { k: 'color', type: 'color', label: 'Couleur du texte', def: '#F1E8CB' },
      ],
      presets: [
        ['Badge', { radius: 90, fontSize: 13, speed: 40, logo: true }],
        ['Grand anneau', { radius: 200, fontSize: 20, speed: 12, logo: true }],
        ['Sens inverse', { speed: -60, scrollBoost: 2 }],
      ],
      html: (o) => `<div class="km-ring-wrap">\n  <div class="km-ring">${esc(o.text)}</div>${o.logo ? `\n  <div class="km-ring-logo">${LOGO}</div>` : ''}\n</div>`,
      css: (o) => `.km-ring-wrap { position: relative; display: grid; place-items: center; color: ${o.color}; font-family: var(--text); }
.km-ring-wrap > * { grid-area: 1 / 1; }
.km-ring-logo { width: ${Math.round(o.radius * 0.9)}px; }
.km-ring-logo svg { display: block; width: 100%; height: auto; }`,
      calls: (o) => [{ fn: 'ring', args: ['.km-ring', { radius: o.radius, fontSize: o.fontSize, speed: o.speed, scrollBoost: o.scrollBoost || undefined }] }],
    },
    {
      id: 'stagger', group: 'Mouvement', name: 'Vague de points', use: 'Un fond animé qui fait « waouh » au premier regard.',
      tip: 'Clique sur un point pour lancer une vague depuis lui',
      controls: [
        { k: 'cols', type: 'range', label: 'Colonnes', min: 4, max: 22, step: 1, def: 16 },
        { k: 'rows', type: 'range', label: 'Lignes', min: 3, max: 12, step: 1, def: 9 },
        { k: 'from', type: 'seg', label: 'La vague part', options: [['center', 'Du centre'], ['first', 'Du début'], ['last', 'De la fin'], ['edges', 'Des bords'], ['random', 'Au hasard']], def: 'center' },
        { k: 'look', type: 'seg', label: 'Effet', options: [['flare', 'Éclat'], ['pop', 'Pop'], ['spin', 'Tourne'], ['lift', 'Tombe']], def: 'flare' },
        { k: 'each', type: 'range', label: 'Vitesse de la vague', help: 'Temps entre deux points voisins.', min: 5, max: 150, step: 1, def: 55, unit: 'ms' },
        { k: 'duration', type: 'range', label: 'Durée par point', min: 200, max: 3000, step: 50, def: 1200, unit: 'ms' },
        { k: 'ease', type: 'select', label: 'Mouvement', help: EASE_HELP, options: EASES, def: 'outElastic' },
      ],
      presets: [
        ['Onde', { from: 'center', look: 'flare', each: 55, ease: 'outElastic' }],
        ['Pluie', { from: 'random', look: 'lift', each: 20, ease: 'outBounce' }],
        ['Tourbillon', { from: 'edges', look: 'spin', each: 40, ease: 'kaury' }],
      ],
      looks: {
        pop: { scale: [0, 1] },
        spin: { rotate: [180, 0], scale: [0.2, 1], borderRadius: ['0%', '50%'] },
        lift: { y: [-40, 0], opacity: [0, 1] },
        flare: { scale: [2.2, 1], backgroundColor: ['#F56E2E', '#F1E8CB'] },
      },
      html: (o) => `<div class="km-grid">\n  ${'<i></i>'.repeat(o.cols * o.rows)}\n</div>`,
      css: (o) => `.km-grid { display: grid; grid-template-columns: repeat(${o.cols}, 14px); gap: 12px; }
.km-grid i { display: block; width: 14px; height: 14px; border-radius: 50%; background: #F1E8CB; cursor: pointer; }`,
      script(o) {
        return `const dots = document.querySelectorAll('.km-grid i');

function wave(from) {
  animate(dots, ${lit(this.looks[o.look], '  ')}, {
    delay: stagger(${o.each}, { grid: [${o.cols}, ${o.rows}], from }),
    duration: ${o.duration},
    ease: '${o.ease}',
  });
}

wave('${o.from}');
dots.forEach((dot, i) => dot.addEventListener('click', () => wave(i)));`;
      },
      run(o, stage, track) {
        const dots = stage.querySelectorAll('.km-grid i');
        const go = (from) => track(KM.animate(dots, this.looks[o.look], { delay: KM.stagger(o.each, { grid: [o.cols, o.rows], from }), duration: o.duration, ease: o.ease }));
        go(o.from);
        dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
      },
      uses: ['animate', 'stagger'],
    },
    {
      id: 'magnetic', group: 'Souris et 3D', name: 'Bouton aimanté', use: 'Pour tes boutons d’action : « Contact », « Réserver »…',
      tip: 'Approche ta souris du bouton',
      controls: [
        { k: 'label', type: 'text', label: 'Texte du bouton', def: 'Démarrer un projet' },
        { k: 'strength', type: 'range', label: 'Force de l’aimant', min: 0.05, max: 1, step: 0.05, def: 0.45 },
        { k: 'radius', type: 'range', label: 'Distance d’attraction', help: 'À partir de quand le bouton sent la souris.', min: 0, max: 240, step: 5, def: 100, unit: 'px' },
        { k: 'stiffness', type: 'range', label: 'Réactivité', min: 2, max: 30, step: 1, def: 10 },
        { k: 'size', type: 'range', label: 'Taille', min: 100, max: 280, step: 2, def: 190, unit: 'px' },
        { k: 'bg', type: 'color', label: 'Couleur', def: '#F56E2E' },
      ],
      presets: [
        ['Subtil', { strength: 0.2, radius: 40, stiffness: 14 }],
        ['Fort', { strength: 0.7, radius: 160, stiffness: 8 }],
        ['Gélatine', { strength: 0.9, radius: 200, stiffness: 4 }],
      ],
      html: (o) => `<button class="km-magnet" type="button"><span>${esc(o.label)}</span></button>`,
      css: (o) => `.km-magnet { display: grid; place-items: center; width: ${o.size}px; height: ${o.size}px; padding: 20px; border: 0; border-radius: 50%; background: ${o.bg}; color: #1C1A1A; font: 800 ${Math.round(o.size / 8.5)}px/1.05 var(--display); cursor: pointer; }
.km-magnet span { display: block; pointer-events: none; }`,
      calls: (o) => [{ fn: 'magnetic', args: ['.km-magnet', { strength: o.strength, radius: o.radius, stiffness: o.stiffness, inner: 'span' }] }],
    },
    {
      id: 'tilt', group: 'Souris et 3D', name: 'Carte 3D', use: 'Pour présenter un projet, un produit ou une offre.',
      tip: 'Passe la souris sur la carte',
      controls: [
        { k: 'title', type: 'text', label: 'Titre de la carte', def: 'Impossible à confondre' },
        { k: 'max', type: 'range', label: 'Inclinaison maximale', min: 2, max: 40, step: 1, def: 16, unit: '°' },
        { k: 'perspective', type: 'range', label: 'Profondeur', help: 'Petit = effet 3D très marqué.', min: 300, max: 2000, step: 50, def: 900, unit: 'px' },
        { k: 'scale', type: 'range', label: 'Grossit au survol', min: 1, max: 1.2, step: 0.01, def: 1.05, unit: '×' },
        { k: 'glare', type: 'toggle', label: 'Reflet de lumière', def: true },
        { k: 'bg', type: 'color', label: 'Couleur de la carte', def: '#F56E2E' },
      ],
      presets: [
        ['Subtil', { max: 6, perspective: 1400, scale: 1.02, glare: false }],
        ['Holographique', { max: 22, perspective: 700, scale: 1.06, glare: true }],
        ['Extrême', { max: 38, perspective: 400, scale: 1.1, glare: true }],
      ],
      html: (o) => `<article class="km-card">\n  <span>Kaury Studio</span>\n  <b>${esc(o.title)}</b>\n  <span>Vevey · Suisse</span>\n</article>`,
      css: (o) => `.km-card { width: min(320px, 70vw); aspect-ratio: 3 / 4; padding: 26px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; background: ${o.bg}; color: #1C1A1A; box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.7); }
.km-card b { font: 800 40px/0.95 var(--display); letter-spacing: -0.03em; }
.km-card span { font: 700 12px/1 var(--text); letter-spacing: 0.16em; text-transform: uppercase; }`,
      calls: (o) => [{ fn: 'tilt', args: ['.km-card', { max: o.max, perspective: o.perspective, scale: o.scale, glare: o.glare }] }],
    },
    {
      id: 'extrude', group: 'Souris et 3D', name: 'Logo en 3D', use: 'Donne une vraie épaisseur à ton logo, sans logiciel 3D.',
      tip: 'Il se balance tout seul. Survole-le pour le tourner',
      controls: [
        { k: 'depth', type: 'range', label: 'Épaisseur', min: 0, max: 120, step: 1, def: 44, unit: 'px' },
        { k: 'layers', type: 'range', label: 'Finesse', help: 'Plus de tranches = côtés plus lisses.', min: 2, max: 40, step: 1, def: 24 },
        { k: 'shade', type: 'range', label: 'Ombre sur les côtés', min: 0, max: 0.9, step: 0.05, def: 0.5 },
        { k: 'sway', type: 'range', label: 'Balancement', min: 0, max: 45, step: 1, def: 30, unit: '°' },
        { k: 'float', type: 'toggle', label: 'Flotte dans l’air', def: true },
        { k: 'tilt', type: 'toggle', label: 'Suit la souris', def: true },
        { k: 'max', type: 'range', label: 'Rotation à la souris', min: 5, max: 45, step: 1, def: 30, unit: '°' },
      ],
      presets: [
        ['Pièce épaisse', { depth: 90, layers: 36, shade: 0.6, sway: 36 }],
        ['Fin et élégant', { depth: 16, layers: 10, shade: 0.35, sway: 18 }],
        ['Immobile', { depth: 44, sway: 28, float: false, tilt: true }],
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
      id: 'timeline', group: 'Avancé', name: 'Séquence d’intro', use: 'Logo, titre puis bouton : une ouverture de page en trois temps.',
      tip: null,
      controls: [
        { k: 'title', type: 'text', label: 'Titre', def: 'Des animations avec du caractère' },
        { k: 'overlap', type: 'range', label: 'Enchaînement', help: 'Plus c’est grand, plus les étapes se chevauchent.', min: 0, max: 900, step: 25, def: 500, unit: 'ms' },
        { k: 'speed', type: 'range', label: 'Vitesse globale', min: 0.25, max: 3, step: 0.05, def: 1, unit: '×' },
        { k: 'ease', type: 'select', label: 'Mouvement', help: EASE_HELP, options: EASES, def: 'kaury' },
        { k: 'loop', type: 'toggle', label: 'Rejouer en boucle (aller-retour)', def: true },
      ],
      presets: [
        ['Posé', { overlap: 200, speed: 0.8, ease: 'inOutQuart' }],
        ['Fluide', { overlap: 500, speed: 1, ease: 'kaury' }],
        ['Explosif', { overlap: 800, speed: 1.6, ease: 'outBack' }],
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
        args: [{ defaults: { ease: o.ease }, speed: o.speed === 1 ? undefined : o.speed, loop: o.loop || undefined, yoyo: o.loop || undefined }],
        chain: [
          ['add', '.km-tl-logo', { scale: [0, 1], rotate: [-120, 0] }, { duration: 1200, ease: C(`spring({ stiffness: 160, damping: 11 })`, KM.spring({ stiffness: 160, damping: 11 })) }],
          ['add', '.km-tl h2 span', { y: ['110%', '0%'] }, { duration: 1000, delay: C('stagger(70)', KM.stagger(70)) }, `-=${o.overlap}`],
          ['add', '.km-tl-pill', { opacity: [0, 1], y: [24, 0], scale: [0.8, 1] }, { duration: 900 }, `-=${Math.round(o.overlap * 0.8)}`],
        ],
      }],
    },
    {
      id: 'spring', group: 'Avancé', name: 'Rebond physique', use: 'Des mouvements qui rebondissent comme un vrai ressort.',
      tip: null,
      controls: [
        { k: 'mass', type: 'range', label: 'Poids', help: 'Plus lourd = plus lent et plus d’élan.', min: 0.2, max: 5, step: 0.1, def: 1 },
        { k: 'stiffness', type: 'range', label: 'Raideur du ressort', help: 'Plus raide = plus rapide et nerveux.', min: 20, max: 600, step: 5, def: 180 },
        { k: 'damping', type: 'range', label: 'Amorti', help: 'Peu d’amorti = beaucoup de rebonds.', min: 1, max: 60, step: 0.5, def: 9 },
      ],
      presets: [
        ['Élastique', { mass: 1, stiffness: 220, damping: 5 }],
        ['Souple', { mass: 1, stiffness: 120, damping: 14 }],
        ['Lourd', { mass: 3.5, stiffness: 160, damping: 18 }],
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
        cv.setAttribute('role', 'img');
        cv.setAttribute('aria-label', `Courbe du ressort : se stabilise en ${s.duration} ms`);
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
        g.fillText(`se stabilise en ${s.duration} ms · dépasse de ${Math.max(0, (peak - 1) * 100).toFixed(0)} %`, w - pad, h - 8);
      },
    },
  ];

  // ---------- état ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } },
  };
  const defaults = (fx) => Object.fromEntries(fx.controls.map((c) => [c.k, c.def]));
  const values = {};
  FX.forEach((fx) => (values[fx.id] = defaults(fx)));
  let current = FX.find((f) => f.id === (location.hash.slice(1) || store.get('km-fx'))) || FX[0];
  let tab = 'file';
  let cleanups = [];

  const stage = $('#stage');
  const style = document.createElement('style');
  document.head.appendChild(style);

  // ---------- lecture ----------
  function track(r) {
    if (!r) return r;
    if (typeof r === 'function') cleanups.push(r);
    else if (typeof r.destroy === 'function') cleanups.push(() => r.destroy());
    else if (typeof r.pause === 'function') cleanups.push(() => r.pause());
    return r;
  }
  function stop() {
    cleanups.forEach((c) => { try { c(); } catch { /* déjà arrêté */ } });
    cleanups = [];
  }
  const scopeArgs = (args) => args.map((a) => (typeof a === 'string' && /^[.#]/.test(a) ? stage.querySelectorAll(a) : a));
  function mount() {
    stop();
    const o = values[current.id];
    style.textContent = current.css(o).replace(/(^|\})\s*([^{}@]+)\{/g, (m, a, sel) => `${a}\n${sel.split(',').map((s) => '#stage ' + s.trim()).join(', ')} {`);
    stage.innerHTML = current.html(o) + (current.tip ? `<div class="stage-tip"><i></i>${esc(current.tip)}</div>` : '');
    if (current.run) current.run(o, stage, track);
    else for (const c of current.calls(o)) {
      let r = track(KM[c.fn](...resolve(scopeArgs(c.args))));
      for (const [m, ...args] of c.chain || []) r = r[m](...resolve(scopeArgs(args)));
    }
    current.after?.(o, stage);
    renderCode();
  }

  // ---------- export ----------
  function usedNames(fx, o) {
    const names = new Set(fx.uses || []);
    const walk = (v) => {
      if (isC(v)) (v.__code.match(/\b(stagger|spring)\(/g) || []).forEach((m) => names.add(m.slice(0, -1)));
      else if (Array.isArray(v)) v.forEach(walk);
      else if (plain(v)) Object.values(v).forEach(walk);
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
  let libCache = null;
  async function libSource() {
    if (libCache) return libCache;
    const el = $('#km-lib');
    if (!el.src) return (libCache = el.textContent.trim());
    try { return (libCache = (await (await fetch(el.src)).text()).trim()); } catch { return '/* Colle ici le contenu de kaury-motion.min.js */'; }
  }
  const LIB_MARK = '/*__KM_LIB__*/';
  function jsModule(fx, o) {
    return `// Copie dist/kaury-motion.js du dépôt dans ton projet, puis :\nimport { ${usedNames(fx, o).join(', ')} } from './kaury-motion.js';\n\n${jsBody(fx, o)}\n`;
  }
  function snippet(fx, o, lib) {
    return `<!-- Kaury Motion : ${fx.name} -->\n${fx.html(o)}\n\n<style>\n${fx.css(o)}\n</style>\n\n<script>${lib}</script>\n<script>\nconst { ${usedNames(fx, o).join(', ')} } = KauryMotion;\n\n${jsBody(fx, o)}\n</script>\n`;
  }
  function page(fx, o, lib) {
    return `<!doctype html>
<html lang="fr">
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
  async function codeFor(t, forDisplay) {
    const o = values[current.id];
    if (t === 'js') return jsModule(current, o);
    const lib = forDisplay ? LIB_MARK : await libSource();
    return t === 'html' ? snippet(current, o, lib) : page(current, o, lib);
  }

  const STEPS = {
    file: [
      'Clique sur <b>Télécharger la page</b>. Tu obtiens un fichier <code>.html</code>.',
      'Ouvre-le dans ton navigateur : l’animation marche tout de suite, même sans internet.',
      'Pour la mettre en ligne, dépose ce fichier chez ton hébergeur, ou envoie-le à ton développeur.',
    ],
    html: [
      'Clique sur <b>Copier le code</b>.',
      'Dans ton site, ajoute un bloc <b>HTML personnalisé</b> (WordPress, Webflow, Wix, Squarespace…) là où tu veux l’animation.',
      'Colle le code et publie. Le framework est déjà inclus dans le bloc, rien d’autre à installer.',
    ],
    js: [
      'Copie le fichier <code>dist/kaury-motion.js</code> du dépôt dans ton projet.',
      'Clique sur <b>Copier le code</b> et colle-le dans ton script. Ajoute le HTML et le CSS visibles dans « Voir le code » de l’option « Ajouter à mon site ».',
      'Les effets qui tournent en continu renvoient une fonction : appelle-la pour les arrêter.',
    ],
  };
  function renderSteps() {
    const steps = STEPS[tab].slice();
    if (tab === 'file' && downloadBlocked) steps[0] = 'Clique sur <b>Copier le code</b>, colle-le dans un fichier texte vide et enregistre-le sous <code>animation.html</code>.';
    $('#get-steps').innerHTML = steps.map((s) => `<li>${s}</li>`).join('');
    $('#download').hidden = tab !== 'file' || downloadBlocked;
    $('#copy').className = `btn btn-sm ${tab === 'file' && !downloadBlocked ? 'btn-line' : 'btn-solid'}`;
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
  async function renderCode() {
    const t = tab;
    const src = await codeFor(t, true);
    if (t !== tab) return;
    $('#code code').innerHTML = highlight(src, t === 'js' ? 'js' : 'html').replace(esc(LIB_MARK), '<span class="c">/* le framework Kaury Motion (27 Ko) est inclus ici */</span>');
  }

  // ---------- réglages ----------
  const fmt = (v, c) => `${v}${c.unit ? (c.unit === '×' || c.unit === '°' ? c.unit : ' ' + c.unit) : ''}`;
  const opts = (c) => c.options.map((x) => (Array.isArray(x) ? x : [x, x]));
  function renderControls() {
    const o = values[current.id];
    $('#controls').innerHTML = current.controls.map((c) => {
      const id = `c-${current.id}-${c.k}`;
      const v = o[c.k];
      const help = c.help ? `<small id="${id}-h">${c.help}</small>` : '';
      const described = c.help ? ` aria-describedby="${id}-h"` : '';
      if (c.type === 'toggle') return `<div class="ctl"><label class="toggle" for="${id}"><input type="checkbox" id="${id}" data-k="${c.k}"${v ? ' checked' : ''}${described}> ${c.label}</label>${help}</div>`;
      let field = '';
      if (c.type === 'range') field = `<input type="range" id="${id}" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${v}"${described}>`;
      if (c.type === 'text') field = `<input type="text" id="${id}" data-k="${c.k}" value="${esc(v)}" autocomplete="off" spellcheck="false"${described}>`;
      if (c.type === 'select') field = `<select id="${id}" data-k="${c.k}"${described}>${opts(c).map(([val, lab]) => `<option value="${esc(val)}"${val === v ? ' selected' : ''}>${lab}</option>`).join('')}</select>`;
      if (c.type === 'seg') field = `<div class="seg" role="group" aria-labelledby="${id}-l">${opts(c).map(([val, lab]) => `<button type="button" data-k="${c.k}" data-v="${esc(val)}" aria-pressed="${val === v}">${lab}</button>`).join('')}</div>`;
      if (c.type === 'color') {
        field = `<div class="swatches" role="group" aria-labelledby="${id}-l">${PALETTE.map((p) => `<button type="button" class="swatch" data-k="${c.k}" data-v="${p}" style="background:${p}" aria-label="${p}" aria-pressed="${p.toLowerCase() === String(v).toLowerCase()}"></button>`).join('')}<input type="color" id="${id}" data-k="${c.k}" value="${v}" aria-label="Autre couleur"></div>`;
      }
      const out = c.type === 'range' ? `<output id="${id}-o">${fmt(v, c)}</output>` : '';
      const lab = c.type === 'seg' || c.type === 'color' ? `<span class="lbl" id="${id}-l">${c.label}</span>` : `<label for="${id}">${c.label}</label>`;
      return `<div class="ctl"><div class="ctl-head">${lab}${out}</div>${field}${help}</div>`;
    }).join('') + `<button type="button" class="reset" id="reset">Revenir aux réglages de départ</button>`;
  }
  function renderPresets(active) {
    $('#presets').innerHTML = current.presets.map(([name], i) => `<button type="button" class="preset" data-i="${i}" aria-pressed="${i === active}">${name}</button>`).join('');
  }

  let debounce;
  function change(k, v, instant) {
    const c = current.controls.find((x) => x.k === k);
    values[current.id][k] = c.type === 'range' ? +v : v;
    if (c.type === 'range') $(`#c-${current.id}-${k}-o`).textContent = fmt(+v, c);
    if (c.type === 'color') {
      document.querySelectorAll(`.swatch[data-k="${k}"]`).forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.v.toLowerCase() === String(v).toLowerCase())));
      $(`#c-${current.id}-${k}`).value = v;
    }
    renderPresets(-1);
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
      values[current.id] = defaults(current);
      renderControls();
      renderPresets(-1);
      return mount();
    }
    if (b.dataset.v === undefined) return;
    if (!b.classList.contains('swatch')) b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    change(b.dataset.k, b.dataset.v, true);
  });
  $('#controls').addEventListener('submit', (e) => e.preventDefault());
  $('#presets').addEventListener('click', (e) => {
    const b = e.target.closest('.preset');
    if (!b) return;
    const i = +b.dataset.i;
    values[current.id] = { ...defaults(current), ...keepTexts(), ...current.presets[i][1] };
    renderControls();
    renderPresets(i);
    mount();
  });
  // Les styles et la surprise gardent les textes que la personne a tapés.
  const keepTexts = () => Object.fromEntries(current.controls.filter((c) => c.type === 'text').map((c) => [c.k, values[current.id][c.k]]));

  $('#surprise').addEventListener('click', () => {
    const o = values[current.id];
    for (const c of current.controls) {
      if (c.type === 'range') {
        // Les tailles restent dans la moitié haute pour garder un résultat lisible.
        const lo = c.k === 'size' ? (c.min + c.max) / 2 : c.min;
        const n = Math.round((lo + Math.random() * (c.max - lo)) / c.step) * c.step;
        o[c.k] = +n.toFixed(4);
      } else if (c.type === 'seg' || c.type === 'select') {
        const list = opts(c);
        o[c.k] = list[(Math.random() * list.length) | 0][0];
      } else if (c.type === 'color') {
        o[c.k] = PALETTE[(Math.random() * PALETTE.length) | 0];
      }
    }
    // Garde le texte lisible sur le fond de la scène et le bandeau lisible.
    if (current.id === 'marquee' && o.bg === o.color) o.color = o.bg === '#1C1A1A' ? '#F1E8CB' : '#1C1A1A';
    if ('color' in o && o.color === '#1C1A1A' && current.id !== 'marquee') o.color = '#F1E8CB';
    if (current.id === 'stagger') { o.cols = Math.max(o.cols, 8); o.rows = Math.max(o.rows, 5); }
    renderControls();
    renderPresets(-1);
    mount();
  });

  // ---------- liste des effets ----------
  function renderList() {
    $('#fx-list').innerHTML = GROUPS.map((g) => `<div class="fx-group" role="group" aria-label="${g}"><p class="fx-group-title">${g}</p>${FX.filter((f) => f.group === g)
      .map((f) => `<button type="button" class="fx-item" data-id="${f.id}" aria-current="${f === current}"><b>${f.name}</b><span>${f.use}</span></button>`)
      .join('')}</div>`).join('');
  }
  $('#fx-list').addEventListener('click', (e) => {
    const b = e.target.closest('.fx-item');
    if (!b) return;
    select(FX.find((f) => f.id === b.dataset.id));
    if (matchMedia('(max-width: 820px)').matches) $('#stage').scrollIntoView({ block: 'center' });
  });
  function select(fx) {
    current = fx;
    store.set('km-fx', fx.id);
    $('#stage-name').textContent = fx.name;
    $('#stage-use').textContent = fx.use;
    renderList();
    renderControls();
    renderPresets(-1);
    mount();
  }

  // ---------- récupérer ----------
  document.querySelectorAll('.opt').forEach((b) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab;
      document.querySelectorAll('.opt').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      renderSteps();
      renderCode();
    }),
  );
  let statusTimer;
  function status(text) {
    const el = $('#get-status');
    el.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (el.textContent = ''), 3500);
  }
  $('#copy').addEventListener('click', async () => {
    const text = await codeFor(tab);
    try {
      await navigator.clipboard.writeText(text);
      status('Code copié. Tu peux le coller.');
    } catch {
      $('#code-wrap').open = true;
      const r = document.createRange();
      r.selectNodeContents($('#code code'));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      status('Le code est sélectionné : fais Ctrl+C (ou Cmd+C).');
    }
  });

  // Sur claude.ai, la page demande l'accord du visiteur pour enregistrer ;
  // ailleurs, un simple lien de téléchargement suffit.
  const hosted = window.claude && typeof window.claude.use === 'function';
  const downloads = hosted ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  let downloadBlocked = hosted;
  if (hosted) downloads.then((d) => { downloadBlocked = !d; renderSteps(); });
  $('#download').addEventListener('click', async () => {
    const html = await codeFor('file');
    const filename = `kaury-motion-${current.id}.html`;
    const d = await downloads;
    if (d) {
      try {
        await d.save({ filename, data: html });
        status('Page enregistrée.');
      } catch (err) {
        status(err && err.code === 'declined' ? 'Téléchargement annulé.' : 'Téléchargement impossible ici : utilise « Copier le code ».');
      }
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    status('Téléchargement lancé.');
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
  renderSteps();
  select(current);
})();
