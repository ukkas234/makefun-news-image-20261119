// news-image-20261119 — "A WORLD ON THE EDGE"
// Generates one self-contained SVG (1600x1200 design space) summarising
// 19 November 2026 world news in six stories. Node 22, standard library only.
//   node render.mjs            -> writes dist/news-image-20261119.svg
//   node render.mjs --check    -> validates + renders twice, compares SHA-256
// The SVG is the source of truth. The judged PNG is rasterised from it at
// 1024x768 (the competition gate caps images at 1024x1024 px and 1 MiB, so the
// 1600x1200 design is scaled by exactly 0.64; the 4:3 layout is preserved).
// No network, no external fonts/images, no remote requests. Deterministic.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'dist');
const SVG_PATH = join(OUT_DIR, 'news-image-20261119.svg');

// Design canvas (GPT spec). Raster target is the gate-compliant 1024x768.
const W = 1600;
const H = 1200;
const SCALE = 1024 / 1600; // 0.64 -> PNG 1024x768
const PNG_W = Math.round(W * SCALE);
const PNG_H = Math.round(H * SCALE);

// Palette (GPT spec).
const C = {
  navy: '#081525',
  ink: '#10263A',
  ink2: '#16324A',
  ivory: '#F4EBDD',
  coral: '#F05B4F',
  amber: '#F4B544',
  cyan: '#55C7D9',
  steel: '#8EA5B5',
  steelDim: '#5F7A8C',
};

const FONT = "'Noto Sans', 'DejaVu Sans', sans-serif";
const FONT_COND = "'Noto Sans Condensed', 'Noto Sans', 'DejaVu Sans', sans-serif";

// Six stories only. No GTA VI, no Fed minutes. Copy is factual, qualified,
// drawn from the owner's research (BBC News, The New York Times, The Hindu).
const STORIES = [
  {
    id: 'anthropic', tag: 'TECHNOLOGY', color: C.cyan,
    headline: 'IPO WATCH', numeral: '$1.4T+',
    body: 'Anthropic is reportedly preparing an IPO at a valuation above $1.4 trillion.',
    art: 'network',
  },
  {
    id: 'shenzhen', tag: 'DIPLOMACY', color: C.amber, hero: true,
    headline: 'THREE POWERS, ONE TABLE',
    body: 'Trump, Xi and Putin meet in Shenzhen during APEC; a reported tarmac embrace marks the moment.',
    art: 'summit',
  },
  {
    id: 'gulf', tag: 'CONFLICT', color: C.coral,
    headline: 'THE GULF ERUPTS',
    body: 'The US strikes a missile site on Qeshm Island; Iran hits US bases in Kuwait and Bahrain.',
    art: 'gulf',
  },
  {
    id: 'vangogh', tag: 'CULTURE', color: C.amber,
    headline: '$190.4 MILLION', numeral: '$190.4M',
    body: 'A Van Gogh sells for a record $190.4 million after controversy over its Nazi-era history.',
    art: 'swirl',
  },
  {
    id: 'rohingya', tag: 'JUSTICE', color: C.cyan,
    headline: 'A HISTORIC ICJ MOMENT',
    body: 'Myanmar faces a historic genocide judgment at the International Court of Justice over the Rohingya.',
    art: 'justice',
  },
  {
    id: 'crimea', tag: 'SECURITY', color: C.coral,
    headline: 'TRAFFIC HALTED',
    body: 'Another attack on the Crimea Bridge is confirmed by Russian officials; traffic is temporarily closed.',
    art: 'bridge',
  },
];

const LEGEND = ['DIPLOMACY', 'CONFLICT', 'SECURITY', 'CULTURE', 'TECHNOLOGY', 'JUSTICE'];
const LEGEND_COLORS = { DIPLOMACY: C.amber, CONFLICT: C.coral, SECURITY: C.coral, CULTURE: C.amber, TECHNOLOGY: C.cyan, JUSTICE: C.cyan };

// --- helpers ---------------------------------------------------------------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Greedy word wrap to a max character count per line (conservative for Noto Sans).
function wrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) { cur = w; continue; }
    if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function sha256(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

function text(x, y, s, attrs = {}) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<text x="${x}" y="${y}" ${a}>${esc(s)}</text>`;
}

function tspanLines(lines, x, y0, dy, attrs = {}) {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return lines.map((ln, i) => `<tspan x="${x}" y="${y0 + i * dy}" ${a}>${esc(ln)}</tspan>`).join('');
}

// --- illustrations (all original SVG primitives; no photos, faces, logos) ---
// Each draws inside a local box (x, y, w, h) and returns an SVG fragment.

// Anthropic: neural network rising into a market graph.
function artNetwork(x, y, w, h) {
  const nodes = [
    [18, 120], [52, 84], [86, 118], [30, 52], [66, 38], [104, 66], [96, 128],
  ];
  const links = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [5, 6], [1, 4], [2, 6], [3, 1]];
  let s = '';
  for (const [a, b] of links) {
    s += `<line x1="${x + nodes[a][0]}" y1="${y + nodes[a][1]}" x2="${x + nodes[b][0]}" y2="${y + nodes[b][1]}" stroke="${C.cyan}" stroke-opacity="0.55" stroke-width="1.4"/>`;
  }
  for (const [nx, ny] of nodes) {
    s += `<circle cx="${x + nx}" cy="${y + ny}" r="4.5" fill="${C.cyan}"/>`;
  }
  // rising market line + bars
  s += `<polyline points="${x + 8},${y + 150} ${x + 38},${y + 138} ${x + 66},${y + 142} ${x + 96},${y + 118} ${x + 122},${y + 96}" fill="none" stroke="${C.amber}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M ${x + 122} ${y + 96} l -12 1 l 5 10 z" fill="${C.amber}"/>`;
  s += `<rect x="${x + 14}" y="${y + 152}" width="10" height="12" fill="${C.steel}" fill-opacity="0.55"/>`;
  s += `<rect x="${x + 34}" y="${y + 146}" width="10" height="18" fill="${C.steel}" fill-opacity="0.55"/>`;
  s += `<rect x="${x + 54}" y="${y + 150}" width="10" height="14" fill="${C.steel}" fill-opacity="0.55"/>`;
  return s;
}

// Shenzhen summit: three generic silhouettes around a luminous round table, skyline behind.
function artSummit(x, y, w, h) {
  let s = '';
  // abstract skyline
  const towers = [[6, 62, 16, 66], [28, 44, 18, 84], [52, 70, 14, 58], [72, 52, 18, 76], [96, 66, 16, 62]];
  for (const [tx, ty, tw, th] of towers) {
    s += `<rect x="${x + tx}" y="${y + ty}" width="${tw}" height="${th}" fill="${C.steel}" fill-opacity="0.4"/>`;
  }
  // round table (glowing)
  s += `<ellipse cx="${x + 62}" cy="${y + 128}" rx="34" ry="9" fill="${C.amber}" fill-opacity="0.25"/>`;
  s += `<ellipse cx="${x + 62}" cy="${y + 126}" rx="30" ry="7" fill="${C.amber}"/>`;
  // three silhouettes (head + shoulders, no faces)
  const figs = [[22, 96], [62, 82], [102, 96]];
  for (const [fx, fy] of figs) {
    s += `<circle cx="${x + fx}" cy="${y + fy}" r="9" fill="${C.navy}"/>`;
    s += `<path d="M ${x + fx - 13} ${y + fy + 26} Q ${x + fx} ${y + fy + 6} ${x + fx + 13} ${y + fy + 26} Z" fill="${C.navy}"/>`;
    s += `<circle cx="${x + fx}" cy="${y + fy}" r="9" fill="none" stroke="${C.ivory}" stroke-opacity="0.85" stroke-width="1.4"/>`;
    s += `<path d="M ${x + fx - 13} ${y + fy + 26} Q ${x + fx} ${y + fy + 6} ${x + fx + 13} ${y + fy + 26}" fill="none" stroke="${C.ivory}" stroke-opacity="0.85" stroke-width="1.4"/>`;
  }
  return s;
}

// Gulf: abstract coastline, island marker, carriers, alert arcs.
function artGulf(x, y, w, h) {
  let s = '';
  // coastline (abstract bay)
  s += `<path d="M ${x + 4} ${y + 30} Q ${x + 46} ${y + 12} ${x + 78} ${y + 34} Q ${x + 104} ${y + 52} ${x + 122} ${y + 30}" fill="none" stroke="${C.steel}" stroke-width="2" stroke-opacity="0.8"/>`;
  s += `<path d="M ${x + 4} ${y + 44} Q ${x + 46} ${y + 28} ${x + 78} ${y + 48} Q ${x + 104} ${y + 64} ${x + 122} ${y + 44}" fill="none" stroke="${C.steel}" stroke-width="1.4" stroke-opacity="0.45"/>`;
  // island marker
  s += `<circle cx="${x + 66}" cy="${y + 78}" r="5" fill="${C.coral}"/>`;
  s += `<circle cx="${x + 66}" cy="${y + 78}" r="10" fill="none" stroke="${C.coral}" stroke-width="1.4"/>`;
  // alert arcs
  s += `<path d="M ${x + 44} ${y + 62} A 26 26 0 0 1 ${x + 88} ${y + 62}" fill="none" stroke="${C.coral}" stroke-width="1.6" stroke-dasharray="4 4"/>`;
  s += `<path d="M ${x + 36} ${y + 52} A 38 38 0 0 1 ${x + 96} ${y + 52}" fill="none" stroke="${C.coral}" stroke-width="1.2" stroke-dasharray="3 5" stroke-opacity="0.6"/>`;
  // three carrier silhouettes
  const ships = [[18, 122], [56, 136], [94, 122]];
  for (const [sx, sy] of ships) {
    s += `<path d="M ${x + sx} ${y + sy} l 26 0 l -5 8 l -16 0 z" fill="${C.ivory}" fill-opacity="0.9"/>`;
    s += `<rect x="${x + sx + 9}" y="${y + sy - 8}" width="7" height="8" fill="${C.ivory}" fill-opacity="0.9"/>`;
  }
  return s;
}

// Van Gogh: original swirling-star motif in a museum frame (not a copy).
function artSwirl(x, y, w, h) {
  let s = '';
  // frame
  s += `<rect x="${x + 6}" y="${y + 6}" width="112" height="112" fill="${C.navy}" stroke="${C.amber}" stroke-width="3"/>`;
  s += `<rect x="${x + 12}" y="${y + 12}" width="100" height="100" fill="none" stroke="${C.amber}" stroke-width="1" stroke-opacity="0.6"/>`;
  // swirl: concentric arcs + stars (original motif)
  s += `<path d="M ${x + 62} ${y + 62} m -34 0 a 34 34 0 1 1 34 34 a 26 26 0 1 1 -26 -26 a 18 18 0 1 1 18 18" fill="none" stroke="${C.amber}" stroke-width="3" stroke-linecap="round"/>`;
  s += `<path d="M ${x + 62} ${y + 62} m -20 0 a 20 20 0 1 0 20 20" fill="none" stroke="${C.cyan}" stroke-width="2.4" stroke-linecap="round"/>`;
  const stars = [[36, 34], [92, 30], [98, 88], [30, 92]];
  for (const [sx, sy] of stars) {
    s += `<path d="M ${x + sx} ${y + sy - 7} L ${x + sx + 2} ${y + sy - 2} L ${x + sx + 7} ${y + sy} L ${x + sx + 2} ${y + sy + 2} L ${x + sx} ${y + sy + 7} L ${x + sx - 2} ${y + sy + 2} L ${x + sx - 7} ${y + sy} L ${x + sx - 2} ${y + sy - 2} Z" fill="${C.ivory}"/>`;
  }
  s += `<circle cx="${x + 62}" cy="${y + 62}" r="5" fill="${C.coral}"/>`;
  return s;
}

// Rohingya / ICJ: courthouse columns, scales of justice, candle.
function artJustice(x, y, w, h) {
  let s = '';
  // pediment + columns
  s += `<path d="M ${x + 14} ${y + 42} L ${x + 62} ${y + 16} L ${x + 110} ${y + 42} Z" fill="${C.ivory}" fill-opacity="0.92"/>`;
  s += `<rect x="${x + 12}" y="${y + 42}" width="100" height="6" fill="${C.ivory}" fill-opacity="0.92"/>`;
  for (const cx of [26, 48, 70, 92]) {
    s += `<rect x="${x + cx}" y="${y + 48}" width="8" height="52" fill="${C.ivory}" fill-opacity="0.85"/>`;
  }
  s += `<rect x="${x + 12}" y="${y + 100}" width="100" height="6" fill="${C.ivory}" fill-opacity="0.92"/>`;
  // scales of justice (small, below)
  s += `<line x1="${x + 62}" y1="${y + 116}" x2="${x + 62}" y2="${y + 146}" stroke="${C.cyan}" stroke-width="2"/>`;
  s += `<line x1="${x + 40}" y1="${y + 122}" x2="${x + 84}" y2="${y + 122}" stroke="${C.cyan}" stroke-width="2"/>`;
  s += `<path d="M ${x + 40} ${y + 122} l -8 12 a 8 5 0 0 0 16 0 z" fill="${C.cyan}"/>`;
  s += `<path d="M ${x + 84} ${y + 122} l -8 12 a 8 5 0 0 0 16 0 z" fill="${C.cyan}"/>`;
  // candle light
  s += `<rect x="${x + 104}" y="${y + 138}" width="6" height="16" fill="${C.ivory}"/>`;
  s += `<path d="M ${x + 107} ${y + 132} q 5 6 0 10 q -5 -4 0 -10" fill="${C.amber}"/>`;
  return s;
}

// Crimea Bridge: long deck across dark water, one broken span.
function artBridge(x, y, w, h) {
  let s = '';
  // water
  for (const wy of [120, 134, 148]) {
    s += `<path d="M ${x + 4} ${y + wy} q 12 -5 24 0 t 24 0 t 24 0 t 24 0 t 24 0" fill="none" stroke="${C.steel}" stroke-width="1.6" stroke-opacity="0.55"/>`;
  }
  // towers
  for (const tx of [30, 88]) {
    s += `<rect x="${x + tx}" y="${y + 34}" width="6" height="72" fill="${C.ivory}" fill-opacity="0.9"/>`;
    s += `<rect x="${x + tx - 3}" y="${y + 28}" width="12" height="6" fill="${C.ivory}" fill-opacity="0.9"/>`;
  }
  // cables
  s += `<line x1="${x + 33}" y1="${y + 34}" x2="${x + 62}" y2="${y + 66}" stroke="${C.steel}" stroke-width="1.2"/>`;
  s += `<line x1="${x + 91}" y1="${y + 34}" x2="${x + 62}" y2="${y + 66}" stroke="${C.steel}" stroke-width="1.2"/>`;
  // deck: left span + right span, gap in the middle (broken)
  s += `<rect x="${x + 2}" y="${y + 66}" width="52" height="7" fill="${C.ivory}"/>`;
  s += `<rect x="${x + 72}" y="${y + 66}" width="52" height="7" fill="${C.ivory}"/>`;
  // broken ends (angled)
  s += `<path d="M ${x + 54} ${y + 66} l 8 0 l -3 12 l -8 0 z" fill="${C.ivory}"/>`;
  s += `<path d="M ${x + 72} ${y + 66} l -8 0 l 3 12 l 8 0 z" fill="${C.ivory}"/>`;
  // warning marker over the gap
  s += `<path d="M ${x + 63} ${y + 40} l 9 16 l -18 0 z" fill="${C.coral}"/>`;
  s += `<text x="${x + 63}" y="${y + 53}" font-family="${FONT}" font-size="11" font-weight="700" fill="${C.navy}" text-anchor="middle">!</text>`;
  return s;
}

const ART = { network: artNetwork, summit: artSummit, gulf: artGulf, swirl: artSwirl, justice: artJustice, bridge: artBridge };

// --- layout ----------------------------------------------------------------
const CARD_W = 500, CARD_H = 220, CARD_GAP = 20;
const GRID_X0 = 30, GRID_Y0 = 580;

function cardPos(col, row) {
  return { x: GRID_X0 + col * (CARD_W + CARD_GAP), y: GRID_Y0 + row * (CARD_H + CARD_GAP) };
}

function storyCard(story, col, row) {
  const { x, y } = cardPos(col, row);
  const lines = wrap(story.body, 36);
  let s = '';
  // card body
  s += `<rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="14" fill="${C.ink}" stroke="${C.steel}" stroke-opacity="0.28" stroke-width="1"/>`;
  // category accent bar
  s += `<rect x="${x + 2}" y="${y + 2}" width="${CARD_W - 4}" height="5" rx="2" fill="${story.color}"/>`;
  if (story.hero) {
    s += `<rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="14" fill="none" stroke="${C.amber}" stroke-opacity="0.55" stroke-width="1.6"/>`;
  }
  // tag + headline + body
  s += text(x + 22, y + 36, story.tag, { 'font-family': FONT, 'font-size': 13, 'font-weight': 700, 'letter-spacing': 3, fill: story.color });
  s += text(x + 22, y + 70, story.headline, { 'font-family': FONT, 'font-size': 25, 'font-weight': 800, fill: C.ivory });
  s += `<text font-family="${FONT}" font-size="16" fill="${C.ivory}" fill-opacity="0.92">${tspanLines(lines, x + 22, y + 100, 22, {})}</text>`;
  // divider + illustration
  s += `<line x1="${x + 348}" y1="${y + 28}" x2="${x + 348}" y2="${y + 192}" stroke="${C.steel}" stroke-opacity="0.25" stroke-width="1"/>`;
  const frag = ART[story.art](0, 0, 130, 170);
  if (story.numeral) {
    s += `<g transform="translate(${x + 362},${y + 26}) scale(0.72)">${frag}</g>`;
    s += text(x + 420, y + 200, story.numeral, { 'font-family': FONT, 'font-size': 36, 'font-weight': 900, fill: story.color, 'text-anchor': 'middle' });
  } else {
    s += `<g transform="translate(${x + 358},${y + 30})">${frag}</g>`;
  }
  return s;
}

function globe() {
  const cx = 800, cy = 352, r = 160;
  let s = '';
  // glow
  s += `<circle cx="${cx}" cy="${cy}" r="182" fill="${C.cyan}" fill-opacity="0.05"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="170" fill="${C.cyan}" fill-opacity="0.04"/>`;
  // sphere
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#globeGrad)" stroke="${C.cyan}" stroke-opacity="0.35" stroke-width="1.5"/>`;
  // land blobs + lat/long, clipped to the sphere
  s += `<g clip-path="url(#globeClip)"><g transform="rotate(-18 ${cx} ${cy})">`;
  s += `<ellipse cx="730" cy="300" rx="62" ry="34" fill="${C.ink2}" transform="rotate(-12 730 300)"/>`;
  s += `<ellipse cx="880" cy="400" rx="70" ry="30" fill="${C.ink2}" transform="rotate(8 880 400)"/>`;
  s += `<ellipse cx="790" cy="450" rx="46" ry="20" fill="${C.ink2}" transform="rotate(-6 790 450)"/>`;
  s += `<ellipse cx="860" cy="270" rx="34" ry="18" fill="${C.ink2}" transform="rotate(14 860 270)"/>`;
  // latitude lines
  s += `<ellipse cx="${cx}" cy="${cy - 72}" rx="139" ry="39" fill="none" stroke="${C.cyan}" stroke-opacity="0.4" stroke-width="1.2"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="160" ry="45" fill="none" stroke="${C.cyan}" stroke-opacity="0.5" stroke-width="1.2"/>`;
  s += `<ellipse cx="${cx}" cy="${cy + 72}" rx="139" ry="39" fill="none" stroke="${C.cyan}" stroke-opacity="0.4" stroke-width="1.2"/>`;
  // longitude lines
  s += `<line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="${C.cyan}" stroke-opacity="0.45" stroke-width="1.2"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="80" ry="160" fill="none" stroke="${C.cyan}" stroke-opacity="0.4" stroke-width="1.2"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="139" ry="160" fill="none" stroke="${C.cyan}" stroke-opacity="0.4" stroke-width="1.2"/>`;
  s += `</g>`;
  // highlight arc (upper-left light)
  s += `<path d="M ${cx - 118} ${cy - 62} A ${r} ${r} 0 0 1 ${cx - 20} ${cy - 152}" fill="none" stroke="${C.ivory}" stroke-opacity="0.3" stroke-width="3" stroke-linecap="round"/>`;
  s += `</g>`;
  // story dots on the globe (one per story)
  const dots = [
    [700, 300, C.cyan], [800, 236, C.amber], [906, 296, C.coral],
    [696, 408, C.amber], [800, 448, C.cyan], [908, 404, C.coral],
  ];
  for (const [dx, dy, dc] of dots) {
    s += `<circle cx="${dx}" cy="${dy}" r="6" fill="${dc}"/>`;
    s += `<circle cx="${dx}" cy="${dy}" r="10" fill="none" stroke="${dc}" stroke-opacity="0.6" stroke-width="1.2"/>`;
  }
  // summit marker (hero: three figures around a round table) on the globe's crown
  s += `<g>`;
  s += `<ellipse cx="${cx}" cy="272" rx="42" ry="7" fill="${C.amber}"/>`;
  s += `<ellipse cx="${cx}" cy="270" rx="42" ry="7" fill="${C.amber}" fill-opacity="0.25"/>`;
  for (const [hx, hy] of [[762, 248], [800, 240], [838, 248]]) {
    s += `<circle cx="${hx}" cy="${hy}" r="8" fill="${C.navy}" stroke="${C.ivory}" stroke-opacity="0.9" stroke-width="1.4"/>`;
    s += `<path d="M ${hx - 12} ${hy + 24} Q ${hx} ${hy + 6} ${hx + 12} ${hy + 24}" fill="none" stroke="${C.ivory}" stroke-opacity="0.9" stroke-width="1.4"/>`;
  }
  s += `</g>`;
  return s;
}

function connectors() {
  // Fine connector paths from the globe's lower edge to the three top-row cards.
  const pts = [
    { from: [686, 468], to: [280, 580] },
    { from: [800, 512], to: [800, 580] },
    { from: [914, 468], to: [1320, 580] },
  ];
  let s = '';
  for (const { from, to } of pts) {
    const [fx, fy] = from, [tx, ty] = to;
    const mx = (fx + tx) / 2, my = Math.max(fy, ty) - 8;
    s += `<path d="M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}" fill="none" stroke="${C.steel}" stroke-opacity="0.5" stroke-width="1.4"/>`;
    s += `<circle cx="${tx}" cy="${ty}" r="4" fill="${C.steel}"/>`;
  }
  return s;
}

function masthead() {
  let s = '';
  // top accent bar: coral / amber / cyan
  s += `<rect x="0" y="0" width="534" height="6" fill="${C.coral}"/>`;
  s += `<rect x="534" y="0" width="532" height="6" fill="${C.amber}"/>`;
  s += `<rect x="1066" y="0" width="534" height="6" fill="${C.cyan}"/>`;
  s += text(60, 52, 'THE WORLD', { 'font-family': FONT, 'font-size': 22, 'font-weight': 700, 'letter-spacing': 6, fill: C.ivory });
  s += text(1540, 52, '19 NOVEMBER 2026', { 'font-family': FONT, 'font-size': 22, 'font-weight': 700, 'letter-spacing': 4, fill: C.steel, 'text-anchor': 'end' });
  s += text(800, 106, 'A WORLD ON THE EDGE', { 'font-family': FONT_COND, 'font-size': 72, 'font-weight': 900, 'letter-spacing': 2, fill: C.ivory, 'text-anchor': 'middle' });
  s += text(800, 138, 'Power, conflict, justice, art and technology in one consequential day.', { 'font-family': FONT, 'font-size': 20, fill: C.steel, 'text-anchor': 'middle' });
  return s;
}

function footer() {
  let s = '';
  // legend: coloured dot + word per category, centred
  const words = LEGEND.map((w) => ({ w, c: LEGEND_COLORS[w] }));
  const label = words.map(({ w }) => w).join('  ·  ');
  // measure-free centring: build as one text with coloured tspans
  let lx = 800;
  const tspans = words.map(({ w, c }, i) => {
    const sep = i === 0 ? '' : '  ·  ';
    return `<tspan fill="${C.steel}">${esc(sep)}</tspan><tspan fill="${c}">●</tspan><tspan fill="${C.ivory}"> ${esc(w)}</tspan>`;
  }).join('');
  s += `<text x="${lx}" y="1088" font-family="${FONT}" font-size="15" font-weight="700" letter-spacing="2" text-anchor="middle">${tspans}</text>`;
  s += text(800, 1138, 'SIX STORIES. ONE WORLD. 19 NOV 2026.', { 'font-family': FONT, 'font-size': 28, 'font-weight': 800, 'letter-spacing': 3, fill: C.ivory, 'text-anchor': 'middle' });
  s += text(800, 1172, 'Sources: BBC News · The New York Times · The Hindu', { 'font-family': FONT, 'font-size': 13, fill: C.steel, 'text-anchor': 'middle' });
  return s;
}

function buildSvg() {
  const order = [STORIES[0], STORIES[1], STORIES[2], STORIES[3], STORIES[4], STORIES[5]];
  const grid = [
    [order[0], order[1], order[2]],
    [order[3], order[4], order[5]],
  ];
  let cards = '';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) cards += storyCard(grid[r][c], c, r);

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n` +
`<defs>\n` +
`  <radialGradient id="globeGrad" cx="35%" cy="30%" r="80%">\n` +
`    <stop offset="0%" stop-color="#2A5A78"/>\n` +
`    <stop offset="55%" stop-color="#16324A"/>\n` +
`    <stop offset="100%" stop-color="#0A1B2E"/>\n` +
`  </radialGradient>\n` +
`  <radialGradient id="vignette" cx="50%" cy="42%" r="75%">\n` +
`    <stop offset="60%" stop-color="#081525" stop-opacity="0"/>\n` +
`    <stop offset="100%" stop-color="#040B14" stop-opacity="0.55"/>\n` +
`  </radialGradient>\n` +
`  <clipPath id="globeClip"><circle cx="800" cy="352" r="160"/></clipPath>\n` +
`  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">\n` +
`    <circle cx="2" cy="2" r="1" fill="${C.ivory}" fill-opacity="0.05"/>\n` +
`  </pattern>\n` +
`</defs>\n` +
`<rect width="${W}" height="${H}" fill="${C.navy}"/>\n` +
`<rect width="${W}" height="${H}" fill="url(#dots)"/>\n` +
masthead() + '\n' +
globe() + '\n' +
connectors() + '\n' +
cards + '\n' +
`<rect width="${W}" height="${H}" fill="url(#vignette)"/>\n` +
footer() + '\n' +
`</svg>\n`;
}

// --- validation ------------------------------------------------------------
function validate(svg) {
  const problems = [];
  if (!svg.includes(`width="${W}"`) || !svg.includes(`height="${H}"`)) problems.push('SVG is not 1600x1200');
  for (const st of STORIES) {
    if (!svg.includes(esc(st.headline))) problems.push(`missing headline: ${st.headline}`);
    for (const ln of wrap(st.body, 36)) {
      if (!svg.includes(esc(ln))) problems.push(`missing body line: ${ln}`);
    }
    if (!svg.includes(esc(st.tag))) problems.push(`missing tag: ${st.tag}`);
    if (st.numeral && !svg.includes(esc(st.numeral))) problems.push(`missing numeral: ${st.numeral}`);
  }
  // The xmlns namespace identifier is not an external request; strip it first.
  const noNs = svg.replace('xmlns="http://www.w3.org/2000/svg"', '');
  if (/https?:\/\//.test(noNs)) problems.push('external URL found');
  if (/url\(/.test(svg.replace(/url\(#/g, ''))) problems.push('external url() reference found');
  if (/@import|@font-face|href=/.test(svg)) problems.push('external font/link reference found');
  if (!svg.includes('SIX STORIES. ONE WORLD. 19 NOV 2026.')) problems.push('missing footer');
  if (!svg.includes('19 NOVEMBER 2026')) problems.push('missing date');
  return problems;
}

// --- main ------------------------------------------------------------------
const svg = buildSvg();
const problems = validate(svg);
if (problems.length) {
  console.error('VALIDATION FAILED:');
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(SVG_PATH, svg, 'utf8');
const hash = sha256(svg);
console.log(`wrote ${SVG_PATH} (${svg.length} bytes, sha256 ${hash})`);
console.log(`PNG target: ${PNG_W}x${PNG_H} (gate: <=1024x1024, <=1 MiB)`);

if (process.argv.includes('--check')) {
  const svg2 = buildSvg();
  const hash2 = sha256(svg2);
  if (hash !== hash2) {
    console.error(`DETERMINISM FAILED: ${hash} != ${hash2}`);
    process.exit(1);
  }
  console.log(`deterministic OK: two renders match (sha256 ${hash})`);
}
