import http from 'node:http';
import { readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const send = (res, status, body, type) => { res.writeHead(status, {'Content-Type': type}); res.end(body); };
const image = async (res, file) => {
  if (!/^[a-z0-9-]+\.png$/.test(file)) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  return send(res, 200, await readFile(new URL(`./images/vessels/${file}`, root)), 'image/png');
};

http.createServer(async (req, res) => {
  try {
    if (req.url === '/' || req.url === '/index.html') return send(res, 200, await readFile(new URL('./front/html/index-app.html', root)), 'text/html; charset=utf-8');
    if (req.url === '/images/museum-bg.png' || req.url === '/images/background.png') return send(res, 200, await readFile(new URL('./front/html/images/museum-bg.png', root)), 'image/png');
    if (req.url === '/images/catalog-book.png') return send(res, 200, await readFile(new URL('./front/html/images/catalog-book.png', root)), 'image/png');
    if (req.url === '/images/battle-arena.png') return send(res, 200, await readFile(new URL('./front/html/images/battle-arena.png', root)), 'image/png');
    if (req.url?.startsWith('/images/vessels/')) return image(res, decodeURIComponent(req.url.slice('/images/vessels/'.length)));
    return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  } catch { return send(res, 500, 'Server error', 'text/plain; charset=utf-8'); }
}).listen(process.env.PORT || 3000, () => console.log('http://localhost:3000'));
