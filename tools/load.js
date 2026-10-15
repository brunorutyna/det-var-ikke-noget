// Loads the game's data files into Node (no browser) so tools can inspect lessons, vocabulary and art.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
function load() {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]).filter(s => !/engine|audio/.test(s));
  const ctx = { window: {}, document: { querySelector: () => null }, console, G: null, hasBoon: () => false, Math, JSON };
  vm.createContext(ctx);
  // top-level const/let become globals of the context so later files (and we) can see them
  for (const s of scripts) vm.runInContext(read(s).replace(/^(const|let) (\w+) =/gm, 'var $2 ='), ctx, { filename: s });
  const engine = read('js/engine.js');
  ctx.NAMES = vm.runInNewContext(engine.match(/const NAMES = (\[[^\]]*\])/)[1]);
  ctx.SPECIAL_NAMES = [...engine.slice(engine.indexOf('const SPECIAL = {')).matchAll(/^  (?:async )?(\w+)\(/gm)].map(m => m[1]);
  return ctx;
}
module.exports = { load, ROOT, read };
