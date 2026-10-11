/* Scamper — pieces + motion engine.
   The four pieces are wooden standees, drawn as flat silhouettes standing on
   the lawn: a body in the piece colour, a darker ply edge down one side, and a
   cast shadow at the feet. Every figure is anchored at y=0 (the feet) so it
   stands on its tile instead of sitting in the middle of it.

   Movement runs imperatively along the real printed paths (rAF, transform only)
   so it stays smooth. A burrow move is the set piece: the critter dives, the
   soil erupts, a travelling mound tunnels along the route throwing dirt, and it
   bursts back out at the far end. */

/* silhouettes: origin at the feet, figure rising into negative y */
const FIG = {
  cat: {
    h: 74, w: 44,
    body: 'M-16,0 C-20,-12 -19,-26 -15,-37 C-12,-44 -10,-47 -10,-50 L-15,-66 L-2,-56 '
        + 'C2,-57 7,-57 11,-56 L19,-67 L15,-50 C19,-45 21,-38 21,-29 C21,-16 19,-6 17,0 Z',
    tail: 'M15,-1 C27,-3 33,-12 30,-22 C28,-29 22,-31 19,-27 C23,-23 24,-16 18,-12 Z',
    edge: 'M-16,0 C-20,-12 -19,-26 -15,-37 C-12,-44 -10,-47 -10,-50 L-15,-66 L-8,-60 '
        + 'L-6,-48 C-10,-42 -12,-32 -12,-22 C-12,-12 -11,-5 -10,0 Z',
    eye: [[-3, -46], [7, -46]], ear: null,
  },
  mouse: {
    h: 42, w: 46,
    body: 'M-6,0 C-16,-1 -22,-7 -21,-15 C-20,-23 -12,-28 -2,-27 C8,-27 17,-23 20,-14 '
        + 'C22,-7 17,-1 8,0 Z',
    tail: 'M18,-2 C27,-4 31,-11 27,-17 C25,-20 21,-20 20,-17',
    edge: 'M-6,0 C-16,-1 -22,-7 -21,-15 C-20,-23 -12,-28 -2,-27 C-6,-22 -8,-14 -7,-7 C-7,-4 -6,-2 -6,0 Z',
    eye: [[-11, -17]], ear: { cx: -13, cy: -24, r: 7 },
  },
  squirrel: {
    h: 62, w: 46,
    body: 'M-4,0 C-13,-1 -19,-7 -18,-17 C-17,-25 -13,-30 -10,-33 C-13,-37 -13,-43 -9,-46 '
        + 'C-4,-49 2,-47 3,-42 C4,-37 1,-34 -2,-33 C4,-30 9,-24 10,-16 C11,-7 8,-1 2,0 Z',
    tail: 'M6,-2 C20,-4 26,-16 23,-30 C21,-42 12,-48 5,-45 C12,-40 16,-31 14,-22 '
        + 'C12,-14 8,-9 3,-7 Z',
    edge: 'M-4,0 C-13,-1 -19,-7 -18,-17 C-17,-25 -13,-30 -10,-33 C-13,-37 -13,-43 -9,-46 '
        + 'C-6,-48 -3,-48 -1,-46 C-6,-42 -6,-37 -3,-34 C-8,-30 -11,-24 -11,-16 C-11,-8 -9,-3 -7,0 Z',
    eye: [[-6, -42]], ear: { cx: -9, cy: -50, r: 4.4 },
  },
  bird: {
    h: 44, w: 48,
    body: 'M-2,0 C-11,-1 -18,-6 -19,-15 C-20,-25 -12,-32 -2,-32 C8,-32 16,-26 17,-17 '
        + 'C18,-8 12,-1 4,0 Z',
    tail: 'M14,-6 C24,-8 30,-13 33,-19 C27,-19 21,-17 15,-14 Z',
    edge: 'M-2,0 C-11,-1 -18,-6 -19,-15 C-20,-25 -12,-32 -2,-32 C-6,-26 -8,-19 -7,-11 C-7,-6 -5,-2 -2,0 Z',
    eye: [[-9, -22]], beak: 'M-18,-20 L-27,-17 L-18,-14 Z',
  },
};

/* small flat glyphs, reused in the rail, the roster and the wordmark */
const PG = {
  cat: (
    <g>
      <path d="M-15,-4 L-17,-20 L-5,-11 Q0,-13 5,-11 L17,-20 L15,-4 Q19,3 15,10 Q8,17 0,17 Q-8,17 -15,10 Q-19,3 -15,-4 Z" fill="currentColor" />
      <circle cx="-6" cy="1" r="2.1" fill="#1c1712" /><circle cx="6" cy="1" r="2.1" fill="#1c1712" />
      <path d="M-3,7 Q0,9.5 3,7" fill="none" stroke="#1c1712" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  mouse: (
    <g fill="currentColor">
      <ellipse cx="3" cy="4" rx="13" ry="9.2" /><circle cx="-10" cy="0" r="6.8" /><circle cx="-12.5" cy="-6.5" r="3.8" />
      <path d="M15,6 Q23,11 19,18" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="-13" cy="0.5" r="1.7" fill="#2a231a" />
    </g>
  ),
  squirrel: (
    <g fill="currentColor">
      <path d="M7,11 Q24,6 20,-9 Q17,-20 5,-18 Q14,-11 12,-3 Q10,4 3,8 Z" />
      <ellipse cx="-4" cy="6" rx="10" ry="11" /><circle cx="-6" cy="-7" r="7.2" /><circle cx="-9" cy="-13" r="3.2" />
      <circle cx="-9" cy="-6.5" r="1.7" fill="#2a231a" />
    </g>
  ),
  bird: (
    <g fill="currentColor">
      <path d="M-12,3 Q-10,-10 2,-11 Q15,-11 17,1 Q18,10 6,13 Q-6,14 -12,3 Z" />
      <path d="M-2,-2 Q7,-7 13,2 Q6,7 -2,-2 Z" fill="#2a231a" opacity="0.18" />
      <path d="M16,-3 L25,0.5 L16,4 Z" fill="#e8a33c" />
      <circle cx="7" cy="-4" r="1.9" fill="#2a231a" />
    </g>
  ),
};

/* ---------------- resting layout ---------------- */
/* returns {id: {x,y,s}} for every piece; y is where the feet land.
   Pieces sharing a tile cluster instead of queueing in a row. */
const CLUSTER = {
  1: [[0, 0]],
  2: [[-21, -6], [21, 6]],
  3: [[-32, -9], [30, -5], [-2, 15]],
  4: [[-34, -10], [32, -10], [-16, 14], [18, 17]],
};
/* Where a critter ends up once the cat has it: in the cage along the back rail of
   her veranda. Leaving them there rather than deleting them off the board
   keeps the score where the story is — the cage fills up as she wins.

   Not the basket. That is her bed and her dinner bowl, and a mouse sitting in
   it read as a guest rather than a catch. */
const cageSlot = (k) => {
  const G = window.MG, o = G.CAGE_SLOTS[k] || [0, G.CAGE_SLOTS[1][1]];
  return { x: G.CAGE.x + o[0], y: G.CAGE.y + o[1] };
};
const CAGED_S = 0.52;

/* `hold` is how a catch is kept on the board while it is being carried off.
   The state says it is in the cage the instant she gets it, but the carry
   takes a second and a half; without this the piece would be drawn in the cage
   and then have to fly backwards out of it. Each entry is where the piece
   should go on being drawn instead, and the app clears the lot when the last
   one has been set down. */
function layout(g, hold) {
  const G = window.MG;
  const at = {};
  const put = (n, id) => { (at[n] = at[n] || []).push(id); };
  G.ANIMALS.forEach((id) => { if (!g.eaten || !g.eaten[id]) put(g.animals[id], id); });
  put(g.cat, 'cat');
  const out = {};
  Object.keys(at).forEach((k) => {
    const n = +k, ids = at[k], p = G.nodePos(n), c = ids.length;
    const onTree = n === G.H_SQ || n === G.H_BIRD;
    const inBed = n === G.BED;
    const spread = CLUSTER[Math.min(c, 4)] || CLUSTER[1];
    const base = onTree ? 0.76 : c > 2 ? 0.8 : c > 1 ? 0.9 : 1;
    ids.forEach((id, i) => {
      const o = spread[i] || [0, 0];
      out[id] = { x: p.x + o[0], y: p.y + o[1] + (onTree ? 12 : inBed ? 26 : 18), s: base, n };
    });
  });
  /* the ones she has caught, shut in the cage in the order she got them */
  let k = 0;
  G.ANIMALS.forEach((id) => {
    if (!g.eaten || !g.eaten[id]) return;
    const c = cageSlot(k++);
    const h = hold && hold[id];
    out[id] = h ? { x: h.x, y: h.y, s: h.s || 1, n: null, caught: false }
      : { x: c.x, y: c.y, s: CAGED_S, n: null, caught: true };
  });
  return out;
}

/* ---------------- motion engine ---------------- */
const Motion = (() => {
  const els = new Map();
  const NS = 'http://www.w3.org/2000/svg';
  let digger = null, burst = null, busy = false, scratch = null;

  const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const backOut = (u) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function register(id, node) { if (node) els.set(id, node); else els.delete(id); }
  /* Pin a piece where it is standing. A catch is re-rendered into the cage the
     instant the state lands, so anything waiting its turn to be carried has to
     be put back where it was caught or it sits in the cage and then flies out
     of it backwards. */
  function place(id, p) {
    const el = els.get(id); if (!el) return;
    el.style.transform = `translate(${p.x}px,${p.y}px)`;
  }
  function setDigger(node) { digger = node; }
  function setBurst(node) { burst = node; }

  /* a spray of soil at a hole mouth, restarted by re-adding the class */
  function soil(x, y, color) {
    if (!burst) return;
    burst.style.transform = `translate(${x}px,${y}px)`;
    if (color) burst.style.color = color;
    burst.classList.remove('is-on');
    void burst.getBoundingClientRect();
    burst.classList.add('is-on');
  }

  /* An off-screen path to ask for points along a route.

     One per move, not one shared between them. There used to be a single
     element here that every animation reused, which was invisible for as long
     as only one piece ever moved at a time — and then two catches carried home
     together started overwriting each other's geometry mid-flight and both of
     them jittered across the garden. Each move gets its own, and hands it back
     when it settles. */
  function measure(d) {
    if (!scratch) {
      scratch = document.createElementNS(NS, 'svg');
      scratch.setAttribute('width', '0');
      scratch.setAttribute('height', '0');
      scratch.setAttribute('aria-hidden', 'true');
      scratch.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden';
      document.body.appendChild(scratch);
    }
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    scratch.appendChild(p);
    return p;
  }
  const drop = (p) => { if (p && p.parentNode) p.parentNode.removeChild(p); };

  /* spec: {id, route, from:{x,y}, to:{x,y}, dur, color, reduce, onDone} */
  function play(spec) {
    const el = els.get(spec.id);
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog); dropBail(); drop(path);
      busy = false;
      spec.onDone && spec.onDone();
    };
    let watchdog = 0;
    let dropBail = () => {};
    let path = null, len = 0;
    if (!el || spec.reduce) { done(); return; }
    busy = true;
    watchdog = setTimeout(done, spec.dur + 900);
    /* and if the tab is hidden away mid-move, stop waiting on frames that are
       not coming and settle where the move was going */
    const bail = () => { if (document.hidden) done(); };
    document.addEventListener('visibilitychange', bail);
    dropBail = () => document.removeEventListener('visibilitychange', bail);
    const lift = el.querySelector('.piece-lift');
    const route = spec.route;
    const G = window.MG;
    if (route.d) {
      try { path = measure(route.d); len = path.getTotalLength(); } catch (e) { drop(path); path = null; len = 0; }
      if (!len) { drop(path); path = null; }
    }

    const from = spec.from, to = spec.to;
    /* offsets keep multi-piece stacking exact at both ends */
    let o0 = { x: 0, y: 0 }, o1 = { x: 0, y: 0 };
    if (path) {
      const a = path.getPointAtLength(0), b = path.getPointAtLength(len);
      o0 = { x: from.x - a.x, y: from.y - a.y }; o1 = { x: to.x - b.x, y: to.y - b.y };
    }

    const dur = spec.dur;
    const t0 = performance.now();
    const tunnel = route.kind === 'tunnel';
    const flight = route.kind === 'flight';
    const snap = route.kind === 'snap';
    const carry = route.kind === 'carry';

    /* the burrow run: dive, tunnel, erupt */
    const DIVE = 0.16, RISE = 0.82;
    let firedIn = false, firedOut = false;
    if (tunnel && digger) digger.style.color = spec.color;

    function frame(now) {
      try {
        const raw = clamp01((now - t0) / dur);
        let x, y, e, ang = 0;
        if (path) {
          /* underground travel is steady; everything else eases */
          e = tunnel ? clamp01((raw - DIVE) / (RISE - DIVE)) : easeInOut(raw);
          const p = path.getPointAtLength(e * len);
          x = p.x; y = p.y;
          if (tunnel) {
            const q = path.getPointAtLength(Math.min(len, e * len + 8));
            ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
          }
        } else {
          e = easeInOut(raw);
          x = from.x + (to.x - from.x) * e; y = from.y + (to.y - from.y) * e;
        }
        const blend = tunnel ? clamp01((raw - DIVE) / (RISE - DIVE)) : e;
        x += o0.x + (o1.x - o0.x) * blend;
        y += o0.y + (o1.y - o0.y) * blend;

        let s = 1, op = 1, ly = 0, rot = 0;
        if (tunnel) {
          if (raw < DIVE) {
            const k = raw / DIVE;
            s = 1 - 0.78 * k; op = 1 - k * 1.1; ly = 14 * k;
            if (!firedIn && k > 0.45) { firedIn = true; soil(from.x, from.y, spec.color); }
          } else if (raw < RISE) {
            s = 0.22; op = 0;
          } else {
            const k = clamp01((raw - RISE) / (1 - RISE));
            s = 0.22 + 0.78 * backOut(k);
            op = clamp01(k * 2);
            ly = 14 - 46 * Math.sin(Math.PI * k);
            if (!firedOut && k > 0.02) { firedOut = true; soil(to.x, to.y, spec.color); }
          }
          if (digger) {
            /* a little bob, as if it is shouldering through the soil */
            const bob = Math.sin(raw * 34) * 2.4;
            digger.style.transform = `translate(${x}px,${(y + bob).toFixed(2)}px) rotate(${ang.toFixed(1)}deg)`;
            digger.style.opacity = raw > DIVE * 0.55 && raw < RISE + 0.04 ? '1' : '0';
          }
        } else if (flight) {
          const lofted = Math.sin(Math.PI * e);
          s = 1 + 0.24 * lofted;
          ly = -34 * lofted;
        } else if (carry) {
          /* She has it, and she is taking it home. The arc is in the path, so
             all this does is hold it at full size as it leaves the board and
             let it settle down to its resting size as it goes in the cage —
             one even movement, no spin and no snatch. */
          const k = spec.shrink || 1;
          s = 1 + (k - 1) * easeOut(e);
          ly = -5 * Math.sin(Math.PI * e);
        } else if (snap) {
          const lofted = Math.sin(Math.PI * e);
          ly = -104 * lofted; s = 1 + 0.12 * lofted; rot = 360 * e;
        } else if (route.kind === 'climb') {
          const lofted = Math.sin(Math.PI * e);
          s = 1 + 0.10 * lofted; ly = -22 * lofted;
        } else if (route.kind === 'scamper') {
          /* three quick bounds along its own printed tracks */
          const bound = Math.abs(Math.sin(Math.PI * e * 3));
          ly = -15 * bound; s = 1 + 0.06 * bound;
        } else {
          ly = -9 * Math.sin(Math.PI * e);
        }

        el.style.transform = `translate(${x}px,${y}px)`;
        if (lift) {
          lift.style.transform = `translateY(${ly}px) scale(${s})` + (rot ? ` rotate(${rot}deg)` : '');
          lift.style.opacity = op;
        }

        if (raw < 1) { requestAnimationFrame(frame); return; }
      } catch (err) { /* fall through and settle */ }
      el.style.transform = `translate(${to.x}px,${to.y}px)`;
      if (lift) { lift.style.transform = ''; lift.style.opacity = ''; }
      if (digger) digger.style.opacity = '0';
      done();
    }
    requestAnimationFrame(frame);
  }

  /* a quick squash on the cat when she lands a catch */
  function pounce(id) {
    const el = els.get(id); if (!el) return;
    const lift = el.querySelector('.piece-lift'); if (!lift) return;
    lift.classList.remove('is-pounce');
    void lift.getBoundingClientRect();
    lift.classList.add('is-pounce');
    setTimeout(() => lift && lift.classList.remove('is-pounce'), 460);
  }

  return { register, place, setDigger, setBurst, play, pounce, soil, get busy() { return busy; } };
})();

/* ---------------- pieces ---------------- */
/* A critter you can move is a button: tap it and it takes one step. One in
   the red zone wears a warning ring; one that cannot move (its next step is
   onto the cat) is dimmed rather than hidden, so the reason is visible. */
/* `k` makes a piece bigger without moving it: on a phone the pieces are drawn
   about a fifth larger, tap area included, scaled about their feet so they
   still stand on their slabs. */
function Piece({ id, x, y, s, sel, safe, caught, tap, warn, stuck, label, k }) {
  const ref = React.useRef(null);
  React.useEffect(() => { Motion.register(id, ref.current); return () => Motion.register(id, null); }, [id]);
  const f = FIG[id];
  const cls = ['piece', 'piece-' + id];
  if (sel) cls.push('is-sel');
  if (safe) cls.push('is-safe');
  if (caught) cls.push('is-caught');
  if (tap) cls.push('is-tap');
  if (warn) cls.push('is-warn');
  if (stuck) cls.push('is-stuck');
  const act = tap ? {
    onClick: tap, role: 'button', tabIndex: 0, 'aria-label': label,
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } },
  } : {};
  return (
    <g ref={ref} className={cls.join(' ')} style={{ transform: `translate(${x}px,${y}px)` }} {...act}>
      <g className="piece-size" transform={k && k !== 1 && !caught ? `scale(${k})` : undefined}>
      {tap ? <circle className="piece-hit" cx="0" cy="-18" r={s < 0.95 ? 34 : 46} /> : null}
      <circle className="piece-warn" cx="0" cy="-16" r={f.w * 0.62 * s} />
      <g className="piece-lift">
        <ellipse className="piece-cast" cx={f.w * 0.13} cy="3" rx={f.w * 0.52} ry={f.w * 0.17} />
        <circle className="piece-sel" cx="0" cy="1" r={f.w * 0.6} />
        <g className="piece-fig" transform={`scale(${s})`}>
          {f.tail ? <path className="fig-tail" d={f.tail} /> : null}
          <path className="fig-body" d={f.body} />
          {f.ear ? <circle className="fig-body" cx={f.ear.cx} cy={f.ear.cy} r={f.ear.r} /> : null}
          {f.beak ? <path className="fig-beak" d={f.beak} /> : null}
          <path className="fig-edge" d={f.edge} />
          {(f.eye || []).map((e, i) => <circle key={i} className="fig-eye" cx={e[0]} cy={e[1]} r="2.4" />)}
          <ellipse className="fig-foot" cx={f.w * 0.06} cy="0" rx={f.w * 0.3} ry="3" />
        </g>
      </g>
      </g>
    </g>
  );
}

/* the travelling mound, shouldering along under the lawn */
function Digger() {
  const ref = React.useRef(null);
  React.useEffect(() => { Motion.setDigger(ref.current); }, []);
  return (
    <g ref={ref} className="digger" style={{ opacity: 0 }}>
      <ellipse className="dig-shadow" cx="0" cy="13" rx="30" ry="7" />
      {/* soil thrown out behind */}
      <g className="dig-spray">
        <circle cx="-26" cy="-2" r="3.4" /><circle cx="-34" cy="4" r="2.6" />
        <circle cx="-30" cy="-9" r="2.2" /><circle cx="-42" cy="0" r="2" />
      </g>
      <path className="dig-mound" d="M-30,11 Q-24,-19 0,-21 Q24,-19 30,11 Z" />
      <path className="dig-cap" d="M-30,11 Q-24,-19 0,-21 Q9,-18 14,9 Z" />
      {/* the critter's back, just breaking the surface */}
      <ellipse className="dig-tip" cx="4" cy="-7" rx="9" ry="7" />
      <circle className="dig-tip" cx="13" cy="-11" r="3.4" />
      {/* crumbs riding on top */}
      <circle className="dig-clod" cx="-8" cy="-12" r="2.6" />
      <circle className="dig-clod" cx="16" cy="-2" r="2.2" />
    </g>
  );
}

/* the eruption of soil at a hole mouth */
function SoilBurst() {
  const ref = React.useRef(null);
  React.useEffect(() => { Motion.setBurst(ref.current); }, []);
  const bits = [
    [0, -34, 4.4], [-22, -24, 3.4], [22, -25, 3.6], [-33, -8, 3],
    [33, -9, 3.2], [-13, -33, 2.6], [14, -32, 2.8], [-40, -20, 2.2], [40, -18, 2.4],
  ];
  return (
    <g ref={ref} className="burst" style={{ opacity: 0 }}>
      <circle className="burst-ring" cx="0" cy="2" r="20" />
      {bits.map((b, i) => (
        <circle key={i} className="burst-bit" cx={b[0]} cy={b[1]} r={b[2]}
          style={{ '--bx': b[0] + 'px', '--by': b[1] + 'px', animationDelay: (i % 3) * 22 + 'ms' }} />
      ))}
    </g>
  );
}

function Pieces({ g, selected, hold, onTap, warn, stuck, label, k }) {
  const pos = layout(g, hold);
  /* farther up the board draws first, so nearer pieces overlap correctly;
     the cat always stands in front of whatever she has cornered */
  const ids = Object.keys(pos).sort((a, b) => {
    if (a === 'cat') return 1;
    if (b === 'cat') return -1;
    return pos[a].y - pos[b].y;
  });
  return (
    <g className="pieces">
      <Digger />
      <SoilBurst />
      {ids.map((id) => (
        <Piece key={id} id={id} x={pos[id].x} y={pos[id].y} s={pos[id].s}
          sel={selected === id} safe={!!g.home[id]} caught={!!pos[id].caught}
          tap={onTap && onTap[id] ? onTap[id] : null}
          warn={!!(warn && warn[id])} stuck={!!(stuck && stuck[id])}
          label={label ? label[id] : undefined} k={k} />
      ))}
    </g>
  );
}

/* ---------------- floating words ----------------
   What the old log used to say in a sentence, said in a word where it
   happened: "Gotcha!" over the cat, "Home!" over the burrow. Each one rises,
   fades and is gone. */
function Floaters({ items }) {
  return (
    <g className="floaters" aria-live="polite">
      {items.map((f) => (
        <g key={f.key} className={'floater floater-' + (f.tone || 'plain')}
          transform={`translate(${f.x} ${f.y})`}>
          <text className="floater-t" textAnchor="middle">{f.text}</text>
        </g>
      ))}
    </g>
  );
}

Object.assign(window, { PG, FIG, Piece, Pieces, Floaters, Digger, SoilBurst, Motion, layout });
