// Arma el sitio en dist/: inserta encabezado y pie compartidos en cada página
// y marca en el menú la página actual. Sin dependencias.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

const partial = name => readFileSync(join(src, 'partials', `${name}.html`), 'utf8').trimEnd();
// Versión según el contenido: el navegador descarga de nuevo CSS y JS solo cuando cambian
const version = file => createHash('sha1').update(readFileSync(join(src, file))).digest('hex').slice(0, 10);
const assetVersions = { '/styles.css': version('styles.css'), '/main.js': version('main.js') };
const withVersions = html => html
  .replace('href="/styles.css"', `href="/styles.css?v=${assetVersions['/styles.css']}"`)
  .replace('src="/main.js"', `src="/main.js?v=${assetVersions['/main.js']}"`);

// Dominio público: enlaces canónicos, vista previa al compartir y mapa del sitio para Google
const SITE = 'https://blcleaders.com';
const OG_IMAGE = `${SITE}/assets/og-blc.jpg`;
const pathOf = page => (page === 'index' ? '/' : `/${page}`);
const withSeo = (html, page) => {
  const url = SITE + pathOf(page);
  const tags = [
    page === '404' ? '' : `<link rel="canonical" href="${url}">`,
    page === '404' ? '' : `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Building Leaders Company: Fortalecemos líderes. Transformamos organizaciones.">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
  ].filter(Boolean).join('\n  ');
  return html.replace('<meta name="twitter:card" content="summary">', tags);
};
// Etiqueta de Google (Analytics), tal como la entrega Google: va justo después de <head>
const GOOGLE_TAG = `<head>
  <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-KPMVMGKN"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  </script>`;
const indexable = [];

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
    writeFileSync(join(dist, entry.name), withVersions(withSeo(html, page)).replace('<head>', GOOGLE_TAG));
    if (!html.includes('name="robots" content="noindex"')) indexable.push(page);
  } else {
    cpSync(from, join(dist, entry.name), { recursive: true });
  }
}

const today = new Date().toISOString().slice(0, 10);
const order = p => (p === 'index' ? 0 : p === 'privacidad' ? 2 : 1);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.sort((a, b) => order(a) - order(b) || a.localeCompare(b)).map(p => `  <url><loc>${SITE}${pathOf(p)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('Sitio generado en dist/');
