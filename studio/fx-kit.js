/* Kaury Motion Studio : kit pour déclarer les effets de la galerie.
 *
 * Chaque effet est une fiche :
 *   { id, cat, name, use, tip?, controls, presets?, ess?, html(o), css(o), code(root, o, KM) }
 *
 * `code` n'utilise que `root` (l'élément qui contient l'effet), `o` (les
 * réglages) et `KM` (le framework). Le studio l'exécute tel quel, et l'export
 * recopie son corps avec `const o = {…}` en tête : ce qu'on voit est ce
 * qu'on copie. Elle renvoie ce qu'il faut arrêter (animations, fonctions).
 */
(function () {
  'use strict';
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
  const kit = {
    list: [],
    EASES,
    CATS: ['Titres et texte', 'Boutons', 'Cartes et 3D', 'Défilement', 'Fonds animés', 'Chargements', 'Micro-interactions', 'Formes et SVG', 'Intros et séquences'],
    add(...fx) { kit.list.push(...fx); },
    // Le logo Kaury (celui de l'en-tête de la page), pour les effets qui en ont besoin
    LOGO: (document.querySelector('#hero-logo svg')?.outerHTML || '').replace(' class="k-logo"', ''),
    // Réglages prêts à l'emploi
    text: (def, label = 'Ton texte', k = 'text', help) => ({ k, type: 'text', label, def, help }),
    color: (def, label = 'Couleur', k = 'color') => ({ k, type: 'color', label, def }),
    range: (k, label, min, max, step, def, unit, help) => ({ k, type: 'range', label, min, max, step, def, unit, help }),
    seg: (k, label, options, def) => ({ k, type: 'seg', label, options, def }),
    toggle: (k, label, def) => ({ k, type: 'toggle', label, def }),
    ease: (def = 'kaury') => ({ k: 'ease', type: 'select', label: 'Mouvement', help: 'La façon dont ça accélère et freine.', options: EASES, def }),
    size: (def, min = 20, max = 160, label = 'Taille du texte') => ({ k: 'size', type: 'range', label, min, max, step: 1, def, unit: 'px' }),
    speed: (def = 1, label = 'Vitesse') => ({ k: 'speed', type: 'range', label, min: 0.2, max: 3, step: 0.05, def, unit: '×' }),
    esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]),
    // Styles de texte communs, en CSS exportable
    title: (sel, o, extra = '') => `${sel} { margin: 0; padding: 0 6%; font: 800 ${o.size}px/1 var(--display); letter-spacing: -0.03em; text-align: center; color: ${o.color}; ${extra}}`,
  };
  window.KMS = kit;
})();
