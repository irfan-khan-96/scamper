/* Scamper — board graph. window.MG

   A 7x7 lattice of paving slabs with the top-left block given over to the cat:
   her veranda, her basket, and the horseshoe of flagstones she has to pad round
   before she ever reaches the path.

   The path is NOT a ring. It starts at the stump beside her veranda, runs one
   way clockwise all the way round the lawn, and stops at the last square, the
   dark slab tucked in against the tree. Nobody doubles back.

   Each animal's tracks are printed across one bare corner, between two yellow
   slabs carrying its picture. Those are the shortcuts. Each skips three squares
   and drops the animal back onto the path — none of them reaches a home. Every
   animal has to walk the last square, and the tree is only ever one step past
   it. */
(function () {
  /* Every name a player sees lives here, so a rename is one edit. */
  const NAMES = {
    game: 'Scamper',
    cat: 'Biscuit',
    tagline: 'Get the critters home before Biscuit pounces.',
  };
  /* the board never changes, so every move off every square is worked out
     once and kept — the AI asks the same questions thousands of times. The
     results are shared, so callers must treat them as read-only. */
  const afterCache = {}, catCache = {};
  const P = 700 / 6;                       // one lattice pitch
  const CX = 500, CY = 500;
  const cell = (c, r) => ({ x: +(150 + c * P).toFixed(1), y: +(150 + r * P).toFixed(1) });
  const rad = (d) => (d * Math.PI) / 180;

  /* the printed path, clockwise from the stump. The top row starts at column 2
     because columns 0-1 are the cat's veranda, and the left column stops at row 3
     because her horseshoe curls through the rest. */
  const CELLS = [
    [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],                  //  0- 4  across the top
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],                  //  5- 9  down the right
    [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],  // 10-16  back along the bottom
    [0, 5], [0, 4], [0, 3],                                  // 17-19  up the left
    [1, 3],                                                  // 20     the last square
  ];
  const RING = CELLS.map((c) => cell(c[0], c[1]));
  const N = RING.length;                   // 21 slabs, 0..20
  const LAST = N - 1;                      // the only way off the path
  const STUMP = 0;

  /* off-path nodes */
  const H_MOUSE = 21, H_SQ = 22, H_BIRD = 23, BED = 24, FLAG0 = 25, FLAGS = 6;
  const OFF = {
    21: { x: 430, y: 590 },                // the burrow, right in against the roots
    22: { x: 600, y: 318 },                // squirrel's branch disc, slotted into the crown's right
    23: { x: 400, y: 358 },                // bird's nest disc, slotted into the crown's left
    24: { x: 166, y: 172 },                // the cat's basket, up on the veranda
  };
  /* The cage on her veranda, where her catches end up. It is not a node — a
     caught critter is off the board and never moves again — but the pieces
     have to be set down somewhere, and it wants to be somewhere plainly hers
     and plainly not her dinner bowl. It sits along the back rail, behind the
     basket. */
  const CAGE = { x: 166, y: 122, w: 142, h: 56 };
  const CAGE_SLOTS = [[-46, 20], [0, 22], [46, 20]];

  /* her horseshoe: off the decking, out into the lawn and back up to the stump */
  const HS = { cx: 258, cy: 258, r: 118, a0: 155, a1: -5 };
  for (let i = 0; i < FLAGS; i++) {
    const a = rad(HS.a0 + (HS.a1 - HS.a0) * (i / (FLAGS - 1)));
    OFF[FLAG0 + i] = {
      x: +(HS.cx + HS.r * Math.cos(a)).toFixed(1),
      y: +(HS.cy + HS.r * Math.sin(a)).toFixed(1),
    };
  }

  const isHome = (n) => n === H_MOUSE || n === H_SQ || n === H_BIRD;
  const isSpur = (n) => n === BED || (n >= FLAG0 && n < FLAG0 + FLAGS);
  const nodePos = (n) => (n < N ? RING[n] : OFF[n]);

  const ANIMALS = ['mouse', 'squirrel', 'bird'];
  const META = {
    mouse: { label: 'Mouse', home: H_MOUSE, homeName: 'the burrow', short: 'the burrow', color: '#8d8378' },
    squirrel: { label: 'Squirrel', home: H_SQ, homeName: 'the branch', short: 'the branch', color: '#d1732a' },
    bird: { label: 'Bird', home: H_BIRD, homeName: 'the nest', short: 'the nest', color: '#3f7fb5' },
  };
  /* every marked slab on the board is the same yellow — the animal is named by
     the picture printed on it, not by the colour of the stone */
  const TILE = '#f5c93f';

  /* k > 0 bends toward the middle of the garden, k < 0 bows away from it */
  function bow(a, b, k) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    return { x: mx + (CX - mx) * k, y: my + (CY - my) * k };
  }
  const n1 = (v) => +v.toFixed(1);
  const quad = (a, q, b) => `M${n1(a.x)},${n1(a.y)} Q${n1(q.x)},${n1(q.y)} ${n1(b.x)},${n1(b.y)}`;
  function atT(a, q, b, t) {
    const u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * q.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * q.y + t * t * b.y,
      a: Math.atan2(2 * u * (q.y - a.y) + 2 * t * (b.y - q.y),
        2 * u * (q.x - a.x) + 2 * t * (b.x - q.x)) * 180 / Math.PI,
    };
  }

  /* ---- the cat's walk off the veranda ----
     The flagstones are hers alone. She pads round them out of the basket, joins
     the path at the stump and walks the whole of it; then, having run out of
     path at the last square, she trots back across the lawn to her basket and
     starts again. So she never doubles back either — her route is simply a
     longer loop than the animals'. */
  const SPUR = [];
  for (let i = 0; i < FLAGS; i++) SPUR.push({ from: i === 0 ? BED : FLAG0 + i - 1, to: FLAG0 + i });
  SPUR.push({ from: FLAG0 + FLAGS - 1, to: STUMP });
  SPUR.forEach((s) => { s.k = -0.06; });
  /* the long trot home, up the near side of the tree */
  const HOMEWARD = { from: LAST, to: BED, kind: 'walk', k: -0.5 };

  /* ---- the last step off the path, onto a home ----
     All three leave from the last square: the mouse drops into the burrow, the
     bird lifts off to the nest, the squirrel goes up the trunk and out along
     its branch. */
  const TRAILS = [
    { owner: 'mouse', from: LAST, to: H_MOUSE, kind: 'tunnel', k: -0.16 },
    { owner: 'bird', from: LAST, to: H_BIRD, kind: 'flight', k: 0.34 },
    { owner: 'squirrel', from: LAST, to: H_SQ, kind: 'climb', trunk: true },
  ];

  /* ---- the three corner cuts ----
     from the yellow slab carrying the animal's picture to the next one round,
     skipping the three squares in between. Never to a home. */
  const SHORTCUTS = [
    { owner: 'mouse', from: 2, to: 6, kind: 'scamper', name: 'Mouse Run', corner: 'TR' },
    { owner: 'squirrel', from: 8, to: 12, kind: 'scamper', name: 'Squirrel Run', corner: 'BR' },
    { owner: 'bird', from: 14, to: 18, kind: 'scamper', name: 'Bird Hop', corner: 'BL' },
  ];
  /* the cuts bow away from the middle so they hug their corner and stay clear
     of the tree, exactly as the tracks are printed.

     Each one also carries the squares it skips. Going round a cut means
     crossing those squares — no paw is set down on them, but they were crossed
     all the same, and that is enough. A cat that runs over a critter has the
     critter; a critter that scampers past the cat has run into her. */
  SHORTCUTS.forEach((s) => {
    s.k = -0.13;
    s.over = [];
    for (let i = s.from + 1; i < s.to; i++) s.over.push(i);
  });

  function shape(r) {
    const a = nodePos(r.from), b = nodePos(r.to);
    r.a = a; r.b = b;
    if (r.trunk) {
      /* up the trunk, then out along the branch — one move, drawn as two */
      const k = { x: 372, y: 566 }, m = { x: 505, y: 356 };
      r.d = `M${n1(a.x)},${n1(a.y)} C${n1(k.x)},${n1(k.y)} ${n1(m.x)},${n1(m.y)} ${n1(b.x)},${n1(b.y)}`;
      r.tail = r.d.slice(r.d.indexOf(' ') + 1);
      r.at = (t) => atT(a, m, b, t);
    } else {
      const q = bow(a, b, r.k);
      r.q = q;
      r.d = quad(a, q, b);
      r.tail = `Q${n1(q.x)},${n1(q.y)} ${n1(b.x)},${n1(b.y)}`;
      r.at = (t) => atT(a, q, b, t);
    }
  }
  [...SPUR, HOMEWARD, ...TRAILS, ...SHORTCUTS].forEach(shape);

  /* one square to the next, drawn straight with a whisker of bow so a piece
     never cuts a corner off */
  const stepCache = {};
  function stepPath(from, to) {
    const key = from + '>' + to;
    if (!stepCache[key]) {
      const a = nodePos(from), b = nodePos(to);
      stepCache[key] = quad(a, bow(a, b, 0.03), b);
    }
    return stepCache[key];
  }

  /* ---- who may go where ----
     One way, always. The cat additionally has her flagstones, which she only walks
     on the way out of the basket — a treat is the only thing that puts her back
     on them. */
  const optCache = {};
  function moveOptions(node, mover) {
    const key = node + '|' + mover;
    if (key in optCache) return optCache[key];
    return (optCache[key] = moveOptionsRaw(node, mover));
  }
  function moveOptionsRaw(node, mover) {
    if (mover === 'cat') {
      for (const s of SPUR) if (s.from === node) return [{ to: s.to, kind: 'walk', d: s.d }];
      if (node < LAST) return [{ to: node + 1, kind: 'step', d: stepPath(node, node + 1) }];
      return [{ to: HOMEWARD.to, kind: 'walk', d: HOMEWARD.d }];   // back to the basket
    }
    const out = [];
    if (node < LAST) out.push({ to: node + 1, kind: 'step', d: stepPath(node, node + 1) });
    for (const t of TRAILS) if (t.owner === mover && t.from === node) out.push({ to: t.to, kind: t.kind, d: t.d });
    return out;
  }

  /* everything after the leading move-to, so two segments can be strung end to end */
  const tailOf = (d) => d.slice(d.indexOf(' ') + 1);

  /* ---- one green dot ----
     A critter steps to the next square. If that square is its own marked slab
     it carries straight on round the cut, free, in the same movement — there is
     nothing to weigh up, so it simply goes.

     `over` is every square the move covered, the skipped ones included. */
  function animalAfter(from, id, to) {
    const key = from + '|' + id + '|' + to;
    if (key in afterCache) return afterCache[key];
    return (afterCache[key] = animalAfterRaw(from, id, to));
  }
  function animalAfterRaw(from, id, to) {
    const first = moveOptions(from, id).filter((o) => o.to === to)[0];
    if (!first) return null;
    const over = [to];
    let at = to, d = first.d;
    const cut = shortcutAt(to, id);
    if (cut) {
      cut.over.forEach((n) => over.push(n));
      over.push(cut.to);
      d += ' ' + tailOf(cut.d);
      at = cut.to;
    }
    return { to: at, over, d, cut: cut || null };
  }

  /* Finish a move on a yellow slab and you take that cut, free. An animal may
     only use its own; the cat has learned all three and takes whichever she lands
     on, which is what makes the marked slabs the dangerous ones. */
  function shortcutAt(node, mover) {
    for (const s of SHORTCUTS) if (s.from === node && (mover === 'cat' || mover === s.owner)) return s;
    return null;
  }
  function routeFor(from, to, mover) {
    for (const s of SPUR) if (s.from === from && s.to === to) return { kind: 'walk', d: s.d };
    if (from === HOMEWARD.from && to === HOMEWARD.to) return { kind: 'walk', d: HOMEWARD.d };
    for (const t of TRAILS) if (t.from === from && t.to === to) return { kind: t.kind, d: t.d };
    for (const s of SHORTCUTS) if (s.from === from && s.to === to) return { kind: s.kind, d: s.d, free: true };
    if (from < N && to === from + 1) return { kind: 'step', d: stepPath(from, to) };
    return { kind: 'snap' };            // lured home by a treat
  }

  /* The carry back to the cage. A wide, unhurried arc rather than a straight
     line, so the eye can follow where the critter went instead of watching it
     vanish. */
  function carryPath(a, b) {
    const lift = Math.min(240, 70 + Math.hypot(b.x - a.x, b.y - a.y) * 0.3);
    return quad(a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - lift }, b);
  }

  /* shortest number of dots to a home, counting the free cuts as no dots */
  const homeCache = {};
  function stepsToHome(node, id) {
    const key = node + '|' + id;
    if (key in homeCache) return homeCache[key];
    return (homeCache[key] = stepsToHomeRaw(node, id));
  }
  function stepsToHomeRaw(node, id) {
    const goal = META[id].home, dist = {};
    for (let i = 0; i < N; i++) dist[i] = Infinity;
    [H_MOUSE, H_SQ, H_BIRD].forEach((n) => { dist[n] = Infinity; });
    if (!(node in dist)) return Infinity;
    dist[node] = 0;
    const dq = [node];
    while (dq.length) {
      const u = dq.shift();
      const edges = moveOptions(u, id).map((o) => ({ to: o.to, w: 1 }));
      const sc = shortcutAt(u, id);
      if (sc) edges.push({ to: sc.to, w: 0 });
      for (const e of edges) {
        if (dist[u] + e.w < dist[e.to]) {
          dist[e.to] = dist[u] + e.w;
          if (e.w === 0) dq.unshift(e.to); else dq.push(e.to);
        }
      }
    }
    return dist[goal];
  }
  /* ---- the cat's move ----
     n slabs, one after another. Finish one on a marked slab and she carries on
     round the cut in the same movement: she has learned all three and never
     stops to think about it.

     `over` is every square the move covered, in order — the slabs she set a paw
     on and the ones she crossed going round a corner. All of them count. */
  function catAfter(from, n) {
    const key = from + '|' + n;
    if (key in catCache) return catCache[key];
    return (catCache[key] = catAfterRaw(from, n));
  }
  function catAfterRaw(from, n) {
    let at = from;
    const via = [], over = [];
    let cut = null, d = '';
    const add = (o, to) => {
      d += (d ? ' ' : `M${n1(nodePos(at).x)},${n1(nodePos(at).y)} `) + tailOf(o.d);
      at = to; via.push(to);
    };
    for (let i = 0; i < n; i++) {
      const o = moveOptions(at, 'cat');
      if (!o.length) break;
      add(o[0], o[0].to);
      over.push(at);
      const c = shortcutAt(at, 'cat');
      if (c) { c.over.forEach((s) => over.push(s)); add(c, c.to); over.push(at); cut = c; }
    }
    return { to: at, via, over, cut, d: d || null };
  }

  /* the whole of the cat's walk, in order, from wherever she is standing */
  function catWalk(from) {
    const out = [];
    let at = from, guard = 0;
    while (guard++ < 60) {                 // a good two of her laps
      const w = catAfter(at, 1);           // one dot, cuts and all
      if (w.to === at) break;
      at = w.to; out.push(at);
    }
    return out;
  }
  /* how many stones she still has to cover to reach a square; Infinity if she
     has already walked past it */
  function catStepsTo(from, to) {
    const w = catWalk(from);
    const i = w.indexOf(to);
    return i < 0 ? Infinity : i + 1;
  }

  /* how many of her dots until she covers a square — counting the squares she
     crosses going round a cut, not only the ones she lands on */
  function catCoverIn(from, sq) {
    let at = from;
    for (let i = 1; i <= 40; i++) {
      const w = catAfter(at, 1);
      if (w.to === at) return Infinity;
      if (w.over.indexOf(sq) >= 0) return i;
      at = w.to;
    }
    return Infinity;
  }

  window.MG = {
    NAMES, catCoverIn,
    N, LAST, RING, OFF, CELLS, P, nodePos, isHome, isSpur,
    BED, STUMP, START: STUMP, FLAG0, FLAGS, H_MOUSE, H_SQ, H_BIRD, TILE,
    CAGE, CAGE_SLOTS, carryPath,
    ANIMALS, META, SPUR, HOMEWARD, TRAILS, SHORTCUTS, atT, bow,
    moveOptions, animalAfter, shortcutAt, routeFor, stepsToHome, catStepsTo, catWalk, catAfter,
  };
})();
