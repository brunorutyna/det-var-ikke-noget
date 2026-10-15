#!/usr/bin/env node
/* Plays lessons start to finish like a (somewhat random, goal-seeking) player, in a phone-sized browser.
   node tools/playtest.js                 one run of every lesson
   node tools/playtest.js k1l2 --runs 3   three runs of one lesson
   node tools/playtest.js --chain         Lektion 1, then continue the same character into the next lessons
   node tools/playtest.js k1l2 --shots out/   save a screenshot of each new screen type (slow: real animations)
   Exit code 1 if any run hits a JavaScript error or gets stuck. */
const path = require('path'), fs = require('fs');
const { serve, phone } = require('./browser');
const { load } = require('./load');
const args = process.argv.slice(2);
const flag = f => args.includes(f), val = f => (args[args.indexOf(f) + 1]);
const C = load();
const lessons = args.filter(a => C.SESSIONS[a]);
const runs = flag('--runs') ? +val('--runs') : 1, chain = flag('--chain'), shots = flag('--shots') ? val('--shots') : null;
const AVOID = /(Leave|Go out|Back\.|Go to bed|Turn back|Walk on|Walk around|Decline|Change your mind|No, thank|Give up|Let her go on|Shake Tom|Say nothing)/;

async function play(srv, lesson, chainOn) {
  const { browser, page: p, errors } = await phone();
  await p.goto(srv.url + (shots ? '?' : '?fast') + `&lesson=${lesson}`); await p.waitForTimeout(400);
  const seen = {}; const shot = async n => { if (!shots || seen[n]) return; seen[n] = 1; await p.waitForTimeout(400); fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, `${lesson}_${n}.png`) }); };
  const click = async sel => { const e = await p.$(sel); if (e) { await e.click({ force: true }).catch(() => { }); return true; } return false; };
  const ends = []; let n = 0, last = '', same = 0;
  while (n++ < 6000) {
    await p.waitForTimeout(shots ? 120 : 12);
    const state = await p.evaluate(() => G ? `${G.sess}:${G.node}:${G.day}:${G.phase}:${document.querySelector('#log') ? document.querySelector('#log').childElementCount : 0}` : '-');
    same = state === last ? same + 1 : 0; last = state;
    if (same > 400) { errors.push(`stuck at ${state}`); break; }
    if (await p.$('#again')) {
      ends.push(await p.evaluate(() => `${G.sess} ended "${S().ending ? S().ending(G) : ''}" day ${G.day}, standing ${G.resp}, ${G.sk} sk, gifts: ${G.boons.join(', ') || '—'}`));
      await shot('end');
      if (chainOn && await click('#onward')) continue;
      break;
    }
    if (await p.$('.tcard, .tpass')) { await p.waitForTimeout(150); continue; }
    if (await p.$('.roll-ov')) { await shot('roll'); if (await click('#rGo')) { await p.waitForTimeout(shots ? 1400 : 20); continue; } await click('#rOk'); continue; }
    if (await p.$('.sheet-ov')) {
      await shot('builder');
      const ans = await p.evaluate(() => { const b = __dev.cur; return b.answers[Math.floor(Math.random() * b.answers.length)]; });
      for (const w of ans) for (const t of await p.$$('.pool .tile:not([disabled])')) if ((await t.innerText()).toLowerCase() === w.toLowerCase()) { await t.click({ force: true }); break; }
      await click('#bOk'); await p.waitForTimeout(20);
      if (await p.$('.sheet-ov')) { if (!(await click('#bShow'))) { errors.push(`builder answer not accepted: ${ans.join(' ')}`); await click('#bClr'); } }
      continue;
    }
    if (await p.$('.voc-ov')) {
      if (await click('#vDone')) continue;
      const sel = ['.coin:not([disabled])', '.sign:not([disabled])', '.rv-o:not([disabled])'];
      for (const s of sel) { const els = await p.$$(s); if (els.length) { await shot('voc_' + s.slice(1, 4)); await els[Math.floor(Math.random() * els.length)].click({ force: true }); break; } }
      await p.waitForTimeout(shots ? 300 : 15); continue;
    }
    if (await p.$('.prep-ov')) { if (await click('#rvDone')) continue; const rv = await p.$$('.rv-o:not([disabled])'); if (rv.length) { await shot('review'); await rv[Math.floor(Math.random() * rv.length)].click({ force: true }); await p.waitForTimeout(shots ? 1800 : 20); continue; } await click('#close'); continue; }
    if (await p.$('.hobj')) { await shot('hunt'); const k = await p.evaluate(() => __dev.hunt && __dev.hunt()); if (k) await click(`.hobj[data-k="${k}"]`); await p.waitForTimeout(15); continue; }
    if (await p.$('#cont')) { await shot('scene_' + (await p.$eval('.loc', e => e.innerText).catch(() => '')).replace(/\W+/g, '_')); await click('#cont'); continue; }
    const opts = await p.$$('.opt:not([disabled])');
    if (opts.length) {
      const T = (await Promise.all(opts.map(o => o.innerText()))).map((t, k) => [t, k]);
      const find = re => (T.find(([t]) => re.test(t)) || [])[1];
      const night = await p.evaluate(() => G.phase >= 2);
      let i = find(/End the lesson/);
      if (i === undefined) { const prog = T.filter(([t]) => !AVOID.test(t)); if (prog.length) i = prog[Math.floor(Math.random() * prog.length)][1]; }
      if (i === undefined && night) i = find(/Go to bed/);
      if (i === undefined) i = find(/(Leave|Go out|Turn back|Walk|Decline)/);
      if (i === undefined) i = Math.floor(Math.random() * opts.length);
      await opts[i].click({ force: true }); continue;
    }
    const pins = await p.$$('.pin:not(.shut)');
    if (pins.length) { await shot('map'); const marked = await p.$$('.pin.mark:not(.shut)'); const list = marked.length && Math.random() < .8 ? marked : pins; await list[Math.floor(Math.random() * list.length)].click({ force: true }); await p.waitForTimeout(shots ? 2500 : 20); continue; }
  }
  if (!ends.length && !errors.length) errors.push(`no ending after ${n} steps (last state ${last})`);
  await browser.close();
  return { lesson, steps: n, ends, errors };
}

(async () => {
  const srv = await serve();
  const order = Object.values(C.SESSIONS).sort((a, b) => a.order - b.order).map(s => s.id);
  const jobs = chain ? [[order[0], true]] : (lessons.length ? lessons : order).flatMap(l => Array(runs).fill([l, false]));
  let bad = 0;
  for (const [l, ch] of jobs) {
    const r = await play(srv, l, ch);
    console.log(`${r.errors.length ? 'FAIL' : 'ok  '} ${l} · ${r.steps} steps`);
    r.ends.forEach(e => console.log('     ' + e));
    r.errors.slice(0, 6).forEach(e => console.log('     ! ' + e));
    if (r.errors.length) bad++;
  }
  srv.close();
  process.exit(bad ? 1 : 0);
})();
