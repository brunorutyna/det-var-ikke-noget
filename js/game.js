/* =========================================================================
   DET VAR IKKE NOGET — game loop & UI
   ========================================================================= */
const SAVE_KEY = 'dvin_save_v1', META_KEY = 'dvin_meta_v1';
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const FAST = /[?&]fast/.test(location.search);

const ICON = {
  spk: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3 1.7-1.8 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  coin: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M9 9.5h4.5a1.8 1.8 0 0 1 0 3.5H10a1.8 1.8 0 0 0 0 3.5H15" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z"/></svg>',
  mute: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.6 3 2.7-2.7-1.1-1.1-2.7 2.7-2.7-2.7-1.1 1.1 2.7 2.7-2.7 2.7 1.1 1.1 2.7-2.7 2.7 2.7 1.1-1.1z"/></svg>',
};
const NODE_GLYPH = { story: '✒', duel: '⚔', boss: '♜', event: '✧', shop: '⚖', rest: '☾' };
const TYPE_LABEL = {
  OPENER: ['ja/nej', 'c-open'], MAIN_R: ['start', 'c-core'], WAS: ['start', 'c-core'], WORKAS: ['start', 'c-core'],
  WORKED: ['start', 'c-core'], STUDIED: ['start', 'c-core'], SUBJ: ['subjekt', 'c-core'],
  FOER: ['før-sætning', 'c-inv'], INV_WAS: ['inversion', 'c-inv'], INV_WORKAS: ['inversion', 'c-inv'], INV_WORKED: ['inversion', 'c-inv'], INV_STUDIED: ['inversion', 'c-inv'],
  PGA: ['+ navneord', 'c-conn'], FORAT: ['+ verbum', 'c-conn'], FORDI: ['+ sætning', 'c-conn'], MENOGSAA: ['grund nr. 2', 'c-conn'],
  NP: ['navneord', 'c-noun'], JOB: ['job', 'c-noun'], FIELD: ['fag', 'c-noun'], PLACE: ['sted', 'c-noun'],
  INF: ['infinitiv', 'c-verb'], VPAST: ['datid', 'c-verb'], MODAL: ['modal', 'c-verb'], ADV: ['adverbium', 'c-adv'], PREP: ['i / på', 'c-prep'],
};

/* ---------------- Text-to-speech ---------------- */
const TTS = {
  ok: 'speechSynthesis' in window, on: true, voice: null,
  init() {
    if (!this.ok) return;
    const pick = () => { const vs = speechSynthesis.getVoices(); this.voice = vs.find(v => /^da/i.test(v.lang)) || null; };
    pick(); speechSynthesis.onvoiceschanged = pick;
    try { this.on = localStorage.getItem('dvin_sound') !== '0'; } catch (e) { }
  },
  say(text, rate = 0.9, force) {
    if (!this.ok || (!this.on && !force) || FAST) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[…*]/g, ''));
      u.lang = 'da-DK'; if (this.voice) u.voice = this.voice; u.rate = rate;
      speechSynthesis.speak(u);
    } catch (e) { }
  },
};

/* ---------------- Small sound effects ---------------- */
const SFX = (() => {
  let ctx = null;
  const tone = (f, d = 0.08, type = 'sine', v = 0.05) => {
    if (!TTS.on || FAST) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = v;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + d);
    } catch (e) { }
  };
  return { tick: () => tone(660, 0.05, 'triangle', 0.04), hit: () => tone(110, 0.25, 'sawtooth', 0.05), good: () => { tone(523, 0.1); setTimeout(() => tone(784, 0.15), 90); }, bad: () => tone(196, 0.2, 'square', 0.03), glimpse: () => { tone(880, 0.4, 'sine', 0.04); setTimeout(() => tone(1175, 0.6, 'sine', 0.03), 160); } };
})();

/* ---------------- State ---------------- */
let G = null;
let META = loadMeta();
function loadMeta() { try { return Object.assign({ deaths: 0, xp: 0, upg: {}, cleared: 0 }, JSON.parse(localStorage.getItem(META_KEY) || '{}')); } catch (e) { return { deaths: 0, xp: 0, upg: {}, cleared: 0 }; } }
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) { } }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { } }
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }

function newRun(origin) {
  const compMax = 30 + (META.upg.comp ? 5 : 0);
  G = {
    v: 1, session: 0, row: 0, done: [], comp: compMax, compMax, resp: 0,
    sk: 3 + (META.upg.coin ? 4 : 0), glimpses: [], relics: [], levels: META.upg.fordi ? { FORDI: 2 } : {},
    deck: { J: START_DECK.J.slice(), R: START_DECK.R.slice() }, origin: origin || {}, flags: {},
    stats: { sent: 0, err: 0, eng: 0, best: 0, bestSentence: '' }, learned: {},
  };
}
const has = r => G.relics.includes(r);
const tier = () => { let t = TIERS[0]; for (const x of TIERS) if (G.resp >= x.min) t = x; return t; };
const tierIdx = () => TIERS.indexOf(tier());
const sess = () => SESSIONS[G.session];

function tpl(s) {
  if (!s) return s;
  const o = G.origin;
  return s.replace(/\{job\}/g, o.job ? o.job.da : 'arbejdsløs').replace(/\{Job\}/g, cap(o.job ? o.job.da : 'arbejdsløs'))
    .replace(/\{jobEn\}/g, o.job ? o.job.en : 'unemployed').replace(/\{place\}/g, o.place ? o.place.da : '');
}
function gainResp(n, why) {
  G.resp += n;
  if (n) toast((n > 0 ? '+' : '') + n + ' anseelse' + (why ? ' · ' + why : ''), n > 0 ? 'good' : 'bad');
}
function heal(n) { G.comp = Math.min(G.compMax, G.comp + n); }
function addRelic(id) {
  if (has(id)) return;
  G.relics.push(id);
  if (id === 'bolle') { G.compMax += 5; heal(5); }
  toast('Nyt ordsprog: ' + RELICS[id].name, 'gold');
}
function addGlimpse(id) { if (!G.glimpses.includes(id)) G.glimpses.push(id); }
function learn(ids) { ids.forEach(id => G.learned[id] = (G.learned[id] || 0) + 1); }

/* ---------------- Chrome: top bar, toast, journal ---------------- */
function topbar() {
  const el = $('#top');
  if (!G) { el.innerHTML = ''; return; }
  const t = tier();
  const pct = Math.max(0, G.comp / G.compMax * 100);
  el.innerHTML = `
    <div class="stat comp" title="Fatning · composure. At zero, you're on the next ferry.">${ICON.heart}<span class="bar"><i style="width:${pct}%"></i></span><b>${G.comp}</b><small>/${G.compMax}</small></div>
    <div class="stat resp" title="Anseelse · standing. Grows with good Danish, shrinks when you ask for English.">${esc(t.name)}<small>${G.resp}</small></div>
    <div class="stat sk" title="Skilling · shillings">${ICON.coin}<b>${G.sk}</b></div>
    <div class="stat gl" title="Glimt · glimpses of what they hide">${ICON.star}<b>${G.glimpses.length}</b><small>/${Object.keys(GLIMPSES).length}</small></div>
    <button class="iconbtn" id="btnBook" title="Dagbog · journal">${ICON.book}</button>
    <button class="iconbtn" id="btnSnd" title="Lyd · sound">${TTS.on ? ICON.spk : ICON.mute}</button>`;
  $('#btnBook').onclick = journal;
  $('#btnSnd').onclick = () => { TTS.on = !TTS.on; try { localStorage.setItem('dvin_sound', TTS.on ? '1' : '0'); } catch (e) { } topbar(); };
}
function toast(msg, cls = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + cls; t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), FAST ? 50 : 2200);
  setTimeout(() => t.remove(), FAST ? 100 : 2800);
}

function journal() {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  const o = G.origin;
  const frag = (q, a, en) => `<div class="frag ${a ? '' : 'empty'}"><div class="fq">${q}</div><div class="fa">${a ? esc(a) : '— not yet said in Danish —'}</div>${a && en ? `<div class="fe">${esc(en)}</div>` : ''}</div>`;
  const tabs = {
    fortid: `<p class="hint">Your past is whatever you've managed to say correctly in Danish. Nothing more. Nothing less.</p>
      ${frag('Hvor boede du?', o.place && 'Jeg boede ' + o.place.da + '.', o.place && 'I lived ' + o.place.en + '.')}
      ${frag('Hvad lavede du?', o.jobSentence, o.jobEn)}
      ${frag('Hvorfor kom du hertil?', o.reasonSentence, o.reasonEn)}
      ${frag('Hvad lavede du i din fritid?', o.fritid && 'Jeg ' + o.fritid.da + '.', o.fritid && 'I ' + o.fritid.en.toLowerCase() + '.')}`,
    glimt: Object.entries(GLIMPSES).map(([k, g]) => G.glimpses.includes(k)
      ? `<div class="glimpse-card"><b>${esc(g.name)}</b> <i>${esc(g.en)}</i><p>${esc(g.text)}</p></div>`
      : `<div class="glimpse-card locked"><b>· · ·</b><p>Something you haven't been shown.</p></div>`).join(''),
    ordsprog: G.relics.length ? G.relics.map(r => `<div class="relic-row"><b>${esc(RELICS[r].name)}</b> <i>${esc(RELICS[r].en)}</i><p>${esc(RELICS[r].fx)}</p></div>`).join('') : '<p class="hint">No sayings yet. Sayings are earned, found, or bought from Ib.</p>',
    mønstre: Object.entries(PATTERNS).map(([k, p]) => { const l = G.levels[k] || 1; return `<div class="pat-row"><div><b>${esc(p.name)}</b> <small>niv. ${l}</small><br><i>${esc(p.en)}</i><div class="ex">${esc(p.ex)}</div></div><div class="cm"><span class="chips">${p.chips + (l - 1) * 8}</span>×<span class="mult">${p.mult + (l - 1)}</span></div></div>`; }).join(''),
    ord: (() => { const all = [...new Set([...G.deck.J, ...G.deck.R])]; return '<p class="hint">The words in your head. Tap to hear.</p><div class="wordlist">' + all.map(id => `<button class="wl" data-say="${esc(CHUNKS[id].da)}"><b>${esc(CHUNKS[id].da)}</b><i>${esc(CHUNKS[id].en)}</i>${G.learned[id] ? `<small>×${G.learned[id]}</small>` : ''}</button>`).join('') + '</div>'; })(),
  };
  const names = { fortid: 'Din fortid', glimt: 'Glimt', ordsprog: 'Ordsprog', mønstre: 'Mønstre', ord: 'Ord' };
  ov.innerHTML = `<div class="sheet"><div class="sheet-head"><h2>Dagbog</h2><button class="x" aria-label="Luk">✕</button></div>
    <div class="tabs">${Object.keys(tabs).map((k, i) => `<button data-t="${k}" class="${i ? '' : 'on'}">${names[k]}</button>`).join('')}</div>
    <div class="tabbody">${tabs.fortid}</div></div>`;
  document.body.appendChild(ov);
  ov.querySelector('.x').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  ov.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    ov.querySelectorAll('.tabs button').forEach(x => x.classList.remove('on')); b.classList.add('on');
    ov.querySelector('.tabbody').innerHTML = tabs[b.dataset.t];
    ov.querySelectorAll('[data-say]').forEach(w => w.onclick = () => TTS.say(w.dataset.say, 0.9, true));
  });
}

/* ---------------- Screens ---------------- */
function screen(html, cls = '') {
  const s = $('#screen');
  s.className = 'screen ' + cls;
  s.innerHTML = html;
  s.scrollTop = 0;
  topbar();
  return s;
}

function title() {
  G = null; topbar();
  const sv = loadSave();
  screen(`<div class="title">
    <div class="title-glow"></div>
    <p class="kicker">En fortælling fra Vandmark</p>
    <h1>Det var<br>ikke noget</h1>
    <p class="tag">A city in the fog. A language that binds.<br>And something beautiful that nobody will admit is there.</p>
    <div class="title-btns">
      ${sv ? `<button class="btn primary" id="cont">Fortsæt <small>continue</small></button>` : ''}
      <button class="btn ${sv ? '' : 'primary'}" id="new">${sv ? 'Ny begyndelse' : 'Begynd'} <small>${sv ? 'start over' : 'begin'}</small></button>
    </div>
    ${META.deaths ? `<p class="meta-note">Forsøg ${META.deaths + 1}. The ferryman remembers you.</p>` : ''}
    <p class="small-print">Kapitel 1 · Lektion 1 · prototype. Danish voice via your browser; use headphones for the market.</p>
  </div>`, 'title-screen');
  if (sv) $('#cont').onclick = () => { G = sv; map(); };
  $('#new').onclick = () => { clearSave(); newRun(); runNode(sess().map[0][0]); };
}

/* ---------------- Map ---------------- */
function map() {
  save();
  const S = sess();
  const rows = S.map.map((row, r) => {
    const state = r < G.row ? 'past' : r === G.row ? 'now' : 'future';
    return `<div class="map-row ${state}">${row.map(n => {
      const done = G.done.includes(n.id);
      const skipped = state === 'past' && !done;
      return `<button class="node t-${n.type} ${done ? 'done' : ''} ${skipped ? 'skipped' : ''}" data-id="${n.id}" ${state === 'now' ? '' : 'disabled'}>
        <span class="ng">${NODE_GLYPH[n.type]}</span><span class="nt">${esc(n.title)}</span><span class="ns">${esc(n.sub)}</span></button>`;
    }).join('')}</div>`;
  }).join('<div class="map-link"></div>');
  screen(`<div class="mapwrap">
    <div class="map-head"><p class="kicker">${esc(S.chapter)}</p><h2>${esc(S.title)}</h2><p class="en">${esc(S.en)}</p></div>
    <div class="map">${rows}</div>
    <p class="map-hint">${G.row === 0 ? '' : 'Choose where to go. You cannot go everywhere. Vandmark prefers it that way.'}</p>
  </div>`, 'map-screen');
  document.querySelectorAll('.node[data-id]').forEach(b => {
    if (b.disabled) return;
    b.onclick = () => runNode(S.map[G.row].find(n => n.id === b.dataset.id));
  });
}

async function runNode(node) {
  scene(node.title, node.sub);
  let r;
  if (node.scene) r = await play(SCENES[node.scene]);
  if (r === 'abort') return;
  if (node.duel) {
    if (node.pre) { r = await play(SCENES[node.pre]); if (r === 'abort') return; }
    const res = await runDuel(node.duel);
    if (res !== 'win') return gameOver();
    scene(node.title, node.sub);
    if (node.post) { r = await play(SCENES[node.post]); if (r === 'abort') return; }
  }
  G.done.push(node.id);
  G.row++;
  save();
  if (node.type === 'boss') return sessionEnd();
  if (node.duel) return reward(node.duel);
  map();
}

/* ---------------- Scene player (BG3-style log) ---------------- */
function scene(t, sub) {
  screen(`<div class="scene"><div class="scene-head"><h2>${esc(t)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
    <div class="log" id="log"></div><div class="act" id="act"></div></div>`, 'scene-screen');
}
function logAdd(html, cls) {
  const d = document.createElement('div');
  d.className = 'entry ' + (cls || '');
  d.innerHTML = html;
  $('#log').appendChild(d);
  requestAnimationFrame(() => d.classList.add('in'));
  setTimeout(() => d.scrollIntoView({ behavior: FAST ? 'auto' : 'smooth', block: 'end' }), 30);
  return d;
}
function act(html) { const a = $('#act'); a.innerHTML = html; return a; }
function cont(label = 'Fortsæt') {
  return new Promise(res => {
    const a = act(`<button class="btn primary cont" id="cbtn">${label} ▸</button>`);
    const go = () => { document.removeEventListener('keydown', key); a.innerHTML = ''; res(); };
    const key = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    document.addEventListener('keydown', key);
    $('#cbtn').onclick = go;
  });
}
function choose(opts) {
  return new Promise(res => {
    const a = act(`<div class="choices">${opts.map((o, i) => `<button class="btn choice" data-i="${i}">${o.html || esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('')}</div>`);
    a.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { a.innerHTML = ''; res(+b.dataset.i); });
  });
}

function sayHTML(s) {
  const npc = NPCS[s.npc] || NPCS.narrator;
  if (s.npc === 'narrator') return `<div class="doc"><div class="da">${esc(s.da)} <button class="spk" data-say="${esc(s.da)}">${ICON.spk}</button></div><div class="gist">${esc(s.gist || '')}</div>${trBtn(s)}</div>`;
  const head = `<div class="who"><span class="glyph" style="--c:${npc.col}">${npc.glyph}</span><b>${esc(npc.name)}</b><i>${esc(npc.role || '')}</i></div>`;
  if (!s.da) return `<div class="say eng">${head}<div class="line-en">“${esc(tpl(s.en))}”</div><div class="lang-note">in English</div></div>`;
  return `<div class="say">${head}<div class="da">“${esc(tpl(s.da))}” <button class="spk" data-say="${esc(tpl(s.da))}">${ICON.spk}</button></div>
    ${s.gist ? `<div class="gist">${esc(tpl(s.gist))}</div>` : ''}${trBtn(s)}</div>`;
}
function trBtn(s) { return s.en ? `<div class="tr"><button class="trb">Ib oversætter <small>1 skilling</small></button><div class="en hidden">“${esc(tpl(s.en))}”</div></div>` : ''; }
function wireSay(el) {
  el.querySelectorAll('[data-say]').forEach(b => b.onclick = () => TTS.say(b.dataset.say, 0.85, true));
  const tb = el.querySelector('.trb');
  if (tb) tb.onclick = () => {
    if (G.sk < 1) { toast('Ib does not work for free. Nobody here does.', 'bad'); return; }
    G.sk -= 1; G.stats.eng++; topbar();
    tb.remove(); el.querySelector('.tr .en').classList.remove('hidden');
  };
}

async function play(steps) {
  for (const s of steps) {
    const r = await step(s);
    if (r === 'abort') return 'abort';
  }
}
async function step(s) {
  if (s.n) { logAdd(`<p>${esc(tpl(s.n))}</p>`, 'narr'); await cont(); return; }
  if (s.th) { logAdd(`<p>${esc(tpl(s.th))}</p>`, 'thought'); await cont(); return; }
  if (s.say) {
    const el = logAdd(sayHTML({ npc: s.say, da: s.da, en: s.en, gist: s.gist }), 'speech');
    wireSay(el);
    if (s.da) TTS.say(tpl(s.da));
    await cont(); return;
  }
  if (s.glimpse) {
    const g = GLIMPSES[s.glimpse];
    const first = !G.glimpses.includes(s.glimpse);
    addGlimpse(s.glimpse); topbar();
    if (first) SFX.glimpse();
    logAdd(`<div class="glimpse"><span class="gl-k">Glimt</span><b>${esc(g.name)}</b><i>${esc(g.en)}</i><p>${esc(g.text)}</p></div>`, 'glimpse-entry');
    await cont(); return;
  }
  if (s.relic) { addRelic(s.relic); topbar(); logAdd(`<div class="sys">Ordsprog: <b>${esc(RELICS[s.relic].name)}</b> · ${esc(RELICS[s.relic].fx)}</div>`); await cont(); return; }
  if (s.heal) { heal(s.heal); topbar(); logAdd(`<div class="sys">+${s.heal} fatning</div>`); return; }
  if (s.choice) { const i = await choose(s.choice); return play(s.choice[i].go); }
  if (s.check) return check(s.check);
  if (s.quiz) return QUIZ[s.quiz]();
  if (s.fn) return FN[s.fn]();
}

/* ---------------- Dice checks (BG3) ---------------- */
async function check(c) {
  const bonus = Math.max(0, Math.floor(G.resp / 2));
  logAdd(`<div class="check-head"><span class="die-ico">d20</span><b>[SPROG]</b> ${esc(c.label)} <span class="dc">DC ${c.dc}</span><small>bonus +${bonus} (from standing)</small></div>`, 'check');
  let adv = false;
  if (c.think) {
    const i = await choose([{ label: 'Tænk på dansk først', sub: 'answer correctly → roll with advantage' }, { label: 'Just roll', sub: 'no help' }]);
    if (i === 0) {
      logAdd(`<p class="q">${esc(c.think.q)}</p>`, 'thought');
      const order = shuffle(c.think.opts.map((o, k) => k));
      const pick = await choose(order.map(k => ({ label: c.think.opts[k] })));
      adv = order[pick] === c.think.a;
      logAdd(`<div class="sys ${adv ? 'ok' : 'no'}">${adv ? 'Ja. Advantage: roll twice, keep the higher.' : 'Nej. It meant: ' + esc(c.think.opts[c.think.a]) + '.'}</div>`);
    }
  }
  const box = logAdd(`<div class="dice"><div class="d20">?</div>${adv ? '<div class="d20 b">?</div>' : ''}<div class="dres"></div></div>`, 'dice-entry');
  act('');
  const ds = box.querySelectorAll('.d20');
  const r1 = 1 + Math.floor(Math.random() * 20), r2 = 1 + Math.floor(Math.random() * 20);
  for (let k = 0; k < (FAST ? 1 : 14); k++) { ds.forEach(d => d.textContent = 1 + Math.floor(Math.random() * 20)); SFX.tick(); await sleep(60 + k * 6); }
  ds[0].textContent = r1; if (ds[1]) ds[1].textContent = r2;
  const roll = adv ? Math.max(r1, r2) : r1;
  const total = roll + bonus;
  const ok = roll === 20 || (roll !== 1 && total >= c.dc);
  box.querySelector('.dres').innerHTML = `${roll}${bonus ? ' + ' + bonus : ''} = <b>${total}</b> vs ${c.dc} · <span class="${ok ? 'ok' : 'no'}">${ok ? 'SUCCES' : 'FIASKO'}</span>`;
  box.classList.add(ok ? 'win' : 'lose');
  ok ? SFX.good() : SFX.bad();
  await cont();
  return play(ok ? c.ok : c.fail);
}

/* ---------------- Quizzes outside duels ---------------- */
const QUIZ = {
  async listen() {
    let right = 0;
    for (const it of LISTEN_MARKET) {
      const box = logAdd(`<div class="listen"><button class="btn small spk-big" data-say="${esc(it.da)}">${ICON.spk} Lyt</button><div class="ltext ${TTS.ok && TTS.on ? 'hidden' : ''}">${esc(it.da)}</div></div>`, 'quiz');
      const b = box.querySelector('[data-say]'); b.onclick = () => TTS.say(it.da, 0.85, true);
      TTS.say(it.da, 0.85);
      const order = shuffle([0, 1, 2]);
      const i = await choose(order.map(k => ({ label: it.opts[k] })));
      const ok = order[i] === 0;
      if (ok) right++;
      box.querySelector('.ltext').classList.remove('hidden');
      logAdd(`<div class="sys ${ok ? 'ok' : 'no'}">${ok ? 'Rigtigt.' : 'Not quite: “' + esc(it.opts[0]) + '”'}</div>`);
    }
    G.flags.listen = right;
    return;
  },
  async jobs() {
    let right = 0;
    for (const it of JOB_NOTICES) {
      logAdd(`<div class="notice"><div class="da">${esc(it.da)} <button class="spk" data-say="${esc(it.da)}">${ICON.spk}</button></div></div>`, 'quiz');
      document.querySelectorAll('.notice [data-say]').forEach(b => b.onclick = () => TTS.say(b.dataset.say, 0.85, true));
      const order = shuffle(it.opts);
      const i = await choose(order.map(k => ({ label: CHUNKS[k].da })));
      const ok = order[i] === it.a;
      if (ok) { right++; G.deck.J.push(it.a); }
      logAdd(`<div class="sys ${ok ? 'ok' : 'no'}">${ok ? `Rigtigt: <b>${esc(CHUNKS[it.a].da)}</b> (${esc(CHUNKS[it.a].en)}). New word added to your head.` : `It was <b>${esc(CHUNKS[it.a].da)}</b> (${esc(CHUNKS[it.a].en)}).`}</div>`);
    }
    logAdd(`<p>${right ? `You could now, in theory, claim to have been a ${esc(CHUNKS[JOB_NOTICES.find(j => G.deck.J.includes(j.a)).a].da)}. The Protocol would accept it. The Protocol accepts anything said properly.` : 'You learn nothing, except that the guild pays badly in every language.'}</p>`, 'narr');
    await cont();
  },
  async corrections() {
    let right = 0;
    for (const it of CORRECTIONS) {
      logAdd(`<div class="corr"><span class="corr-k">En elevs sætning</span><s>${esc(it.bad)}</s></div>`, 'quiz');
      const opts = shuffle([it.good, ...it.wrong]);
      const i = await choose(opts.map(o => ({ label: o })));
      const ok = opts[i] === it.good;
      if (ok) right++;
      logAdd(`<div class="sys ${ok ? 'ok' : 'no'}">${ok ? 'Rigtigt. ' : 'Nej: <b>' + esc(it.good) + '</b> '}<br><i>${esc(it.why)}</i></div>`);
    }
    G.flags.corr = right;
  },
  async forge() {
    const verbs = shuffle(FORGE_VERBS).slice(0, 8);
    let right = 0;
    const L = { ede: '-ede', te: '-te', irr: 'uregelmæssig' };
    for (const [inf, past, grp] of verbs) {
      logAdd(`<div class="forge-v">at <b>${esc(inf)}</b> → ?</div>`, 'quiz');
      const keys = ['ede', 'te', 'irr'];
      const i = await choose(keys.map(k => ({ label: L[k] })));
      const ok = keys[i] === grp;
      if (ok) right++;
      TTS.say(past, 0.85);
      logAdd(`<div class="sys ${ok ? 'ok' : 'no'}">${ok ? 'Klang.' : 'Klonk.'} ${esc(inf)} → <b>${esc(past)}</b> <button class="spk" data-say="${esc(past)}">${ICON.spk}</button>${grp === 'ede' ? ' <i>soft d</i>' : grp === 'te' ? ' <i>hard d… well, t</i>' : ''}</div>`).querySelectorAll('[data-say]').forEach(b => b.onclick = () => TTS.say(b.dataset.say, 0.85, true));
    }
    const lv = right >= 7 ? 2 : right >= 4 ? 1 : 0;
    logAdd(`<p>${right}/8 into the right fire. ${lv ? 'Holger grunts, which is a compliment, and tempers your grammar.' : 'Holger looks at the bent verbs, then at you, and charges you anyway.'}</p>`, 'narr');
    await cont();
    for (let k = 0; k < lv; k++) await pickLevelUp('Holger tempers one pattern');
    if (lv === 0) { G.sk = Math.max(0, G.sk - 1); topbar(); }
  },
};

async function pickLevelUp(label) {
  const pats = shuffle(Object.keys(PATTERNS).filter(p => PATTERNS[p].tier >= 2)).slice(0, 3);
  logAdd(`<div class="sys">${esc(label)}: choose a sentence pattern to level up.</div>`);
  const i = await choose(pats.map(p => ({ label: PATTERNS[p].name + ' → niv. ' + ((G.levels[p] || 1) + 1), sub: PATTERNS[p].en + ' · +8 chips, +1 mult' })));
  G.levels[pats[i]] = (G.levels[pats[i]] || 1) + 1;
  toast(PATTERNS[pats[i]].name + ' niv. ' + G.levels[pats[i]], 'gold');
}

/* ---------------- Story functions ---------------- */
const reasonToDu = s => s.replace(/\bjeg\b/g, 'du').replace(/\bmin\b/g, 'din').replace(/\bmit\b/g, 'dit').replace(/\bmine\b/g, 'dine');
const FN = {
  async originPlace() {
    const i = await choose(ORIGIN_PLACES.map(p => ({ label: p.en })));
    const P = ORIGIN_PLACES[i];
    logAdd(`<div class="build">Jeg boede <span class="gap">___</span> ${esc(P.noun)}.</div>`, 'quiz');
    const j = await choose([{ label: 'i' }, { label: 'på' }]);
    const ok = ['i', 'på'][j] === P.prep;
    G.origin.place = { da: P.prep + ' ' + P.noun, en: P.nounEn.startsWith('the') ? 'in ' + P.nounEn : (P.prep === 'på' ? 'on ' : 'in ') + P.nounEn };
    if (P.noun === 'landet') G.origin.place.en = 'in the countryside';
    TTS.say('Jeg boede ' + G.origin.place.da + '.');
    if (ok) {
      G.sk += 1;
      await step({ say: 'ib', en: "Good. One shilling, for the entertainment. Most people get that wrong for a year." });
    } else {
      await step({ say: 'ib', en: `'${G.origin.place.da}'. Islands and the countryside take 'på'. Cities and mountains take 'i'. Nobody knows why. It's the first thing they'll test you on and the last thing you'll get right.` });
    }
    await step({ th: `“Jeg boede ${G.origin.place.da}.” You say it aloud. It is the first true thing you have said in this language. To your own ears it sounds like someone dropping cutlery down a well.` });
  },
  async jobEcho() {
    const o = G.origin;
    if (o.jobSentence) await step({ n: `“${o.jobSentence}” you told him. Whether that was true is between you and your past. But it is written down now, in Danish, and in Vandmark what is written down in Danish is true.` });
    else await step({ n: 'You told Sørensen remarkably little. He wrote it down anyway. It is a very short entry.' });
  },
  async kjeldJob() {
    const o = G.origin;
    if (o.job) await step({ say: 'kjeld', da: `${cap(o.job.da)}? Hm. Vi har ikke brug for en ${o.job.da}. Vi har brug for nogen, der kan bære salt.`, en: `A ${o.job.en}? Hm. We don't need a ${o.job.en}. We need someone who can carry salt.`, gist: `He has already heard about you from Sørensen. He says "${o.job.da}" the way you might say "rash".` });
    else await step({ say: 'kjeld', da: 'Sørensen siger, du ikke har lavet noget. Godt. Så har du tid.', en: "Sørensen says you haven't done anything. Good. Then you have time.", gist: 'He has heard about you. Word travels fast in fog; there is nothing else to look at.' });
  },
  async reasonEcho() {
    const o = G.origin;
    if (o.reasonSentence) await step({ n: `“${o.reasonSentence}” That is your reason now. You notice Kjeld did not ask whether it was true. Nobody here asks that. They only ask whether it was said properly.` });
  },
  async marketAfter() {
    const r = G.flags.listen || 0;
    await step({ n: 'One of them looks up, sees you, and nudges the other. The cod is suddenly fascinating.' });
    await step({ say: 'fisk', da: 'Har du set vejret? Det kommer til at regne.', en: "Have you seen the weather? It's going to rain.", gist: 'Something about the weather, delivered with the intensity of someone changing the subject.' });
    G.sk += r; topbar();
    logAdd(`<div class="sys">${r}/3 understood · +${r} skilling (you sell the gossip to nobody, but you feel richer)</div>`);
    if (r >= 2) await step({ glimpse: 'margrethe' });
    if (r === 3) await step({ relic: 'oerer' });
    else await step({ th: 'Next time, listen harder. Or pay Ib. Mostly, listen harder.' });
  },
  async leoAfter() {
    const r = G.flags.corr || 0;
    await step({ say: 'leo', en: `${r} of ${CORRECTIONS.length}. ${r >= 4 ? 'Bravo. You make the right mistakes, which is rarer than you think.' : r >= 2 ? 'Not bad. Mistakes are information. You are very informative.' : 'Good. Now we know where to start, which is: everywhere.'}` });
    if (r >= 4 && !has('rodpen')) await step({ relic: 'rodpen' });
    else await pickLevelUp('Leo underlines a pattern in red');
    await step({ say: 'leo', en: "Why do I help? I like good food, good books, and watching people make mistakes. You have provided the third. Come back with the other two." });
    await step({ n: 'You ask him about the lights on the water. He stops, chalk in hand.' });
    await step({ say: 'leo', da: 'Det var ikke noget.', en: 'That was nothing.', gist: 'The sentence you have heard most since arriving. From him it sounds different. Like a door that has been closed gently rather than slammed.' });
    await step({ n: 'Then, much more quietly, in English: "Not yet."' });
    await step({ glimpse: 'pause' });
  },
  async shop() {
    const stock = [];
    const relicIds = shuffle(Object.keys(RELICS).filter(r => r !== 'bolle' && !has(r))).slice(0, 2);
    relicIds.forEach(r => stock.push({ kind: 'relic', id: r, price: RELICS[r].price }));
    const ch = shuffle([...CHUNK_POOL.R, ...CHUNK_POOL.J]).slice(0, 2);
    ch.forEach(c => stock.push({ kind: 'chunk', id: c, price: 3 }));
    stock.push({ kind: 'level', price: 5 }, { kind: 'heal', price: 3 });
    const render = () => new Promise(res => {
      const a = act(`<div class="shop">${stock.map((s, i) => {
        const sold = s.sold;
        let name, sub;
        if (s.kind === 'relic') { name = RELICS[s.id].name; sub = RELICS[s.id].fx; }
        if (s.kind === 'chunk') { name = '“' + CHUNKS[s.id].da + '”'; sub = 'New word: ' + CHUNKS[s.id].en; }
        if (s.kind === 'level') { name = 'Grammatikbog'; sub = 'Level up a sentence pattern'; }
        if (s.kind === 'heal') { name = 'Et glas snaps'; sub = '+10 composure. Medicinal.'; }
        return `<button class="ware ${sold ? 'sold' : ''}" data-i="${i}" ${sold || G.sk < s.price ? 'disabled' : ''}><b>${esc(name)}</b><small>${esc(sub)}</small><span class="price">${sold ? 'solgt' : s.price + ' sk'}</span></button>`;
      }).join('')}</div><button class="btn primary" id="leave">Gå videre ▸</button>`);
      a.querySelectorAll('.ware').forEach(b => b.onclick = async () => {
        const s = stock[+b.dataset.i];
        G.sk -= s.price; s.sold = true;
        if (s.kind === 'relic') addRelic(s.id);
        if (s.kind === 'chunk') { const f = ['MAIN_R', 'PGA', 'FORAT', 'FORDI', 'MENOGSAA', 'NP', 'INF', 'VPAST', 'ADV', 'MODAL', 'SUBJ'].includes(CHUNKS[s.id].t) ? 'R' : 'J'; G.deck[f].push(s.id); toast('Nyt ord: ' + CHUNKS[s.id].da, 'gold'); }
        if (s.kind === 'heal') heal(10);
        topbar();
        if (s.kind === 'level') { a.innerHTML = ''; await pickLevelUp('Ib sells you a grammar book with somebody else\'s notes in it'); }
        res('again');
      });
      $('#leave').onclick = () => res('leave');
    });
    while ((await render()) === 'again') { }
  },
  async ibDeal() {
    await step({ say: 'ib', en: "One more thing. Ten shillings, now, for a small favour, later. Nothing illegal. Nothing in writing. Certainly nothing in Danish." });
    const i = await choose([{ label: 'Take the ten shillings', sub: '+10 skilling · Ib will remember' }, { label: 'Decline', sub: 'He smiles as if you had said yes' }]);
    if (i === 0) { G.sk += 10; G.flags.ibDebt = true; topbar(); await step({ n: 'You have the feeling you have just signed something. You have not. Not in Danish, anyway.' }); }
    else await step({ n: '"Of course," says Ib. "Later, then." It is not clear which of you that was a threat to.' });
  },
  async rest() {
    if (G.sk >= 3) { G.sk -= 3; heal(G.compMax); logAdd('<div class="sys">−3 skilling · composure fully restored</div>'); }
    else { G.flags.hjordisDebt = true; heal(G.compMax); await step({ n: 'Hjørdis looks at your purse, sighs, and writes something in the ledger. You now owe her. In Vandmark, everybody is somebody\'s creditor.' }); }
    topbar();
  },
  async fritid() {
    const i = await choose(FRITID.map(f => ({ label: f.en })));
    const F = FRITID[i];
    logAdd(`<div class="build">Jeg <span class="gap">___</span> <small>(at ${esc(F.inf)}, in the past)</small></div>`, 'quiz');
    const opts = shuffle([F.good, ...F.bad]);
    const j = await choose(opts.map(o => ({ label: 'Jeg ' + o + '.' })));
    const ok = opts[j] === F.good;
    G.origin.fritid = { da: F.good, en: F.en };
    TTS.say('Jeg ' + F.good + '.');
    if (ok) { gainResp(1, 'Hjørdis approves'); await step({ say: 'hjordis', da: 'Nå. Det kan man da godt forstå.', en: 'Well. One can certainly understand that.', gist: 'Hjørdis nods. Possibly at you. Possibly at the ledger.' }); }
    else await step({ say: 'hjordis', da: `Du ${F.good}. Ikke “${opts[j]}”.`, en: `You ${F.en.toLowerCase()} ("${F.good}"). Not "${opts[j]}".`, gist: 'She corrects you without looking up, the way one straightens a picture frame in passing.' });
  },
  async braskReads() {
    const o = G.origin;
    const parts = [];
    if (o.place) parts.push(`Du boede ${o.place.da}.`);
    if (o.job) parts.push(`Du var ${o.job.da}.`);
    else if (o.workplace) parts.push(`Du arbejdede ${o.workplace}.`);
    else if (o.field) parts.push(`Du læste ${o.field}.`);
    else parts.push('Du var arbejdsløs.');
    if (o.reasonDa) parts.push(`Du kom hertil ${reasonToDu(o.reasonDa)}.`);
    if (o.fritid) parts.push(`Og du ${o.fritid.da}.`);
    const da = parts.join(' ');
    await step({ n: 'She opens your file, which is thinner than you expected and longer than you would like.' });
    await step({ say: 'brask', da, en: 'She reads your story back to you, in the second person: everything you have managed to say about yourself in Danish so far.', gist: 'Your life, as said by you, read back by her. It sounds smaller in her voice. Also more Danish.' });
    if (o.reasonDa && /vejret/.test(o.reasonDa)) await step({ say: 'brask', da: 'På grund af vejret. Det har ingen sagt før. Jeg skriver det med store bogstaver.', en: 'Because of the weather. Nobody has ever said that. I am writing it in capital letters.', gist: 'Something about the weather and big letters. Her pen moves with what could, under poor light, be called enthusiasm.' });
  },
};

/* =========================================================================
   DUELS
   ========================================================================= */
let D = null;
function runDuel(id) {
  return new Promise(resolve => {
    const def = DUELS[id];
    D = { id, def, npc: NPCS[def.npc], ri: 0, wins: 0, losses: 0, results: [], resolve, ext: false, forgiven: false, englishEver: false, respGained: 0, piles: {}, hand: [], row: [], handFam: null, uid: 0, busy: false };
    ['J', 'R'].forEach(f => D.piles[f] = { draw: shuffle(G.deck[f]), disc: [] });
    startRound(0);
  });
}
function startRound(ri) {
  const R = D.def.rounds[ri];
  D.ri = ri; D.R = R;
  D.dis = R.distrust; D.disMax = R.distrust;
  D.pat = R.patience + (D.bonusPat || 0); D.bonusPat = 0;
  D.discards = 3 + (has('naah') ? 1 : 0) + (META.upg.disc ? 1 : 0);
  D.turn = 0; D.first = true;
  D.qorder = R.questions.slice();
  newTurn();
}
function newTurn() {
  const R = D.R;
  D.q = Q[D.qorder[D.turn % D.qorder.length]];
  D.intent = R.intents[D.turn % R.intents.length];
  D.eng = false; D.hint = null; D.reply = D.reply || null;
  if (D.handFam !== D.q.fam) {
    if (D.handFam) { D.piles[D.handFam].disc.push(...D.hand.map(c => c.id), ...D.row.map(c => c.id)); }
    D.hand = []; D.row = []; D.handFam = D.q.fam;
  }
  fill();
  renderDuel();
  if (!(D.intent.type === 'fog' && !has('oerer'))) TTS.say(D.q.da);
  else TTS.say(D.q.da);
}
function drawOne(f) {
  const P = D.piles[f];
  if (!P.draw.length) { P.draw = shuffle(P.disc); P.disc = []; }
  if (!P.draw.length) return null;
  return { uid: ++D.uid, id: P.draw.pop() };
}
function fill() {
  const f = D.handFam, size = 9;
  while (D.hand.length + D.row.length < size) { const c = drawOne(f); if (!c) break; D.hand.push(c); }
  // make sure an answer exists (fair hands keep it a word game, not a lottery)
  const ids = () => [...D.hand, ...D.row].map(c => c.id);
  let tries = 0;
  while (!Grammar.solveAll(ids(), f, 6, 1).length && tries < 25) {
    const k = Math.floor(Math.random() * D.hand.length);
    D.piles[f].disc.push(D.hand[k].id);
    const c = drawOne(f); if (!c) break;
    D.hand[k] = c; tries++;
  }
  if (!Grammar.solveAll(ids(), f, 6, 1).length) {
    const kit = f === 'J' ? ['var', 'j_kok'] : ['flyttede', 'pga', 'np_job'];
    kit.forEach(id => D.hand.push({ uid: ++D.uid, id, temp: true }));
  }
}

function intentHTML(it) {
  const N = NEEDS[it.need] || { en: '', da: '' };
  const m = {
    sarcasm: ['Sarkasme', `−${it.dmg}`, 'Sarcasm after your answer. A ★★★ answer shrugs it off; ★★ halves it.'],
    fog: ['Tåge', `−${it.dmg}`, has('oerer') ? 'Fog. Your sharp ears cut through it.' : 'Fog. The question is hidden: tap the speaker and listen. ★★★ blocks the damage, ★★ halves it.'],
    english: ['Skifter til engelsk', '½', 'Switches to English. Your answer counts half, unless it is an advanced pattern (★★★+), which proves you can keep up.'],
    cross: ['Krydsforhør', '×2', `Cross-examination: ${N.en}. Do it for ×2 score. Otherwise −${it.dmg} composure.`],
    stamp: ['Stempel', `−${it.dmg}`, 'The stamp. Heavy damage after your answer; only a ★★★ answer halves it.'],
    redink: ['Rødt blæk', '×2 fejl', 'Red ink. A mistake this turn costs double composure.'],
  }[it.type];
  const need = it.type === 'cross' ? `<div class="need">${esc(N.da)}</div>` : '';
  return `<div class="intent i-${it.type}" title="${esc(m[2])}"><div class="in-k">Næste træk</div><b>${m[0]}</b><span>${m[1]}</span>${need}<p>${esc(m[2])}</p></div>`;
}

function cardHTML(c, where) {
  const ch = CHUNKS[c.id];
  const [lab, cls] = TYPE_LABEL[ch.t] || ['', ''];
  const hl = D.hint && D.hint.includes(c.uid) ? ' hint' : '';
  return `<button class="card ${cls}${hl}${c.temp ? ' temp' : ''}" data-uid="${c.uid}" data-where="${where}"><span class="lab">${lab}</span><span class="w">${esc(ch.da)}</span>${D.eng ? `<span class="g">${esc(ch.en)}</span>` : ''}</button>`;
}

function scoreOf(res, simulate) {
  const P = PATTERNS[res.pat];
  const lvl = G.levels[res.pat] || 1;
  let chips = P.chips + (lvl - 1) * 8 + res.toks.reduce((s, t) => s + (t.c || 2), 0);
  let mult = P.mult + (lvl - 1);
  const notes = [];
  let x = 1;
  if (res.opener && D.q.yn) { mult += 1; notes.push('ja/nej +1 mult'); }
  if (has('forstaa') && D.first) { mult += 2; notes.push('Det kan jeg godt forstå +2'); }
  if (has('egentlig') && (res.pat === 'FORDI' || res.pat === 'DOBBELT')) { chips += 15; notes.push('Egentlig +15'); }
  if (has('gerne')) { const n = res.toks.filter(t => t.t === 'ADV').length; if (n) { mult += n; notes.push('Gerne-ringen +' + n); } }
  if (has('hjemby') && G.origin.ids && res.ids.some(id => G.origin.ids.includes(id) && ['JOB', 'NP', 'INF', 'VPAST', 'PLACE'].includes(CHUNKS[id].t))) { mult += 3; notes.push('Hjembyens minde +3'); }
  const wrongQ = res.fam !== D.q.fam;
  if (wrongQ) { x *= 0.5; notes.push('wrong question ×½'); }
  if (D.intent.type === 'cross' && !wrongQ && meets(res, D.intent.need)) { x *= 2; notes.push('krydsforhør ×2'); }
  if (D.intent.type === 'english' && P.tier < 3) { x *= 0.5; notes.push('engelsk ×½'); }
  if (res.ids.includes('np_vejret') && !G.flags.vejretJoke && !wrongQ) { x *= 2; notes.push('vejret?! ×2'); }
  return { chips, mult, x, total: Math.round(chips * mult * x), notes, wrongQ };
}
function meets(res, need) {
  if (need === 'place') return !!(res.parts && res.parts.place);
  if (need === 'fordi') return res.pat === 'FORDI' || (res.segs || []).some(s => s.type === 'FORDI');
  if (need === 'foer') return res.pat === 'FOER_INV' || res.pat === 'FULD';
  if (need === 'dobbelt') return res.pat === 'DOBBELT';
  return false;
}

function renderDuel() {
  const npc = D.npc, R = D.R, boss = D.def.boss;
  const fog = D.intent.type === 'fog' && !has('oerer') && !D.eng;
  const pips = Array.from({ length: Math.max(D.pat, R.patience) }, (_, k) => `<i class="${k < D.pat ? 'on' : ''}"></i>`).join('');
  const rounds = boss ? `<div class="rounds">${D.def.rounds.map((r, k) => `<span class="${k === D.ri ? 'cur' : ''} ${D.results[k] === 'w' ? 'w' : D.results[k] === 'l' ? 'l' : ''}">${k + 1}. ${esc(r.name)}</span>`).join('')}</div>` : '';
  const ids = D.row.map(c => c.id);
  let prev = '<span class="pv-empty">Tap words to build your answer</span>';
  if (ids.length) {
    const res = Grammar.parse(ids);
    if (res.ok && res.opener && !D.q.yn) prev = has('rodpen') ? `<span class="warn">⚠ Leos rødpen: ja/nej?</span>` : `<span class="pv-empty">${esc(Grammar.sentence(ids))}</span>`;
    else if (res.ok) {
      const s = scoreOf(res);
      prev = `<span class="pv-name">${esc(PATTERNS[res.pat].name)}${'★'.repeat(PATTERNS[res.pat].tier)}</span><span class="chips">${s.chips}</span><span class="times">×</span><span class="mult">${s.mult}</span>${s.x !== 1 ? `<span class="xx">×${s.x}</span>` : ''}${s.wrongQ ? '<span class="warn">answers a different question</span>' : ''}`;
    } else if (has('rodpen') && res.err !== 'incomplete') prev = `<span class="warn">⚠ Leos rødpen: something is wrong</span>`;
    else prev = `<span class="pv-empty">${esc(Grammar.sentence(ids))}</span>`;
  }
  screen(`<div class="duel ${boss ? 'boss' : ''}">
    <div class="foe">
      <div class="portrait" style="--c:${npc.col}"><span>${npc.glyph}</span></div>
      <div class="foe-info">
        <div class="foe-name">${esc(npc.name)} <small>${esc(npc.role)}</small></div>
        ${rounds}
        <div class="dis"><div class="dis-bar"><i style="width:${Math.max(0, D.dis / D.disMax * 100)}%"></i></div><span>Mistillid <b>${Math.max(0, D.dis)}</b>/${D.disMax}</span></div>
        <div class="pat"><span>Tålmodighed</span>${pips}</div>
      </div>
      ${intentHTML(D.intent)}
    </div>
    <div class="question ${fog ? 'fog' : ''}">
      <button class="spk qspk" id="qspk">${ICON.spk}</button>
      <div class="q-da">${fog ? '<span class="fogtext">· · · ' + esc(D.q.da.replace(/[^\s?.,]/g, '·')).slice(0, 40) + '</span><small>Fog. Listen.</small>' : '“' + esc(D.q.da) + '”'}</div>
      ${D.eng ? `<div class="q-en">“${esc(D.q.en)}”</div>` : `<button class="engb" id="engb">På engelsk? <small>${has('ibkort') && !D.ibUsed ? 'free (Ib\'s card)' : '−1 anseelse'}</small></button>`}
    </div>
    <div class="reply" id="reply">${D.reply ? `<b>${esc(npc.name.split(' ').pop())}:</b> “${esc(D.reply[0])}”${D.eng || D.replyShowEn ? ` <i>${esc(D.reply[1])}</i>` : ''}` : ''}</div>
    <div class="sentence" id="row">${D.row.map(c => cardHTML(c, 'row')).join('') || '<span class="row-empty">…</span>'}</div>
    <div class="preview">${prev}</div>
    <div class="hand" id="hand">${D.hand.map(c => cardHTML(c, 'hand')).join('')}</div>
    <div class="controls">
      <button class="btn small" id="disc" ${D.discards && D.row.length ? '' : 'disabled'}>Omformulér <small>${D.discards}</small></button>
      <button class="btn small" id="clr" ${D.row.length ? '' : 'disabled'}>Ryd</button>
      <button class="btn small" id="hintb" ${G.sk >= 2 ? '' : 'disabled'}>Ib hvisker <small>2 sk</small></button>
      ${boss ? `<button class="btn small" id="pass">Tie stille <small>pass</small></button>` : ''}
      <button class="btn primary play" id="playb" ${D.row.length ? '' : 'disabled'}>Sig det ▸</button>
    </div>
    <div class="duel-help">Omformulér = swap the selected words for new ones. Ib hvisker = he points at the words of a good answer (not the order).</div>
  </div>`, 'duel-screen');
  wireDuel();
}
function wireDuel() {
  document.querySelectorAll('.card').forEach(b => b.onclick = () => {
    if (D.busy) return;
    const uid = +b.dataset.uid;
    if (b.dataset.where === 'hand') { const k = D.hand.findIndex(c => c.uid === uid); D.row.push(D.hand.splice(k, 1)[0]); TTS.say(CHUNKS[D.row[D.row.length - 1].id].da, 1.0); }
    else { const k = D.row.findIndex(c => c.uid === uid); D.hand.push(D.row.splice(k, 1)[0]); }
    SFX.tick(); renderDuel();
  });
  $('#qspk').onclick = () => TTS.say(D.q.da, 0.8, true);
  const eb = $('#engb');
  if (eb) eb.onclick = () => {
    if (D.busy) return;
    D.eng = true;
    if (has('ibkort') && !D.ibUsed) { D.ibUsed = true; toast("Ib's card: free this time", 'gold'); }
    else { gainResp(-1, 'asked for English'); G.stats.eng++; D.englishEver = true; }
    D.reply = D.def.lines.eng; D.replyShowEn = true;
    renderDuel();
  };
  $('#clr').onclick = () => { D.hand.push(...D.row); D.row = []; renderDuel(); };
  $('#disc').onclick = () => {
    if (!D.discards || !D.row.length) return;
    D.discards--;
    D.piles[D.handFam].disc.push(...D.row.filter(c => !c.temp).map(c => c.id));
    D.row = []; fill(); renderDuel();
  };
  $('#hintb').onclick = () => {
    if (G.sk < 2) return;
    const all = [...D.hand, ...D.row];
    const b = Grammar.best(all.map(c => c.id), D.q.fam, 7, !D.q.yn);
    if (!b) { toast('Ib shrugs. Even he has nothing.'); return; }
    G.sk -= 2;
    const pool = all.slice(); D.hint = [];
    b.ids.forEach(id => { const k = pool.findIndex(c => c.id === id); D.hint.push(pool[k].uid); pool.splice(k, 1); });
    D.hand.push(...D.row); D.row = [];
    renderDuel();
  };
  const pb = $('#pass');
  if (pb) pb.onclick = () => { if (!D.busy) endRound(false, true); };
  $('#playb').onclick = () => { if (!D.busy && D.row.length) playHand(); };
}

async function playHand() {
  D.busy = true;
  const ids = D.row.map(c => c.id);
  let res = Grammar.parse(ids);
  if (res.ok && res.opener && !D.q.yn) res = Object.assign({}, res, { ok: false, err: 'opener_q' });
  const sent = Grammar.sentence(ids);
  TTS.say(sent, 0.95, false);
  G.stats.sent++;
  const pop = document.createElement('div');
  pop.className = 'scorepop';
  document.querySelector('.duel').appendChild(pop);
  const lines = D.def.lines;
  let dmgTaken = 0;
  let advanced = false;

  if (!res.ok) {
    G.stats.err++;
    let cost = res.err === 'incomplete' ? 2 : 3;
    if (D.intent.type === 'redink') cost *= 2;
    const forgive = has('rodpen') && !D.forgiven;
    if (forgive) { D.forgiven = true; cost = 0; }
    const ex = Grammar.explain(res);
    const fix = Grammar.reorder(ids, D.q.fam);
    pop.innerHTML = `<div class="sp-sent bad">${esc(sent)}</div>
      <div class="err"><b>${esc(ex.title)}</b><p>${esc(ex.en)}</p>${fix ? `<p class="fix">Did you mean: <b>${esc(Grammar.sentence(fix.ids))}</b> <button class="spk" data-say="${esc(Grammar.sentence(fix.ids))}">${ICON.spk}</button></p>` : ''}</div>
      <div class="sp-cost">${forgive ? 'Leos rødpen: no cost this time' : '−' + cost + ' fatning'}</div>
      <button class="btn primary" id="okb">Forstået</button>`;
    pop.querySelectorAll('[data-say]').forEach(b => b.onclick = () => TTS.say(b.dataset.say, 0.85, true));
    SFX.bad();
    G.comp -= cost; dmgTaken += cost;
    D.reply = rnd(lines.err); D.replyShowEn = false;
    await new Promise(r => { $('#okb').onclick = r; });
  } else {
    const s = scoreOf(res);
    const P = PATTERNS[res.pat];
    advanced = P.tier >= 3 && !s.wrongQ;
    pop.innerHTML = `<div class="sp-sent">${esc(sent)}</div>
      <div class="sp-pat">${esc(P.name)} <span class="stars">${'★'.repeat(P.tier)}</span></div>
      <div class="sp-calc"><span class="chips" id="spc">0</span><span class="times">×</span><span class="mult">${s.mult}</span>${s.x !== 1 ? `<span class="xx">×${s.x}</span>` : ''}</div>
      <div class="sp-notes">${s.notes.map(esc).join(' · ')}</div>
      <div class="sp-total" id="spt"></div>`;
    for (let k = 0; k <= (FAST ? 0 : 10); k++) { const el = $('#spc'); if (el) el.textContent = Math.round(s.chips * (FAST ? 1 : k / 10)); SFX.tick(); await sleep(40); }
    $('#spt').textContent = s.total;
    SFX.good();
    D.dis -= s.total;
    learn(ids);
    if (s.total > G.stats.best) { G.stats.best = s.total; G.stats.bestSentence = sent; }
    if (res.ids.includes('np_vejret') && !s.wrongQ && !G.flags.vejretJoke) { G.flags.vejretJoke = true; gainResp(1, 'nobody has ever said that'); }
    captureOrigin(res, sent);
    if (s.wrongQ) { D.reply = lines.wrongq; }
    else {
      D.reply = rnd(tierIdx() >= 2 || advanced ? (lines.good1 || lines.good) : lines.good);
      if (advanced && !D.eng && D.respGained < 3) { D.respGained++; gainResp(1, 'good Danish'); }
    }
    D.replyShowEn = false;
    await sleep(FAST ? 10 : 1200);
  }
  pop.remove();
  D.first = false;
  D.row.forEach(c => { if (!c.temp) D.piles[D.handFam].disc.push(c.id); });
  D.row = [];

  if (D.dis <= 0) { D.busy = false; return endRound(true); }

  // the other side acts
  const it = D.intent;
  let dmg = 0;
  const tierPlayed = res.ok && !res.wrongQ && res.fam === D.q.fam ? PATTERNS[res.pat].tier : 0;
  if (['sarcasm', 'fog', 'stamp'].includes(it.type)) {
    dmg = it.dmg;
    if (tierPlayed >= 3) dmg = it.type === 'stamp' ? Math.ceil(dmg / 2) : 0;
    else if (tierPlayed === 2) dmg = Math.ceil(dmg / 2);
    if (it.dmg && !dmg) toast('Parried with good Danish', 'good');
  }
  if (it.type === 'cross' && !(res.ok && !res.wrongQ && meets(res, it.need))) dmg = it.dmg;
  if (dmg) {
    G.comp -= dmg;
    if (!res.ok || ['sarcasm', 'stamp', 'cross'].includes(it.type)) D.reply = it.type === 'stamp' ? ['*STEMPEL*', '*STAMP*'] : rnd(lines.attack);
    renderDuel();
    const f = document.querySelector('.foe'); if (f) f.classList.add('strike');
    toast('−' + dmg + ' fatning', 'bad'); SFX.hit();
    await sleep(FAST ? 10 : 650);
  }
  if (G.comp <= 0) { D.busy = false; return D.resolve('lose'); }
  D.pat--;
  D.turn++;
  if (D.pat <= 0) {
    if (D.def.boss) { D.busy = false; return endRound(false); }
    if (!D.ext) {
      D.ext = true; D.pat = 2; G.comp -= 6;
      D.reply = ['Én gang til. Så er det færgen.', "One more time. Then it's the ferry."]; D.replyShowEn = true;
      toast('Patience runs out · −6 fatning · two last chances', 'bad');
      if (G.comp <= 0) { D.busy = false; return D.resolve('lose'); }
    } else { D.busy = false; return D.resolve('lose'); }
  }
  D.busy = false;
  newTurn();
}

function captureOrigin(res, sent) {
  const o = G.origin;
  if (res.fam === 'J' && !o.jobSentence && res.fam === D.q.fam) {
    o.jobSentence = sent;
    o.jobEn = res.toks.map(t => t.en.replace(/ \(inverted\)/, '')).join(' ');
    if (res.parts.job) o.job = { da: res.parts.job.da, en: res.parts.job.en, id: res.parts.job.id };
    if (res.parts.place) o.workplace = res.parts.prep.w + ' ' + res.parts.place.da;
    if (res.parts.field) o.field = res.parts.field.da;
    o.ids = (o.ids || []).concat(res.ids);
    toast('Din fortid: written in the Protocol', 'gold');
  }
  if (res.fam === 'R' && !o.reasonSentence && res.fam === D.q.fam) {
    o.reasonSentence = sent;
    o.reasonEn = res.toks.map(t => t.en.replace(/ \(.*\)/, '')).join(' ');
    const segs = res.segs.map(sg => sg.toks.map(t => t.da).join(' '));
    o.reasonDa = segs.join(', men også ');
    o.ids = (o.ids || []).concat(res.ids);
    toast('Din fortid: written in the Protocol', 'gold');
  }
}

async function endRound(won, passed) {
  const boss = D.def.boss;
  if (!boss) {
    if (!D.englishEver) gainResp(1, 'no English needed');
    G.sk += 4 + Math.max(0, D.pat);
    heal(5);
    return D.resolve('win');
  }
  D.results[D.ri] = won ? 'w' : 'l';
  won ? D.wins++ : D.losses++;
  if (passed) { heal(5); D.bonusPat = 1; }
  const R = D.R;
  const msg = won ? `Runde ${D.ri + 1} vundet` : passed ? `Du tier stille. Runde ${D.ri + 1} tabt. +5 fatning, +1 tålmodighed next round` : `Runde ${D.ri + 1} tabt`;
  toast(msg, won ? 'gold' : 'bad');
  if (D.wins >= 2) { if (!D.englishEver) gainResp(2, 'the Protocol is impressed'); G.sk += 6; return D.resolve('win'); }
  if (D.losses >= 2) return D.resolve('lose');
  D.reply = won ? ['Hm. Næste side.', 'Hm. Next page.'] : ['Det skriver jeg. Med rødt.', "I'm writing that. In red."];
  D.replyShowEn = true;
  await sleep(FAST ? 10 : 700);
  startRound(D.ri + 1);
}

/* ---------------- Rewards ---------------- */
async function reward(duelId) {
  const fam = DUELS[duelId].rounds[0].questions.map(q => Q[q].fam)[0];
  const relic = rnd(Object.keys(RELICS).filter(r => r !== 'bolle' && !has(r)));
  const pool = shuffle(CHUNK_POOL[fam === 'J' ? 'R' : 'J'].concat(CHUNK_POOL[fam === 'J' ? 'R' : 'J'])).filter((v, i, a) => a.indexOf(v) === i);
  // after the job duel you'll need reasons next; after reasons, past + reasons for the boss
  const nextFam = fam === 'J' ? 'R' : 'J';
  const pack = (fam === 'J' ? ['menogsaa', ...shuffle(CHUNK_POOL.R.filter(x => x !== 'menogsaa')).slice(0, 1)] : shuffle(CHUNK_POOL.J).slice(0, 2));
  const pat = rnd(Object.keys(PATTERNS).filter(p => PATTERNS[p].fam === nextFam && PATTERNS[p].tier >= 2));
  const opts = [
    relic && { kind: 'relic', id: relic, title: RELICS[relic].name, sub: RELICS[relic].en, fx: RELICS[relic].fx, k: 'Ordsprog' },
    { kind: 'chunks', ids: pack, title: pack.map(id => '“' + CHUNKS[id].da + '”').join(' + '), sub: pack.map(id => CHUNKS[id].en).join(' · '), fx: 'New words for your head.', k: 'Nye ord' },
    { kind: 'level', id: pat, title: PATTERNS[pat].name + ' → niv. ' + ((G.levels[pat] || 1) + 1), sub: PATTERNS[pat].en, fx: '+8 chips, +1 mult whenever you use it. e.g. ' + PATTERNS[pat].ex, k: 'Grammatik' },
  ].filter(Boolean);
  screen(`<div class="reward">
    <p class="kicker">Overbevist · convinced</p><h2>Choose what you take with you</h2>
    <p class="en">+ skilling earned · standing ${esc(tier().name)} (${G.resp})</p>
    <div class="rw-opts">${opts.map((o, i) => `<button class="rw k-${o.kind}" data-i="${i}"><span class="rw-k">${o.k}</span><b>${esc(o.title)}</b><i>${esc(o.sub)}</i><p>${esc(o.fx)}</p></button>`).join('')}</div>
  </div>`, 'reward-screen');
  document.querySelectorAll('.rw').forEach(b => b.onclick = () => {
    const o = opts[+b.dataset.i];
    if (o.kind === 'relic') addRelic(o.id);
    if (o.kind === 'chunks') o.ids.forEach(id => { const f = ['MAIN_R', 'PGA', 'FORAT', 'FORDI', 'MENOGSAA', 'NP', 'INF', 'VPAST', 'ADV', 'MODAL', 'SUBJ'].includes(CHUNKS[id].t) ? 'R' : 'J'; G.deck[f].push(id); });
    if (o.kind === 'level') G.levels[o.id] = (G.levels[o.id] || 1) + 1;
    save(); map();
  });
}

/* ---------------- Losing & between attempts ---------------- */
async function gameOver() {
  META.deaths++;
  META.xp += Math.max(2, Math.floor(G.stats.sent * 0.8) + G.done.length * 2);
  saveMeta();
  const lines = [
    'Your composure gives out. You are escorted, politely, firmly and in English, to the ferry.',
    'The ferry does not leave until Thursday. Nothing in Vandmark leaves until Thursday.',
  ];
  const leo = META.deaths === 1 ? "Again? Good. 'Again' is how this works." : META.deaths === 2 ? 'You are becoming a regular. Regulars get the good chair. There is no good chair.' : 'Sæt dig. You know where.';
  const origin = G.origin;
  screen(`<div class="over">
    <p class="kicker">Afvist · rejected</p><h2>Det var ikke noget</h2>
    ${lines.map(l => `<p class="narr">${esc(l)}</p>`).join('')}
    <p class="narr">You spend the wait in Mester Leonardo's cellar. He does not ask what happened. He seems to know.</p>
    <div class="say"><div class="who"><span class="glyph" style="--c:${NPCS.leo.col}">L</span><b>Mester Leonardo</b></div><div class="line-en">“${esc(leo)}”</div></div>
    <div class="meta-shop"><h3>Erfaring <b>${META.xp}</b> <small>experience: what stays when everything else goes</small></h3>
      ${META_UPGRADES.map(u => `<button class="ware ${META.upg[u.id] ? 'sold' : ''}" data-u="${u.id}" ${META.upg[u.id] || META.xp < u.cost ? 'disabled' : ''}><b>${esc(u.name)}</b><small>${esc(u.fx)}</small><span class="price">${META.upg[u.id] ? 'lært' : u.cost + ' xp'}</span></button>`).join('')}
    </div>
    <button class="btn primary" id="again">Thursday comes ▸</button>
  </div>`, 'over-screen');
  document.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { const u = META_UPGRADES.find(x => x.id === b.dataset.u); META.xp -= u.cost; META.upg[u.id] = true; saveMeta(); gameOver2(origin); });
  $('#again').onclick = () => restartFromThursday(origin);
  clearSave();
}
function gameOver2(origin) { META.deaths--; gameOver(); }
async function restartFromThursday(origin) {
  newRun({ place: origin.place });
  G.done = ['prolog']; G.row = 1;
  scene('Torsdag', 'Thursday');
  await play([
    { n: 'Thursday comes. The ferry leaves. You are, it turns out, not on it.' },
    { th: 'Everything you told them is forgotten, except where you lived. Everything you learned is still in your head. That, Leo says, is the only part that was ever yours.' },
  ]);
  map();
}

/* ---------------- Session end ---------------- */
function sessionEnd() {
  META.cleared = Math.max(META.cleared, 1); saveMeta();
  const S = sess(), o = G.origin;
  screen(`<div class="end">
    <p class="kicker">${esc(S.chapter)}</p><h2>Registreret. Midlertidig.</h2>
    <p class="narr">You are, officially, someone. Temporarily.</p>
    <div class="end-grid">
      <div><span>Anseelse</span><b>${esc(tier().name)}</b><small>${G.resp} · ${esc(tier().en)}</small></div>
      <div><span>Glimt</span><b>${G.glimpses.length}/${Object.keys(GLIMPSES).length}</b><small>glimpses of the hidden thing</small></div>
      <div><span>Sætninger</span><b>${G.stats.sent}</b><small>${G.stats.err} mistakes · ${G.stats.eng} English asks</small></div>
      <div><span>Bedste</span><b>${G.stats.best}</b><small>${esc(G.stats.bestSentence)}</small></div>
    </div>
    <h3>In the Protocol</h3>
    <div class="protocol">${[o.place && 'Jeg boede ' + o.place.da + '.', o.jobSentence, o.reasonSentence, o.fritid && 'Jeg ' + o.fritid.da + '.'].filter(Boolean).map(l => `<p>${esc(l)}</p>`).join('') || '<p>(blank)</p>'}</div>
    <div class="next"><p class="kicker">Næste gang</p><h3>${esc(S.next.title)}</h3><p class="en">${esc(S.next.en)}</p><p class="narr">${esc(S.next.teaser)}</p><p class="small-print">Lesson 2 is not built yet. This is the prototype: tell Claude what to change.</p></div>
    <button class="btn" id="again">Play again from the ferry</button>
  </div>`, 'end-screen');
  clearSave();
  $('#again').onclick = () => { newRun(); runNode(sess().map[0][0]); };
}

/* ---------------- Dev autoplay (for testing) ---------------- */
window.__dev = {
  get G() { return G; }, get D() { return D; },
  setRow(ids) {
    D.hand.push(...D.row); D.row = [];
    ids.forEach(id => { const k = D.hand.findIndex(c => c.id === id); if (k >= 0) D.row.push(D.hand.splice(k, 1)[0]); });
    renderDuel();
  },
  solveNow() {
    if (!D) return false;
    const all = [...D.hand, ...D.row];
    const b = Grammar.best(all.map(c => c.id), D.q.fam, 8, !D.q.yn);
    if (!b) return false;
    D.hand.push(...D.row); D.row = [];
    b.ids.forEach(id => { const k = D.hand.findIndex(c => c.id === id); D.row.push(D.hand.splice(k, 1)[0]); });
    renderDuel();
    return true;
  },
};

TTS.init();
title();
