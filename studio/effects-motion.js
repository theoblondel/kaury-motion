/* Kaury Motion Studio : effets « Cartes et 3D », « Défilement » et « Fonds animés ». */
(function (K) {
  'use strict';
  const C = 'Cartes et 3D', D = 'Défilement', F = 'Fonds animés';
  const e = K.esc;
  const PAL = ['#F56E2E', '#F1E8CB', '#F7C548', '#8DB58D', '#A83E0D'];
  const cardCss = (sel, o, extra = '') => `${sel} { width: 260px; aspect-ratio: 3 / 4; padding: 22px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; background: ${o.bg}; color: #1C1A1A; box-shadow: 0 30px 60px -25px rgba(0,0,0,.7); ${extra}}
${sel} b { font: 800 32px/0.95 var(--display); letter-spacing: -0.03em; }
${sel} small { font: 700 11px/1 var(--text); letter-spacing: .16em; text-transform: uppercase; }`;
  const bgWrap = (inner = '', extra = '') => `<div class="x-bg" ${extra}>${inner}</div>`;
  const bgCss = (o, extra = '') => `.x-bg { position: absolute; inset: 0; overflow: hidden; background: ${o.bg || '#1C1A1A'}; ${extra}}`;
  const bgColor = (def = '#1C1A1A') => K.color(def, 'Couleur du fond', 'bg');

  // ---------- Cartes et 3D ----------
  K.add(
    {
      id: 'flip-card', cat: C, name: 'Carte qui se retourne', use: 'Recto : ton titre. Verso : les détails. Elle se retourne au survol.',
      tip: 'Passe la souris sur la carte', tipTouch: 'Touche la carte',
      controls: [K.text('Branding', 'Recto'), K.text('Logo, charte, papeterie, en 3 semaines.', 'Verso', 'back'), K.color('#F56E2E', 'Couleur recto', 'bg'), K.color('#F1E8CB', 'Couleur verso', 'bg2'), K.range('damping', 'Rebond', 6, 30, 1, 14)],
      html: (o) => `<div class="x-flipc"><div class="x-inner"><div class="x-face"><small>Service</small><b>${e(o.text)}</b><small>Survole ↻</small></div><div class="x-face x-back"><b>${e(o.back)}</b></div></div></div>`,
      css: (o) => `.x-flipc { perspective: 1000px; }
.x-inner { position: relative; width: 260px; aspect-ratio: 3 / 4; transform-style: preserve-3d; }
.x-face { position: absolute; inset: 0; padding: 22px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; background: ${o.bg}; color: #1C1A1A; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.x-back { background: ${o.bg2}; transform: rotateY(180deg); justify-content: center; }
.x-face b { font: 800 30px/1 var(--display); letter-spacing: -0.02em; }
.x-face small { font: 700 11px/1 var(--text); letter-spacing: .16em; text-transform: uppercase; }`,
      code(root, o, KM) {
        const card = root.querySelector('.x-flipc');
        const inner = root.querySelector('.x-inner');
        const ease = KM.spring({ stiffness: 140, damping: o.damping });
        card.addEventListener('pointerenter', () => KM.animate(inner, { rotateY: 180 }, { ease }));
        card.addEventListener('pointerleave', () => KM.animate(inner, { rotateY: 0 }, { ease }));
      },
    },
    {
      id: 'fan', cat: C, name: 'Éventail de cartes', use: 'Un paquet de cartes qui s’ouvre en éventail.',
      controls: [K.range('count', 'Nombre de cartes', 3, 7, 1, 5), K.range('angle', 'Ouverture', 5, 30, 1, 14, '°'), K.range('duration', 'Durée', 400, 3000, 50, 1200, 'ms'), K.ease('outBack')],
      html: (o) => `<div class="x-fan">${Array.from({ length: o.count }, (_, i) => `<div class="x-c" style="background:${PAL[i % PAL.length]}"><small>0${i + 1}</small><b>Projet ${i + 1}</b></div>`).join('')}</div>`,
      css: () => `.x-fan { position: relative; width: 200px; height: 280px; }
.x-c { position: absolute; inset: 0; padding: 18px; border-radius: 18px; display: flex; flex-direction: column; justify-content: space-between; color: #1C1A1A; box-shadow: 0 20px 40px -20px rgba(0,0,0,.8); transform-origin: 50% 110%; }
.x-c b { font: 800 26px/1 var(--display); }
.x-c small { font: 700 12px/1 var(--mono); }`,
      code(root, o, KM) {
        const cards = root.querySelectorAll('.x-c');
        const mid = (cards.length - 1) / 2;
        return KM.animate(cards, { rotate: (el, i) => [0, (i - mid) * o.angle], x: (el, i) => [0, (i - mid) * 26] }, { duration: o.duration, ease: o.ease, loop: true, yoyo: true, delay: 300 });
      },
    },
    {
      id: 'spotlight', cat: C, name: 'Carte projecteur', use: 'Une lumière suit le curseur sur la carte et son contour.',
      tip: 'Passe la souris sur la carte', tipTouch: 'Effet à la souris : essaie-le sur ordinateur',
      controls: [K.text('Offre Premium', 'Titre'), K.color('#F56E2E', 'Couleur de la lumière', 'glow'), K.range('radius', 'Taille de la lumière', 80, 500, 10, 260, 'px')],
      html: (o) => `<article class="x-spot"><small>Kaury Studio</small><b>${e(o.text)}</b><p>Site, identité et contenus pour lancer ta marque.</p></article>`,
      css: (o) => `.x-spot { width: 380px; padding: 30px; border-radius: 22px; display: grid; gap: 14px; color: #F1E8CB; background: radial-gradient(${o.radius}px circle at var(--x, 50%) var(--y, 0%), ${o.glow}33, transparent 60%), #24201E; box-shadow: inset 0 0 0 1px rgba(241,232,203,.12); position: relative; }
.x-spot::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; background: radial-gradient(${o.radius}px circle at var(--x, 50%) var(--y, 0%), ${o.glow}, transparent 60%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.x-spot b { font: 800 40px/1 var(--display); letter-spacing: -0.02em; }
.x-spot small { font: 700 12px/1 var(--text); letter-spacing: .16em; text-transform: uppercase; color: ${o.glow}; }
.x-spot p { margin: 0; color: rgba(241,232,203,.7); font-size: 18px; }`,
      code(root, o, KM) {
        const card = root.querySelector('.x-spot');
        card.addEventListener('pointermove', (ev) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--x', ((ev.clientX - r.left) / r.width) * 100 + '%');
          card.style.setProperty('--y', ((ev.clientY - r.top) / r.height) * 100 + '%');
        });
      },
    },
    {
      id: 'cube', cat: C, name: 'Cube 3D', use: 'Un cube aux couleurs de ta marque qui tourne dans l’espace.',
      controls: [K.range('size', 'Taille', 80, 300, 2, 180, 'px'), K.speed(1), K.color('#F56E2E', 'Couleur principale', 'c1'), K.color('#F1E8CB', 'Couleur secondaire', 'c2')],
      html: () => `<div class="x-cube-scene"><div class="x-cube">${['KAURY', 'MOTION', '3D', 'CUBE', '★', '◆'].map((t) => `<i>${t}</i>`).join('')}</div></div>`,
      css: (o) => `.x-cube-scene { perspective: 900px; }
.x-cube { position: relative; width: ${o.size}px; height: ${o.size}px; transform-style: preserve-3d; }
.x-cube i { position: absolute; inset: 0; display: grid; place-items: center; font: 800 ${o.size / 6}px/1 var(--display); font-style: normal; color: #1C1A1A; border-radius: 10px; }
.x-cube i:nth-child(odd) { background: ${o.c1}; } .x-cube i:nth-child(even) { background: ${o.c2}; }
.x-cube i:nth-child(1) { transform: translateZ(${o.size / 2}px); }
.x-cube i:nth-child(2) { transform: rotateY(90deg) translateZ(${o.size / 2}px); }
.x-cube i:nth-child(3) { transform: rotateY(180deg) translateZ(${o.size / 2}px); }
.x-cube i:nth-child(4) { transform: rotateY(-90deg) translateZ(${o.size / 2}px); }
.x-cube i:nth-child(5) { transform: rotateX(90deg) translateZ(${o.size / 2}px); }
.x-cube i:nth-child(6) { transform: rotateX(-90deg) translateZ(${o.size / 2}px); }`,
      code(root, o, KM) {
        const cube = root.querySelector('.x-cube');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed;
          KM.set(cube, { rotateX: -20 + Math.sin(s * 0.7) * 20, rotateY: s * 50 });
        });
      },
    },
    {
      id: 'carousel3d', cat: C, name: 'Carrousel 3D', use: 'Des cartes disposées en cercle qui tournent comme un manège.',
      controls: [K.range('count', 'Nombre de cartes', 4, 12, 1, 8), K.range('radius', 'Rayon', 150, 500, 10, 300, 'px'), K.speed(1), K.range('tiltX', 'Inclinaison', -30, 30, 1, -10, '°')],
      html: (o) => `<div class="x-car-scene"><div class="x-car">${Array.from({ length: o.count }, (_, i) => `<i style="background:${PAL[i % PAL.length]}">${String(i + 1).padStart(2, '0')}</i>`).join('')}</div></div>`,
      css: (o) => `.x-car-scene { perspective: 1100px; }
.x-car { position: relative; width: 140px; height: 190px; transform-style: preserve-3d; }
.x-car i { position: absolute; inset: 0; display: grid; place-items: center; border-radius: 16px; font: 800 44px/1 var(--display); font-style: normal; color: #1C1A1A; }`,
      code(root, o, KM) {
        const car = root.querySelector('.x-car');
        const items = car.querySelectorAll('i');
        items.forEach((it, i) => (it.style.transform = `rotateY(${(i * 360) / items.length}deg) translateZ(${o.radius}px)`));
        const start = KM.ticker.now();
        return KM.ticker.add((t) => KM.set(car, { rotateX: o.tiltX, rotateY: -((t - start) / 1000) * 30 * o.speed }));
      },
    },
    {
      id: 'depth-card', cat: C, name: 'Carte à étages', use: 'Les éléments de la carte ressortent à des profondeurs différentes.',
      tip: 'Passe la souris sur la carte', tipTouch: 'Effet à la souris : essaie-le sur ordinateur',
      controls: [K.text('Montagne', 'Titre'), K.range('depth', 'Profondeur', 10, 120, 5, 60, 'px'), K.range('max', 'Inclinaison', 5, 30, 1, 16, '°')],
      html: (o) => `<div class="x-dc"><div class="x-sky"></div><div class="x-sun"></div><div class="x-mtn"></div><b>${e(o.text)}</b></div>`,
      css: (o) => `.x-dc { position: relative; width: 300px; height: 380px; border-radius: 22px; background: #3A5F7D; transform-style: preserve-3d; }
.x-dc > * { position: absolute; }
.x-sky { inset: 0; border-radius: 22px; background: linear-gradient(#F7C548, #F56E2E); }
.x-sun { width: 90px; height: 90px; left: 105px; top: 70px; border-radius: 50%; background: #FFF4D6; transform: translateZ(${o.depth * 0.4}px); }
.x-mtn { left: 0; right: 0; bottom: 0; height: 55%; background: #1C1A1A; clip-path: polygon(0 100%, 0 45%, 25% 10%, 45% 50%, 65% 20%, 100% 60%, 100% 100%); border-radius: 0 0 22px 22px; transform: translateZ(${o.depth * 0.8}px); }
.x-dc b { left: 24px; bottom: 22px; font: 800 38px/1 var(--display); color: #F1E8CB; transform: translateZ(${o.depth * 1.3}px); }`,
      code(root, o, KM) {
        return KM.tilt(root.querySelector('.x-dc'), { max: o.max, glare: true, scale: 1.02, perspective: 800 });
      },
    },
    {
      id: 'glass', cat: C, name: 'Carte en verre', use: 'Une carte givrée devant des formes colorées qui bougent.',
      controls: [K.text('Glass UI', 'Titre'), K.range('blur', 'Flou du verre', 4, 40, 1, 18, 'px'), K.speed(1)],
      html: (o) => `<div class="x-glass-scene"><i class="x-b1"></i><i class="x-b2"></i><i class="x-b3"></i><article class="x-glass"><small>Kaury</small><b>${e(o.text)}</b><p>Transparence et lumière.</p></article></div>`,
      css: (o) => `.x-glass-scene { position: relative; width: 520px; height: 360px; display: grid; place-items: center; }
.x-glass-scene i { position: absolute; border-radius: 50%; }
.x-b1 { width: 200px; height: 200px; background: #F56E2E; left: 40px; top: 20px; }
.x-b2 { width: 160px; height: 160px; background: #F7C548; right: 50px; bottom: 20px; }
.x-b3 { width: 120px; height: 120px; background: #8DB58D; right: 150px; top: 30px; }
.x-glass { position: relative; width: 320px; padding: 28px; border-radius: 22px; display: grid; gap: 10px; color: #F1E8CB; background: rgba(241,232,203,.12); backdrop-filter: blur(${o.blur}px); -webkit-backdrop-filter: blur(${o.blur}px); box-shadow: inset 0 0 0 1px rgba(241,232,203,.3), 0 30px 60px -30px rgba(0,0,0,.6); }
.x-glass b { font: 800 40px/1 var(--display); }
.x-glass small { font: 700 12px/1 var(--text); letter-spacing: .16em; text-transform: uppercase; }
.x-glass p { margin: 0; opacity: .8; font-size: 18px; }`,
      code(root, o, KM) {
        const blobs = root.querySelectorAll('.x-glass-scene i');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed;
          blobs.forEach((b, i) => KM.set(b, { x: Math.sin(s * (0.6 + i * 0.2) + i) * 60, y: Math.cos(s * (0.5 + i * 0.15) + i * 2) * 40 }));
        });
      },
    },
    {
      id: 'stack', cat: C, name: 'Pile de cartes qui défile', use: 'La carte du dessus s’envole et passe derrière la pile.',
      controls: [K.range('pause', 'Temps par carte', 800, 4000, 100, 1800, 'ms'), K.range('count', 'Nombre de cartes', 3, 6, 1, 4), K.ease('inOutQuart')],
      html: (o) => `<div class="x-stack">${Array.from({ length: o.count }, (_, i) => `<div class="x-c" style="background:${PAL[i % PAL.length]}"><small>Avis ${i + 1}</small><b>« Un travail incroyable »</b><small>★★★★★</small></div>`).join('')}</div>`,
      css: () => `.x-stack { position: relative; width: 300px; height: 200px; }
.x-stack .x-c { position: absolute; inset: 0; padding: 22px; border-radius: 18px; display: flex; flex-direction: column; justify-content: space-between; color: #1C1A1A; box-shadow: 0 20px 40px -20px rgba(0,0,0,.8); }
.x-stack b { font: 800 26px/1.05 var(--display); }
.x-stack small { font: 700 12px/1 var(--text); letter-spacing: .1em; }`,
      code(root, o, KM) {
        let order = [...root.querySelectorAll('.x-stack .x-c')];
        const place = (instant) => order.forEach((c, i) => {
          c.style.zIndex = String(order.length - i);
          const p = { y: i * 16, scale: 1 - i * 0.06, opacity: i < 3 ? 1 : 0 };
          instant ? KM.set(c, p) : KM.animate(c, p, { duration: 600, ease: o.ease });
        });
        place(true);
        const id = setInterval(async () => {
          const top = order[0];
          await KM.animate(top, { y: -260, rotate: -12, opacity: 0 }, { duration: 500, ease: 'inQuart' }).finished;
          order = [...order.slice(1), top];
          KM.set(top, { rotate: 0 });
          place();
        }, o.pause);
        return () => clearInterval(id);
      },
    },
    {
      id: 'float-logo', cat: C, name: 'Logo qui lévite', use: 'Ton logo flotte doucement avec son ombre au sol.',
      controls: [K.range('y', 'Hauteur de flottement', 4, 60, 1, 20, 'px'), K.range('rotate', 'Balancement', 0, 20, 1, 5, '°'), K.range('duration', 'Durée d’un cycle', 1500, 8000, 100, 3600, 'ms'), K.range('size', 'Taille', 80, 300, 2, 170, 'px')],
      html: () => `<div class="x-lev"><div class="x-lev-logo">${K.LOGO}</div><i class="x-lev-shadow"></i></div>`,
      css: (o) => `.x-lev { display: grid; justify-items: center; gap: 30px; }
.x-lev-logo { width: ${o.size}px; } .x-lev-logo svg { display: block; width: 100%; height: auto; }
.x-lev-shadow { width: ${o.size * 0.8}px; height: 18px; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,.55), transparent); }`,
      code(root, o, KM) {
        return [
          KM.float(root.querySelector('.x-lev-logo'), { y: o.y, rotate: o.rotate, duration: o.duration }),
          KM.animate(root.querySelector('.x-lev-shadow'), { scale: [1.1, 0.8], opacity: [0.9, 0.5] }, { duration: o.duration / 2, ease: 'inOutSine', loop: true, yoyo: true }),
        ];
      },
    },
    {
      id: 'coin', cat: C, name: 'Pièce qui tourne', use: 'Ton logo devient une pièce épaisse qui tourne sur elle-même.',
      controls: [K.range('depth', 'Épaisseur', 4, 60, 1, 24, 'px'), K.speed(1), K.range('size', 'Taille', 80, 300, 2, 180, 'px')],
      html: () => `<div class="x-coin-scene"><div class="x-coin">${K.LOGO}</div></div>`,
      css: (o) => `.x-coin-scene { perspective: 900px; }
.x-coin { width: ${o.size}px; } .x-coin svg { display: block; width: 100%; height: auto; }`,
      code(root, o, KM) {
        const coin = root.querySelector('.x-coin');
        const stop = KM.extrude(coin, { depth: o.depth, layers: Math.max(6, o.depth), shade: 0.5 });
        const start = KM.ticker.now();
        return [stop, KM.ticker.add((t) => KM.set(coin, { rotateY: (((t - start) / 1000) * 120 * o.speed) % 360 }))];
      },
    },
  );

  // ---------- Défilement ----------
  K.add(
    {
      id: 'cross-bands', cat: D, name: 'Bandeaux croisés', use: 'Deux bandeaux inclinés qui défilent en sens opposés.',
      controls: [K.text('Branding, Web, Vidéo, Photo, Réseaux', 'Tes mots', 'words'), K.range('speed', 'Vitesse', 20, 300, 5, 90, 'px/s'), K.range('angle', 'Inclinaison', 0, 12, 1, 5, '°'), K.color('#F56E2E', 'Couleur 1', 'c1'), K.color('#F1E8CB', 'Couleur 2', 'c2')],
      html: (o) => { const items = o.words.split(',').map((w) => `<span>${e(w.trim())}</span><i>✦</i>`).join(''); return `<div class="x-cross"><div class="x-band x-b1">${items}</div><div class="x-band x-b2">${items}</div></div>`; },
      css: (o) => `.x-cross { position: relative; width: 100%; height: 320px; display: grid; place-items: center; overflow: hidden; }
.x-band { position: absolute; left: -10%; right: -10%; display: flex; align-items: center; padding-block: 16px; font: 800 44px/1 var(--display); text-transform: uppercase; white-space: nowrap; color: #1C1A1A; }
.x-band i { font-style: normal; font-size: .6em; }
.x-b1 { background: ${o.c1}; transform: rotate(-${o.angle}deg); }
.x-b2 { background: ${o.c2}; transform: rotate(${o.angle}deg); }`,
      code(root, o, KM) {
        return [
          KM.marquee(root.querySelector('.x-b1'), { speed: o.speed, gap: 30 }),
          KM.marquee(root.querySelector('.x-b2'), { speed: o.speed, direction: 'right', gap: 30 }),
        ];
      },
    },
    {
      id: 'logo-wall', cat: D, name: 'Mur de logos', use: 'Des colonnes qui défilent verticalement, pour tes clients ou partenaires.',
      controls: [K.text('AUMY, VERTESSE, ATHENIS, EQUINOX, HOLZKERN, QUICKPARK, CRUSH, VANITY', 'Noms des clients', 'names'), K.range('speed', 'Vitesse', 10, 120, 2, 40, 'px/s'), K.range('cols', 'Colonnes', 2, 5, 1, 4)],
      html: (o) => { const names = o.names.split(',').map((n) => n.trim()).filter(Boolean); return `<div class="x-wall">${Array.from({ length: o.cols }, (_, c) => `<div class="x-col">${[...names.slice(c), ...names.slice(0, c)].map((n) => `<span>${e(n)}</span>`).join('')}</div>`).join('')}</div>`; },
      css: (o) => `.x-wall { display: grid; grid-template-columns: repeat(${o.cols}, 170px); gap: 16px; height: 440px; overflow: hidden; -webkit-mask: linear-gradient(transparent, #000 20%, #000 80%, transparent); mask: linear-gradient(transparent, #000 20%, #000 80%, transparent); }
.x-col { display: grid; gap: 16px; align-content: start; }
.x-col span { display: grid; place-items: center; height: 90px; border-radius: 16px; background: #2A2624; color: #F1E8CB; font: 800 20px/1 var(--display); letter-spacing: .04em; }`,
      code(root, o, KM) {
        const cols = [...root.querySelectorAll('.x-col')];
        cols.forEach((c) => (c.innerHTML += c.innerHTML));
        const pos = cols.map(() => 0);
        return KM.ticker.add((t, dt) => cols.forEach((c, i) => {
          const h = c.scrollHeight / 2;
          pos[i] = (pos[i] + ((i % 2 ? 1 : -1) * o.speed * dt) / 1000) % h;
          KM.set(c, { y: pos[i] > 0 ? pos[i] - h : pos[i] });
        }));
      },
    },
    {
      id: 'outline-band', cat: D, name: 'Bandeau en contour', use: 'Un grand texte en contour qui défile lentement.',
      controls: [K.text('DESIGN · VIDÉO · WEB ·', 'Texte'), K.range('speed', 'Vitesse', 10, 200, 5, 60, 'px/s'), K.color('#F1E8CB', 'Couleur du contour'), K.size(140, 40, 260)],
      html: (o) => `<div class="x-ob"><span>${e(o.text)}</span></div>`,
      css: (o) => `.x-ob { width: 100%; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.02em; color: transparent; -webkit-text-stroke: 2px ${o.color}; white-space: nowrap; }`,
      code(root, o, KM) {
        return KM.marquee(root.querySelector('.x-ob'), { speed: o.speed, gap: 40, scrollBoost: 1 });
      },
    },
    {
      id: 'orbit', cat: D, name: 'Orbites', use: 'Des planètes tournent autour de ton logo, chacune à son rythme.',
      controls: [K.range('count', 'Nombre de planètes', 1, 6, 1, 3), K.speed(1), K.range('size', 'Taille du système', 200, 500, 10, 400, 'px')],
      html: (o) => `<div class="x-sys"><div class="x-sun">${K.LOGO}</div>${Array.from({ length: o.count }, (_, i) => `<i class="x-path" style="width:${40 + (i + 1) * (60 / o.count)}%;height:${40 + (i + 1) * (60 / o.count)}%"></i><b class="x-planet" style="background:${PAL[i % PAL.length]}"></b>`).join('')}</div>`,
      css: (o) => `.x-sys { position: relative; width: ${o.size}px; height: ${o.size}px; display: grid; place-items: center; }
.x-sys > * { position: absolute; }
.x-sun { width: 22%; } .x-sun svg { display: block; width: 100%; height: auto; }
.x-path { border-radius: 50%; border: 1px dashed rgba(241,232,203,.2); }
.x-planet { width: 18px; height: 18px; border-radius: 50%; }`,
      code(root, o, KM) {
        const planets = root.querySelectorAll('.x-planet');
        const size = root.querySelector('.x-sys').offsetWidth;
        const start = KM.ticker.now();
        return KM.ticker.add((t) => planets.forEach((p, i) => {
          const r = (size * (0.4 + (i + 1) * (0.6 / planets.length))) / 2;
          const a = ((t - start) / 1000) * o.speed * (1.4 / (i + 1)) + i * 2;
          KM.set(p, { x: Math.cos(a) * r, y: Math.sin(a) * r });
        }));
      },
    },
    {
      id: 'mouse-parallax', cat: D, name: 'Parallaxe à la souris', use: 'Des calques bougent à des vitesses différentes selon le curseur.',
      tip: 'Bouge la souris dans le cadre', tipTouch: 'Effet à la souris : essaie-le sur ordinateur',
      controls: [K.text('Profondeur', 'Titre'), K.range('force', 'Amplitude', 5, 80, 1, 30, 'px'), K.color('#F1E8CB')],
      html: (o) => `<div class="x-px"><i class="x-l1"></i><i class="x-l2"></i><i class="x-l3"></i><h2 class="x-lt">${e(o.text)}</h2></div>`,
      css: (o) => `.x-px { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }
.x-px i { position: absolute; border-radius: 50%; }
.x-l1 { width: 300px; height: 300px; background: #A83E0D; left: 10%; top: 10%; opacity: .6; }
.x-l2 { width: 180px; height: 180px; background: #F56E2E; right: 14%; bottom: 14%; }
.x-l3 { width: 70px; height: 70px; background: #F7C548; left: 58%; top: 18%; }
.x-lt { position: relative; margin: 0; font: 800 90px/1 var(--display); letter-spacing: -0.03em; color: ${o.color}; }`,
      code(root, o, KM) {
        const scene = root.querySelector('.x-px');
        const layers = [...scene.querySelectorAll('i'), scene.querySelector('.x-lt')];
        const depth = [0.4, 1, 1.8, 0.7];
        let tx = 0, ty = 0, x = 0, y = 0;
        scene.addEventListener('pointermove', (ev) => {
          const r = scene.getBoundingClientRect();
          tx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
          ty = ((ev.clientY - r.top) / r.height - 0.5) * 2;
        });
        scene.addEventListener('pointerleave', () => (tx = ty = 0));
        return KM.ticker.add(() => {
          x += (tx - x) * 0.08; y += (ty - y) * 0.08;
          layers.forEach((l, i) => KM.set(l, { x: -x * o.force * depth[i], y: -y * o.force * depth[i] }));
        });
      },
    },
    {
      id: 'word-list', cat: D, name: 'Liste qui défile', use: 'Une liste verticale de mots, le mot du centre est mis en valeur.',
      controls: [K.text('Branding, Sites web, Vidéo, Photo, Réseaux, Motion', 'Mots', 'words'), K.range('pause', 'Temps par mot', 600, 4000, 100, 1500, 'ms'), K.color('#F56E2E', 'Couleur du mot actif'), K.ease('outBack')],
      html: (o) => `<div class="x-wl"><div class="x-wl-in">${o.words.split(',').map((w) => `<span>${e(w.trim())}</span>`).join('')}</div></div>`,
      css: (o) => `.x-wl { height: 300px; overflow: hidden; -webkit-mask: linear-gradient(transparent, #000 35%, #000 65%, transparent); mask: linear-gradient(transparent, #000 35%, #000 65%, transparent); }
.x-wl span { display: block; height: 100px; line-height: 100px; text-align: center; font: 800 64px/100px var(--display); color: rgba(241,232,203,.35); transition: color .4s; }
.x-wl span.on { color: ${o.color}; }`,
      code(root, o, KM) {
        const inner = root.querySelector('.x-wl-in');
        const items = [...inner.children];
        let i = 0;
        const go = () => {
          items.forEach((s, k) => s.classList.toggle('on', k === i));
          KM.animate(inner, { y: 100 - i * 100 }, { duration: 700, ease: o.ease });
          i = (i + 1) % items.length;
        };
        go();
        const id = setInterval(go, o.pause);
        return () => clearInterval(id);
      },
    },
    {
      id: 'pendulum', cat: D, name: 'Enseigne qui se balance', use: 'Un panneau suspendu qui oscille comme au vent.',
      controls: [K.text('OUVERT', 'Texte du panneau'), K.range('angle', 'Amplitude', 2, 30, 1, 12, '°'), K.range('duration', 'Durée d’une oscillation', 800, 5000, 100, 2200, 'ms'), K.color('#F56E2E', 'Couleur du panneau', 'bg')],
      html: (o) => `<div class="x-sign"><i class="x-rope"></i><b>${e(o.text)}</b></div>`,
      css: (o) => `.x-sign { display: grid; justify-items: center; transform-origin: 50% 0; margin-top: -60px; }
.x-rope { width: 120px; height: 90px; border: 3px solid rgba(241,232,203,.5); border-bottom: 0; border-radius: 60px 60px 0 0; }
.x-sign b { padding: 24px 40px; border-radius: 14px; background: ${o.bg}; color: #1C1A1A; font: 800 54px/1 var(--display); letter-spacing: .04em; box-shadow: 0 20px 40px -20px rgba(0,0,0,.7); }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-sign'), { rotate: [-o.angle, o.angle] }, { duration: o.duration / 2, ease: 'inOutSine', loop: true, yoyo: true });
      },
    },
    {
      id: 'stock', cat: D, name: 'Défilé de chiffres', use: 'Un bandeau de chiffres façon bourse, pour tes résultats.',
      controls: [K.text('Clients +32 %, Vues +180 %, Ventes +54 %, Abonnés +12 %, Avis 4,9', 'Tes chiffres', 'items'), K.range('speed', 'Vitesse', 20, 200, 5, 70, 'px/s'), K.color('#8DB58D', 'Couleur des hausses', 'up')],
      html: (o) => `<div class="x-stock">${o.items.split(',').map((it) => { const [label, ...rest] = it.trim().split(' '); return `<span><b>${e(label)}</b> <em>${e(rest.join(' '))}</em></span>`; }).join('')}</div>`,
      css: (o) => `.x-stock { width: 100%; display: flex; padding-block: 18px; border-block: 1px solid rgba(241,232,203,.2); font: 600 30px/1 var(--mono); color: #F1E8CB; white-space: nowrap; }
.x-stock em { font-style: normal; color: ${o.up}; }
.x-stock em::before { content: ""; display: inline-block; margin-right: .3em; border: .28em solid transparent; border-bottom: .42em solid currentColor; border-top: 0; vertical-align: .12em; }`,
      code(root, o, KM) {
        return KM.marquee(root.querySelector('.x-stock'), { speed: o.speed, gap: 60 });
      },
    },
    {
      id: 'available', cat: D, name: 'Badge « Disponible »', use: 'Un petit badge qui tourne avec un point vert qui pulse.',
      controls: [K.text('Disponible pour projets · 2026 ·', 'Texte'), K.color('#8DB58D', 'Couleur du point', 'dot'), K.range('speed', 'Vitesse', -120, 120, 1, 30, '°/s')],
      html: (o) => `<div class="x-av"><div class="x-av-ring">${e(o.text)}</div><i class="x-av-dot"></i><i class="x-av-pulse"></i></div>`,
      css: (o) => `.x-av { position: relative; display: grid; place-items: center; color: #F1E8CB; font-family: var(--text); }
.x-av > * { grid-area: 1 / 1; }
.x-av i { width: 40px; height: 40px; border-radius: 50%; background: ${o.dot}; }`,
      code(root, o, KM) {
        return [
          KM.ring(root.querySelector('.x-av-ring'), { radius: 90, fontSize: 15, speed: o.speed }),
          KM.animate(root.querySelector('.x-av-pulse'), { scale: [1, 2.6], opacity: [0.6, 0] }, { duration: 1600, ease: 'outQuart', loop: true }),
        ];
      },
    },
  );

  // ---------- Fonds animés ----------
  K.add(
    {
      id: 'dot-wave', cat: F, name: 'Mer de points', use: 'Une grille de points qui ondule comme la surface de l’eau.',
      controls: [K.range('cols', 'Colonnes', 8, 30, 1, 22), K.range('rows', 'Lignes', 5, 18, 1, 12), K.speed(1), K.color('#F56E2E', 'Couleur des points')],
      html: (o) => `<div class="x-sea">${'<i></i>'.repeat(o.cols * o.rows)}</div>`,
      css: (o) => `.x-sea { display: grid; grid-template-columns: repeat(${o.cols}, 10px); gap: 22px 22px; }
.x-sea i { width: 10px; height: 10px; border-radius: 50%; background: ${o.color}; }`,
      code(root, o, KM) {
        const dots = root.querySelectorAll('.x-sea i');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed;
          dots.forEach((d, i) => {
            const x = i % o.cols, y = Math.floor(i / o.cols);
            const v = Math.sin(x * 0.45 + s * 2) * Math.cos(y * 0.5 + s * 1.3);
            KM.set(d, { y: v * 10, scale: 0.6 + (v + 1) * 0.5 });
          });
        });
      },
    },
    {
      id: 'blobs', cat: F, name: 'Dégradé vivant', use: 'Des taches de couleur floues qui dérivent lentement : un fond premium.',
      controls: [bgColor('#1C1A1A'), K.color('#F56E2E', 'Couleur 1', 'c1'), K.color('#F7C548', 'Couleur 2', 'c2'), K.color('#A83E0D', 'Couleur 3', 'c3'), K.speed(1), K.range('blur', 'Flou', 20, 160, 5, 90, 'px')],
      html: () => bgWrap('<i></i><i></i><i></i><h2>Fond vivant</h2>'),
      css: (o) => `${bgCss(o, 'display: grid; place-items: center;')}
.x-bg i { position: absolute; width: 360px; height: 360px; border-radius: 50%; filter: blur(${o.blur}px); opacity: .9; }
.x-bg i:nth-child(1) { background: ${o.c1}; } .x-bg i:nth-child(2) { background: ${o.c2}; } .x-bg i:nth-child(3) { background: ${o.c3}; }
.x-bg h2 { position: relative; margin: 0; font: 800 72px/1 var(--display); color: #F1E8CB; letter-spacing: -0.03em; }`,
      code(root, o, KM) {
        const blobs = root.querySelectorAll('.x-bg i');
        const bg = root.querySelector('.x-bg');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed * 0.4;
          const w = bg.clientWidth / 2, h = bg.clientHeight / 2;
          blobs.forEach((b, i) => KM.set(b, { x: w - 180 + Math.sin(s * (1 + i * 0.3) + i * 2) * w * 0.6, y: h - 180 + Math.cos(s * (0.8 + i * 0.25) + i) * h * 0.6 }));
        });
      },
    },
    {
      id: 'aurora', cat: F, name: 'Aurore boréale', use: 'Des voiles de lumière qui ondulent dans un ciel sombre.',
      controls: [bgColor('#0F1419'), K.color('#8DB58D', 'Couleur 1', 'c1'), K.color('#4FD1C5', 'Couleur 2', 'c2'), K.color('#F56E2E', 'Couleur 3', 'c3'), K.speed(0.6)],
      html: () => bgWrap('<i></i><i></i><i></i>'),
      css: (o) => `${bgCss(o)}
.x-bg i { position: absolute; left: -20%; width: 140%; height: 45%; top: 20%; border-radius: 50%; filter: blur(50px); mix-blend-mode: screen; opacity: .75; }
.x-bg i:nth-child(1) { background: linear-gradient(90deg, transparent, ${o.c1}, transparent); }
.x-bg i:nth-child(2) { background: linear-gradient(90deg, transparent, ${o.c2}, transparent); top: 32%; }
.x-bg i:nth-child(3) { background: linear-gradient(90deg, transparent, ${o.c3}, transparent); top: 44%; opacity: .45; }`,
      code(root, o, KM) {
        const veils = root.querySelectorAll('.x-bg i');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed;
          veils.forEach((v, i) => KM.set(v, { x: Math.sin(s * 0.5 + i) * 80, y: Math.sin(s * 0.8 + i * 2) * 40, skewY: Math.sin(s * 0.6 + i) * 8, scaleY: 1 + Math.sin(s + i) * 0.3 }));
        });
      },
    },
    {
      id: 'stars-bg', cat: F, name: 'Ciel étoilé', use: 'Des étoiles qui scintillent et dérivent doucement.',
      controls: [bgColor('#0E0D14'), K.range('count', 'Nombre d’étoiles', 30, 300, 5, 140), K.speed(1), K.color('#F1E8CB', 'Couleur des étoiles')],
      html: () => bgWrap(),
      css: (o) => `${bgCss(o)}
.x-bg i { position: absolute; border-radius: 50%; background: ${o.color}; }`,
      code(root, o, KM) {
        const bg = root.querySelector('.x-bg');
        const W = bg.clientWidth, H = bg.clientHeight;
        const stars = Array.from({ length: o.count }, () => {
          const s = document.createElement('i');
          const z = Math.random();
          s.style.width = s.style.height = 1 + z * 3 + 'px';
          bg.appendChild(s);
          return { s, x: Math.random() * W, y: Math.random() * H, z, p: Math.random() * 6 };
        });
        return KM.ticker.add((t, dt) => stars.forEach((st) => {
          st.x -= (dt / 1000) * o.speed * 12 * (0.3 + st.z);
          if (st.x < -4) st.x = W + 4;
          KM.set(st.s, { x: st.x, y: st.y });
          st.s.style.opacity = String(0.3 + 0.7 * Math.abs(Math.sin(t / 700 + st.p)));
        }));
      },
    },
    {
      id: 'rays', cat: F, name: 'Rayons de soleil', use: 'Des rayons qui tournent lentement derrière ton titre.',
      controls: [K.text('Nouveau !', 'Titre'), bgColor('#F56E2E'), K.color('#F7C548', 'Couleur des rayons', 'ray'), K.range('rays', 'Nombre de rayons', 6, 36, 2, 18), K.speed(1)],
      html: (o) => bgWrap(`<div class="x-rays"></div><h2>${e(o.text)}</h2>`),
      css: (o) => `${bgCss(o, 'display: grid; place-items: center;')}
.x-rays { position: absolute; width: 200%; aspect-ratio: 1; background: repeating-conic-gradient(${o.ray} 0 ${180 / o.rays}deg, transparent ${180 / o.rays}deg ${360 / o.rays}deg); opacity: .55; }
.x-bg h2 { position: relative; margin: 0; font: 800 96px/1 var(--display); color: #1C1A1A; letter-spacing: -0.03em; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-rays'), { rotate: [0, 360] }, { duration: 40000 / o.speed, ease: 'linear', loop: true });
      },
    },
    {
      id: 'shapes', cat: F, name: 'Formes qui flottent', use: 'Cercles, triangles et carrés qui dérivent en tournant.',
      controls: [bgColor(), K.range('count', 'Nombre de formes', 4, 30, 1, 14), K.speed(1)],
      html: () => bgWrap(),
      css: (o) => `${bgCss(o)}
.x-bg b { position: absolute; left: 0; top: 0; }`,
      code(root, o, KM) {
        const bg = root.querySelector('.x-bg');
        const W = bg.clientWidth, H = bg.clientHeight;
        const kinds = ['50%', '0', 'triangle'];
        const colors = ['#F56E2E', '#F1E8CB', '#F7C548', '#8DB58D'];
        const items = Array.from({ length: o.count }, (_, i) => {
          const el = document.createElement('b');
          const size = 20 + Math.random() * 50;
          const kind = kinds[i % 3];
          el.style.width = el.style.height = size + 'px';
          el.style.background = colors[i % colors.length];
          if (kind === 'triangle') el.style.clipPath = 'polygon(50% 0, 100% 100%, 0 100%)';
          else el.style.borderRadius = kind;
          bg.appendChild(el);
          return { el, x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 30, r: Math.random() * 360, vr: (Math.random() - 0.5) * 60 };
        });
        return KM.ticker.add((t, dt) => items.forEach((it) => {
          const k = (dt / 1000) * o.speed;
          it.x += it.vx * k; it.y += it.vy * k; it.r += it.vr * k;
          if (it.y < -80) it.y = H + 40;
          if (it.x < -80) it.x = W + 40; else if (it.x > W + 80) it.x = -40;
          KM.set(it.el, { x: it.x, y: it.y, rotate: it.r });
        }));
      },
    },
    {
      id: 'bubbles', cat: F, name: 'Bulles', use: 'Des bulles transparentes montent et oscillent.',
      controls: [bgColor('#12303A'), K.range('count', 'Nombre de bulles', 5, 60, 1, 24), K.speed(1), K.color('#F1E8CB', 'Couleur des bulles')],
      html: () => bgWrap(),
      css: (o) => `${bgCss(o)}
.x-bg i { position: absolute; left: 0; top: 0; border-radius: 50%; border: 2px solid ${o.color}; opacity: .5; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.4), transparent 40%); }`,
      code(root, o, KM) {
        const bg = root.querySelector('.x-bg');
        const W = bg.clientWidth, H = bg.clientHeight;
        const items = Array.from({ length: o.count }, () => {
          const el = document.createElement('i');
          const size = 10 + Math.random() * 50;
          el.style.width = el.style.height = size + 'px';
          bg.appendChild(el);
          return { el, x: Math.random() * W, y: Math.random() * H, v: 30 + Math.random() * 60, p: Math.random() * 6 };
        });
        return KM.ticker.add((t, dt) => items.forEach((it) => {
          it.y -= (it.v * dt * o.speed) / 1000;
          if (it.y < -60) it.y = H + 20;
          KM.set(it.el, { x: it.x + Math.sin(t / 600 + it.p) * 14, y: it.y });
        }));
      },
    },
    {
      id: 'synth-grid', cat: F, name: 'Grille rétro', use: 'Une grille en perspective qui avance, style années 80.',
      controls: [bgColor('#170B24'), K.color('#F56E2E', 'Couleur de la grille', 'line'), K.color('#F7C548', 'Couleur du soleil', 'sun'), K.speed(1)],
      html: () => bgWrap('<div class="x-sun"></div><div class="x-floor"></div>'),
      css: (o) => `${bgCss(o)}
.x-sun { position: absolute; left: 50%; top: 14%; width: 220px; height: 220px; margin-left: -110px; border-radius: 50%; background: linear-gradient(${o.sun}, ${o.line}); box-shadow: 0 0 80px ${o.line}; }
.x-floor { position: absolute; left: -50%; right: -50%; bottom: -10%; height: 70%; transform: perspective(300px) rotateX(60deg); transform-origin: bottom; background-image: linear-gradient(${o.line} 2px, transparent 2px), linear-gradient(90deg, ${o.line} 2px, transparent 2px); background-size: 60px 60px; -webkit-mask: linear-gradient(transparent, #000 40%); mask: linear-gradient(transparent, #000 40%); }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-floor'), { backgroundPosition: ['0px 0px', '0px 60px'] }, { duration: 900 / o.speed, ease: 'linear', loop: true });
      },
    },
    {
      id: 'matrix', cat: F, name: 'Pluie de code', use: 'Des colonnes de caractères qui tombent, façon Matrix.',
      controls: [bgColor('#050805'), K.color('#8DB58D', 'Couleur des caractères'), K.speed(1), K.range('font', 'Taille des caractères', 10, 30, 1, 16, 'px')],
      html: () => bgWrap('<canvas></canvas>'),
      css: (o) => `${bgCss(o)}
.x-bg canvas { width: 100%; height: 100%; display: block; }`,
      code(root, o, KM) {
        const cv = root.querySelector('.x-bg canvas');
        const W = (cv.width = cv.clientWidth), H = (cv.height = cv.clientHeight);
        const g = cv.getContext('2d');
        const glyphs = 'アイウエオカキクケコ0123456789KAURY';
        const cols = Math.floor(W / o.font);
        const drops = Array.from({ length: cols }, () => Math.random() * -40);
        let acc = 0;
        return KM.ticker.add((t, dt) => {
          acc += dt * o.speed;
          if (acc < 50) return;
          acc = 0;
          g.fillStyle = o.bg + 'CC';
          g.fillRect(0, 0, W, H);
          g.fillStyle = o.color;
          g.font = `${o.font}px monospace`;
          drops.forEach((d, i) => {
            g.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * o.font, d * o.font);
            drops[i] = d * o.font > H && Math.random() > 0.97 ? 0 : d + 1;
          });
        });
      },
    },
    {
      id: 'snow', cat: F, name: 'Neige', use: 'Des flocons tombent doucement : parfait pour les fêtes.',
      controls: [bgColor('#1B2430'), K.range('count', 'Nombre de flocons', 20, 300, 5, 120), K.speed(1), K.range('wind', 'Vent', -2, 2, 0.1, 0.4)],
      html: () => bgWrap(),
      css: (o) => `${bgCss(o)}
.x-bg i { position: absolute; left: 0; top: 0; border-radius: 50%; background: #FFFFFF; }`,
      code(root, o, KM) {
        const bg = root.querySelector('.x-bg');
        const W = bg.clientWidth, H = bg.clientHeight;
        const flakes = Array.from({ length: o.count }, () => {
          const el = document.createElement('i');
          const z = Math.random();
          el.style.width = el.style.height = 2 + z * 6 + 'px';
          el.style.opacity = String(0.4 + z * 0.6);
          bg.appendChild(el);
          return { el, x: Math.random() * W, y: Math.random() * H, z, p: Math.random() * 6 };
        });
        return KM.ticker.add((t, dt) => flakes.forEach((f) => {
          const k = (dt / 1000) * o.speed;
          f.y += (20 + f.z * 50) * k;
          f.x += o.wind * 30 * k + Math.sin(t / 900 + f.p) * 0.3;
          if (f.y > H + 10) f.y = -10;
          if (f.x > W + 10) f.x = -10; else if (f.x < -10) f.x = W + 10;
          KM.set(f.el, { x: f.x, y: f.y });
        }));
      },
    },
    {
      id: 'confetti-rain', cat: F, name: 'Pluie de confettis', use: 'Des confettis colorés tombent en tournoyant.',
      controls: [bgColor(), K.range('count', 'Nombre de confettis', 20, 200, 5, 80), K.speed(1)],
      html: () => bgWrap(),
      css: (o) => `${bgCss(o)}
.x-bg i { position: absolute; left: 0; top: 0; width: 10px; height: 16px; border-radius: 2px; }`,
      code(root, o, KM) {
        const bg = root.querySelector('.x-bg');
        const W = bg.clientWidth, H = bg.clientHeight;
        const colors = ['#F56E2E', '#F1E8CB', '#F7C548', '#8DB58D', '#4FD1C5'];
        const bits = Array.from({ length: o.count }, (_, i) => {
          const el = document.createElement('i');
          el.style.background = colors[i % colors.length];
          bg.appendChild(el);
          return { el, x: Math.random() * W, y: Math.random() * H, v: 60 + Math.random() * 90, r: Math.random() * 360, vr: 90 + Math.random() * 270, p: Math.random() * 6 };
        });
        return KM.ticker.add((t, dt) => bits.forEach((b) => {
          const k = (dt / 1000) * o.speed;
          b.y += b.v * k; b.r += b.vr * k;
          if (b.y > H + 20) b.y = -20;
          KM.set(b.el, { x: b.x + Math.sin(t / 500 + b.p) * 20, y: b.y, rotate: b.r, rotateX: b.r * 1.3 });
        }));
      },
    },
    {
      id: 'spot-bg', cat: F, name: 'Lampe torche', use: 'Le fond est dans le noir et le curseur l’éclaire.',
      tip: 'Bouge la souris dans le cadre', tipTouch: 'Effet à la souris : essaie-le sur ordinateur',
      controls: [K.text('Trouve le message caché', 'Texte caché'), K.range('radius', 'Taille de la lampe', 60, 400, 10, 240, 'px'), K.color('#F56E2E', 'Couleur du texte')],
      html: (o) => bgWrap(`<h2>${e(o.text)}</h2><div class="x-dark"></div>`),
      css: (o) => `${bgCss({ bg: '#241F1D' }, 'display: grid; place-items: center;')}
.x-bg h2 { margin: 0; padding: 0 8%; text-align: center; font: 800 76px/1 var(--display); color: ${o.color}; letter-spacing: -0.03em; }
.x-dark { position: absolute; inset: 0; background: radial-gradient(${o.radius}px circle at var(--x, 50%) var(--y, 50%), transparent 0, rgba(8,7,7,.97) 100%); }`,
      code(root, o, KM) {
        const bg = root.querySelector('.x-bg');
        const dark = root.querySelector('.x-dark');
        const pos = { x: 30, y: 40 };
        let tx = 30, ty = 40, user = false;
        bg.addEventListener('pointermove', (ev) => {
          const r = bg.getBoundingClientRect();
          user = true;
          tx = ((ev.clientX - r.left) / r.width) * 100;
          ty = ((ev.clientY - r.top) / r.height) * 100;
        });
        return KM.ticker.add((t) => {
          if (!user) { tx = 50 + Math.sin(t / 900) * 30; ty = 50 + Math.cos(t / 1300) * 20; }
          pos.x += (tx - pos.x) * 0.12; pos.y += (ty - pos.y) * 0.12;
          dark.style.setProperty('--x', pos.x + '%');
          dark.style.setProperty('--y', pos.y + '%');
        });
      },
    },
    {
      id: 'sine-lines', cat: F, name: 'Lignes ondulantes', use: 'Des lignes fines qui ondulent comme un signal.',
      controls: [bgColor(), K.range('lines', 'Nombre de lignes', 2, 16, 1, 8), K.range('amp', 'Amplitude', 5, 120, 1, 50, 'px'), K.speed(1), K.color('#F56E2E', 'Couleur des lignes')],
      html: () => bgWrap('<svg></svg>'),
      css: (o) => `${bgCss(o)}
.x-bg svg { width: 100%; height: 100%; display: block; }
.x-bg path { fill: none; stroke: ${o.color}; stroke-width: 2; }`,
      code(root, o, KM) {
        const svg = root.querySelector('.x-bg svg');
        const W = svg.clientWidth, H = svg.clientHeight;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        const paths = Array.from({ length: o.lines }, (_, i) => {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.style.opacity = String(0.25 + (i / o.lines) * 0.75);
          svg.appendChild(p);
          return p;
        });
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed;
          paths.forEach((p, i) => {
            let d = '';
            for (let x = 0; x <= W; x += 16) {
              const y = H / 2 + Math.sin(x / 90 + s * 1.6 + i * 0.5) * o.amp * Math.sin(s * 0.5 + i * 0.3 + x / 400);
              d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
            }
            p.setAttribute('d', d);
          });
        });
      },
    },
    {
      id: 'constellation', cat: F, name: 'Constellation', use: 'Des points reliés par des lignes qui se font et se défont.',
      controls: [bgColor('#12101A'), K.range('count', 'Nombre de points', 20, 140, 5, 70), K.range('link', 'Distance des liens', 40, 200, 5, 110, 'px'), K.speed(1), K.color('#F1E8CB', 'Couleur')],
      html: () => bgWrap('<canvas></canvas>'),
      css: (o) => `${bgCss(o)}
.x-bg canvas { width: 100%; height: 100%; display: block; }`,
      code(root, o, KM) {
        const cv = root.querySelector('.x-bg canvas');
        const W = (cv.width = cv.clientWidth), H = (cv.height = cv.clientHeight);
        const g = cv.getContext('2d');
        const pts = Array.from({ length: o.count }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40 }));
        return KM.ticker.add((t, dt) => {
          const k = (dt / 1000) * o.speed;
          g.clearRect(0, 0, W, H);
          g.fillStyle = g.strokeStyle = o.color;
          pts.forEach((p) => {
            p.x += p.vx * k; p.y += p.vy * k;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            g.beginPath(); g.arc(p.x, p.y, 2.2, 0, Math.PI * 2); g.fill();
          });
          for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
            const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
            if (d < o.link) {
              g.globalAlpha = 1 - d / o.link;
              g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[j].x, pts[j].y); g.stroke();
            }
          }
          g.globalAlpha = 1;
        });
      },
    },
    {
      id: 'checker', cat: F, name: 'Damier qui respire', use: 'Des carrés qui grossissent et rétrécissent en vague diagonale.',
      controls: [bgColor(), K.range('cols', 'Colonnes', 6, 24, 1, 14), K.range('rows', 'Lignes', 4, 14, 1, 9), K.speed(1), K.color('#F56E2E', 'Couleur des carrés')],
      html: (o) => `<div class="x-chk">${'<i></i>'.repeat(o.cols * o.rows)}</div>`,
      css: (o) => `.x-chk { display: grid; grid-template-columns: repeat(${o.cols}, 36px); }
.x-chk i { width: 36px; height: 36px; background: ${o.color}; }`,
      code(root, o, KM) {
        const cells = root.querySelectorAll('.x-chk i');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const s = ((t - start) / 1000) * o.speed;
          cells.forEach((c, i) => {
            const x = i % o.cols, y = Math.floor(i / o.cols);
            const v = (Math.sin((x + y) * 0.5 - s * 2.5) + 1) / 2;
            KM.set(c, { scale: +(0.1 + v * 0.8).toFixed(3), rotate: +(v * 45).toFixed(2) });
          });
        });
      },
    },
  );
})(window.KMS);
