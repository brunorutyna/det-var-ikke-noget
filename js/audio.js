/* =========================================================================
   AUDIO — everything generated in the browser (no files):
   · music: a small generative folk/modal composer, one theme per place
   · ambience: sea, fire, rain, wind… per place
   · effects: dice, coins, pages, footsteps…
   Each has its own volume + on/off, saved in SETTINGS. Starts after the first tap.
   ========================================================================= */
const SETTINGS = (() => {
  const d = { music: .55, amb: .7, sfx: .8, voice: 1, musicOn: true, ambOn: true, sfxOn: true, voiceOn: true, motion: true };
  let s = d;
  try { s = Object.assign({}, d, JSON.parse(localStorage.getItem('dvin3_settings') || '{}')); } catch (e) { }
  s.save = () => { try { const c = Object.assign({}, s); delete c.save; localStorage.setItem('dvin3_settings', JSON.stringify(c)); } catch (e) { } };
  return s;
})();

const AUDIO = (() => {
  const FAST = /[?&]fast/.test(location.search);
  let ctx = null, master, bus = {}, curAmb = null, ambName = null, theme = null, themeName = null, timer = null;

  function init() {
    if (ctx || FAST) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = .9;
      // gentle reverb for music: a feedback delay network is enough
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
      master.connect(comp); comp.connect(ctx.destination);
      ['music', 'amb', 'sfx'].forEach(k => { bus[k] = ctx.createGain(); bus[k].connect(master); });
      const rv = reverb(); bus.music.connect(rv.in); rv.out.connect(master);
      applyVolumes();
    } catch (e) { ctx = null; }
  }
  function reverb() {
    const inp = ctx.createGain(), out = ctx.createGain(); out.gain.value = .35;
    [.083, .127, .171, .229].forEach((t, i) => {
      const d = ctx.createDelay(1); d.delayTime.value = t;
      const fb = ctx.createGain(); fb.gain.value = .55 - i * .05;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
      inp.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(out);
    });
    return { in: inp, out };
  }
  function applyVolumes() {
    if (!ctx) return;
    const t = ctx.currentTime;
    bus.music.gain.setTargetAtTime(SETTINGS.musicOn ? SETTINGS.music * .55 : 0, t, .3);
    bus.amb.gain.setTargetAtTime(SETTINGS.ambOn ? SETTINGS.amb : 0, t, .3);
    bus.sfx.gain.setTargetAtTime(SETTINGS.sfxOn ? SETTINGS.sfx : 0, t, .1);
  }

  /* ---------- building blocks ---------- */
  const bufCache = {};
  function noiseBuf(type = 'brown', secs = 4) {
    const key = type + secs; if (bufCache[key]) return bufCache[key];
    const len = ctx.sampleRate * secs, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      else if (type === 'pink') { b0 = .997 * b0 + w * .029; b1 = .985 * b1 + w * .032; b2 = .95 * b2 + w * .048; d[i] = (b0 + b1 + b2 + w * .02) * .5; }
      else d[i] = w * .4;
    }
    return bufCache[key] = b;
  }
  function noise(type, freq, q, vol, out, ftype = 'lowpass') {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf(type); s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; f.Q.value = q || .7;
    const g = ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(out); s.start();
    return { s, f, g };
  }
  function lfo(param, rate, depth) { const o = ctx.createOscillator(); o.frequency.value = rate; const g = ctx.createGain(); g.gain.value = depth; o.connect(g); g.connect(param); o.start(); return o; }
  function drone(freqs, vol, out, type = 'sine') {
    return freqs.map((f, i) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = vol / freqs.length; lfo(o.frequency, .1 + i * .07, f * .004); lfo(g.gain, .05 + i * .03, vol / freqs.length * .5); o.connect(g); g.connect(out); o.start(); return o; });
  }
  function every(min, max, fn, bag) {
    let alive = true;
    const tick = () => { if (!alive) return; try { fn(); } catch (e) { } bag.t = setTimeout(tick, (min + Math.random() * (max - min)) * 1000); };
    bag.t = setTimeout(tick, (min + Math.random() * (max - min)) * 500);
    bag.stops.push(() => { alive = false; clearTimeout(bag.t); });
  }
  function blip(out, f0, f1, dur, type = 'sine', vol = .1, delay = 0) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
  }
  function burst(out, freq, dur, vol, q = 1, delay = 0) {
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf('white', .3);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + .05);
  }

  /* ---------- ambience ---------- */
  const SCAPES = {
    harbour(out, bag) { const w = noise('brown', 420, .7, .55, out); lfo(w.g.gain, .09, .3); noise('pink', 2400, .5, .04, out, 'highpass'); every(5, 12, () => { blip(out, 1800, 1100, .35, 'triangle', .035); blip(out, 1700, 1000, .3, 'triangle', .03, .3); }, bag); every(9, 20, () => burst(out, 300, .5, .12, .5), bag); },
    ferry(out, bag) { SCAPES.harbour(out, bag); every(8, 16, () => blip(out, 90, 70, 2.4, 'sawtooth', .03), bag); },
    pier_night(out, bag) { const w = noise('brown', 300, .7, .4, out); lfo(w.g.gain, .07, .25); },
    havmand(out, bag) { noise('brown', 260, .7, .35, out); every(4, 8, () => blip(out, 880, 1320, 2.5, 'sine', .015), bag); },
    office(out, bag) { noise('pink', 900, .6, .12, out); every(1, 1, () => burst(out, 3200, .03, .05, 8), bag); every(7, 15, () => burst(out, 1200, .25, .04, 1), bag); },
    inn(out, bag) { noise('brown', 220, .7, .3, out); every(.08, .5, () => burst(out, 1500 + Math.random() * 2500, .03 + Math.random() * .05, .05 + Math.random() * .06, 2), bag); },
    salt(out, bag) { const w = noise('pink', 600, .6, .2, out); lfo(w.f.frequency, .1, 300); every(3, 6, () => { burst(out, 900, .35, .1, 1.2); burst(out, 500, .2, .07, 1, .4); }, bag); every(6, 14, () => blip(out, 120, 90, .8, 'sawtooth', .02), bag); },
    market(out, bag) { const m = noise('pink', 700, .9, .22, out, 'bandpass'); lfo(m.g.gain, .3, .08); every(6, 14, () => { blip(out, 1320, 1318, 1.2, 'sine', .03); blip(out, 1976, 1974, 1.0, 'sine', .015); }, bag); every(4, 9, () => burst(out, 400, .15, .06, 2), bag); },
    attic(out, bag) { noise('pink', 500, .7, .12, out); every(5, 11, () => blip(out, 150, 110, .5, 'triangle', .03), bag); every(8, 16, () => burst(out, 5000, .04, .04, 10), bag); },
    cellar(out, bag) { noise('brown', 180, .7, .16, out); every(2, 5, () => blip(out, 1400, 600, .15, 'sine', .05), bag); },
    street(out, bag) { const w = noise('pink', 700, .7, .22, out); lfo(w.f.frequency, .08, 300); every(3, 7, () => burst(out, 900, .06, .05, 3), bag); },
    house(out, bag) { noise('pink', 700, .6, .1, out); every(1.4, 1.4, () => burst(out, 2800, .02, .03, 8), bag); },
    moor(out, bag) { const w = noise('pink', 500, .6, .3, out); lfo(w.f.frequency, .06, 250); every(2, 6, () => { const f = 120 + Math.random() * 60; blip(out, f, f * .8, .18, 'square', .025); blip(out, f, f * .8, .18, 'square', .02, .25); }, bag); },
    elverhoj(out, bag) { SCAPES.moor(out, bag); },
    map(out, bag) { noise('brown', 300, .7, .1, out); },
  };
  function playAmb(name) {
    if (name === ambName) return; ambName = name;
    if (curAmb) { const old = curAmb; old.g.gain.setTargetAtTime(0, ctx.currentTime, .6); setTimeout(() => { old.stops.forEach(f => f()); try { old.g.disconnect(); } catch (e) { } }, 2500); }
    const g = ctx.createGain(); g.gain.value = 0; g.connect(bus.amb);
    const bag = { stops: [], g };
    try { (SCAPES[name] || SCAPES.map)(g, bag); } catch (e) { }
    g.gain.setTargetAtTime(1, ctx.currentTime, .8);
    curAmb = bag;
  }

  /* ---------- music: instruments ---------- */
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function env(g, t, a, peak, dur, rel) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(0, t + dur, rel); }
  const INST = {
    pluck(out, f, t, d, v = .18) { // lute / harp
      [[1, 'triangle', 1], [2, 'sine', .35], [3, 'sine', .12]].forEach(([m, ty, a]) => { const o = ctx.createOscillator(); o.type = ty; o.frequency.value = f * m; const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.6, d * 1.6)); o.connect(g); g.connect(out); o.start(t); o.stop(t + d * 1.6 + .7); });
    },
    harpsi(out, f, t, d, v = .1) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const hp = ctx.createBiquadFilter(); hp.type = 'lowpass'; hp.frequency.setValueAtTime(5000, t); hp.frequency.exponentialRampToValueAtTime(600, t + .5); const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .9); o.connect(hp); hp.connect(g); g.connect(out); o.start(t); o.stop(t + 1); },
    box(out, f, t, d, v = .09) { // music box
      [[1, .9], [2.76, .25], [5.4, .08]].forEach(([m, a]) => { const o = ctx.createOscillator(); o.frequency.value = f * m * (1 + (Math.random() - .5) * .004); const g = ctx.createGain(); g.gain.setValueAtTime(v * a, t); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6); o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.7); });
    },
    fiddle(out, f, t, d, v = .07, detune = 0) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * (1 + detune);
      const vib = ctx.createOscillator(); vib.frequency.value = 5.4; const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .006, t + Math.min(.4, d * .6)); vib.connect(vg); vg.connect(o.frequency);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 2;
      const bp = ctx.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = 1100; bp.gain.value = 6;
      const g = ctx.createGain(); env(g, t, .06, v, d, .08);
      o.connect(lp); lp.connect(bp); bp.connect(g); g.connect(out); o.start(t); vib.start(t); o.stop(t + d + .6); vib.stop(t + d + .6);
    },
    reed(out, f, t, d, v = .05) { // accordion-ish
      [0, .004].forEach(dt => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f * (1 + dt); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; const g = ctx.createGain(); env(g, t, .05, v, d, .1); o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + d + .6); });
    },
    pad(out, f, t, d, v = .045) {
      [-.006, 0, .006].forEach(dt => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * (1 + dt); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; const g = ctx.createGain(); env(g, t, Math.min(1.2, d * .4), v, d, .8); o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + d + 3); });
    },
    choir(out, f, t, d, v = .05) {
      [0, -.004, .004].forEach(dt => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * (1 + dt); const vib = ctx.createOscillator(); vib.frequency.value = 4.8; const vg = ctx.createGain(); vg.gain.value = f * .004; vib.connect(vg); vg.connect(o.frequency);
        const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 700; f1.Q.value = 5; const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1150; f2.Q.value = 6;
        const g = ctx.createGain(); env(g, t, Math.min(1, d * .4), v * 2.2, d, .9); o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(out); o.start(t); vib.start(t); o.stop(t + d + 3); vib.stop(t + d + 3); });
    },
    cello(out, f, t, d, v = .06) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; const g = ctx.createGain(); env(g, t, .25, v, d, .4); o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + d + 2); },
    bell(out, f, t, d, v = .05) { [[1, 1], [2.4, .4], [4.1, .2]].forEach(([m, a]) => { const o = ctx.createOscillator(); o.frequency.value = f * m; const g = ctx.createGain(); g.gain.setValueAtTime(v * a, t); g.gain.exponentialRampToValueAtTime(.0001, t + 3); o.connect(g); g.connect(out); o.start(t); o.stop(t + 3.1); }); },
  };

  /* ---------- music: themes ----------
     root (MIDI), mode (scale steps), bpm, beats per bar, prog (scale degrees, one per bar),
     chord/bass/mel instruments, density (0..1 chance of a melody note per step), steps per beat */
  const DOR = [0, 2, 3, 5, 7, 9, 10], AEO = [0, 2, 3, 5, 7, 8, 10], MIX = [0, 2, 4, 5, 7, 9, 10], ION = [0, 2, 4, 5, 7, 9, 11], PHR = [0, 1, 3, 5, 7, 8, 10], HARM = [0, 2, 3, 5, 7, 8, 11], LYD = [0, 2, 4, 6, 7, 9, 11];
  const THEMES = {
    title:   { root: 50, mode: DOR, bpm: 62, beats: 4, prog: [0, 6, 5, 0, 3, 6, 4, 0], chord: 'pad', bass: 'cello', mel: 'fiddle', density: .35, sub: 1, oct: 12 },
    map:     { root: 50, mode: DOR, bpm: 76, beats: 4, prog: [0, 3, 6, 0], chord: null, bass: 'cello', mel: 'pluck', density: .5, sub: 2, oct: 12 },
    harbour: { root: 45, mode: AEO, bpm: 66, beats: 6, prog: [0, 5, 6, 0, 3, 5, 4, 0], chord: 'reed', bass: 'cello', mel: 'reed', density: .45, sub: 1, oct: 12, chordVol: .025 },
    inn:     { root: 53, mode: ION, bpm: 84, beats: 3, prog: [0, 3, 4, 0, 5, 3, 4, 0], chord: 'pluck', bass: 'pluck', mel: 'box', density: .55, sub: 1, oct: 24, arp: true },
    office:  { root: 48, mode: AEO, bpm: 56, beats: 4, prog: [0, 5, 3, 4], chord: null, bass: 'cello', mel: 'harpsi', density: .18, sub: 1, oct: 12 },
    salt:    { root: 38, mode: PHR, bpm: 52, beats: 4, prog: [0, 1, 0, 6], chord: 'cello', bass: 'cello', mel: 'pluck', density: .2, sub: 1, oct: 24 },
    market:  { root: 55, mode: MIX, bpm: 108, beats: 6, prog: [0, 0, 6, 0, 0, 3, 6, 4], chord: 'pluck', bass: 'pluck', mel: 'fiddle', density: .8, sub: 1, oct: 12, jig: true },
    attic:   { root: 57, mode: AEO, bpm: 70, beats: 3, prog: [0, 5, 3, 4], chord: null, bass: null, mel: 'box', density: .4, sub: 1, oct: 12, detune: true },
    cellar:  { root: 50, mode: HARM, bpm: 72, beats: 4, prog: [0, 3, 4, 0, 5, 1, 4, 0], chord: 'harpsi', bass: 'cello', mel: 'harpsi', density: .45, sub: 2, oct: 12, arp: true },
    street:  { root: 47, mode: AEO, bpm: 60, beats: 4, prog: [0, 6, 5, 6], chord: 'pad', bass: null, mel: 'pluck', density: .2, sub: 1, oct: 12 },
    house:   { root: 52, mode: ION, bpm: 58, beats: 3, prog: [0, 4, 5, 3], chord: 'pad', bass: null, mel: 'box', density: .35, sub: 1, oct: 12 },
    moor:    { root: 40, mode: LYD, bpm: 48, beats: 4, prog: [0, 1, 0, 6], chord: 'pad', bass: 'cello', mel: 'fiddle', density: .22, sub: 1, oct: 24, detune: true },
    elverhoj:{ root: 52, mode: DOR, bpm: 132, beats: 3, prog: [0, 6, 0, 4, 0, 6, 3, 4], chord: null, bass: 'pluck', mel: 'fiddle', density: .95, sub: 1, oct: 12, detune: true, jig: true },
    pier_night: { root: 45, mode: AEO, bpm: 50, beats: 4, prog: [0, 5, 2, 6], chord: 'choir', bass: 'cello', mel: null, density: 0, sub: 1, oct: 12, song: true },
    havmand: { root: 45, mode: AEO, bpm: 50, beats: 4, prog: [0, 5, 2, 6], chord: 'choir', bass: 'cello', mel: 'bell', density: .3, sub: 1, oct: 24, song: true },
  };
  THEMES.ferry = THEMES.harbour;
  // "Når lysene tændes, så kommer vi hjem" — the Thursday song (scale degrees, beats)
  const SONG = [[4, 1], [4, .5], [5, .5], [4, 1], [2, 1], [3, 1], [2, .5], [1, .5], [0, 2], [0, 1], [2, 1], [4, 1.5], [5, .5], [4, 1], [3, 1], [2, 1], [1, 1], [0, 2], [-1, 2]];

  function deg(T, d, octave = 0) { const n = T.mode.length; const o = Math.floor(d / n); const i = ((d % n) + n) % n; return T.root + T.mode[i] + 12 * (o + octave); }

  function startTheme(name) {
    const T = THEMES[name] || THEMES.map;
    if (theme === T) return; theme = T; themeName = name;
    if (timer) clearInterval(timer);
    const out = ctx.createGain(); out.gain.value = 0; out.connect(bus.music); out.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
    const prev = startTheme.out; if (prev) { prev.gain.setTargetAtTime(0, ctx.currentTime, .8); setTimeout(() => { try { prev.disconnect(); } catch (e) { } }, 4000); }
    startTheme.out = out;
    const spb = 60 / T.bpm, step = spb / (T.sub || 1);
    let next = ctx.currentTime + .3, n = 0, mel = 4, songI = 0, songT = 0;
    const stepsPerBar = T.beats * (T.sub || 1);
    timer = setInterval(() => {
      if (!ctx || ctx.state !== 'running') return;
      while (next < ctx.currentTime + .25) {
        const bar = Math.floor(n / stepsPerBar), inBar = n % stepsPerBar, beat = inBar / (T.sub || 1);
        const ch = T.prog[bar % T.prog.length];
        const det = T.detune ? (Math.random() - .5) * .012 : 0;
        // chord at bar start (or arpeggio)
        if (T.chord && inBar === 0 && !T.arp) [0, 2, 4].forEach(k => INST[T.chord](out, mtof(deg(T, ch + k)), next, spb * T.beats * .98, T.chordVol));
        if (T.arp && T.chord && Number.isInteger(beat)) INST[T.chord](out, mtof(deg(T, ch + [0, 2, 4, 7][beat % 4] + (beat >= 3 ? 0 : 0))), next, spb, .08);
        // bass
        if (T.bass && inBar === 0) INST[T.bass](out, mtof(deg(T, ch, -1)), next, spb * T.beats * .9, .07);
        if (T.bass && T.jig && inBar === T.beats / 2 * (T.sub || 1) && T.beats % 2 === 0) INST[T.bass](out, mtof(deg(T, ch + 4, -1)), next, spb * 1.5, .05);
        // the Thursday song
        if (T.song) {
          if (songT <= 0) { const [d, len] = SONG[songI % SONG.length]; songI++; songT = len; if (d > -1) INST.choir(out, mtof(deg(T, d, 1)), next, spb * len * .95, .05); }
          songT -= 1 / (T.sub || 1);
        }
        // melody: random walk on the scale, pulled toward chord tones, phrases rest every 4 bars
        if (T.mel && !(bar % 4 === 3 && inBar > stepsPerBar / 2)) {
          const strong = inBar === 0 || (T.jig && inBar % 3 === 0);
          if (Math.random() < T.density * (strong ? 1.3 : .8)) {
            mel += pick([-2, -1, -1, 0, 1, 1, 2, strong ? 0 : 3]);
            if (strong && Math.random() < .5) { const ct = [ch, ch + 2, ch + 4, ch + 7]; mel = ct.reduce((a, b) => Math.abs(b - mel) < Math.abs(a - mel) ? b : a); }
            mel = Math.max(-1, Math.min(11, mel));
            const len = T.jig ? step * (Math.random() < .3 ? 2 : 1) : step * (Math.random() < .4 ? 2 : 1);
            INST[T.mel](out, mtof(deg(T, mel) + T.oct), next, len * .95, undefined, det);
          }
        }
        next += step; n++;
      }
    }, 40);
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- public ---------- */
  function play(name) {
    init(); if (!ctx) return;
    playAmb(name);
    startTheme(name);
  }
  function steps(n = 4) { init(); if (!ctx) return; for (let i = 0; i < n; i++) burst(bus.sfx, 260 + Math.random() * 80, .12, .22, 1.5, i * .38); }
  function sting(kind) {
    init(); if (!ctx) return; const o = bus.sfx;
    if (kind === 'win') { blip(o, 523, 523, .5, 'triangle', .06); blip(o, 784, 784, .7, 'triangle', .05, .12); }
    if (kind === 'lose') blip(o, 196, 150, .8, 'sawtooth', .04);
    if (kind === 'dice') for (let i = 0; i < 6; i++) burst(o, 2400, .04, .08, 6, i * .07);
    if (kind === 'glimpse') [523, 659, 784, 1047].forEach((f, i) => blip(o, f, f, 1.6, 'sine', .035, i * .14));
    if (kind === 'level') [392, 523, 659].forEach((f, i) => blip(o, f, f, .5, 'triangle', .05, i * .1));
    if (kind === 'page') burst(o, 1400, .25, .08, 1);
    if (kind === 'coin') { blip(o, 2100, 2100, .15, 'sine', .05); blip(o, 2600, 2600, .2, 'sine', .04, .08); }
    if (kind === 'tick') burst(o, 3000, .03, .05, 6);
    if (kind === 'night') { [392, 330, 262].forEach((f, i) => blip(o, f, f, 1.4, 'sine', .03, i * .35)); blip(o, 430, 390, .3, 'sine', .025, 1.3); blip(o, 430, 380, .55, 'sine', .025, 1.7); }
    if (kind === 'dawn') [262, 330, 392, 523].forEach((f, i) => blip(o, f, f, 1.2, 'sine', .028, i * .2));
    if (kind === 'bell') { blip(o, 196, 196, 2.6, 'sine', .05); blip(o, 494, 494, 1.8, 'sine', .018); blip(o, 196, 196, 2.6, 'sine', .04, 1.1); blip(o, 494, 494, 1.8, 'sine', .014, 1.1); }
  }
  function resume() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function set(k, v) { SETTINGS[k] = v; SETTINGS.save(); applyVolumes(); }
  return { play, steps, sting, resume, set, applyVolumes, get on() { return SETTINGS.ambOn || SETTINGS.musicOn; }, setOn(v) { set('ambOn', v); set('musicOn', v); } };
})();
