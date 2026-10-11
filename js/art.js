/* =========================================================================
   ART — painted scenes and NPC portraits, all drawn in SVG.
   Light usually comes from a warm lamp on the right; the world is cold.
   ========================================================================= */
const ART = (() => {
  let uid = 0;
  const id = p => p + (++uid);

  const DEFS = `
  <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="3.5"/><feGaussianBlur stdDeviation=".6"/></filter>
  <filter id="paint" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".012 .05" numOctaves="3" seed="12"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter>
  <filter id="b2"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="b4"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="b10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="b22" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.1" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0"/></filter>
  <radialGradient id="gold"><stop offset="0" stop-color="#ffd98a"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
  <radialGradient id="fire"><stop offset="0" stop-color="#ffcf7a"/><stop offset=".4" stop-color="#e0702a" stop-opacity=".5"/><stop offset="1" stop-color="#7a2a10" stop-opacity="0"/></radialGradient>`;

  /* ---------------- portraits ---------------- */
  // p: {skin, shade, hair, hairCol, beard, beardCol, cloth, cloth2, age, brow, mouth, extra}
  function portrait(p) {
    const g = id('p');
    const skinL = p.skin || '#e8b892', skinD = p.shade || '#5a3427';
    const cloth = p.cloth || '#3a2a26', cloth2 = p.cloth2 || '#1a1416';
    const rim = p.rim || '#f0b860';
    const hc = p.hairCol || '#2a2420', bc = p.beardCol || hc;
    const mouth = { flat: 'M134 236 C144 233 158 233 168 236', frown: 'M134 240 C144 232 158 232 168 240', smirk: 'M134 236 C146 236 158 232 170 228', smile: 'M132 232 C144 242 160 242 170 230' }[p.mouth || 'flat'];
    const brows = { stern: ['M110 168 l26 -4', 'M164 164 l26 5'], raised: ['M110 162 q13 -8 26 -2', 'M164 160 q13 -6 26 2'], tired: ['M110 166 q13 -3 26 2', 'M164 168 q13 -5 26 -2'] }[p.brow || 'stern'];
    let s = `<defs>
      <linearGradient id="${g}sk" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${skinL}"/><stop offset=".5" stop-color="${mix(skinL, skinD, .45)}"/><stop offset="1" stop-color="${skinD}"/></linearGradient>
      <linearGradient id="${g}cl" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${rim}"/><stop offset=".1" stop-color="${cloth}"/><stop offset=".55" stop-color="${cloth2}"/><stop offset="1" stop-color="#08080a"/></linearGradient>
      <linearGradient id="${g}hr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${mix(hc, rim, .45)}"/><stop offset=".25" stop-color="${hc}"/><stop offset="1" stop-color="${mix(hc, '#000000', .6)}"/></linearGradient>
      <linearGradient id="${g}bd" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${mix(bc, rim, .35)}"/><stop offset=".4" stop-color="${bc}"/><stop offset="1" stop-color="${mix(bc, '#000000', .55)}"/></linearGradient>
    </defs>`;
    // body
    s += `<g filter="url(#paint)"><path d="M-10 360 C-6 300 30 262 92 248 L208 248 C270 262 306 300 312 360Z" fill="url(#${g}cl)"/></g>`;
    if (p.apron) s += `<path d="M112 360 L118 290 L186 290 L192 360Z" fill="${p.apron}" opacity=".85" filter="url(#soft)"/>`;
    if (p.collar) s += `<path d="M112 252 L150 290 L188 252 L176 248 L150 272 L124 248Z" fill="${p.collar}" filter="url(#soft)"/>`;
    // neck
    s += `<path d="M124 252 L178 252 L174 214 L128 214Z" fill="${mix(skinD, '#000000', .25)}"/>`;
    // back hair (bun/long) behind head
    if (p.hair === 'bun') s += `<g filter="url(#soft)"><circle cx="150" cy="86" r="30" fill="url(#${g}hr)"/></g>`;
    if (p.hair === 'scarf') s += `<g filter="url(#soft)"><path d="M84 182 C70 120 92 62 150 58 C208 62 232 120 218 182 C226 236 206 262 188 268 L114 268 C96 262 76 236 84 182Z" fill="${p.scarf || '#243a46'}"/></g>`;
    // head
    s += `<g filter="url(#soft)"><path d="M98 160 C96 104 120 82 151 82 C182 82 206 104 204 160 C203 206 182 246 151 248 C120 246 99 206 98 160Z" fill="url(#${g}sk)"/></g>`;
    // ear (right, lit)
    if (p.hair !== 'scarf') s += `<path d="M202 160 C214 156 216 186 202 190Z" fill="${skinL}" opacity=".9" filter="url(#soft)"/>`;
    // shading: left shadow, cheek light, under-brow
    s += `<ellipse cx="116" cy="178" rx="26" ry="56" fill="${skinD}" opacity=".55" filter="url(#b10)"/>
      <ellipse cx="184" cy="190" rx="13" ry="22" fill="#ffd7aa" opacity=".22" filter="url(#b10)"/>
      <ellipse cx="150" cy="176" rx="46" ry="9" fill="${skinD}" opacity=".35" filter="url(#b4)"/>
      <ellipse cx="150" cy="232" rx="30" ry="10" fill="${skinD}" opacity=".3" filter="url(#b4)"/>`;
    // eyes
    const eye = (cx, lit) => `<path d="M${cx - 13} 182 Q${cx} 172 ${cx + 13} 182 Q${cx} 188 ${cx - 13} 182Z" fill="${lit ? '#d8c6b0' : '#6a5246'}"/>
      <circle cx="${cx + 1}" cy="181.5" r="4.6" fill="${p.eye || '#3d4a52'}"/><circle cx="${cx + 1}" cy="181.5" r="2.2" fill="#0c0a09"/>
      ${lit ? `<circle cx="${cx + 3}" cy="179.6" r="1.3" fill="#fff3dc"/>` : ''}
      <path d="M${cx - 14} 181 Q${cx} 170 ${cx + 14} 181" stroke="#2a1812" stroke-width="2.4" fill="none"/>`;
    s += eye(124, false) + eye(178, true);
    if (p.age) s += `<g stroke="${skinD}" stroke-width="1.2" fill="none" opacity=".6"><path d="M106 190 q6 4 12 2 M186 192 q6 2 12 -2 M126 214 q-6 10 -2 20 M176 214 q6 10 2 20 M130 150 q20 -4 40 0"/></g>`;
    s += `<g stroke="${mix(hc, '#000000', .3)}" stroke-width="4.5" stroke-linecap="round" fill="none">${brows.map(d => `<path d="${d}"/>`).join('')}</g>`;
    // nose
    s += `<path d="M152 186 L146 214 Q150 220 160 216" stroke="${skinD}" stroke-width="2.4" fill="none" opacity=".9"/>
      <path d="M156 190 L156 210" stroke="#ffe0c0" stroke-width="2" opacity=".35"/>`;
    // mouth
    s += `<path d="${mouth}" stroke="#4a2218" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M140 242 q11 4 22 0" stroke="${skinD}" stroke-width="2" fill="none" opacity=".4"/>`;
    // beard / moustache
    if (p.beard === 'full') s += `<g filter="url(#soft)"><path d="M100 180 C100 230 120 262 151 266 C182 262 204 230 204 180 C200 208 190 226 170 230 C160 226 142 226 132 230 C112 226 102 208 100 180Z" fill="url(#${g}bd)"/></g>
      <path d="${mouth}" stroke="#2a1410" stroke-width="3" fill="none"/>`;
    if (p.beard === 'mustache' || p.beard === 'full') s += `<path d="M128 228 C138 220 148 222 151 226 C154 222 164 220 176 228 C166 232 156 230 151 228 C146 230 136 232 128 228Z" fill="url(#${g}bd)" filter="url(#soft)"/>`;
    if (p.beard === 'pencil') s += `<path d="M134 226 C142 222 148 224 151 226 C154 224 160 222 168 226" stroke="${bc}" stroke-width="2.6" fill="none"/>`;
    if (p.beard === 'stubble') s += `<path d="M106 200 C110 236 128 252 151 254 C174 252 192 236 196 200 C190 230 170 244 151 244 C132 244 112 230 106 200Z" fill="${bc}" opacity=".35" filter="url(#b2)"/>`;
    // hair on top
    if (p.hair === 'scarf') s += `<g filter="url(#soft)"><path d="M92 170 C82 92 220 84 210 170 C206 132 190 106 151 104 C112 106 96 132 92 170Z" fill="${p.scarf || '#243a46'}"/>
      <path d="M190 104 C206 118 214 140 212 168" stroke="${rim}" stroke-width="3" fill="none" opacity=".6"/></g>`;
    if (p.hair === 'short') s += `<g filter="url(#soft)"><path d="M96 158 C90 96 120 74 152 74 C186 74 212 96 206 158 C202 124 188 104 150 104 C118 106 102 124 96 158Z" fill="url(#${g}hr)"/></g>`;
    if (p.hair === 'bun') s += `<g filter="url(#soft)"><path d="M96 160 C90 100 118 80 151 80 C184 80 212 100 206 160 C200 120 184 102 151 102 C118 102 102 120 96 160Z" fill="url(#${g}hr)"/></g>`;
    if (p.hair === 'bald') s += `<path d="M120 96 C140 86 170 88 186 100" stroke="#ffe2c0" stroke-width="3" opacity=".35" fill="none"/><path d="M98 160 C96 140 100 128 106 120 L108 160Z M204 160 C206 140 202 128 196 120 L194 160Z" fill="url(#${g}hr)" filter="url(#soft)"/>`;
    if (p.hair === 'cap') s += `<g filter="url(#soft)"><path d="M92 150 C90 96 118 74 151 74 C186 74 214 96 210 150Z" fill="${p.capCol || '#1c2630'}"/>
      <path d="M82 150 C110 140 196 140 222 150 C210 162 96 162 82 150Z" fill="#0d1218"/>
      <path d="M200 92 C208 110 212 128 210 150" stroke="${rim}" stroke-width="3" fill="none" opacity=".6"/>
      <circle cx="151" cy="118" r="9" fill="#c9a24a"/><circle cx="151" cy="118" r="5" fill="#8a6a2a"/></g>
      <path d="M98 154 C96 170 98 184 102 190 L104 156Z M204 154 C206 170 204 184 200 190 L198 156Z" fill="${hc}"/>`;
    if (p.hair === 'hat') s += `<g filter="url(#soft)"><path d="M104 132 C104 84 126 62 151 62 C176 62 198 84 198 132Z" fill="${p.hatCol || '#221a16'}"/>
      <path d="M58 136 C100 118 202 118 244 136 C226 152 76 152 58 136Z" fill="#120d0a"/>
      <path d="M104 120 L198 120 L198 132 L104 132Z" fill="#6a2a22"/>
      <path d="M190 80 C198 96 200 112 198 130" stroke="${rim}" stroke-width="3" fill="none" opacity=".5"/></g>
      <path d="M100 150 C98 170 100 186 104 192 L106 150Z M202 150 C204 170 202 186 198 192 L196 150Z" fill="${hc}"/>`;
    // rim light on face edge
    s += `<path d="M196 112 C208 132 210 170 202 200" stroke="${rim}" stroke-width="2.4" fill="none" opacity=".55" filter="url(#b2)"/>`;
    if (p.extra) s += p.extra;
    return `<svg class="portrait-svg" viewBox="0 0 300 360" preserveAspectRatio="xMidYMax meet"><defs>${DEFS}</defs>${s}</svg>`;
  }

  function mix(a, b, t) {
    const pa = hex(a), pb = hex(b);
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }

  /* ---------------- scenes ---------------- */
  const sky = (a, b, c) => `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  const fog = (y, op = .35, col = '#5d727b') => `<g class="fog1" filter="url(#b22)" fill="${col}" opacity="${op}"><ellipse cx="120" cy="${y}" rx="220" ry="28"/><ellipse cx="330" cy="${y + 34}" rx="170" ry="22"/></g>
    <g class="fog2" filter="url(#b22)" fill="${col}" opacity="${op * .8}"><ellipse cx="260" cy="${y - 20}" rx="200" ry="20"/><ellipse cx="40" cy="${y + 50}" rx="160" ry="18"/></g>`;
  const town = (y, col = '#141d22', lit = true) => `<g filter="url(#paint)"><path d="M-20 ${y} L20 ${y} L20 ${y - 38} L40 ${y - 54} L60 ${y - 38} L60 ${y - 10} L96 ${y - 10} L96 ${y - 60} L104 ${y - 86} L112 ${y - 60} L112 ${y - 8} L160 ${y - 8} L160 ${y - 32} L186 ${y - 48} L212 ${y - 32} L212 ${y - 4} L260 ${y - 4} L260 ${y - 26} L290 ${y - 26} L290 ${y - 2} L330 ${y - 2} L330 ${y - 40} L350 ${y - 52} L370 ${y - 40} L370 ${y} L420 ${y} L420 ${y + 40} L-20 ${y + 40}Z" fill="${col}"/></g>
    ${lit ? `<g fill="#f2b55a" opacity=".75" filter="url(#b2)"><rect x="40" y="${y - 30}" width="5" height="7"/><rect x="104" y="${y - 50}" width="4" height="6"/><rect x="190" y="${y - 24}" width="5" height="7"/><rect x="270" y="${y - 18}" width="5" height="6"/><rect x="346" y="${y - 30}" width="4" height="6"/></g>` : ''}`;
  const lights = (x0, y0, n = 5, step = 34) => {
    let s = '<g class="secret">';
    for (let i = 0; i < n; i++) { const x = x0 + i * step, y = y0 + i * 4; s += `<circle cx="${x}" cy="${y}" r="${14 - i}" fill="url(#gold)" filter="url(#b10)"/><circle cx="${x}" cy="${y}" r="1.8" fill="#ffe2a0"/><path d="M${x} ${y + 6} v${26 - i * 3}" stroke="#f2b55a" stroke-width="2" opacity=".35" filter="url(#b2)"/>`; }
    return s + '</g>';
  };
  const lamp = (x, y, r = 300) => `<radialGradient id="lampg" cx="${x / 393}" cy="${y / 560}" r=".7"><stop offset="0" stop-color="#f2b55a" stop-opacity=".5"/><stop offset=".35" stop-color="#8a5a2a" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`;

  const SCENES = {
    harbour: () => `<defs>${DEFS}${sky('#0d1318', '#1c2a31', '#0b1013')}${lamp(300, 140)}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>${town(300)}
      <rect y="300" width="393" height="260" fill="#0e1519"/>
      <g stroke="#2c3b42" stroke-width="2" opacity=".7" filter="url(#b2)"><path d="M0 330 h130 M180 342 h160 M30 368 h200 M250 380 h140 M0 404 h180"/></g>
      ${lights(30, 318)}${fog(296)}
      <rect width="393" height="560" fill="url(#lampg)" class="flicker"/>
      <path d="M300 0 V110" stroke="#0a0a0a" stroke-width="3"/>
      <g><rect x="286" y="110" width="28" height="36" rx="3" fill="#120d08"/><rect x="291" y="115" width="18" height="26" fill="#ffcf73" class="flicker"/></g>
      <circle cx="300" cy="130" r="60" fill="url(#gold)" opacity=".3" filter="url(#b10)" class="flicker"/>
      <g filter="url(#paint)"><path d="M-10 470 L393 450 L393 560 L-10 560Z" fill="#17120e"/></g>`,
    office: () => `<defs>${DEFS}${sky('#14120f', '#1f1a15', '#0c0a08')}${lamp(260, 260)}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <!-- window with fog -->
      <rect x="30" y="70" width="120" height="170" fill="#22323a"/><rect x="30" y="70" width="120" height="170" fill="#5d727b" opacity=".35" class="fog1" filter="url(#b10)"/>
      <path d="M90 70 V240 M30 155 H150" stroke="#0e0b09" stroke-width="6"/><rect x="24" y="64" width="132" height="182" fill="none" stroke="#0e0b09" stroke-width="8"/>
      <!-- shelves of ledgers -->
      ${[0, 1, 2, 3].map(r => `<rect x="190" y="${70 + r * 58}" width="190" height="6" fill="#2a1f16"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${194 + i * 15}" y="${30 + r * 58 + (i % 3) * 3}" width="12" height="${38 - (i % 3) * 3}" fill="${['#3a2a1c', '#2b3236', '#4a2e22', '#33291c'][(i + r) % 4]}"/>`).join('')).join('')}
      <rect width="393" height="560" fill="url(#lampg)" class="flicker"/>
      <!-- desk -->
      <g filter="url(#paint)"><path d="M-10 420 L403 404 L403 560 L-10 560Z" fill="#1d140d"/></g>
      <rect x="250" y="380" width="22" height="28" fill="#0e0a07"/><circle cx="261" cy="374" r="9" fill="#ffd27a" class="flicker"/><circle cx="261" cy="374" r="50" fill="url(#gold)" opacity=".35" filter="url(#b10)" class="flicker"/>
      <g transform="rotate(-4 120 420)"><rect x="70" y="402" width="90" height="60" fill="#d8ccb0" opacity=".8"/><g stroke="#4a3a2a" stroke-width="1.4" opacity=".7"><path d="M78 414 h70 M78 424 h64 M78 434 h70 M78 444 h50"/></g></g>
      <rect x="168" y="396" width="26" height="8" fill="#a33a24"/>`,
    salt: () => `<defs>${DEFS}${sky('#15191b', '#22282a', '#0d1012')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <!-- skylight shafts -->
      <g opacity=".25" filter="url(#b10)"><path d="M120 0 L170 0 L260 560 L160 560Z" fill="#b9c4c4"/><path d="M260 0 L290 0 L360 560 L300 560Z" fill="#b9c4c4"/></g>
      <!-- beams -->
      <g fill="#0b0d0e"><rect x="0" y="40" width="393" height="14"/><rect x="40" y="0" width="16" height="560"/><rect x="330" y="0" width="16" height="560"/><path d="M56 54 L180 160 L188 150 L64 44Z"/></g>
      <!-- salt mountains and sacks -->
      <g filter="url(#paint)"><path d="M-20 470 C40 360 120 330 200 420 C240 380 300 340 420 460 L420 560 L-20 560Z" fill="#7d8586"/>
      <path d="M-20 500 C60 440 140 430 220 480 L420 500 L420 560 L-20 560Z" fill="#5d6466"/></g>
      ${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${250 + i * 26}" cy="${470 - (i % 2) * 18}" rx="18" ry="24" fill="#8c7d64" filter="url(#soft)"/>`).join('')}
      <g fill="#cfd6d6" opacity=".5">${Array.from({ length: 30 }, (_, i) => `<circle class="mote" style="animation-delay:-${(i * 0.7) % 9}s" cx="${(i * 53) % 393}" cy="${(i * 97) % 420}" r="${1 + (i % 3) * .5}"/>`).join('')}</g>`,
    inn: () => `<defs>${DEFS}${sky('#1a120c', '#24170f', '#0d0907')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <g fill="#0d0907"><rect x="0" y="60" width="393" height="18"/><rect x="0" y="180" width="393" height="12"/><rect x="60" y="0" width="14" height="560"/><rect x="300" y="0" width="14" height="560"/></g>
      <!-- hearth -->
      <g filter="url(#paint)"><path d="M190 260 L370 260 L370 470 L190 470Z" fill="#2a1d14"/></g><path d="M214 300 L346 300 L346 470 L214 470Z" fill="#0a0604"/>
      <circle cx="280" cy="430" r="90" fill="url(#fire)" class="fire" filter="url(#b10)"/>
      <path d="M250 466 C254 420 270 430 276 396 C284 428 298 418 304 466Z" fill="#ffb24a" class="fire"/><path d="M262 466 C266 440 276 444 280 420 C286 446 292 440 296 466Z" fill="#ffe08a" class="fire"/>
      <circle cx="280" cy="400" r="200" fill="url(#fire)" opacity=".25" class="fire"/>
      <!-- table, candle, mug -->
      <g filter="url(#paint)"><path d="M-10 470 L240 460 L240 560 L-10 560Z" fill="#2a1a10"/></g>
      <rect x="60" y="430" width="10" height="32" fill="#e8dcc0"/><circle cx="65" cy="424" r="5" fill="#ffd27a" class="flicker"/><circle cx="65" cy="424" r="30" fill="url(#gold)" opacity=".4" filter="url(#b10)" class="flicker"/>
      <rect x="120" y="436" width="26" height="28" rx="3" fill="#4a3220"/>
      <g fill="#ffb24a">${Array.from({ length: 14 }, (_, i) => `<circle class="ember" style="animation-delay:-${i * 0.6}s" cx="${250 + (i * 17) % 70}" cy="${440 - (i * 13) % 40}" r="1.4"/>`).join('')}</g>`,
    pier_night: () => `<defs>${DEFS}${sky('#05080b', '#0e1820', '#06090c')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      ${town(250, '#0b1116', false)}
      <rect y="250" width="393" height="310" fill="#070c10"/>
      ${fog(250, .3, '#3d4f58')}
      <!-- boats with candles: the hidden thing -->
      ${[[60, 330], [150, 312], [240, 334], [320, 316], [110, 380], [210, 392], [300, 384]].map(([x, y], i) => `
        <path d="M${x - 28} ${y} Q${x} ${y + 16} ${x + 28} ${y} Z" fill="#120d0a"/>
        ${[-14, -4, 6, 16].map(d => `<rect x="${x + d}" y="${y - 10}" width="3" height="9" fill="#e8dcc0"/><circle class="candle" style="animation-delay:-${(i + d) % 7 * .3}s" cx="${x + d + 1.5}" cy="${y - 12}" r="2.2" fill="#ffd98a"/>`).join('')}
        <circle cx="${x}" cy="${y - 12}" r="34" fill="url(#gold)" opacity=".5" filter="url(#b10)" class="flicker"/>
        <path d="M${x - 20} ${y + 8} v40 M${x} ${y + 10} v52 M${x + 20} ${y + 8} v40" stroke="#f2b55a" stroke-width="2" opacity=".25" filter="url(#b2)"/>`).join('')}
      <g filter="url(#paint)"><path d="M-10 470 L393 456 L393 560 L-10 560Z" fill="#0d0a08"/></g>`,
  };

  function scene(name) {
    return `<svg class="scene-svg" viewBox="0 0 393 560" preserveAspectRatio="xMidYMin slice">${(SCENES[name] || SCENES.harbour)()}<rect width="393" height="560" filter="url(#grain)"/></svg>`;
  }

  // d20 icon with a number
  function d20(n, cls = '') {
    return `<svg class="d20 ${cls}" viewBox="0 0 54 58"><path d="M27 2 L51 15 L51 43 L27 56 L3 43 L3 15Z" fill="#1a140c" stroke="#d8a952" stroke-width="1.6"/><path d="M27 2 L27 18 M3 15 L15 24 M51 15 L39 24 M15 24 L39 24 L27 44Z M27 44 V56 M15 24 L3 43 M39 24 L51 43" stroke="#7a5f2e" stroke-width="1" fill="none"/><text x="27" y="37" text-anchor="middle" font-family="Marcellus, serif" font-size="15" fill="#f0c873">${n}</text></svg>`;
  }

  return { portrait, scene, d20 };
})();
