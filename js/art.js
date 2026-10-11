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
    if (p.hair === 'hood') s += `<g filter="url(#paint)"><path d="M60 360 C50 250 64 120 100 80 C130 46 172 46 202 80 C238 120 252 250 244 360Z" fill="${p.hoodCol || '#1e2a1e'}"/></g>`;
    if (p.hair === 'long') s += `<g filter="url(#soft)"><path d="M92 150 C80 210 72 300 60 360 L244 360 C232 300 222 210 210 150 C210 96 186 70 151 70 C116 70 92 96 92 150Z" fill="url(#${g}hr)"/></g>`;
    // head
    s += `<g filter="url(#soft)"><path d="M98 160 C96 104 120 82 151 82 C182 82 206 104 204 160 C203 206 182 246 151 248 C120 246 99 206 98 160Z" fill="url(#${g}sk)"/></g>`;
    // ear (right, lit)
    if (!['scarf', 'hood', 'long'].includes(p.hair)) s += `<path d="M202 160 C214 156 216 186 202 190Z" fill="${skinL}" opacity=".9" filter="url(#soft)"/>`;
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
    if (p.hair === 'hood') s += `<g filter="url(#soft)"><path d="M84 200 C70 110 112 66 151 66 C190 66 232 110 218 200 C214 150 196 112 151 110 C106 112 88 150 84 200Z" fill="${p.hoodCol || '#1e2a1e'}"/>
      <path d="M200 92 C214 110 222 140 220 190" stroke="${rim}" stroke-width="3" fill="none" opacity=".45"/></g>
      <ellipse cx="151" cy="140" rx="56" ry="26" fill="#000" opacity=".45" filter="url(#b10)"/>`;
    if (p.hair === 'long') s += `<g filter="url(#soft)"><path d="M94 170 C88 104 116 78 151 78 C186 78 214 104 208 170 C204 128 186 106 151 106 C126 108 104 120 94 170Z" fill="url(#${g}hr)"/>
      <path d="M200 110 C212 150 214 230 226 330" stroke="${rim}" stroke-width="2.5" fill="none" opacity=".5"/></g>`;
    if (p.hair === 'curly') s += `<g filter="url(#soft)" fill="url(#${g}hr)">${[[104, 132, 18], [118, 108, 20], [142, 94, 22], [168, 96, 21], [190, 112, 19], [200, 138, 16], [98, 158, 14], [206, 162, 13]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
    if (p.hair === 'nissecap') s += `<g filter="url(#soft)"><path d="M92 156 C88 110 116 84 151 84 C186 84 214 110 210 156Z" fill="${p.capCol || '#8a1e18'}"/>
      <path d="M100 120 C120 50 190 20 250 70 C232 74 214 92 206 130Z" fill="${p.capCol || '#8a1e18'}"/>
      <path d="M88 150 C120 140 182 140 214 150 C210 162 92 162 88 150Z" fill="#5a120e"/>
      <path d="M236 64 C244 66 248 72 250 70" stroke="${rim}" stroke-width="3" fill="none" opacity=".6"/></g>`;
    if (p.glasses) s += `<g stroke="#c9b27a" stroke-width="2" fill="none" opacity=".85"><circle cx="124" cy="182" r="15"/><circle cx="178" cy="182" r="15"/><path d="M139 182 h24 M109 180 l-10 -4 M193 180 l10 -4"/></g>`;
    if (p.glow) s += `<circle cx="125" cy="181.5" r="7" fill="${p.glow}" opacity=".45" filter="url(#b4)"/><circle cx="179" cy="181.5" r="7" fill="${p.glow}" opacity=".55" filter="url(#b4)"/>`;
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
    havmand: () => SCENES.pier_night() + `
      <g class="rise"><g filter="url(#soft)">
        <path d="M150 330 C150 270 170 236 196 232 C222 236 242 270 242 330Z" fill="#0d2a2c"/>
        <ellipse cx="196" cy="222" rx="24" ry="30" fill="#2c5a58"/>
        <path d="M168 214 C160 260 150 300 140 330 M224 214 C232 260 244 300 252 330 M176 206 C170 240 168 280 164 320 M216 206 C222 240 226 280 230 320" stroke="#173a36" stroke-width="7" fill="none" opacity=".9"/>
      </g>
      <circle cx="186" cy="220" r="3" fill="#bff7ec"/><circle cx="206" cy="220" r="3" fill="#bff7ec"/>
      <circle cx="196" cy="222" r="60" fill="#7fe0d0" opacity=".12" filter="url(#b22)"/>
      <path d="M160 330 Q196 322 232 330" stroke="#9fe8dc" stroke-width="2" opacity=".5" fill="none" filter="url(#b2)"/></g>`,
    ferry: () => `<defs>${DEFS}${sky('#0b1115', '#1a262c', '#0a0f12')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <rect y="300" width="393" height="260" fill="#0c1216"/>
      ${lights(220, 300, 5, 30)}
      ${fog(290, .5)}${fog(340, .35)}
      <g filter="url(#paint)"><path d="M-20 420 C80 410 300 410 420 424 L420 560 L-20 560Z" fill="#1a130d"/></g>
      <path d="M40 300 V430 M40 310 L140 400" stroke="#0a0806" stroke-width="5"/><path d="M40 312 L130 400 L40 400Z" fill="#2a2620" opacity=".7"/>
      <g fill="#0e0b08"><rect x="300" y="380" width="8" height="50"/><rect x="292" y="370" width="24" height="12"/></g>
      <circle cx="304" cy="376" r="5" fill="#ffd27a" class="flicker"/><circle cx="304" cy="376" r="40" fill="url(#gold)" opacity=".4" filter="url(#b10)" class="flicker"/>`,
    moor: () => `<defs>${DEFS}${sky('#05080a', '#0d1612', '#050807')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <circle cx="300" cy="80" r="26" fill="#cfd8cc" opacity=".55" filter="url(#b4)"/>
      <g filter="url(#paint)"><path d="M-20 300 C60 280 140 296 210 286 C280 276 340 290 420 284 L420 560 L-20 560Z" fill="#0c140f"/>
      <path d="M220 290 C250 230 330 226 360 292Z" fill="#101a12"/></g>
      ${[[60, 360, 70], [200, 400, 90], [320, 350, 60], [120, 450, 110]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w / 7}" fill="#1c2a2a" opacity=".8"/><ellipse cx="${x}" cy="${y}" rx="${w * .6}" ry="${w / 14}" fill="#cfd8cc" opacity=".08"/>`).join('')}
      <g stroke="#1a2618" stroke-width="2.5">${Array.from({ length: 40 }, (_, i) => { const x = (i * 37) % 400, y = 330 + (i * 53) % 200; return `<path d="M${x} ${y} q${(i % 3) - 1} -24 ${(i % 5) - 2} -${30 + (i % 4) * 8}"/>`; }).join('')}</g>
      <g class="wisps">${[[90, 330], [170, 300], [260, 340], [340, 312], [40, 400]].map(([x, y], i) => `<g class="wisp" style="animation-delay:-${i * 1.7}s"><circle cx="${x}" cy="${y}" r="16" fill="#8fe0d8" opacity=".35" filter="url(#b10)"/><circle cx="${x}" cy="${y}" r="2.6" fill="#dffffa"/></g>`).join('')}</g>
      ${fog(320, .5, '#4a5e58')}${fog(420, .4, '#3e524c')}`,
    elverhoj: () => SCENES.moor() + `
      <g filter="url(#paint)"><path d="M120 300 C150 190 270 190 300 300Z" fill="#0f1a12"/></g>
      <path d="M196 300 L196 262 Q210 246 224 262 L224 300Z" fill="#e8f4d8" opacity=".8" class="flicker"/><circle cx="210" cy="282" r="50" fill="#d8f0c0" opacity=".25" filter="url(#b22)" class="flicker"/>
      ${[[150, 300], [180, 310], [240, 310], [270, 300], [210, 318]].map(([x, y], i) => `<g class="dance" style="animation-delay:-${i * .8}s"><ellipse cx="${x}" cy="${y - 26}" rx="7" ry="9" fill="#e8f0e4" opacity=".7"/><path d="M${x - 9} ${y + 10} C${x - 8} ${y - 12} ${x + 8} ${y - 12} ${x + 9} ${y + 10}Z" fill="#dfe9dc" opacity=".55"/></g>`).join('')}`,
    market: () => `<defs>${DEFS}${sky('#1c2328', '#2a3236', '#121618')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <g filter="url(#paint)">${[[0, 120, 90, '#2a2a28'], [86, 90, 80, '#302a24'], [162, 130, 76, '#26282a'], [234, 100, 84, '#2e2620'], [314, 126, 90, '#28282a']].map(([x, y, w, c]) => `<path d="M${x} 560 L${x} ${y + 40} L${x + w / 2} ${y} L${x + w} ${y + 40} L${x + w} 560Z" fill="${c}"/>`).join('')}</g>
      ${[[20, 200], [100, 180], [180, 214], [252, 190], [334, 210]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="20" fill="#f2b55a" opacity=".55"/><rect x="${x + 30}" y="${y}" width="16" height="20" fill="#f2b55a" opacity=".3"/>`).join('')}
      ${[[30, 270], [110, 250], [190, 286], [262, 262], [344, 280]].map(([x, y], i) => `<path d="M${x} ${y - 20} h40" stroke="#0b0b0a" stroke-width="3"/><rect x="${x + 2}" y="${y - 18}" width="36" height="22" rx="2" fill="#5a4630" class="swing" style="animation-delay:-${i}s"/>`).join('')}
      <g filter="url(#paint)"><path d="M-20 380 L420 372 L420 560 L-20 560Z" fill="#1e1d1b"/></g>
      <g stroke="#2c2a26" stroke-width="2" opacity=".7">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 36 - 10} 560 L${i * 30 + 10} 380"/>`).join('')}<path d="M-20 420 H420 M-20 470 H420 M-20 520 H420"/></g>
      <rect x="180" y="300" width="6" height="90" fill="#0b0b0a"/><circle cx="183" cy="296" r="7" fill="#ffd27a" class="flicker"/><circle cx="183" cy="296" r="50" fill="url(#gold)" opacity=".3" filter="url(#b10)"/>
      ${fog(360, .3)}`,
    attic: () => `<defs>${DEFS}${sky('#0e0c0a', '#16120e', '#0a0806')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <path d="M0 0 L196 -40 L393 0 L393 120 L196 40 L0 120Z" fill="#0a0806"/>
      <g stroke="#1f1710" stroke-width="12"><path d="M-10 130 L196 30 L403 130"/><path d="M60 100 V560 M330 100 V560"/></g>
      <g stroke="#140f0a" stroke-width="5">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 56 - 10} 560 L196 40"/>`).join('')}</g>
      <rect x="168" y="120" width="56" height="56" fill="#2c3e48"/><path d="M196 120 V176 M168 148 H224" stroke="#0a0806" stroke-width="4"/>
      <path d="M168 176 L110 560 L290 560 L224 176Z" fill="#9fb4c0" opacity=".08"/>
      <g filter="url(#paint)"><rect x="20" y="400" width="110" height="80" fill="#2a1d12"/><rect x="250" y="420" width="130" height="70" fill="#24190f"/><rect x="40" y="370" width="70" height="34" fill="#33241a"/></g>
      <path d="M-10 500 L403 490 L403 560 L-10 560Z" fill="#120d08"/>
      <g fill="#cfc4a8" opacity=".35">${Array.from({ length: 24 }, (_, i) => `<circle class="mote" style="animation-delay:-${(i * .9) % 9}s" cx="${150 + (i * 23) % 100}" cy="${200 + (i * 41) % 260}" r="1.2"/>`).join('')}</g>`,
    cellar: () => `<defs>${DEFS}${sky('#141210', '#1c1814', '#0b0a08')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <g fill="#0b0a08">${[0, 1, 2].map(i => `<path d="M${-40 + i * 160} 330 C${-40 + i * 160} 140 ${120 + i * 160} 140 ${120 + i * 160} 330 L${110 + i * 160} 330 C${110 + i * 160} 160 ${-30 + i * 160} 160 ${-30 + i * 160} 330Z"/>`).join('')}</g>
      <rect x="110" y="190" width="170" height="110" fill="#1d2a22"/><rect x="104" y="184" width="182" height="122" fill="none" stroke="#3a2a1c" stroke-width="8"/>
      <g stroke="#d8d8c8" stroke-width="1.6" opacity=".7" fill="none"><path d="M124 214 h60 M124 232 h90 M124 250 h50 M124 268 h80"/><path d="M200 214 l20 0" stroke="#c4664a"/></g>
      ${[[50, 400], [340, 380]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="26" fill="#e8dcc0"/><circle cx="${x + 4}" cy="${y - 4}" r="4" fill="#ffd27a" class="flicker"/><circle cx="${x + 4}" cy="${y - 4}" r="36" fill="url(#gold)" opacity=".45" filter="url(#b10)" class="flicker"/>`).join('')}
      <g filter="url(#paint)"><path d="M-20 440 L420 430 L420 560 L-20 560Z" fill="#14100c"/></g>
      ${[70, 150, 230, 310].map(x => `<path d="M${x} 470 v-34 h30 v34 M${x} 450 h30" stroke="#2a1f16" stroke-width="5" fill="none"/>`).join('')}`,
    street: () => `<defs>${DEFS}${sky('#0b0f12', '#141c20', '#080b0d')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <g filter="url(#paint)"><path d="M-10 560 L-10 60 L80 40 L120 140 L120 560Z" fill="#141a1e"/><path d="M403 560 L403 50 L310 30 L270 150 L270 560Z" fill="#161c20"/></g>
      ${[[30, 200], [60, 290], [330, 220], [300, 320]].map(([x, y]) => `<rect x="${x}" y="${y}" width="18" height="24" fill="#f2b55a" opacity=".5" class="flicker"/>`).join('')}
      <path d="M120 560 L170 330 L220 330 L270 560Z" fill="#191a1a"/>
      <g stroke="#262624" stroke-width="2">${Array.from({ length: 8 }, (_, i) => `<path d="M${150 - i * 4} ${360 + i * 26} H${240 + i * 4}"/>`).join('')}</g>
      ${fog(330, .45)}`,
    house: () => `<defs>${DEFS}${sky('#141210', '#1e1914', '#0b0908')}</defs>
      <rect width="393" height="560" fill="url(#sky)"/>
      <rect x="40" y="110" width="110" height="140" fill="#22323a"/><path d="M95 110 V250 M40 180 H150" stroke="#0b0908" stroke-width="6"/>
      <rect x="40" y="110" width="110" height="140" fill="#5d727b" opacity=".3" class="fog1" filter="url(#b10)"/>
      <g filter="url(#paint)"><path d="M220 260 L380 260 L380 460 L220 460Z" fill="#241a12"/></g><path d="M244 300 L356 300 L356 460 L244 460Z" fill="#0a0705"/>
      <g fill="#3a2a1c"><rect x="250" y="440" width="100" height="10"/></g>
      <g filter="url(#paint)"><path d="M-20 470 L240 462 L240 560 L-20 560Z" fill="#2a1a10"/></g>
      <rect x="80" y="430" width="10" height="30" fill="#e8dcc0"/><circle cx="85" cy="424" r="5" fill="#ffd27a" class="flicker"/><circle cx="85" cy="424" r="34" fill="url(#gold)" opacity=".4" filter="url(#b10)" class="flicker"/>`,
    map: () => `<defs>${DEFS}
      <radialGradient id="parch" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#cdbd98"/><stop offset=".7" stop-color="#a8956e"/><stop offset="1" stop-color="#3a2e1c"/></radialGradient></defs>
      <rect width="393" height="560" fill="#140f0a"/>
      <rect x="10" y="10" width="373" height="540" rx="6" fill="url(#parch)"/>
      <path d="M10 360 C70 350 90 400 150 410 C210 420 230 470 300 480 C340 486 370 500 383 520 L383 550 L10 550Z" fill="#5d7a80" opacity=".55"/>
      <g stroke="#3e5a60" stroke-width="1.2" fill="none" opacity=".6"><path d="M20 400 q20 -6 40 0 t40 0 M60 440 q20 -6 40 0 t40 0 M150 470 q20 -6 40 0 t40 0 M250 510 q20 -6 40 0"/></g>
      <path d="M220 40 C280 30 360 60 370 140 C360 200 300 210 250 190 C220 170 210 90 220 40Z" fill="#6a7a58" opacity=".5"/>
      <g fill="#4a5a3a" opacity=".6">${Array.from({ length: 30 }, (_, i) => `<path d="M${240 + (i * 37) % 120} ${60 + (i * 23) % 130} v-8 M${244 + (i * 37) % 120} ${60 + (i * 23) % 130} v-6" stroke="#3a4a2a" stroke-width="1.4"/>`).join('')}</g>
      <g stroke="#3a2a18" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M90 340 C120 300 150 260 196 240 C230 226 260 210 290 160"/><path d="M196 240 C210 280 230 300 250 360"/><path d="M196 240 C160 230 120 220 90 190"/><path d="M120 300 C150 320 170 350 180 400"/></g>
      <g fill="#3a2a18" opacity=".8">${Array.from({ length: 40 }, (_, i) => { const x = 70 + (i * 47) % 200, y = 180 + (i * 31) % 200; return `<rect x="${x}" y="${y}" width="${6 + i % 4}" height="${5 + i % 3}"/>`; }).join('')}</g>
      <text x="300" y="100" font-family="Marcellus, serif" font-size="13" fill="#3a3a22" text-anchor="middle" opacity=".8">Mosen</text>
      <text x="60" y="470" font-family="Marcellus, serif" font-size="13" fill="#2a3a40" opacity=".8">Havet</text>
      <text x="196" y="40" font-family="Marcellus, serif" font-size="18" fill="#3a2a18" text-anchor="middle" letter-spacing="4">VANDMARK</text>
      <circle cx="350" cy="510" r="18" fill="none" stroke="#3a2a18" stroke-width="1.4"/><path d="M350 490 L354 510 L350 530 L346 510Z" fill="#3a2a18"/><text x="350" y="487" font-size="9" text-anchor="middle" fill="#3a2a18">N</text>
      <rect x="10" y="10" width="373" height="540" rx="6" fill="none" stroke="#2a1f12" stroke-width="3"/>
      <rect width="393" height="560" fill="#000" opacity=".12"/>`,
  };

  function scene(name) {
    return `<svg class="scene-svg" viewBox="0 0 393 560" preserveAspectRatio="xMidYMin slice">${(SCENES[name] || SCENES.harbour)()}<rect width="393" height="560" filter="url(#grain)"/></svg>`;
  }

  // d20 icon with a number
  function d20(n, cls = '') {
    return `<svg class="d20 ${cls}" viewBox="0 0 54 58"><path d="M27 2 L51 15 L51 43 L27 56 L3 43 L3 15Z" fill="#1a140c" stroke="#d8a952" stroke-width="1.6"/><path d="M27 2 L27 18 M3 15 L15 24 M51 15 L39 24 M15 24 L39 24 L27 44Z M27 44 V56 M15 24 L3 43 M39 24 L51 43" stroke="#7a5f2e" stroke-width="1" fill="none"/><text x="27" y="37" text-anchor="middle" font-family="Marcellus, serif" font-size="15" fill="#f0c873">${n}</text></svg>`;
  }

  /* ---------------- object icons (vocabulary) ---------------- 48×48, ink on bone */
  const I = {
    ske: '<ellipse cx="24" cy="12" rx="7" ry="9"/><path d="M24 21 V44"/>',
    gaffel: '<path d="M17 4 V16 M24 4 V16 M31 4 V16 M17 16 C17 22 31 22 31 16 M24 20 V44"/>',
    kniv: '<path d="M22 4 C30 10 30 24 26 28 L22 28Z M24 28 V44"/>',
    kop: '<path d="M10 14 H34 V30 C34 38 10 38 10 30Z M34 18 C42 18 42 28 34 28"/><path d="M14 8 q2 -3 0 -6 M22 8 q2 -3 0 -6" opacity=".6"/>',
    tallerken: '<ellipse cx="24" cy="26" rx="20" ry="9"/><ellipse cx="24" cy="25" rx="11" ry="4.5"/>',
    noegle: '<circle cx="14" cy="14" r="8"/><path d="M20 20 L42 42 M34 34 L38 30 M38 38 L42 34"/>',
    lys: '<rect x="18" y="18" width="12" height="26"/><path d="M24 18 V12"/><path d="M24 2 C30 8 28 12 24 12 C20 12 18 8 24 2Z" fill="#f0c873" stroke="#f0c873"/>',
    bog: '<path d="M6 10 C14 6 20 8 24 12 C28 8 34 6 42 10 V40 C34 36 28 38 24 42 C20 38 14 36 6 40Z M24 12 V42"/>',
    smoer: '<path d="M6 30 L14 22 H42 L34 30Z M6 30 V38 H34 V30 M34 38 L42 30 V22"/>',
    stol: '<path d="M14 4 V44 M14 24 H34 V44 M14 4 H32 V24"/>',
    bord: '<path d="M4 16 H44 M8 16 V42 M40 16 V42 M4 20 H44"/>',
    seng: '<path d="M4 18 V40 M44 26 V40 M4 32 H44 M4 26 H44 M8 26 V20 C8 16 18 16 18 20 V26"/>',
    lampe: '<path d="M14 18 L20 6 H28 L34 18Z M24 18 V38 M14 42 H34"/>',
    taeppe: '<rect x="6" y="10" width="36" height="28" rx="2"/><path d="M6 16 H42 M6 32 H42 M14 10 V38 M34 10 V38" opacity=".6"/>',
    kiste: '<path d="M6 20 H42 V40 H6Z M6 20 C6 8 42 8 42 20 M22 26 H26 V32 H22Z"/>',
    ur: '<circle cx="24" cy="24" r="18"/><path d="M24 12 V24 L32 28"/>',
    broed: '<path d="M6 30 C6 16 42 16 42 30 L40 38 H8Z M16 22 L18 28 M24 20 L25 27 M32 22 L30 28"/>',
    kage: '<path d="M8 22 H40 V40 H8Z M8 28 H40 M24 22 V14"/><path d="M24 8 C27 11 26 14 24 14 C22 14 21 11 24 8Z" fill="#f0c873" stroke="#f0c873"/>',
    fisk: '<path d="M4 24 C12 12 30 12 38 24 C30 36 12 36 4 24Z M38 24 L46 16 V32Z"/><circle cx="12" cy="22" r="1.5" fill="currentColor"/>',
    koed: '<path d="M10 30 C4 18 18 6 30 10 C42 14 44 30 34 36 C26 42 14 40 10 30Z M30 18 C34 20 34 26 30 28"/>',
    aeble: '<path d="M24 14 C14 8 4 18 8 30 C12 42 20 44 24 40 C28 44 36 42 40 30 C44 18 34 8 24 14Z M24 14 C24 8 26 6 30 4"/>',
    kartoffel: '<path d="M8 26 C6 14 22 8 34 12 C44 16 44 32 34 36 C22 42 10 38 8 26Z"/><circle cx="18" cy="22" r="1.4" fill="currentColor"/><circle cx="30" cy="28" r="1.4" fill="currentColor"/>',
    maelk: '<path d="M16 4 H32 V10 L36 16 V44 H12 V16 L16 10Z M12 24 H36"/>',
    ost: '<path d="M4 34 L40 14 L44 34Z M4 34 V40 H44 V34"/><circle cx="30" cy="28" r="2.5"/><circle cx="20" cy="31" r="1.8"/>',
    aeg: '<path d="M24 6 C14 6 10 22 10 30 C10 38 16 44 24 44 C32 44 38 38 38 30 C38 22 34 6 24 6Z"/>',
    saebe: '<rect x="8" y="18" width="32" height="20" rx="8"/><circle cx="16" cy="12" r="3"/><circle cx="26" cy="8" r="2"/>',
    medicin: '<path d="M18 4 H30 V12 L34 16 V44 H14 V16 L18 12Z M20 28 H28 M24 24 V32"/>',
    blomst: '<circle cx="24" cy="16" r="5"/><path d="M24 11 C20 2 28 2 24 11 M29 16 C38 12 38 20 29 16 M19 16 C10 12 10 20 19 16 M24 21 C20 30 28 30 24 21 M24 22 V44 M24 34 C18 30 14 32 14 32"/>',
    cykel: '<circle cx="12" cy="32" r="9"/><circle cx="36" cy="32" r="9"/><path d="M12 32 L20 18 H32 L36 32 M20 18 L26 32 L32 18 M18 14 H24"/>',
    sko: '<path d="M4 34 V22 C10 22 16 18 20 14 L28 26 C34 28 44 28 44 34 V38 H4Z"/>',
    ris: '<path d="M8 24 H40 C40 36 32 42 24 42 C16 42 8 36 8 24Z"/><path d="M14 22 C16 16 32 16 34 22" opacity=".7"/>',
    grod: '<path d="M8 22 H40 C40 34 32 40 24 40 C16 40 8 34 8 22Z"/><rect x="20" y="16" width="8" height="6" fill="#f0c873" stroke="#f0c873"/>',
    hat: '<path d="M4 34 H44 M12 34 C12 20 14 12 24 12 C34 12 36 20 36 34"/>',
    vindue: '<rect x="8" y="6" width="32" height="36"/><path d="M24 6 V42 M8 24 H40"/>',
    doer: '<rect x="12" y="4" width="24" height="40"/><circle cx="31" cy="26" r="1.8" fill="currentColor"/>',
    soem: '<path d="M24 4 V40 M18 4 H30 M24 40 L22 44 H26Z"/>',
    hammer: '<path d="M10 8 H30 V18 H10Z M20 18 V44"/>',
  };
  function icon(name, cls = '') {
    return `<svg class="ico ${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${I[name] || '<circle cx="24" cy="24" r="16"/>'}</svg>`;
  }

  return { portrait, scene, d20, icon, ICONS: I };
})();
