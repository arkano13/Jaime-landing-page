// Arma el sitio en dist/: inserta encabezado y pie compartidos en cada página
// y marca en el menú la página actual. Sin dependencias.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

const partial = name => readFileSync(join(src, 'partials', `${name}.html`), 'utf8').trimEnd();
const header = partial('header');
const footer = partial('footer');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const entry of readdirSync(src, { withFileTypes: true })) {
  if (entry.name === 'partials') continue;
  const from = join(src, entry.name);
  if (entry.isFile() && entry.name.endsWith('.html')) {
    const page = entry.name.replace(/\.html$/, '');
    const html = readFileSync(from, 'utf8')
      .replace('<!-- include:header -->', header.replace(`data-page="${page}"`, `data-page="${page}" aria-current="page"`))
      .replace('<!-- include:footer -->', footer);
    writeFileSync(join(dist, entry.name), html);
  } else {
    cpSync(from, join(dist, entry.name), { recursive: true });
  }
}
console.log('Sitio generado en dist/');
