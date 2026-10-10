/* Balance harness.

   Loads the shipping src/graph.js, src/rules.js and src/ai.js and plays whole
   games headlessly, once per cat mood, with three players:

     random   taps any critter that can move, never uses a treat
     quick    the AI's rule of thumb on its own
     par      the AI that sets the daily par

   What to look for: a clear ladder between the three (the game rewards
   thinking), and stars that fall away steadily from Sleepy to Starving.

   Run:  node build/balance-sim.js [games-per-mood] [par-games-per-mood]
*/
global.window = global;
require('../src/graph.js');
require('../src/rules.js');
require('../src/ai.js');
const G = window.MG, R = window.MR, AI = window.MAI;

const N = +(process.argv[2] || 3000);
const NP = +(process.argv[3] || 60);

function randomTurn(g) {
  const turn = g.turn;
  let guard = 0;
  while (g.turn === turn && g.phase === 'move' && g.moves > 0 && guard++ < 4) {
    const ok = R.live(g).filter((id) => !R.blocked(g, id));
    if (!ok.length) break;
    R.step(g, ok[Math.floor(Math.random() * ok.length)]);
  }
  if (g.turn === turn && g.phase === 'move') R.stay(g);
}

function bench(label, mood, games, play) {
  const dist = [0, 0, 0, 0];
  let turns = 0;
  const t0 = Date.now();
  for (let i = 0; i < games; i++) {
    const seed = 'b' + i + '-' + Math.random().toString(36).slice(2, 7);
    const r = play(seed, mood);
    dist[r.saved]++;
    turns += r.turns;
  }
  const mean = dist.reduce((a, n, k) => a + n * k, 0) / games;
  const pct = dist.map((n) => (n / games * 100).toFixed(0).padStart(3) + '%');
  console.log('  ' + label.padEnd(8) + mean.toFixed(2) + ' stars   ' +
    '0★' + pct[0] + '  1★' + pct[1] + '  2★' + pct[2] + '  3★' + pct[3] +
    '   ' + (turns / games).toFixed(0) + ' turns   ' +
    ((Date.now() - t0) / games).toFixed(1) + ' ms/game');
}

const viaTurn = (fn) => (seed, mood) => {
  const g = R.newGame({ seed, mood });
  const saved = AI.playOut(g, fn);
  return { saved, turns: g.turn };
};
const viaPar = (seed, mood) => {
  const run = AI.parRunner(seed, mood, AI.PAR_N);
  let guard = 0, turns = 0;
  while (!run.step() && guard++ < 1000) turns++;
  return { saved: run.saved, turns };
};

for (const mood of R.MOOD_KEYS) {
  const m = R.MOODS[mood];
  console.log(`${m.emoji} ${m.label} — black ${Math.round(m.black * 100)}%, ${m.treats} treats`);
  bench('random', mood, N, viaTurn(randomTurn));
  bench('quick', mood, N, viaTurn(AI.quickTurn));
  bench('par', mood, NP, viaPar);
  console.log('');
}
