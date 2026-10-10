/* Scamper — the AI that sets par. window.MAI

   Par is what this player scores on the day's dice. It sees exactly what a
   person sees — this turn's dice and the red zone — and nothing of the dice to
   come: when it wants to know how a move will turn out it plays the rest of
   the game out many times on made-up dice, never the real ones.

   Two layers:
     quickTurn  a fast rule of thumb: get critters out of the red zone, spend a
                treat when that cannot be done, otherwise push on. Used inside
                the playouts.
     planTurn   tries every distinct way to spend this turn, plays each one out
                N times with quickTurn, and keeps whichever saves most.

   Everything is seeded off the game's own seed, so par comes out the same on
   every device. */
(function () {
  const G = window.MG, R = window.MR;

  /* the state is small and flat, and the dice object is never mutated */
  function copy(g) {
    return {
      v: g.v, seed: g.seed, mood: g.mood, mode: g.mode, day: g.day, target: g.target,
      cat: g.cat,
      animals: { mouse: g.animals.mouse, squirrel: g.animals.squirrel, bird: g.animals.bird },
      home: Object.assign({}, g.home), eaten: Object.assign({}, g.eaten),
      treats: g.treats, turn: g.turn, phase: g.phase, dice: g.dice,
      moves: g.moves, catLeft: g.catLeft, laid: g.laid,
    };
  }
  const finishCat = (g) => { let k = 0; while (g.phase === 'cat' && k++ < 8) R.catStep(g); };

  /* how many steps, on its own, it takes a critter to get clear of a zone:
     1, 2, or Infinity */
  function stepsOut(g, id, inT) {
    let at = g.animals[id];
    for (let k = 1; k <= 2; k++) {
      const opt = G.moveOptions(at, id)[0];
      if (!opt) return Infinity;
      const mv = G.animalAfter(at, id, opt.to);
      if (mv.over.indexOf(g.cat) >= 0) return Infinity;
      if (mv.to === G.META[id].home || !inT(mv.to)) return k;
      at = mv.to;
    }
    return Infinity;
  }

  function quickTurn(g) {
    if (g.phase !== 'move') return;
    const turn = g.turn;
    let T = R.threat(g);
    let inT = (sq) => T.indexOf(sq) >= 0;
    if (T.length && R.canTreat(g)) {
      let need = 0, hopeless = false;
      for (const id of R.live(g)) {
        if (!inT(g.animals[id])) continue;
        const k = stepsOut(g, id, inT);
        if (k === Infinity) hopeless = true; else need += k;
      }
      if (hopeless || need > g.moves) {
        R.treat(g);
        T = R.threat(g);
        inT = (sq) => T.indexOf(sq) >= 0;
      }
    }
    let guard = 0;
    while (g.turn === turn && g.phase === 'move' && g.moves > 0 && guard++ < 4) {
      const L = R.live(g);
      let best = null, bs = -1e9;
      for (const id of L) {
        if (R.blocked(g, id)) continue;
        const here = g.animals[id];
        const mv = R.stepFor(g, id);
        const home = mv.to === G.META[id].home;
        const was = inT(here), now = !home && inT(mv.to);
        const d1 = G.stepsToHome(mv.to, id);
        /* progress, with a slight lean towards whoever is furthest on */
        let s = (G.stepsToHome(here, id) - d1) * 3 + (20 - d1) * 0.5;
        if (home) s += 60;
        if (was && !now) s += 100;
        else if (was && g.moves >= 2 && stepsOut(g, id, inT) === 2) s += 70;
        if (!was && now) s -= 100;
        if (L.some((o) => o !== id && g.animals[o] === mv.to)) s -= 15;
        if (s > bs) { bs = s; best = id; }
      }
      /* only a step into the red zone is worse than standing still */
      if (best == null || bs < -50) break;
      R.step(g, best);
    }
    if (g.turn === turn && g.phase === 'move') R.stay(g);
  }

  function playOut(g, turnFn) {
    let guard = 0;
    while (g.phase !== 'over' && guard++ < 2000) {
      if (g.phase === 'move') turnFn(g);
      finishCat(g);
    }
    return R.saved(g);
  }

  const keyOf = (c) => c.cat + ':' + c.treats + ':' +
    G.ANIMALS.map((id) => (c.home[id] ? 'h' : c.eaten[id] ? 'x' : c.animals[id])).join(',');

  /* every distinct way to spend this turn, each left just before the cat goes */
  function candidates(g) {
    const out = [], seen = {};
    const L = R.live(g);
    const seqs = [[]];
    if (g.moves >= 1) L.forEach((a) => seqs.push([a]));
    if (g.moves >= 2) L.forEach((a) => L.forEach((b) => seqs.push([a, b])));
    const treats = R.canTreat(g) ? [false, true] : [false];
    for (const t of treats) {
      for (const seq of seqs) {
        const c = copy(g), turn = c.turn;
        if (t) R.treat(c);
        let ok = true;
        for (const id of seq) {
          if (c.turn !== turn || c.phase !== 'move' || !R.step(c, id)) { ok = false; break; }
        }
        if (!ok) continue;
        if (c.turn === turn && c.phase === 'move') R.stay(c);
        const k = keyOf(c) + '|' + c.phase + c.turn;
        if (seen[k]) continue;
        seen[k] = 1;
        out.push({ treat: t, seq, state: c });
      }
    }
    return out;
  }

  /* a small 0..1 measure of how well placed a position is, for tie-breaks */
  function shape(c) {
    let v = 0;
    for (const id of G.ANIMALS) {
      if (c.home[id]) v += 1;
      else if (!c.eaten[id]) v += 1 - Math.min(18, G.stepsToHome(c.animals[id], id)) / 18;
    }
    return v / 3 + c.treats * 0.02;
  }

  /* the best way to spend this turn, by N playouts each on made-up dice */
  function planTurn(g, N) {
    const cands = candidates(g);
    if (cands.length <= 1) return cands[0] || { treat: false, seq: [] };
    let best = cands[0], bs = -1;
    for (const c of cands) {
      let total = 0;
      for (let i = 0; i < N; i++) {
        const s = copy(c.state);
        /* the same made-up dice for every candidate, so they are compared on
           equal terms — and never the real ones */
        s.seed = g.seed + '~' + g.turn + '~' + i;
        finishCat(s);
        total += playOut(s, quickTurn);
      }
      /* Playouts only count stars, so plenty of candidates tie. Ties go to
         the one further along and not standing in harm's way — otherwise the
         first in the list wins, and the first in the list is doing nothing. */
      const score = total / N + 0.01 * shape(c.state);
      if (score > bs) { bs = score; best = c; }
    }
    return best;
  }

  function applyPlan(g, plan) {
    const turn = g.turn;
    if (plan.treat) R.treat(g);
    for (const id of plan.seq) { if (g.turn !== turn || g.phase !== 'move' || !R.step(g, id)) break; }
    if (g.turn === turn && g.phase === 'move') R.stay(g);
  }

  /* Par, worked out a turn at a time so a page can run it between frames:
     call step() until it returns true, then read .saved */
  function parRunner(seed, mood, N) {
    const g = R.newGame({ seed, mood });
    const run = {
      saved: null,
      step() {
        if (g.phase === 'over') { run.saved = R.saved(g); return true; }
        if (g.phase === 'move') applyPlan(g, planTurn(g, N));
        finishCat(g);
        if (g.phase === 'over') { run.saved = R.saved(g); return true; }
        return false;
      },
    };
    return run;
  }
  function par(seed, mood, N) {
    const r = parRunner(seed, mood, N || PAR_N);
    let guard = 0;
    while (!r.step() && guard++ < 1000);
    return r.saved;
  }
  const PAR_N = 8;           // playouts per candidate move: as strong as 12 on measurement, a third quicker

  /* ---- par off the main thread ----

     Working par out takes a second or more of solid thinking, and a single
     turn of it can take tens of milliseconds. Done on the page itself that
     came straight out of the animation's frames — the pieces stuttered for
     the first few seconds of every new game. So it runs in a Web Worker built
     from this very file and its two neighbours, and the page only ever waits
     for the answer.

     If a worker cannot be made (a strict host, an old browser) it falls back
     to thinking on the page, but only between turns, never while anything is
     moving. */
  const IN_WORKER = typeof document === 'undefined' && typeof postMessage === 'function';
  if (IN_WORKER) {
    self.onmessage = (e) => {
      const d = e.data || {};
      postMessage({ id: d.id, saved: par(d.seed, d.mood, d.N) });
    };
  }

  let worker = null, workerFailed = false, seq = 0;
  const waiting = {};
  function sourceOf(url) {
    /* the single-file build keeps its modules as Blobs; read them directly,
       because some hosts refuse fetch() of blob: URLs */
    const b = window.__resourceBlobs && window.__resourceBlobs[url];
    if (b) return b.text();
    return fetch(url).then((r) => { if (!r.ok) throw new Error('fetch ' + url); return r.text(); });
  }
  function startWorker() {
    const parts = window.__aiParts || ['src/graph.js', 'src/rules.js', 'src/ai.js'];
    return Promise.all(parts.map(sourceOf)).then((texts) => {
      const code = 'self.window = self;\n' + texts.join('\n;\n');
      const w = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      w.onmessage = (e) => {
        const cb = waiting[e.data.id];
        delete waiting[e.data.id];
        if (cb) cb.resolve(e.data.saved);
      };
      w.onerror = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        workerFailed = true;
        Object.keys(waiting).forEach((k) => { const cb = waiting[k]; delete waiting[k]; cb.reject(new Error('worker')); });
      };
      return w;
    });
  }
  function parOnPage(seed, mood) {
    return new Promise((resolve) => {
      const run = parRunner(seed, mood, PAR_N);
      const tick = () => {
        if (window.Motion && window.Motion.busy) { setTimeout(tick, 150); return; }
        if (run.step()) { resolve(run.saved); return; }
        setTimeout(tick, 40);
      };
      setTimeout(tick, 800);
    });
  }
  function parAsync(seed, mood) {
    if (IN_WORKER || workerFailed || typeof Worker === 'undefined') return parOnPage(seed, mood);
    if (!worker) worker = startWorker();
    const ask = worker.then((w) => new Promise((resolve, reject) => {
      const id = ++seq;
      waiting[id] = { resolve, reject };
      w.postMessage({ id, seed, mood, N: PAR_N });
      /* a worker that never answers is as good as none */
      setTimeout(() => { if (waiting[id]) { delete waiting[id]; reject(new Error('timeout')); } }, 30000);
    }));
    return ask.catch(() => { workerFailed = true; worker = null; return parOnPage(seed, mood); });
  }

  window.MAI = { PAR_N, copy, quickTurn, planTurn, applyPlan, playOut, finishCat, parRunner, par, parAsync };
})();
