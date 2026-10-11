/* =========================================================================
   DET VAR IKKE NOGET — engine (v2: contracts, dialogue, d20)
   ========================================================================= */
window.__dev = { get G() { return G; } };
const NAMES = ['Margrethe', 'Kjeld', 'Bramsen', 'Hjørdis', 'Ib'];
const KEY = 'dvin2_save', META_KEY = 'dvin2_meta';
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FAST = /[?&]fast/.test(location.search);
const TIERS = [[-99, 'Turist'], [0, 'Udlænding'], [6, 'Tilflytter'], [15, 'Nabo'], [30, 'Vandmarker']];

/* ---------------- speech (optional, never required) ---------------- */
const TTS = {
  ok: 'speechSynthesis' in window, on: true, voice: null,
  init() { if (!this.ok) return; const p = () => { this.voice = speechSynthesis.getVoices().find(v => /^da/i.test(v.lang)) || null; }; p(); speechSynthesis.onvoiceschanged = p; try { this.on = localStorage.getItem('dvin2_tts') !== '0'; } catch (e) { } },
  say(t, force) { if (!this.ok || FAST || (!this.on && !force)) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'da-DK'; if (this.voice) u.voice = this.voice; u.rate = .9; speechSynthesis.speak(u); } catch (e) { } },
};
/* ambient sea + wind, generated (optional) */
const AMB = (() => {
  let ctx, gain, on = false;
  function start() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      const lfo = ctx.createOscillator(); lfo.frequency.value = .08; const lg = ctx.createGain(); lg.gain.value = .25;
      gain = ctx.createGain(); gain.gain.value = .35;
      lfo.connect(lg); lg.connect(gain.gain); src.connect(lp); lp.connect(gain); gain.connect(ctx.destination); src.start(); lfo.start();
      on = true;
    } catch (e) { }
  }
  return { toggle() { if (!on) start(); else if (ctx) { ctx.state === 'running' ? ctx.suspend() : ctx.resume(); } }, get on() { return on && ctx && ctx.state === 'running'; } };
})();

/* ---------------- state ---------------- */
let G = null;
let META = (() => { try { return Object.assign({ mastery: {}, runs: 0, words: {} }, JSON.parse(localStorage.getItem(META_KEY) || '{}')); } catch (e) { return { mastery: {}, runs: 0, words: {} }; } })();
const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch (e) { } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { } };
function newGame() {
  G = { stats: { SPROG: 1, LOEGN: 1, SNIGE: 1, HANDEL: 1, INDSIGT: 1 }, points: 3, xp: 0, level: 1, sk: 6, resp: 0, insp: 1,
    flags: {}, origin: {}, glimpses: [], used: {}, contract: 'lys', node: null, log: { built: 0, perfect: 0, rolls: 0, wins: 0, eng: 0 } };
}
const C = () => CONTRACTS[G.contract];
const tierName = () => { let t = TIERS[0][1]; for (const [m, n] of TIERS) if (G.resp >= m) t = n; return t; };
const mastery = k => META.mastery[k] || 0;

function addXP(n, why) {
  if (!n) return;
  G.xp += n;
  toast(`+${n} XP${why ? ' · ' + why : ''}`);
  while (G.level < LEVELS.length && G.xp >= LEVELS[G.level]) { G.level++; G.points++; toast(`Niveau ${G.level}! +1 færdighedspoint`, 'gold'); }
  hud();
}
function fx(f) {
  if (!f) return;
  if (f.sk) { let n = f.sk; if (n >= 20 && G.flags.cheap) n -= 10; if (n >= 20 && G.flags.guard) n += 10; G.sk += n; toast(`${n > 0 ? '+' : ''}${n} skilling`, n > 0 ? 'gold' : 'bad'); }
  if (f.resp) { G.resp += f.resp; toast(`${f.resp > 0 ? '+' : ''}${f.resp} anseelse`, f.resp > 0 ? 'good' : 'bad'); }
  if (f.flag) G.flags[f.flag] = true;
  if (f.origin) Object.assign(G.origin, f.origin);
  if (f.xp) addXP(f.xp);
  hud();
}

/* ---------------- chrome ---------------- */
function hud() {
  const h = $('#hud');
  if (!G) { h.innerHTML = ''; return; }
  const next = LEVELS[G.level] || G.xp, prev = LEVELS[G.level - 1] || 0;
  h.innerHTML = `<div class="h-l"><b>${esc(tierName())}</b><span class="xp"><i style="width:${Math.min(100, (G.xp - prev) / Math.max(1, next - prev) * 100)}%"></i></span><small>niv. ${G.level}</small></div>
    <div class="h-r"><span title="skilling">${G.sk} sk</span><span title="inspiration" class="insp">✦ ${G.insp}</span>
    <button class="ib" id="bJ" aria-label="Dagbog">☰</button></div>`;
  $('#bJ').onclick = journal;
}
function toast(m, c = '') { const t = document.createElement('div'); t.className = 'toast ' + c; t.textContent = m; $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), FAST ? 30 : 1900); setTimeout(() => t.remove(), FAST ? 60 : 2500); }

/* tap-to-gloss: every Danish word is tappable, free */
function daHTML(s) {
  return esc(s).replace(/([A-Za-zÆØÅæøå]+)/g, w => `<span class="w" data-w="${w.toLowerCase()}">${w}</span>`);
}
function wireWords(el) {
  el.querySelectorAll('.w').forEach(sp => sp.onclick = e => {
    e.stopPropagation();
    document.querySelectorAll('.gloss').forEach(g => g.remove());
    const w = sp.dataset.w, en = DICT[w] || (/^[A-ZÆØÅ]/.test(sp.textContent) ? '(a name)' : '—');
    META.words[w] = (META.words[w] || 0) + 1; saveMeta();
    const g = document.createElement('div'); g.className = 'gloss'; g.innerHTML = `<b>${esc(sp.textContent)}</b> ${esc(en)}`;
    document.body.appendChild(g);
    const r = sp.getBoundingClientRect();
    g.style.left = Math.max(8, Math.min(innerWidth - g.offsetWidth - 8, r.left + r.width / 2 - g.offsetWidth / 2)) + 'px';
    g.style.top = (r.top - g.offsetHeight - 6) + 'px';
    sp.classList.add('seen');
    setTimeout(() => g.remove(), 2600);
  });
}
document.addEventListener('click', () => document.querySelectorAll('.gloss').forEach(g => g.remove()));

/* ---------------- stage ---------------- */
function stage(bg, npcId, title) {
  const npc = npcId ? NPCS[npcId] : null;
  $('#app').innerHTML = `
    <div class="stage">${ART.scene(bg)}<div class="fogA"></div><div class="fogB"></div>
      ${npc ? `<div class="npc">${ART.portrait(npc.pt)}</div>` : ''}
      <div class="loc">${esc(title || '')}</div></div>
    <div class="panel"><div class="log" id="log"></div><div class="opts" id="opts"></div></div>`;
  hud();
}
function logAdd(html, cls = '') {
  const d = document.createElement('div'); d.className = 'e ' + cls; d.innerHTML = html;
  $('#log').appendChild(d); wireWords(d);
  requestAnimationFrame(() => d.classList.add('in'));
  const L = $('#log'); setTimeout(() => L.scrollTop = L.scrollHeight, 20);
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
    wireWords(o);
  });
}
function tpl(s) {
  return s.replace('{when}', G.flags.thursday ? 'Thursday, as promised:' : 'It takes four nights of standing on the pier. On the fourth, a Thursday,');
}

function sayEntry(st) {
  const npc = NPCS[st.say];
  if (!st.da) return logAdd(`<div class="who">${esc(npc.name)} <i>in English</i></div><div class="en-line">“${esc(st.en)}”</div>`, 'say eng');
  const el = logAdd(`<div class="who">${esc(npc.name)}</div><div class="da">“${daHTML(st.da)}”</div>
    <div class="tools"><button class="tb speak">♪ lyt</button><button class="tb english">På engelsk? <small>−1 anseelse</small></button></div><div class="en hidden">“${esc(st.en)}”</div>`, 'say');
  el.querySelector('.speak').onclick = e => { e.stopPropagation(); TTS.say(st.da, true); };
  el.querySelector('.english').onclick = e => {
    e.stopPropagation();
    e.target.closest('.english').remove();
    el.querySelector('.en').classList.remove('hidden');
    G.resp -= 1; G.log.eng++; toast('−1 anseelse · they noticed', 'bad'); hud();
  };
  TTS.say(st.da);
  return el;
}

async function steps(list) {
  for (const st of list || []) {
    if (st.n) { logAdd(`<p>${esc(tpl(st.n))}</p>`, 'narr'); await tapOn(); }
    else if (st.th) { logAdd(`<p>${esc(st.th)}</p>`, 'thought'); await tapOn(); }
    else if (st.say) { sayEntry(st); await tapOn(); }
    else if (st.fx) fx(st.fx);
    else if (st.glimpse) { await glimpse(st.glimpse); }
    else if (st.letter) { await letter(st.letter); }
    else if (st.special) { await SPECIAL[st.special](); }
  }
}
async function glimpse(id) {
  const g = GLIMPSES[id];
  if (!G.glimpses.includes(id)) { G.glimpses.push(id); addXP(3, 'glimt'); }
  logAdd(`<div class="gl"><span>Glimt</span><b>${esc(g.name)}</b><i>${esc(g.en)}</i><p>${esc(g.text)}</p></div>`, 'glimpse');
  await tapOn();
}

/* ---------------- reading: letters & ledgers ---------------- */
async function letter(id) {
  const L = LETTERS[id];
  logAdd(`<div class="letter"><div class="lt">${esc(L.title)}</div>${L.lines.map(l => `<p>${daHTML(l)}</p>`).join('')}</div>`, 'paper');
  logAdd(`<p>Tap any word you don't know. It's free. Then:</p>`, 'thought');
  for (const q of L.qs) {
    logAdd(`<p class="q">${esc(q.q)}</p>`, 'thought');
    const order = shuffle(q.opts.map((_, i) => i));
    const i = await choices(order.map(k => ({ html: esc(q.opts[k]) })));
    const ok = order[i] === q.a;
    if (ok) { addXP(2, 'forstået'); if (q.flag) G.flags[q.flag] = true; }
    logAdd(`<div class="res ${ok ? 'ok' : 'no'}">${ok ? 'Ja.' : 'No: ' + esc(q.opts[q.a]) + '.'}</div>`);
  }
}

/* ---------------- sentence builder ---------------- */
function builder(b, phraseKey) {
  return new Promise(resolve => {
    window.__dev.cur = b;
    const low = a => a.map(w => w.toLowerCase()).join(' ');
    const all = [...b.answers, ...(b.best || [])].map(low);
    const tiles = shuffle((b.tiles || [...b.answers[0], ...(b.extra || [])]).map((t, i) => ({ t: /^[A-ZÆØÅ]/.test(t) && !NAMES.includes(t) ? t.toLowerCase() : t, i })));
    let line = [], mistakes = 0;
    const ov = document.createElement('div'); ov.className = 'sheet-ov';
    document.body.appendChild(ov);
    const rule = phraseKey && PHRASES[phraseKey] ? PHRASES[phraseKey].rule : null;
    const render = (msg, bad) => {
      ov.innerHTML = `<div class="sheet">
        <div class="intent"><small>Say it in Danish</small>${esc(b.en)}</div>
        <div class="line ${bad ? 'shake' : ''}">${line.map((x, k) => `<button class="tile in ${bad && k === bad.at ? 'wrong' : ''}" data-k="${k}">${esc(x.t)}</button>`).join('') || '<span class="ph">tap the words in order</span>'}</div>
        ${msg ? `<div class="msg">${msg}</div>` : ''}
        <div class="pool">${tiles.map(x => `<button class="tile" data-i="${x.i}" ${line.includes(x) ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>
        <div class="brow"><button class="btn ghost" id="bClr">Ryd</button>${mistakes >= 2 ? '<button class="btn ghost" id="bShow">Vis svaret</button>' : ''}<button class="btn gold" id="bOk" ${line.length ? '' : 'disabled'}>Sig det</button></div></div>`;
      ov.querySelectorAll('.pool .tile').forEach(t => t.onclick = () => { line.push(tiles.find(x => x.i === +t.dataset.i)); render(); });
      ov.querySelectorAll('.line .tile').forEach(t => t.onclick = () => { line.splice(+t.dataset.k, 1); render(); });
      $('#bClr').onclick = () => { line = []; render(); };
      const sh = $('#bShow'); if (sh) sh.onclick = () => finish(b.answers[0], 'shown');
      $('#bOk').onclick = check;
    };
    const finish = (words, how) => {
      ov.remove();
      let sentence = words.join(' ');
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      const best = (b.best || []).some(a => low(a) === sentence.toLowerCase());
      resolve({ sentence, mistakes, how, best });
    };
    const check = () => {
      const s = line.map(x => x.t.toLowerCase()).join(' ');
      if (all.includes(s)) { TTS.say(s); return finish(line.map(x => x.t), mistakes === 0 ? 'perfect' : 'ok'); }
      mistakes++;
      // first wrong position against the closest answer
      const cand = [...b.answers, ...(b.best || [])];
      let at = 0, bestLen = -1;
      for (const a of cand) { let k = 0; while (k < line.length && a[k] && line[k].t.toLowerCase() === a[k].toLowerCase()) k++; if (k > bestLen) { bestLen = k; at = k; } }
      const msg = mistakes === 1 ? `Not quite. The first problem is word ${at + 1}.` : `Still not right.${rule ? ' <i>' + esc(rule) + '</i>' : ''}`;
      render(msg, { at });
    };
    render();
  });
}

/* ---------------- d20 ---------------- */
function roll(stat, dc, mods, mode) {
  return new Promise(resolve => {
    const ov = document.createElement('div'); ov.className = 'roll-ov';
    document.body.appendChild(ov);
    const base = G.stats[stat];
    const total = base + mods.reduce((s, m) => s + m.v, 0);
    let rerolled = false;
    const draw = (res) => {
      ov.innerHTML = `<div class="roll">
        <div class="r-k">${esc(STATS[stat].name)} · ${esc(STATS[stat].en.split('.')[0])}</div>
        <div class="r-dc">Sværhed <b>${dc}</b></div>
        <div class="r-die ${res ? (res.ok ? 'win' : 'lose') : ''}">${ART.d20(res ? res.show : '?', res ? '' : 'spin')}${res && res.r2 ? `<div class="r2">${res.r1} / ${res.r2}</div>` : ''}</div>
        <div class="r-mods"><span>${esc(STATS[stat].name)} +${base}</span>${mods.map(m => `<span class="${m.v < 0 ? 'neg' : ''}">${esc(m.t)} ${m.v >= 0 ? '+' : ''}${m.v}</span>`).join('')}${mode === 'adv' ? '<span class="adv">Fordel: roll twice, keep the best</span>' : mode === 'dis' ? '<span class="neg">Ulempe: roll twice, keep the worst</span>' : ''}</div>
        ${res ? `<div class="r-res ${res.ok ? 'ok' : 'no'}">${res.nat === 20 ? 'KRITISK SUCCES' : res.nat === 1 ? 'KRITISK FIASKO' : res.ok ? 'SUCCES' : 'FIASKO'}<small>${res.nat} + ${total} = ${res.nat + total}</small></div>` : ''}
        <div class="r-btns">${!res ? '<button class="btn gold" id="rGo">Slå terningen</button>' : (!res.ok && G.insp > 0 && !rerolled ? `<button class="btn ghost" id="rRe">Inspiration ✦ slå igen</button>` : '') + (res ? '<button class="btn gold" id="rOk">Fortsæt</button>' : '')}</div></div>`;
      const go = $('#rGo'); if (go) go.onclick = spin;
      const re = $('#rRe'); if (re) re.onclick = () => { G.insp--; rerolled = true; hud(); spin(); };
      const ok = $('#rOk'); if (ok) ok.onclick = () => { ov.remove(); resolve(res.ok); };
    };
    const spin = async () => {
      const r1 = 1 + Math.floor(Math.random() * 20), r2 = 1 + Math.floor(Math.random() * 20);
      ov.querySelector('.r-btns').innerHTML = '';
      const die = ov.querySelector('.r-die');
      die.classList.add('rolling');
      for (let k = 0; k < (FAST ? 1 : 12); k++) { die.querySelector('text').textContent = 1 + Math.floor(Math.random() * 20); await sleep(55 + k * 10); }
      const nat = mode === 'adv' ? Math.max(r1, r2) : mode === 'dis' ? Math.min(r1, r2) : r1;
      const ok = nat === 20 || (nat !== 1 && nat + total >= dc);
      G.log.rolls++; if (ok) { G.log.wins++; }
      draw({ ok, nat, show: nat, r1: mode ? r1 : null, r2: mode ? r2 : null });
      if (ok) addXP(2);
    };
    draw(null);
  });
}

/* ---------------- options ---------------- */
async function runOption(node, o) {
  if (o.once) G.used[G.node + ':' + node.opts.indexOf(o)] = true;
  G.usedCount = (G.usedCount || 0) + 1;
  if (o.kind === 'go') return o.next;
  if (o.kind === 'eng') {
    G.resp -= 1; G.log.eng++; toast('−1 anseelse', 'bad'); hud();
    logAdd(`<p class="you">“Sorry, in English?”</p>`, 'you');
    await steps(o.ok);
    return o.next;
  }
  if (o.special) { await SPECIAL[o.special](); return o.next; }
  let mode = null; const mods = [];
  if (o.kind === 'say' || o.kind === 'lie') {
    const r = await builder(o.build, o.phrase);
    G.log.built++;
    logAdd(`<div class="you-da">“${daHTML(r.sentence)}”</div>`, 'you');
    if (r.how === 'perfect') { mode = 'adv'; G.log.perfect++; addXP(3, 'perfekt dansk'); }
    else if (r.how === 'ok') { if (r.mistakes >= 2) mode = 'dis'; addXP(1); }
    else mode = 'dis';
    if (r.best) mods.push({ t: 'Før-inversion', v: 1 });
    if (o.build.origin === 'job') { const m = r.sentence.match(/som ([^\s.]+)/); if (m) G.origin.job = m[1]; }
    if (o.build.origin === 'reason') G.origin.reason = r.sentence;
    if (!o.stat) { await steps(r.how === 'shown' ? o.fail : o.ok); return o.next; }
  }
  if (o.phrase) { const m = mastery(o.phrase); if (m >= 3) mods.push({ t: 'Forberedt', v: 2 }); else if (m >= 2) mods.push({ t: 'Forberedt', v: 1 }); }
  if (o.bonus) { const b = o.bonus(G); if (b) mods.push({ t: o.bonusWhy || 'Bonus', v: b }); }
  if (G.resp >= 6 && o.kind !== 'act') mods.push({ t: 'Anseelse', v: 1 });
  const ok = await roll(o.stat, o.dc, mods, mode);
  if (o.ending) G.ending = o.next;
  await steps(ok ? o.ok : o.fail);
  return o.next;
}

async function goNode(id) {
  if (C().endings[id]) return ending(id);
  G.node = id; save();
  const node = C().nodes[id];
  stage(node.bg, node.npc, node.title);
  const startCount = G.usedCount || 0;
  await steps(node.steps);
  while (true) {
    const avail = node.opts.filter((o, i) => !(o.once && G.used[id + ':' + i]) && !(o.after && (G.usedCount || 0) - startCount < o.after));
    const list = avail.map(o => {
      const tag = o.stat ? `<span class="tag t-${o.kind}">[${STATS[o.stat].name.toUpperCase()}${o.dc ? ' ' + o.dc : ''}]</span> ` : o.kind === 'eng' ? '<span class="tag t-eng">[ENGELSK]</span> ' : '';
      const prep = o.phrase && mastery(o.phrase) >= 2 ? ' <span class="prepd">✓ forberedt</span>' : '';
      return { html: tag + esc(o.label) + prep, cls: 'k-' + o.kind };
    });
    const i = await choices(list);
    const next = await runOption(node, avail[i]);
    save();
    if (next) return goNode(next);
    if (!node.hub) return;
  }
}

/* ---------------- special scenes ---------------- */
const SPECIAL = {
  async fish() {
    logAdd(`<p class="you">You point at the cod and attempt: “Hvor meget koster den?”</p>`, 'you');
    sayEntry({ say: 'margrethe', da: 'Torsken koster tolv skilling.', en: 'The cod costs twelve shillings.' });
    logAdd(`<p>How much do you hand her?</p>`, 'thought');
    const opts = shuffle([12, 20, 2]);
    const i = await choices(opts.map(n => ({ html: `${n} skilling` })));
    if (opts[i] === 12) {
      addXP(2, 'tal forstået'); G.sk = Math.max(0, G.sk - 12); hud();
      const ok = await roll('HANDEL', 11, [{ t: 'Kunde', v: 2 }], null);
      if (ok) { sayEntry({ say: 'margrethe', da: 'Torsdag er en god dag for fisk. Og for lys.', en: 'Thursday is a good day for fish. And for lights.' }); G.flags.thursday = true; G.flags.mOk = true; }
      else sayEntry({ say: 'margrethe', da: 'Tak. Spørg Kjeld i Salthuset, hvis du vil vide noget.', en: 'Thanks. Ask Kjeld in the salt works, if you want to know something.' });
    } else {
      G.sk = Math.max(0, G.sk - 12); hud();
      sayEntry({ say: 'margrethe', da: 'Tolv. Ikke tyve. Udlændinge.', en: 'Twelve. Not twenty. Foreigners.' });
      logAdd(`<p>She takes twelve anyway. You now own a cod and a lesson.</p>`, 'narr');
    }
    await tapOn();
  },
  async bribe() {
    logAdd(`<p>You put your hand on your purse. Kjeld sees it. He keeps shovelling, which in Vandmark means "go on".</p>`, 'narr');
    const amt = [['Her er fem skilling.', 5, 16], ['Her er ti skilling.', 10, 12], ['Her er tyve skilling.', 20, 8]];
    const i = await choices(amt.map(a => ({ html: `“${daHTML(a[0])}”${G.sk < a[1] ? ' <small>(you can’t afford it)</small>' : ''}`, dis: G.sk < a[1] })).concat([{ html: 'Change your mind.' }]));
    if (i === 3) return;
    const [line, n, dc] = amt[i];
    G.sk -= n; hud();
    logAdd(`<div class="you-da">“${daHTML(line)}”</div>`, 'you');
    const ok = await roll('HANDEL', dc, [], null);
    if (ok) { sayEntry({ say: 'kjeld', da: 'Torsdag. Når tågen kommer. Og du har ikke hørt det fra mig.', en: "Thursday. When the fog comes. And you didn't hear it from me." }); G.flags.thursday = true; }
    else sayEntry({ say: 'kjeld', da: 'Tak. Ud.', en: 'Thanks. Out.' });
    await tapOn();
  },
  async caught() {
    sayEntry({ say: 'kjeld', da: 'Hvad laver du her?', en: 'What are you doing here?' });
    logAdd(`<p>Answer. Choose carefully, and read carefully.</p>`, 'thought');
    const R = [['Jeg leder efter toilettet.', 'lie'], ['Undskyld. Jeg går nu.', 'leave'], ['Jeg kom hertil for at stjæle.', 'honest']];
    const order = shuffle([0, 1, 2]);
    const i = await choices(order.map(k => ({ html: `“${daHTML(R[k][0])}”` })));
    const [line, kind] = R[order[i]];
    logAdd(`<div class="you-da">“${daHTML(line)}”</div>`, 'you');
    if (kind === 'lie') {
      const ok = await roll('LOEGN', 11, [], null);
      if (ok) sayEntry({ say: 'kjeld', da: 'Toilettet er udenfor. Ligesom dig.', en: 'The toilet is outside. Like you.' });
      else { sayEntry({ say: 'kjeld', da: 'Ud.', en: 'Out.' }); fx({ resp: -1 }); }
    } else if (kind === 'leave') sayEntry({ say: 'kjeld', da: 'Ja. Det gør du.', en: 'Yes. You do.' });
    else { sayEntry({ say: 'kjeld', da: 'Ærlig. Det er sjældent her. Ud, men ærlig.', en: "Honest. That's rare here. Out, but honest." }); fx({ resp: 1 }); }
    await tapOn();
  },
};

/* ---------------- preparation at the inn ---------------- */
async function prep(first) {
  stage('inn', 'hjordis', 'Pensionat Tågelys');
  if (first) {
    await steps([
      { n: 'Pensionat Tågelys. Evening. Rain that cannot decide whether it is fog.' },
      { n: 'You have been in Vandmark nine days. You have a room, a debt to Hjørdis, and roughly forty words, eleven of which are fish.' },
      { say: 'hjordis', da: 'Der er brev til dig. Fra havnefogeden. Han betaler dårligt, men han betaler.', en: 'There is a letter for you. From the harbour master. He pays badly, but he pays.' },
      { letter: 'contract' },
      { th: 'Before you go: practise what you will need to say. Here, words are the only weapons anyone admits to carrying.' },
    ]);
  }
  prepHub();
}
function prepHub() {
  const K = C();
  const ov = document.createElement('div'); ov.className = 'prep-ov';
  document.body.appendChild(ov);
  const render = () => {
    ov.innerHTML = `<div class="prep">
      <div class="p-head"><small>Kontrakt</small><h2>${esc(K.title)}</h2><p>${esc(K.goal)}</p><p class="book">${esc(K.book)}</p></div>
      <h3>Fraser <small>Practise. Prepared phrases add +1/+2 to their rolls, and stay learned between playthroughs.</small></h3>
      <div class="phr">${K.phrases.map(k => { const m = mastery(k); return `<button class="ph-b" data-k="${k}"><span class="ph-en">${esc(PHRASES[k].en)}</span><span class="dots">${[0, 1, 2].map(i => `<i class="${i < m ? 'on' : ''}"></i>`).join('')}</span></button>`; }).join('')}</div>
      <h3>Færdigheder <small>${G.points ? `${G.points} point to spend` : 'Level up to earn more points'}</small></h3>
      <div class="stats">${Object.entries(STATS).map(([k, s]) => `<div class="st"><div><b>${esc(s.name)}</b> <span class="sv">${G.stats[k]}</span><p>${esc(s.en)}</p></div><button class="plus" data-s="${k}" ${G.points && G.stats[k] < 5 ? '' : 'disabled'}>+</button></div>`).join('')}</div>
      <div class="ibshop"><div class="ib-p">${ART.portrait(NPCS.ib.pt)}</div><div><b>Ib</b> <i>leans in the doorway</i><p>“Inspiration. A reroll for when the dice hate you. Six shillings. Everyone needs one eventually.”</p><button class="btn ghost" id="buyI" ${G.sk >= 6 ? '' : 'disabled'}>Buy ✦ for 6 sk</button></div></div>
      <button class="btn gold big" id="goC">Gå til havnefogeden ▸</button></div>`;
    ov.querySelectorAll('.plus').forEach(b => b.onclick = () => { G.stats[b.dataset.s]++; G.points--; save(); render(); });
    ov.querySelectorAll('.ph-b').forEach(b => b.onclick = async () => {
      const k = b.dataset.k, P = PHRASES[k];
      const r = await builder({ en: P.en, answers: [P.words], tiles: [...P.words, ...(P.extra || [])] }, k);
      if (r.how === 'perfect') { META.mastery[k] = Math.min(3, mastery(k) + 1); addXP(2, 'øvelse'); toast(mastery(k) >= 3 ? 'Mestret!' : 'Bedre.', 'good'); }
      else if (r.how === 'ok') { addXP(1); toast('Correct, with mistakes. Try it clean.', ''); }
      else toast('Shown. Try again later.', 'bad');
      saveMeta(); render();
    });
    $('#buyI').onclick = () => { G.sk -= 6; G.insp++; hud(); render(); };
    $('#goC').onclick = () => { ov.remove(); goNode(C().start); };
  };
  render();
}

/* ---------------- ending & debrief ---------------- */
async function ending(id) {
  const E = C().endings[id];
  G.node = id; save();
  stage('inn', 'hjordis', 'Næste morgen');
  logAdd(`<div class="end-t">${esc(E.title)}</div>`, 'narr');
  logAdd(`<p>${esc(E.text)}</p>`, 'narr');
  await tapOn();
  addXP(10, 'kontrakt fuldført');
  META.runs++; saveMeta();
  const L = G.log;
  const ov = document.createElement('div'); ov.className = 'prep-ov';
  document.body.appendChild(ov);
  ov.innerHTML = `<div class="prep debrief">
    <div class="p-head"><small>Kontrakt fuldført</small><h2>${esc(C().title)}</h2><p>${esc(E.title)}</p></div>
    <div class="grid">
      <div><span>Anseelse</span><b>${esc(tierName())}</b><small>${G.resp}</small></div>
      <div><span>Niveau</span><b>${G.level}</b><small>${G.xp} XP · ${G.points} point unspent</small></div>
      <div><span>Sætninger</span><b>${L.built}</b><small>${L.perfect} perfect first try</small></div>
      <div><span>Terninger</span><b>${L.wins}/${L.rolls}</b><small>successful rolls</small></div>
      <div><span>Glimt</span><b>${G.glimpses.length}/${Object.keys(GLIMPSES).length}</b><small>of the hidden thing</small></div>
      <div><span>Engelsk</span><b>${L.eng}</b><small>times you asked</small></div>
    </div>
    <h3>Your past, so far</h3>
    <div class="paper-s">${G.origin.job ? `<p>Jeg arbejdede som ${esc(G.origin.job)}.</p>` : '<p>(nothing said properly yet)</p>'}${G.origin.reason ? `<p>${esc(G.origin.reason)}</p>` : ''}</div>
    <h3>Phrases</h3>
    <div class="phr">${C().phrases.map(k => `<div class="ph-b static"><span class="ph-en">${esc(PHRASES[k].words.join(' '))}</span><span class="dots">${[0, 1, 2].map(i => `<i class="${i < mastery(k) ? 'on' : ''}"></i>`).join('')}</span></div>`).join('')}</div>
    <p class="next">Next: <b>Lektion 2 · Hvor længe skal du være her?</b> The Night Watch wants to know when you came and when you will leave. (Not built yet: this is the prototype.)</p>
    <button class="btn gold big" id="again">Play the contract again</button></div>`;
  $('#again').onclick = () => { ov.remove(); const keep = { stats: G.stats, level: G.level, xp: G.xp, points: G.points }; newGame(); Object.assign(G, keep); prep(true); };
  localStorage.removeItem(KEY);
}

/* ---------------- journal ---------------- */
function journal() {
  const ov = document.createElement('div'); ov.className = 'prep-ov';
  document.body.appendChild(ov);
  ov.innerHTML = `<div class="prep"><div class="p-head"><small>Dagbog</small><h2>${esc(C().title)}</h2><p>${esc(C().goal)}</p></div>
    <h3>Færdigheder</h3><div class="stats">${Object.entries(STATS).map(([k, s]) => `<div class="st"><div><b>${esc(s.name)}</b> <span class="sv">${G.stats[k]}</span><p>${esc(s.en)}</p></div></div>`).join('')}</div>
    <h3>Glimt</h3>${G.glimpses.length ? G.glimpses.map(g => `<div class="gl small"><b>${esc(GLIMPSES[g].name)}</b><p>${esc(GLIMPSES[g].text)}</p></div>`).join('') : '<p class="dim">Nothing yet. They are good at hiding it.</p>'}
    <h3>Ord du har slået op</h3><p class="dim">${Object.keys(META.words).length ? Object.keys(META.words).map(esc).join(' · ') : 'None yet. Tap any Danish word to see what it means.'}</p>
    <div class="row2"><button class="btn ghost" id="tts">Stemme: ${TTS.on ? 'til' : 'fra'}</button><button class="btn ghost" id="amb">Lyd (hav): ${AMB.on ? 'til' : 'fra'}</button></div>
    <button class="btn gold big" id="close">Luk</button></div>`;
  $('#close').onclick = () => ov.remove();
  $('#tts').onclick = () => { TTS.on = !TTS.on; try { localStorage.setItem('dvin2_tts', TTS.on ? '1' : '0'); } catch (e) { } ov.remove(); journal(); };
  $('#amb').onclick = () => { AMB.toggle(); setTimeout(() => { ov.remove(); journal(); }, 50); };
}

/* ---------------- title ---------------- */
function title() {
  G = null; hud();
  let sv = null; try { sv = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { }
  $('#app').innerHTML = `<div class="stage title-st">${ART.scene('harbour')}<div class="fogA"></div><div class="fogB"></div></div>
    <div class="title"><p class="k">En kontrakt fra Vandmark</p><h1>Det var<br>ikke noget</h1>
    <p class="tag">Contracts, lies and dice in a city that only listens in Danish.</p>
    ${sv ? '<button class="btn gold big" id="cont">Fortsæt</button>' : ''}
    <button class="btn ${sv ? 'ghost' : 'gold'} big" id="new">${sv ? 'Ny begyndelse' : 'Begynd'}</button>
    <a class="old" href="v1/">the old card version (v1)</a></div>`;
  if (sv) $('#cont').onclick = () => { G = sv; G.node && C().nodes[G.node] ? goNode(G.node) : prep(false); };
  $('#new').onclick = () => { newGame(); prep(true); };
}


TTS.init();
title();
