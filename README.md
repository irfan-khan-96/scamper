# Scamper

A three-minute daily puzzle. Get the mouse, the squirrel and the bird home to
the tree before Biscuit the cat pounces.

Open **`Scamper.html`** to play: it is one self-contained file you can
double-click. To publish it, upload the **`site/`** folder to any static host
(GitHub Pages, Netlify, an S3 bucket) after filling in the launch settings
below. There is no server and nothing to install.

## Launch settings

Three settings in **`build/config.json`**, read when you run
`node build/pack.js`. Every one may be left `null`.

```json
{
  "launch": "2026-11-01",
  "site": "https://scamper.example.com",
  "analytics": { "provider": "plausible", "domain": "scamper.example.com" }
}
```

- **`launch`** — the date that is **Daily #1**. Until it is set, and on any day
  before it, a garden is named by its date ("Daily · 11 Oct") instead of a
  number, so nobody's first visit ever says "#40". Set it once and never change
  it after launch, or everyone's numbers shift.
- **`site`** — the `https://` address the `site/` folder will live at. It turns
  on the **link-preview image** (`card.jpg`, 1200×630) and the home-screen icon
  (`icon-180.png`). Link previews in Messages, WhatsApp, Slack, X and the rest
  need an absolute address, so without `site` a shared link shows a title and
  description but no picture. The preview tags are written into the page the
  server sends, because the robots that build previews do not run JavaScript.
- **`analytics`** — where the anonymous play counts go. **Off until set**: with
  `null` the game sends nothing anywhere. Two cookieless providers work:
  - Plausible: `{ "provider": "plausible", "domain": "your.domain" }` (add
    `"endpoint"` for a self-hosted Plausible)
  - GoatCounter: `{ "provider": "goatcounter", "code": "yourcode" }`

  Four events, each sent once, carrying only game facts — no cookies, names,
  device IDs or anything typed:

  | event | when | properties |
  |---|---|---|
  | `pageview` | the game opens | mode; `returning`: new / today / yesterday / lapsed |
  | `start` | first move in a garden | mode, mood |
  | `finish` | a garden ends | mode, mood, stars, par (beat / matched / missed), daily streak bucket, challenge result |
  | `share` | a result is shared | mode, via (sheet / clipboard / manual) |

  Those answer the three launch questions: do people finish (finish ÷ start),
  do they share (share ÷ finish), and do they come back (`returning:
  yesterday` on pageview). "Returning" is worked out on the player's device
  from their own streak, so no visitor ever has to be recognised. Nothing is
  sent from a file opened from disk, when the browser asks for Do Not Track or
  Global Privacy Control, or when the player switches **Anonymous stats** off
  in Settings. A **Privacy** note in the help card and in Settings says all of
  this to players, and says "sends nothing anywhere" when analytics is off.

The preview image and icon live in `build/assets/` (`card.jpg`, `icon-180.png`,
`icon.svg` — the last is inlined as the browser-tab icon). They were rendered
from the game's own board art; replace them with any files of the same names
and sizes.

## How it plays

- Each turn the dice are already thrown. A **green** die is one step for one
  critter; a **black** die is one slab for the cat.
- Before anything moves, the squares she is about to sweep turn **red**. She
  catches anything she lands on *or runs past* — her corner cuts sweep every
  square they skip.
- **Tap a critter** (on the board or on its button) to step it. Each critter has
  exactly one square it can go to, so a tap is the whole move. Yellow slabs are
  shortcuts and a critter takes its own automatically.
- A **treat** sends her straight back to her basket. One a turn, and only a few
  a garden.
- When your steps are spent she goes. If there is nothing for you to decide —
  no steps left, and no treat that would save anyone — she just goes.
- Every critter home is a **★**. Three stars is a perfect garden.

Keyboard: `1` `2` `3` step the mouse, squirrel, bird · `T` treat · `S` stay put.

Settings: three **themes** (meadow, dusk, autumn), sound, and *Reduce motion*.
Reduce motion is the player's own switch and is off by default — the game no
longer turns it on just because the operating system asks for reduced motion
(on Windows that is merely "Animation effects" being off, and it made the
pieces jump instead of walk). The system preference still quietens the purely
decorative effects.

## The daily garden

- Everyone gets **the same dice on the same date**. The seed is the date, and
  the roll for each turn depends only on the turn number, so what you do never
  changes what you are dealt.
- **One attempt.** The daily resumes where you left it and never restarts.
  Practice is unlimited, on fresh dice.
- **Biscuit's mood follows the week**, gentle on Monday and ravenous on Sunday:

  | days | mood | black die | treats |
  |---|---|---|---|
  | Mon, Tue | 😴 Sleepy | 40% | 3 |
  | Wed, Thu | 🙂 Peckish | 45% | 3 |
  | Fri, Sat | 😼 Hungry | 48% | 3 |
  | Sun | 😾 Starving | 52% | 3 |

- **Par** is what the computer scores on the same dice. It sees exactly what a
  player sees — this turn's dice and the red zone, never the dice to come — and
  tries every way to spend the turn, playing each one out on made-up dice. It is
  worked out on the device in a background worker — about half a second on a
  laptop — so it never takes frames from the animation, and it comes out
  identical everywhere.
- **Streak** counts consecutive days with a finished daily.
- **Sharing** gives a spoiler-free card:

  ```
  Scamper #1 😼 Hungry
  🐭🏠 🐿️🔒 🐦🔒
  ★☆☆ 1/3 saved · par 2 · 🔥3
  https://your-host/Scamper.html
  ```

  On a phone it opens the share sheet; on a computer it copies to the
  clipboard, or shows the text to copy if the browser will not.
- **Challenge a friend** from a practice garden: the link carries the seed, the
  mood and your score (`#c=seed.mood.score`), so your friend plays your exact
  dice and is told whether they beat you. Links need the game to be on a web
  host — a file opened from disk has no address worth sharing, so the link line
  is left off.

Everything is stored on the device (`localStorage`, keys starting `scamper_`).

## Names

Every name a player sees — the game, the cat, the tagline — is in `NAMES` at
the top of `src/graph.js`. "Scamper" and "Biscuit" are working titles.

## Files

```
Scamper.html        the game in one file — build output, for playing locally
site/               build output to upload: index.html, card.jpg, icon-180.png
index.html          dev entry (compiles JSX in the browser)
src/
  graph.js          the board: squares, cuts, homes, who may go where
  rules.js          turn flow, seeded dice, catches, treats, moods
  ai.js             the par player
  daily.js          daily seed, mood, streak, par cache, share text, challenge links
  sound.js          synthesised sound cues
  track.js          anonymous play counts (off unless configured)
  board.jsx         board art, red zone, next-step markers, cage
  pieces.jsx        pieces, motion engine, floating words
  hud.jsx           side panel, tips, help, settings, end card
  app.jsx           the game shell
  game.css fonts.css
build/
  config.json       launch settings: launch date, site address, analytics
  assets/           link-preview image and icons
  pack.js           builds Scamper.html and site/
  server.js         dev server
  balance-sim.js    balance harness
  shell.html        single-file loader
vendor/             react, react-dom, the JSX compiler (dev only), fonts
```

## Working on it

```bash
node build/server.js
```

Open <http://localhost:4321>. Edit anything in `src/` and refresh.

```bash
node build/pack.js
```

Rewrites `Scamper.html`. The JSX is compiled **at build time**, so the shipped
file carries no compiler; it uses React's **production** build (18.3.1, fetched
from cdnjs and checked against cdnjs's published SRI hashes); and only the
Latin subsets of the two fonts are included. The result is about **280 KB**,
down from 1.8 MB. `index.html` keeps the development builds for their error
messages.

```bash
node build/balance-sim.js [games] [par-games]
```

Plays every mood with three players — random taps, the AI's rule of thumb, and
the par AI — and prints the star spread for each.

## Balance

Average stars per garden, on the shipping settings:

| mood | random taps | rule of thumb | par AI | par AI: 3★ games |
|---|---|---|---|---|
| 😴 Sleepy | 0.15 | 2.30 | 2.45 | 55% |
| 🙂 Peckish | 0.07 | 1.78 | 2.08 | 25% |
| 😼 Hungry | 0.04 | 1.51 | 1.85 | 13% |
| 😾 Starving | 0.01 | 1.20 | 1.52 | 3% |

Two things to read from it. The ladder between random, rule of thumb and the
par AI is wide, so thinking is rewarded. And par walks down steadily through
the week, so Monday is a gentle start and Sunday is a real test.

Reliability: 20,000 random games with every invariant checked after every
action — no stall, no broken state, no critter ever left alive on the cat's
slab — and the dice and par come out identical for the same seed every time.

## Publishing on GitHub Pages

Everything is set up: `.github/workflows/pages.yml` builds the game and
publishes it on every push to `main`. GitHub tells the build the site's
address while it runs, so the link-preview image, icon and share links point
at the right place without anyone typing it in.

1. Create an empty **public** repository on GitHub (Pages is free for public
   repositories), for example `scamper`.
2. Push this folder to its `main` branch.
3. In the repository: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**. This is the only setting to change.
4. The **Actions** tab shows the publish running; when it finishes the game is
   live at `https://<your-username>.github.io/<repository>/`.

From then on, every push to `main` republishes. To set the launch date or turn
on analytics, edit `build/config.json` and push.

What is published: only the built `site/` folder — `index.html`, `card.jpg`,
`icon-180.png`, a `404.html` that sends stray links back to the game, and an
empty `.nojekyll`. What is in the repository: the source, the build tools and
`vendor/`. Build output, `reference/`, `attic/` and `NOTES.md` are listed in
`.gitignore` and never leave this computer.

A custom domain works too: add it under Settings → Pages, and the next publish
picks the new address up by itself.
