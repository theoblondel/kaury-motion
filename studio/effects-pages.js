/* Kaury Motion Studio : « Pages complètes », des pages entières prêtes à mettre en ligne. */
(function (K) {
  'use strict';
  const P = 'Pages complètes';
  const e = K.esc;

  K.add(
    {
      id: 'page-launch', cat: P, name: 'Page de lancement', use: 'Une page d’accueil complète : titre animé, bouton aimanté, fond vivant et bandeau.',
      replay: 7000, ess: 5,
      controls: [K.text('Kaury Studio', 'Nom de la marque', 'brand'), K.text('On donne du caractère aux marques', 'Grand titre'), K.text('Branding, sites web, vidéo et photo, depuis Vevey.', 'Sous-titre', 'sub'), K.text('Démarrer un projet', 'Texte du bouton', 'cta'), K.image('Ton logo (facultatif)'), K.text('Branding, Web design, Vidéo, Photo, Réseaux sociaux', 'Mots du bandeau', 'words'), K.color('#F56E2E', 'Couleur principale', 'accent'), K.color('#1C1A1A', 'Couleur du fond', 'bg')],
      html: (o) => `<div class="x-page">
  <div class="x-blobs"><i></i><i></i></div>
  <header class="x-nav"><span class="x-brand"><span class="x-mark">${K.logo(o)}</span>${e(o.brand)}</span><span class="x-menu">Projets · Studio · Contact</span></header>
  <main class="x-hero">
    <h1>${e(o.text)}</h1>
    <p>${e(o.sub)}</p>
    <button class="x-cta" type="button">${e(o.cta)} →</button>
  </main>
  <div class="x-band">${o.words.split(',').map((w) => `<span>${e(w.trim())}</span><i>✦</i>`).join('')}</div>
</div>`,
      css: (o) => `.x-page { position: absolute; inset: 0; overflow: hidden; display: grid; grid-template-rows: auto 1fr auto; background: ${o.bg}; color: #F1E8CB; }
.x-blobs i { position: absolute; width: 480px; height: 480px; border-radius: 50%; filter: blur(110px); opacity: .55; }
.x-blobs i:nth-child(1) { background: ${o.accent}; } .x-blobs i:nth-child(2) { background: #F7C548; opacity: .3; }
.x-nav { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 28px 44px; }
.x-brand { display: flex; align-items: center; gap: 12px; font: 800 24px/1 var(--display); }
.x-mark { width: 40px; } .x-mark svg { display: block; width: 100%; height: auto; }
.x-menu { font: 600 16px/1 var(--text); opacity: .75; }
.x-hero { position: relative; display: grid; align-content: center; justify-items: start; gap: 22px; padding: 0 44px; }
.x-hero h1 { margin: 0; max-width: 11em; font: 800 84px/0.95 var(--display); letter-spacing: -0.04em; }
.x-hero p { margin: 0; max-width: 30em; font: 500 22px/1.4 var(--text); opacity: .8; }
.x-cta { padding: 20px 34px; border: 0; border-radius: 999px; background: ${o.accent}; color: #1C1A1A; font: 800 22px/1 var(--display); cursor: pointer; }
.x-band { position: relative; display: flex; padding-block: 16px; background: ${o.accent}; color: #1C1A1A; font: 800 34px/1 var(--display); text-transform: uppercase; white-space: nowrap; }
.x-band i { font-style: normal; font-size: .6em; }`,
      code(root, o, KM) {
        const page = root.querySelector('.x-page');
        const blobs = root.querySelectorAll('.x-blobs i');
        const start = KM.ticker.now();
        const drift = KM.ticker.add((t) => {
          const s = (t - start) / 1000 * 0.3, w = page.clientWidth, h = page.clientHeight;
          blobs.forEach((b, i) => KM.set(b, { x: w * 0.55 + Math.sin(s + i * 2) * w * 0.25, y: h * 0.2 + Math.cos(s * 0.8 + i) * h * 0.25 }));
        });
        const intro = KM.timeline({ defaults: { ease: 'kaury' } })
          .add(root.querySelector('.x-nav'), { y: [-30, 0], opacity: [0, 1] }, { duration: 800 })
          .add(KM.reveal(root.querySelector('.x-hero h1'), { effect: 'rise', by: 'words', each: 70, duration: 1100, autoplay: false }), '-=500')
          .add(root.querySelector('.x-hero p'), { y: [20, 0], opacity: [0, 0.8] }, { duration: 800 }, '-=700')
          .add(root.querySelector('.x-cta'), { scale: [0.6, 1], opacity: [0, 1] }, { ease: KM.spring({ stiffness: 220, damping: 12 }) }, '-=500');
        return [drift, intro, KM.magnetic(root.querySelector('.x-cta'), { strength: 0.35 }), KM.marquee(root.querySelector('.x-band'), { speed: 70, gap: 28, scrollBoost: 1, skew: 6 })];
      },
    },
    {
      id: 'page-soon', cat: P, name: 'Bientôt en ligne', use: 'Page « Coming soon » : compte à rebours réel, ciel étoilé et inscription.',
      ess: 4,
      controls: [K.text('Bientôt en ligne', 'Grand titre'), K.range('days', 'Ouverture dans (jours)', 1, 90, 1, 12, 'j'), K.text('Laisse ton e-mail, on te prévient.', 'Texte sous le compteur', 'sub'), K.color('#F56E2E', 'Couleur principale', 'accent'), K.color('#0E0D14', 'Couleur du fond', 'bg')],
      html: (o) => `<div class="x-soon">
  <div class="x-sky"></div>
  <div class="x-soon-in">
    <h1>${e(o.text)}</h1>
    <div class="x-clock">${['Jours', 'Heures', 'Minutes', 'Secondes'].map((l) => `<div><b>00</b><span>${l}</span></div>`).join('')}</div>
    <p>${e(o.sub)}</p>
    <form class="x-sub"><input type="email" placeholder="ton@email.ch" aria-label="Ton e-mail"><button type="submit">M’avertir</button></form>
  </div>
</div>`,
      css: (o) => `.x-soon { position: absolute; inset: 0; overflow: hidden; display: grid; place-items: center; background: ${o.bg}; color: #F1E8CB; }
.x-sky { position: absolute; inset: 0; }
.x-sky i { position: absolute; border-radius: 50%; background: #F1E8CB; }
.x-soon-in { position: relative; display: grid; justify-items: center; gap: 26px; text-align: center; }
.x-soon h1 { margin: 0; font: 800 72px/1 var(--display); letter-spacing: -0.03em; }
.x-clock { display: flex; gap: 18px; }
.x-clock div { display: grid; gap: 8px; min-width: 110px; padding: 18px 10px; border-radius: 18px; background: rgba(241,232,203,.07); box-shadow: inset 0 0 0 1px rgba(241,232,203,.12); }
.x-clock b { font: 800 60px/1 var(--display); color: ${o.accent}; font-variant-numeric: tabular-nums; }
.x-clock span { font: 700 12px/1 var(--text); letter-spacing: .16em; text-transform: uppercase; opacity: .7; }
.x-soon p { margin: 0; font: 500 20px/1.4 var(--text); opacity: .8; }
.x-sub { display: flex; gap: 8px; padding: 6px; border-radius: 999px; background: rgba(241,232,203,.08); }
.x-sub input { width: 260px; padding: 14px 18px; border: 0; background: none; color: #F1E8CB; font: 500 18px/1 var(--text); outline: none; }
.x-sub button { padding: 14px 24px; border: 0; border-radius: 999px; background: ${o.accent}; color: #1C1A1A; font: 800 18px/1 var(--display); cursor: pointer; }`,
      code(root, o, KM) {
        const sky = root.querySelector('.x-sky');
        const W = sky.clientWidth, H = sky.clientHeight;
        const stars = Array.from({ length: 90 }, () => {
          const s = document.createElement('i');
          s.style.width = s.style.height = 1 + Math.random() * 2.5 + 'px';
          s.style.left = Math.random() * W + 'px';
          s.style.top = Math.random() * H + 'px';
          sky.appendChild(s);
          return { s, p: Math.random() * 6 };
        });
        const target = Date.now() + o.days * 86400000;
        const cells = [...root.querySelectorAll('.x-clock b')];
        const last = [];
        const tick = KM.ticker.add((t) => {
          stars.forEach((st) => (st.s.style.opacity = String(0.25 + 0.75 * Math.abs(Math.sin(t / 900 + st.p)))));
          let left = Math.max(0, Math.floor((target - Date.now()) / 1000));
          const parts = [Math.floor(left / 86400), Math.floor((left % 86400) / 3600), Math.floor((left % 3600) / 60), left % 60];
          parts.forEach((v, i) => {
            const txt = String(v).padStart(2, '0');
            if (last[i] === txt) return;
            last[i] = txt;
            cells[i].textContent = txt;
            KM.animate(cells[i], { y: [-14, 0], opacity: [0.2, 1] }, { duration: 450, ease: 'outBack' });
          });
        });
        const form = root.querySelector('.x-sub');
        form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          form.innerHTML = '<p style="margin:0;padding:14px 20px;font-weight:700">Merci, on te prévient !</p>';
          KM.animate(form, { scale: [0.9, 1] }, { ease: KM.spring({ stiffness: 260, damping: 11 }) });
        });
        const intro = KM.animate(root.querySelectorAll('.x-soon-in > *'), { y: [30, 0], opacity: [0, 1] }, { duration: 900, delay: KM.stagger(140), ease: 'kaury' });
        return [tick, intro];
      },
    },
    {
      id: 'page-portfolio', cat: P, name: 'Portfolio', use: 'Une page portfolio : présentation, mot qui change, projets en cartes 3D.',
      replay: 7000, ess: 4,
      controls: [K.text('Théo Blondel', 'Ton nom', 'name'), K.text('designer, vidéaste, photographe, directeur créatif', 'Tes métiers', 'words'), K.text('Aumy, Vertesse, Athenis, Equinox', 'Tes projets', 'projects'), K.color('#F56E2E', 'Couleur principale', 'accent'), K.color('#1C1A1A', 'Couleur du fond', 'bg')],
      html: (o) => `<div class="x-folio">
  <header class="x-intro"><h1>${e(o.name)}</h1><p>Je suis <span class="x-box"><span class="x-word">${e(o.words.split(',')[0].trim())}</span></span></p></header>
  <div class="x-grid">${o.projects.split(',').map((p, i) => `<article class="x-proj" style="--h:${[18, 42, 150, 95][i % 4]}"><small>0${i + 1}</small><b>${e(p.trim())}</b></article>`).join('')}</div>
</div>`,
      css: (o) => `.x-folio { position: absolute; inset: 0; overflow: hidden; display: grid; align-content: center; gap: 34px; padding: 0 48px; background: ${o.bg}; color: #F1E8CB; }
.x-intro h1 { margin: 0; font: 800 76px/1 var(--display); letter-spacing: -0.04em; }
.x-intro p { margin: 8px 0 0; font: 600 30px/1.2 var(--text); opacity: .9; }
.x-box { display: inline-block; overflow: hidden; vertical-align: bottom; }
.x-word { display: inline-block; color: ${o.accent}; }
.x-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.x-proj { aspect-ratio: 4 / 5; padding: 18px; border-radius: 18px; display: flex; flex-direction: column; justify-content: space-between; color: #1C1A1A; background: linear-gradient(160deg, hsl(calc(var(--h) * 1deg) 80% 70%), ${o.accent}); }
.x-proj small { font: 700 13px/1 var(--mono); }
.x-proj b { font: 800 28px/1 var(--display); letter-spacing: -0.02em; }`,
      code(root, o, KM) {
        const words = o.words.split(',').map((w) => w.trim()).filter(Boolean);
        const word = root.querySelector('.x-word');
        let i = 0;
        const id = setInterval(async () => {
          await KM.animate(word, { y: ['0%', '-110%'] }, { duration: 350, ease: 'inQuart' }).finished;
          word.textContent = words[(i = (i + 1) % words.length)];
          KM.animate(word, { y: ['110%', '0%'] }, { duration: 600, ease: 'outBack' });
        }, 1800);
        const cards = root.querySelectorAll('.x-proj');
        const intro = KM.timeline({ defaults: { ease: 'kaury' } })
          .add(KM.reveal(root.querySelector('.x-intro h1'), { effect: 'rise', by: 'chars', each: 30, autoplay: false }))
          .add(root.querySelector('.x-intro p'), { opacity: [0, 0.9], y: [16, 0] }, { duration: 700 }, '-=700')
          .add(cards, { y: [80, 0], opacity: [0, 1], rotate: [4, 0] }, { duration: 1000, delay: KM.stagger(110) }, '-=500');
        return [() => clearInterval(id), intro, KM.tilt(cards, { max: 14, glare: true, scale: 1.04 })];
      },
    },
  );
})(window.KMS);
