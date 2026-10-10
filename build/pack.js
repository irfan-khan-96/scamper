/* Builds the game.

   Writes two things:
     Scamper.html   one self-contained file you can double-click
     site/          the same game as index.html, plus the link-preview image
                    and app icon, ready to upload to any static host

   The JSX is compiled here, at build time, with the same Babel the dev page
   uses in the browser — so the shipped file carries no compiler at all.
   Everything else (React, the two web fonts, the game modules and the
   stylesheet) is gzipped, base64'd and dropped into the bundler manifest
   inside build/shell.html. The shell's loader unpacks it into blob URLs at
   load time, so the game runs straight off the filesystem with no server.

   Launch settings come from build/config.json (see README.md):
     launch     the date that is Daily #1
     site       the address the site/ folder will live at
     analytics  a cookieless provider for the anonymous play counts

   Run:  node build/pack.js [--config path/to/config.json] [--out dir] [--site https://…]
*/
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const CONFIG_FILE = arg('--config') || path.join(__dirname, 'config.json');
const OUT_DIR = arg('--out') || ROOT;
const Babel = require(path.join(ROOT, 'vendor/babel.js'));

/* ---- launch settings, checked before anything is built ---- */
function loadConfig() {
  const c = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  /* --site on the command line wins over the file: the GitHub Pages workflow
     passes the address GitHub gives it, so nobody has to type it in */
  if (arg('--site')) c.site = arg('--site');
  const out = { launch: null, site: null, analytics: null };
  if (c.launch != null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.launch) || isNaN(new Date(c.launch))) {
      throw new Error('config "launch" must be a date like "2026-11-01"');
    }
    out.launch = c.launch;
  }
  if (c.site != null) {
    if (!/^https:\/\/[^\s"'<>]+$/.test(c.site)) throw new Error('config "site" must be an https:// address');
    out.site = c.site.replace(/\/+$/, '');
  }
  if (c.analytics != null) {
    const a = c.analytics;
    if (a.provider === 'plausible') {
      if (!/^[a-z0-9.-]+$/i.test(a.domain || '')) throw new Error('plausible analytics needs "domain", e.g. "scamper.example.com"');
      out.analytics = { provider: 'plausible', domain: a.domain };
      if (a.endpoint != null) {
        /* https, or a local address for testing against a stand-in collector */
        if (!/^(https:\/\/|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/)[^\s"'<>]+$/.test(a.endpoint)) {
          throw new Error('plausible "endpoint" must be https://');
        }
        out.analytics.endpoint = a.endpoint;
      }
    } else if (a.provider === 'goatcounter') {
      if (!/^[a-z0-9-]+$/i.test(a.code || '')) throw new Error('goatcounter analytics needs "code", e.g. "scamper"');
      out.analytics = { provider: 'goatcounter', code: a.code };
    } else {
      throw new Error('config "analytics.provider" must be "plausible" or "goatcounter"');
    }
  }
  return out;
}
const CONFIG = loadConfig();

/* The production builds: React 18.3.1 from cdnjs, checked against cdnjs's own
   published SRI hashes when they were fetched. The development builds stay in
   vendor/ for index.html, where their error messages are worth the weight. */
const VENDOR = [
  { file: 'vendor/react.production.min.js', uuid: '9ca7a7f2-dcfa-418d-bbd4-baf302fdcd95' },
  { file: 'vendor/react-dom.production.min.js', uuid: '54627834-ddce-48e2-bda6-0bc3b7ac9b8c' },
];
/* Only the Latin subset of each face ships. Everything in the manifest is
   downloaded up front, and the other subsets were half the file. */
const fontCss = fs.readFileSync(path.join(ROOT, 'src/fonts.css'), 'utf8');
const latinFaces = fontCss.match(/@font-face\s*{[^}]*}/g).filter((b) => /unicode-range:\s*U\+0000-00FF/i.test(b));
const FONTS = [...new Set(latinFaces.map((b) => /url\(['"]?([^'")]+)['"]?\)/.exec(b)[1]))];
/* game modules, in load order */
const MODULES = [
  { file: 'src/graph.js', uuid: '245e2e56-ab97-4775-9c4c-ad0a0ce7e95f', babel: false },
  { file: 'src/rules.js', uuid: '91a0e28c-b27b-4af9-8e2a-0e2e24245cdb', babel: false },
  { file: 'src/ai.js', uuid: '6e2b9d41-0c7a-4f58-b3e1-9a4d7c25f0e6', babel: false },
  { file: 'src/daily.js', uuid: 'c41f8e72-5b3d-49a0-8e6c-1d7a2f94b358', babel: false },
  { file: 'src/sound.js', uuid: 'b1d4c7e0-5a29-4f13-9c86-2e7d40a1f5b3', babel: false },
  { file: 'src/track.js', uuid: '8f3a61c2-94de-4b07-a1c5-3e70d2b98f14', babel: false },
  { file: 'src/board.jsx', uuid: '9d1aedeb-904b-4b2d-97c4-2f9624a820ef', babel: true },
  { file: 'src/pieces.jsx', uuid: '3fbeaf0e-9959-472c-b364-008430ccf5f9', babel: true },
  { file: 'src/hud.jsx', uuid: '062f45c3-150d-444a-a2e4-e6130c3ff644', babel: true },
  { file: 'src/app.jsx', uuid: '6c0ca271-d138-436c-9092-5fd0c8e60b6d', babel: true },
];
/* the link-preview image and app icon, made once and kept in build/assets */
const ASSETS = path.join(__dirname, 'assets');
const asset = (f) => (fs.existsSync(path.join(ASSETS, f)) ? path.join(ASSETS, f) : null);

const read = (f) => fs.readFileSync(path.join(ROOT, f));
const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).toString('base64');
const sri = (buf) => 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const manifest = {};
const integrity = {};
for (const v of VENDOR) {
  const buf = read(v.file);
  manifest[v.uuid] = { mime: 'text/javascript', compressed: true, data: gz(buf) };
  integrity[v.uuid] = sri(buf);
}
for (const f of FONTS) {
  manifest[f] = { mime: 'font/woff2', compressed: true, data: gz(read('vendor/fonts/' + f)) };
}
/* JSX becomes plain React.createElement calls; nothing else is touched */
for (const m of MODULES) {
  const src = read(m.file).toString('utf8');
  const code = m.babel
    ? Babel.transform(src, { presets: ['react'], filename: m.file, compact: false, comments: true }).code
    : src;
  manifest[m.uuid] = { mime: 'application/javascript', compressed: true, data: gz(Buffer.from(code, 'utf8')) };
}

/* ---- the head: everything a link preview or a home screen needs ----
   It goes in twice. Link-preview robots (Messages, WhatsApp, Slack, X…) read
   the page without running it, so these tags have to be in the outer page
   the server sends; the inner template carries them too, because the loader
   swaps the whole document for it once it runs. */
const TITLE = 'Scamper — a daily garden puzzle';
const DESC = 'Get the mouse, the squirrel and the bird home before Biscuit the cat pounces. A new garden every day — can you beat par?';
const iconSvg = asset('icon.svg');
const card = CONFIG.site && asset('card.jpg');
const touch = CONFIG.site && asset('icon-180.png');
const head = [
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  `<title>${esc(TITLE)}</title>`,
  `<meta name="description" content="${esc(DESC)}">`,
  `<meta property="og:title" content="${esc(TITLE)}">`,
  `<meta property="og:description" content="${esc(DESC)}">`,
  '<meta property="og:type" content="website">',
  CONFIG.site ? `<meta property="og:url" content="${esc(CONFIG.site)}/">` : null,
  card ? `<meta property="og:image" content="${esc(CONFIG.site)}/card.jpg">` : null,
  card ? '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' : null,
  card ? '<meta property="og:image:alt" content="The Scamper garden board: a cat, a mouse, a squirrel and a bird racing to the tree.">' : null,
  `<meta name="twitter:card" content="${card ? 'summary_large_image' : 'summary'}">`,
  iconSvg ? `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${fs.readFileSync(iconSvg).toString('base64')}">` : null,
  touch ? '<link rel="apple-touch-icon" href="icon-180.png">' : null,
  '<meta name="theme-color" content="#100e0a">',
].filter(Boolean).join('\n');

const fonts = latinFaces.join('\n');
const game = read('src/game.css').toString('utf8');
/* the par worker is built from these three modules; their uuids become blob
   URLs when the loader unpacks the page */
const aiParts = ['src/graph.js', 'src/rules.js', 'src/ai.js']
  .map((f) => MODULES.find((m) => m.file === f).uuid);
const scripts = [
  `<script>window.__scamper = ${JSON.stringify(CONFIG)}; window.__aiParts = ${JSON.stringify(aiParts)};</script>`,
  ...VENDOR.map((v) => `<script src="${v.uuid}" integrity="${integrity[v.uuid]}" crossorigin="anonymous"></script>`),
  ...MODULES.map((m) => `<script src="${m.uuid}"></script>`),
].join('\n');

const template = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
${head}
<style>${fonts}</style>
<style>${game}</style>
</head>
<body>
<div id="root"></div>

${scripts}

</body></html>`;

/* These blobs live inside <script> elements, so a literal "</" would close the
   tag early. \\u002F is a legal JSON escape that parses back identically. */
const enc = (v) => JSON.stringify(v).split('</').join('<\\u002F');

let out = fs.readFileSync(path.join(ROOT, 'build/shell.html'), 'utf8');
if (!out.includes('{{MANIFEST}}') || !out.includes('{{TEMPLATE}}')) {
  throw new Error('build/shell.html is missing its placeholders');
}
if (!out.includes('<title>Scamper</title>')) throw new Error('build/shell.html has lost its <title> marker');
out = out.replace('<title>Scamper</title>', head)
  .replace('<html>', '<html lang="en">')
  .replace('{{MANIFEST}}', enc(manifest)).replace('{{TEMPLATE}}', enc(template));

const single = path.join(OUT_DIR, 'Scamper.html');
fs.writeFileSync(single, out);
const site = path.join(OUT_DIR, 'site');
fs.mkdirSync(site, { recursive: true });
fs.writeFileSync(path.join(site, 'index.html'), out);
for (const f of ['card.jpg', 'icon-180.png']) {
  if (asset(f)) fs.copyFileSync(asset(f), path.join(site, f));
}
/* For static hosts. A mistyped address lands back on the game rather than on
   a bare error page; .nojekyll tells GitHub Pages to serve the files as they
   are. */
const home = CONFIG.site ? new URL(CONFIG.site + '/').pathname : '/';
fs.writeFileSync(path.join(site, '404.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Scamper</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${esc(home)}">
</head><body><p><a href="${esc(home)}">Back to the garden</a></p></body></html>
`);
fs.writeFileSync(path.join(site, '.nojekyll'), '');

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log('wrote', single, kb(Buffer.byteLength(out)));
console.log('wrote', site + path.sep, '(index.html' + (asset('card.jpg') ? ', card.jpg' : '') + (asset('icon-180.png') ? ', icon-180.png' : '') + ')');
console.log('   launch     ', CONFIG.launch ? 'Daily #1 is ' + CONFIG.launch : 'not set — gardens are named by date, not number');
console.log('   site       ', CONFIG.site || 'not set — no link-preview image, and share links work only once hosted');
console.log('   analytics  ', CONFIG.analytics ? CONFIG.analytics.provider + ' (' + (CONFIG.analytics.domain || CONFIG.analytics.code) + ')' : 'off — the game sends nothing anywhere');
