/* Scamper — app shell.

   One player, three critters, one cat who moves herself. Each turn the dice
   are already down and her sweep is drawn in red; you tap critters to step
   them out of it (or throw her a treat), and then she goes.

   Three games can be on the go, each kept in its own slot so none of them
   overwrites another: today's daily (one attempt — it resumes, never restarts),
   a practice garden, and a friend's challenge opened from a link. */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const G = window.MG, R = window.MR, S = window.Sound, D = window.MD, AI = window.MAI;
const NAMES = G.NAMES;

const SET_DEFAULTS = { v: 3, sound: true, calm: false, theme: 'meadow', stats: true, buzz: true };
const THEMES = ['meadow', 'dusk', 'autumn'];
/* "Reduce motion" is the player's own switch, off unless they turn it on.

   It used to switch itself on whenever the operating system asked for reduced
   motion — and on Windows that is simply "Animation effects" being off, which
   plenty of people have without ever asking a game to stop moving. The pieces
   then jumped from square to square instead of walking, and the game looked
   broken. The system preference still quietens the purely decorative effects
   The switch is now the only thing that decides — the operating system's
   preference no longer quietens anything behind the player's back, not even
   the dice tumble or the rising words. Settings saved by earlier builds may
   carry the switch turned on, so it is turned off once, here. */
function loadSettings() {
  const s = D.load('settings', null);
  const d = Object.assign({}, SET_DEFAULTS, s && typeof s === 'object' ? s : {});
  if (!s || s.v !== 3) { d.calm = false; d.v = 3; }
  if (THEMES.indexOf(d.theme) < 0) d.theme = 'meadow';
  return d;
}

/* ---- the three slots ---- */
function dailyGame() {
  const day = D.today();
  const kept = D.load('daily', null);
  if (kept && kept.day === day && R.sane(kept.game) && kept.game.mode === 'daily') return kept.game;
  return R.newGame({ seed: D.seedFor(day), mood: D.moodFor(day), mode: 'daily', day });
}
function practiceGame(fresh) {
  if (!fresh) { const s = D.load('practice', null); if (R.sane(s) && s.mode === 'practice') return s; }
  return R.newGame({ mood: D.moodFor(D.today()), mode: 'practice' });
}
function challengeGame(c) {
  const s = D.load('challenge', null);
  if (R.sane(s) && s.mode === 'challenge' && s.seed === c.seed && s.mood === c.mood && s.target === c.score) return s;
  return R.newGame({ seed: c.seed, mood: c.mood, mode: 'challenge', target: c.score });
}
function storeGame(g) {
  if (g.mode === 'daily') D.save('daily', { day: g.day, game: g });
  else D.save(g.mode, g);
}
function initialGame() {
  const c = D.readChallenge(window.location.hash);
  return c ? challengeGame(c) : dailyGame();
}
const dropHash = () => {
  try { if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
};

/* the timings the two-player version settled on: a brisk step, an unhurried
   route, and a slow carry back to the cage */
const DUR = { step: 360, route: 1000, carry: 1550 };
const CUE = { step: 'step', walk: 'step', scamper: 'step', tunnel: 'dig', flight: 'fly', climb: 'climb', snap: 'treat' };

/* is this a phone held upright? (the same test the stylesheet uses) */
const PHONE = '(max-width: 900px) and (orientation: portrait)';
function usePhone() {
  const test = () => { try { return window.matchMedia(PHONE).matches; } catch (e) { return false; } };
  const [on, setOn] = useState(test);
  useEffect(() => {
    let m;
    try { m = window.matchMedia(PHONE); } catch (e) { return undefined; }
    const f = () => setOn(m.matches);
    if (m.addEventListener) m.addEventListener('change', f); else m.addListener(f);
    return () => { if (m.removeEventListener) m.removeEventListener('change', f); else m.removeListener(f); };
  }, []);
  return on;
}

function App() {
  const phone = usePhone();
  const [t, setT] = useState(loadSettings);
  const [g, setG] = useState(initialGame);
  const [busy, setBusy] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [carry, setCarry] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const [modal, setModal] = useState(() => (D.load('tips', null) ? null : 'help'));
  const [endOpen, setEndOpen] = useState(false);
  const [tips, setTips] = useState(() => D.load('tips', {}) || {});
  const [par, setPar] = useState(null);
  const [streak, setStreak] = useState(() => D.liveStreak());
  const [note, setNote] = useState(null);
  const [fallback, setFallback] = useState(null);
  const gRef = useRef(g); gRef.current = g;
  const tipRef = useRef(null);
  /* a garden that was already finished when the page opened shows its result */
  useEffect(() => { if (g.phase === 'over') setEndOpen(true); }, []);
  /* one count per visit, with whether this player was here yesterday — worked
     out from their own streak, so nobody has to be recognised */
  useEffect(() => {
    const s = D.stats(), day = D.today();
    const returning = !s.last ? 'new' : s.last === day ? 'today'
      : s.last === D.addDays(day, -1) ? 'yesterday' : 'lapsed';
    window.MT.track('pageview', { mode: g.mode, returning });
  }, []);

  const reduce = !!t.calm;
  const cue = useCallback((n) => { if (t.sound) S.play(n); }, [t.sound]);
  /* a short buzz on phones that can (Android; iPhones ignore it) */
  const buzz = useCallback((pattern) => {
    if (!t.buzz || typeof navigator.vibrate !== 'function') return;
    try { navigator.vibrate(pattern); } catch (e) { /* not allowed yet: fine */ }
  }, [t.buzz]);
  useEffect(() => { S.enabled = t.sound; D.save('settings', t); }, [t]);
  useEffect(() => { storeGame(g); }, [g]);
  const setTweak = useCallback((k, v) => setT((p) => Object.assign({}, p, { [k]: v })), []);

  /* ---- floating words ---- */
  const fk = useRef(0);
  const float = useCallback((text, p, tone) => {
    const key = ++fk.current;
    setFloaters((f) => f.concat([{ key, text, x: p.x, y: p.y - 60, tone }]));
    setTimeout(() => setFloaters((f) => f.filter((x) => x.key !== key)), 1500);
  }, []);

  /* ---- par: worked out in the background, then remembered ---- */
  useEffect(() => {
    const known = D.knownPar(g.seed, g.mood);
    if (known != null) { setPar(known); return undefined; }
    setPar(null);
    let alive = true;
    const seed = g.seed, mood = g.mood;
    AI.parAsync(seed, mood).then((v) => {
      if (typeof v !== 'number') return;
      D.rememberPar(seed, mood, v);
      if (alive) setPar(v);
    });
    return () => { alive = false; };
  }, [g.seed, g.mood]);

  /* ---- move a piece, then the state; carry off anything she caught ---- */
  const animate = useCallback((next, mover, from, to, opts) => {
    const o = opts || {};
    const before = window.layout(g);
    const after = window.layout(next);
    const p0 = before[mover] || Object.assign({}, G.nodePos(from));
    const p1 = o.moverTo || after[mover] || Object.assign({}, G.nodePos(to));
    const route = o.route || G.routeFor(from, to, mover);
    const caughtNow = G.ANIMALS.filter((id) => next.eaten[id] && !g.eaten[id]);
    setBusy(true);
    cue(o.cue || CUE[route.kind] || 'step');
    const finish = () => { setCarry(null); setBusy(false); if (o.then) o.then(); };

    window.Motion.play({
      id: mover, route, from: p0, to: p1,
      color: mover === 'cat' ? '#efe4cf' : G.META[mover].color,
      dur: route.kind === 'step' || route.kind === 'walk' ? DUR.step : DUR.route,
      reduce: reduce || document.hidden,
      onDone: () => {
        if (caughtNow.length && !reduce) {
          /* keep them drawn where she took them; the carry puts them in the cage */
          const hold = {};
          caughtNow.forEach((id) => {
            const b = before[id] || Object.assign({}, G.nodePos(g.animals[id]));
            hold[id] = { x: b.x, y: b.y, s: b.s || 1 };
          });
          setCarry(hold);
        }
        setG(next);
        if (caughtNow.length) {
          cue('pounce');
          buzz([45, 60, 45]);
          float(caughtNow.length > 1 ? `Gotcha ×${caughtNow.length}!` : 'Gotcha!', after.cat || p1, 'bad');
        }
        if (!caughtNow.length || reduce) { finish(); return; }
        window.Motion.pounce('cat');
        const trip = caughtNow.map((id) => ({
          id,
          a: before[id] || Object.assign({}, G.nodePos(g.animals[id])),
          b: after[id] || Object.assign({}, G.nodePos(G.BED)),
          shrink: ((after[id] && after[id].s) || 1) / ((before[id] && before[id].s) || 1),
        }));
        trip.forEach((x) => window.Motion.place(x.id, x.a));
        requestAnimationFrame(() => {
          let left = trip.length;
          const tick = () => { if (--left <= 0) finish(); };
          trip.forEach((x, i) => setTimeout(() => window.Motion.play({
            id: x.id, route: { kind: 'carry', d: G.carryPath(x.a, x.b) },
            from: x.a, to: x.b, shrink: x.shrink, color: G.META[x.id].color,
            dur: DUR.carry, reduce: reduce || document.hidden, onDone: tick,
          }), i * 300));
        });
      },
    });
  }, [g, reduce, cue, float, buzz]);

  /* ---- a new turn: the dice tumble, then the red zone appears ---- */
  const lastTurn = useRef(g.turn);
  useEffect(() => {
    if (g.turn === lastTurn.current) return undefined;
    lastTurn.current = g.turn;
    if (g.phase === 'over' || reduce) return undefined;
    setRolling(true);
    cue('roll');
    const id = setTimeout(() => setRolling(false), 520);
    return () => clearTimeout(id);
  }, [g.turn, g.phase, reduce, cue]);

  /* ---- the cat walks herself ---- */
  const catGo = useCallback(() => {
    const cur = gRef.current;
    if (cur.phase !== 'cat') return;
    const n = R.clone(cur);
    const ev = R.catStep(n);
    if (!ev) { setG(n); return; }
    animate(n, 'cat', ev.from, ev.to, {
      route: { kind: ev.cut ? 'scamper' : 'walk', d: ev.d },
      /* the red-zone tip has done its job once she has actually pounced */
      then: () => { if (tipRef.current === 'zone') seeTip('zone'); },
    });
  }, [animate]);
  const catRef = useRef(catGo); catRef.current = catGo;
  useEffect(() => {
    if (busy || g.phase !== 'cat') return undefined;
    const id = setTimeout(() => catRef.current(), reduce ? 40 : 420);
    return () => clearTimeout(id);
  }, [g.phase, g.catLeft, g.cat, busy, reduce]);

  const threat = useMemo(() => (g.phase === 'move' && !rolling ? R.threat(g) : []), [g, rolling]);
  const inDanger = useMemo(() => R.live(g).filter((id) => threat.indexOf(g.animals[id]) >= 0), [g, threat]);
  const canAct = g.phase === 'move' && !busy && !rolling;

  /* Nothing to decide? Then nothing to press. With no steps left, and either
     no treat or nobody a treat would save, she just goes. */
  useEffect(() => {
    if (!canAct) return undefined;
    const anyMove = R.live(g).some((id) => !R.blocked(g, id));
    const treatMatters = R.canTreat(g) && inDanger.length > 0;
    if ((g.moves > 0 && anyMove) || treatMatters) return undefined;
    const id = setTimeout(() => {
      const n = R.clone(gRef.current);
      if (n.phase === 'move' && R.stay(n)) setG(n);
    }, reduce ? 60 : 650);
    return () => clearTimeout(id);
  }, [canAct, g, inDanger, reduce]);

  /* ---- the player's three actions ---- */
  const seeTip = useCallback((k) => {
    setTips((p) => { if (p[k]) return p; const n = Object.assign({}, p, { [k]: true }); D.save('tips', n); return n; });
  }, []);

  /* the first thing a player does in a garden counts as starting it — once,
     even across reloads, because the mark is kept in the saved game */
  const began = (n) => {
    if (n.began) return;
    n.began = true;
    window.MT.track('start', { mode: n.mode, mood: n.mood });
  };

  const step = useCallback((id) => {
    if (!canAct) return;
    const why = R.blocked(g, id);
    if (why) {
      if (why === 'cat') float('Blocked!', window.layout(g)[id] || G.nodePos(g.animals[id]), 'warn');
      return;
    }
    const n = R.clone(g);
    const ev = R.step(n, id);
    if (!ev) return;
    began(n);
    seeTip('tap');
    const kind = ev.cut ? 'scamper' : G.routeFor(ev.from, ev.to, id).kind;
    animate(n, id, ev.from, ev.to, {
      route: { kind, d: ev.d },
      then: () => {
        if (ev.home) { cue('home'); buzz(25); float('Home!', G.nodePos(ev.to), 'good'); }
        else if (ev.cut) float('Shortcut!', G.nodePos(ev.to), 'plain');
      },
    });
  }, [g, canAct, animate, cue, float, seeTip, buzz]);

  const treat = useCallback(() => {
    if (!canAct || !R.canTreat(g)) return;
    const n = R.clone(g);
    const ev = R.treat(n);
    began(n);
    seeTip('treat');
    animate(n, 'cat', ev.from, G.BED, {
      cue: 'treat',
      then: () => float('Treat!', G.nodePos(G.BED), 'good'),
    });
  }, [g, canAct, animate, float, seeTip]);

  const stay = useCallback(() => {
    if (!canAct) return;
    const n = R.clone(g);
    if (R.stay(n)) { began(n); setG(n); }
  }, [g, canAct]);

  /* ---- the end of a garden ---- */
  const endedRef = useRef(g.phase === 'over' ? g.seed + g.mode : null);
  useEffect(() => {
    if (g.phase !== 'over' || busy) return undefined;
    const key = g.seed + g.mode;
    if (endedRef.current === key) return undefined;
    endedRef.current = key;
    let run = null;
    if (g.mode === 'daily') { D.recordDaily(g.day, R.saved(g)); run = D.liveStreak(); setStreak(run); }
    const stars = R.saved(g);
    const props = { mode: g.mode, mood: g.mood, stars,
      par: par == null ? 'unknown' : stars > par ? 'beat' : stars === par ? 'matched' : 'missed' };
    if (run != null) props.streak = run >= 7 ? '7+' : run >= 3 ? '3-6' : String(run);
    if (g.mode === 'challenge' && g.target != null) {
      props.friend = stars > g.target ? 'beat' : stars === g.target ? 'level' : 'lost';
    }
    window.MT.track('finish', props);
    const id = setTimeout(() => { cue(R.saved(g) >= 2 ? 'win' : 'lose'); setEndOpen(true); }, reduce ? 50 : 700);
    return () => clearTimeout(id);
  }, [g, busy, reduce, cue, par]);

  const open = useCallback((next) => {
    if (busy) return;
    setNote(null); setEndOpen(false); setCarry(null); setFloaters([]);
    endedRef.current = next.phase === 'over' ? next.seed + next.mode : null;
    lastTurn.current = next.turn;
    setG(next);
    if (next.phase === 'over') setEndOpen(true);
  }, [busy]);
  const toDaily = () => { if (g.mode !== 'daily') { dropHash(); open(dailyGame()); } };
  const toPractice = () => { if (g.mode === 'daily') { dropHash(); open(practiceGame(false)); } };
  const newPractice = () => { dropHash(); open(practiceGame(true)); };

  const share = useCallback(async () => {
    const text = D.shareText(g, par, streak);
    setNote(null);
    try {
      if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        await navigator.share({ text });
        window.MT.track('share', { mode: g.mode, via: 'sheet' });
        return;
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(text);
      setNote('Copied — paste it anywhere.');
      window.MT.track('share', { mode: g.mode, via: 'clipboard' });
    } catch (e) {
      setFallback(text);
      window.MT.track('share', { mode: g.mode, via: 'manual' });
    }
  }, [g, par, streak]);

  /* ---- keyboard: 1 2 3 step a critter, T treat, S stay ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { setModal(null); setEndOpen(false); setFallback(null); return; }
      if (modal || endOpen || fallback) return;
      if (k >= '1' && k <= '3') { e.preventDefault(); step(G.ANIMALS[+k - 1]); }
      else if (k === 't') { e.preventDefault(); treat(); }
      else if (k === 's') { e.preventDefault(); stay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, endOpen, fallback, step, treat, stay]);

  /* ---- first-game tips, one at a time ---- */
  let tip = null;
  if (canAct && !modal) {
    if (!tips.tap && g.moves > 0) tip = 'tap';
    else if (!tips.zone && threat.length) tip = 'zone';
    else if (!tips.treat && R.canTreat(g) && inDanger.length) tip = 'treat';
  }
  tipRef.current = tip;

  /* what the board shows: where each critter would go, and who is in trouble */
  const nexts = {}, warn = {}, stuck = {}, taps = {}, labels = {};
  if (canAct) {
    R.live(g).forEach((id) => {
      const why = R.blocked(g, id);
      if (inDanger.indexOf(id) >= 0) warn[id] = true;
      if (why === 'cat') stuck[id] = true;
      if (!why) {
        const mv = R.stepFor(g, id);
        if (!nexts[mv.to]) nexts[mv.to] = G.META[id].color;
        taps[id] = () => step(id);
        labels[id] = `Move the ${G.META[id].label}`;
      }
    });
  }
  const faces = g.dice ? g.dice.faces : ['green', 'green'];

  return (
    <div className={'stage' + (t.calm ? ' is-calm' : '')} data-palette={t.theme}>
      <div className="board-col">
        <div className="board">
          <svg viewBox="0 0 1000 1000" className="board-svg" role="img" aria-label="The garden board">
            <Defs />
            <BoardBase />
            <FlowArrows />
            <TrailLayer show />
            <HomeRunLayer show kinds={['tunnel']} cls="burrows" />
            <CatRun />
            <CatCage />
            <FlagThreat threat={threat} />
            <BoardTreats left={g.treats} total={R.MOODS[g.mood].treats}
              usable={canAct && R.canTreat(g)} onUse={treat} />
            <Stones highlights={[]} target={null} danger={g.cat} onPick={() => {}}
              threat={threat} nexts={nexts} />
            <HomeRunLayer show kinds={['climb']} cls="climbs" />
            <BoardTree />
            <GroundHome />
            <TreeHomes />
            <HomeRunLayer show kinds={['flight']} cls="flights" />
            <NextPads nexts={nexts} />
          </svg>
          {/* Everything that moves lives on its own layer above the board.
              The board is a couple of thousand shapes, gradients and clips; it
              now changes at most once a turn, and the browser keeps it as a
              finished picture while the pieces, dice and words move over it —
              instead of redrawing the whole garden on every frame of every
              move, which is what made mid-range phones stutter. */}
          <svg viewBox="0 0 1000 1000" className="board-svg board-live" aria-label="Pieces">
            <BoardDice faces={faces} rolling={rolling} />
            <Pieces g={g} hold={carry} onTap={taps} warn={warn} stuck={stuck} label={labels} k={phone ? 1.22 : 1} />
            <CageBars />
            <Floaters items={floaters} />
          </svg>
        </div>
      </div>

      <aside className="rail">
        <div className="rail-top">
          <Wordmark g={g} par={par} streak={streak} />
          <ModeMenu g={g} onDaily={toDaily} onPractice={toPractice} onNew={newPractice} />
          <button className="btn btn-icon" onClick={() => setModal('help')} aria-label="How to play" title="How to play">?</button>
          <button className="btn btn-icon" onClick={() => setModal('settings')} aria-label="Settings" title="Settings">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ModeTabs g={g} onDaily={toDaily} onPractice={toPractice} onNew={newPractice} />
        <InfoStrip g={g} par={par} streak={streak} />
        <TurnPanel g={g} rolling={rolling} danger={inDanger.length > 0} onTreat={treat} onStay={stay} />
        {/* when the garden is over its result button takes the critters' place,
            at the same height, instead of adding a row underneath */}
        {g.phase === 'over' ? (
          <div className="critters critters-over">
            <button className="btn btn-primary" onClick={() => setEndOpen(true)}>See result</button>
          </div>
        ) : (
          <CritterBar g={g} threat={threat} onStep={step} live={canAct} />
        )}
        <Tip tip={tip} onDone={() => seeTip(tip)} />
      </aside>

      {endOpen && g.phase === 'over' ? (
        <EndCard g={g} par={par} streak={streak} onShare={share} shareNote={note}
          onPractice={() => { dropHash(); open(practiceGame(true)); }} onNew={newPractice}
          onClose={() => setEndOpen(false)} />
      ) : null}
      {modal === 'help' ? <HelpCard onPrivacy={() => setModal('privacy')} onClose={() => { setModal(null); if (!D.load('tips', null)) D.save('tips', tips); }} /> : null}
      {modal === 'settings' ? <SettingsCard t={t} setT={setTweak} onPrivacy={() => setModal('privacy')} onClose={() => setModal(null)} /> : null}
      {modal === 'privacy' ? <PrivacyCard onClose={() => setModal(null)} /> : null}
      {fallback ? <ShareFallback text={fallback} onClose={() => setFallback(null)} /> : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
