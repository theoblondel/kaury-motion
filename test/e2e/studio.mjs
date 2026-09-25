// Test de bout en bout du studio : chaque effet s'ouvre sans erreur, chaque
// page exportée fonctionne seule, le panier « Ma page » et l'image perso marchent.
// Usage : npm run build && node test/e2e/studio.mjs
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'km-e2e-'));
const page = path.join(tmp, 'studio.html');
execFileSync('node', [path.join(root, 'studio/bundle.mjs'), page], { stdio: 'inherit' });

const ignore = /ERR_CERT|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|Failed to load resource|fontshare|fonts\.googleapis/;
const failures = [];
const fail = (msg) => { failures.push(msg); console.error('  ✗', msg); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const p = await ctx.newPage();
let current = 'chargement';
p.on('pageerror', (e) => fail(`${current} : ${e.message}`));
p.on('console', (m) => m.type() === 'error' && !ignore.test(m.text()) && fail(`${current} : ${m.text()}`));
await p.goto('file://' + page);
await p.waitForTimeout(800);

const total = await p.$$eval('.card', (c) => c.length);
console.log(`${total} effets trouvés`);
if (total < 100) fail(`seulement ${total} effets`);

// 1. Chaque effet dans l'éditeur + son export autonome
await p.click('.card-hit[data-i="0"]');
const exports = [];
for (let i = 0; i < total; i++) {
  current = await p.textContent('#ed-name');
  await p.waitForTimeout(250);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#download')]);
  const file = path.join(tmp, `export-${i}.html`);
  await dl.saveAs(file);
  exports.push([current, file]);
  await p.click('#ed-next');
}
const q = await ctx.newPage();
for (const [name, file] of exports) {
  const errs = [];
  const on = (e) => errs.push(e.message);
  q.on('pageerror', on);
  await q.goto('file://' + file);
  await q.waitForTimeout(250);
  q.off('pageerror', on);
  if (errs.length) fail(`export « ${name} » : ${errs.join(' / ')}`);
}
console.log(`${exports.length} exports testés`);

// 2. Image perso sur le logo 3D
current = 'image perso';
await p.evaluate(() => (location.hash = 'extrude'));
await p.waitForTimeout(400);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR4nGP4z8DwHwyBDAYGBgYGAKscA/0+X0cvAAAAAElFTkSuQmCC', 'base64');
await p.setInputFiles('#controls input[type="file"]', { name: 'logo.png', mimeType: 'image/png', buffer: png });
await p.waitForTimeout(500);
if (!(await p.$('#ed-canvas .km-logo img'))) fail('l’image perso n’apparaît pas dans le logo 3D');

// 3. Panier « Ma page » : trois effets, un export combiné
current = 'ma page';
for (const id of ['reveal', 'page-launch', 'btn-confetti']) {
  await p.evaluate((h) => (location.hash = h), id);
  await p.waitForTimeout(300);
  await p.click('#add-cart');
}
await p.keyboard.press('Escape');
await p.click('#cart-fab');
const items = await p.$$eval('#cart-list li', (l) => l.length);
if (items !== 3) fail(`le panier contient ${items} effets au lieu de 3`);
const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#cart-download')]);
const combined = path.join(tmp, 'ma-page.html');
await dl.saveAs(combined);
const errs = [];
q.on('pageerror', (e) => errs.push(e.message));
await q.goto('file://' + combined);
await q.waitForTimeout(600);
if (errs.length) fail(`page combinée : ${errs.join(' / ')}`);
if ((await q.$$eval('.km-sec', (s) => s.length)) !== 3) fail('la page combinée n’a pas 3 sections');

// 4. Téléphone : pas de défilement horizontal
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await m.goto('file://' + page);
await m.waitForTimeout(600);
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
if (overflow > 0) fail(`débordement horizontal sur mobile : ${overflow}px`);

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
if (failures.length) {
  console.error(`\n${failures.length} problème(s)`);
  process.exit(1);
}
console.log('\nTout est bon.');
