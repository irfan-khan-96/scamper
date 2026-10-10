/* Dev server for index.html — Babel needs the JSX fetched over http, not file://.
   Run:  node build/server.js     then open http://localhost:4321 */
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 4321;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.jsx': 'text/babel',
  '.css': 'text/css', '.png': 'image/png', '.json': 'application/json',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  /* don't serve anything outside the project */
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('nope'); return; }
  /* src/fonts.css names the woff2 files bare, because the packer rewrites those
     names into blob URLs. In dev they resolve against /src/, so fall back to
     vendor/fonts for anything uuid-shaped that isn't where the URL says. */
  const send = (f) => fs.readFile(f, (err, data) => {
    if (err) {
      const base = path.basename(f);
      const font = path.join(ROOT, 'vendor/fonts', base);
      if (f !== font && /^[0-9a-f-]{30,}$/i.test(base) && fs.existsSync(font)) { send(font); return; }
      res.writeHead(404); res.end('not found'); return;
    }
    const ext = path.extname(f);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || (ext === '' ? 'font/woff2' : 'application/octet-stream'),
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
  send(file);
}).listen(PORT, () => console.log('Scamper — dev server on http://localhost:' + PORT));
