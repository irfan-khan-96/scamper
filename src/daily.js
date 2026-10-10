/* Scamper — the daily garden, stats, sharing and challenge links. window.MD

   Everybody gets the same dice on the same date. The cat's mood follows the
   week, gentle on Monday and ravenous by Sunday, the way a crossword gets
   harder towards the weekend.

   Nothing here talks to a server. The daily seed is the date, the par is
   worked out on the device, and a challenge is just a seed and a score
   written into the link. */
(function () {
  const R = window.MR;
  /* The date that is Daily #1. It comes from build/config.json ("launch"),
     so the numbering starts the day the game goes public rather than the day
     it was written. With no launch date — or on a day before it — a garden is
     called by its date instead, so nobody's first visit says "#40". */
  const LAUNCH = (function () {
    const v = window.__scamper && window.__scamper.launch;
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
  })();
  const PREFIX = 'scamper_';

  const pad = (n) => (n < 10 ? '0' : '') + n;
  const dateKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dateKey(new Date());
  const parseDate = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return dateKey(d); }
  const dayNumber = (s) => {
    if (!LAUNCH) return null;
    const n = Math.round((parseDate(s) - parseDate(LAUNCH)) / 864e5) + 1;
    return n >= 1 ? n : null;
  };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /* "#12" once the game has launched, "11 Oct" before */
  function dayLabel(s) {
    const n = dayNumber(s);
    if (n != null) return '#' + n;
    const d = parseDate(s);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  /* Mon Tue sleepy · Wed Thu peckish · Fri Sat hungry · Sun starving */
  const WEEK = ['starving', 'sleepy', 'sleepy', 'peckish', 'peckish', 'hungry', 'hungry'];
  const moodFor = (s) => WEEK[parseDate(s).getDay()];
  const seedFor = (s) => 'd' + s;

  /* time until the next garden, for the end card */
  function untilTomorrow() {
    const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const m = Math.max(0, Math.round((next - now) / 6e4));
    return Math.floor(m / 60) + 'h ' + pad(m % 60) + 'm';
  }

  /* ---- storage: never trusted, never fatal ---- */
  function load(key, fallback) {
    try { const r = localStorage.getItem(PREFIX + key); if (r != null) return JSON.parse(r); } catch (e) {}
    return fallback;
  }
  function save(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }

  /* ---- stats ---- */
  const STATS0 = { streak: 0, best: 0, last: null, played: 0, stars: 0, perfect: 0 };
  function stats() {
    const s = load('stats', null);
    return s && typeof s === 'object' ? Object.assign({}, STATS0, s) : Object.assign({}, STATS0);
  }
  /* a finished daily. Counted once per date, however often it is reopened. */
  function recordDaily(date, saved) {
    const s = stats();
    if (s.last === date) return s;
    s.streak = s.last === addDays(date, -1) ? s.streak + 1 : 1;
    s.best = Math.max(s.best, s.streak);
    s.last = date;
    s.played += 1;
    s.stars += saved;
    if (saved === 3) s.perfect += 1;
    save('stats', s);
    return s;
  }
  /* a streak only counts while it is still alive: yesterday or today */
  function liveStreak() {
    const s = stats(), t = today();
    return s.last === t || s.last === addDays(t, -1) ? s.streak : 0;
  }

  /* ---- par, remembered so it is only ever worked out once ---- */
  const parKey = (seed, mood) => 'par_' + seed + '_' + mood;
  const knownPar = (seed, mood) => { const v = load(parKey(seed, mood), null); return typeof v === 'number' ? v : null; };
  const rememberPar = (seed, mood, v) => save(parKey(seed, mood), v);

  /* ---- challenge links: #c=<seed>.<mood>.<score> ---- */
  const SEED_OK = /^[a-z0-9~-]{1,24}$/;
  function readChallenge(hash) {
    const m = /(?:^#|&)c=([^&]+)/.exec(hash || '');
    if (!m) return null;
    const parts = decodeURIComponent(m[1]).split('.');
    if (parts.length !== 3) return null;
    const seed = parts[0], mood = parts[1], score = Number(parts[2]);
    if (!SEED_OK.test(seed) || !R.MOODS[mood] || !(score >= 0 && score <= 3 && score % 1 === 0)) return null;
    return { seed, mood, score };
  }
  /* the page's own address, if it has one worth sharing */
  function baseUrl() {
    try {
      if (!/^https?:$/.test(location.protocol)) return null;
      return location.origin + location.pathname;
    } catch (e) { return null; }
  }
  function challengeUrl(g) {
    const b = baseUrl();
    return b ? b + '#c=' + encodeURIComponent([g.seed, g.mood, R.saved(g)].join('.')) : null;
  }

  /* ---- the share card ---- */
  const ICON = { mouse: '🐭', squirrel: '🐿️', bird: '🐦' };
  function shareText(g, par, streak) {
    const G = window.MG, N = G.NAMES, m = R.MOODS[g.mood], n = R.saved(g);
    const row = G.ANIMALS.map((id) => ICON[id] + (g.home[id] ? '🏠' : '🔒')).join(' ');
    const stars = '★'.repeat(n) + '☆'.repeat(3 - n);
    const lines = [];
    if (g.mode === 'daily') {
      const n = dayNumber(g.day);
      lines.push(N.game + (n != null ? ' #' + n : ' · ' + dayLabel(g.day)) + ' ' + m.emoji + ' ' + m.label);
      lines.push(row);
      lines.push(stars + ' ' + n + '/3 saved' + (par != null ? ' · par ' + par : '') + (streak > 1 ? ' · 🔥' + streak : ''));
      const b = baseUrl(); if (b) lines.push(b);
    } else {
      lines.push(N.game + ' challenge ' + m.emoji + ' ' + m.label);
      lines.push(row);
      lines.push(stars + ' I saved ' + n + '/3 — can you beat it on the same dice?');
      const c = challengeUrl(g); if (c) lines.push(c);
    }
    return lines.join('\n');
  }

  window.MD = {
    LAUNCH, today, addDays, dayNumber, dayLabel, moodFor, seedFor, untilTomorrow,
    load, save, stats, recordDaily, liveStreak,
    knownPar, rememberPar, readChallenge, baseUrl, challengeUrl, shareText,
  };
})();
