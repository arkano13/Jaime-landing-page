// Servidor estático para Railway y para verlo en local. Sin dependencias.
// Railway asigna el puerto en la variable PORT; en local usa 3000.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT) || 3000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const base = join(dist, clean);
  if (!base.startsWith(dist)) return null;
  // /conferencias -> conferencias.html ; / -> index.html
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://localhost');
  const file = await resolveFile(pathname);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset="utf-8"><title>Página no encontrada</title><p>Página no encontrada. <a href="/">Volver al inicio</a></p>');
    return;
  }
  const ext = extname(file).toLowerCase();
  // ETag para que el navegador no descargue de nuevo lo que no cambió (respuesta 304)
  const info = await stat(file);
  const etag = `W/"${info.size}-${Math.floor(info.mtimeMs)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag });
    res.end();
    return;
  }
  res.writeHead(200, {
    ETag: etag,
    'Content-Type': types[ext] || 'application/octet-stream',
    // Con ?v= (CSS y JS versionados) se guarda un año; lo demás se revalida siempre
    'Cache-Control': searchParams.has('v') ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(await readFile(file));
}).listen(port, () => console.log(`Sitio en http://localhost:${port}`));
