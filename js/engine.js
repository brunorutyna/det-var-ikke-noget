/* =========================================================================
   DET VAR IKKE NOGET — engine (v3: city, contracts, skills by use, vocabulary)
   ========================================================================= */
window.__dev = {};
const KEY = 'dvin3_save', META_KEY = 'dvin3_meta';
const $ = s => document.querySelector(s);
const FAST = /[?&]fast/.test(location.search);
const sleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NAMES = ['Margrethe', 'Kjeld', 'Bramsen', 'Hjørdis', 'Ib', 'Poul', 'Inger', 'Jens', 'Aksel', 'Vandmark', 'Anker', 'Tomás', 'Tue', 'Anders', 'Karen', 'Maren', 'Leo'];
const PHASES = ['Morgen', 'Eftermiddag', 'Aften', 'Nat'];
const MOD_CAP = 7; // skill + all bonuses never exceed +7: a natural roll always matters
const S = () => SESSIONS[(G && G.sess) || 'k1l1'];
const special = k => (S().special && S().special[k]) || SPECIAL[k]; // a lesson can add or override specials

/* ---------------- Danish voice (on by default) ---------------- */
const TTS = {
  ok: 'speechSynthesis' in window, voice: null,
  get on() { return SETTINGS.voiceOn; },
  init() { if (!this.ok) return; const p = () => { this.voice = speechSynthesis.getVoices().find(v => /^da/i.test(v.lang)) || null; }; p(); speechSynthesis.onvoiceschanged = p; },
  // you: the player's own line. The next line (usually the answer) waits for it instead of cutting it off.
  say(t, force, you) {
    if (!this.ok || FAST || (!SETTINGS.voiceOn && !force)) return;
    try {
      const keep = !force && this.you && speechSynthesis.speaking;
      if (!keep) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t.replace(/[“”…]/g, '')); u.lang = 'da-DK'; if (this.voice) u.voice = this.voice; u.rate = SETTINGS.rate || .9; u.volume = Math.max(.05, SETTINGS.voice);
      this.you = !!you; if (you) { this.youDone = new Promise(r => { u.onend = u.onerror = r; setTimeout(r, 900 + t.length * 90); }); }
      speechSynthesis.speak(u);
    } catch (e) { }
  },
  // give the player's line a moment to be heard before the answer appears (never more than a few seconds)
  waitYou() { return this.ok && !FAST && SETTINGS.voiceOn && this.you && this.youDone ? Promise.race([this.youDone, sleep(3500)]) : sleep(400); },
};

/* ---------------- state ---------------- */
let G = null;
let META = (() => { try { return Object.assign({ vocab: {}, words: {}, runs: 0 }, JSON.parse(localStorage.getItem(META_KEY) || '{}')); } catch (e) { return { vocab: {}, words: {}, runs: 0 }; } })();
const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) { } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { } };
function newGame(sess = 'k1l1', from = null) {
  G = { sess, day: 1, phase: 2, sk: 6, resp: 0, insp: 1, statXP: { SPROG: 0, LOEGN: 0, SNIGE: 0, HANDEL: 0, INDSIGT: 0 }, flags: {}, prev: {}, origin: {}, glimpses: [], boons: [], quests: [], used: {},
    node: null, loc: 'pension', travelDone: [], today: [], log: { built: 0, perfect: 0, rolls: 0, wins: 0, eng: 0, words: 0 }, bg: null };
  const st = SESSIONS[sess].startState;
  if (from) { // continue with the character from the previous lesson
    ['statXP', 'resp', 'sk', 'boons', 'origin', 'day'].forEach(k => G[k] = JSON.parse(JSON.stringify(from[k])));
    G.insp = Math.max(1, from.insp); G.prev = Object.assign({}, from.prev, from.carried || {}); G.prevGlimpses = (from.prevGlimpses || 0) + (from.glimpses || []).length;
    if (st) G.phase = st.phase;
  } else if (st) Object.assign(G, JSON.parse(JSON.stringify(st)));
  if (st && st.loc) G.loc = st.loc;
  Object.keys(G.prev).forEach(f => { if (/Room$/.test(f)) G.flags[f] = true; }); // Hjørdis remembers the rent
}
// the character as it leaves a lesson (kept for the next one)
function carryOut() {
  const c = JSON.parse(JSON.stringify(G)); c.carried = {};
  (S().carryFlags || []).forEach(f => { if (G.flags[f]) c.carried[f] = true; });
  return c;
}
const tierName = (g = G) => { let t = TIERS[0][1]; for (const [m, n] of TIERS) if (g.resp >= m) t = n; return t; };
const lvl = st => STAT_STEPS.filter(t => G.statXP[st] >= t).length;
const hasBoon = b => G.boons.includes(b);
function statGain(st, n) {
  if (!st || !n) return;
  const before = lvl(st); G.statXP[st] += n;
  if (lvl(st) > before) { toast(`${STATS[st].name} ↑ ${lvl(st)}`, 'gold'); AUDIO.sting('level'); }
}
function addWord(key) {
  if (!VOCAB[key]) return;
  if (!G.today.includes(key)) G.today.push(key);
  const v = META.vocab[key] = META.vocab[key] || { box: 0, seen: 0 }; v.seen++;
  if (v.seen === 1) G.log.words++;
  saveMeta();
}
function fx(f) {
  if (!f) return;
  if (f.sk) { let n = f.sk; if (n >= 20 && G.flags.cheap && !G.flags.cheapApplied) { n -= 10; G.flags.cheapApplied = 1; } if (n >= 20 && G.flags.guard && !G.flags.guardApplied) { n += 10; G.flags.guardApplied = 1; } G.sk = Math.max(0, G.sk + n); toast(`${n > 0 ? '+' : ''}${n} skilling`, n > 0 ? 'gold' : 'bad'); if (n > 0) AUDIO.sting('coin'); }
  if (f.resp) { G.resp += f.resp; toast(`${f.resp > 0 ? '+' : ''}${f.resp} anseelse`, f.resp > 0 ? 'good' : 'bad'); }
  if (f.insp) { G.insp = Math.max(0, G.insp + f.insp); toast(`${f.insp > 0 ? '+' : ''}${f.insp} inspiration ✦`, 'gold'); }
  if (f.flag) G.flags[f.flag] = true;
  if (f.origin) Object.assign(G.origin, f.origin);
  if (f.boon && !hasBoon(f.boon)) { G.boons.push(f.boon); toast(`${BOONS[f.boon].name}: ${BOONS[f.boon].fx}`, 'gold'); AUDIO.sting('level'); }
  if (f.quest) { const nu = [].concat(f.quest).filter(q => !G.quests.includes(q)); nu.forEach(q => G.quests.push(q)); if (nu.length) toast(`${nu.length > 1 ? 'Nye kontrakter' : 'Ny kontrakt'}: ${nu.map(q => S().quests[q].title).join(' · ')}`, 'gold'); }
  hud();
}

/* ---------------- chrome ---------------- */
function hud() {
  const h = $('#hud');
  if (!G) { h.innerHTML = ''; return; }
  h.innerHTML = `<div class="h-l"><b>${esc(tierName())}</b><small>Dag ${G.day} · ${PHASES[G.phase]}</small></div>
    <div class="h-r"><span>${G.sk} sk</span><span class="insp">✦ ${G.insp}</span><button class="ib" id="bJ" aria-label="Dagbog">☰</button></div>`;
  $('#bJ').onclick = journal;
}
function toast(m, c = '') { const t = document.createElement('div'); t.className = 'toast ' + c; t.textContent = m; $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), FAST ? 30 : 2300); setTimeout(() => t.remove(), FAST ? 60 : 2900); }

function daHTML(s) { return esc(s).replace(/([A-Za-zÆØÅæøåáéüöÉÁ]+)/g, w => `<span class="w" data-w="${w.toLowerCase()}">${w}</span>`); }
function wireWords(el, longpress) {
  el.querySelectorAll('.w').forEach(sp => {
    if (!longpress) { sp.onclick = e => { e.stopPropagation(); showGloss(sp); }; return; }
    // inside buttons: a normal tap selects the button, a long-press shows the meaning
    let t = null, fired = false;
    sp.addEventListener('pointerdown', () => { fired = false; t = setTimeout(() => { fired = true; showGloss(sp); }, 420); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => sp.addEventListener(ev, () => clearTimeout(t)));
    sp.addEventListener('click', e => { if (fired) { e.stopPropagation(); e.preventDefault(); fired = false; } });
    sp.addEventListener('contextmenu', e => e.preventDefault());
  });
}
function showGloss(sp) {
  {
    document.querySelectorAll('.gloss').forEach(g => g.remove());
    const w = sp.dataset.w, en = DICT[w] || (NAMES.includes(sp.textContent) ? '(a name)' : '—');
    META.words[w] = (META.words[w] || 0) + 1; saveMeta();
    const g = document.createElement('div'); g.className = 'gloss'; g.innerHTML = `<b>${esc(sp.textContent)}</b> ${esc(en)}`;
    document.body.appendChild(g);
    const r = sp.getBoundingClientRect();
    g.style.left = Math.max(8, Math.min(innerWidth - g.offsetWidth - 8, r.left + r.width / 2 - g.offsetWidth / 2)) + 'px';
    g.style.top = Math.max(8, r.top - g.offsetHeight - 6) + 'px';
    sp.classList.add('seen');
    TTS.say(sp.textContent);
    setTimeout(() => g.remove(), 2600);
  }
}
document.addEventListener('click', () => { document.querySelectorAll('.gloss').forEach(g => g.remove()); AUDIO.resume(); });

/* ---------------- transitions ---------------- */
async function card(title, sub, steps = true) {
  if (FAST) return;
  if (!SETTINGS.motion) { if (steps) AUDIO.steps(2); return; }
  const ov = document.createElement('div'); ov.className = 'tcard';
  ov.innerHTML = `<div class="tc-fog"></div><div class="tc-in">${phaseDial ? phaseDial : ''}<div class="tc-t">${esc(title)}</div>${sub ? `<div class="tc-s">${esc(sub)}</div>` : ''}</div>`;
  document.body.appendChild(ov);
  if (steps) AUDIO.steps(4);
  await sleep(phaseDial ? 1900 : 1500);
  holdOverlay(ov); // stays up until the next scene is drawn underneath, then fades
}
// a transition overlay is kept until the next scene has been drawn behind it, so it never fades back to the old screen
let heldOv = null, heldT = null;
function holdOverlay(ov) { releaseOverlay(); heldOv = ov; heldT = setTimeout(releaseOverlay, 1400); }
function releaseOverlay() {
  clearTimeout(heldT); const ov = heldOv; heldOv = null; if (!ov) return;
  requestAnimationFrame(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 650); });
}
/* small sun/moon arc on a location card when the time of day moved on */
let phaseDial = '';
function dialHTML(from, to) {
  const pos = p => { const t = .12 + p * .253, u = 1 - t; return [8 * u * u + 100 * t * u + 92 * t * t, 32 * u * u - 20 * t * u + 32 * t * t]; }; // morning … night along the arc
  const [x0, y0] = pos(from), [x1, y1] = pos(to);
  const body = to >= 3 ? '<circle r="5" fill="#d8dcc8"/><circle r="5" cx="2.4" cy="-1.4" fill="#0b0d10"/>' : `<circle r="5" fill="${to >= 2 ? '#d98a4a' : '#e8d9a0'}"/>`;
  return `<div class="dial ph${to}"><svg viewBox="0 0 100 36"><path d="M8 32 Q50 -10 92 32" class="d-arc"/>${PHASES.map((p, i) => { const [x, y] = pos(i); return `<circle cx="${x}" cy="${y}" r="1.3" class="d-dot ${i <= to ? 'on' : ''}"/>`; }).join('')}
    <g class="d-body" style="--x0:${x0}px;--y0:${y0}px;--x1:${x1}px;--y1:${y1}px">${body}</g></svg>
    <div class="d-lab"><s>${PHASES[from]}</s> → <b>${PHASES[to]}</b></div></div>`;
}

/* time passing: night falls, a night goes by, dawn, or several days */
const SKY = { night: ['#2a3340', '#0a0e18', '#05070d', '#3a4350'], dusk: ['#3c4148', '#6a4632', '#141a26'], dawn: ['#05070d', '#1d2533', '#5a5560'], days: ['#141a26', '#4a4c50', '#0a0e18', '#4a4c50', '#141a26'] };
async function passTime(kind, title, sub) {
  if (FAST) return;
  AUDIO.sting(kind === 'dawn' ? 'dawn' : kind === 'days' ? 'bell' : 'night');
  if (!SETTINGS.motion) { if (title) toast(title + (sub ? ' · ' + sub : ''), 'gold'); return; }
  const dur = { night: 3600, dusk: 2600, dawn: 2600, days: 3800 }[kind] || 3000;
  const ov = document.createElement('div'); ov.className = `tpass k-${kind}`; ov.style.setProperty('--dur', dur + 'ms');
  const stars = Array.from({ length: 40 }, () => `<i style="left:${Math.random() * 100}%;top:${Math.random() * 55}%;animation-delay:${Math.random() * 2}s"></i>`).join('');
  const roofs = 'M0 100 V78 L6 78 L6 70 L12 64 L18 70 L18 76 L26 76 L26 66 L30 62 L34 66 L34 74 L42 74 L42 58 L44 52 L46 58 L46 72 L56 72 L56 68 L64 60 L72 68 L72 76 L80 76 L80 70 L86 66 L92 70 L92 78 L100 78 V100 Z';
  const lit = [[14, 72], [29, 70], [44, 64], [62, 70], [85, 74]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="1.6" height="2.2" class="win" style="animation-delay:${i * .25}s"/>`).join('');
  ov.innerHTML = `<div class="tp-sky"></div><div class="tp-stars">${stars}</div>
    <div class="tp-body tp-sun"></div><div class="tp-body tp-moon"></div>
    <svg class="tp-town" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${roofs}"/>${lit}</svg><div class="tp-fog"></div>
    <div class="tp-in">${title ? `<div class="tc-t">${esc(title)}</div>` : ''}${sub ? `<div class="tc-s">${esc(sub)}</div>` : ''}</div>`;
  ov.querySelector('.tp-sky').style.background = SKY[kind][0];
  ov.querySelector('.tp-sky').animate(SKY[kind].map(c => ({ background: c })), { duration: dur, fill: 'forwards', easing: 'ease-in-out' });
  document.body.appendChild(ov);
  // sun and moon travel along a wide ellipse over the rooftops (angle 0 = left horizon, 90 = overhead, 180 = right)
  const W = innerWidth, H = innerHeight, at = a => `translate(${W / 2 - Math.cos(a * Math.PI / 180) * W * .62}px, ${H * .86 - Math.sin(a * Math.PI / 180) * H * .52}px)`;
  const path = track => { const kf = []; for (let i = 0; i < track.length - 1; i++) { const [t0, a0] = track[i], [t1, a1] = track[i + 1]; const n = Math.max(1, Math.round(Math.abs(a1 - a0) / 6)); for (let j = 0; j < n; j++) kf.push({ offset: t0 + (t1 - t0) * j / n, transform: at(a0 + (a1 - a0) * j / n) }); } const [tl, al] = track[track.length - 1]; kf.push({ offset: tl, transform: at(al) }); return kf; };
  const TR = { night: [[[0, 95], [.28, 200], [.281, -40], [.84, -40], [1, 25]], [[0, -40], [.22, -40], [.86, 205], [1, 205]]],
    dusk: [[[0, 80], [1, 195]], [[0, -40], [.55, -40], [1, 35]]], dawn: [[[0, -40], [.45, -40], [1, 35]], [[0, 125], [1, 205]]],
    days: [[[0, -30], [.5, 210], [.501, -30], [1, 210]], [[0, -40], [1, -40]]] }[kind];
  ov.querySelector('.tp-sun').animate(path(TR[0]), { duration: dur, fill: 'forwards' });
  ov.querySelector('.tp-moon').animate(path(TR[1]), { duration: dur, fill: 'forwards' });
  await sleep(dur);
  holdOverlay(ov); // stays up until the next scene is drawn underneath, then fades
}
const passArgs = (p, from) => typeof p === 'function' ? p(G, from) : p;

/* ---------------- stage ---------------- */
function stage(bg, npcId, title) {
  const npc = npcId ? NPCS[npcId] : null;
  G.bg = bg;
  $('#app').innerHTML = `
    <div class="stage" id="stage">${ART.scene(bg)}<div class="fogA"></div><div class="fogB"></div>
      ${npc ? `<div class="npc ${npc.small ? 'small' : ''}" id="npc">${ART.portrait(npc.pt)}</div>` : ''}
      <div class="loc">${esc(title || '')}</div></div>
    <div class="panel"><div class="log" id="log"></div><div class="opts" id="opts"></div></div>`;
  AUDIO.play(bg);
  hud(); releaseOverlay();
}
function setBg(bg) {
  const st = $('#stage'); if (!st) return;
  const old = st.querySelector('.scene-svg');
  const tmp = document.createElement('div'); tmp.innerHTML = ART.scene(bg);
  const nu = tmp.firstChild; nu.classList.add('fadein');
  old.replaceWith(nu); G.bg = bg; AUDIO.play(bg);
}
function setNpc(npcId) {
  const st = $('#stage'); if (!st) return;
  const old = $('#npc'); if (old) old.remove();
  G.npc = npcId;
  if (!npcId) return;
  const npc = NPCS[npcId]; const d = document.createElement('div');
  d.className = `npc ${npc.small ? 'small' : ''} fadein`; d.id = 'npc'; d.innerHTML = ART.portrait(npc.pt);
  st.insertBefore(d, st.querySelector('.loc'));
}
function logAdd(html, cls = '') {
  const d = document.createElement('div'); d.className = 'e ' + cls; d.innerHTML = html;
  $('#log').appendChild(d); wireWords(d);
  requestAnimationFrame(() => d.classList.add('in'));
  const L = $('#log'); setTimeout(() => L.scrollTop = L.scrollHeight, 30);
  return d;
}
function tapOn() {
  return new Promise(res => {
    const o = $('#opts'); o.innerHTML = `<button class="cont" id="cont">▸</button>`;
    $('#cont').onclick = () => { o.innerHTML = ''; res(); };
  });
}
function choices(list) {
  return new Promise(res => {
    const o = $('#opts');
    o.innerHTML = list.map((c, i) => `<button class="opt ${c.cls || ''}" data-i="${i}" ${c.dis ? 'disabled' : ''}><span class="n">${i + 1}.</span><span class="t">${c.html}</span></button>`).join('');
    o.querySelectorAll('.opt').forEach(b => b.onclick = () => { o.innerHTML = ''; res(+b.dataset.i); });
    wireWords(o, true);
    if (G && !G.flags.lpHint && o.querySelector('.w')) { G.flags.lpHint = true; toast('Tip: press and hold a Danish word to see its meaning', 'gold'); }
  });
}
function sayEntry(st) {
  const npc = NPCS[st.say];
  if (!st.da) return logAdd(`<div class="who">${esc(npc.name)} <i>in English</i></div><div class="en-line">“${esc(st.en)}”</div>`, 'say eng');
  const el = logAdd(`<div class="who">${esc(npc.name)}</div><div class="da">“${daHTML(st.da)}”</div>
    <div class="tools"><button class="tb speak">♪ igen</button><button class="tb english">På engelsk? <small>−1 anseelse</small></button></div><div class="en hidden">“${esc(st.en)}”</div>`, 'say');
  el.querySelector('.speak').onclick = e => { e.stopPropagation(); TTS.say(st.da, true); };
  el.querySelector('.english').onclick = e => {
    e.stopPropagation(); e.target.closest('.english').remove();
    el.querySelector('.en').classList.remove('hidden');
    G.resp -= 1; G.log.eng++; toast('−1 anseelse · they noticed', 'bad'); hud();
  };
  TTS.say(st.da);
  const np = $('#npc'); if (np) { np.classList.remove('talk'); void np.offsetWidth; np.classList.add('talk'); }
  return el;
}
async function steps(list) {
  for (const st of list || []) {
    if (st.n) { logAdd(`<p>${esc(st.n)}</p>`, 'narr'); await tapOn(); }
    else if (st.th) { logAdd(`<p>${esc(st.th)}</p>`, 'thought'); await tapOn(); }
    else if (st.say) { sayEntry(st); await tapOn(); }
    else if (st.fx) fx(st.fx);
    else if (st.glimpse) await glimpse(st.glimpse);
    else if (st.letter) await letter(st.letter);
    else if (st.special) { const [k, arg] = st.special.split(':'); await special(k)(arg); }
    else if (st.bg) setBg(st.bg);
    else if (st.npc !== undefined) setNpc(st.npc);
  }
}
async function glimpse(id) {
  const g = S().glimpses[id];
  if (!G.glimpses.includes(id)) { G.glimpses.push(id); fx({ insp: 1 }); }
  AUDIO.sting('glimpse');
  const st = $('#stage'); if (st) { st.classList.add('glow'); setTimeout(() => st.classList.remove('glow'), 2500); }
  logAdd(`<div class="gl"><span>Glimt</span><b>${esc(g.name)}</b><i>${esc(g.en)}</i><p>${esc(g.text)}</p></div>`, 'glimpse');
  await tapOn();
}
async function letter(id) {
  const L = S().letters[id];
  AUDIO.sting('page');
  logAdd(`<div class="letter"><div class="lt">${esc(L.title)}</div>${L.lines.map(l => `<p>${daHTML(l)}</p>`).join('')}</div>`, 'paper');
  logAdd(`<p>Tap any word you don't know. It's free.</p>`, 'thought');
  for (const q of L.qs) {
    logAdd(`<p class="q">${esc(q.q)}</p>`, 'thought');
    const order = shuffle(q.opts.map((_, i) => i));
    const i = await choices(order.map(k => ({ html: esc(q.opts[k]) })));
    const ok = order[i] === q.a;
    if (ok) { statGain('INDSIGT', 1); if (q.flag) G.flags[q.flag] = true; }
    logAdd(`<div class="res ${ok ? 'ok' : 'no'}">${ok ? 'Ja.' : 'Nej: ' + esc(q.opts[q.a]) + '.'}</div>`);
  }
}

/* ---------------- sentence builder ---------------- */
let rodpenUsed = false;
function builder(b) {
  return new Promise(resolve => {
    __dev.cur = b;
    const norm = w => w.toLowerCase().replace(/[.,?!]/g, ''); // punctuation rides along with the tiles; it does not decide right or wrong
    const low = a => a.map(norm).join(' ');
    const all = [...b.answers, ...(b.best || [])].map(low);
    const tiles = shuffle((b.tiles || [...b.answers[0], ...(b.extra || [])]).map((t, i) => ({ t: /^[A-ZÆØÅ]/.test(t) && !NAMES.includes(t.replace(/[.,?!]/g, '')) ? t.toLowerCase() : t, i })));
    let line = [], mistakes = 0;
    const ov = document.createElement('div'); ov.className = 'sheet-ov'; document.body.appendChild(ov);
    const render = (msg, bad) => {
      ov.innerHTML = `<div class="sheet">
        <div class="intent"><small>Sig det på dansk</small>${esc(b.en)}</div>
        <div class="line ${bad ? 'shake' : ''}">${line.map((x, k) => `<button class="tile in ${bad && k === bad.at ? 'wrong' : ''}" data-k="${k}">${esc(x.t)}</button>`).join('') || '<span class="ph">tap the words in order</span>'}</div>
        ${msg ? `<div class="msg">${msg}</div>` : ''}
        <div class="pool">${tiles.map(x => `<button class="tile" data-i="${x.i}" ${line.includes(x) ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>
        <div class="brow"><button class="btn ghost" id="bClr">Ryd</button>${mistakes >= 2 ? '<button class="btn ghost" id="bShow">Vis svaret</button>' : ''}<button class="btn gold" id="bOk" ${line.length ? '' : 'disabled'}>Sig det</button></div></div>`;
      ov.querySelectorAll('.pool .tile').forEach(t => t.onclick = () => { line.push(tiles.find(x => x.i === +t.dataset.i)); AUDIO.sting('page'); render(); });
      ov.querySelectorAll('.line .tile').forEach(t => t.onclick = () => { line.splice(+t.dataset.k, 1); render(); });
      $('#bClr').onclick = () => { line = []; render(); };
      const sh = $('#bShow'); if (sh) sh.onclick = () => finish(b.answers[0], 'shown');
      $('#bOk').onclick = check;
    };
    const finish = (words, how) => {
      ov.remove();
      let sentence = words.join(' '); sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      TTS.say(sentence, false, true);
      resolve({ sentence, mistakes, how, best: (b.best || []).some(a => low(a) === low(words)) });
    };
    const check = () => {
      const s = line.map(x => norm(x.t)).join(' ');
      if (all.includes(s)) return finish(line.map(x => x.t), mistakes === 0 ? 'perfect' : 'ok');
      if (hasBoon('rodpen') && !rodpenUsed) { rodpenUsed = true; toast('Leos rødpen: this one does not count', 'gold'); }
      else mistakes++;
      let at = 0, bestLen = -1;
      for (const a of [...b.answers, ...(b.best || [])]) { let k = 0; while (k < line.length && a[k] && norm(line[k].t) === norm(a[k])) k++; if (k > bestLen) { bestLen = k; at = k; } }
      AUDIO.sting('lose');
      render(mistakes <= 1 ? `Not quite. The first problem is word ${at + 1}.` : 'Still not right. Look at the highlighted word, or show the answer.', { at });
    };
    render();
  });
}

/* ---------------- d20 ---------------- */
function roll(stat, dc, mods, mode) {
  return new Promise(resolve => {
    const ov = document.createElement('div'); ov.className = 'roll-ov'; document.body.appendChild(ov);
    const base = lvl(stat);
    const raw = base + mods.reduce((s, m) => s + m.v, 0);
    const total = Math.min(MOD_CAP, raw);
    dc = dc + (S().dcMod || 0);
    const chance = p => Math.round(p * 100);
    const pOne = Math.min(.95, Math.max(.05, (21 - (dc - total)) / 20));
    const pAll = mode === 'adv' ? 1 - (1 - pOne) ** 2 : mode === 'dis' ? pOne ** 2 : pOne;
    let rerolled = false;
    const draw = res => {
      ov.innerHTML = `<div class="roll">
        <div class="r-k">${esc(STATS[stat].name)}</div><div class="r-en">${esc(STATS[stat].en)}</div>
        <div class="r-dc">Sværhed <b>${dc}</b> <span class="r-ch">· chance ${chance(pAll)}%</span></div>
        <div class="r-die ${res ? (res.ok ? 'win' : 'lose') : ''}">${ART.d20(res ? res.nat : '?')}${res && res.r2 ? `<div class="r2">${res.r1} / ${res.r2}</div>` : ''}</div>
        <div class="r-mods"><span>${esc(STATS[stat].name)} niv. ${base} +${base}</span>${mods.map(m => `<span class="${m.v < 0 ? 'neg' : ''}">${esc(m.t)} ${m.v >= 0 ? '+' : ''}${m.v}</span>`).join('')}${raw > total ? `<span class="neg">max +${MOD_CAP}</span>` : ''}${mode === 'adv' ? '<span class="adv">Fordel: perfect Danish, roll twice, keep the best</span>' : mode === 'dis' ? '<span class="neg">Ulempe: roll twice, keep the worst</span>' : ''}</div>
        ${res ? `<div class="r-res ${res.ok ? 'ok' : 'no'}">${res.nat === 20 ? 'KRITISK SUCCES' : res.nat === 1 ? 'KRITISK FIASKO' : res.ok ? 'SUCCES' : 'FIASKO'}<small>${res.nat} + ${total} = ${res.nat + total}</small></div>` : ''}
        <div class="r-btns">${!res ? '<button class="btn gold" id="rGo">Slå terningen</button>' : (!res.ok && G.insp > 0 && !rerolled ? '<button class="btn ghost" id="rRe">✦ Inspiration: slå igen</button>' : '') + '<button class="btn gold" id="rOk">Fortsæt</button>'}</div></div>`;
      const go = $('#rGo'); if (go) go.onclick = spin;
      const re = $('#rRe'); if (re) re.onclick = () => { G.insp--; rerolled = true; hud(); spin(); };
      const ok = $('#rOk'); if (ok) ok.onclick = () => { ov.remove(); resolve(res.ok); };
    };
    const spin = async () => {
      const r1 = 1 + Math.floor(Math.random() * 20), r2 = 1 + Math.floor(Math.random() * 20);
      ov.querySelector('.r-btns').innerHTML = '';
      const die = ov.querySelector('.r-die'); die.classList.add('rolling'); AUDIO.sting('dice');
      for (let k = 0; k < (FAST ? 1 : 12); k++) { die.querySelector('text').textContent = 1 + Math.floor(Math.random() * 20); await sleep(55 + k * 10); }
      const nat = mode === 'adv' ? Math.max(r1, r2) : mode === 'dis' ? Math.min(r1, r2) : r1;
      const ok = nat === 20 || (nat !== 1 && nat + total >= dc);
      G.log.rolls++; if (ok) G.log.wins++;
      AUDIO.sting(ok ? 'win' : 'lose');
      draw({ ok, nat, r1: mode ? r1 : null, r2: mode ? r2 : null });
    };
    draw(null);
  });
}
function modsFor(o) {
  const mods = [];
  if (o.stat === 'SNIGE' && hasBoon('nisse')) mods.push({ t: 'Nissens gunst', v: 2 });
  if (o.bonus) { const b = o.bonus(G); if (b) mods.push({ t: o.bonusWhy || 'Bonus', v: b }); }
  if ((o.kind === 'say' || o.kind === 'lie') && G.resp >= 6) mods.push({ t: 'Anseelse', v: 1 });
  if (o.stat === 'INDSIGT' && hasBoon('marested')) mods.push({ t: 'Marestenen', v: 2 });
  if (o.stat === 'HANDEL' && hasBoon('tidslys')) mods.push({ t: 'Bjergkongens lys', v: 2 });
  if (o.kind === 'say' && hasBoon('hammer') && ['kjeld', 'jens', 'poul', 'margrethe'].includes(G.npc)) mods.push({ t: 'Pouls murske', v: 1 });
  return mods;
}

/* ---------------- options ---------------- */
async function runOption(node, o, idx) {
  if (o.once) G.used[G.node + ':' + idx] = true;
  if (o.group) G.used[G.node + '#' + o.group] = true; // choices in a group exclude each other (you cannot both confess and lie)
  G.usedCount = (G.usedCount || 0) + 1;
  if (o.kind === 'go') {
    if (o.fx) fx(o.fx);
    if (o.special) { const [k, a] = o.special.split(':'); await special(k)(a); }
    return o.next;
  }
  if (o.kind === 'eng') {
    G.resp -= 1; G.log.eng++; toast('−1 anseelse', 'bad'); hud();
    logAdd(`<p class="you">${esc(o.label)}</p>`, 'you');
    await steps(o.ok); return o.next;
  }
  if (o.kind === 'reply') {
    logAdd(`<div class="you-da">“${daHTML(o.da)}”</div>`, 'you'); TTS.say(o.da, false, true);
    statGain(o.stat, 1); await TTS.waitYou();
    await steps(o.ok); return o.next;
  }
  if (o.special) { statGain(o.stat, 1); const [k, a] = o.special.split(':'); await special(k)(a); return o.next; }
  if (o.pre) await special(o.pre)();
  let mode = null; const mods = modsFor(o);
  if ((o.kind === 'say' || o.kind === 'lie') && o.build) { // a lie without words (e.g. a false name) skips the builder
    const r = await builder(o.build);
    G.log.built++;
    logAdd(`<div class="you-da">“${daHTML(r.sentence)}”</div>`, 'you');
    if (r.how === 'perfect') { mode = 'adv'; G.log.perfect++; }
    else if (r.how === 'shown' || r.mistakes >= 2) mode = 'dis';
    if (r.best) mods.push({ t: 'Før-inversion', v: 1 });
    if (o.build.origin === 'job') { const m = r.sentence.match(/som ([^\s.]+)/); if (m) G.origin.job = m[1]; }
    if (o.build.origin === 'reason') G.origin.reason = r.sentence;
    if (['came', 'stay', 'happy', 'miss'].includes(o.build.origin)) G.origin[o.build.origin] = r.sentence;
    if (/boede jeg (i|på)/.test(r.sentence)) G.origin.place = r.sentence;
  }
  statGain(o.stat, 1);
  let ok;
  if (o.autoFail) { toast(o.autoFail, 'bad'); ok = false; await sleep(500); }
  else ok = await roll(o.stat, o.dc, mods, mode);
  if (ok) statGain(o.stat, 1);
  await steps(ok ? o.ok : o.fail);
  if (o.post) await steps(o.post);
  return ok ? o.next : (o.failNext || o.next);
}

async function goNode(id) {
  if (typeof id === 'function') id = id(G);
  if (id === 'map') return showMap();
  if (id === 'sleep') return goSleep();
  if (id === 'end') return endScreen();
  const node = S().nodes[id];
  const from = G.node; G.node = id; save();
  rodpenUsed = false;
  const ps = node.pass && passArgs(node.pass, from);
  if (ps) await passTime(...ps);
  else if (node.card) await card(node.card[0], node.card[1]);
  if (node.dusk && G.phase < 2) G.phase = 2;
  if (node.night) G.phase = 3;
  stage(node.bg, node.npc, node.title);
  G.npc = node.npc;
  if (node.quest) fx({ quest: node.quest });
  const startCount = G.usedCount || 0;
  await steps(node.steps);
  while (true) {
    const avail = node.opts.map((o, i) => [o, i]).filter(([o, i]) => !(o.once && G.used[id + ':' + i]) && !(o.group && G.used[id + '#' + o.group]) && !(o.after && (G.usedCount || 0) - startCount < o.after) && !(o.req && !o.req(G)));
    const list = avail.map(([o]) => {
      const tag = o.stat ? `<span class="tag t-${o.kind}">[${STATS[o.stat].name.toUpperCase()}${o.dc ? ' ' + o.dc : ''}]</span> ` : o.kind === 'eng' ? '<span class="tag t-eng">[ENGELSK]</span> ' : '';
      const text = o.kind === 'reply' ? `“${daHTML(o.da)}”` : esc(o.label);
      return { html: tag + text, cls: 'k-' + o.kind };
    });
    const i = await choices(list);
    const [o, oi] = avail[i];
    let next = await runOption(node, o, oi);
    if (typeof next === 'function') next = next(G);
    save();
    if (o.newDay) { G.day++; G.phase = 0; save(); }
    const ops = o.pass ? passArgs(o.pass, id) : o.newDay ? ['night', `Dag ${G.day}`, 'Morgen'] : null;
    if (ops) await passTime(...ops);
    if (next) return goNode(next);
    if (!node.hub) return showMap();
  }
}

/* ---------------- map & travel ---------------- */
function locMarked(k) {
  const m = S().marked ? S().marked(k, G) : null;
  if (m !== null && m !== undefined) return m;
  const e = S().locations[k].entry(G);
  return e && !e.endsWith('_idle');
}
const openAt = (k, l) => G.phase < 3 || l.night || (l.nightIf && l.nightIf(G)) || hasBoon('vaegterlygte');
function showMap() {
  G.node = 'map'; save();
  const L = S().locations;
  const night = G.phase >= 3;
  $('#app').innerHTML = `<div class="mapview"><div class="mapbox">${ART.scene('map').replace('xMidYMin slice', 'xMidYMid meet')}
      ${Object.entries(L).filter(([k, l]) => !l.req || l.req(G)).map(([k, l]) => `<button class="pin ${locMarked(k) ? 'mark' : ''} ${G.loc === k ? 'here' : ''} ${!openAt(k, l) ? 'shut' : ''}" data-k="${k}" style="left:${l.x}%;top:${l.y}%"><i></i><span>${esc(l.name)}</span></button>`).join('')}
      <svg class="route" id="route" viewBox="0 0 100 100" preserveAspectRatio="none"></svg></div>
    <div class="mapinfo"><div class="mi-t">${night ? 'Det er nat. Gå hjem og sov.' : 'Hvor vil du gå hen?'}</div><div class="mi-q">${questSummary()}</div></div></div>`;
  AUDIO.play('map'); hud(); releaseOverlay();
  document.querySelectorAll('.pin').forEach(b => b.onclick = () => travel(b.dataset.k));
}
function questSummary() {
  return G.quests.filter(q => !questDone(q)).map(q => { const Q = S().quests[q]; const nx = Q.obj.find(o => !G.flags[o[1]]); return `<div class="qs ${Q.side ? 'side' : ''}"><b>${esc(Q.title)}</b> ${nx ? esc(nx[0]) : ''}</div>`; }).join('') || '<div class="qs">No open contracts.</div>';
}
const questDone = q => S().quests[q].obj.every(o => G.flags[o[1]]);
async function travel(k) {
  const L = S().locations[k];
  if (!openAt(k, L)) { toast('Det er nat. Everything is closed, except the fog.', 'bad'); return; }
  const from = S().locations[G.loc] || L;
  const r = $('#route');
  if (r && !FAST) { r.innerHTML = `<path d="M${from.x} ${from.y} Q${(from.x + L.x) / 2 + 6} ${(from.y + L.y) / 2 - 8} ${L.x} ${L.y}" class="rt"/>`; AUDIO.steps(3); await sleep(900); }
  const ph0 = G.phase;
  if (k !== 'pension' && k !== G.loc) G.phase = Math.min(3, G.phase + 1);  G.loc = k;
  // a small encounter on the way?
  const pool = S().travel.filter(t => !G.travelDone.includes(t.id) && (!t.req || t.req(G)) && (!t.night || G.phase >= 2));
  if (pool.length && Math.random() < (FAST ? 0.6 : 0.45) && G.flags.Adone) {
    const ev = pick(pool); G.travelDone.push(ev.id);
    await card('Undervejs', 'on the way');
    await runInline(ev);
  }
  const entry = L.entry(G), en = S().nodes[entry];
  if (en && (en.pass || en.card)) return goNode(entry); // the node brings its own transition
  if (G.phase !== ph0) { phaseDial = dialHTML(ph0, G.phase); if (G.phase === 3) AUDIO.sting('night'); }
  await card(L.name, `${PHASES[G.phase]} · ${L.en}`);
  phaseDial = '';
  goNode(entry);
}
async function runInline(ev) {
  stage(ev.bg, ev.npc, 'Undervejs'); G.npc = ev.npc;
  await steps(ev.steps);
  const avail = ev.opts.filter(o => !(o.req && !o.req(G)));
  const i = await choices(avail.map(o => ({ html: (o.stat ? `<span class="tag t-${o.kind}">[${STATS[o.stat].name.toUpperCase()}${o.dc ? ' ' + o.dc : ''}]</span> ` : o.kind === 'eng' ? '<span class="tag t-eng">[ENGELSK]</span> ' : '') + esc(o.label) })));
  await runOption(ev, avail[i], i);
  save();
}

/* ---------------- sleep & evening review ---------------- */
async function goSleep() {
  const late = G.phase >= 3;
  const here = S().nodes[G.node];
  if (G.node !== 'pension_hub' && !(here && here.home)) await card('Hjem', `${PHASES[G.phase]} · Pensionat Tågelys`); // walking home from wherever you were
  stage('inn', null, 'Dit værelse');
  const cost = G.flags.freeRoom ? 0 : G.flags.cheapRoom ? 2 : 3;
  logAdd(`<p>${G.flags.freeRoom ? 'Hjørdis no longer charges you for the room. She has not said so. She simply stopped writing you in the ledger.' : `You pay Hjørdis ${cost} skilling for the night.`}</p>`, 'narr');
  G.sk = Math.max(0, G.sk - cost); hud();
  await tapOn();
  if (G.today.length >= 3) await review();
  G.day++; G.phase = 0; G.today = []; G.loc = 'pension';
  G.insp = Math.max(G.insp, hasBoon('timeglas') ? 2 : 1);
  save();
  await passTime(late ? 'dawn' : 'night', `Dag ${G.day}`, 'Morgen');
  showMap();
}
function review() {
  return new Promise(resolve => {
    const words = G.today.slice().sort((a, b) => (META.vocab[a]?.box || 0) - (META.vocab[b]?.box || 0)).slice(0, 8);
    let i = 0, right = 0;
    const ov = document.createElement('div'); ov.className = 'prep-ov'; document.body.appendChild(ov);
    const next = () => {
      if (i >= words.length) {
        ov.innerHTML = `<div class="prep rv"><div class="p-head"><small>Aftenens ord</small><h2>${right} / ${words.length}</h2><p>The words of the day, before sleep. Words you know well come back less often.</p></div>
          <div class="rv-sum">${words.map(k => `<div class="rv-w">${ART.icon(VOCAB[k].icon)}<b>${esc(VOCAB[k].da)}</b><i>${esc(VOCAB[k].en)}</i><span class="dots">${[0, 1, 2, 3].map(n => `<i class="${n < (META.vocab[k]?.box || 0) ? 'on' : ''}"></i>`).join('')}</span></div>`).join('')}</div>
          <button class="btn gold big" id="rvDone">Sov godt</button></div>`;
        $('#rvDone').onclick = () => { ov.remove(); resolve(); };
        return;
      }
      const k = words[i], V = VOCAB[k];
      const others = shuffle(Object.keys(VOCAB).filter(x => x !== k && VOCAB[x].set === V.set)).slice(0, 2);
      const opts = shuffle([k, ...others]);
      const mode = V.def && Math.random() < .5 ? 'def' : pick(['icon2da', 'da2icon']);
      const prompt = mode === 'def' ? `<div class="rv-def">${daHTML(V.def)}</div>` : mode === 'icon2da' ? `<div class="rv-ico">${ART.icon(V.icon)}</div>` : `<div class="rv-da">${esc(V.da)}</div>`;
      ov.innerHTML = `<div class="prep rv"><div class="p-head"><small>Aftenens ord · ${i + 1}/${words.length}</small><h2>${mode === 'da2icon' ? 'Which one is it?' : 'What is it in Danish?'}</h2></div>
        ${prompt}<div class="rv-opts ${mode === 'da2icon' ? 'icons' : ''}">${opts.map(x => `<button class="rv-o" data-k="${x}">${mode === 'da2icon' ? ART.icon(VOCAB[x].icon) : esc(VOCAB[x].da)}</button>`).join('')}</div></div>`;
      wireWords(ov);
      if (mode === 'da2icon') TTS.say(V.da);
      ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
        const ok = b.dataset.k === k;
        const v = META.vocab[k] = META.vocab[k] || { box: 0, seen: 1 };
        if (ok) { right++; v.box = Math.min(4, v.box + 1); b.classList.add('ok'); AUDIO.sting('win'); }
        else { v.box = 0; b.classList.add('no'); ov.querySelector(`.rv-o[data-k="${k}"]`).classList.add('ok'); AUDIO.sting('lose'); }
        saveMeta(); TTS.say(V.da);
        ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
        const cap = document.createElement('div'); cap.className = 'rv-cap'; cap.innerHTML = `<b>${esc(V.da)}</b> = ${esc(V.en)}`; ov.querySelector('.prep').appendChild(cap);
        await sleep(ok ? 900 : 1700); i++; next();
      });
    };
    next();
  });
}

/* ---------------- vocabulary games ---------------- */
function vocabSheet(html) { const ov = document.createElement('div'); ov.className = 'voc-ov'; ov.innerHTML = `<div class="voc">${html}</div>`; document.body.appendChild(ov); wireWords(ov); return ov; }
const SPECIAL = {
  /* hidden-object hunt in the scene */
  hunt(id) {
    return new Promise(resolve => {
      const H = S().hunts[id];
      const st = $('#stage');
      const items = shuffle([...H.find, ...H.decoys]);
      const layer = document.createElement('div'); layer.className = 'hunt';
      const cols = 4, rows = Math.ceil(items.length / cols);
      layer.innerHTML = items.map((k, n) => { const c = n % cols, r = Math.floor(n / cols); const x = 8 + c * 23 + Math.random() * 8, y = 30 + r * (60 / rows) + Math.random() * 6; const rot = Math.round(Math.random() * 40 - 20); return `<button class="hobj" data-k="${k}" style="left:${x}%;top:${y}%;transform:rotate(${rot}deg)">${ART.icon(VOCAB[k].icon)}</button>`; }).join('');
      st.appendChild(layer); st.classList.add('hunting');
      const todo = shuffle(H.find); let wrong = 0;
      const o = $('#opts');
      const prompt = () => {
        if (!todo.length) { layer.remove(); st.classList.remove('hunting'); o.innerHTML = ''; logAdd(`<div class="res ok">Alt fundet. Everything found.</div>`); resolve(); return; }
        const k = todo[0];
        o.innerHTML = `<div class="huntbar"><small>${esc(H.title)} · ${H.find.length - todo.length + 1}/${H.find.length}</small><div>Find: <b>${daHTML(VOCAB[k].da)}</b> <button class="tb" id="hSay">♪</button></div>${wrong >= 2 ? '<button class="tb" id="hHelp">Hjælp</button>' : ''}</div>`;
        wireWords(o);
        $('#hSay').onclick = () => TTS.say(VOCAB[k].da, true);
        const hh = $('#hHelp'); if (hh) hh.onclick = () => layer.querySelector(`[data-k="${k}"]`).classList.add('hint');
        TTS.say(VOCAB[k].da);
      };
      layer.querySelectorAll('.hobj').forEach(b => b.onclick = () => {
        const k = b.dataset.k; addWord(k);
        if (k === todo[0]) {
          b.classList.add('found'); b.disabled = true; todo.shift(); wrong = 0; AUDIO.sting('win');
          toast(`${VOCAB[k].da} ✓`, 'good'); statGain('INDSIGT', 1);
          setTimeout(prompt, FAST ? 0 : 500);
        } else {
          wrong++; AUDIO.sting('lose');
          b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 600);
          toast(`Det er ${VOCAB[k].da} (${VOCAB[k].en})`, 'bad'); TTS.say(VOCAB[k].da);
          prompt();
        }
      });
      __dev.hunt = () => todo[0];
      prompt();
    });
  },
  /* read shop signs by their definition */
  signs() {
    return new Promise(resolve => {
      const keys = shuffle(S().signs).slice(0, 8);
      let i = 0, right = 0;
      const ov = vocabSheet('');
      const round = () => {
        if (i >= keys.length) {
          G.flags.signsDone = true;
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Torvets skilte</small><h2>${right} / ${keys.length}</h2><p>You can now read the square. Mostly.</p></div><button class="btn gold big" id="vDone">Færdig</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(); }; return;
        }
        const k = keys[i];
        const opts = shuffle([k, ...shuffle(S().signs.filter(x => x !== k)).slice(0, 5)]);
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Torvets skilte · ${i + 1}/${keys.length}</small><h2>Hvor er det?</h2><div class="v-def">${daHTML(VOCAB[k].def)}</div></div>
          <div class="signs">${opts.map(x => `<button class="sign" data-k="${x}"><span>${esc(VOCAB[x].da.replace(/^(en|et) /, '').toUpperCase())}</span></button>`).join('')}</div>`;
        wireWords(ov);
        ov.querySelectorAll('.sign').forEach(b => b.onclick = async () => {
          const ok = b.dataset.k === k; addWord(k);
          ov.querySelectorAll('.sign').forEach(s => s.disabled = true);
          if (ok) { right++; b.classList.add('ok'); b.innerHTML += ART.icon(VOCAB[k].icon); AUDIO.sting('win'); statGain('INDSIGT', 1); }
          else { b.classList.add('no'); addWord(b.dataset.k); ov.querySelector(`.sign[data-k="${k}"]`).classList.add('ok'); AUDIO.sting('lose'); toast(`${VOCAB[b.dataset.k].da}: ${VOCAB[b.dataset.k].def}`, 'bad'); }
          TTS.say(VOCAB[k].da);
          await sleep(ok ? 900 : 2200); i++; round();
        });
      };
      round();
    });
  },
  findShop(key) {
    return new Promise(resolve => {
      const ov = vocabSheet('');
      const opts = shuffle([key, ...shuffle(S().signs.filter(x => x !== key)).slice(0, 5)]);
      ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Torvet</small><h2>Which shop?</h2><div class="v-def">${daHTML(VOCAB[key].def)}</div></div>
        <div class="signs">${opts.map(x => `<button class="sign" data-k="${x}"><span>${esc(VOCAB[x].da.replace(/^(en|et) /, '').toUpperCase())}</span></button>`).join('')}</div>`;
      wireWords(ov);
      ov.querySelectorAll('.sign').forEach(b => b.onclick = async () => {
        addWord(b.dataset.k);
        if (b.dataset.k === key) { b.classList.add('ok'); AUDIO.sting('win'); await sleep(700); ov.remove(); resolve(); }
        else { b.classList.add('no'); b.disabled = true; AUDIO.sting('lose'); toast(`${VOCAB[b.dataset.k].da}: ${VOCAB[b.dataset.k].def}`, 'bad'); }
      });
    });
  },
  /* Hjørdis' shopping list: right shop, understand the price */
  shop() {
    return new Promise(resolve => {
      const SH = S().shopping;
      let purse = SH.money, idx = 0, errs = 0;
      const ov = vocabSheet('');
      const listHTML = () => `<div class="slist">${SH.list.map((it, n) => `<span class="${n < idx ? 'done' : n === idx ? 'cur' : ''}">${daHTML(VOCAB[it[0]].da.replace(/^(en|et) /, ''))}</span>`).join('')}</div>`;
      const step1 = () => {
        if (idx >= SH.list.length) {
          G.flags.S1bought = true;
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Indkøb</small><h2>Alt er købt</h2><p>Everything bought. ${purse} skilling left of Hjørdis' money${errs ? `, after ${errs} small misunderstandings` : ''}.</p></div><button class="btn gold big" id="vDone">Tilbage til torvet</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(); }; return;
        }
        const [item, shop] = SH.list[idx];
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Hjørdis’ indkøbsliste · ${purse} skilling</small><h2>Næste: ${esc(VOCAB[item].da.replace(/^(en|et) /, ''))}</h2>${listHTML()}<p>Which shop sells it?</p></div>
          <div class="signs">${SH.shops.map(x => `<button class="sign" data-k="${x}"><span>${esc(VOCAB[x].da.replace(/^(en|et) /, '').toUpperCase())}</span></button>`).join('')}</div>`;
        wireWords(ov);
        ov.querySelectorAll('.sign').forEach(b => b.onclick = () => {
          addWord(b.dataset.k); addWord(item);
          if (b.dataset.k === shop) { AUDIO.steps(2); step2(); }
          else { errs++; b.classList.add('no'); b.disabled = true; AUDIO.sting('lose'); const line = `Det har vi ikke. Prøv ${shop === 'koebmand' ? 'købmanden' : shop === 'bageri' ? 'bageriet' : shop === 'apotek' ? 'apoteket' : 'lysestøberen'}.`; toast(line, 'bad'); TTS.say(line); }
        });
      };
      const step2 = () => {
        const [item, shop, price, word] = SH.list[idx];
        const line = `${VOCAB[item].da.replace(/^(en|et) /, '').replace(/^./, c => c.toUpperCase())}? Det koster ${word} skilling.`;
        const opts = shuffle([price, ...shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 20].filter(n => n !== price)).slice(0, 2)]);
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(VOCAB[shop].da)}</small><div class="v-ico">${ART.icon(VOCAB[item].icon)}</div><div class="v-say">“${daHTML(line)}” <button class="tb" id="sSay">♪</button></div><p>How much do you put on the counter?</p></div>
          <div class="coins">${opts.map(n => `<button class="coin" data-n="${n}">${n}</button>`).join('')}</div>`;
        wireWords(ov); TTS.say(line);
        $('#sSay').onclick = () => TTS.say(line, true);
        ov.querySelectorAll('.coin').forEach(b => b.onclick = async () => {
          if (+b.dataset.n === price) { purse -= price; AUDIO.sting('coin'); statGain('HANDEL', 1); b.classList.add('ok'); await sleep(600); idx++; step1(); }
          else { errs++; b.classList.add('no'); b.disabled = true; AUDIO.sting('lose'); const fix = `${word[0].toUpperCase() + word.slice(1)}. Ikke ${b.dataset.n}.`; toast(fix, 'bad'); TTS.say(fix); }
        });
      };
      step1();
    });
  },
  /* Ib's job board: Gæt jobbet */
  jobs() {
    return new Promise(resolve => {
      const keys = shuffle(S().jobs).slice(0, 6); let i = 0, right = 0;
      const ov = vocabSheet('');
      const round = () => {
        if (i >= keys.length) {
          G.flags.jobsDone = true; G.sk += right * 2; hud();
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Ibs jobtavle</small><h2>${right} / ${keys.length}</h2><p>Ib pays two shillings per correct match, and takes one for “administration”. You receive ${right * 2}. He says the administration fee is waived “because he likes you”. This is somehow more worrying.</p></div><button class="btn gold big" id="vDone">Færdig</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(); }; return;
        }
        const k = keys[i]; const opts = shuffle([k, ...shuffle(Object.keys(VOCAB).filter(x => VOCAB[x].set === 'job' && x !== k)).slice(0, 2)]);
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Ibs jobtavle · ${i + 1}/${keys.length}</small><h2>Søges</h2><div class="notice">${daHTML('Søges: En, der ' + VOCAB[k].def.charAt(0).toLowerCase() + VOCAB[k].def.slice(1))}</div><p>Hvad er jobbet?</p></div>
          <div class="rv-opts">${opts.map(x => `<button class="rv-o" data-k="${x}">${esc(VOCAB[x].da)}</button>`).join('')}</div>`;
        wireWords(ov);
        ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
          const ok = b.dataset.k === k; addWord(k); ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
          if (ok) { right++; b.classList.add('ok'); AUDIO.sting('coin'); } else { b.classList.add('no'); ov.querySelector(`.rv-o[data-k="${k}"]`).classList.add('ok'); AUDIO.sting('lose'); }
          TTS.say(VOCAB[k].da); await sleep(ok ? 800 : 1600); i++; round();
        });
      };
      round();
    });
  },
  /* Leo's corrections */
  async corr() {
    const C = S().corrections; let right = 0;
    logAdd(`<p>Leo hands you a page of his students’ sentences, each one wrong in an educational way.</p>`, 'narr');
    for (const it of C) {
      logAdd(`<div class="corr"><span class="corr-k">En elevs sætning</span><s>${daHTML(it.bad)}</s></div>`, 'quiz');
      const opts = shuffle([it.good, ...it.wrong]);
      const i = await choices(opts.map(o => ({ html: daHTML(o) })));
      const ok = opts[i] === it.good; if (ok) { right++; statGain('SPROG', 1); }
      logAdd(`<div class="res ${ok ? 'ok' : 'no'}">${ok ? 'Rigtigt. ' : 'Nej: <b>' + esc(it.good) + '</b> '}<br><i>${esc(it.why)}</i></div>`);
    }
    G.flags.corrDone = true;
    sayEntry({ say: 'leo', en: `${right} of ${C.length}. ${right >= 5 ? 'Bravo. Take my red pen. Your first mistake in every conversation is now my problem, not yours.' : 'Not bad. Mistakes are information. You are very informative.'}` });
    if (right >= 5) fx({ boon: 'rodpen' });
    await tapOn();
  },
  async fish() {
    logAdd(`<div class="you-da">“${daHTML('Hvor meget koster torsken?')}”</div>`, 'you');
    sayEntry({ say: 'margrethe', da: 'Torsken koster tolv skilling.', en: 'The cod costs twelve shillings.' });
    logAdd(`<p>How much do you hand her?</p>`, 'thought');
    const opts = shuffle([12, 20, 2]);
    const i = await choices(opts.map(n => ({ html: `${n} skilling` })));
    G.sk = Math.max(0, G.sk - 12); hud(); addWord('fisk');
    if (opts[i] === 12) {
      statGain('HANDEL', 1);
      const ok = await roll('HANDEL', 11, [{ t: 'Kunde', v: 2 }], null);
      if (ok) { statGain('HANDEL', 1); sayEntry({ say: 'margrethe', da: 'Torsdag er en god dag for fisk. Og for lys.', en: 'Thursday is a good day for fish. And for lights.' }); G.flags.thursday = true; G.flags.mOk = true; }
      else sayEntry({ say: 'margrethe', da: 'Tak. Spørg Kjeld på saltværket, hvis du vil vide noget.', en: 'Thanks. Ask Kjeld at the salt works, if you want to know something.' });
    } else {
      sayEntry({ say: 'margrethe', da: 'Tolv. Ikke tyve. Udlændinge.', en: 'Twelve. Not twenty. Foreigners.' });
      logAdd(`<p>She takes twelve anyway. You now own a cod and a lesson.</p>`, 'narr');
    }
    await tapOn();
  },
  async payCandle() {
    logAdd(`<p>You hold out coins for one candle. How many?</p>`, 'thought');
    const opts = shuffle([2, 12, 20]);
    const i = await choices(opts.map(n => ({ html: `${n} skilling` })));
    addWord('lys');
    if (opts[i] === 2) { G.sk = Math.max(0, G.sk - 2); hud(); logAdd(`<div class="res ok">To skilling. Jens relaxes: you are a customer.</div>`); }
    else { G.sk = Math.max(0, G.sk - 2); hud(); sayEntry({ say: 'jens', da: 'To. Ikke tolv. Det er et lys, ikke et hus.', en: "Two. Not twelve. It's a candle, not a house." }); await tapOn(); }
  },
  async bribe() {
    logAdd(`<p>You put your hand on your purse. Kjeld sees it. He keeps shovelling, which in Vandmark means “go on”.</p>`, 'narr');
    const amt = [['Her er fem skilling.', 5, 16], ['Her er ti skilling.', 10, 12], ['Her er tyve skilling.', 20, 8]];
    const i = await choices(amt.map(a => ({ html: `“${daHTML(a[0])}”${G.sk < a[1] ? ' <small>(you can’t afford it)</small>' : ''}`, dis: G.sk < a[1] })).concat([{ html: 'Change your mind.' }]));
    if (i === 3) return;
    const [line, n, dc] = amt[i];
    G.sk -= n; hud();
    logAdd(`<div class="you-da">“${daHTML(line)}”</div>`, 'you'); TTS.say(line, false, true);
    const ok = await roll('HANDEL', dc, [], null);
    if (ok) { statGain('HANDEL', 1); sayEntry({ say: 'kjeld', da: 'Torsdag. Når tågen kommer. Og du har ikke hørt det fra mig.', en: "Thursday. When the fog comes. And you didn't hear it from me." }); G.flags.thursday = true; }
    else { sayEntry({ say: 'kjeld', da: 'Tak. Ud.', en: 'Thanks. Out.' }); G.flags.saltOut = true; }
    await tapOn();
  },
  async caught() {
    sayEntry({ say: 'kjeld', da: 'Hvad laver du her?', en: 'What are you doing here?' });
    logAdd(`<p>Answer. Read carefully.</p>`, 'thought');
    const R = [['Jeg leder efter toilettet.', 'lie'], ['Undskyld. Jeg går nu.', 'leave'], ['Jeg kom hertil for at stjæle.', 'honest']];
    const order = shuffle([0, 1, 2]);
    const i = await choices(order.map(k => ({ html: `“${daHTML(R[k][0])}”` })));
    const [line, kind] = R[order[i]];
    G.flags.saltOut = true; // whatever you say, you are leaving the salt works
    logAdd(`<div class="you-da">“${daHTML(line)}”</div>`, 'you'); TTS.say(line, false, true);
    if (kind === 'lie') { statGain('LOEGN', 1); const ok = await roll('LOEGN', 11, [], null); if (ok) sayEntry({ say: 'kjeld', da: 'Toilettet er udenfor. Ligesom dig.', en: 'The toilet is outside. Like you.' }); else { sayEntry({ say: 'kjeld', da: 'Ud.', en: 'Out.' }); fx({ resp: -1 }); } }
    else if (kind === 'leave') sayEntry({ say: 'kjeld', da: 'Ja. Det gør du.', en: 'Yes. You do.' });
    else { sayEntry({ say: 'kjeld', da: 'Ærlig. Det er sjældent her. Ud, men ærlig.', en: "Honest. That's rare here. Out, but honest." }); fx({ resp: 1 }); }
    await tapOn();
  },
  async reveal() {
    await sleep(300);
    const st = $('#stage'); if (st) st.classList.add('flash');
    setBg('havmand');
    await steps([
      { n: 'At the very end of the line of boats, the water rises like a held breath. A figure: hair like kelp, skin like the inside of a shell, eyes like two cold coins. A havmand.' },
      { n: 'Margrethe hands him bread. He takes it gently, the way you take something you have been given every week for three hundred years.' },
      { n: 'The pact, you will understand later, is simple: when the fog is brewed, the sea folk lead the fishing boats home. Once a week, the town sets them a table. The last harbour master who saw it tried to catch one in a net. Nobody has spoken of it since, which in Vandmark means everybody has.' },
      { glimpse: 'bord' },
    ]);
  },
  async wisps() {
    if (hasBoon('lygte')) { logAdd(`<p>Mosekonen's lantern hisses. The lights back away like dogs from a stove, and the real path shows itself: dull, wet, safe.</p>`, 'narr'); await tapOn(); return; }
    logAdd(`<p>The lights are very kind. That is what worries you.</p>`, 'thought');
    statGain('INDSIGT', 1);
    const ok = await roll('INDSIGT', 13, [], null);
    if (ok) { statGain('INDSIGT', 1); logAdd(`<p>You watch long enough to see that the kind lights lead into the deepest water. You walk the other way.</p>`, 'narr'); }
    else { logAdd(`<p>You follow the kindest light. Up to your knees. Up to your waist. When you claw your way out, something in your pocket stays behind in the bog.</p>`, 'narr'); fx({ sk: -4 }); }
    await tapOn();
  },
  async lantern() {
    sayEntry({ say: 'mosekonen', da: 'En lygte? Ti skilling. Eller et minde.', en: 'A lantern? Ten shillings. Or a memory.' });
    await tapOn();
    const opts = [{ html: `“${daHTML('Her er ti skilling.')}”${G.sk < 10 ? ' <small>(you can’t afford it)</small>' : ''}`, dis: G.sk < 10 }, { html: 'Give her a memory.' }, { html: `<span class="tag t-lie">[LØGN 15]</span> “${daHTML('Jeg har ingen penge.')}”` }, { html: 'No, thank you.' }];
    const i = await choices(opts);
    if (i === 0) { G.sk -= 10; hud(); AUDIO.sting('coin'); fx({ boon: 'lygte' }); sayEntry({ say: 'mosekonen', da: 'Godt. Den lyser kun for dig.', en: 'Good. It only shines for you.' }); }
    if (i === 1) { fx({ boon: 'lygte', flag: 'memory' }); logAdd(`<p>She puts one finger on your forehead. It is cold, and smells of peat. Later you will try to remember the smell of your mother's kitchen and find only a polite, empty space where it was.</p>`, 'narr'); sayEntry({ say: 'mosekonen', da: 'Tak. Det var et godt minde.', en: 'Thank you. That was a good memory.' }); }
    if (i === 2) { statGain('LOEGN', 1); const ok = await roll('LOEGN', 15, [], null); if (ok) { statGain('LOEGN', 1); sayEntry({ say: 'mosekonen', da: 'Ha! Godt løjet. Tag den.', en: 'Ha! Well lied. Take it.' }); fx({ boon: 'lygte' }); } else { sayEntry({ say: 'mosekonen', da: 'Nej? Så tager jeg fem.', en: "No? Then I'll take five." }); fx({ sk: -5 }); } }
    if (i === 3) logAdd(`<p>She shrugs. The moor will teach you, she seems to say. It teaches everyone, eventually.</p>`, 'narr');
    await tapOn();
  },
  /* ---------- Lektion 2 games ---------- */
  /* Opholdsbogen: a line in the book is wrong; the timeline shows the truth; pick the right sentence */
  fixEntry(id) {
    return new Promise(resolve => {
      const E = S().entries[id];
      const opts = shuffle([E.good, ...E.wrong]);
      const ov = vocabSheet('');
      ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Opholdsbogen · ${esc(E.who)}</small><h2>Ret linjen</h2>
        <div class="book"><s>${daHTML(E.bad)}</s></div><p>${esc(E.hint)}</p>${ART.timeline(E.kind, E.lab)}</div>
        <div class="rv-opts">${opts.map((o, i) => `<button class="rv-o" data-i="${i}">${daHTML(o)}</button>`).join('')}</div>`;
      wireWords(ov, true);
      ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
        const ok = opts[+b.dataset.i] === E.good;
        ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
        b.classList.add(ok ? 'ok' : 'no'); if (!ok) ov.querySelectorAll('.rv-o')[opts.indexOf(E.good)].classList.add('ok');
        AUDIO.sting(ok ? 'win' : 'lose'); TTS.say(E.good);
        if (ok) statGain('SPROG', 1);
        G.flags['fix_' + id] = ok ? 'ok' : 'late';
        const why = document.createElement('div'); why.className = 'rv-cap'; why.innerHTML = `${ok ? 'Rigtigt.' : 'Nej.'} <i>${esc(E.why)}</i><button class="btn gold big" id="vDone">Skriv det i bogen</button>`;
        ov.querySelector('.voc').appendChild(why);
        $('#vDone').onclick = () => { ov.remove(); AUDIO.sting('page'); resolve(ok); };
      });
    });
  },
  /* Vægterens runde: the watchman calls the hour; you read the clocks */
  clock() {
    return new Promise(resolve => {
      const R = S().clockRounds; let i = 0, right = 0;
      const ov = vocabSheet('');
      const round = () => {
        if (i >= R.length) {
          G.flags.rundeDone = true;
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Vægterens runde</small><h2>${right} / ${R.length}</h2><p>${right >= R.length - 1 ? 'Anker nods. From him, that is a parade.' : 'Anker says nothing. He corrects every clock you read wrong in his book, in red.'}</p></div><button class="btn gold big" id="vDone">Færdig</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(right); }; return;
        }
        const [h, m, say] = R[i];
        const mode = i % 2 ? 'read' : 'hear';
        const wrongs = shuffle(R.filter(r => r[2] !== say)).slice(0, 2);
        const opts = shuffle([R[i], ...wrongs]);
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>Vægterens runde · ${i + 1}/${R.length}</small><h2>${mode === 'hear' ? 'Hvilket ur?' : 'Hvad siger vægteren?'}</h2>
          ${mode === 'hear' ? `<div class="v-say">“${daHTML(say)}” <button class="tb" id="cSay">♪</button></div>` : `<div class="v-clock">${ART.clock(h, m)}</div>`}</div>
          <div class="rv-opts ${mode === 'hear' ? 'icons clocks' : ''}">${opts.map((o, k) => `<button class="rv-o" data-k="${k}">${mode === 'hear' ? ART.clock(o[0], o[1]) : daHTML(o[2])}</button>`).join('')}</div>`;
        wireWords(ov, true);
        if (mode === 'hear') { TTS.say(say); $('#cSay').onclick = () => TTS.say(say, true); }
        ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
          const ok = opts[+b.dataset.k] === R[i];
          ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
          b.classList.add(ok ? 'ok' : 'no'); if (!ok) ov.querySelectorAll('.rv-o')[opts.indexOf(R[i])].classList.add('ok');
          if (ok) { right++; AUDIO.sting('win'); statGain('INDSIGT', 1); } else { AUDIO.sting('lose'); toast(say, 'bad'); }
          TTS.say(say); await sleep(ok ? 900 : 2000); i++; round();
        });
      };
      round();
    });
  },
  /* Leo's three boxes, and da / når / hvornår gaps */
  boxes(id) {
    return new Promise(resolve => {
      const Q = S().boxes[id]; let i = 0, right = 0;
      const ov = vocabSheet('');
      const round = () => {
        if (i >= Q.items.length) {
          G.flags[id + 'Done'] = true; G.flags[id + 'Score'] = right;
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(Q.title)}</small><h2>${right} / ${Q.items.length}</h2><p>${esc(right >= Q.items.length - 1 ? Q.good : Q.meh)}</p></div><button class="btn gold big" id="vDone">Færdig</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(right); }; return;
        }
        const it = Q.items[i];
        const raw = it.opts || Q.boxes, order = it.opts ? shuffle(raw.map((_, k) => k)) : raw.map((_, k) => k);
        const opts = order.map(k => raw[k]), A = order.indexOf(it.a);
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(Q.title)} · ${i + 1}/${Q.items.length}</small><h2>${esc(it.q || Q.q)}</h2><div class="v-def">${daHTML(it.t)}</div></div>
          <div class="rv-opts">${opts.map((o, k) => `<button class="rv-o" data-k="${k}">${Q.glyphs && !it.opts ? ART.timeline(Q.glyphs[order[k]]) : ''}<span class="lab">${daHTML(o)}</span></button>`).join('')}</div>`;
        wireWords(ov, true);
        ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
          const ok = +b.dataset.k === A;
          ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
          b.classList.add(ok ? 'ok' : 'no'); if (!ok) ov.querySelectorAll('.rv-o')[A].classList.add('ok');
          if (ok) { right++; AUDIO.sting('win'); statGain('SPROG', 1); } else AUDIO.sting('lose');
          const full = it.t.replace('___', raw[it.a]); TTS.say(full.charAt(0).toUpperCase() + full.slice(1));
          const cap = document.createElement('div'); cap.className = 'rv-cap'; cap.innerHTML = `<i>${esc(it.why)}</i>`; ov.querySelector('.voc').appendChild(cap);
          await sleep(ok ? 1300 : 2600); i++; round();
        });
      };
      round();
    });
  },
  /* the weather: when was it (i går / i dag / i morgen, from the verb), and what was it */
  weather(id) {
    return new Promise(resolve => {
      const W = S().weather[id]; let i = 0, right = 0, step = 0;
      const days = ['I går', 'I dag', 'I morgen'];
      const board = W.rounds.map(() => null);
      const ov = vocabSheet('');
      const boardHTML = () => `<div class="wboard">${days.map((d, k) => { const j = W.rounds.findIndex((r, n) => r.when === k && board[n]); return `<div class="wday"><small>${d}</small>${j >= 0 ? ART.icon(VOCAB[W.rounds[j].w].icon) : '<span>?</span>'}</div>`; }).join('')}</div>`;
      const round = () => {
        if (i >= W.rounds.length) {
          G.flags[id + 'Done'] = true;
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(W.title)}</small><h2>${right} / ${W.rounds.length * 2}</h2>${boardHTML()}<p>${esc(W.end)}</p></div><button class="btn gold big" id="vDone">Færdig</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(right); }; return;
        }
        const r = W.rounds[i];
        if (step === 0) {
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(W.title)} · ${i + 1}/${W.rounds.length}</small>${boardHTML()}<h2>Hvornår?</h2><div class="v-def">“${daHTML('___ ' + r.t)}”</div><p>Look at the verb.</p></div>
            <div class="rv-opts">${days.map((d, k) => `<button class="rv-o" data-k="${k}">${d}</button>`).join('')}</div>`;
        } else {
          const opts = shuffle([r.w, ...shuffle(Object.keys(VOCAB).filter(k => VOCAB[k].set === 'vejr' && k !== r.w)).slice(0, 3)]);
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(W.title)} · ${i + 1}/${W.rounds.length}</small>${boardHTML()}<h2>Hvordan er vejret?</h2><div class="v-def">“${daHTML(days[r.when] + ' ' + r.t)}”</div></div>
            <div class="rv-opts icons">${opts.map(k => `<button class="rv-o" data-w="${k}">${ART.icon(VOCAB[k].icon)}</button>`).join('')}</div>`;
        }
        wireWords(ov, true);
        ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
          const ok = step === 0 ? +b.dataset.k === r.when : b.dataset.w === r.w;
          ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
          b.classList.add(ok ? 'ok' : 'no');
          if (ok) { right++; AUDIO.sting('win'); } else AUDIO.sting('lose');
          if (step === 0) { if (!ok) toast(`${days[r.when]}: ${r.why}`, 'bad'); TTS.say(days[r.when] + ' ' + r.t); await sleep(ok ? 700 : 1800); step = 1; }
          else { addWord(r.w); if (!ok) { ov.querySelector(`.rv-o[data-w="${r.w}"]`).classList.add('ok'); toast(`${VOCAB[r.w].da} · ${VOCAB[r.w].en}`, 'bad'); } TTS.say(VOCAB[r.w].da); board[i] = true; await sleep(ok ? 800 : 1700); step = 0; i++; }
          round();
        });
      };
      round();
    });
  },
  /* Hvem er det? A description in the third person; pick the face */
  guess(id) {
    return new Promise(resolve => {
      const Q = S().guess[id]; let i = 0, right = 0;
      const ov = vocabSheet('');
      const round = () => {
        if (i >= Q.rounds.length) {
          G.flags[id + 'Done'] = true;
          ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(Q.title)}</small><h2>${right} / ${Q.rounds.length}</h2><p>${esc(Q.end(right))}</p></div><button class="btn gold big" id="vDone">Færdig</button>`;
          $('#vDone').onclick = () => { ov.remove(); resolve(right); }; return;
        }
        const r = Q.rounds[i];
        const opts = shuffle([r.npc, ...shuffle(Q.pool.filter(n => n !== r.npc)).slice(0, 2)]);
        (r.words || []).forEach(addWord);
        ov.querySelector('.voc').innerHTML = `<div class="v-h"><small>${esc(Q.title)} · ${i + 1}/${Q.rounds.length}</small><h2>Hvem er det?</h2><div class="notice">${r.lines.map(l => daHTML(l)).join(' ')}</div></div>
          <div class="faces">${opts.map(n => `<button class="rv-o face" data-n="${n}">${ART.portrait(NPCS[n].pt)}</button>`).join('')}</div>`;
        wireWords(ov);
        ov.querySelectorAll('.rv-o').forEach(b => b.onclick = async () => {
          const ok = b.dataset.n === r.npc;
          ov.querySelectorAll('.rv-o').forEach(x => x.disabled = true);
          b.classList.add(ok ? 'ok' : 'no'); if (!ok) ov.querySelector(`.rv-o[data-n="${r.npc}"]`).classList.add('ok');
          if (ok) { right++; AUDIO.sting('coin'); statGain('INDSIGT', 1); } else AUDIO.sting('lose');
          const cap = document.createElement('div'); cap.className = 'rv-cap'; cap.innerHTML = `<b>${esc(NPCS[r.npc].name)}</b> · ${esc(NPCS[r.npc].role)}`; ov.querySelector('.voc').appendChild(cap);
          await sleep(ok ? 1100 : 2000); i++; round();
        });
      };
      round();
    });
  },
  async buyInsp() { if (G.sk >= 6) { G.sk -= 6; fx({ insp: 1 }); AUDIO.sting('coin'); } else toast('You cannot afford it. Ib looks sincerely sorry, which is the most frightening thing about him.', 'bad'); },
  async innLine() {
    const f = G.flags;
    const lines = f.nisseAngry ? ['Something thumps above the ceiling. Hjørdis looks at you as if it were your fault. It is, a little.']
      : f.Adone ? ['Hjørdis is doing the accounts. A bowl of porridge, empty, waits by the attic ladder.', 'The pensionat smells of coffee and lavender. Upstairs, someone small is snoring.'] : ['Hjørdis is at her ledger.'];
    logAdd(`<p>${esc(pick(lines))}</p>`, 'narr');
    if (f.Bdone && f.Cdone) logAdd(`<p>You have done what this week asked of you. You could rest, and let the chapter close.</p>`, 'thought');
  },
  async torvLine() {
    if (!G.flags.torvSeen) { G.flags.torvSeen = true; logAdd(`<p>Torvet. The market square, where Vandmark sells everything it has and complains about everything it lacks. Every shop has a sign. Every sign is in Danish. Every Dane can read them. You are not every Dane.</p>`, 'narr'); }
    else logAdd(`<p>${esc(pick(['A cart loaded with peat squeaks past. Somebody sells eels out of a bucket and refuses to say what kind.', 'Market day. Prices are shouted in Danish, which is to say very fast and with great confidence.', 'Under the lamp post, two old men argue about the fog the way other men argue about football.']))}</p>`, 'narr');
  },
  async leoLine() {
    if (!G.flags.leoMet) {
      G.flags.leoMet = true;
      logAdd(`<p>Below a bakery, down eleven steps that disagree about their height, is a cellar with a blackboard, nine chairs and a man from very far south.</p>`, 'narr'); await tapOn();
      logAdd(`<p>Mester Leonardo has lived in Vandmark for half his life. He says this the way other men say they have served half a life sentence: without complaint, and with a certain professional pride.</p>`, 'narr'); await tapOn();
      sayEntry({ say: 'leo', da: 'Velkommen. Sæt dig.', en: 'Welcome. Sit down.' }); await tapOn();
      sayEntry({ say: 'leo', en: 'Everyone who arrives makes the same mistakes. This is good news. It means the mistakes are a road, and roads go somewhere.' });
    } else logAdd(`<p>${esc(pick(['Leo is drinking coffee that smells like an argument.', 'Leo is correcting a stack of sentences with a pen that has clearly seen things.']))}</p>`, 'narr');
  },
  async idle(k) {
    const f = G.flags;
    const L = {
      havn: f.endTruth ? [['margrethe', 'Tolv skilling. Prisen er prisen.', 'Twelve shillings. The price is the price.']] : f.endFog ? [['margrethe', 'Torsken er frisk i dag. For dig: ti skilling.', 'The cod is fresh today. For you: ten shillings.']] : [['margrethe', 'Torsken er frisk i dag.', 'The cod is fresh today.'], ['margrethe', 'Har du set vejret? Det bliver tåge.', "Have you seen the weather? There'll be fog."]],
      kontor: f.Bdone ? [['bramsen', 'Næste.', 'Next.']] : [['bramsen', 'Har du et navn til mig?', 'Do you have a name for me?'], ['bramsen', 'Torsdag. Altid torsdag.', 'Thursday. Always Thursday.']],
      salt: [['kjeld', 'Ud.', 'Out.'], ['kjeld', 'Saltet venter ikke.', "The salt doesn't wait."]],
      inger: [['inger', 'Poul sover. Han har sovet i to dage.', 'Poul is asleep. He has slept for two days.'], ['inger', 'Kom ind. Der er kaffe.', 'Come in. There is coffee.']],
      mose: null,
    }[k];
    if (!L) { logAdd(`<p>${G.flags.Cfree ? 'The moor is quiet. The mound is just a hill again. You do not trust it.' : 'The fog is thick, and you have no reason to be out here. Without a reason, nobody walks onto the moor.'}</p>`, 'narr'); return; }
    const [n, da, en] = pick(L); sayEntry({ say: n, da, en }); await tapOn();
  },
  async finaleLine() {
    const f = G.flags;
    logAdd(`<p>${f.endFog ? 'Thursday comes round again. From your window you watch the lights go out on the water, one by one, as if the town were counting. Nobody has invited you. Nobody has to.' : f.endTruth ? 'Thursday comes round again. There are no lights on the water. Two boats came home late this week. People are polite to you, in English.' : 'Thursday comes round again. The lights are back. You are richer than you were, and you eat alone.'}</p>`, 'narr'); await tapOn();
    if (hasBoon('nisse')) { logAdd(`<p>There is an extra bun by your plate. Nobody mentions it. You do not mention it either, which, you are beginning to understand, is exactly the point.</p>`, 'narr'); await tapOn(); }
  },
};

/* ---------------- end of lesson ---------------- */
function endScreen() {
  localStorage.removeItem(KEY); META.runs++;
  META.carry = META.carry || {}; META.carry[G.sess] = carryOut(); saveMeta();
  stage(S().endBg || 'inn', null, '');
  const L = G.log, nx = S().nextSession && SESSIONS[S().nextSession];
  const ending = S().ending ? S().ending(G) : '—';
  const known = Object.keys(META.vocab).length;
  const said = [G.origin.place, G.origin.job && `Jeg arbejdede som ${G.origin.job}.`, G.origin.reason].filter(Boolean);
  const future = [G.origin.came, G.origin.stay, G.origin.happy, G.origin.miss].filter(Boolean);
  const ov = document.createElement('div'); ov.className = 'prep-ov'; document.body.appendChild(ov);
  ov.innerHTML = `<div class="prep debrief"><div class="p-head"><small>${esc(S().chapter)}</small><h2>${esc(S().title)}</h2><p>Afslutning: ${esc(ending)}</p></div>
    <div class="grid">
      <div><span>Anseelse</span><b>${esc(tierName())}</b><small>${G.resp}</small></div>
      <div><span>Dage</span><b>${G.day}</b><small>in Vandmark</small></div>
      <div><span>Sætninger</span><b>${L.built}</b><small>${L.perfect} perfect first try</small></div>
      <div><span>Terninger</span><b>${L.wins}/${L.rolls}</b><small>successful rolls</small></div>
      <div><span>Ord</span><b>${known}</b><small>words met (vocabulary)</small></div>
      <div><span>Glimt</span><b>${G.glimpses.length}/${Object.keys(S().glimpses).length}</b><small>of the hidden things</small></div>
    </div>
    <h3>Færdigheder</h3><div class="stats">${Object.keys(STATS).map(k => `<div class="st"><b>${STATS[k].name}</b><span class="sv">${lvl(k)}</span></div>`).join('')}</div>
    <h3>Your past, as you said it</h3><div class="paper-s">${said.map(l => `<p>${esc(l)}</p>`).join('') || '<p>(nothing said properly yet)</p>'}</div>
    ${future.length ? `<h3>Your time here, as you said it</h3><div class="paper-s">${future.map(l => `<p>${esc(l)}</p>`).join('')}</div>` : ''}
    ${S().next ? `<p class="next">Next: ${S().next}</p>` : ''}
    ${nx ? `<button class="btn gold big" id="onward">Fortsæt: ${esc(nx.short)} · ${esc(nx.en)}</button><p class="dim">Your character, skills, standing and money come with you.</p>` : ''}
    <button class="btn ${nx ? 'ghost' : 'gold'} big" id="again">Play the lesson again</button></div>`;
  $('#again').onclick = () => { ov.remove(); newGame(G.sess); goNode(S().start); };
  const on = $('#onward'); if (on) on.onclick = () => { const from = META.carry[G.sess]; ov.remove(); newGame(S().nextSession, from); goNode(S().start); };
}

/* ---------------- journal ---------------- */
function journal() {
  const ov = document.createElement('div'); ov.className = 'prep-ov'; document.body.appendChild(ov);
  const tabs = {
    k: () => G.quests.map(q => { const Q = S().quests[q]; return `<div class="qj ${questDone(q) ? 'done' : ''}"><b>${esc(Q.title)}</b> <i>${esc(Q.en)}</i>${Q.obj.map(o => `<div class="qo ${G.flags[o[1]] ? 'ok' : ''}">${G.flags[o[1]] ? '✓' : '○'} ${esc(o[0])}</div>`).join('')}</div>`; }).join('') || '<p class="dim">No contracts yet.</p>',
    f: () => `<div class="stats">${Object.entries(STATS).map(([k, s]) => { const l = lvl(k), x = G.statXP[k], nxt = STAT_STEPS[l] || x, prv = STAT_STEPS[l - 1] || 0; return `<div class="st"><div><b>${esc(s.name)}</b> <span class="sv">${l}</span><p>${esc(s.en)}</p><span class="xpb"><i style="width:${l >= 5 ? 100 : Math.round((x - prv) / Math.max(1, nxt - prv) * 100)}%"></i></span></div></div>`; }).join('')}</div>
      <p class="dim">Skills grow when you choose answers and actions of that kind, a little more when they succeed.</p>
      ${G.boons.length ? '<h3>Gaver</h3>' + G.boons.map(b => `<div class="gl small"><b>${esc(BOONS[b].name)}</b><p>${esc(BOONS[b].fx)}</p></div>`).join('') : ''}`,
    o: () => Object.entries(VOCAB_SETS).map(([set, name]) => { const ks = Object.keys(VOCAB).filter(k => VOCAB[k].set === set && META.vocab[k]); return `<h3>${esc(name)} <small>${ks.length}/${Object.keys(VOCAB).filter(k => VOCAB[k].set === set).length}</small></h3><div class="ordbog">${ks.map(k => `<button class="ob" data-say="${esc(VOCAB[k].da)}">${ART.icon(VOCAB[k].icon)}<b>${esc(VOCAB[k].da)}</b><i>${esc(VOCAB[k].en)}</i><span class="dots">${[0, 1, 2, 3].map(n => `<i class="${n < META.vocab[k].box ? 'on' : ''}"></i>`).join('')}</span></button>`).join('') || '<p class="dim">None yet.</p>'}</div>`; }).join(''),
    g: () => G.glimpses.length ? G.glimpses.map(g => `<div class="gl small"><b>${esc(S().glimpses[g].name)}</b><p>${esc(S().glimpses[g].text)}</p></div>`).join('') : '<p class="dim">Nothing yet. They are good at hiding it.</p>',
    s: () => settingsHTML() + `<button class="btn ghost big" id="restart">Start forfra (new game)</button>`,
  };
  const names = { k: 'Kontrakter', f: 'Færdigheder', o: 'Ordbog', g: 'Glimt', s: 'Indstillinger' };
  ov.innerHTML = `<div class="prep"><div class="p-head"><small>Dagbog</small><h2>Dag ${G.day} · ${PHASES[G.phase]}</h2></div>
    <div class="jt">${Object.keys(tabs).map((k, i) => `<button data-t="${k}" class="${i ? '' : 'on'}">${names[k]}</button>`).join('')}</div><div class="jb"></div>
    <button class="btn gold big" id="close">Luk</button></div>`;
  const show = k => {
    ov.querySelector('.jb').innerHTML = tabs[k]();
    ov.querySelectorAll('.jt button').forEach(b => b.classList.toggle('on', b.dataset.t === k));
    ov.querySelectorAll('[data-say]').forEach(b => b.onclick = () => TTS.say(b.dataset.say, true));
    wireSettings(ov);
    const r = $('#restart'); if (r) r.onclick = () => { if (confirmStart()) { ov.remove(); localStorage.removeItem(KEY); title(); } };
  };
  ov.querySelectorAll('.jt button').forEach(b => b.onclick = () => show(b.dataset.t));
  show('k');
  $('#close').onclick = () => ov.remove();
}
function confirmStart() { return true; }
function settingsHTML() {
  const row = (k, on, name, en) => `<div class="set"><div class="set-h"><b>${name}</b><i>${en}</i><button class="tog ${SETTINGS[on] ? 'on' : ''}" data-on="${on}" aria-label="${en}"><span></span></button></div>
    <input type="range" min="0" max="100" value="${Math.round(SETTINGS[k] * 100)}" data-k="${k}" ${SETTINGS[on] ? '' : 'disabled'}></div>`;
  return `<div class="sets">${row('music', 'musicOn', 'Musik', 'music')}${row('amb', 'ambOn', 'Omgivelser', 'ambience: sea, fire, wind')}${row('sfx', 'sfxOn', 'Effekter', 'dice, coins, steps')}${row('voice', 'voiceOn', 'Dansk stemme', 'Danish voice for dialogue')}
    <div class="set"><div class="set-h"><b>Taletempo</b><i>voice speed</i></div><input type="range" min="60" max="110" value="${Math.round((SETTINGS.rate || .9) * 100)}" data-k="rate"></div>
    <div class="set"><div class="set-h"><b>Animationer</b><i>transition cards & motion</i><button class="tog ${SETTINGS.motion ? 'on' : ''}" data-on="motion"><span></span></button></div></div>
    <button class="btn ghost" id="testv">♪ Test: “Det var ikke noget.”</button></div>
    <p class="dim">No Danish voice on Android? Settings → Text-to-speech output → Google → Install voice data → Dansk.</p>`;
}
function wireSettings(root) {
  root.querySelectorAll('.tog').forEach(b => b.onclick = () => { const k = b.dataset.on; AUDIO.set(k, !SETTINGS[k]); b.classList.toggle('on', SETTINGS[k]); const r = b.closest('.set').querySelector('input'); if (r && k !== 'motion') r.disabled = !SETTINGS[k]; document.body.classList.toggle('still', !SETTINGS.motion); AUDIO.sting('tick'); });
  root.querySelectorAll('input[type=range]').forEach(r => r.oninput = () => { AUDIO.set(r.dataset.k, +r.value / 100); if (r.dataset.k === 'sfx') AUDIO.sting('tick'); });
  // the voice is only tested on demand: sliders stay silent (on a phone, scrolling across them fires change events)
  const tv = root.querySelector('#testv'); if (tv) tv.onclick = e => { e.stopPropagation(); TTS.say('Det var ikke noget. Det er bare tågen.', true); };
}
function settingsSheet() {
  const ov = document.createElement('div'); ov.className = 'prep-ov'; document.body.appendChild(ov);
  ov.innerHTML = `<div class="prep"><div class="p-head"><small>Indstillinger</small><h2>Lyd og visning</h2></div>${settingsHTML()}<button class="btn gold big" id="close">Luk</button></div>`;
  wireSettings(ov); $('#close').onclick = () => ov.remove();
}

/* ---------------- title ---------------- */
function title() {
  G = null; hud();
  let sv = null; try { sv = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { }
  if (sv && !SESSIONS[sv.sess || 'k1l1']) sv = null;
  const svS = sv && SESSIONS[sv.sess || 'k1l1'];
  $('#app').innerHTML = `<div class="stage title-st">${ART.scene('ferry')}<div class="fogA"></div><div class="fogB"></div></div>
    <div class="title"><p class="k">En fortælling fra Vandmark</p><h1>Det var<br>ikke noget</h1>
    <p class="tag">Contracts, lies and dice in a city that only listens in Danish.</p>
    ${sv ? `<button class="btn gold big" id="cont">Fortsæt <small>· ${esc(svS.short)}, dag ${sv.day}</small></button>` : ''}
    <button class="btn ${sv ? 'ghost' : 'gold'} big" id="new">${sv ? 'Ny begyndelse' : 'Begynd'}</button>
    <button class="btn ghost big" id="sets">⚙ Indstillinger · lyd</button>
    <p class="sound">♪ Music, sound and Danish voice are on. Headphones recommended.</p>
    <a class="old" href="v1/">the old card version (v1)</a></div>`;
  const begin = () => { AUDIO.resume(); };
  $('#sets').onclick = () => { AUDIO.resume(); AUDIO.play('title'); settingsSheet(); };
  document.addEventListener('pointerdown', function first() { document.removeEventListener('pointerdown', first); AUDIO.resume(); if (!G) AUDIO.play('title'); });
  if (sv) $('#cont').onclick = () => { begin(); G = sv; G.sess = G.sess || 'k1l1'; G.prev = G.prev || {}; G.node && G.node !== 'map' && S().nodes[G.node] ? goNode(G.node) : showMap(); };
  $('#new').onclick = () => { begin(); lessonSheet(); };
  const q = (location.search.match(/[?&]lesson=(\w+)/) || [])[1];
  if (q && SESSIONS[q]) { newGame(q, (META.carry || {})[SESSIONS[q].prevSession] || null); goNode(S().start); }
}
// choose a lesson: always the first; later ones can start with the character from the one before, or with a ready-made one
function lessonSheet() {
  const list = Object.values(SESSIONS).sort((a, b) => a.order - b.order);
  if (list.length === 1) { newGame(list[0].id); goNode(S().start); return; }
  const carry = META.carry || {};
  const ov = document.createElement('div'); ov.className = 'prep-ov'; document.body.appendChild(ov);
  ov.innerHTML = `<div class="prep"><div class="p-head"><small>Kapitel 1 · Baggrund & bydel</small><h2>Vælg lektion</h2><p>Each lesson follows one session of the book and takes about an hour and a half.</p></div>
    <div class="lessons">${list.map(L => { const from = L.prevSession && carry[L.prevSession];
      return `<div class="lesson"><b>${esc(L.short)} · ${esc(L.title.replace(/^Lektion \d+ · /, ''))}</b><i>${esc(L.en)}</i><p>${esc(L.blurb || '')}</p>
        ${from ? `<button class="btn gold" data-s="${L.id}" data-carry="1">Fortsæt med din karakter <small>(${esc(tierName(from))}, dag ${from.day})</small></button>` : ''}
        <button class="btn ${from || L.order === 1 ? 'ghost' : 'gold'}" data-s="${L.id}">${L.prevSession ? 'Begynd med en ny karakter' : 'Begynd'}</button></div>`; }).join('')}</div>
    <button class="btn ghost big" id="close">Tilbage</button></div>`;
  ov.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { ov.remove(); const L = SESSIONS[b.dataset.s]; newGame(L.id, b.dataset.carry ? carry[L.prevSession] : null); goNode(S().start); });
  $('#close').onclick = () => ov.remove();
}

TTS.init();
document.body.classList.toggle('still', !SETTINGS.motion);
title();
