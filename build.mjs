import { build } from 'esbuild';

const shared = { entryPoints: ['src/index.ts'], bundle: true, target: 'es2019', legalComments: 'none' };
const banner = { js: '/*! Kaury Motion v0.1.0 | MIT | https://kaury.studio */' };

await build({ ...shared, format: 'esm', outfile: 'dist/kaury-motion.js', banner });
await build({ ...shared, format: 'iife', globalName: 'KauryMotion', minify: true, outfile: 'dist/kaury-motion.min.js', banner });
console.log('built dist/kaury-motion.js and dist/kaury-motion.min.js');
