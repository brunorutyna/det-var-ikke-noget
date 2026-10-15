#!/usr/bin/env node
/* Each scene is an isolated <img>: scenes reuse ids (gradients, filters), so drawing them side by side in one page would mix them up.
   One picture of every scene at all four times of day (morgen, eftermiddag, aften, nat).
   node tools/scenes.js [out.png] [scene,scene,…]   Look at it after any art or lighting change. */
const { serve, phone } = require('./browser');
const fs = require('fs'), path = require('path');
// the time-of-day rules live in the stylesheet; an isolated <img> needs its own copy
const CSS = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8').split('\n').filter(l => l.startsWith('.scene-svg.ph')).join('');
(async () => {
  const out = process.argv[2] || 'scenes.png', only = process.argv[3];
  const srv = await serve(); const { browser, page, errors } = await phone();
  await page.goto(srv.url + '?fast'); await page.waitForTimeout(400);
  await page.evaluate(([only, css]) => {
    const names = only ? only.split(',') : ['harbour', 'office', 'salt', 'inn', 'market', 'attic', 'cellar', 'street', 'house', 'moor', 'church', 'bakery', 'trollhill', 'ferry', 'pier_night', 'elverhoj', 'trollhall', 'room_night', 'lantern'];
    document.body.style.cssText = 'overflow:visible;height:auto;background:#000';
    document.body.innerHTML = '<div style="display:grid;grid-template-columns:90px repeat(4,140px);gap:4px;padding:6px;color:#ccc;font:12px sans-serif">' +
      ['', 'Morgen', 'Eftermiddag', 'Aften', 'Nat'].map(h => `<b>${h}</b>`).join('') +
      names.map(n => `<span>${n}</span>` + [0, 1, 2, 3].map(ph => `<img width="140" height="200" style="object-fit:cover" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(ART.scene(n, ph).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="393" height="560" ').replace('</svg>', `<style>${css}</style></svg>`))}">`).join('')).join('') + '</div>';
  }, [only, CSS]);
  await page.setViewportSize({ width: 680, height: 400 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: out, fullPage: true });
  console.log('saved', out, errors.length ? '\n' + errors.join('\n') : '');
  await browser.close(); srv.close();
})();
