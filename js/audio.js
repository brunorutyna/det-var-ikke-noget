/* =========================================================================
   AUDIO — generated ambient soundscapes per location (no files needed).
   Starts after the first tap (browsers require it). On by default.
   ========================================================================= */
const AUDIO = (() => {
  let ctx = null, master = null, cur = null, curName = null, on = true;
  try { on = localStorage.getItem('dvin3_amb') !== '0'; } catch (e) { }
  const FAST = /[?&]fast/.test(location.search);

  function init() {
    if (ctx || FAST) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = on ? .9 : 0; master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }
  function noiseBuf(type = 'brown', secs = 4) {
    const len = ctx.sampleRate * secs, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      else if (type === 'pink') { b0 = .997 * b0 + w * .029; b1 = .985 * b1 + w * .032; b2 = .95 * b2 + w * .048; d[i] = (b0 + b1 + b2 + w * .02) * .5; }
      else d[i] = w * .4;
    }
    return b;
  }
  function noise(type, freq, q, vol, out, ftype = 'lowpass') {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf(type); s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; f.Q.value = q || .7;
    const g = ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(out); s.start();
    return { s, f, g };
  }
  function lfo(param, rate, depth, out) {
    const o = ctx.createOscillator(); o.frequency.value = rate;
    const g = ctx.createGain(); g.gain.value = depth;
    o.connect(g); g.connect(param); o.start(); return o;
  }
  function drone(freqs, vol, out, type = 'sine') {
    return freqs.map((f, i) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = vol / freqs.length;
      lfo(o.frequency, .1 + i * .07, f * .004);
      lfo(g.gain, .05 + i * .03, vol / freqs.length * .5);
      o.connect(g); g.connect(out); o.start(); return o;
    });
  }
  // occasional events
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

  const SCAPES = {
    harbour(out, bag) {
      const w = noise('brown', 420, .7, .55, out); lfo(w.g.gain, .09, .3);
      noise('pink', 2400, .5, .04, out, 'highpass');
      every(5, 12, () => { blip(out, 1800, 1100, .35, 'triangle', .035); blip(out, 1700, 1000, .3, 'triangle', .03, .3); }, bag);
      every(9, 20, () => burst(out, 300, .5, .12, .5), bag);
    },
    ferry(out, bag) { SCAPES.harbour(out, bag); every(8, 16, () => blip(out, 90, 70, 2.4, 'sawtooth', .03), bag); },
    pier_night(out, bag) { const w = noise('brown', 300, .7, .4, out); lfo(w.g.gain, .07, .25); drone([196, 247, 294, 392], .05, out); },
    havmand(out, bag) { noise('brown', 260, .7, .35, out); drone([147, 196, 247, 294, 370], .09, out); every(4, 8, () => blip(out, 880, 1320, 2.5, 'sine', .015), bag); },
    office(out, bag) {
      noise('pink', 900, .6, .12, out); // rain on glass
      every(1, 1, () => burst(out, 3200, .03, .05, 8), bag); // clock
      every(7, 15, () => burst(out, 1200, .25, .04, 1), bag); // page turn
    },
    inn(out, bag) {
      noise('brown', 220, .7, .3, out);
      every(.08, .5, () => burst(out, 1500 + Math.random() * 2500, .03 + Math.random() * .05, .05 + Math.random() * .06, 2), bag); // crackle
      every(10, 20, () => blip(out, 180, 170, .6, 'triangle', .02), bag);
    },
    salt(out, bag) {
      const w = noise('pink', 600, .6, .2, out); lfo(w.f.frequency, .1, 300);
      every(3, 6, () => { burst(out, 900, .35, .1, 1.2); burst(out, 500, .2, .07, 1, .4); }, bag); // shovels
      every(6, 14, () => blip(out, 120, 90, .8, 'sawtooth', .02), bag); // beam creak
    },
    market(out, bag) {
      const m = noise('pink', 700, .9, .22, out, 'bandpass'); lfo(m.g.gain, .3, .08);
      every(6, 14, () => { blip(out, 1320, 1318, 1.2, 'sine', .03); blip(out, 1976, 1974, 1.0, 'sine', .015); }, bag); // bell
      every(4, 9, () => burst(out, 400, .15, .06, 2), bag); // cart
    },
    attic(out, bag) { noise('pink', 500, .7, .12, out); every(5, 11, () => blip(out, 150, 110, .5, 'triangle', .03), bag); every(8, 16, () => burst(out, 5000, .04, .04, 10), bag); },
    cellar(out, bag) { noise('brown', 180, .7, .16, out); every(2, 5, () => blip(out, 1400, 600, .15, 'sine', .05), bag); },
    street(out, bag) { const w = noise('pink', 700, .7, .22, out); lfo(w.f.frequency, .08, 300); every(3, 7, () => burst(out, 900, .06, .05, 3), bag); },
    house(out, bag) { noise('pink', 700, .6, .1, out); every(1.4, 1.4, () => burst(out, 2800, .02, .03, 8), bag); },
    moor(out, bag) {
      const w = noise('pink', 500, .6, .3, out); lfo(w.f.frequency, .06, 250);
      drone([55, 82.5], .06, out, 'triangle');
      every(2, 6, () => { const f = 120 + Math.random() * 60; blip(out, f, f * .8, .18, 'square', .025); blip(out, f, f * .8, .18, 'square', .02, .25); }, bag); // frogs
    },
    elverhoj(out, bag) { SCAPES.moor(out, bag); drone([440, 554, 659, 880], .035, out, 'triangle'); every(3, 6, () => blip(out, 1760, 1760, .6, 'sine', .02), bag); },
    map(out, bag) { noise('brown', 300, .7, .12, out); },
    cellar2(out, bag) { SCAPES.cellar(out, bag); },
  };

  function play(name) {
    init();
    if (!ctx || name === curName) return;
    curName = name;
    if (cur) { const old = cur; old.g.gain.setTargetAtTime(0, ctx.currentTime, .6); setTimeout(() => { old.stops.forEach(f => f()); try { old.g.disconnect(); } catch (e) { } }, 2500); }
    const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const bag = { stops: [], g };
    try { (SCAPES[name] || SCAPES.map)(g, bag); } catch (e) { }
    g.gain.setTargetAtTime(1, ctx.currentTime, .8);
    cur = bag;
  }
  function steps(n = 4) {
    init(); if (!ctx || !on) return;
    for (let i = 0; i < n; i++) burst(master, 260 + Math.random() * 80, .12, .22, 1.5, i * .38);
  }
  function sting(kind) {
    init(); if (!ctx || !on) return;
    if (kind === 'win') { blip(master, 523, 523, .5, 'triangle', .06); blip(master, 784, 784, .7, 'triangle', .05, .12); }
    if (kind === 'lose') { blip(master, 196, 150, .8, 'sawtooth', .04); }
    if (kind === 'dice') { for (let i = 0; i < 6; i++) burst(master, 2400, .04, .08, 6, i * .07); }
    if (kind === 'glimpse') { [523, 659, 784, 1047].forEach((f, i) => blip(master, f, f, 1.6, 'sine', .035, i * .14)); }
    if (kind === 'level') { [392, 523, 659].forEach((f, i) => blip(master, f, f, .5, 'triangle', .05, i * .1)); }
    if (kind === 'page') burst(master, 1400, .25, .08, 1);
    if (kind === 'coin') { blip(master, 2100, 2100, .15, 'sine', .05); blip(master, 2600, 2600, .2, 'sine', .04, .08); }
  }
  function setOn(v) {
    on = v; try { localStorage.setItem('dvin3_amb', v ? '1' : '0'); } catch (e) { }
    init(); if (master) master.gain.setTargetAtTime(v ? .9 : 0, ctx.currentTime, .3);
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }
  function resume() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
  return { play, steps, sting, setOn, resume, get on() { return on; } };
})();
