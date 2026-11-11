// Servidor estático para Railway y para verlo en local. Sin dependencias.
// Railway asigna el puerto en la variable PORT; en local usa 3000.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
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
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
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
  // Videos: respuestas parciales (Range), necesarias para reproducir en iPhone y Safari
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range && (ext === '.mp4' || ext === '.webm')) {
    const start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
    if (start > end || start >= info.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      'Content-Type': types[ext],
      'Content-Range': `bytes ${start}-${end}/${info.size}`,
      'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, {
    'Accept-Ranges': 'bytes',
    ETag: etag,
    'Content-Type': types[ext] || 'application/octet-stream',
    // Con ?v= (CSS y JS versionados) se guarda un año; lo demás se revalida siempre
    'Cache-Control': searchParams.has('v') ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(await readFile(file));
}).listen(port, () => console.log(`Sitio en http://localhost:${port}`));
