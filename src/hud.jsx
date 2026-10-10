/* Scamper — HUD. Everything beside the board, kept small: what the dice say,
   which critter to tap, and how the day is going. */
const HG = window.MG;

function Wordmark() {
  const N = HG.NAMES;
  return (
    <div className="wordmark">
      <svg viewBox="0 0 46 46" className="wm-badge" aria-hidden="true">
        <circle cx="23" cy="23" r="23" fill="#1a1611" />
        <g transform="translate(23 30) scale(0.8)" color="#94897d">{window.PG.mouse}</g>
      </svg>
      <div className="wm-text">
        <h1>{N.game}</h1>
        <p>{N.tagline}</p>
      </div>
    </div>
  );
}

/* a critter's little portrait, used on buttons and the end card */
function Face({ id, size }) {
  return (
    <svg viewBox="0 0 34 34" width={size || 30} height={size || 30} aria-hidden="true" style={{ color: HG.META[id].color }}>
      <circle cx="17" cy="17" r="17" fill="currentColor" />
      <g transform="translate(17 23) scale(0.62)" color="#fdf7e8">{window.PG[id]}</g>
    </svg>
  );
}

function Die({ face, used }) {
  return (
    <span className={'die die-' + face + (used ? ' is-used' : '')} aria-label={face + ' die'}>
      <i />
    </span>
  );
}

/* ---- daily / practice ---- */
function ModeTabs({ g, onDaily, onPractice, onNew }) {
  const D = window.MD;
  return (
    <div className="modes" role="tablist">
      <button role="tab" aria-selected={g.mode === 'daily'} className={'mode' + (g.mode === 'daily' ? ' is-on' : '')}
        onClick={onDaily}>Daily {D.dayNumber(D.today()) != null ? '#' + D.dayNumber(D.today()) : '· ' + D.dayLabel(D.today())}</button>
      <button role="tab" aria-selected={g.mode !== 'daily'} className={'mode' + (g.mode !== 'daily' ? ' is-on' : '')}
        onClick={onPractice}>{g.mode === 'challenge' ? 'Challenge' : 'Practice'}</button>
      {g.mode !== 'daily' ? (
        <button className="mode mode-new" onClick={onNew} title="A fresh garden on new dice">New</button>
      ) : null}
    </div>
  );
}

/* mood, par, streak — the three numbers a day is about */
function InfoStrip({ g, par, streak }) {
  const m = window.MR.MOODS[g.mood];
  return (
    <div className="info">
      <span className="info-chip" title={`${HG.NAMES.cat} is ${m.label.toLowerCase()} today`}>
        <b>{m.emoji}</b> {m.label}
      </span>
      <span className="info-chip" title="What the computer scored on these dice">
        Par <b>{par == null ? '…' : par}</b>
      </span>
      {g.mode === 'challenge' && g.target != null ? (
        <span className="info-chip info-friend" title="Your friend's score on these dice">Friend <b>{g.target}</b></span>
      ) : (
        <span className={'info-chip' + (streak ? ' info-hot' : '')} title="Daily gardens in a row">
          🔥 <b>{streak}</b>
        </span>
      )}
    </div>
  );
}

/* ---- the turn: what the dice gave, and what is waiting on you ---- */
function TurnPanel({ g, rolling, danger, onTreat, onStay }) {
  const R = window.MR, cat = HG.NAMES.cat;
  const d = g.dice || { faces: ['green', 'green'], black: 0, green: 2 };
  const canTreat = R.canTreat(g);
  let head, sub;
  if (g.phase === 'over') { head = 'Garden done'; sub = 'Every critter is home or caught.'; }
  else if (rolling) { head = 'Rolling…'; sub = ' '; }
  else if (g.phase === 'cat') { head = `${cat} is on the prowl`; sub = 'Hold your breath.'; }
  else if (g.moves > 0) {
    head = g.moves === 1 ? '1 step left' : `${g.moves} steps`;
    sub = d.black === 0 ? `${cat} is napping this turn. Tap a critter.`
      : danger ? `Red squares are hers this turn — get them out!` : `Tap a critter to step it. ${cat} moves ${d.black} after.`;
  } else if (d.black === 2 && g.phase === 'move') {
    head = 'Two black!';
    sub = canTreat ? `${cat} moves 2. Throw her a treat, or brace.` : `${cat} moves 2. Brace!`;
  } else { head = `${cat}'s turn`; sub = ' '; }

  /* green dice are spent left to right as you step */
  const spent = Math.max(0, d.green - g.moves);
  let usedGreen = 0;
  return (
    <div className={'turn' + (danger && g.phase === 'move' ? ' is-danger' : '')}>
      <div className="turn-top">
        <div className={'dice' + (rolling ? ' is-rolling' : '')}>
          {d.faces.map((f, i) => {
            const used = f === 'green' && g.phase === 'move' && usedGreen++ < spent;
            return <Die key={i} face={rolling ? 'blank' : f} used={used || (g.phase === 'cat' && f === 'green')} />;
          })}
        </div>
        <div className="turn-text">
          <strong>{head}</strong>
          <span>{sub}</span>
        </div>
        <span className="turn-n">Turn {g.turn}</span>
      </div>
      {g.phase === 'move' && !rolling ? (
        <div className="turn-btns">
          <button className={'btn btn-treat' + (canTreat && danger ? ' is-hot' : '')} disabled={!canTreat} onClick={onTreat}
            title={g.cat === HG.BED ? `${cat} is already in her basket` : `Send ${cat} back to her basket`}>
            🐟 Treat <span className="treat-left">{'●'.repeat(g.treats)}{'○'.repeat(Math.max(0, R.MOODS[g.mood].treats - g.treats))}</span>
          </button>
          <button className="btn btn-quiet" onClick={onStay}>
            {g.moves > 0 ? 'Stay put' : 'Let her come'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---- the three critters as big buttons — the board's pieces do the same ---- */
function CritterBar({ g, threat, onStep, live }) {
  const R = window.MR;
  return (
    <div className="critters">
      {HG.ANIMALS.map((id, i) => {
        const home = g.home[id], gone = g.eaten[id];
        const why = R.blocked(g, id);
        const mv = !home && !gone ? R.stepFor(g, id) : null;
        const inZone = !home && !gone && threat.indexOf(g.animals[id]) >= 0;
        const intoZone = mv && mv.to !== HG.META[id].home && threat.indexOf(mv.to) >= 0;
        let note;
        if (home) note = 'Home ★';
        else if (gone) note = 'Caught';
        else if (why === 'cat') note = `${HG.NAMES.cat}'s in the way`;
        else if (inZone) note = 'In danger!';
        else if (intoZone) note = 'Steps into danger';
        else note = HG.stepsToHome(g.animals[id], id) + ' to go';
        const cls = ['crit'];
        if (home) cls.push('is-home');
        if (gone) cls.push('is-gone');
        if (inZone) cls.push('is-danger');
        if (intoZone) cls.push('is-risky');
        return (
          <button key={id} className={cls.join(' ')} style={{ '--c': HG.META[id].color }}
            disabled={!live || !!why} onClick={() => onStep(id)}
            aria-label={`${HG.META[id].label}: ${note}`}>
            <Face id={id} size={34} />
            <span className="crit-name">{HG.META[id].label}<em>{i + 1}</em></span>
            <span className="crit-note">{note}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---- the three first-game tips ---- */
const TIPS = {
  tap: () => 'Tap a critter to move it one square. Each green die is one step.',
  zone: () => `Red squares are where ${HG.NAMES.cat} pounces this turn — she catches anything she lands on or runs past. Keep out!`,
  treat: () => `Somebody can't escape. Tap a treat and ${HG.NAMES.cat} runs back to her basket.`,
};
function Tip({ tip, onDone }) {
  if (!tip) return null;
  return (
    <div className="tip" role="status">
      <span className="tip-i" aria-hidden="true">💡</span>
      <p>{TIPS[tip]()}</p>
      <button className="tip-x" onClick={onDone} aria-label="Got it">Got it</button>
    </div>
  );
}

/* ---- help, settings ---- */
function HelpCard({ onClose, onPrivacy }) {
  const cat = HG.NAMES.cat;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal-help" role="dialog" aria-modal="true" aria-labelledby="help-h" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2 id="help-h">How to play</h2>
        <ul className="help">
          <li><b>Tap a critter</b> to move it one square. Each <b className="k-an">green</b> die is one step.</li>
          <li><b className="k-red">Red squares</b> are where {cat} pounces this turn. She catches anything she lands on <i>or runs past</i>.</li>
          <li>Yellow slabs are <b>shortcuts</b>. Each critter takes its own automatically.</li>
          <li>A <b>treat</b> sends {cat} back to her basket. One a turn.</li>
          <li>Every critter home is a <b>★</b>. Beat par, keep your 🔥 streak, share your garden.</li>
        </ul>
        <button className="btn btn-primary" onClick={onClose}>Let's go</button>
        <button className="link-btn" onClick={onPrivacy}>Privacy</button>
      </div>
    </div>
  );
}

/* ---- what the game keeps, and what it sends ---- */
function PrivacyCard({ onClose }) {
  const T = window.MT;
  const who = T.provider === 'plausible' ? 'Plausible' : T.provider === 'goatcounter' ? 'GoatCounter' : null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal-help" role="dialog" aria-modal="true" aria-labelledby="priv-h" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2 id="priv-h">Privacy</h2>
        <ul className="help">
          <li>Your gardens, streak and settings are kept <b>on this device only</b>. There is no account.</li>
          {T.configured ? (
            <>
              <li>To learn what makes the game fun, {HG.NAMES.game} counts a few <b>anonymous</b> events:
                a visit, a garden started, a garden finished (mode, mood, stars, par), a result shared.</li>
              <li><b>No cookies, no names, no device ID</b>, nothing typed, nothing that identifies you or
                follows you between sites. The counts are handled by {who}.</li>
              <li>Do Not Track and Global Privacy Control are honoured automatically, and you can switch
                <b> Anonymous stats</b> off in Settings.</li>
            </>
          ) : (
            <li>This copy of {HG.NAMES.game} <b>sends nothing anywhere</b>.</li>
          )}
        </ul>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

/* an on/off switch. Defined out here rather than inside the card, so it stays
   the same button from one render to the next and keeps focus when toggled. */
function Sw({ t, setT, k, label, hint }) {
  return (
    <div className="set-row">
      <span>{label}{hint ? <em className="set-hint">{hint}</em> : null}</span>
      <button className={'sw' + (t[k] ? ' is-on' : '')} role="switch" aria-checked={!!t[k]}
        aria-label={label} onClick={() => setT(k, !t[k])}><i /></button>
    </div>
  );
}
function SettingsCard({ t, setT, onClose, onPrivacy }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal-set" role="dialog" aria-modal="true" aria-labelledby="set-h" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2 id="set-h">Settings</h2>
        <div className="set-row">
          <span>Theme</span>
          <div className="seg" role="radiogroup" aria-label="Theme">
            {['meadow', 'dusk', 'autumn'].map((p) => (
              <button key={p} role="radio" aria-checked={t.theme === p}
                className={'seg-b' + (t.theme === p ? ' is-on' : '')} onClick={() => setT('theme', p)}>{p}</button>
            ))}
          </div>
        </div>
        <Sw t={t} setT={setT} k="sound" label="Sound" />
        <Sw t={t} setT={setT} k="calm" label="Reduce motion" hint="Pieces jump instead of walking, and nothing tumbles or pops." />
        {window.MT.configured ? (
          <Sw t={t} setT={setT} k="stats" label="Anonymous stats" hint="Counts like “a garden finished with 2 stars”. Nothing that identifies you." />
        ) : null}
        <button className="btn btn-primary" onClick={onClose}>Done</button>
        <button className="link-btn" onClick={onPrivacy}>Privacy</button>
      </div>
    </div>
  );
}

/* ---- the end of a garden ---- */
const HEADLINE = ['Gotcha — all three', 'One made it home', 'Two made it home', 'A perfect garden!'];
function EndCard({ g, par, streak, onShare, onPractice, onNew, onClose, shareNote }) {
  const R = window.MR, D = window.MD, n = R.saved(g);
  let parLine;
  if (par == null) parLine = 'Working out par…';
  else if (n > par) parLine = `You beat par (${par}). Brilliant.`;
  else if (n === par) parLine = `You matched par (${par}).`;
  else parLine = `Par was ${par}. So close.`;
  let friend = null;
  if (g.mode === 'challenge' && g.target != null) {
    friend = n > g.target ? `You beat your friend's ${g.target}!`
      : n === g.target ? `Level with your friend — ${g.target} each.` : `Your friend saved ${g.target}. Rematch?`;
  }
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal-end" role="dialog" aria-modal="true" aria-labelledby="end-h" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <div className="end-stars" aria-label={n + ' of 3 stars'}>
          {[0, 1, 2].map((i) => <span key={i} className={i < n ? 'is-on' : ''}>★</span>)}
        </div>
        <h2 id="end-h">{HEADLINE[n].replace('Gotcha', HG.NAMES.cat + ' got them')}</h2>
        <div className="end-row">
          {HG.ANIMALS.map((id) => (
            <span key={id} className={g.home[id] ? 'ok' : 'no'}>
              <Face id={id} size={26} />{g.home[id] ? 'Home' : 'Caught'}
            </span>
          ))}
        </div>
        <p className="end-par">{parLine}</p>
        {friend ? <p className="end-friend">{friend}</p> : null}
        {g.mode === 'daily' ? (
          <p className="end-meta">🔥 {streak} day streak · next garden in {D.untilTomorrow()}</p>
        ) : null}
        <button className="btn btn-primary" onClick={onShare}>
          {g.mode === 'daily' ? 'Share my garden' : 'Challenge a friend'}
        </button>
        {shareNote ? <p className="end-note">{shareNote}</p> : null}
        <div className="act-btns">
          {g.mode === 'daily'
            ? <button className="btn btn-quiet" onClick={onPractice}>Practice</button>
            : <button className="btn btn-quiet" onClick={onNew}>New garden</button>}
          <button className="btn btn-quiet" onClick={onClose}>See the board</button>
        </div>
      </div>
    </div>
  );
}

/* the text to copy by hand, when the browser will not copy it for us */
function ShareFallback({ text, onClose }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal modal-set" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Copy and share</h2>
        <textarea className="share-text" readOnly value={text} rows={5}
          onFocus={(e) => e.target.select()} autoFocus />
        <button className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

Object.assign(window, {
  Wordmark, Face, ModeTabs, InfoStrip, TurnPanel, CritterBar, Tip, HelpCard, PrivacyCard, SettingsCard, EndCard, ShareFallback,
});
