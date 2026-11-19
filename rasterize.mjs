// news-image-20261119 — rasterise the SVG to the gate-compliant PNG.
//   node rasterize.mjs          -> dist/news-image-20261119.png (1024x768)
//   node rasterize.mjs --check  -> renders twice, compares SHA-256
// Uses the local headless Chromium (standalone build in the workspace, with
// system chromium as fallback). No network. The SVG is embedded inline in a
// local HTML wrapper and screenshotted at exactly 1024x768.

import { readFileSync, writeFileSync, existsSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVG_PATH = join(__dirname, 'dist', 'news-image-20261119.svg');
const HTML_PATH = join(__dirname, 'dist', 'shot.html');
const PNG_PATH = join(__dirname, 'dist', 'news-image-20261119.png');
const PNG_W = 1024, PNG_H = 768, MAX_BYTES = 1048576;

const CHROMIUM_CANDIDATES = [
  join(process.env.HOME || '', 'workspace', 'tools', 'chromium', 'chrome-linux', 'chrome'),
  'chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable',
];

function findChromium() {
  for (const c of CHROMIUM_CANDIDATES) {
    try {
      execFileSync(c, ['--version'], { stdio: 'ignore' });
      return c;
    } catch { /* try next */ }
  }
  throw new Error('no Chromium found (tried: ' + CHROMIUM_CANDIDATES.join(', ') + ')');
}

function sha256File(p) {
  return createHash('sha256').update(readFileSync(p)).digest('hex');
}

// PNG dimensions from the IHDR chunk (bytes 16-24, big-endian). No dependency.
function pngDims(p) {
  const fd = openSync(p, 'r');
  const buf = Buffer.alloc(24);
  readSync(fd, buf, 0, 24, 0);
  closeSync(fd);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function renderOnce() {
  const svg = readFileSync(SVG_PATH, 'utf8').replace(/<\?xml[^?]*\?>\n?/, '');
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
    + 'html,body{margin:0;padding:0;background:#081525;overflow:hidden}'
    + 'svg{display:block;width:1024px;height:768px}</style></head><body>'
    + svg + '</body></html>';
  writeFileSync(HTML_PATH, html, 'utf8');
  const chrome = findChromium();
  execFileSync(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    `--screenshot=${PNG_PATH}`, `--window-size=${PNG_W},${PNG_H}`,
    '--hide-scrollbars', `file://${HTML_PATH}`,
  ], { stdio: 'pipe' });
  if (!existsSync(PNG_PATH)) throw new Error('Chromium wrote no PNG');
  return statSync(PNG_PATH);
}

const size = renderOnce();
const dims = pngDims(PNG_PATH);
if (dims.w !== PNG_W || dims.h !== PNG_H) {
  throw new Error(`PNG is ${dims.w}x${dims.h}, expected ${PNG_W}x${PNG_H}`);
}
if (size.size > MAX_BYTES) {
  throw new Error(`PNG is ${size.size} bytes, over the 1 MiB gate`);
}
const hash = sha256File(PNG_PATH);
console.log(`wrote ${PNG_PATH} (${dims.w}x${dims.h}, ${size.size} bytes, sha256 ${hash})`);

if (process.argv.includes('--check')) {
  renderOnce();
  const hash2 = sha256File(PNG_PATH);
  if (hash !== hash2) throw new Error(`PNG not deterministic: ${hash} != ${hash2}`);
  console.log(`deterministic OK: two rasterisations match (sha256 ${hash})`);
}
