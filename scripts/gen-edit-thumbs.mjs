/**
 * Generates representative thumbnail images (SVG) for the Synthesis edit
 * suggestions grid. On-brand (stamp palette), CSP-safe, no external deps.
 * Swap any file for a real photograph at the same path to override.
 */
import fs from 'fs';
import path from 'path';

const OUT = path.resolve('public/assets/edit-suggestions');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  choc: '#2E2018', gold: '#C6A15B', taupe: '#9B8574',
  cream: '#F4EEE4', terra: '#B5674A', ink: '#181109', bone: '#EDE4D6',
};
const S = 480;
const wrap = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img">` +
  `<defs>${defs}</defs>${body}</svg>\n`;
const rect = (fill) => `<rect width="${S}" height="${S}" fill="${fill}"/>`;

const thumbs = {
  'enhance-detail': wrap(
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cream}"/><stop offset="1" stop-color="${C.bone}"/></linearGradient>`,
    rect('url(#g)') +
    Array.from({ length: 16 }, (_, i) => `<circle cx="240" cy="240" r="${18 + i * 14}" fill="none" stroke="${C.choc}" stroke-opacity="${0.5 - i * 0.025}" stroke-width="1"/>`).join('') +
    `<line x1="0" y1="240" x2="480" y2="240" stroke="${C.gold}" stroke-width="1.5"/><line x1="240" y1="0" x2="240" y2="480" stroke="${C.gold}" stroke-width="1.5"/>`
  ),
  'warm-palette': wrap(
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.gold}"/><stop offset="0.55" stop-color="${C.terra}"/><stop offset="1" stop-color="${C.choc}"/></linearGradient>`,
    rect('url(#g)')
  ),
  'golden-hour': wrap(
    `<radialGradient id="g" cx="0.5" cy="0.15" r="0.95"><stop offset="0" stop-color="#F6DFA6"/><stop offset="0.45" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.terra}"/></radialGradient>`,
    rect('url(#g)') + `<circle cx="240" cy="70" r="52" fill="#FBEEC6" fill-opacity="0.85"/>`
  ),
  'high-contrast': wrap(
    ``,
    rect(C.cream) +
    `<path d="M0 0 L480 0 L480 300 L0 480 Z" fill="${C.ink}"/>` +
    `<rect x="60" y="60" width="150" height="150" fill="${C.cream}"/>` +
    `<rect x="270" y="300" width="150" height="120" fill="${C.ink}"/>`
  ),
  'gilded-accents': wrap(
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D9B978"/><stop offset="0.5" stop-color="${C.gold}"/><stop offset="1" stop-color="#8A6B2E"/></linearGradient>`,
    rect(C.ink) +
    Array.from({ length: 22 }, (_, i) => {
      const x = (i * 97) % 460 + 10, y = (i * 173) % 460 + 10, r = 3 + (i % 4) * 3;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g)" fill-opacity="${0.5 + (i % 3) * 0.2}"/>`;
    }).join('') +
    `<path d="M40 420 Q240 360 440 430" stroke="url(#g)" stroke-width="2" fill="none" stroke-opacity="0.7"/>`
  ),
  'soft-focus': wrap(
    `<radialGradient id="g" cx="0.4" cy="0.4" r="0.8"><stop offset="0" stop-color="${C.cream}"/><stop offset="1" stop-color="${C.taupe}"/></radialGradient><filter id="b"><feGaussianBlur stdDeviation="26"/></filter>`,
    rect('url(#g)') +
    `<g filter="url(#b)"><circle cx="180" cy="180" r="90" fill="#F6DFA6" fill-opacity="0.8"/><circle cx="330" cy="320" r="120" fill="${C.terra}" fill-opacity="0.35"/></g>`
  ),
  'layered-depth': wrap(
    `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bone}"/><stop offset="1" stop-color="${C.taupe}"/></linearGradient>`,
    rect('url(#g)') +
    `<rect x="30" y="120" width="420" height="340" rx="10" fill="${C.choc}" fill-opacity="0.18"/>` +
    `<rect x="80" y="180" width="320" height="300" rx="10" fill="${C.choc}" fill-opacity="0.32"/>` +
    `<rect x="140" y="250" width="200" height="230" rx="10" fill="${C.choc}" fill-opacity="0.6"/>`
  ),
  'editorial-crop': wrap(
    ``,
    rect(C.cream) +
    `<rect x="120" y="90" width="300" height="300" fill="${C.taupe}" fill-opacity="0.25"/>` +
    // crop corner marks
    `<g stroke="${C.choc}" stroke-width="3" fill="none">` +
    `<path d="M120 130 L120 90 L160 90"/><path d="M420 90 L420 130"/>` +
    `<path d="M120 350 L120 390 L160 390"/><path d="M380 390 L420 390 L420 350"/></g>` +
    `<line x1="0" y1="430" x2="480" y2="430" stroke="${C.gold}" stroke-width="6"/>`
  ),
  'film-grain': wrap(
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.taupe}"/><stop offset="1" stop-color="${C.choc}"/></linearGradient>` +
    `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`,
    rect('url(#g)') +
    `<rect width="${S}" height="${S}" filter="url(#n)" opacity="0.22"/>` +
    `<rect width="${S}" height="${S}" fill="${C.cream}" opacity="0.04"/>`
  ),
};

for (const [id, svg] of Object.entries(thumbs)) {
  fs.writeFileSync(path.join(OUT, `${id}.svg`), svg);
}
console.log(`wrote ${Object.keys(thumbs).length} thumbnails to ${OUT}`);
