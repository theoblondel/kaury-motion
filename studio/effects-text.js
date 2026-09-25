/* Kaury Motion Studio : effets « Titres et texte ». */
(function (K) {
  'use strict';
  const T = 'Titres et texte';
  const e = K.esc;

  K.add(
    {
      id: 'type-caret', cat: T, name: 'Machine à écrire', use: 'Le texte se tape lettre après lettre, avec un curseur qui clignote.',
      replay: 6000,
      controls: [K.text('Bonjour, on crée ensemble ?'), K.range('each', 'Vitesse de frappe', 15, 200, 5, 60, 'ms', 'Temps entre deux lettres.'), K.color('#F1E8CB'), K.size(64), K.color('#F56E2E', 'Couleur du curseur', 'caret')],
      html: (o) => `<h1 class="x-type"><span class="x-type-text">${e(o.text)}</span><i class="x-caret"></i></h1>`,
      css: (o) => `${K.title('.x-type', o)}
.x-caret { display: inline-block; width: 0.08em; height: 0.9em; margin-left: 0.06em; vertical-align: -0.08em; background: ${o.caret}; }`,
      code(root, o, KM) {
        const typing = KM.reveal(root.querySelector('.x-type-text'), { effect: 'type', by: 'chars', each: o.each });
        const blink = KM.animate(root.querySelector('.x-caret'), { opacity: [1, 0] }, { duration: 500, ease: 'inOutSine', loop: true, yoyo: true });
        return [typing, blink];
      },
    },
    {
      id: 'type-loop', cat: T, name: 'Phrases qui s’écrivent en boucle', use: 'Tape puis efface plusieurs phrases, pour présenter tes métiers.',
      controls: [K.text('Branding, Sites web, Vidéo, Photo', 'Tes phrases', 'words', 'Sépare-les par des virgules.'), K.text('On fait du ', 'Début fixe', 'lead'), K.range('each', 'Vitesse de frappe', 20, 200, 5, 70, 'ms'), K.range('pause', 'Pause entre deux phrases', 300, 4000, 100, 1400, 'ms'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur des phrases', 'accent'), K.size(56)],
      html: (o) => `<h1 class="x-loop">${e(o.lead)}<span class="x-loop-word"></span><i class="x-caret"></i></h1>`,
      css: (o) => `${K.title('.x-loop', o)}
.x-loop-word { color: ${o.accent}; }
.x-caret { display: inline-block; width: 0.08em; height: 0.9em; margin-left: 0.06em; vertical-align: -0.08em; background: ${o.accent}; }`,
      code(root, o, KM) {
        const words = o.words.split(',').map((w) => w.trim()).filter(Boolean);
        const out = root.querySelector('.x-loop-word');
        let w = 0, n = 0, deleting = false, wait = 0;
        const stop = KM.ticker.add((t, dt) => {
          wait -= dt;
          if (wait > 0) return;
          const word = words[w % words.length];
          n += deleting ? -1 : 1;
          out.textContent = word.slice(0, n);
          wait = deleting ? o.each / 2 : o.each;
          if (!deleting && n === word.length) (deleting = true), (wait = o.pause);
          if (deleting && n === 0) (deleting = false), w++;
        });
        const blink = KM.animate(root.querySelector('.x-caret'), { opacity: [1, 0] }, { duration: 500, loop: true, yoyo: true });
        return [stop, blink];
      },
    },
    {
      id: 'blur-in', cat: T, name: 'Titre qui sort du flou', use: 'Une apparition douce et cinématographique, mot par mot.',
      replay: 5200,
      controls: [K.text('Chaque détail compte'), K.range('each', 'Écart entre les mots', 20, 400, 10, 140, 'ms'), K.range('duration', 'Durée', 300, 3000, 50, 1600, 'ms'), K.color('#F1E8CB'), K.size(80), K.ease('inOutQuart')],
      html: (o) => `<h1 class="x-blur">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-blur', o),
      code(root, o, KM) {
        return KM.reveal(root.querySelector('.x-blur'), { effect: 'blur', by: 'words', each: o.each, duration: o.duration, ease: o.ease });
      },
    },
    {
      id: 'flip-3d', cat: T, name: 'Lettres qui basculent en 3D', use: 'Chaque lettre pivote vers toi comme une carte qu’on retourne.',
      replay: 5000,
      controls: [K.text('Nouvelle collection'), K.range('each', 'Écart entre les lettres', 10, 150, 5, 40, 'ms'), K.color('#F56E2E'), K.size(84), K.ease('outBack')],
      html: (o) => `<h1 class="x-flip">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-flip', o),
      code(root, o, KM) {
        return KM.reveal(root.querySelector('.x-flip'), { effect: 'flip', by: 'chars', each: o.each, duration: 1200, ease: o.ease });
      },
    },
    {
      id: 'zoom-in', cat: T, name: 'Titre qui arrive en zoom', use: 'Le titre fonce vers toi puis se pose, façon bande-annonce.',
      replay: 5000,
      controls: [K.text('Bientôt'), K.range('duration', 'Durée', 300, 3000, 50, 1400, 'ms'), K.color('#F1E8CB'), K.size(140), K.ease('outExpo')],
      html: (o) => `<h1 class="x-zoom">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-zoom', o),
      code(root, o, KM) {
        return KM.reveal(root.querySelector('.x-zoom'), { effect: 'zoom', by: 'words', each: 120, duration: o.duration, ease: o.ease });
      },
    },
    {
      id: 'scatter', cat: T, name: 'Lettres qui se rassemblent', use: 'Les lettres arrivent de partout et forment ton mot.',
      replay: 5200,
      controls: [K.text('KAURY'), K.range('spread', 'Dispersion', 50, 600, 10, 320, 'px'), K.range('duration', 'Durée', 400, 3000, 50, 1600, 'ms'), K.color('#F56E2E'), K.size(140), K.ease('outExpo')],
      html: (o) => `<h1 class="x-scatter">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-scatter', o),
      code(root, o, KM) {
        const { chars } = KM.split(root.querySelector('.x-scatter'), { type: 'chars' });
        const r = () => (Math.random() - 0.5) * 2 * o.spread;
        return KM.animate(chars, { x: () => [r(), 0], y: () => [r(), 0], rotate: () => [(Math.random() - 0.5) * 360, 0], opacity: [0, 1] }, { duration: o.duration, delay: KM.stagger(30, { from: 'random' }), ease: o.ease });
      },
    },
    {
      id: 'drop', cat: T, name: 'Lettres qui tombent', use: 'Les lettres tombent du ciel et rebondissent en place.',
      replay: 5200,
      controls: [K.text('Boum !'), K.range('each', 'Écart entre les lettres', 20, 200, 5, 70, 'ms'), K.range('height', 'Hauteur de chute', 100, 600, 10, 360, 'px'), K.color('#F1E8CB'), K.size(130), K.ease('outBounce')],
      html: (o) => `<h1 class="x-drop">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-drop', o),
      code(root, o, KM) {
        const { chars } = KM.split(root.querySelector('.x-drop'), { type: 'chars' });
        return KM.animate(chars, { y: [-o.height, 0], opacity: [0, 1] }, { duration: 1100, delay: KM.stagger(o.each), ease: o.ease });
      },
    },
    {
      id: 'shimmer', cat: T, name: 'Texte qui brille', use: 'Un reflet de lumière traverse le texte en continu.',
      controls: [K.text('Édition limitée'), K.color('#F56E2E', 'Couleur de base'), K.color('#FFF4D6', 'Couleur du reflet', 'shine'), K.range('duration', 'Durée d’un passage', 600, 6000, 100, 2600, 'ms'), K.size(96)],
      html: (o) => `<h1 class="x-shimmer">${e(o.text)}</h1>`,
      css: (o) => `${K.title('.x-shimmer', o)}
.x-shimmer { background: linear-gradient(100deg, ${o.color} 40%, ${o.shine} 50%, ${o.color} 60%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-shimmer'), { backgroundPosition: ['100% 0%', '-50% 0%'] }, { duration: o.duration, ease: 'inOutSine', loop: true });
      },
    },
    {
      id: 'glitch', cat: T, name: 'Glitch', use: 'Un bug visuel façon écran cassé, pour un style tech ou gaming.',
      controls: [K.text('SIGNAL PERDU'), K.range('force', 'Force du glitch', 2, 30, 1, 10, 'px'), K.range('rate', 'Fréquence', 0.02, 0.5, 0.01, 0.12), K.color('#F1E8CB'), K.size(92)],
      html: (o) => `<h1 class="x-glitch" data-text="${e(o.text)}"><span>${e(o.text)}</span><span aria-hidden="true">${e(o.text)}</span><span aria-hidden="true">${e(o.text)}</span></h1>`,
      css: (o) => `${K.title('.x-glitch', o, 'position: relative; display: grid;')}
.x-glitch span { grid-area: 1 / 1; }
.x-glitch span:nth-child(2) { color: #F56E2E; mix-blend-mode: screen; }
.x-glitch span:nth-child(3) { color: #4FD1C5; mix-blend-mode: screen; }`,
      code(root, o, KM) {
        const [, a, b] = root.querySelectorAll('.x-glitch span');
        return KM.ticker.add(() => {
          const on = Math.random() < o.rate;
          const r = () => (on ? (Math.random() - 0.5) * 2 * o.force : 0);
          KM.set(a, { x: r(), y: r() / 3 });
          KM.set(b, { x: r(), y: r() / 3 });
          a.style.clipPath = on ? `inset(${Math.random() * 80}% 0 ${Math.random() * 20}% 0)` : 'inset(0 0 100% 0)';
          b.style.clipPath = on ? `inset(${Math.random() * 20}% 0 ${Math.random() * 80}% 0)` : 'inset(0 0 100% 0)';
        });
      },
    },
    {
      id: 'marker', cat: T, name: 'Surligneur', use: 'Un coup de marqueur passe sur les mots importants.',
      replay: 5000,
      controls: [K.text('On rend ta marque', 'Début'), K.text('inoubliable', 'Mot surligné', 'hl'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur du marqueur', 'mark'), K.range('duration', 'Durée', 300, 3000, 50, 1000, 'ms'), K.size(72)],
      html: (o) => `<h1 class="x-marker">${e(o.text)} <mark>${e(o.hl)}</mark></h1>`,
      css: (o) => `${K.title('.x-marker', o)}
.x-marker mark { color: inherit; background: linear-gradient(${o.mark}, ${o.mark}) 0 88% / 0% 42% no-repeat; padding: 0 0.08em; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-marker mark'), { backgroundSize: ['0% 42%', '100% 42%'] }, { duration: o.duration, delay: 400, ease: 'inOutQuart' });
      },
    },
    {
      id: 'underline', cat: T, name: 'Soulignement qui se dessine', use: 'Un trait fin se trace sous le titre.',
      replay: 5000,
      controls: [K.text('Studio créatif à Vevey'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur du trait', 'line'), K.range('thick', 'Épaisseur', 1, 16, 1, 5, 'px'), K.range('duration', 'Durée', 300, 3000, 50, 1200, 'ms'), K.size(64)],
      html: (o) => `<h1 class="x-under"><span>${e(o.text)}</span></h1>`,
      css: (o) => `${K.title('.x-under', o)}
.x-under span { background: linear-gradient(${o.line}, ${o.line}) 0 100% / 0% ${o.thick}px no-repeat; padding-bottom: 0.1em; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-under span'), { backgroundSize: [`0% ${o.thick}px`, `100% ${o.thick}px`] }, { duration: o.duration, delay: 300, ease: 'inOutQuart' });
      },
    },
    {
      id: 'rotator', cat: T, name: 'Mot qui change', use: 'Un mot du titre défile pour montrer plusieurs idées.',
      controls: [K.text('Des sites', 'Début fixe'), K.text('rapides, beaux, uniques, vivants', 'Mots qui défilent', 'words', 'Sépare-les par des virgules.'), K.range('pause', 'Temps par mot', 600, 4000, 100, 1800, 'ms'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur des mots', 'accent'), K.size(72), K.ease('outBack')],
      html: (o) => `<h1 class="x-rot">${e(o.text)} <span class="x-rot-box"><span class="x-rot-word">${e(o.words.split(',')[0].trim())}</span></span></h1>`,
      css: (o) => `${K.title('.x-rot', o)}
.x-rot-box { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: 0.1em; }
.x-rot-word { display: inline-block; color: ${o.accent}; }`,
      code(root, o, KM) {
        const words = o.words.split(',').map((w) => w.trim()).filter(Boolean);
        const el = root.querySelector('.x-rot-word');
        let i = 0;
        const next = async () => {
          await KM.animate(el, { y: ['0%', '-110%'] }, { duration: 350, ease: 'inQuart' }).finished;
          i = (i + 1) % words.length;
          el.textContent = words[i];
          KM.animate(el, { y: ['110%', '0%'] }, { duration: 600, ease: o.ease });
        };
        const id = setInterval(next, o.pause);
        return () => clearInterval(id);
      },
    },
    {
      id: 'neon', cat: T, name: 'Néon', use: 'Une enseigne lumineuse qui grésille comme un vrai néon.',
      controls: [K.text('OUVERT'), K.color('#F56E2E', 'Couleur du néon'), K.range('flicker', 'Grésillement', 0, 0.3, 0.01, 0.06), K.size(120)],
      html: (o) => `<h1 class="x-neon">${e(o.text)}</h1>`,
      css: (o) => `.x-neon { margin: 0; font: 800 ${o.size}px/1 var(--display); letter-spacing: 0.04em; color: #FFF4E8; text-shadow: 0 0 6px ${o.color}, 0 0 18px ${o.color}, 0 0 42px ${o.color}, 0 0 80px ${o.color}; }`,
      code(root, o, KM) {
        const el = root.querySelector('.x-neon');
        return KM.ticker.add(() => {
          el.style.opacity = Math.random() < o.flicker ? String(0.35 + Math.random() * 0.4) : '1';
        });
      },
    },
    {
      id: 'bounce-loop', cat: T, name: 'Lettres qui sautillent', use: 'Les lettres sautent à tour de rôle, en continu.',
      controls: [K.text('Soldes !'), K.range('amplitude', 'Hauteur du saut', 4, 60, 1, 24, 'px'), K.range('duration', 'Temps d’un cycle', 500, 4000, 50, 1400, 'ms'), K.color('#F56E2E'), K.size(120)],
      html: (o) => `<h1 class="x-hop">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-hop', o),
      code(root, o, KM) {
        const { chars } = KM.split(root.querySelector('.x-hop'), { type: 'chars' });
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          chars.forEach((c, i) => {
            const p = ((t - start) / o.duration - i * 0.08) % 1;
            const hop = p > 0 && p < 0.3 ? Math.sin((p / 0.3) * Math.PI) : 0;
            KM.set(c, { y: -hop * o.amplitude });
          });
        });
      },
    },
    {
      id: 'dock', cat: T, name: 'Lettres qui grossissent sous la souris', use: 'Comme le dock d’un Mac : les lettres enflent autour du curseur.',
      tip: 'Passe la souris sur le mot', tipTouch: 'Effet à la souris : essaie-le sur ordinateur',
      controls: [K.text('Survole-moi'), K.range('zoom', 'Grossissement', 1.1, 2.5, 0.05, 1.7, '×'), K.range('reach', 'Portée', 40, 300, 10, 120, 'px'), K.color('#F1E8CB'), K.size(96)],
      html: (o) => `<h1 class="x-dock">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-dock', o),
      code(root, o, KM) {
        const title = root.querySelector('.x-dock');
        const { chars } = KM.split(title, { type: 'chars' });
        const scale = chars.map(() => 1);
        let px = -1e4, py = -1e4;
        const move = (ev) => ((px = ev.clientX), (py = ev.clientY));
        const out = () => (px = py = -1e4);
        title.addEventListener('pointermove', move);
        title.addEventListener('pointerleave', out);
        const stop = KM.ticker.add(() => {
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py);
            const target = 1 + (o.zoom - 1) * Math.max(0, 1 - d / o.reach);
            scale[i] += (target - scale[i]) * 0.2;
            KM.set(c, { scale: +scale[i].toFixed(3) });
          });
        });
        return stop;
      },
    },
    {
      id: 'outline-fill', cat: T, name: 'Contour qui se remplit', use: 'Le texte, d’abord en contour, se remplit de couleur.',
      replay: 5200,
      controls: [K.text('PORTFOLIO'), K.color('#F56E2E', 'Couleur'), K.range('duration', 'Durée du remplissage', 400, 4000, 50, 1800, 'ms'), K.size(130), K.ease('inOutQuart')],
      html: (o) => `<h1 class="x-fill">${e(o.text)}</h1>`,
      css: (o) => `.x-fill { margin: 0; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.02em; color: transparent; -webkit-text-stroke: 2px ${o.color}; background: linear-gradient(${o.color}, ${o.color}) 0 0 / 0% 100% no-repeat; -webkit-background-clip: text; background-clip: text; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-fill'), { backgroundSize: ['0% 100%', '100% 100%'] }, { duration: o.duration, delay: 300, ease: o.ease });
      },
    },
    {
      id: 'deep-text', cat: T, name: 'Texte en relief 3D', use: 'Un titre épais qui flotte et tourne doucement dans l’espace.',
      controls: [K.text('3D'), K.range('depth', 'Épaisseur', 4, 80, 1, 28, 'px'), K.range('sway', 'Balancement', 0, 45, 1, 26, '°'), K.color('#F56E2E'), K.size(220)],
      html: (o) => `<div class="x-deep-scene"><div class="x-deep"><h1>${e(o.text)}</h1></div></div>`,
      css: (o) => `.x-deep-scene { perspective: 900px; }
.x-deep h1 { margin: 0; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.04em; color: ${o.color}; }`,
      code(root, o, KM) {
        const el = root.querySelector('.x-deep');
        return [KM.extrude(el, { depth: o.depth, layers: Math.round(o.depth / 1.5) + 4, shade: 0.55 }), KM.float(el, { y: 12, rotate: 2, sway: o.sway })];
      },
    },
    {
      id: 'magnet-letters', cat: T, name: 'Lettres qui fuient la souris', use: 'Les lettres s’écartent quand le curseur approche, puis reviennent.',
      tip: 'Passe la souris sur le texte', tipTouch: 'Effet à la souris : essaie-le sur ordinateur',
      controls: [K.text('Attrape-moi'), K.range('force', 'Force de répulsion', 10, 120, 5, 50, 'px'), K.range('reach', 'Portée', 40, 300, 10, 140, 'px'), K.color('#F1E8CB'), K.size(100)],
      html: (o) => `<h1 class="x-flee">${e(o.text)}</h1>`,
      css: (o) => K.title('.x-flee', o, 'padding: 40px 6%;'),
      code(root, o, KM) {
        const title = root.querySelector('.x-flee');
        const { chars } = KM.split(title, { type: 'chars' });
        const pos = chars.map(() => ({ x: 0, y: 0 }));
        let px = -1e4, py = -1e4;
        title.addEventListener('pointermove', (ev) => ((px = ev.clientX), (py = ev.clientY)));
        title.addEventListener('pointerleave', () => (px = py = -1e4));
        return KM.ticker.add(() => {
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const cx = r.left + r.width / 2 - pos[i].x, cy = r.top + r.height / 2 - pos[i].y;
            const dx = cx - px, dy = cy - py, d = Math.hypot(dx, dy) || 1;
            const k = Math.max(0, 1 - d / o.reach) * o.force;
            pos[i].x += ((dx / d) * k - pos[i].x) * 0.15;
            pos[i].y += ((dy / d) * k - pos[i].y) * 0.15;
            KM.set(c, { x: +pos[i].x.toFixed(2), y: +pos[i].y.toFixed(2) });
          });
        });
      },
    },
    {
      id: 'countdown', cat: T, name: 'Compte à rebours', use: 'Un décompte qui descend jusqu’à zéro, pour un lancement.',
      replay: 12500,
      controls: [K.range('from', 'Départ', 3, 60, 1, 10), K.text('C’est parti !', 'Texte à la fin', 'end'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur de la fin', 'accent'), K.size(200)],
      html: (o) => `<div class="x-count"><span class="x-count-n">${o.from}</span></div>`,
      css: (o) => `.x-count { font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.04em; color: ${o.color}; font-variant-numeric: tabular-nums; text-align: center; }
.x-count-end { color: ${o.accent}; font-size: 0.45em; }`,
      code(root, o, KM) {
        const el = root.querySelector('.x-count-n');
        let n = o.from;
        const tick = () => {
          n--;
          if (n < 0) return clearInterval(id);
          if (n === 0) {
            el.innerHTML = `<span class="x-count-end">${o.end.replace(/</g, '&lt;')}</span>`;
            KM.animate(el, { scale: [0.3, 1], opacity: [0, 1] }, { ease: KM.spring({ stiffness: 200, damping: 10 }) });
            return;
          }
          el.textContent = n;
          KM.animate(el, { scale: [1.4, 1], opacity: [0.2, 1] }, { duration: 700, ease: 'outExpo' });
        };
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
      },
    },
    {
      id: 'curtain-title', cat: T, name: 'Titre dévoilé par un volet', use: 'Un volet de couleur glisse et laisse apparaître le titre.',
      replay: 5000,
      controls: [K.text('Nouveau projet'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur du volet', 'panel'), K.range('duration', 'Durée', 400, 3000, 50, 1400, 'ms'), K.size(88)],
      html: (o) => `<h1 class="x-curtain"><span class="x-curtain-text">${e(o.text)}</span><span class="x-curtain-panel"></span></h1>`,
      css: (o) => `${K.title('.x-curtain', o, 'position: relative; display: inline-block; padding: 0.1em 0.2em;')}
.x-curtain-panel { position: absolute; inset: 0; background: ${o.panel}; transform-origin: left; }`,
      code(root, o, KM) {
        const text = root.querySelector('.x-curtain-text');
        const panel = root.querySelector('.x-curtain-panel');
        KM.set(text, { opacity: 0 });
        panel.style.transform = 'scaleX(0)';
        return KM.timeline({ defaults: { ease: 'inOutQuart' } })
          .add(panel, { scaleX: [0, 1] }, { duration: o.duration / 2 })
          .call(() => { text.style.opacity = '1'; panel.style.transformOrigin = 'right'; })
          .add(panel, { scaleX: [1, 0] }, { duration: o.duration / 2 });
      },
    },
  );
})(window.KMS);
