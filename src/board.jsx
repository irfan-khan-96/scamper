/* Scamper — board art.
   Built to read like the physical game: a shallow green tray, a mown lawn,
   pinkish stone slabs with a printed bevel, two cardboard tree panels slotted
   at 90 degrees, the home discs punched out and slotted in, and the cat's basket
   on its patio with a run of stepping stones down to the path. */

function Defs() {
  return (
    <defs>
      <linearGradient id="grassG" x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0%" stopColor="var(--g1)" /><stop offset="52%" stopColor="var(--g2)" /><stop offset="100%" stopColor="var(--g3)" />
      </linearGradient>
      <linearGradient id="wallG" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stopColor="var(--w1)" /><stop offset="100%" stopColor="var(--w2)" />
      </linearGradient>
      <linearGradient id="slabG" x1="0.08" y1="0" x2="0.72" y2="1">
        <stop offset="0%" stopColor="var(--s1)" /><stop offset="48%" stopColor="var(--s2)" /><stop offset="100%" stopColor="var(--s3)" />
      </linearGradient>
      <linearGradient id="dieG" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stopColor="#fdef86" /><stop offset="55%" stopColor="#f3d94a" /><stop offset="100%" stopColor="#e0bb26" />
      </linearGradient>
      <radialGradient id="holeG" cx="50%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#120901" /><stop offset="100%" stopColor="#412a12" />
      </radialGradient>
      <radialGradient id="vignette" cx="42%" cy="36%" r="76%">
        <stop offset="52%" stopColor="#123f08" stopOpacity="0" />
        <stop offset="100%" stopColor="#123f08" stopOpacity="0.26" />
      </radialGradient>
      <radialGradient id="sunG" cx="34%" cy="26%" r="52%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>

      {/* the lawn is mown in bands, like the printed board */}
      <pattern id="mown" width="112" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-14 0 0)">
        <rect width="56" height="8" fill="#ffffff" opacity="0.055" />
      </pattern>

      {/* two panels slotted at 90 degrees: the far one is in shade */}
      <linearGradient id="leafBack" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="var(--c-mid)" /><stop offset="100%" stopColor="var(--c-back)" />
      </linearGradient>
      <linearGradient id="leafFront" x1="0.18" y1="0" x2="0.82" y2="1">
        <stop offset="0%" stopColor="var(--c-lit)" /><stop offset="62%" stopColor="var(--c-front)" /><stop offset="100%" stopColor="var(--c-mid)" />
      </linearGradient>
      <linearGradient id="barkG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b8763c" /><stop offset="38%" stopColor="#96582a" /><stop offset="100%" stopColor="#5f3717" />
      </linearGradient>
      <linearGradient id="plankG" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stopColor="#c9975a" /><stop offset="100%" stopColor="#9a6b36" />
      </linearGradient>
      <linearGradient id="cardG" x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#fffaf0" /><stop offset="100%" stopColor="#ecdcbc" />
      </linearGradient>

      <filter id="shSoft" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0d2c05" floodOpacity="0.34" />
      </filter>
      <filter id="shCard" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0d2c05" floodOpacity="0.4" />
      </filter>
    </defs>
  );
}

/* ---------------- lawn decals ---------------- */
const FLOWERS = [
  [112, 306], [124, 648], [312, 108], [676, 112], [896, 372], [886, 692],
  [404, 902], [710, 894], [768, 272], [268, 756], [752, 744],
  [230, 508], [782, 512], [360, 182], [652, 830], [182, 428],
  [416, 726], [648, 726], [352, 512], [560, 786], [762, 596],
];
const BUGS = [[196, 402], [822, 588], [372, 826]];
const GRASS_TUFTS = [
  [742, 566], [640, 214], [430, 776], [790, 330],
  [700, 748], [520, 792], [206, 700], [330, 690], [786, 452],
];
const PEBBLES = [[676, 636], [604, 792], [790, 462], [214, 566]];
/* The cat has been this way before */
const PAWS = [
  [786, 668, 200], [742, 706, 208], [792, 742, 196],
  [206, 296, 168], [196, 356, 174],
];

function Flower({ x, y, i }) {
  const s = i % 3 === 0 ? 1.15 : i % 3 === 1 ? 0.92 : 0.72;
  const c = i % 4 === 0 ? '#fff6d8' : i % 4 === 1 ? '#ffffff' : i % 4 === 2 ? '#fbe3f0' : '#fff9ea';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity="0.92">
      <circle cx="0" cy="-4" r="2.9" fill={c} /><circle cx="3.8" cy="-1.2" r="2.9" fill={c} />
      <circle cx="2.4" cy="3.2" r="2.9" fill={c} /><circle cx="-2.4" cy="3.2" r="2.9" fill={c} />
      <circle cx="-3.8" cy="-1.2" r="2.9" fill={c} /><circle cx="0" cy="0" r="2" fill="#f2c73c" />
    </g>
  );
}
function Bug({ x, y, i }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${i * 41})`} opacity="0.6">
      <ellipse cx="-4.2" cy="-2" rx="5" ry="3.4" fill="#f6f0ff" transform="rotate(-22)" />
      <ellipse cx="4.2" cy="-2" rx="5" ry="3.4" fill="#e9dcff" transform="rotate(22)" />
      <rect x="-1" y="-3.4" width="2" height="7.6" rx="1" fill="#4a3a24" />
    </g>
  );
}
function Tuft({ x, y, i }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${i % 2 ? 1 : 0.78})`} opacity="0.36"
      fill="none" stroke="#3a7318" strokeWidth="2.6" strokeLinecap="round">
      <path d="M0,0 C-2,-9 -6,-14 -10,-17" /><path d="M0,0 C0,-10 0,-16 1,-20" /><path d="M0,0 C3,-9 7,-13 11,-16" />
    </g>
  );
}
function Pebble({ x, y, i }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${i * 53})`} opacity="0.5">
      <ellipse cx="0" cy="2" rx="9" ry="5" fill="#2f6415" opacity="0.5" />
      <ellipse cx="0" cy="0" rx="9" ry="5.6" fill="#b9a596" />
      <ellipse cx="-2.4" cy="-1.6" rx="4" ry="2.2" fill="#d6c6ba" />
    </g>
  );
}
const PAW_SHAPE = (
  <g fill="#3c7a1c" opacity="0.3">
    <ellipse cx="0" cy="3.4" rx="5.4" ry="4.4" />
    <circle cx="-5" cy="-3.2" r="2.2" /><circle cx="-1.2" cy="-5.8" r="2.2" />
    <circle cx="2.9" cy="-5.2" r="2.2" /><circle cx="5.9" cy="-1.8" r="2" />
  </g>
);

/* ---------------- tray + lawn ---------------- */
const BoardBase = React.memo(function BoardBase() {
  return (
    <g>
      {/* the box the game comes in */}
      <rect x="2" y="2" width="996" height="996" rx="16" fill="var(--tray-dark)" />
      <rect x="9" y="9" width="982" height="982" rx="13" fill="url(#wallG)" />
      <rect x="9" y="9" width="982" height="982" rx="13" fill="none" stroke="var(--tray-hi)" strokeOpacity="0.5" strokeWidth="2.5" />
      {/* inner lip, casting into the well */}
      <rect x="52" y="52" width="896" height="896" rx="8" fill="var(--tray-lip)" />
      <rect x="52" y="52" width="896" height="896" rx="8" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="3" />
      {/* the printed lawn */}
      <rect x="64" y="64" width="872" height="872" rx="5" fill="url(#grassG)" />
      <rect x="64" y="64" width="872" height="872" rx="5" fill="url(#mown)" />
      <rect x="64" y="64" width="872" height="872" rx="5" fill="url(#sunG)" />
      <rect x="64" y="64" width="872" height="872" rx="5" fill="url(#vignette)" />
      <rect x="64" y="64" width="872" height="872" rx="5" fill="none" stroke="#ffffff" strokeOpacity="0.13" strokeWidth="2" />
      <g>{PAWS.map((p, i) => (
        <g key={'p' + i} transform={`translate(${p[0]} ${p[1]}) rotate(${p[2]})`}>{PAW_SHAPE}</g>
      ))}</g>
      <g>{GRASS_TUFTS.map((t, i) => <Tuft key={i} x={t[0]} y={t[1]} i={i} />)}</g>
      <g>{PEBBLES.map((p, i) => <Pebble key={i} x={p[0]} y={p[1]} i={i} />)}</g>
      <g>{FLOWERS.map((f, i) => <Flower key={i} x={f[0]} y={f[1]} i={i} />)}</g>
      <g>{BUGS.map((b, i) => <Bug key={i} x={b[0]} y={b[1]} i={i} />)}</g>
    </g>
  );
});

/* ---------------- which way round ----------------
   One-way traffic is a rule you have to be able to see, so the lawn carries
   little chevrons just inside the path. */
const FlowArrows = React.memo(function FlowArrows() {
  const G = window.MG;
  const marks = [];
  for (let i = 0; i < G.LAST; i += 2) {
    const p = G.nodePos(i), q = G.nodePos(i + 1);
    const a = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    /* halfway between the two slabs, nudged in off the path */
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    const dx = 500 - mx, dy = 500 - my, len = Math.hypot(dx, dy) || 1;
    marks.push({ x: mx + (dx / len) * 58, y: my + (dy / len) * 58, a });
  }
  return (
    <g className="flow">
      {marks.map((m, i) => (
        <g key={i} transform={`translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.a.toFixed(1)})`}>
          <path d="M-7,-8 L4,0 L-7,8" fill="none" stroke="#2c5f14" strokeOpacity="0.3"
            strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
});

/* ---------------- printed routes ----------------
   The board prints each animal's own tracks across the lawn, running corner to
   corner between two slabs painted in that animal's colour. Those are the
   shortcuts; the last hop onto a home is drawn separately below. */
const TRACK = {
  /* a mouse leaves little paired scuffs, barely more than dashes */
  mouse: (
    <g>
      <ellipse cx="-3.2" cy="-3.2" rx="3.2" ry="1.9" transform="rotate(-22)" />
      <ellipse cx="3.0" cy="2.4" rx="3.2" ry="1.9" transform="rotate(-22)" />
    </g>
  ),
  /* a squirrel leaves a proper little hand: pad and four toes */
  squirrel: (
    <g>
      <ellipse cx="2.2" cy="0" rx="3.9" ry="3.2" />
      <circle cx="-3.0" cy="-4.6" r="1.7" /><circle cx="-4.6" cy="-1.1" r="1.7" />
      <circle cx="-3.6" cy="2.7" r="1.7" /><circle cx="-0.6" cy="5.0" r="1.6" />
    </g>
  ),
  /* a bird leaves three forward toes and one back — the little arrow print */
  bird: (
    <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
      <path d="M0,-6.5 L0,4.5 M0,4.5 L-5.4,10.5 M0,4.5 L5.4,10.5 M0,4.5 L0,11.5" />
    </g>
  ),
};

/* The three corner cuts, exactly as the board prints them: each animal's own
   tracks running across the bare corner between the two yellow slabs that carry
   its picture. No burrows, no tunnels — they are all surface runs. */
const TrailLayer = React.memo(function TrailLayer({ show }) {
  const G = window.MG;
  return (
    <g className="trails" style={{ opacity: show ? 1 : 0.24 }}>
      {G.SHORTCUTS.map((r) => {
        const n = 11;
        const marks = [];
        for (let i = 0; i < n; i++) marks.push(r.at(0.1 + (0.8 * i) / (n - 1)));
        return (
          <g key={r.owner} className={'track-run run-' + r.owner}>
            {/* the grass is worn a shade thin where they always run */}
            <path d={r.d} fill="none" stroke="#9ac455" strokeOpacity="0.22" strokeWidth="46" strokeLinecap="round" />
            {marks.map((m, i) => (
              <g key={i} className={'track track-' + r.owner}
                transform={`translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${(m.a + 90).toFixed(1)}) `
                  + `translate(${i % 2 ? 10 : -10} 0) rotate(${i % 2 ? 8 : -8}) scale(${i % 2 ? 2.05 : 2.25})`}>
                {TRACK[r.owner]}
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
});

/* the last hop off the path and onto a home */
const HomeRunLayer = React.memo(function HomeRunLayer({ show, kinds, cls }) {
  const G = window.MG;
  const rs = G.TRAILS.filter((r) => kinds.indexOf(r.kind) >= 0);
  return (
    <g className={cls} style={{ opacity: show ? 1 : 0 }}>
      {rs.map((r, i) => {
        const c = G.META[r.owner].color;
        if (r.kind === 'tunnel') {
          /* the one real hole on the board: soil showing faintly under the grass */
          return (
            <g key={i}>
              <path d={r.d} fill="none" stroke="#5b431f" strokeOpacity="0.16" strokeWidth="19" strokeLinecap="round" />
              <path d={r.d} fill="none" stroke="#33240f" strokeOpacity="0.24" strokeWidth="5"
                strokeLinecap="round" strokeDasharray="13 14" />
            </g>
          );
        }
        return (
          <g key={i}>
            <path d={r.d} fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="7" strokeLinecap="round" />
            <path d={r.d} fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round"
              strokeDasharray={r.kind === 'flight' ? '0.5 15' : '3 13'} opacity="0.5" />
          </g>
        );
      })}
    </g>
  );
});

/* dirt mound with an open mouth, at each tunnel end on the track */
function Mound({ x, y, a, s }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a || 0}) scale(${s || 1})`}>
      <ellipse cx="0" cy="6" rx="36" ry="14" fill="#5f4220" opacity="0.5" />
      <path d="M-30,8 Q-25,-17 0,-19 Q25,-17 30,8 Z" fill="#8a6231" />
      <path d="M-30,8 Q-25,-17 0,-19 Q10,-16 14,6 Z" fill="#a1763b" />
      <path d="M-13,9 Q-13,-9 0,-9 Q13,-9 13,9 Z" fill="url(#holeG)" />
      <ellipse cx="0" cy="9" rx="13" ry="3.4" fill="#120a02" />
      <circle cx="-22" cy="-2" r="2.5" fill="#ad8144" /><circle cx="20" cy="-4" r="2.1" fill="#ad8144" />
    </g>
  );
}
const MoundLayer = React.memo(function MoundLayer() {
  return <g className="mounds" />;      /* the only hole on this board is the burrow */
});

/* ---------------- the cat's veranda and her horseshoe of stepping stones ----------------
   The board leaves its four corners as bare grass. Three of them are where the
   animals' tracks cut across; the fourth is the cat's — a raised wooden veranda with
   a white rail, her basket on it, and a horseshoe of flagstones curving out into
   the lawn and back to the path. */
const FLAG = 'M-34,-27 C-40,-27 -41,-21 -40,-14 C-39,-3 -41,7 -37,17 C-34,26 -19,25 -4,26 '
  + 'C11,27 27,28 33,23 C38,17 36,7 36,-5 C36,-16 37,-23 30,-26 C21,-29 9,-27 -6,-28 '
  + 'C-17,-28 -26,-27 -34,-27 Z';

/* one upright of the fence: a post with a rounded cap, seen from above */
function Post({ x, y, r }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="2.5" r={r} fill="#8f8577" opacity="0.45" />
      <circle cx="0" cy="0" r={r} fill="#f6f2e8" />
      <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.42} fill="#fffdf6" />
    </g>
  );
}
/* a run of fence between two points: top rail, lower rail, pickets between */
function Rail({ x1, y1, x2, y2, n }) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;          // along
  const nx = -uy, ny = ux;                     // across, for the second rail
  const off = (k) => `M${x1 + nx * k},${y1 + ny * k} L${x2 + nx * k},${y2 + ny * k}`;
  const pick = [];
  for (let i = 1; i < n; i++) {
    const t = i / n, px = x1 + dx * t, py = y1 + dy * t;
    pick.push(`M${(px - nx * 5).toFixed(1)},${(py - ny * 5).toFixed(1)} L${(px + nx * 5).toFixed(1)},${(py + ny * 5).toFixed(1)}`);
  }
  return (
    <g fill="none" strokeLinecap="round">
      <path d={off(3)} stroke="#8f8577" strokeOpacity="0.4" strokeWidth="7" />
      <path d={pick.join(' ')} stroke="#efe9dc" strokeWidth="3.4" />
      <path d={off(-4.5)} stroke="#f6f2e8" strokeWidth="4" />
      <path d={off(4.5)} stroke="#e6dfcd" strokeWidth="4" />
    </g>
  );
}
const Fence = React.memo(function Fence() {
  /* Local to the veranda, whose decking runs x -86..92, y -84..76. The gateway
     takes the whole bottom-left end of the rail, straight above the first
     flagstone, and the gate itself stands open — swung back in over the boards,
     because there is no room to swing it out into the corner. */
  const GATE = -22;                       // the hinge post; everything left of it is the way out
  return (
    <g className="fence">
      <Rail x1={92} y1={-84} x2={92} y2={76} n={5} />
      <Rail x1={GATE} y1={76} x2={92} y2={76} n={4} />
      {/* the gate, swung back along the boards and plainly not in the way */}
      <g transform={`translate(${GATE} 76) rotate(197)`}>
        <path d="M2,4 L62,4" stroke="#6b5535" strokeOpacity="0.3" strokeWidth="8" strokeLinecap="round" />
        <path d="M0,-5 L60,-5 M0,5 L60,5" stroke="#f8f4ea" strokeWidth="4.2" strokeLinecap="round" fill="none" />
        <path d="M14,-6 L14,6 M30,-6 L30,6 M46,-6 L46,6" stroke="#eae3d3" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M2,5 L58,-5" stroke="#eae3d3" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.8" />
        <Post x={60} y={0} r={5.5} />
      </g>
      {/* posts: the hinge, the two corners, and the free end of the run */}
      <Post x={GATE} y={76} r={9} />
      <Post x={92} y={76} r={8} />
      <Post x={92} y={-84} r={7.5} />
      {/* the gap in the boards where the gate sits, so the way out reads even
          with the gate swung back */}
      <path d={`M-86,80 L${GATE - 10},80`} stroke="#7c5228" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
});

const CatRun = React.memo(function CatRun() {
  const G = window.MG;
  const bed = G.nodePos(G.BED);
  return (
    <g className="cat-run">
      {/* the long trot back from the last square to her basket: she has run out
          of path, so she goes home and starts the round again */}
      <path className="cat-loop" d={G.HOMEWARD.d} fill="none" stroke="#4a3a1e" strokeOpacity="0.10"
        strokeWidth="15" strokeLinecap="round" strokeDasharray="3 26" />
      {/* the worn track she pads along */}
      {G.SPUR.map((s, i) => (
        <path key={'t' + i} d={s.d} fill="none" stroke="#7b5b2c" strokeOpacity="0.16"
          strokeWidth="34" strokeLinecap="round" />
      ))}
      {/* the horseshoe — flagstones, each laid along the curve */}
      {G.SPUR.slice(0, -1).map((s) => {
        const e = s.at(1);
        return (
          <g key={s.to} transform={`translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${e.a.toFixed(1)})`}>
            <path className="flag-cast" d={FLAG} transform="translate(2 8)" />
            <path className="flag-edge" d={FLAG} transform="translate(0 5)" />
            <path className="flag-top" d={FLAG} />
            <path className="flag-rim" d={FLAG} transform="scale(0.86)" />
            <path className="flag-crack" d="M-13,-24 L-2,0 L-9,25" />
          </g>
        );
      })}
      {/* the veranda, sized to the bare corner the path leaves */}
      <g transform={`translate(${bed.x} ${bed.y})`}>
        <rect x="-86" y="-76" width="178" height="160" rx="6" fill="#6b4a24" opacity="0.4" />
        <rect x="-86" y="-84" width="178" height="160" rx="6" fill="url(#plankG)" />
        <path d="M-86,-50 H92 M-86,-18 H92 M-86,14 H92 M-86,46 H92" stroke="#7c5228" strokeOpacity="0.5" strokeWidth="2.2" />
        <path d="M-30,-84 V-50 M34,-18 V14 M6,-50 V-18 M-50,14 V46" stroke="#7c5228" strokeOpacity="0.3" strokeWidth="1.6" />
        <rect x="-86" y="-84" width="178" height="160" rx="6" fill="none" stroke="#8a5c2c" strokeWidth="2.6" />
        {/* The patio fence: a proper rail-and-picket run along the two open
            sides, with a gate at the bottom-left standing open onto the
            flagstones. That gap is the only way off the decking, so it wants to
            read as a gate rather than a hole in the fence. */}
        <Fence />
        {/* Her basket, full of kibble, set down the decking a little: the cage
            has the back of the veranda and she sleeps in front of it. */}
        <g transform="translate(0 16)">
        <ellipse cx="-2" cy="4" rx="46" ry="32" fill="#7d2617" />
        <ellipse cx="-2" cy="-2" rx="46" ry="32" fill="#c4462c" />
        <ellipse cx="-2" cy="-2" rx="46" ry="32" fill="none" stroke="#e07a4a" strokeWidth="2.2" strokeOpacity="0.5" />
        <ellipse cx="-2" cy="1" rx="34" ry="22" fill="#7a2a17" />
        <ellipse cx="-2" cy="0" rx="33" ry="21" fill="#8f3a21" />
        <g fill="#5e2411" opacity="0.75">
          <ellipse cx="-18" cy="-5" rx="4" ry="2.8" /><ellipse cx="-1" cy="6" rx="4" ry="2.8" />
          <ellipse cx="14" cy="-7" rx="3.6" ry="2.6" /><ellipse cx="6" cy="-11" rx="3.2" ry="2.2" />
        </g>
        <circle cx="18" cy="-8" r="5.5" fill="#f2c73c" />
        </g>
      </g>
    </g>
  );
});


/* her red zone, where it falls on her own flagstones — on the way out of the
   basket she is no danger to anyone yet, but this is where a player first
   learns what red means */
function FlagThreat({ threat }) {
  const G = window.MG;
  const flags = (threat || []).filter((n) => n >= G.FLAG0 && n < G.FLAG0 + G.FLAGS);
  if (!flags.length) return null;
  return (
    <g className="flag-threats">
      {flags.map((n) => {
        const e = G.SPUR[n - G.FLAG0].at(1);
        return (
          <g key={n} transform={`translate(${e.x.toFixed(1)} ${e.y.toFixed(1)}) rotate(${e.a.toFixed(1)})`}>
            <path className="threat-fill" d={FLAG} />
            <path className="threat-rim" d={FLAG} transform="scale(0.92)" />
          </g>
        );
      })}
    </g>
  );
}

/* ---------------- the cage ----------------
   Along the back rail of the veranda, behind the basket: a wire crate with a
   straw tray and a latched door. Whatever she catches is carried in here and
   shut in, which is why it is drawn as somewhere a critter cannot get out of
   rather than as another dish of hers.

   It comes in two layers. The crate itself goes down before the pieces, and
   the bars go on top of them, so a caught critter is plainly behind the wire
   instead of sitting in front of it. */
function cageBox() {
  const C = window.MG.CAGE;
  return { C, x: -C.w / 2, y: -C.h / 2 };
}
const BAR0 = 10, BARN = 11;               // first bar in from the frame, and how many

const CatCage = React.memo(function CatCage() {
  const { C, x, y } = cageBox();
  return (
    <g className="cat-cage" transform={`translate(${C.x} ${C.y})`}>
      <rect x={x + 3} y={y + 8} width={C.w} height={C.h} rx="8" fill="#4a3a1e" opacity="0.26" />
      {/* the crate, in the same stained wood as the decking it stands on */}
      <rect x={x} y={y} width={C.w} height={C.h} rx="8" fill="#8a5c2c" />
      <rect x={x + 4} y={y + 4} width={C.w - 8} height={C.h - 8} rx="5" fill="#574837" />
      {/* the back wall, catching a little light at the top */}
      <rect x={x + 4} y={y + 4} width={C.w - 8} height={C.h * 0.44} rx="5" fill="#6b5942" />
      {/* the straw on the tray, which is what they are standing on */}
      <rect x={x + 4} y={y + C.h - 19} width={C.w - 8} height="15" rx="3" fill="#b99a5e" />
      <path d={`M${x + 12},${y + C.h - 13} h14 M${x + 34},${y + C.h - 9} h18 M${x + 60},${y + C.h - 14} h15
                M${x + 84},${y + C.h - 9} h16 M${x + 110},${y + C.h - 13} h13`}
        stroke="#d8bd84" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.8" />
    </g>
  );
});

/* the wire, drawn over whatever is inside */
const CageBars = React.memo(function CageBars() {
  const { C, x, y } = cageBox();
  const gap = (C.w - BAR0 * 2) / (BARN - 1);
  const bars = [];
  for (let i = 0; i < BARN; i++) {
    const bx = +(x + BAR0 + i * gap).toFixed(1);
    bars.push(`M${bx},${y + 7} L${bx},${y + C.h - 7}`);
  }
  const door = +(x + BAR0 + gap * 7).toFixed(1);   // the door takes the right-hand end
  return (
    <g className="cage-bars" transform={`translate(${C.x} ${C.y})`} fill="none" strokeLinecap="round">
      <path d={bars.join(' ')} stroke="#2a2218" strokeOpacity="0.5" strokeWidth="4.4" transform="translate(1 2)" />
      <path d={bars.join(' ')} stroke="#e8e2d4" strokeWidth="3" />
      {/* the two cross wires */}
      <path d={`M${x + 7},${y + 13} H${x + C.w - 7} M${x + 7},${y + C.h - 6} H${x + C.w - 7}`}
        stroke="#e8e2d4" strokeWidth="3" />
      {/* the door, and the latch that keeps it shut */}
      <rect x={door} y={y + 6} width={x + C.w - 6 - door} height={C.h - 12} rx="4"
        stroke="#f4efe2" strokeWidth="3.4" />
      <g transform={`translate(${door - 1} ${y + C.h / 2})`}>
        <path d="M-7,0 h14" stroke="#cbb27c" strokeWidth="5" />
        <circle cx="0" cy="0" r="4.6" fill="#e8c65a" stroke="#a98a33" strokeWidth="1.6" />
      </g>
      {/* the frame last, so the bars run into it */}
      <rect x={x} y={y} width={C.w} height={C.h} rx="8" stroke="#8a5c2c" strokeWidth="5" />
      <rect x={x + 2.5} y={y + 2.5} width={C.w - 5} height={C.h - 5} rx="6" stroke="#b07c3c"
        strokeWidth="2" strokeOpacity="0.7" />
    </g>
  );
});

/* ---------------- the tree ----------------
   Two identical die-cut panels with a slot each, pushed together so they cross
   at 90 degrees. From this angle the near panel reads face-on and the far one
   is foreshortened — same silhouette, squeezed narrow and pushed right, in
   shade. Each crown is a union of lobes, so it stays a clean cut-out edge. */
const LOBES = [
  [556, 300, 72], [474, 332, 66], [638, 332, 66],
  [438, 400, 64], [674, 400, 64], [496, 456, 60],
  [616, 456, 60], [556, 392, 78],
];
const BACK_T = 'translate(646 362) scale(0.62 0.94) translate(-556 -380)';

const APPLES_F = [[500, 330], [608, 312], [462, 392], [648, 396], [556, 440],
  [430, 368], [676, 364], [556, 268], [514, 478], [604, 472]];
const APPLES_B = [[648, 316], [672, 392], [612, 452]];

function Crown({ id, fill, lit }) {
  return (
    <g>
      <clipPath id={id}>
        {LOBES.map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r={c[2]} />)}
      </clipPath>
      {/* a slightly fatter copy behind, standing in for the cut edge */}
      {LOBES.map((c, i) => <circle key={'o' + i} cx={c[0]} cy={c[1]} r={c[2] + 3.5} fill="#255310" opacity="0.5" />)}
      <g clipPath={`url(#${id})`}>
        <rect x="360" y="215" width="400" height="320" fill={fill} />
        {lit ? (
          <g>
            <circle cx="482" cy="306" r="66" fill="var(--c-lit)" opacity="0.34" />
            <circle cx="434" cy="384" r="46" fill="var(--c-lit)" opacity="0.22" />
            <circle cx="552" cy="278" r="44" fill="var(--c-lit)" opacity="0.2" />
            <path d="M420,352 C462,380 514,386 556,368" fill="none" stroke="#255310" strokeOpacity="0.13" strokeWidth="6" strokeLinecap="round" />
            <path d="M578,368 C620,386 668,380 700,356" fill="none" stroke="#255310" strokeOpacity="0.15" strokeWidth="6" strokeLinecap="round" />
            <path d="M432,442 C470,466 512,472 550,456" fill="none" stroke="#255310" strokeOpacity="0.12" strokeWidth="6" strokeLinecap="round" />
            <path d="M580,456 C618,472 660,466 692,444" fill="none" stroke="#255310" strokeOpacity="0.15" strokeWidth="6" strokeLinecap="round" />
            {/* the half that turns away toward the far panel */}
            <rect x="556" y="215" width="220" height="320" fill="#1e4a0c" opacity="0.13" />
          </g>
        ) : null}
      </g>
    </g>
  );
}
function Apple({ x, y, s }) {
  const r = 11 * (s || 1);
  return (
    <g>
      <circle cx={x} cy={y + 1.5} r={r} fill="#571610" opacity="0.32" />
      <circle cx={x} cy={y} r={r} fill="#cf3226" />
      <circle cx={x - r * 0.32} cy={y - r * 0.34} r={r * 0.32} fill="#ff8a78" opacity="0.85" />
      <path d={`M${x},${y - r * 0.96} q${r * 0.17},-${r * 0.5} ${r * 0.58},-${r * 0.67}`}
        fill="none" stroke="#4d7a22" strokeWidth={2.2 * (s || 1)} strokeLinecap="round" />
    </g>
  );
}

const BoardTree = React.memo(function BoardTree() {
  /* The whole tree is drawn full size and then set down into the middle of the
     lawn: on the board it is a modest thing that leaves the grass around it
     visible, not a canopy over everything. */
  return (
    <g className="tree" transform="translate(-53 -63) translate(558 665) scale(0.72) translate(-558 -665)">
      {/* the tree's own shadow, thrown to the lower right */}
      <ellipse cx="586" cy="672" rx="150" ry="29" fill="#0f3a06" opacity="0.32" />

      {/* ---- far panel ---- */}
      <g transform={BACK_T}>
        <path d="M530,672 C538,608 546,560 546,494 L572,494 C572,560 580,608 588,672 C572,682 546,682 530,672 Z" fill="#5f3717" />
        <Crown id="crownB" fill="url(#leafBack)" />
        {APPLES_B.map((a, i) => <Apple key={'ab' + i} x={a[0]} y={a[1]} s={0.86} />)}
      </g>

      {/* ---- trunk of the near panel: lit left, shaded right, feet spreading ---- */}
      <path d="M518,662 C528,600 536,552 536,490 L580,490 C580,552 588,600 598,662 C572,674 542,674 518,662 Z" fill="url(#barkG)" />
      <path d="M518,662 C528,600 536,552 536,490 L554,490 C554,552 548,600 545,662 C534,670 524,669 518,662 Z" fill="#bd7c40" opacity="0.7" />
      <path d="M598,656 Q640,666 660,680 Q616,678 594,666 Z" fill="#6d3f1b" />
      <path d="M518,656 Q476,666 456,680 Q500,678 522,666 Z" fill="#96582a" />
      <path d="M558,490 L558,666" stroke="#4a2810" strokeWidth="2.6" strokeOpacity="0.44" fill="none" />
      <path d="M536,524 C534,574 531,616 529,650" stroke="#4a2810" strokeWidth="3" strokeOpacity="0.2" fill="none" strokeLinecap="round" />
      <path d="M580,520 C582,570 585,612 587,646" stroke="#3a1e0c" strokeWidth="2.6" strokeOpacity="0.2" fill="none" strokeLinecap="round" />
      {/* the slit the far panel drops into */}
      <path d="M558,490 L558,532" stroke="#2c1708" strokeWidth="6" strokeOpacity="0.5" fill="none" strokeLinecap="round" />

      {/* ---- near panel ---- */}
      <Crown id="crownF" fill="url(#leafFront)" lit />

      {/* the slot, cut down the middle of the near panel */}
      <path d="M558,232 L558,512" stroke="#1e4a0c" strokeOpacity="0.34" strokeWidth="4" />
      <path d="M554,236 L554,508" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" />

      {APPLES_F.map((a, i) => <Apple key={'af' + i} x={a[0]} y={a[1]} />)}

      {/* the fork the squirrel grabs first, on its way up */}
      <g transform="translate(560 500)">
        <path d="M-32,20 C-16,10 -3,-1 8,-16 M8,-16 C12,-23 17,-28 24,-31 M8,-16 C0,-20 -8,-22 -16,-20"
          fill="none" stroke="#6f4420" strokeWidth="8.5" strokeLinecap="round" />
        <path d="M-32,20 C-16,10 -3,-1 8,-16" fill="none" stroke="#9c6a3e" strokeWidth="3.4" strokeLinecap="round" opacity="0.8" />
        <circle cx="-20" cy="-8" r="6" fill="#4f8f24" /><circle cx="-9" cy="-17" r="5" fill="#5fa32c" />
        <circle cx="17" cy="-22" r="5" fill="#4f8f24" />
      </g>
    </g>
  );
});

/* ---------------- the three homes ---------------- */
/* the mouse's hole sits at the foot of the trunk, so it draws over the tree */
const GroundHome = React.memo(function GroundHome() {
  const G = window.MG;
  const p = G.nodePos(G.H_MOUSE);
  return (
    <g className="homes">
      <g transform={`translate(${p.x} ${p.y}) scale(0.74)`}>
        <ellipse cx="4" cy="20" rx="58" ry="21" fill="#4a330f" opacity="0.44" />
        <path d="M-48,18 Q-38,-24 0,-29 Q38,-24 48,18 Z" fill="#8a6231" />
        <path d="M-48,18 Q-38,-24 0,-29 Q14,-25 22,14 Z" fill="#a1763b" />
        <path d="M-22,19 Q-22,-14 0,-14 Q22,-14 22,19 Z" fill="url(#holeG)" />
        <ellipse cx="0" cy="19" rx="22" ry="5.4" fill="#110902" />
        <circle cx="-35" cy="-4" r="3.4" fill="#ad8144" /><circle cx="32" cy="-8" r="2.9" fill="#ad8144" />
        <circle cx="-25" cy="9" r="2.3" fill="#ad8144" opacity="0.8" />
        {/* a couple of roots framing the mouth */}
        <path d="M-46,6 Q-30,-6 -24,-12" fill="none" stroke="#6d4620" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <path d="M46,4 Q32,-8 25,-13" fill="none" stroke="#6d4620" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <circle cx="0" cy="-2" r="52" fill="none" stroke={G.META.mouse.color} strokeWidth="3" opacity="0.4" />
        <circle className="home-halo" cx="0" cy="0" r="48" style={{ color: 'var(--mouse)' }} />
      </g>
    </g>
  );
});

/* a small tab, so each disc reads as card slotted into a slit */
function DiscTab({ y }) {
  return <path d={`M-9,${y} L9,${y} L7,${y + 17} L-7,${y + 17} Z`} fill="#a8874e" opacity="0.9" />;
}

const TreeHomes = React.memo(function TreeHomes() {
  const G = window.MG;
  const sq = G.nodePos(G.H_SQ), bd = G.nodePos(G.H_BIRD);
  return (
    <g className="homes">
      {/* squirrel's branch disc, slotted high on the near panel */}
      <g transform={`translate(${sq.x} ${sq.y}) scale(0.8)`} filter="url(#shSoft)">
        <DiscTab y={32} />
        <circle cx="0" cy="0" r="44" fill="#e0c48f" />
        <circle cx="0" cy="0" r="44" fill="none" stroke="#a8874e" strokeWidth="3" />
        <circle cx="0" cy="0" r="39" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.6" />
        <path d="M-32,17 C-17,6 -4,-4 6,-19 M6,-19 C10,-27 13,-31 19,-34 M6,-19 C-2,-23 -9,-25 -17,-23 M-4,-4 C4,-2 13,-4 21,-10"
          fill="none" stroke="#8a4a24" strokeWidth="7" strokeLinecap="round" />
        <path d="M-32,17 C-17,6 -4,-4 6,-19" fill="none" stroke="#a9663a" strokeWidth="2.8" strokeLinecap="round" opacity="0.7" />
        <circle cx="17" cy="-27" r="6.5" fill="#cf3226" />
        <circle cx="-13" cy="-21" r="5.2" fill="#cf3226" />
        <circle cx="19" cy="-10" r="4.8" fill="#cf3226" />
        <circle cx="0" cy="0" r="44" fill="none" stroke={G.META.squirrel.color} strokeWidth="3" opacity="0.4" />
        <circle className="home-halo" cx="0" cy="0" r="49" style={{ color: 'var(--squirrel)' }} />
      </g>
      {/* bird's nest disc, slotted on the right */}
      <g transform={`translate(${bd.x} ${bd.y}) scale(0.78)`} filter="url(#shSoft)">
        <DiscTab y={30} />
        <circle cx="0" cy="0" r="42" fill="#8a6a38" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="#6d4e24" strokeWidth="3" />
        <circle cx="0" cy="0" r="37" fill="none" stroke="#a88348" strokeWidth="2" strokeDasharray="9 7" />
        <ellipse cx="0" cy="2" rx="27" ry="21" fill="#5d431c" />
        <path d="M-39,-8 Q-14,4 12,-4 Q29,-10 39,-14" fill="none" stroke="#a88348" strokeWidth="2.6" />
        <path d="M-37,12 Q-10,23 18,13 Q31,8 38,2" fill="none" stroke="#9a7840" strokeWidth="2.4" />
        <ellipse cx="-9" cy="2" rx="10" ry="8" fill="#f4eedb" />
        <ellipse cx="9" cy="5" rx="10" ry="8" fill="#e6dec6" />
        <ellipse cx="-11" cy="-1" rx="3.4" ry="2.6" fill="#fffdf6" />
        <circle cx="0" cy="0" r="42" fill="none" stroke={G.META.bird.color} strokeWidth="3" opacity="0.4" />
        <circle className="home-halo" cx="0" cy="0" r="47" style={{ color: 'var(--bird)' }} />
      </g>
    </g>
  );
});

/* ---------------- the loose bits that sit on the lawn ---------------- */
/* the treats wait on the open grass below the tree, where nothing else is
   printed and none of the animals' tracks run */
const TREAT_SPOTS = [[466, 714], [540, 702], [470, 784], [544, 772]];
function TreatArt({ kind }) {
  if (kind === 0) {           /* a wedge of cheese */
    return (
      <g>
        <path d="M-16,6 L-16,-4 L14,-11 L14,3 Z" fill="#e8b93f" />
        <path d="M-16,-4 L14,-11 L10,-14 L-19,-7 Z" fill="#f5d572" />
        <circle cx="-6" cy="0" r="2.6" fill="#c9982c" /><circle cx="5" cy="-3" r="2.2" fill="#c9982c" />
        <circle cx="-13" cy="2" r="1.6" fill="#c9982c" />
      </g>
    );
  }
  if (kind === 1) {           /* a saucer of milk */
    return (
      <g>
        <ellipse cx="0" cy="4" rx="17" ry="7" fill="#c9ccd2" />
        <ellipse cx="0" cy="1.5" rx="17" ry="7" fill="#eef1f5" />
        <ellipse cx="0" cy="0.5" rx="11" ry="4.4" fill="#fbfdff" />
        <ellipse cx="-3" cy="-0.5" rx="4.4" ry="1.8" fill="#fff" />
      </g>
    );
  }
  if (kind === 2) {           /* catnip */
    return (
      <g fill="#5f9e3a">
        <path d="M-2,11 L-2,-2" stroke="#4a7f2c" strokeWidth="2" />
        <ellipse cx="-9" cy="1" rx="8" ry="5" transform="rotate(-24 -9 1)" />
        <ellipse cx="6" cy="-1" rx="8" ry="5" transform="rotate(20 6 -1)" />
        <ellipse cx="-2" cy="-10" rx="7" ry="5" fill="#71b448" />
        <circle cx="-2" cy="-16" r="3" fill="#b98fd0" />
        <circle cx="-6" cy="-13" r="2.4" fill="#c9a3dc" />
      </g>
    );
  }
  return (                    /* a bowl of kibble */
    <g>
      <ellipse cx="0" cy="4" rx="18" ry="8" fill="#b8452c" />
      <ellipse cx="0" cy="1" rx="18" ry="8" fill="#d9573a" />
      <ellipse cx="0" cy="-0.5" rx="12" ry="5" fill="#6d4a24" />
      <circle cx="-4" cy="-1.4" r="2.1" fill="#8a5f2e" /><circle cx="2" cy="0.6" r="2.1" fill="#8a5f2e" />
      <circle cx="6" cy="-2" r="1.9" fill="#8a5f2e" />
    </g>
  );
}

/* The treat cards on the lawn are the treat button: while one can be spent,
   the next card in the pile is live and a tap on it lays it. */
const BoardTreats = React.memo(function BoardTreats({ left, total, usable, onUse }) {
  const spots = TREAT_SPOTS.slice(0, total);
  return (
    <g className={'board-treats' + (usable ? ' is-usable' : '')}>
      {spots.map((p, i) => (
        <g key={i} className={'bt' + (i < left ? '' : ' is-spent') + (usable && i === left - 1 ? ' is-live' : '')}
          transform={`translate(${p[0]} ${p[1]}) rotate(${(i % 2 ? 7 : -6)})`}
          {...(usable && i === left - 1 ? {
            onClick: onUse, role: 'button', tabIndex: 0, 'aria-label': 'Use a treat',
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUse(); } },
          } : {})}>
          <g filter="url(#shCard)">
            <rect x="-25" y="-25" width="50" height="50" rx="6" fill="url(#cardG)" />
            <rect x="-25" y="-25" width="50" height="50" rx="6" fill="none" stroke="#c3a473" strokeWidth="2" />
            <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#fdf8ec" />
          </g>
          <TreatArt kind={i} />
        </g>
      ))}
    </g>
  );
});

/* the dice, resting on the lawn where they were thrown */
const DIE_SPOTS = [[630, 730], [692, 748]];
const BoardDice = React.memo(function BoardDice({ faces, rolling }) {
  return (
    <g className="board-dice">
      {DIE_SPOTS.map((p, i) => (
        <g key={i} className={'bd' + (rolling ? ' is-rolling' : '')}
          style={{ animationDelay: i * 90 + 'ms' }}
          transform={`translate(${p[0]} ${p[1]}) rotate(${i ? 12 : -9})`}>
          <g filter="url(#shCard)">
            <rect x="-26" y="-26" width="52" height="52" rx="13" fill="#c9a41f" />
            <rect x="-26" y="-27" width="52" height="51" rx="13" fill="url(#dieG)" />
            <rect x="-21" y="-22" width="42" height="17" rx="8" fill="#fff" opacity="0.3" />
          </g>
          <circle cx="0" cy="-1" r="10" fill={faces[i] === 'green' ? '#3d9b4c' : '#211d17'} />
          <circle cx="-3.2" cy="-4.2" r="3" fill="#fff" opacity={faces[i] === 'green' ? 0.4 : 0.26} />
        </g>
      ))}
    </g>
  );
});

/* ---------------- special tile faces ---------------- */
/* the animals' start: a sawn stump, seen slightly from above */
function FaceStump() {
  return (
    <g>
      <ellipse cx="2" cy="24" rx="33" ry="12" fill="#4f3315" opacity="0.42" />
      <path d="M-28,16 C-30,-2 -28,-11 -26,-15 L26,-15 C28,-11 30,-2 28,16 C15,23 -15,23 -28,16 Z" fill="#7d4a24" />
      <path d="M-28,16 C-30,-2 -28,-11 -26,-15 L-4,-15 C-6,-2 -8,7 -8,21 C-19,21 -24,19 -28,16 Z" fill="#96603a" />
      <ellipse cx="0" cy="-15" rx="27" ry="11.5" fill="#c99a5c" />
      <ellipse cx="0" cy="-15" rx="27" ry="11.5" fill="none" stroke="#a87c48" strokeWidth="1.8" />
      <ellipse cx="0" cy="-15" rx="18" ry="7.4" fill="none" stroke="#a87c48" strokeWidth="1.6" opacity="0.75" />
      <ellipse cx="0" cy="-15" rx="9" ry="3.6" fill="none" stroke="#a87c48" strokeWidth="1.4" opacity="0.6" />
      <circle cx="-21" cy="-21" r="6" fill="#59a02c" />
      <circle cx="-13" cy="-26" r="5" fill="#69b436" />
      <circle cx="23" cy="-20" r="5" fill="#59a02c" />
      <path d="M-26,4 C-18,2 -10,3 -4,6" fill="none" stroke="#5f3718" strokeWidth="1.6" strokeOpacity="0.5" />
    </g>
  );
}

/* the last square: the plainest stone on the board, worn smooth and pressed up
   against the roots, with a scuff of earth carried onto it from the tree */
function FaceLast() {
  return (
    <g>
      <path d="M-30,26 C-14,32 14,31 30,24 L30,34 C12,40 -12,40 -30,34 Z" fill="#6f5a3c" opacity="0.55" />
      <g fill="#5d4a30" opacity="0.5">
        <ellipse cx="-14" cy="-16" rx="7" ry="4" transform="rotate(-14 -14 -16)" />
        <ellipse cx="6" cy="-22" rx="5.4" ry="3.2" transform="rotate(9 6 -22)" />
        <ellipse cx="16" cy="-6" rx="4.4" ry="2.6" />
      </g>
      <path d="M-33,4 C-16,-2 12,-3 33,3" fill="none" stroke="#5d4a30" strokeWidth="2.4" strokeOpacity="0.45" />
    </g>
  );
}

const PAW = <g fill="currentColor"><ellipse cx="0" cy="4" rx="6" ry="5" /><circle cx="-5.6" cy="-3.7" r="2.5" /><circle cx="-1.4" cy="-6.6" r="2.5" /><circle cx="3.3" cy="-6" r="2.5" /><circle cx="6.7" cy="-2.2" r="2.3" /></g>;
const GATE = {
  mouse: (
    <g>
      <path d="M-17,11 Q-14,-13 0,-14 Q14,-13 17,11" fill="none" stroke="#8d8378" strokeWidth="3.6" />
      <path d="M-13,11 Q-13,-8 0,-8 Q13,-8 13,11 Z" fill="url(#holeG)" />
      <ellipse cx="0" cy="11" rx="13" ry="3" fill="#140b02" />
      <g transform="translate(0 22) scale(0.78)" style={{ color: '#8d8378' }}>{PAW}</g>
    </g>
  ),
  squirrel: (
    <g style={{ color: '#d1732a' }}>
      <g transform="translate(-10 -13) scale(0.88) rotate(-18)">{PAW}</g>
      <g transform="translate(8 0) scale(0.88) rotate(8)">{PAW}</g>
      <g transform="translate(-6 15) scale(0.78) rotate(-4)">{PAW}</g>
    </g>
  ),
  bird: (
    <g stroke="#3f7fb5" strokeWidth="3.2" strokeLinecap="round" fill="none">
      <g transform="translate(-10 -13)"><path d="M0,-6 L0,6 M0,6 L-6,13 M0,6 L6,13 M0,6 L0,15" /></g>
      <g transform="translate(9 3) rotate(14)"><path d="M0,-6 L0,6 M0,6 L-6,13 M0,6 L6,13 M0,6 L0,15" /></g>
    </g>
  ),
};
const SC_IN = (
  <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-12,-10 L-1,0 L-12,10" /><path d="M2,-10 L13,0 L2,10" />
  </g>
);
const SC_OUT = (
  <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
    <circle cx="0" cy="0" r="12.5" strokeDasharray="5 5" opacity="0.85" />
    <circle cx="0" cy="0" r="4.2" fill="currentColor" stroke="none" opacity="0.9" />
  </g>
);
/* The pictures printed on the yellow slabs. On the board these are little
   painted illustrations, not silhouettes, so they get an ink line and some
   colour in them — that is what makes a marked slab read from across a table. */
const DECAL = {
  mouse: (
    <g>
      <path d="M17,4 C25,3 28,-3 24,-9" fill="none" stroke="#b98a7a" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="1" cy="1" rx="15" ry="9.4" fill="#7f6f61" />
      <ellipse cx="-1" cy="-1.6" rx="13" ry="7.2" fill="#9c8b7c" />
      <circle cx="-12" cy="-2" r="7.6" fill="#8b7a6c" />
      <circle cx="-11.5" cy="-9" r="5.4" fill="#8b7a6c" />
      <circle cx="-11.5" cy="-9" r="3.4" fill="#e8b3ba" />
      <circle cx="-16.5" cy="-3.5" r="1.9" fill="#241a12" />
      <circle cx="-19.6" cy="0.6" r="1.5" fill="#e8b3ba" />
      <g stroke="#6b5c50" strokeWidth="1.7" strokeLinecap="round">
        <path d="M-7,8 L-8,12 M2,9 L1,13 M10,7 L11,11" />
      </g>
    </g>
  ),
  squirrel: (
    <g>
      <path d="M9,6 C22,3 22,-11 12,-15 C17,-8 15,-2 7,2 Z" fill="#c9631f" />
      <path d="M9,6 C19,3 20,-9 13,-13 C15,-7 13,-2 7,2 Z" fill="#e07c33" />
      <ellipse cx="-2" cy="2" rx="11" ry="8.4" fill="#d4712a" />
      <circle cx="-12" cy="-4" r="7" fill="#d4712a" />
      <path d="M-15,-10 C-17,-14 -13,-15 -12,-11 Z" fill="#b85c1c" />
      <ellipse cx="-9" cy="4" rx="6" ry="4.4" fill="#f0dcc2" />
      <circle cx="-15.6" cy="-5.4" r="1.9" fill="#2b1a0d" />
      <circle cx="-18.8" cy="-2.4" r="1.4" fill="#8a4413" />
      <g stroke="#a8531a" strokeWidth="1.8" strokeLinecap="round">
        <path d="M-5,9 L-6,13 M4,8 L4,12" />
      </g>
    </g>
  ),
  bird: (
    <g>
      <path d="M-3,-3 C4,-14 16,-15 21,-9 C13,-9 7,-5 3,1 Z" fill="#2f6d9e" />
      <ellipse cx="-1" cy="1" rx="13" ry="8.6" fill="#3f87c2" />
      <circle cx="-11" cy="-4" r="6.8" fill="#4d97d2" />
      <path d="M-4,3 C4,-3 14,-4 20,-1 C13,4 4,7 -3,6 Z" fill="#2b6390" />
      <path d="M-17.4,-3.6 L-25,-1.2 L-17.4,1.6 Z" fill="#e8a02f" />
      <circle cx="-13" cy="-5.6" r="2" fill="#12212e" />
      <circle cx="-13.7" cy="-6.3" r="0.8" fill="#fff" />
      <g stroke="#e8a02f" strokeWidth="1.9" strokeLinecap="round">
        <path d="M-4,9 L-5,13 M4,9 L5,13" />
      </g>
    </g>
  ),
  acorn: <g opacity="0.66"><path d="M-9,-4 Q0,-13 9,-4 Z" fill="#7d5027" /><rect x="-9" y="-5" width="18" height="4" rx="2" fill="#946029" /><path d="M-8,-1 Q-8,12 0,12 Q8,12 8,-1 Z" fill="#c08b34" /></g>,
  leaf: <g opacity="0.6"><path d="M-9,8 Q-12,-6 0,-11 Q12,-6 9,8 Q0,12 -9,8 Z" fill="#56922b" /><path d="M0,-9 L0,10" stroke="#3a7019" strokeWidth="1.8" /></g>,
};

const SLAB = 'M-30,-45 C-38,-45 -45,-39 -45,-30 C-45,-14 -46,-4 -44,12 C-43,28 -46,38 -37,43 C-28,47 -12,45 4,45 C20,45 34,47 41,41 C47,35 45,22 45,6 C45,-10 47,-28 42,-37 C37,-45 22,-44 6,-45 C-6,-46 -18,-45 -30,-45 Z';
const CRACKS = [
  'M-22,-45 L-12,-14 L-20,20 M-12,-14 L14,-22',
  'M16,-45 L4,-10 L20,26 M4,-10 L-20,-2',
  'M-45,2 L-4,12 L26,-8 M-4,12 L4,45',
  'M2,-45 L-6,2 L14,30 M-6,2 L-30,-8',
  'M-45,-16 L-10,-20 L8,4 L45,-2 M-10,-20 L-4,-45',
  'M24,-45 L10,-4 L-18,8 M10,-4 L34,20',
  'M-6,-45 L2,-12 L-18,16 M2,-12 L30,-20 M2,-12 L16,24',
  'M-30,22 L-6,8 L24,26 M-6,8 L0,-26',
];
const SPECKS = [
  [[-24, -18], [12, -30], [28, 8], [-8, 26], [18, 30]],
  [[20, -24], [-16, -8], [-28, 18], [8, 12], [30, -6]],
  [[-10, -32], [24, -12], [-30, 4], [4, 30], [-18, 14]],
  [[14, -34], [-22, -6], [30, 16], [-6, 18], [10, -4]],
];

function Slab({ i, x, y, rot, scale, kind, tint, paint, glyph, face, open, target, danger, label, onPick, threat, next }) {
  const cls = ['slab'];
  if (kind) cls.push('slab-' + kind);
  if (open) cls.push('is-open');
  if (target) cls.push('is-target');
  if (danger) cls.push('is-danger');
  if (threat) cls.push('is-threat');
  const specks = SPECKS[i % 4];
  return (
    <g className={cls.join(' ')} style={tint ? { '--tint': tint, color: tint } : undefined}
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale || 1})`}
      onClick={open ? () => onPick(i) : undefined}
      onKeyDown={open ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(i); } } : undefined}
      tabIndex={open ? 0 : undefined} role={open ? 'button' : undefined} aria-label={open ? label : undefined}>
      <path className="slab-edge" d={SLAB} transform="translate(0 7)" />
      <path className="slab-top" d={SLAB} />
      {paint ? <path className="slab-paint" d={SLAB} fill={paint} /> : null}
      <clipPath id={'slabClip' + i}><path d={SLAB} /></clipPath>
      <g clipPath={`url(#slabClip${i})`}>
        <path className="slab-crack" d={CRACKS[i % 8]} />
        <g className="slab-specks">
          {specks.map((s, k) => <circle key={k} cx={s[0]} cy={s[1]} r={k % 2 ? 1.6 : 2.4} />)}
        </g>
        <path className="slab-wear" d="M-45,26 C-20,34 16,32 45,22 L45,45 L-45,45 Z" />
        <path className="slab-sheen" d="M-45,-45 L10,-45 L-45,20 Z" />
      </g>
      <path className="slab-rim" d={SLAB} transform="scale(0.9)" />
      {face ? <g className="slab-face">{face}</g> : null}
      {glyph ? <g className="slab-glyph">{glyph}</g> : null}
      {/* the red zone: where the cat will put her paws this turn */}
      {threat ? (
        <g className="slab-threat">
          <path className="threat-fill" d={SLAB} />
          <path className="threat-rim" d={SLAB} transform="scale(0.94)" />
          <g className="threat-paw" transform={`rotate(${-rot}) translate(0 2) scale(1.9)`}>{PAW}</g>
        </g>
      ) : null}
      {/* where a critter goes if you tap it */}
      {next ? (
        <g className="slab-next" style={{ color: next }} transform={`rotate(${-rot})`}>
          <circle r="21" />
          <path d="M-7,-9 L4,0 L-7,9" />
        </g>
      ) : null}
      <path className="slab-ring" d={SLAB} transform="scale(1.07)" />
    </g>
  );
}

function Stones({ highlights, target, danger, onPick, threat, nexts }) {
  const G = window.MG;
  const hl = new Set(highlights || []);
  const red = new Set(threat || []);
  const marks = {};
  marks[G.STUMP] = { kind: 'stump', face: <FaceStump />, paint: '#6fb63a',
    name: 'the tree stump — where the animals start' };
  /* the dark slab tucked in against the tree: the end of the path, and the only
     way any of them gets home */
  marks[G.LAST] = { kind: 'last', paint: '#8a7150', g: <FaceLast />, name: 'the last square' };
  /* Both ends of a corner cut carry that animal's picture on the board's yellow.
     They are the only coloured slabs on the whole board. */
  G.SHORTCUTS.forEach((s) => {
    const m = G.META[s.owner];
    /* the printed animal faces the way it runs, so fold the tangent into the
       upright half-turn and mirror it rather than stand it on its head */
    const lean = (t) => {
      const a = s.at(t).a;
      const flip = Math.abs(a) > 90;
      const tilt = flip ? a - 180 * Math.sign(a) : a;
      return { flip, tilt: Math.max(-30, Math.min(30, tilt)) };
    };
    const pic = (t) => {
      const { flip, tilt } = lean(t);
      return (
        <g className={'tile-pic pic-' + s.owner}
          transform={`rotate(${tilt.toFixed(1)}) scale(${flip ? -1.55 : 1.55} 1.55)`}>
          {DECAL[s.owner]}
        </g>
      );
    };
    marks[s.from] = { kind: 'sc', paint: G.TILE, tint: m.color, g: pic(0), name: `the ${s.name}` };
    marks[s.to] = { kind: 'sc', paint: G.TILE, tint: m.color, g: pic(1), name: `the far end of the ${s.name}` };
  });
  /* a few acorns and leaves scattered over the plain stones, as printed */
  const strew = { 3: 'leaf', 7: 'acorn', 11: 'leaf', 16: 'acorn' };
  Object.keys(strew).forEach((k) => { if (!marks[k]) marks[k] = { kind: 'decal', g: DECAL[strew[k]] }; });
  /* the slabs nearly touch, whatever the lattice pitch is */
  const sc = Math.max(1, Math.min(1.34, G.P / 104));
  return (
    <g className="stones">
      {G.RING.map((p, i) => {
        const m = marks[i];
        return (
          <Slab key={i} i={i} x={p.x} y={p.y} rot={(i * 37) % 9 - 4} scale={sc}
            kind={m ? m.kind : null} tint={m ? m.tint : null} paint={m ? m.paint : null}
            glyph={m ? m.g : null} face={m ? m.face : null}
            label={'Move to ' + (m && m.name ? m.name : 'stone ' + (i + 1))}
            open={hl.has(i)} target={target === i} danger={hl.has(i) && danger === i}
            threat={red.has(i)} next={nexts ? nexts[i] : null}
            onPick={onPick} />
        );
      })}
    </g>
  );
}

/* the step off the last square goes to a home, which is not a slab, so it
   gets its own marker */
function NextPads({ nexts }) {
  const G = window.MG;
  return (
    <g className="pads">
      {[G.H_MOUSE, G.H_SQ, G.H_BIRD].map((n) => {
        if (!nexts || !nexts[n]) return null;
        const p = G.nodePos(n);
        return (
          <g key={n} className="pad pad-next" style={{ color: nexts[n] }} transform={`translate(${p.x} ${p.y})`}>
            <circle className="pad-ring" r="46" />
          </g>
        );
      })}
    </g>
  );
}

Object.assign(window, {
  Defs, BoardBase, FlowArrows, TrailLayer, HomeRunLayer, MoundLayer, CatRun,
  BoardTree, GroundHome, TreeHomes, Stones, NextPads, Mound, BoardTreats, BoardDice,
  CatCage, CageBars, FlagThreat,
});
