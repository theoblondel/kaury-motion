/* Kaury Motion Studio : effets « Formes et SVG » et « Intros et séquences ». */
(function (K) {
  'use strict';
  const S = 'Formes et SVG', Q = 'Intros et séquences';
  const e = K.esc;
  const PAL = ['#F56E2E', '#F1E8CB', '#F7C548', '#8DB58D', '#A83E0D'];
  // Chemin du « k » du logo Kaury, pour les effets de tracé
  const K_PATH = 'M199.75 142.65L184.57 113.36C183.98 112.21 182.83 111.54 181.64 111.54C181.21 111.54 180.76 111.62 180.33 111.82C167.47 117.53 155.41 120.43 144.5 120.43C130.22 121.08 107.65 116.91 100.07 103.4C93.61 91.88 98.16 72.67 110.11 63.56C121.25 55.06 135.98 53.37 149.31 55.8C150.65 56.04 152.02 56.36 153.12 57.19C156.61 59.86 154.58 67.37 152.39 70.19C150.1 73.14 146.16 75.07 141.58 75.47C140.99 75.53 140.39 75.55 139.79 75.55C138.9 75.55 138.01 75.49 137.12 75.38C134.18 75.01 131.18 74.21 128.2 73.15C128.2 73.15 121.95 105.27 144.43 109.01C182.18 115.29 191.09 78.25 191.25 77.69C191.49 76.6 197.12 50.93 183.28 32.79C174.73 21.59 160.8 15.91 141.87 15.91C141.11 15.91 140.35 15.91 139.56 15.94C90.98 17.09 58.95 53.7 46.2 71.53V3.44C46.2 1.54 44.71 0 42.88 0H3.32C1.49 0 0 1.54 0 3.44V156.98C0 158.87 1.48 160.42 3.32 160.42H41.11C42.57 160.42 43.86 159.43 44.28 157.97C45.57 153.61 45.76 132.1 45.76 119.53C45.76 117.16 48.74 116.24 49.97 118.23C59.67 133.88 87.12 166.81 143.66 160.42C172.89 157.11 197.32 147.91 198.33 147.38C199.14 146.96 199.73 146.22 200 145.34C200.27 144.46 200.19 143.49 199.76 142.67Z';
  // Blobs à même structure (8 courbes) pour pouvoir se transformer l'un en l'autre
  const blob = (r) => {
    const n = 8, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = 100 * r[i];
      pts.push([150 + Math.cos(a) * rr, 150 + Math.sin(a) * rr]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const a1 = (i / n) * Math.PI * 2 + Math.PI / 2, a2 = (((i + 1) % n) / n) * Math.PI * 2 - Math.PI / 2;
      const k = 32 * ((r[i] + r[(i + 1) % n]) / 2);
      d += ` C${(p[0] + Math.cos(a1) * k).toFixed(1)} ${(p[1] + Math.sin(a1) * k).toFixed(1)} ${(q[0] + Math.cos(a2) * k).toFixed(1)} ${(q[1] + Math.sin(a2) * k).toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
    }
    return d + 'Z';
  };
  const BLOBS = [blob([1, 0.8, 1.05, 0.75, 1, 0.85, 1.1, 0.8]), blob([0.8, 1.1, 0.75, 1.05, 0.85, 1.1, 0.8, 1]), blob([1.05, 0.9, 0.8, 1.1, 0.75, 0.95, 1.05, 0.9])];

  // ---------- Formes et SVG ----------
  K.add(
    {
      id: 'draw-logo', cat: S, name: 'Logo tracé à la main', use: 'Le contour de ton logo se dessine, puis se remplit.',
      replay: 5200,
      controls: [K.color('#F56E2E', 'Couleur'), K.range('duration', 'Durée du tracé', 500, 5000, 100, 2200, 'ms'), K.range('size', 'Taille', 100, 400, 5, 260, 'px'), K.ease('inOutQuart')],
      html: () => `<svg class="x-draw" viewBox="-6 -6 212 173"><path d="${K_PATH}" pathLength="1"/></svg>`,
      css: (o) => `.x-draw { width: ${o.size}px; overflow: visible; }
.x-draw path { fill: ${o.color}; fill-opacity: 0; stroke: ${o.color}; stroke-width: 2.5; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; }`,
      code(root, o, KM) {
        const path = root.querySelector('.x-draw path');
        return KM.timeline({ defaults: { ease: o.ease } })
          .add(path, { strokeDashoffset: [1, 0] }, { duration: o.duration })
          .add(path, { fillOpacity: [0, 1] }, { duration: 700 }, '-=300');
      },
    },
    {
      id: 'blob', cat: S, name: 'Forme organique', use: 'Une tache liquide qui change doucement de forme.',
      controls: [K.color('#F56E2E', 'Couleur'), K.range('duration', 'Durée d’une transformation', 800, 6000, 100, 2600, 'ms'), K.range('size', 'Taille', 150, 450, 5, 320, 'px'), K.toggle('spin', 'Tourne en même temps', true)],
      html: () => `<svg class="x-blob" viewBox="0 0 300 300" data-forms='${JSON.stringify(BLOBS)}'><path d="${BLOBS[0]}"/></svg>`,
      css: (o) => `.x-blob { width: ${o.size}px; } .x-blob path { fill: ${o.color}; }`,
      code(root, o, KM) {
        const svg = root.querySelector('.x-blob');
        const path = svg.querySelector('path');
        const forms = JSON.parse(svg.dataset.forms);
        let i = 1, running = true;
        const next = () => KM.animate(path, { d: forms[i++ % forms.length] }, { duration: o.duration, ease: 'inOutSine' }).finished.then(() => running && next());
        next();
        const spin = o.spin ? KM.animate(svg, { rotate: [0, 360] }, { duration: o.duration * 6, ease: 'linear', loop: true }) : null;
        return [() => (running = false), spin];
      },
    },
    {
      id: 'wave-line', cat: S, name: 'Soulignement ondulé', use: 'Un trait ondulé qui se dessine sous un mot.',
      replay: 4500,
      controls: [K.text('créatif', 'Mot'), K.color('#F1E8CB', 'Couleur du texte'), K.color('#F56E2E', 'Couleur du trait', 'line'), K.range('duration', 'Durée', 400, 3000, 50, 1200, 'ms'), K.size(110)],
      html: (o) => `<h1 class="x-sq"><span>${e(o.text)}</span><svg viewBox="0 0 300 20" preserveAspectRatio="none"><path d="M2 12 Q 20 2 38 12 T 74 12 T 110 12 T 146 12 T 182 12 T 218 12 T 254 12 T 298 12" pathLength="1"/></svg></h1>`,
      css: (o) => `.x-sq { position: relative; margin: 0; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.03em; color: ${o.color}; padding-bottom: .25em; }
.x-sq svg { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: .22em; overflow: visible; }
.x-sq path { fill: none; stroke: ${o.line}; stroke-width: 5; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; vector-effect: non-scaling-stroke; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-sq path'), { strokeDashoffset: [1, 0] }, { duration: o.duration, delay: 300, ease: 'inOutQuart' });
      },
    },
    {
      id: 'ants', cat: S, name: 'Pointillés en marche', use: 'Un cadre en pointillés qui avance, pour une zone de dépôt.',
      controls: [K.text('Dépose ton fichier ici', 'Texte'), K.color('#F56E2E', 'Couleur'), K.speed(1)],
      html: (o) => `<div class="x-ants"><svg viewBox="0 0 420 240" preserveAspectRatio="none"><rect x="2" y="2" width="416" height="236" rx="24"/></svg><p>${e(o.text)}</p></div>`,
      css: (o) => `.x-ants { position: relative; width: 420px; height: 240px; display: grid; place-items: center; }
.x-ants svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.x-ants rect { fill: rgba(245,110,46,.06); stroke: ${o.color}; stroke-width: 3; stroke-dasharray: 14 10; }
.x-ants p { margin: 0; font: 700 24px/1.2 var(--text); color: #F1E8CB; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-ants rect'), { strokeDashoffset: [0, -48] }, { duration: 1000 / o.speed, ease: 'linear', loop: true });
      },
    },
    {
      id: 'star', cat: S, name: 'Étoile qui pulse', use: 'Une étoile qui tourne et bat comme un cœur : un badge « nouveau ».',
      controls: [K.text('NEW', 'Texte'), K.color('#F7C548', 'Couleur'), K.range('points', 'Nombre de branches', 5, 24, 1, 12), K.speed(1), K.range('size', 'Taille', 100, 360, 5, 230, 'px')],
      html: (o) => {
        const n = o.points, pts = [];
        for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 78 : 100; pts.push(`${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`); }
        return `<div class="x-star"><svg viewBox="0 0 200 200"><polygon points="${pts.join(' ')}"/></svg><b>${e(o.text)}</b></div>`;
      },
      css: (o) => `.x-star { position: relative; width: ${o.size}px; height: ${o.size}px; display: grid; place-items: center; }
.x-star svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.x-star polygon { fill: ${o.color}; }
.x-star b { position: relative; font: 800 ${o.size / 5}px/1 var(--display); color: #1C1A1A; transform: rotate(-12deg); }`,
      code(root, o, KM) {
        return [
          KM.animate(root.querySelector('.x-star svg'), { rotate: [0, 360] }, { duration: 12000 / o.speed, ease: 'linear', loop: true }),
          KM.animate(root.querySelector('.x-star'), { scale: [1, 1.08] }, { duration: 500 / o.speed, ease: 'inOutSine', loop: true, yoyo: true }),
        ];
      },
    },
    {
      id: 'bars', cat: S, name: 'Graphique qui pousse', use: 'Des barres qui montent avec leurs valeurs, pour tes résultats.',
      replay: 5000,
      controls: [K.text('42, 68, 55, 90, 76, 100', 'Valeurs', 'values', 'Sépare-les par des virgules.'), K.color('#F56E2E', 'Couleur des barres'), K.range('duration', 'Durée', 400, 3000, 50, 1200, 'ms'), K.ease('outExpo')],
      html: (o) => `<div class="x-chart">${o.values.split(',').map((v) => `<div class="x-col"><b>${e(v.trim())}</b><i data-v="${+v || 0}"></i></div>`).join('')}</div>`,
      css: (o) => `.x-chart { display: flex; align-items: flex-end; gap: 18px; height: 300px; padding-bottom: 6px; border-bottom: 2px solid rgba(241,232,203,.3); }
.x-col { display: grid; justify-items: center; gap: 8px; }
.x-col b { font: 700 18px/1 var(--mono); color: #F1E8CB; }
.x-col i { display: block; width: 56px; border-radius: 10px 10px 0 0; background: ${o.color}; transform-origin: bottom; }`,
      code(root, o, KM) {
        const bars = root.querySelectorAll('.x-col i');
        const max = Math.max(...[...bars].map((b) => +b.dataset.v), 1);
        bars.forEach((b) => (b.style.height = (+b.dataset.v / max) * 240 + 'px'));
        return [
          KM.animate(bars, { scaleY: [0, 1] }, { duration: o.duration, delay: KM.stagger(90), ease: o.ease }),
          KM.animate(root.querySelectorAll('.x-col b'), { opacity: [0, 1], y: [10, 0] }, { duration: 500, delay: KM.stagger(90, { start: o.duration * 0.6 }) }),
        ];
      },
    },
    {
      id: 'pie', cat: S, name: 'Camembert qui se remplit', use: 'Un disque qui se remplit jusqu’à ta statistique.',
      replay: 4500,
      controls: [K.range('value', 'Pourcentage', 1, 100, 1, 72, '%'), K.text('de clients satisfaits', 'Légende', 'label'), K.color('#F56E2E', 'Couleur'), K.range('duration', 'Durée', 500, 4000, 100, 1800, 'ms'), K.ease('outExpo')],
      html: (o) => `<div class="x-pie-wrap"><div class="x-pie"><b>0 %</b></div><p>${e(o.label)}</p></div>`,
      css: (o) => `.x-pie-wrap { display: grid; justify-items: center; gap: 18px; }
.x-pie { --p: 0; width: 240px; height: 240px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(${o.color} calc(var(--p) * 1%), rgba(241,232,203,.12) 0); }
.x-pie b { display: grid; place-items: center; width: 150px; height: 150px; border-radius: 50%; background: #1C1A1A; font: 800 44px/1 var(--display); color: #F1E8CB; font-variant-numeric: tabular-nums; }
.x-pie-wrap p { margin: 0; font: 600 22px/1.2 var(--text); color: rgba(241,232,203,.8); }`,
      code(root, o, KM) {
        const pie = root.querySelector('.x-pie');
        const label = pie.querySelector('b');
        const s = { p: 0 };
        return KM.animate(s, { p: [0, o.value] }, { duration: o.duration, ease: o.ease, onUpdate: () => { pie.style.setProperty('--p', s.p); label.textContent = Math.round(s.p) + ' %'; } });
      },
    },
    {
      id: 'morph-poly', cat: S, name: 'Polygone qui se déforme', use: 'Un triangle devient carré, puis hexagone, en boucle.',
      controls: [K.color('#F1E8CB', 'Couleur'), K.range('duration', 'Durée', 400, 4000, 50, 1300, 'ms'), K.ease('outElastic'), K.range('size', 'Taille', 120, 400, 5, 260, 'px')],
      html: () => `<svg class="x-poly" viewBox="0 0 200 200"><polygon points="100,20 180,170 20,170 20,170 100,20 180,170"/></svg>`,
      css: (o) => `.x-poly { width: ${o.size}px; } .x-poly polygon { fill: ${o.color}; }`,
      code(root, o, KM) {
        const poly = root.querySelector('.x-poly polygon');
        const shapes = [
          '100,20 180,170 20,170 20,170 100,20 180,170',
          '30,30 170,30 170,170 30,170 30,100 100,30',
          '100,15 175,57 175,143 100,185 25,143 25,57',
        ];
        let i = 1, running = true;
        const next = () => KM.animate(poly, { points: shapes[i++ % shapes.length] }, { duration: o.duration, ease: o.ease }).finished.then(() => running && setTimeout(next, 400));
        next();
        const spin = KM.animate(root.querySelector('.x-poly'), { rotate: [0, 360] }, { duration: o.duration * 8, ease: 'linear', loop: true });
        return [() => (running = false), spin];
      },
    },
    {
      id: 'circles', cat: S, name: 'Cercles en rythme', use: 'Des anneaux qui s’animent comme un égaliseur musical.',
      controls: [K.range('count', 'Nombre d’anneaux', 3, 12, 1, 7), K.speed(1), K.color('#F56E2E', 'Couleur')],
      html: (o) => `<svg class="x-circ" viewBox="0 0 300 300">${Array.from({ length: o.count }, (_, i) => `<circle cx="150" cy="150" r="${20 + i * (120 / o.count)}" pathLength="1"/>`).join('')}</svg>`,
      css: (o) => `.x-circ { width: 360px; } .x-circ circle { fill: none; stroke: ${o.color}; stroke-width: 5; stroke-linecap: round; stroke-dasharray: 0.5 0.5; transform-origin: center; transform-box: fill-box; }`,
      code(root, o, KM) {
        const rings = root.querySelectorAll('.x-circ circle');
        return [
          KM.animate(rings, { rotate: (el, i) => [0, i % 2 ? -360 : 360] }, { duration: 6000 / o.speed, ease: 'linear', loop: true }),
          KM.animate(rings, { strokeDasharray: ['0.1 0.9', '0.7 0.3'] }, { duration: 1400 / o.speed, delay: KM.stagger(120), ease: 'inOutSine', loop: true, yoyo: true }),
        ];
      },
    },
    {
      id: 'signature', cat: S, name: 'Signature manuscrite', use: 'Une signature qui s’écrit toute seule, pour un côté personnel.',
      replay: 5000,
      controls: [K.color('#F1E8CB', 'Couleur de l’encre'), K.range('duration', 'Durée', 800, 5000, 100, 2600, 'ms'), K.range('width', 'Épaisseur', 1, 8, 0.5, 3.5, 'px')],
      html: () => `<svg class="x-sign" viewBox="0 0 400 160"><path pathLength="1" d="M20 110 C40 40 70 30 70 70 C70 110 40 130 50 100 C60 70 100 60 110 90 C118 115 130 110 140 80 C150 50 160 60 158 90 C156 120 175 115 185 85 C195 55 210 60 205 95 C200 125 230 110 240 80 C250 50 265 70 260 100 C255 130 290 110 300 75 C310 45 330 70 325 100 C320 125 350 120 380 60"/></svg>`,
      css: (o) => `.x-sign { width: 520px; } .x-sign path { fill: none; stroke: ${o.color}; stroke-width: ${o.width}; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-sign path'), { strokeDashoffset: [1, 0] }, { duration: o.duration, ease: 'inOutSine', delay: 200 });
      },
    },
  );

  // ---------- Intros et séquences ----------
  K.add(
    {
      id: 'doors', cat: Q, name: 'Rideau d’ouverture', use: 'Deux volets s’écartent pour révéler ton titre, comme au théâtre.',
      replay: 5000,
      controls: [K.text('Bienvenue'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur des volets', 'panel'), K.range('duration', 'Durée', 500, 3000, 50, 1300, 'ms'), K.size(100), K.ease('inOutQuart')],
      html: (o) => `<div class="x-doors"><h1>${e(o.text)}</h1><i class="x-l"></i><i class="x-r"></i></div>`,
      css: (o) => `.x-doors { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.x-doors h1 { margin: 0; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.03em; color: ${o.color}; }
.x-doors i { position: absolute; top: 0; bottom: 0; width: 50%; background: ${o.panel}; }
.x-l { left: 0; } .x-r { right: 0; }`,
      code(root, o, KM) {
        return KM.timeline({ defaults: { ease: o.ease } })
          .add(root.querySelector('.x-l'), { x: ['0%', '-100%'] }, { duration: o.duration }, 400)
          .add(root.querySelector('.x-r'), { x: ['0%', '100%'] }, { duration: o.duration }, 400)
          .add(root.querySelector('.x-doors h1'), { scale: [1.3, 1], opacity: [0, 1] }, { duration: o.duration }, 600);
      },
    },
    {
      id: 'logo-slogan', cat: Q, name: 'Logo puis slogan', use: 'Le logo arrive, puis le nom et le slogan, puis un trait.',
      replay: 6000,
      controls: [K.image(), K.text('Kaury Studio', 'Nom'), K.text('Des marques impossibles à confondre', 'Slogan', 'tagline'), K.color('#F1E8CB'), K.color('#F56E2E', 'Couleur du trait', 'line'), K.speed(1)],
      html: (o) => `<div class="x-ls"><div class="x-ls-logo">${K.logo(o)}</div><h1>${e(o.text)}</h1><i></i><p>${e(o.tagline)}</p></div>`,
      css: (o) => `.x-ls { display: grid; justify-items: center; gap: 16px; text-align: center; color: ${o.color}; }
.x-ls-logo { width: 100px; } .x-ls-logo svg { display: block; width: 100%; height: auto; }
.x-ls h1 { margin: 0; font: 800 64px/1 var(--display); letter-spacing: -0.03em; overflow: hidden; padding-bottom: .08em; }
.x-ls i { width: 120px; height: 3px; background: ${o.line}; transform-origin: left; }
.x-ls p { margin: 0; font: 500 22px/1.3 var(--text); opacity: .8; }`,
      code(root, o, KM) {
        const title = KM.split(root.querySelector('.x-ls h1'), { type: 'chars' }).chars;
        return KM.timeline({ speed: o.speed, defaults: { ease: 'kaury' } })
          .add(root.querySelector('.x-ls-logo'), { scale: [0, 1], rotate: [-90, 0] }, { duration: 1100, ease: KM.spring({ stiffness: 170, damping: 11 }) })
          .add(title, { y: ['110%', '0%'] }, { duration: 900, delay: KM.stagger(35) }, '-=600')
          .add(root.querySelector('.x-ls i'), { scaleX: [0, 1] }, { duration: 800 }, '-=500')
          .add(root.querySelector('.x-ls p'), { opacity: [0, 0.8], y: [14, 0] }, { duration: 800 }, '-=500');
      },
    },
    {
      id: 'preloader', cat: Q, name: 'Préchargement de page', use: 'Un compteur jusqu’à 100 %, puis l’écran glisse et révèle la page.',
      replay: 6500,
      controls: [K.text('Ton site est prêt', 'Texte révélé'), K.color('#F56E2E', 'Couleur de l’écran', 'panel'), K.range('duration', 'Durée du chargement', 800, 5000, 100, 2200, 'ms')],
      html: (o) => `<div class="x-pre"><h1>${e(o.text)}</h1><div class="x-pre-screen"><b>0</b></div></div>`,
      css: (o) => `.x-pre { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.x-pre h1 { margin: 0; font: 800 76px/1 var(--display); letter-spacing: -0.03em; color: #F1E8CB; }
.x-pre-screen { position: absolute; inset: 0; display: grid; place-items: end start; padding: 30px 40px; background: ${o.panel}; }
.x-pre-screen b { font: 800 160px/1 var(--display); color: #1C1A1A; font-variant-numeric: tabular-nums; }`,
      code(root, o, KM) {
        const screen = root.querySelector('.x-pre-screen');
        const num = screen.querySelector('b');
        const s = { v: 0 };
        return KM.timeline()
          .add(s, { v: [0, 100] }, { duration: o.duration, ease: 'inOutQuart', onUpdate: () => (num.textContent = Math.round(s.v)) })
          .add(screen, { y: ['0%', '-100%'] }, { duration: 900, ease: 'inOutQuart' }, '+=150')
          .add(root.querySelector('.x-pre h1'), { y: [60, 0], opacity: [0, 1] }, { duration: 900, ease: 'kaury' }, '-=500');
      },
    },
    {
      id: 'cascade', cat: Q, name: 'Liste en cascade', use: 'Les éléments d’une liste arrivent un par un.',
      replay: 4800,
      controls: [K.text('Stratégie, Identité visuelle, Site internet, Vidéo de lancement, Suivi', 'Éléments', 'items'), K.range('each', 'Écart entre éléments', 30, 400, 10, 110, 'ms'), K.seg('from', 'Arrivent depuis', [['left', 'La gauche'], ['bottom', 'Le bas'], ['right', 'La droite']], 'left'), K.ease('kaury')],
      html: (o) => `<ol class="x-cas">${o.items.split(',').map((t, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${e(t.trim())}</li>`).join('')}</ol>`,
      css: () => `.x-cas { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; width: 480px; }
.x-cas li { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 14px; background: #2A2624; color: #F1E8CB; font: 700 24px/1.1 var(--text); }
.x-cas span { font: 600 16px/1 var(--mono); color: #F56E2E; }`,
      code(root, o, KM) {
        const from = { left: { x: [-80, 0] }, right: { x: [80, 0] }, bottom: { y: [50, 0] } }[o.from];
        return KM.animate(root.querySelectorAll('.x-cas li'), { ...from, opacity: [0, 1] }, { duration: 800, delay: KM.stagger(o.each), ease: o.ease });
      },
    },
    {
      id: 'split-screen', cat: Q, name: 'Écran qui se fend', use: 'L’écran se coupe en deux et s’ouvre sur ton message.',
      replay: 5000,
      controls: [K.text('Nouvelle ère', 'Message'), K.color('#F1E8CB', 'Couleur des moitiés', 'panel'), K.color('#F56E2E', 'Couleur du message'), K.range('duration', 'Durée', 500, 3000, 50, 1400, 'ms')],
      html: (o) => `<div class="x-split"><h1>${e(o.text)}</h1><i class="x-top"></i><i class="x-bot"></i></div>`,
      css: (o) => `.x-split { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.x-split h1 { margin: 0; font: 800 96px/1 var(--display); letter-spacing: -0.03em; color: ${o.color}; }
.x-split i { position: absolute; left: 0; right: 0; height: 50%; background: ${o.panel}; }
.x-top { top: 0; } .x-bot { bottom: 0; }`,
      code(root, o, KM) {
        return KM.timeline({ defaults: { ease: 'inOutQuart' } })
          .add(root.querySelector('.x-top'), { y: ['0%', '-100%'], skewY: [0, -4] }, { duration: o.duration }, 500)
          .add(root.querySelector('.x-bot'), { y: ['0%', '100%'], skewY: [0, -4] }, { duration: o.duration }, 500)
          .add(root.querySelector('.x-split h1'), { letterSpacing: ['0.3em', '-0.03em'], opacity: [0, 1] }, { duration: o.duration * 1.2, ease: 'kaury' }, 700);
      },
    },
    {
      id: 'stats', cat: Q, name: 'Chiffres clés', use: 'Trois compteurs et leurs légendes, qui arrivent l’un après l’autre.',
      replay: 5500,
      controls: [K.text('120+ Projets, 45 Clients, 8 Années', 'Tes chiffres', 'items', 'Format : nombre, espace, légende.'), K.color('#F56E2E', 'Couleur des chiffres'), K.range('duration', 'Durée du comptage', 500, 4000, 100, 2000, 'ms')],
      html: (o) => `<div class="x-stats">${o.items.split(',').map((it) => { const [n, ...rest] = it.trim().split(' '); return `<div><b data-to="${parseFloat(n) || 0}" data-suffix="${e(n.replace(/[\d.,]/g, ''))}">0</b><span>${e(rest.join(' '))}</span></div>`; }).join('')}</div>`,
      css: (o) => `.x-stats { display: flex; gap: 60px; }
.x-stats div { display: grid; gap: 6px; }
.x-stats b { font: 800 90px/1 var(--display); letter-spacing: -0.03em; color: ${o.color}; font-variant-numeric: tabular-nums; }
.x-stats span { font: 600 20px/1 var(--text); color: rgba(241,232,203,.75); }`,
      code(root, o, KM) {
        const blocks = root.querySelectorAll('.x-stats div');
        blocks.forEach((b, i) => {
          const n = b.querySelector('b');
          KM.counter(n, { to: +n.dataset.to, suffix: n.dataset.suffix, duration: o.duration, delay: 200 + i * 250 });
        });
        return KM.animate(blocks, { y: [30, 0], opacity: [0, 1] }, { duration: 800, delay: KM.stagger(250), ease: 'kaury' });
      },
    },
    {
      id: 'circle-reveal', cat: Q, name: 'Révélation en cercle', use: 'Un cercle s’agrandit depuis le centre et dévoile une nouvelle scène.',
      replay: 5000,
      controls: [K.text('Nouvelle saison', 'Titre révélé'), K.color('#F56E2E', 'Couleur révélée', 'bg2'), K.range('duration', 'Durée', 500, 3000, 50, 1500, 'ms'), K.ease('inOutQuart')],
      html: (o) => `<div class="x-cr"><h1 class="x-before">Clique ici…</h1><div class="x-after"><h1>${e(o.text)}</h1></div></div>`,
      css: (o) => `.x-cr { position: absolute; inset: 0; display: grid; place-items: center; }
.x-cr h1 { margin: 0; font: 800 80px/1 var(--display); letter-spacing: -0.03em; }
.x-before { color: rgba(241,232,203,.4); }
.x-after { position: absolute; inset: 0; display: grid; place-items: center; background: ${o.bg2}; color: #1C1A1A; clip-path: circle(0% at 50% 50%); }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-after'), { clipPath: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'] }, { duration: o.duration, delay: 600, ease: o.ease });
      },
    },
    {
      id: 'assemble', cat: Q, name: 'Galerie qui s’assemble', use: 'Des vignettes arrivent de partout et forment une grille.',
      replay: 5200,
      controls: [K.range('cols', 'Colonnes', 3, 6, 1, 4), K.range('rows', 'Lignes', 2, 4, 1, 3), K.range('duration', 'Durée', 500, 3000, 50, 1400, 'ms'), K.ease('outExpo')],
      html: (o) => `<div class="x-asm">${Array.from({ length: o.cols * o.rows }, (_, i) => `<i style="background:${PAL[i % PAL.length]}"></i>`).join('')}</div>`,
      css: (o) => `.x-asm { display: grid; grid-template-columns: repeat(${o.cols}, 100px); gap: 12px; }
.x-asm i { height: 100px; border-radius: 14px; }`,
      code(root, o, KM) {
        const r = () => (Math.random() - 0.5) * 900;
        return KM.animate(root.querySelectorAll('.x-asm i'), { x: () => [r(), 0], y: () => [r(), 0], rotate: () => [(Math.random() - 0.5) * 180, 0], scale: [0.3, 1], opacity: [0, 1] }, { duration: o.duration, delay: KM.stagger(50, { from: 'random' }), ease: o.ease });
      },
    },
  );
})(window.KMS);
