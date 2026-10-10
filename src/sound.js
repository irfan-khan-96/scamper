/* Scamper — a few synthesised cues. No audio files, no autoplay:
   the context is created on the first real interaction and stays suspended
   until then, so nothing plays before the player touches the board. */
(function () {
  let ctx = null, master = null, on = true;

  function ready() {
    if (!on) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { on = false; return null; }
      try { ctx = new AC(); } catch (e) { on = false; return null; }
      master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, t0, dur, type, peak, slideTo) {
    const c = ready(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak || 0.22, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(t0, dur, peak, hz, q) {
    const c = ready(); if (!c) return;
    const n = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = hz || 1400; f.Q.value = q || 1;
    const g = c.createGain(); g.gain.value = peak || 0.2;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  const CUES = {
    roll() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      for (let i = 0; i < 5; i++) noise(t + i * 0.07 + Math.random() * 0.02, 0.06, 0.16, 900 + Math.random() * 900, 2);
    },
    step() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      tone(560, t, 0.07, 'triangle', 0.1, 460);
    },
    dig() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      noise(t, 0.34, 0.13, 260, 0.8); tone(120, t, 0.3, 'sine', 0.1, 80);
    },
    fly() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      tone(680, t, 0.26, 'sine', 0.12, 1180);
      noise(t, 0.12, 0.05, 2600, 1.4);
    },
    climb() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      tone(420, t, 0.1, 'triangle', 0.1, 620); tone(620, t + 0.09, 0.12, 'triangle', 0.09, 820);
    },
    pounce() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      noise(t, 0.22, 0.3, 700, 0.7);
      tone(300, t, 0.28, 'sawtooth', 0.16, 90);
      tone(150, t + 0.04, 0.3, 'sine', 0.14, 60);
    },
    home() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.09, 0.28, 'triangle', 0.16));
    },
    treat() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      [880, 1174.66, 1567.98].forEach((f, i) => tone(f, t + i * 0.055, 0.2, 'sine', 0.12));
    },
    route() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      tone(740, t, 0.14, 'triangle', 0.12, 1100);
    },
    win() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.12, 0.5, 'triangle', 0.18));
    },
    lose() {
      const c = ready(); if (!c) return; const t = c.currentTime;
      [440, 392, 329.63, 261.63].forEach((f, i) => tone(f, t + i * 0.14, 0.5, 'sine', 0.17));
    },
  };

  window.Sound = {
    play(name) { if (!on) return; const f = CUES[name]; if (f) { try { f(); } catch (e) {} } },
    set enabled(v) { on = !!v; if (!v && ctx) { try { ctx.suspend(); } catch (e) {} } },
    get enabled() { return on; },
  };
})();
