/* Kaury Motion Studio : effets « Boutons », « Micro-interactions » et « Chargements ». */
(function (K) {
  'use strict';
  const B = 'Boutons', I = 'Micro-interactions', L = 'Chargements';
  const e = K.esc;
  const btnCss = (sel, o, extra = '') => `${sel} { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 12px; padding: 32px 58px; border: 0; border-radius: 999px; background: ${o.bg}; color: ${o.fg}; font: 800 ${o.size || 36}px/1 var(--display); letter-spacing: -0.01em; cursor: pointer; ${extra}}`;
  const bg = (def = '#F56E2E') => K.color(def, 'Couleur du bouton', 'bg');
  const fg = (def = '#1C1A1A') => K.color(def, 'Couleur du texte', 'fg');
  const hoverTip = { tip: 'Passe la souris sur le bouton', tipTouch: 'Touche le bouton' };

  // ---------- Boutons ----------
  K.add(
    {
      id: 'btn-fill', cat: B, name: 'Remplissage qui glisse', use: 'Au survol, une couleur remplit le bouton de gauche à droite.', ...hoverTip,
      controls: [K.text('Voir nos projets', 'Texte du bouton'), bg('#1C1A1A'), fg('#F1E8CB'), K.color('#F56E2E', 'Couleur de remplissage', 'fill'), K.color('#1C1A1A', 'Texte au survol', 'fg2')],
      html: (o) => `<button class="x-btn" type="button"><span class="x-fill-bg"></span><span class="x-label">${e(o.text)}</span></button>`,
      css: (o) => `${btnCss('.x-btn', o, 'box-shadow: inset 0 0 0 2px ' + o.fg + ';')}
.x-fill-bg { position: absolute; inset: 0; background: ${o.fill}; transform: scaleX(0); transform-origin: left; }
.x-label { position: relative; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const fill = root.querySelector('.x-fill-bg');
        const label = root.querySelector('.x-label');
        btn.addEventListener('pointerenter', () => {
          fill.style.transformOrigin = 'left';
          KM.animate(fill, { scaleX: [0, 1] }, { duration: 500, ease: 'kaury' });
          KM.animate(label, { color: o.fg2 }, { duration: 300 });
        });
        btn.addEventListener('pointerleave', () => {
          fill.style.transformOrigin = 'right';
          KM.animate(fill, { scaleX: [1, 0] }, { duration: 500, ease: 'kaury' });
          KM.animate(label, { color: o.fg }, { duration: 300 });
        });
      },
    },
    {
      id: 'btn-shine', cat: B, name: 'Reflet qui passe', use: 'Un éclat de lumière traverse le bouton à intervalles réguliers.',
      controls: [K.text('Réserver maintenant', 'Texte du bouton'), bg(), fg(), K.range('every', 'Un reflet toutes les', 800, 6000, 100, 2600, 'ms')],
      html: (o) => `<button class="x-btn" type="button">${e(o.text)}<span class="x-shine"></span></button>`,
      css: (o) => `${btnCss('.x-btn', o)}
.x-shine { position: absolute; top: -20%; bottom: -20%; left: 0; width: 30%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); transform: translateX(-150%) skewX(-20deg); }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-shine'), { x: ['-150%', '450%'] }, { duration: 900, ease: 'inOutSine', loop: true, delay: o.every - 900 });
      },
    },
    {
      id: 'btn-pulse', cat: B, name: 'Bouton qui appelle', use: 'Des ondes partent du bouton pour attirer le regard.',
      controls: [K.text('Appelle-nous', 'Texte du bouton'), bg(), fg(), K.range('rings', 'Nombre d’ondes', 1, 4, 1, 2), K.range('duration', 'Durée d’une onde', 800, 4000, 100, 2000, 'ms')],
      html: (o) => `<div class="x-pulse">${'<span class="x-wave"></span>'.repeat(o.rings)}<button class="x-btn" type="button">${e(o.text)}</button></div>`,
      css: (o) => `.x-pulse { position: relative; display: grid; place-items: center; }
.x-pulse > * { grid-area: 1 / 1; }
${btnCss('.x-btn', o)}
.x-wave { width: 100%; height: 100%; border-radius: 999px; background: ${o.bg}; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelectorAll('.x-wave'), { scaleX: [1, 1.25], scaleY: [1, 1.9], opacity: [0.55, 0] }, { duration: o.duration, delay: KM.stagger(o.duration / o.rings), ease: 'outQuart', loop: true });
      },
    },
    {
      id: 'btn-jelly', cat: B, name: 'Bouton gélatine', use: 'Il s’écrase et rebondit comme de la gelée au survol.', ...hoverTip,
      controls: [K.text('Clique ici', 'Texte du bouton'), bg(), fg(), K.range('damping', 'Rebonds', 3, 20, 0.5, 7, '', 'Petit = plus de rebonds.')],
      html: (o) => `<button class="x-btn" type="button">${e(o.text)}</button>`,
      css: (o) => btnCss('.x-btn', o, 'overflow: visible;'),
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const ease = KM.spring({ stiffness: 260, damping: o.damping });
        btn.addEventListener('pointerenter', () => KM.animate(btn, { scaleX: [1.25, 1], scaleY: [0.78, 1] }, { ease }));
        btn.addEventListener('pointerdown', () => KM.animate(btn, { scaleX: [0.85, 1], scaleY: [1.15, 1] }, { ease }));
      },
    },
    {
      id: 'btn-arrow', cat: B, name: 'Flèche qui file', use: 'La flèche part vers la droite et une nouvelle arrive.', ...hoverTip,
      controls: [K.text('Découvrir', 'Texte du bouton'), bg('#F1E8CB'), fg()],
      html: (o) => `<button class="x-btn" type="button">${e(o.text)}<span class="x-arrow"><svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg><svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span></button>`,
      css: (o) => `${btnCss('.x-btn', o)}
.x-arrow { position: relative; width: 38px; height: 38px; overflow: hidden; }
.x-arrow svg { position: absolute; inset: 0; width: 38px; height: 38px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.x-arrow svg + svg { transform: translateX(-120%); }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const [a, b] = root.querySelectorAll('.x-arrow svg');
        btn.addEventListener('pointerenter', () => {
          KM.animate(a, { x: ['0%', '120%'] }, { duration: 450, ease: 'inOutQuart' });
          KM.animate(b, { x: ['-120%', '0%'] }, { duration: 450, delay: 120, ease: 'inOutQuart' });
        });
        btn.addEventListener('pointerleave', () => {
          KM.set(a, { x: '0%' });
          KM.set(b, { x: '-120%' });
        });
      },
    },
    {
      id: 'btn-border', cat: B, name: 'Bordure qui se dessine', use: 'Le contour du bouton se trace au survol.', ...hoverTip,
      controls: [K.text('Nous contacter', 'Texte du bouton'), K.color('#F1E8CB', 'Couleur du texte', 'fg'), K.color('#F56E2E', 'Couleur du contour', 'line'), K.range('duration', 'Durée', 300, 2000, 50, 900, 'ms')],
      html: (o) => `<button class="x-btn" type="button"><svg class="x-border" viewBox="0 0 300 80" preserveAspectRatio="none"><rect x="1.5" y="1.5" width="297" height="77" rx="38.5" pathLength="1"/></svg>${e(o.text)}</button>`,
      css: (o) => `${btnCss('.x-btn', { ...o, bg: 'transparent' }, 'overflow: visible; min-width: 420px; justify-content: center;')}
.x-border { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke: ${o.line}; stroke-width: 3; stroke-dasharray: 1; stroke-dashoffset: 1; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const rect = root.querySelector('.x-border rect');
        btn.addEventListener('pointerenter', () => KM.animate(rect, { strokeDashoffset: [1, 0] }, { duration: o.duration, ease: 'inOutQuart' }));
        btn.addEventListener('pointerleave', () => KM.animate(rect, { strokeDashoffset: 1 }, { duration: o.duration / 2, ease: 'inOutQuart' }));
        return KM.animate(rect, { strokeDashoffset: [1, 0] }, { duration: o.duration, delay: 500, ease: 'inOutQuart' });
      },
    },
    {
      id: 'btn-ripple', cat: B, name: 'Onde au clic', use: 'Une onde part de l’endroit exact où tu cliques.',
      tip: 'Clique plusieurs fois sur le bouton', tipTouch: 'Touche le bouton',
      controls: [K.text('Clique-moi', 'Texte du bouton'), bg('#1C1A1A'), fg('#F1E8CB'), K.color('#F56E2E', 'Couleur de l’onde', 'wave'), K.range('duration', 'Durée', 300, 2000, 50, 800, 'ms')],
      html: (o) => `<button class="x-btn" type="button"><span class="x-label">${e(o.text)}</span></button>`,
      css: (o) => `${btnCss('.x-btn', o, 'box-shadow: inset 0 0 0 2px ' + o.wave + ';')}
.x-label { position: relative; z-index: 1; }
.x-drop { position: absolute; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; background: ${o.wave}; pointer-events: none; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        btn.addEventListener('pointerdown', async (ev) => {
          const r = btn.getBoundingClientRect();
          const k = r.width / btn.offsetWidth;
          const d = document.createElement('span');
          d.className = 'x-drop';
          d.style.left = (ev.clientX - r.left) / k + 'px';
          d.style.top = (ev.clientY - r.top) / k + 'px';
          btn.appendChild(d);
          await KM.animate(d, { scale: [0, 14], opacity: [0.9, 0] }, { duration: o.duration, ease: 'outQuart' }).finished;
          d.remove();
        });
      },
    },
    {
      id: 'btn-glow', cat: B, name: 'Lueur qui suit la souris', use: 'Une lumière douce suit le curseur à l’intérieur du bouton.', ...hoverTip,
      controls: [K.text('Commencer', 'Texte du bouton'), bg('#24201E'), fg('#F1E8CB'), K.color('#F56E2E', 'Couleur de la lueur', 'glow'), K.range('radius', 'Taille de la lueur', 40, 300, 10, 140, 'px')],
      html: (o) => `<button class="x-btn" type="button"><span class="x-label">${e(o.text)}</span></button>`,
      css: (o) => `${btnCss('.x-btn', o, `box-shadow: inset 0 0 0 1px rgba(241,232,203,.2); background-image: radial-gradient(${o.radius}px circle at var(--x, 50%) var(--y, 50%), ${o.glow}, transparent 70%); background-repeat: no-repeat;`)}
.x-label { position: relative; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        btn.addEventListener('pointermove', (ev) => {
          const r = btn.getBoundingClientRect();
          btn.style.setProperty('--x', ((ev.clientX - r.left) / r.width) * 100 + '%');
          btn.style.setProperty('--y', ((ev.clientY - r.top) / r.height) * 100 + '%');
        });
      },
    },
    {
      id: 'btn-press', cat: B, name: 'Bouton 3D qui s’enfonce', use: 'Un gros bouton en relief qui s’écrase quand on appuie.',
      tip: 'Appuie sur le bouton', tipTouch: 'Appuie sur le bouton',
      controls: [K.text('APPUIE', 'Texte du bouton'), bg(), fg(), K.range('depth', 'Relief', 4, 20, 1, 10, 'px')],
      html: (o) => `<button class="x-btn" type="button">${e(o.text)}</button>`,
      css: (o) => btnCss('.x-btn', o, `overflow: visible; border-radius: 22px; box-shadow: 0 ${o.depth}px 0 #A83E0D, 0 ${o.depth + 14}px 30px rgba(0,0,0,.45);`),
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const up = `0 ${o.depth}px 0 #A83E0D, 0 ${o.depth + 14}px 30px rgba(0,0,0,.45)`;
        const down = '0 0px 0 #A83E0D, 0 4px 10px rgba(0,0,0,.45)';
        let pressed = false;
        btn.addEventListener('pointerdown', () => {
          pressed = true;
          KM.animate(btn, { y: [0, o.depth], boxShadow: [up, down] }, { duration: 90, ease: 'outQuad' });
        });
        const release = () => {
          if (!pressed) return;
          pressed = false;
          KM.animate(btn, { y: [o.depth, 0], boxShadow: [down, up] }, { ease: KM.spring({ stiffness: 400, damping: 12 }) });
        };
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointerleave', release);
      },
    },
    {
      id: 'btn-confetti', cat: B, name: 'Confettis au clic', use: 'Une explosion de confettis quand on clique : parfait pour « Merci ! ».',
      tip: 'Clique sur le bouton', tipTouch: 'Touche le bouton',
      controls: [K.text('Je m’inscris 🎉', 'Texte du bouton'), bg(), fg(), K.range('count', 'Nombre de confettis', 8, 80, 1, 36), K.range('power', 'Puissance', 80, 500, 10, 260, 'px')],
      html: (o) => `<div class="x-conf"><button class="x-btn" type="button">${e(o.text)}</button></div>`,
      css: (o) => `.x-conf { position: relative; }
${btnCss('.x-btn', o, 'overflow: visible;')}
.x-bit { position: absolute; left: 50%; top: 50%; width: 10px; height: 16px; border-radius: 2px; pointer-events: none; }`,
      code(root, o, KM) {
        const box = root.querySelector('.x-conf');
        const colors = ['#F56E2E', '#F1E8CB', '#F7C548', '#8DB58D', '#FFFFFF'];
        root.querySelector('.x-btn').addEventListener('click', () => {
          for (let i = 0; i < o.count; i++) {
            const b = document.createElement('span');
            b.className = 'x-bit';
            b.style.background = colors[i % colors.length];
            box.appendChild(b);
            const a = Math.random() * Math.PI * 2, p = o.power * (0.4 + Math.random() * 0.6);
            KM.animate(b, { x: [0, Math.cos(a) * p], y: [0, Math.sin(a) * p + 120], rotate: [0, (Math.random() - 0.5) * 720], opacity: [1, 0] }, { duration: 900 + Math.random() * 500, ease: 'outQuart' }).finished.then(() => b.remove());
          }
          KM.animate(root.querySelector('.x-btn'), { scale: [0.9, 1] }, { ease: KM.spring({ stiffness: 300, damping: 10 }) });
        });
      },
    },
    {
      id: 'btn-roll', cat: B, name: 'Texte qui roule', use: 'Au survol, le texte monte et est remplacé par une copie venue d’en bas.', ...hoverTip,
      controls: [K.text('Voir le travail', 'Texte du bouton'), bg('#F1E8CB'), fg(), K.range('each', 'Décalage entre lettres', 0, 60, 2, 18, 'ms')],
      html: (o) => `<button class="x-btn" type="button"><span class="x-roll"><span class="x-a">${e(o.text)}</span><span class="x-b" aria-hidden="true">${e(o.text)}</span></span></button>`,
      css: (o) => `${btnCss('.x-btn', o)}
.x-roll { position: relative; display: block; overflow: hidden; padding-bottom: 0.1em; }
.x-b { position: absolute; left: 0; top: 0; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const a = KM.split(root.querySelector('.x-a'), { type: 'chars' }).chars;
        const b = KM.split(root.querySelector('.x-b'), { type: 'chars' }).chars;
        KM.set(b, { y: '110%' });
        btn.addEventListener('pointerenter', () => {
          KM.animate(a, { y: ['0%', '-110%'] }, { duration: 500, delay: KM.stagger(o.each), ease: 'kaury' });
          KM.animate(b, { y: ['110%', '0%'] }, { duration: 500, delay: KM.stagger(o.each), ease: 'kaury' });
        });
        btn.addEventListener('pointerleave', () => {
          KM.animate(a, { y: '0%' }, { duration: 400, delay: KM.stagger(o.each), ease: 'kaury' });
          KM.animate(b, { y: '110%' }, { duration: 400, delay: KM.stagger(o.each), ease: 'kaury' });
        });
      },
    },
    {
      id: 'btn-breathe', cat: B, name: 'Bouton qui respire', use: 'Il gonfle très doucement, comme une respiration, pour inviter au clic.',
      controls: [K.text('Réserve ta place', 'Texte du bouton'), bg(), fg(), K.range('amount', 'Amplitude', 1.01, 1.15, 0.01, 1.05, '×'), K.range('duration', 'Durée d’une respiration', 800, 5000, 100, 2400, 'ms')],
      html: (o) => `<button class="x-btn" type="button">${e(o.text)}</button>`,
      css: (o) => btnCss('.x-btn', o, `overflow: visible; box-shadow: 0 0 0 0 ${o.bg};`),
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        return KM.animate(btn, { scale: [1, o.amount], boxShadow: [`0 0 0px 0px ${o.bg}88`, `0 0 40px 6px ${o.bg}44`] }, { duration: o.duration / 2, ease: 'inOutSine', loop: true, yoyo: true });
      },
    },
  );

  // ---------- Micro-interactions ----------
  K.add(
    {
      id: 'like', cat: I, name: 'Cœur « J’aime »', use: 'Le cœur éclate en petites bulles quand on clique.',
      tip: 'Clique sur le cœur', tipTouch: 'Touche le cœur',
      controls: [K.color('#F56E2E', 'Couleur du cœur'), K.range('size', 'Taille', 60, 300, 2, 190, 'px'), K.range('count', 'Nombre de bulles', 4, 24, 1, 12)],
      html: () => `<button class="x-like" type="button" aria-pressed="false" aria-label="J’aime"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.8 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z"/></svg></button>`,
      css: (o) => `.x-like { position: relative; width: ${o.size}px; height: ${o.size}px; border: 0; background: none; cursor: pointer; }
.x-like svg { width: 100%; height: 100%; fill: transparent; stroke: #F1E8CB; stroke-width: 1.5; transition: fill .2s; }
.x-like[aria-pressed="true"] svg { fill: ${o.color}; stroke: ${o.color}; }
.x-dot { position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; margin: -6px; border-radius: 50%; background: ${o.color}; pointer-events: none; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-like');
        btn.addEventListener('click', () => {
          const on = btn.getAttribute('aria-pressed') !== 'true';
          btn.setAttribute('aria-pressed', String(on));
          KM.animate(btn.querySelector('svg'), { scale: on ? [0.3, 1] : [1.2, 1] }, { ease: KM.spring({ stiffness: 320, damping: 9 }) });
          if (!on) return;
          for (let i = 0; i < o.count; i++) {
            const d = document.createElement('span');
            d.className = 'x-dot';
            btn.appendChild(d);
            const a = (i / o.count) * Math.PI * 2;
            KM.animate(d, { x: [0, Math.cos(a) * o.size * 0.75], y: [0, Math.sin(a) * o.size * 0.75], scale: [1, 0] }, { duration: 700, ease: 'outQuart' }).finished.then(() => d.remove());
          }
        });
      },
    },
    {
      id: 'switch', cat: I, name: 'Interrupteur à ressort', use: 'Un bouton on/off qui glisse avec un petit rebond.',
      tip: 'Clique sur l’interrupteur', tipTouch: 'Touche l’interrupteur',
      controls: [K.color('#F56E2E', 'Couleur allumé', 'on'), K.color('#4A4542', 'Couleur éteint', 'off'), K.range('size', 'Taille', 60, 300, 2, 200, 'px'), K.range('damping', 'Rebond', 4, 30, 1, 11)],
      html: () => `<button class="x-switch" type="button" role="switch" aria-checked="false" aria-label="Activer"><span class="x-knob"></span></button>`,
      css: (o) => `.x-switch { position: relative; width: ${o.size}px; height: ${o.size / 1.8}px; padding: 0; border: 0; border-radius: 999px; background: ${o.off}; cursor: pointer; }
.x-knob { position: absolute; top: 8%; left: 5%; width: 46%; height: 84%; border-radius: 50%; background: #F1E8CB; box-shadow: 0 4px 10px rgba(0,0,0,.3); }`,
      code(root, o, KM) {
        const sw = root.querySelector('.x-switch');
        const knob = root.querySelector('.x-knob');
        sw.addEventListener('click', () => {
          const on = sw.getAttribute('aria-checked') !== 'true';
          sw.setAttribute('aria-checked', String(on));
          const ease = KM.spring({ stiffness: 300, damping: o.damping });
          KM.animate(knob, { x: on ? sw.offsetWidth * 0.45 : 0, scaleX: [1.3, 1] }, { ease });
          KM.animate(sw, { backgroundColor: on ? o.on : o.off }, { duration: 250 });
        });
      },
    },
    {
      id: 'check', cat: I, name: 'Coche qui se dessine', use: 'Une validation claire : le cercle puis la coche se tracent.',
      replay: 3500,
      controls: [K.color('#8DB58D', 'Couleur'), K.range('size', 'Taille', 60, 300, 2, 200, 'px'), K.range('duration', 'Durée', 300, 2500, 50, 1000, 'ms'), K.text('Paiement confirmé', 'Message', 'text')],
      html: (o) => `<div class="x-ok"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" pathLength="1"/><path d="M15 27l7 7 15-15" pathLength="1"/></svg><p>${e(o.text)}</p></div>`,
      css: (o) => `.x-ok { display: grid; justify-items: center; gap: 18px; }
.x-ok svg { width: ${o.size}px; height: ${o.size}px; fill: none; stroke: ${o.color}; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.x-ok circle, .x-ok path { stroke-dasharray: 1; stroke-dashoffset: 1; }
.x-ok p { margin: 0; font: 700 32px/1.2 var(--text); color: #F1E8CB; }`,
      code(root, o, KM) {
        return KM.timeline({ defaults: { ease: 'inOutQuart' } })
          .add(root.querySelector('.x-ok circle'), { strokeDashoffset: [1, 0] }, { duration: o.duration * 0.6 })
          .add(root.querySelector('.x-ok path'), { strokeDashoffset: [1, 0] }, { duration: o.duration * 0.4 }, '-=100')
          .add(root.querySelector('.x-ok p'), { opacity: [0, 1], y: [12, 0] }, { duration: 500 }, '-=200');
      },
    },
    {
      id: 'burger', cat: I, name: 'Menu burger → croix', use: 'Les trois traits du menu se transforment en croix.',
      tip: 'Clique sur le menu', tipTouch: 'Touche le menu',
      controls: [K.color('#F1E8CB', 'Couleur des traits'), K.range('size', 'Taille', 40, 260, 2, 170, 'px'), K.ease('outBack')],
      html: () => `<button class="x-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>`,
      css: (o) => `.x-burger { position: relative; width: ${o.size}px; height: ${o.size}px; border: 0; background: none; cursor: pointer; }
.x-burger i { position: absolute; left: 15%; width: 70%; height: 8%; border-radius: 99px; background: ${o.color}; }
.x-burger i:nth-child(1) { top: 26%; } .x-burger i:nth-child(2) { top: 46%; } .x-burger i:nth-child(3) { top: 66%; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-burger');
        const [a, b, c] = btn.querySelectorAll('i');
        const d = o.size * 0.2;
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') !== 'true';
          btn.setAttribute('aria-expanded', String(open));
          KM.animate(a, { y: open ? d : 0, rotate: open ? 45 : 0 }, { duration: 500, ease: o.ease });
          KM.animate(b, { scaleX: open ? 0 : 1, opacity: open ? 0 : 1 }, { duration: 300 });
          KM.animate(c, { y: open ? -d : 0, rotate: open ? -45 : 0 }, { duration: 500, ease: o.ease });
        });
      },
    },
    {
      id: 'notif', cat: I, name: 'Badge de notification', use: 'Une pastille qui saute quand un nouveau message arrive.',
      controls: [K.color('#F56E2E', 'Couleur du badge'), K.range('every', 'Nouveau message toutes les', 800, 5000, 100, 1800, 'ms'), K.range('size', 'Taille de la cloche', 60, 300, 2, 190, 'px')],
      html: () => `<div class="x-bell"><svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 1 1 12 0v6l2 2H4z"/><path d="M10 21h4"/></svg><span class="x-badge">0</span></div>`,
      css: (o) => `.x-bell { position: relative; width: ${o.size}px; height: ${o.size}px; }
.x-bell svg { width: 100%; height: 100%; fill: none; stroke: #F1E8CB; stroke-width: 1.6; stroke-linejoin: round; }
.x-badge { position: absolute; top: 2%; right: 0; min-width: 38%; height: 38%; padding: 0 8%; display: grid; place-items: center; border-radius: 999px; background: ${o.color}; color: #1C1A1A; font: 800 ${o.size / 5}px/1 var(--text); }`,
      code(root, o, KM) {
        const badge = root.querySelector('.x-badge');
        const bell = root.querySelector('.x-bell svg');
        let n = 0;
        const id = setInterval(() => {
          badge.textContent = ++n > 99 ? '99+' : n;
          KM.animate(badge, { scale: [0.2, 1] }, { ease: KM.spring({ stiffness: 380, damping: 8 }) });
          KM.animate(bell, { rotate: [18, 0] }, { ease: KM.spring({ stiffness: 200, damping: 4 }) });
        }, o.every);
        return () => clearInterval(id);
      },
    },
    {
      id: 'stars', cat: I, name: 'Note en étoiles', use: 'Les étoiles s’allument une à une au survol et au clic.',
      tip: 'Passe sur les étoiles et clique', tipTouch: 'Touche une étoile',
      controls: [K.color('#F7C548', 'Couleur des étoiles'), K.range('size', 'Taille', 30, 140, 2, 96, 'px'), K.range('value', 'Note de départ', 0, 5, 1, 4)],
      html: () => `<div class="x-stars" role="radiogroup" aria-label="Note">${[1, 2, 3, 4, 5].map((n) => `<button type="button" role="radio" aria-label="${n} sur 5"><svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg></button>`).join('')}</div>`,
      css: (o) => `.x-stars { display: flex; gap: 8px; }
.x-stars button { width: ${o.size}px; height: ${o.size}px; padding: 0; border: 0; background: none; cursor: pointer; }
.x-stars svg { width: 100%; height: 100%; fill: #3A3533; stroke: none; }
.x-stars .on svg { fill: ${o.color}; }`,
      code(root, o, KM) {
        const stars = [...root.querySelectorAll('.x-stars button')];
        let value = o.value;
        const show = (n, pop) => stars.forEach((s, i) => {
          const was = s.classList.contains('on');
          s.classList.toggle('on', i < n);
          if (pop && i < n && !was) KM.animate(s, { scale: [0.4, 1], rotate: [-30, 0] }, { delay: i * 40, ease: KM.spring({ stiffness: 300, damping: 9 }) });
        });
        stars.forEach((s, i) => {
          s.addEventListener('pointerenter', () => show(i + 1, true));
          s.addEventListener('click', () => { value = i + 1; KM.animate(stars.slice(0, value), { scale: [1.35, 1] }, { delay: KM.stagger(40), ease: KM.spring({ stiffness: 300, damping: 8 }) }); });
        });
        root.querySelector('.x-stars').addEventListener('pointerleave', () => show(value, false));
        show(value, true);
      },
    },
    {
      id: 'field', cat: I, name: 'Champ de formulaire vivant', use: 'Le libellé remonte et un trait se dessine quand on écrit.',
      tip: 'Clique dans le champ et écris', tipTouch: 'Touche le champ et écris',
      controls: [K.text('Ton e-mail', 'Libellé'), K.color('#F56E2E', 'Couleur active', 'accent'), K.range('width', 'Largeur', 240, 700, 10, 560, 'px')],
      html: (o) => `<label class="x-field"><input type="email" placeholder=" " autocomplete="off"><span class="x-lab">${e(o.text)}</span><i class="x-bar"></i></label>`,
      css: (o) => `.x-field { position: relative; display: block; width: ${o.width}px; padding-top: 22px; }
.x-field input { width: 100%; padding: 12px 0; border: 0; border-bottom: 2px solid rgba(241,232,203,.3); background: none; color: #F1E8CB; font: 500 32px/1.2 var(--text); outline: none; }
.x-lab { position: absolute; left: 0; top: 36px; color: rgba(241,232,203,.6); font: 500 32px/1 var(--text); transform-origin: left; pointer-events: none; }
.x-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: ${o.accent}; transform: scaleX(0); }`,
      code(root, o, KM) {
        const input = root.querySelector('.x-field input');
        const lab = root.querySelector('.x-lab');
        const bar = root.querySelector('.x-bar');
        const up = () => {
          KM.animate(lab, { y: -34, scale: 0.65, color: o.accent }, { duration: 400, ease: 'kaury' });
          KM.animate(bar, { scaleX: 1 }, { duration: 500, ease: 'kaury' });
        };
        const down = () => {
          if (input.value) return KM.animate(lab, { color: 'rgba(241, 232, 203, 0.6)' }, { duration: 300 });
          KM.animate(lab, { y: 0, scale: 1, color: 'rgba(241, 232, 203, 0.6)' }, { duration: 400, ease: 'kaury' });
          KM.animate(bar, { scaleX: 0 }, { duration: 400, ease: 'kaury' });
        };
        input.addEventListener('focus', up);
        input.addEventListener('blur', down);
      },
    },
    {
      id: 'copy-done', cat: I, name: 'Bouton « Copié ! »', use: 'L’icône se transforme en coche pour confirmer une action.',
      tip: 'Clique sur le bouton', tipTouch: 'Touche le bouton',
      controls: [K.text('Copier le lien', 'Texte'), K.text('Copié !', 'Texte après le clic', 'done'), bg('#F1E8CB'), fg(), K.color('#8DB58D', 'Couleur de confirmation', 'ok')],
      html: (o) => `<button class="x-btn" type="button"><span class="x-ico"><svg class="x-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg><svg class="x-tick" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span><span class="x-txt">${e(o.text)}</span></button>`,
      css: (o) => `${btnCss('.x-btn', { ...o, size: 30 })}
.x-ico { position: relative; width: 34px; height: 34px; }
.x-ico svg { position: absolute; inset: 0; width: 34px; height: 34px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.x-tick { opacity: 0; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const txt = root.querySelector('.x-txt');
        const copy = root.querySelector('.x-copy');
        const tick = root.querySelector('.x-tick');
        btn.addEventListener('click', () => {
          txt.textContent = o.done;
          KM.animate(copy, { scale: [1, 0], opacity: [1, 0] }, { duration: 200 });
          KM.animate(tick, { scale: [0, 1], opacity: [0, 1], rotate: [-45, 0] }, { ease: KM.spring({ stiffness: 300, damping: 10 }) });
          KM.animate(btn, { backgroundColor: o.ok }, { duration: 250 });
          setTimeout(() => {
            txt.textContent = o.text;
            KM.animate(tick, { opacity: 0, scale: 0 }, { duration: 200 });
            KM.animate(copy, { opacity: 1, scale: 1 }, { duration: 300 });
            KM.animate(btn, { backgroundColor: o.bg }, { duration: 300 });
          }, 1800);
        });
      },
    },
    {
      id: 'tabs', cat: I, name: 'Onglets à pastille glissante', use: 'La pastille glisse vers l’onglet choisi avec un ressort.',
      tip: 'Clique sur les onglets', tipTouch: 'Touche les onglets',
      controls: [K.text('Tout, Branding, Web, Vidéo', 'Onglets', 'tabs', 'Sépare-les par des virgules.'), K.color('#F56E2E', 'Couleur de la pastille', 'pill'), K.range('damping', 'Rebond', 6, 40, 1, 16)],
      html: (o) => `<div class="x-tabs"><span class="x-pill"></span>${o.tabs.split(',').map((t, i) => `<button type="button" aria-pressed="${i === 0}">${e(t.trim())}</button>`).join('')}</div>`,
      css: (o) => `.x-tabs { position: relative; display: flex; gap: 4px; padding: 6px; border-radius: 999px; background: #2A2624; }
.x-tabs button { position: relative; z-index: 1; padding: 20px 32px; border: 0; background: none; color: #F1E8CB; font: 700 28px/1 var(--text); cursor: pointer; }
.x-tabs button[aria-pressed="true"] { color: #1C1A1A; }
.x-pill { position: absolute; top: 6px; bottom: 6px; left: 0; border-radius: 999px; background: ${o.pill}; }`,
      code(root, o, KM) {
        const pill = root.querySelector('.x-pill');
        const tabs = [...root.querySelectorAll('.x-tabs button')];
        const go = (b, instant) => {
          tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
          const props = { x: b.offsetLeft, width: b.offsetWidth };
          instant ? KM.set(pill, props) : KM.animate(pill, props, { ease: KM.spring({ stiffness: 260, damping: o.damping }) });
        };
        tabs.forEach((t) => t.addEventListener('click', () => go(t)));
        go(tabs[0], true);
      },
    },
    {
      id: 'plane', cat: I, name: 'Envoi en avion de papier', use: 'Le bouton « Envoyer » s’envole en avion de papier.',
      tip: 'Clique sur Envoyer', tipTouch: 'Touche Envoyer',
      controls: [K.text('Envoyer', 'Texte'), K.text('Envoyé !', 'Texte après l’envoi', 'done'), bg(), fg()],
      html: (o) => `<button class="x-btn" type="button"><svg class="x-plane" viewBox="0 0 24 24"><path d="M3 11l18-8-8 18-2-8z"/></svg><span class="x-txt">${e(o.text)}</span></button>`,
      css: (o) => `${btnCss('.x-btn', o, 'overflow: visible;')}
.x-plane { width: 40px; height: 40px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linejoin: round; }`,
      code(root, o, KM) {
        const btn = root.querySelector('.x-btn');
        const plane = root.querySelector('.x-plane');
        const txt = root.querySelector('.x-txt');
        btn.addEventListener('click', async () => {
          await KM.timeline()
            .add(plane, { x: [0, -10], rotate: [0, -20] }, { duration: 250, ease: 'outQuad' })
            .add(plane, { x: 420, y: -260, rotate: 25, opacity: [1, 0] }, { duration: 800, ease: 'inQuart' })
            .finished;
          txt.textContent = o.done;
          KM.animate(txt, { scale: [0.6, 1] }, { ease: KM.spring({ stiffness: 300, damping: 10 }) });
          setTimeout(() => {
            txt.textContent = o.text;
            KM.set(plane, { x: 0, y: 0, rotate: 0 });
            KM.animate(plane, { opacity: [0, 1], scale: [0, 1] }, { duration: 400 });
          }, 1600);
        });
      },
    },
  );

  // ---------- Chargements ----------
  const loaderColor = (def = '#F56E2E') => K.color(def, 'Couleur');
  K.add(
    {
      id: 'dots', cat: L, name: 'Trois points', use: 'Le classique « ça charge » avec trois points qui sautent.',
      controls: [loaderColor(), K.range('size', 'Taille des points', 8, 80, 1, 40, 'px'), K.range('duration', 'Vitesse', 300, 2000, 50, 700, 'ms')],
      html: () => `<div class="x-dots"><i></i><i></i><i></i></div>`,
      css: (o) => `.x-dots { display: flex; gap: ${o.size / 2}px; }
.x-dots i { width: ${o.size}px; height: ${o.size}px; border-radius: 50%; background: ${o.color}; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelectorAll('.x-dots i'), { y: [0, -o.size * 1.2] }, { duration: o.duration / 2, delay: KM.stagger(o.duration / 5), ease: 'inOutSine', loop: true, yoyo: true });
      },
    },
    {
      id: 'spinner', cat: L, name: 'Arc qui tourne', use: 'Un anneau de chargement élégant qui s’étire en tournant.',
      controls: [loaderColor(), K.range('size', 'Taille', 40, 320, 2, 200, 'px'), K.range('thick', 'Épaisseur', 2, 24, 1, 12, 'px'), K.speed()],
      html: () => `<svg class="x-spin" viewBox="0 0 50 50"><circle class="x-track" cx="25" cy="25" r="20"/><circle class="x-arc" cx="25" cy="25" r="20" pathLength="100"/></svg>`,
      css: (o) => `.x-spin { width: ${o.size}px; height: ${o.size}px; }
.x-spin circle { fill: none; stroke-width: ${o.thick / (o.size / 50)}; stroke-linecap: round; }
.x-track { stroke: rgba(241,232,203,.12); }
.x-arc { stroke: ${o.color}; stroke-dasharray: 30 100; transform-origin: center; transform-box: fill-box; }`,
      code(root, o, KM) {
        const arc = root.querySelector('.x-arc');
        return [
          KM.animate(arc, { rotate: [0, 360] }, { duration: 1100 / o.speed, ease: 'linear', loop: true }),
          KM.animate(arc, { strokeDasharray: ['8 100', '60 100'] }, { duration: 800 / o.speed, ease: 'inOutSine', loop: true, yoyo: true }),
        ];
      },
    },
    {
      id: 'bar', cat: L, name: 'Barre de progression', use: 'Une barre qui se remplit avec le pourcentage affiché.',
      replay: 4200,
      controls: [loaderColor(), K.range('width', 'Largeur', 200, 760, 10, 620, 'px'), K.range('duration', 'Durée', 800, 6000, 100, 3000, 'ms'), K.ease('inOutQuart')],
      html: () => `<div class="x-bar"><div class="x-bar-top"><span>Chargement</span><b class="x-pct">0 %</b></div><div class="x-track"><div class="x-fill"></div></div></div>`,
      css: (o) => `.x-bar { width: ${o.width}px; display: grid; gap: 16px; color: #F1E8CB; font: 700 30px/1 var(--text); }
.x-bar-top { display: flex; justify-content: space-between; }
.x-pct { font-variant-numeric: tabular-nums; color: ${o.color}; }
.x-track { height: 16px; border-radius: 99px; background: rgba(241,232,203,.12); overflow: hidden; }
.x-fill { height: 100%; width: 100%; border-radius: 99px; background: ${o.color}; transform-origin: left; transform: scaleX(0); }`,
      code(root, o, KM) {
        const fill = root.querySelector('.x-fill');
        const pct = root.querySelector('.x-pct');
        const state = { p: 0 };
        return KM.animate(state, { p: [0, 100] }, {
          duration: o.duration, ease: o.ease,
          onUpdate: () => { KM.set(fill, { scaleX: state.p / 100 }); pct.textContent = Math.round(state.p) + ' %'; },
        });
      },
    },
    {
      id: 'balls', cat: L, name: 'Balles qui rebondissent', use: 'Des balles rebondissent au sol, à tour de rôle.',
      controls: [loaderColor(), K.range('count', 'Nombre de balles', 2, 6, 1, 3), K.range('size', 'Taille', 12, 80, 1, 46, 'px'), K.range('height', 'Hauteur du rebond', 30, 260, 5, 150, 'px')],
      html: (o) => `<div class="x-balls">${'<i></i>'.repeat(o.count)}</div>`,
      css: (o) => `.x-balls { display: flex; align-items: flex-end; gap: ${o.size / 1.5}px; height: ${o.height + o.size}px; }
.x-balls i { width: ${o.size}px; height: ${o.size}px; border-radius: 50%; background: ${o.color}; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelectorAll('.x-balls i'), { y: [-o.height, 0] }, { duration: 500, delay: KM.stagger(120), ease: 'outBounce', loop: true, yoyo: true });
      },
    },
    {
      id: 'orbit-loader', cat: L, name: 'Satellites', use: 'Deux points tournent en orbite l’un autour de l’autre.',
      controls: [loaderColor(), K.color('#F1E8CB', 'Deuxième couleur', 'color2'), K.range('size', 'Taille', 40, 320, 2, 220, 'px'), K.speed()],
      html: () => `<div class="x-orbit"><i></i><i></i></div>`,
      css: (o) => `.x-orbit { position: relative; width: ${o.size}px; height: ${o.size}px; }
.x-orbit i { position: absolute; left: 50%; top: 50%; width: ${o.size / 5}px; height: ${o.size / 5}px; margin: ${-o.size / 10}px; border-radius: 50%; background: ${o.color}; }
.x-orbit i + i { background: ${o.color2}; }`,
      code(root, o, KM) {
        const [a, b] = root.querySelectorAll('.x-orbit i');
        const start = KM.ticker.now();
        return KM.ticker.add((t) => {
          const k = ((t - start) / 1000) * o.speed * Math.PI * 2;
          const r = o.size / 2.6;
          KM.set(a, { x: Math.cos(k) * r, y: Math.sin(k * 2) * r * 0.5, scale: 1 + Math.sin(k) * 0.25 });
          KM.set(b, { x: -Math.cos(k) * r, y: -Math.sin(k * 2) * r * 0.5, scale: 1 - Math.sin(k) * 0.25 });
        });
      },
    },
    {
      id: 'squares', cat: L, name: 'Grille qui pulse', use: 'Une grille de carrés qui s’allument en vague diagonale.',
      controls: [loaderColor(), K.range('cell', 'Taille des carrés', 12, 80, 1, 50, 'px'), K.range('duration', 'Vitesse', 400, 3000, 50, 1200, 'ms')],
      html: () => `<div class="x-sq">${'<i></i>'.repeat(9)}</div>`,
      css: (o) => `.x-sq { display: grid; grid-template-columns: repeat(3, ${o.cell}px); gap: ${o.cell / 4}px; }
.x-sq i { width: ${o.cell}px; height: ${o.cell}px; border-radius: ${o.cell / 5}px; background: ${o.color}; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelectorAll('.x-sq i'), { scale: [1, 0.2], opacity: [1, 0.3], rotate: [0, 90] }, { duration: o.duration / 2, delay: KM.stagger(90, { grid: [3, 3], from: 0 }), ease: 'inOutSine', loop: true, yoyo: true });
      },
    },
    {
      id: 'skeleton', cat: L, name: 'Squelette de chargement', use: 'Des blocs gris qui scintillent en attendant le contenu.',
      controls: [K.color('#2E2927', 'Couleur des blocs', 'base'), K.color('#4A4340', 'Couleur du reflet', 'shine'), K.range('duration', 'Vitesse du reflet', 600, 4000, 100, 1600, 'ms')],
      html: () => `<div class="x-skel"><div class="x-sk x-img"></div><div class="x-sk x-l1"></div><div class="x-sk x-l2"></div><div class="x-sk x-l3"></div></div>`,
      css: (o) => `.x-skel { width: 540px; display: grid; gap: 14px; padding: 22px; border-radius: 20px; background: #221F1D; }
.x-sk { border-radius: 10px; background: linear-gradient(100deg, ${o.base} 30%, ${o.shine} 50%, ${o.base} 70%) 0 0 / 300% 100%; }
.x-img { height: 180px; } .x-l1 { height: 22px; width: 70%; } .x-l2 { height: 16px; } .x-l3 { height: 16px; width: 55%; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelectorAll('.x-sk'), { backgroundPosition: ['100% 0%', '0% 0%'] }, { duration: o.duration, ease: 'linear', loop: true });
      },
    },
    {
      id: 'logo-load', cat: L, name: 'Logo qui se remplit', use: 'Ton logo se remplit de couleur comme une jauge.',
      controls: [K.image(), K.range('size', 'Taille du logo', 80, 300, 2, 180, 'px'), K.range('duration', 'Durée', 800, 5000, 100, 2200, 'ms'), K.ease('inOutQuart')],
      html: (o) => `<div class="x-lload"><div class="x-ghost">${K.logo(o)}</div><div class="x-full">${K.logo(o)}</div></div>`,
      css: (o) => `.x-lload { position: relative; width: ${o.size}px; height: ${o.size}px; }
.x-lload > div { position: absolute; inset: 0; }
.x-lload svg, .x-lload img { width: 100%; height: 100%; display: block; object-fit: contain; }
.x-ghost { opacity: .18; filter: grayscale(1); }
.x-full { clip-path: inset(100% 0 0 0); }`,
      code(root, o, KM) {
        return KM.animate(root.querySelector('.x-full'), { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: o.duration, ease: o.ease, loop: true, yoyo: true });
      },
    },
    {
      id: 'ring-progress', cat: L, name: 'Anneau de progression', use: 'Un cercle qui se remplit jusqu’au pourcentage choisi.',
      replay: 4000,
      controls: [loaderColor(), K.range('value', 'Pourcentage', 1, 100, 1, 78, '%'), K.range('size', 'Taille', 80, 360, 2, 260, 'px'), K.range('duration', 'Durée', 500, 4000, 100, 1800, 'ms'), K.ease('outExpo')],
      html: () => `<div class="x-rp"><svg viewBox="0 0 100 100"><circle class="x-rt" cx="50" cy="50" r="44"/><circle class="x-rf" cx="50" cy="50" r="44" pathLength="100"/></svg><b class="x-rn">0 %</b></div>`,
      css: (o) => `.x-rp { position: relative; width: ${o.size}px; height: ${o.size}px; display: grid; place-items: center; }
.x-rp svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.x-rp circle { fill: none; stroke-width: 8; stroke-linecap: round; }
.x-rt { stroke: rgba(241,232,203,.12); }
.x-rf { stroke: ${o.color}; stroke-dasharray: 100; stroke-dashoffset: 100; }
.x-rn { position: relative; font: 800 ${o.size / 5}px/1 var(--display); color: #F1E8CB; font-variant-numeric: tabular-nums; }`,
      code(root, o, KM) {
        const arc = root.querySelector('.x-rf');
        const num = root.querySelector('.x-rn');
        const s = { v: 0 };
        return KM.animate(s, { v: [0, o.value] }, { duration: o.duration, ease: o.ease, onUpdate: () => { arc.style.strokeDashoffset = 100 - s.v; num.textContent = Math.round(s.v) + ' %'; } });
      },
    },
    {
      id: 'ripple-loader', cat: L, name: 'Ondes concentriques', use: 'Des cercles s’élargissent en continu, comme un radar.',
      controls: [loaderColor(), K.range('count', 'Nombre d’ondes', 1, 5, 1, 3), K.range('size', 'Taille', 60, 400, 2, 280, 'px'), K.range('duration', 'Durée', 800, 5000, 100, 2400, 'ms')],
      html: (o) => `<div class="x-rip">${'<i></i>'.repeat(o.count)}</div>`,
      css: (o) => `.x-rip { position: relative; width: ${o.size}px; height: ${o.size}px; }
.x-rip i { position: absolute; inset: 0; border-radius: 50%; border: 5px solid ${o.color}; }`,
      code(root, o, KM) {
        return KM.animate(root.querySelectorAll('.x-rip i'), { scale: [0, 1], opacity: [1, 0] }, { duration: o.duration, delay: KM.stagger(o.duration / o.count), ease: 'outSine', loop: true });
      },
    },
  );
})(window.KMS);
