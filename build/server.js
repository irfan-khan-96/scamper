/* Dev server for index.html — Babel needs the JSX fetched over http, not file://.
   Run:  node build/server.js     then open http://localhost:4321

   It serves the whole project folder, private notes included, so it only
   answers this computer: it listens on the loopback address, and it turns away
   requests addressed to any other host name (a web page cannot reach it by
   pointing a look-alike domain at this machine). */
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 4321;
const HOST = '127.0.0.1';
const OK_HOSTS = new Set(['localhost:' + PORT, '127.0.0.1:' + PORT]);
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.jsx': 'text/babel',
  '.css': 'text/css', '.png': 'image/png', '.json': 'application/json',
};

/* true only for paths inside the project folder itself (not a neighbour whose
   name merely starts the same, and not the folder's .git) */
function inside(file) {
  const rel = path.relative(ROOT, file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  return !rel.split(path.sep).includes('.git');
}

http.createServer((req, res) => {
  const no = (code, msg) => { res.writeHead(code, { 'Content-Type': 'text/plain' }); res.end(msg); };
  if (!OK_HOSTS.has(String(req.headers.host || '').toLowerCase())) return no(403, 'nope');
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { return no(400, 'bad address'); }
  if (p.includes('\0')) return no(400, 'bad address');
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  /* don't serve anything outside the project */
  if (!inside(file)) return no(403, 'nope');
  /* src/fonts.css names the woff2 files bare, because the packer rewrites those
     names into blob URLs. In dev they resolve against /src/, so fall back to
     vendor/fonts for anything uuid-shaped that isn't where the URL says. */
  const send = (f) => fs.readFile(f, (err, data) => {
    if (err) {
      const base = path.basename(f);
      const font = path.join(ROOT, 'vendor/fonts', base);
      if (f !== font && /^[0-9a-f-]{30,}$/i.test(base) && fs.existsSync(font)) { send(font); return; }
      return no(404, 'not found');
    }
    const ext = path.extname(f);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || (ext === '' ? 'font/woff2' : 'application/octet-stream'),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
  send(file);
}).listen(PORT, HOST, () => console.log('Scamper — dev server on http://localhost:' + PORT));
