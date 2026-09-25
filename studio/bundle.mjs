// Builds a single self-contained studio page (framework, CSS and JS inlined).
// Usage: node studio/bundle.mjs <out.html> [--fonts <dir with cabinet-grotesk-*.woff2, satoshi-*.woff2>] [--fragment]
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const out = args[0] || path.join(here, 'dist', 'kaury-motion-studio.html');
const fontsDir = args.includes('--fonts') ? args[args.indexOf('--fonts') + 1] : null;
const fragment = args.includes('--fragment');

const read = (p) => fs.readFileSync(path.join(here, p), 'utf8');
let html = read('index.html');
const lib = fs.readFileSync(path.join(here, '..', 'dist', 'kaury-motion.min.js'), 'utf8').trim();

const block = (name, content) => {
  html = html.replace(new RegExp(`<!--${name}-->[\\s\\S]*?<!--/${name}-->`), () => content);
};
block('STYLE', `<style>\n${read('studio.css')}</style>`);
block('LIB', `<script id="km-lib">${lib.replace(/<\/script/gi, '<\\/script')}</script>`);
block('KIT', `<script>\n${['fx-kit.js', 'effects-text.js', 'effects-ui.js', 'effects-motion.js', 'effects-scenes.js', 'effects-pages.js'].map((f) => read(f).replace(/<\/script/gi, '<\\/script')).join('\n')}</script>`);
block('APP', `<script>\n${read('studio.js').replace(/<\/script/gi, '<\\/script')}</script>`);

if (fontsDir) {
  const face = (family, file, weight) =>
    `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${fs.readFileSync(path.join(fontsDir, file)).toString('base64')}) format('woff2');font-weight:${weight};font-display:swap}`;
  const css = [
    face('Cabinet Grotesk', 'cabinet-grotesk-700.woff2', 700),
    face('Cabinet Grotesk', 'cabinet-grotesk-800.woff2', 800),
    face('Satoshi', 'satoshi-500.woff2', 500),
    face('Satoshi', 'satoshi-700.woff2', 700),
  ].join('\n');
  block('FONTS', `<style>${css}</style>`);
}

if (fragment) {
  html = html
    .replace(/<!doctype html>\s*/i, '')
    .replace(/<html[^>]*>\s*|<\/html>\s*/gi, '')
    .replace(/<head>\s*|<\/head>\s*|<body>\s*|<\/body>\s*/gi, '')
    .replace(/<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*/gi, '');
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
