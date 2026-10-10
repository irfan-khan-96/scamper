/* Scamper — rules. window.MR

   One player. You move the three critters; the cat moves herself.

   Every turn opens with the dice already thrown. A black die is a slab for the
   cat, a green die is one step for one critter. Before anything moves you are
   shown exactly which squares she is about to sweep, so the turn is a small
   puzzle rather than a lottery: spend your green steps (and, if you must, a
   treat) getting critters out of her way, then she goes.

   She catches whatever she covers — the slab she lands on and the squares she
   crosses going round a corner cut. A treat sends her straight back to her
   basket. Each critter that reaches its home is a star; three stars is a
   perfect garden.

   The dice come off a seed, one roll per turn number, so the same seed gives
   everybody the same dice whatever they do with them. That is what makes a
   daily puzzle, a par and a challenge link possible. */
(function () {
  const G = window.MG;

  /* How hungry she is sets how often a die comes up black and how many treats
     you get. The daily puzzle walks through these across the week. */
  const MOODS = {
    sleepy: { key: 'sleepy', label: 'Sleepy', emoji: '😴', black: 0.40, treats: 3 },
    peckish: { key: 'peckish', label: 'Peckish', emoji: '🙂', black: 0.45, treats: 3 },
    hungry: { key: 'hungry', label: 'Hungry', emoji: '😼', black: 0.48, treats: 3 },
    starving: { key: 'starving', label: 'Starving', emoji: '😾', black: 0.52, treats: 3 },
  };
  const MOOD_KEYS = Object.keys(MOODS);
  const MAX_TURNS = 300;

  /* ---- seeded dice ---- */
  function hash(str) {                       // FNV-1a
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {                       // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* the roll for one turn of one seed — the same for everyone, whatever they
     have done on the turns before */
  function diceFor(seed, turn, mood) {
    const p = (MOODS[mood] || MOODS.hungry).black;
    const r = rng(hash(seed + '#' + turn));
    const a = r() < p ? 'black' : 'green';
    const b = r() < p ? 'black' : 'green';
    const black = (a === 'black') + (b === 'black');
    return { faces: [a, b], black, green: 2 - black };
  }
  const randomSeed = () => Math.random().toString(36).slice(2, 8);

  /* ---- the game ---- */
  function newGame(opts) {
    const o = opts || {};
    const mood = MOODS[o.mood] ? o.mood : 'hungry';
    const seed = String(o.seed || randomSeed());
    const g = {
      v: 2, seed, mood, mode: o.mode || 'practice', day: o.day || null, target: o.target == null ? null : o.target,
      cat: G.BED,
      animals: { mouse: G.START, squirrel: G.START, bird: G.START },
      home: {}, eaten: {},
      treats: MOODS[mood].treats,
      turn: 0, phase: 'move', dice: null, moves: 0, catLeft: 0, laid: false,
    };
    startTurn(g);
    return g;
  }
  const clone = (g) => JSON.parse(JSON.stringify(g));

  const live = (g) => G.ANIMALS.filter((id) => !g.home[id] && !g.eaten[id]);
  const saved = (g) => G.ANIMALS.filter((id) => g.home[id]).length;
  const caught = (g) => G.ANIMALS.filter((id) => g.eaten[id]).length;

  function checkEnd(g) {
    if (live(g).length && g.turn <= MAX_TURNS) return false;
    g.phase = 'over';
    g.moves = 0; g.catLeft = 0;
    return true;
  }

  function startTurn(g) {
    if (checkEnd(g)) return;
    g.turn += 1;
    g.dice = diceFor(g.seed, g.turn, g.mood);
    g.moves = g.dice.green;
    g.catLeft = 0;
    g.laid = false;
    g.phase = 'move';
  }

  /* Every square she will cover this turn, from wherever she is now. This is
     the red zone the player sees before moving. */
  function threat(g, from) {
    const out = [];
    let at = from == null ? g.cat : from;
    const dots = g.phase === 'cat' ? g.catLeft : (g.dice ? g.dice.black : 0);
    for (let i = 0; i < dots; i++) {
      const w = G.catAfter(at, 1);
      if (w.to === at) break;
      w.over.forEach((s) => { if (out.indexOf(s) < 0) out.push(s); });
      at = w.to;
    }
    return out;
  }

  /* ---- the critters ---- */

  /* Each critter has exactly one square it can go to next, so a tap on it is
     the whole of a move. */
  function stepFor(g, id) {
    if (!g.animals || g.home[id] || g.eaten[id]) return null;
    const opt = G.moveOptions(g.animals[id], id)[0];
    return opt ? G.animalAfter(g.animals[id], id, opt.to) : null;
  }
  /* why a critter cannot move right now, or null if it can */
  function blocked(g, id) {
    if (g.phase !== 'move') return 'wait';
    if (g.home[id] || g.eaten[id]) return 'gone';
    if (g.moves <= 0) return 'nomoves';
    const mv = stepFor(g, id);
    if (!mv) return 'stuck';
    /* stepping onto her, or scampering past her round a cut, is never a move —
       it is handing her the critter */
    if (mv.over.indexOf(g.cat) >= 0) return 'cat';
    return null;
  }
  /* one green step; returns what happened, for the board to show */
  function step(g, id) {
    if (blocked(g, id)) return null;
    const from = g.animals[id];
    const mv = stepFor(g, id);
    g.moves -= 1;
    g.animals[id] = mv.to;
    const ev = { id, from, to: mv.to, d: mv.d, cut: mv.cut ? mv.cut.name : null, home: false };
    if (mv.to === G.META[id].home) { g.home[id] = true; ev.home = true; }
    if (!checkEnd(g) && g.moves <= 0) beginCat(g);
    return ev;
  }

  /* A treat, free, once a turn: she drops everything and goes back to her
     basket. Her sweep this turn then starts from there. */
  const canTreat = (g) => g.phase === 'move' && g.treats > 0 && !g.laid && g.cat !== G.BED;
  function treat(g) {
    if (!canTreat(g)) return null;
    const from = g.cat;
    g.treats -= 1; g.laid = true; g.cat = G.BED;
    return { from, to: G.BED };
  }
  /* done moving — spare green steps are simply not taken */
  function stay(g) {
    if (g.phase !== 'move') return false;
    g.moves = 0;
    beginCat(g);
    return true;
  }

  /* ---- the cat ---- */
  function beginCat(g) {
    g.phase = 'cat';
    g.catLeft = g.dice.black;
    if (g.catLeft <= 0) startTurn(g);
  }
  /* one of her black dots: one slab, and on round the cut if it is a marked
     one. Whatever she covers is hers. */
  function catStep(g) {
    if (g.phase !== 'cat' || g.catLeft <= 0) return null;
    const from = g.cat;
    const w = G.catAfter(from, 1);
    g.catLeft -= 1;
    const ev = { from, to: w.to, d: w.d, cut: w.cut ? w.cut.name : null, over: w.over, caught: [] };
    if (w.to !== from) {
      g.cat = w.to;
      live(g).forEach((id) => {
        if (w.over.indexOf(g.animals[id]) >= 0) { g.eaten[id] = true; ev.caught.push(id); }
      });
    }
    if (!checkEnd(g) && g.catLeft <= 0) startTurn(g);
    return ev;
  }

  /* ---- what may be loaded back from storage or a link ---- */
  const NODE_OK = (v) => typeof v === 'number' && isFinite(v) && !!G.nodePos(v);
  const COUNT_OK = (v) => typeof v === 'number' && isFinite(v) && v >= 0 && v <= 9999;
  const PLAIN = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  function sane(s) {
    if (!PLAIN(s) || s.v !== 2) return false;
    if (typeof s.seed !== 'string' || !MOODS[s.mood]) return false;
    if (!NODE_OK(s.cat)) return false;
    if (!PLAIN(s.animals) || !G.ANIMALS.every((id) => NODE_OK(s.animals[id]))) return false;
    if (!PLAIN(s.home) || !PLAIN(s.eaten)) return false;
    if (G.ANIMALS.some((id) => s.home[id] && s.eaten[id])) return false;
    if (!COUNT_OK(s.treats) || s.treats > 9) return false;
    if (!COUNT_OK(s.turn) || !COUNT_OK(s.moves) || !COUNT_OK(s.catLeft)) return false;
    if (['move', 'cat', 'over'].indexOf(s.phase) < 0) return false;
    if (!PLAIN(s.dice) || !COUNT_OK(s.dice.black) || !COUNT_OK(s.dice.green)) return false;
    return true;
  }

  window.MR = {
    MOODS, MOOD_KEYS, MAX_TURNS,
    hash, rng, diceFor, randomSeed,
    newGame, clone, live, saved, caught, threat,
    stepFor, blocked, step, canTreat, treat, stay, beginCat, catStep, startTurn, sane,
  };
})();
