/* =========================================================================
   Grammar engine: parses a sequence of chunk ids into a pattern, or explains
   what went wrong. 'incomplete' means "could still become valid" (used by
   the solver to prune); any other error is a real mistake.
   ========================================================================= */
const Grammar = (() => {
  const INV = { INV_WAS: 'WAS', INV_WORKAS: 'WORKAS', INV_WORKED: 'WORKED', INV_STUDIED: 'STUDIED' };
  const PLAIN_J = ['WAS', 'WORKAS', 'WORKED', 'STUDIED'];

  function parse(ids) {
    const T = ids.map(id => Object.assign({ id }, CHUNKS[id]));
    const r = { ids, toks: T, ok: false };
    const fail = (err, at, info) => Object.assign(r, { ok: false, err, at, info: info || {} });
    if (!T.length) return fail('incomplete');
    let i = 0;
    if (T[0].t === 'OPENER') { r.opener = T[0]; i = 1; }
    const f = T[i];
    if (!f) return fail('incomplete');

    // ---------- job family
    const parseJob = (k, inv) => {
      r.fam = 'J';
      const head = T[k];
      const base = inv ? INV[head.t] : head.t;
      let p = k + 1, job = null, prep = null, place = null, field = null;
      const takePlace = () => {
        const a = T[p];
        if (!a) return null;
        if (a.t === 'PREP') {
          prep = a; p++;
          const b = T[p];
          if (!b) return fail('incomplete');
          if (b.t !== 'PLACE') return fail('prep_place', p);
          place = b;
          if (b.prep !== a.w) return fail('prep', p, { good: b.prep + ' ' + b.da, bad: a.w + ' ' + b.da });
          p++;
        } else if (a.t === 'PLACE') return fail('noprep', p, { good: a.prep + ' ' + a.da });
        return null;
      };
      if (base === 'WAS' || base === 'WORKAS') {
        const n = T[p];
        if (!n) return fail('incomplete');
        if (n.t === 'JOB') { job = n; p++; }
        else if (n.t === 'PREP' || n.t === 'PLACE') return fail(base === 'WORKAS' ? 'som_place' : 'was_place', p);
        else if (n.t === 'FIELD') return fail('job_field', p);
        else return fail('job_expect', p);
        const e = takePlace(); if (e) return e;
      } else if (base === 'WORKED') {
        const n = T[p];
        if (!n) return fail('incomplete');
        if (n.t === 'JOB') return fail('worked_job', p, { job: n.da });
        if (n.t !== 'PREP' && n.t !== 'PLACE') return fail('worked_expect', p);
        const e = takePlace(); if (e) return e;
      } else if (base === 'STUDIED') {
        const n = T[p];
        if (!n) return fail('incomplete');
        if (n.t === 'JOB') return fail('studied_job', p);
        if (n.t !== 'FIELD') return fail('studied_expect', p);
        field = n; p++;
      }
      if (p < T.length) return fail('leftover', p);
      r.parts = { job, prep, place, field };
      r.pat = inv ? (job && place ? 'FULD' : 'FOER_INV') : (job && place ? 'JOBSTED' : place ? 'STED' : 'KORT');
      r.ok = true;
      return r;
    };

    // ---------- reason family
    const seg = (p) => {
      const c = T[p];
      if (!c) return { e: fail('incomplete') };
      const n = T[p + 1];
      if (c.t === 'PGA') {
        if (!n) return { e: fail('incomplete') };
        if (n.t === 'NP') return { s: { type: 'GRUND', toks: [c, n] }, next: p + 2 };
        if (n.t === 'INF') return { e: fail('pga_inf', p + 1, { x: n.da }) };
        if (n.t === 'SUBJ') return { e: fail('pga_clause', p + 1) };
        return { e: fail('pga_expect', p + 1) };
      }
      if (c.t === 'FORAT') {
        if (!n) return { e: fail('incomplete') };
        if (n.t === 'INF') return { s: { type: 'FORMAAL', toks: [c, n] }, next: p + 2 };
        if (n.t === 'NP') return { e: fail('forat_np', p + 1, { x: n.da }) };
        if (n.t === 'SUBJ') return { e: fail('forat_subj', p + 1) };
        return { e: fail('forat_expect', p + 1) };
      }
      if (c.t === 'FORDI') {
        if (!n) return { e: fail('incomplete') };
        if (n.t !== 'SUBJ') return { e: fail(n.t === 'NP' || n.t === 'INF' ? 'fordi_noclause' : 'fordi_expect', p + 1) };
        let q = p + 2; const advs = [];
        while (T[q] && T[q].t === 'ADV') { advs.push(T[q]); q++; }
        const v = T[q];
        if (!v) return { e: fail('incomplete') };
        let verb;
        if (v.t === 'MODAL') {
          verb = v; q++;
          if (T[q] && T[q].t === 'ADV') return { e: fail('sav', q, { adv: T[q].da, verb: v.da }) };
          const inf = T[q];
          if (!inf) return { e: fail('incomplete') };
          if (inf.t !== 'INF') return { e: fail('modal_inf', q) };
          q++;
        } else if (v.t === 'VPAST') {
          verb = v; q++;
          if (T[q] && T[q].t === 'ADV') return { e: fail('sav', q, { adv: T[q].da, verb: v.w }) };
        } else if (v.t === 'INF') return { e: fail('fordi_noverb', q, { x: v.da }) };
        else return { e: fail('fordi_expect', q) };
        if (advs.length > 2) return { e: fail('adv_many', p + 2) };
        if (advs.length === 2) {
          if (advs[0].w === 'også' && advs[1].w === 'ikke') return { e: fail('heller_ikke', p + 2) };
          if (advs[0].w !== 'også' || advs[1].w === 'også') return { e: fail('adv_order', p + 2) };
        }
        if (advs.some(a => a.w === 'gerne') && verb.w !== 'ville') return { e: fail('gerne_ville', p + 2) };
        return { s: { type: 'FORDI', toks: T.slice(p, q) }, next: q };
      }
      if (c.t === 'MENOGSAA') return { e: fail('menogsaa_first', p) };
      return { e: fail('conn_expect', p) };
    };

    const parseReason = (k, short) => {
      r.fam = 'R';
      const segs = [];
      let res = seg(k);
      if (res.e) return res.e;
      segs.push(res.s);
      let p = res.next;
      if (p < T.length) {
        if (T[p].t === 'MENOGSAA') {
          if (short) return fail('leftover', p);
          p++;
          if (p >= T.length) return fail('incomplete');
          res = seg(p);
          if (res.e) return res.e;
          segs.push(res.s); p = res.next;
        } else if (['PGA', 'FORAT', 'FORDI'].includes(T[p].t)) return fail('two_conn', p);
      }
      if (p < T.length) return fail('leftover', p);
      r.segs = segs;
      r.pat = short ? 'KORTGRUND' : segs.length === 2 ? 'DOBBELT' : segs[0].type;
      r.ok = true;
      return r;
    };

    switch (f.t) {
      case 'MAIN_R':
        if (i + 1 >= T.length) { r.fam = 'R'; return fail('incomplete'); }
        return parseReason(i + 1, false);
      case 'PGA': case 'FORAT': case 'FORDI':
        return parseReason(i, true);
      case 'FOER': {
        r.fam = 'J';
        const n = T[i + 1];
        if (!n) return fail('incomplete');
        if (INV[n.t]) return parseJob(i + 1, true);
        if (PLAIN_J.includes(n.t)) {
          const invId = Object.keys(CHUNKS).find(k => CHUNKS[k].plain === n.id);
          return fail('foer_noinv', i + 1, { inv: invId ? CHUNKS[invId].da : 'verb + jeg', plain: n.da });
        }
        return fail('foer_main', i + 1);
      }
      case 'WAS': case 'WORKAS': case 'WORKED': case 'STUDIED':
        return parseJob(i, false);
      case 'ADV':
        return fail(f.w === 'også' ? 'ogsaa_first' : 'adv_first', i);
      case 'SUBJ':
        return fail('subj_start', i);
      case 'MENOGSAA':
        return fail('menogsaa_first', i);
      default:
        if (INV[f.t]) return fail('inv_nofront', i, { inv: f.da, plain: CHUNKS[f.plain] ? CHUNKS[f.plain].da : '' });
        return fail('start', i);
    }
  }

  // Human-readable sentence with capital letter, commas, full stop
  function sentence(ids) {
    let out = '';
    ids.forEach((id, k) => {
      const c = CHUNKS[id];
      let w = c.da;
      if (k > 0) {
        const prev = out.trim();
        const prevT = CHUNKS[ids[k - 1]].t;
        const needComma = (c.t === 'FORDI' || c.t === 'MENOGSAA') && !prev.endsWith(',') && prevT !== 'MENOGSAA';
        out = prev + (needComma ? ', ' : ' ');
      }
      out += w;
    });
    out = out.trim();
    if (!out) return '';
    out = out.charAt(0).toUpperCase() + out.slice(1);
    if (out.endsWith(',')) out = out.slice(0, -1);
    return out + '.';
  }

  // Explain an error with the info filled in
  function explain(res) {
    const e = ERRORS[res.err] || ERRORS.start;
    let en = e.en;
    const info = res.info || {};
    en = en.replace(/\{(\w+)\}/g, (_, k) => info[k] !== undefined ? info[k] : '…');
    return { title: e.t, en };
  }

  // Depth-first search for valid sentences from a hand (multiset of ids)
  function solveAll(ids, fam, maxLen = 8, limit = 400) {
    const out = [];
    const used = new Array(ids.length).fill(false);
    const seq = [];
    const seen = new Set();
    (function dfs() {
      if (out.length >= limit) return;
      if (seq.length) {
        const res = parse(seq);
        if (res.ok) {
          const key = seq.join('|');
          if (!seen.has(key) && (!fam || res.fam === fam)) { seen.add(key); out.push({ ids: seq.slice(), res }); }
        } else if (res.err !== 'incomplete') return;
      }
      if (seq.length >= maxLen) return;
      const tried = new Set();
      for (let k = 0; k < ids.length; k++) {
        if (used[k] || tried.has(ids[k])) continue;
        tried.add(ids[k]);
        used[k] = true; seq.push(ids[k]);
        dfs();
        seq.pop(); used[k] = false;
      }
    })();
    return out;
  }

  function baseValue(res) {
    const P = PATTERNS[res.pat];
    const chips = P.chips + res.toks.reduce((s, t) => s + (t.c || 2), 0);
    return chips * P.mult;
  }

  function best(ids, fam, maxLen, noOpener) {
    let all = solveAll(ids, fam, maxLen);
    if (noOpener) all = all.filter(x => !x.res.opener);
    let b = null;
    for (const s of all) { const v = baseValue(s.res); if (!b || v > b.v) b = { ...s, v }; }
    return b;
  }

  // Did-you-mean: a valid ordering of exactly the played chunks (if any)
  function reorder(ids, fam) {
    if (ids.length > 8) return null;
    const all = solveAll(ids, fam, ids.length, 200).filter(s => s.ids.length === ids.length);
    return all.length ? all[0] : null;
  }

  return { parse, sentence, explain, solveAll, best, reorder, baseValue };
})();
if (typeof module !== 'undefined') module.exports = { Grammar };
