/**
 * Generates real photographic thumbnails for the 15 Synthesis edit suggestions
 * using the app's Gemini image model (gemini-2.5-flash-image). Saves PNGs to
 * public/assets/edit-suggestions/<id>.png. Run: node scripts/gen-edit-photos.mjs
 */
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OUT = path.resolve('public/assets/edit-suggestions');
fs.mkdirSync(OUT, { recursive: true });

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY missing');
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

const SUFFIX =
  ' Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single ' +
  'person or subject centered, no text, no watermark, no border.';

// The 15 "main" style edits shown in the Synthesis suggestion grid.
const ITEMS = [
  ['vibrant', 'A vivid high-saturation studio portrait, punchy bold colors.'],
  ['monochrome', 'A dramatic black-and-white portrait, rich tonal range.'],
  ['vintage', 'A 1970s vintage film portrait, faded warm retro tones.'],
  ['minimal', 'A minimalist studio portrait, clean negative space, muted palette.'],
  ['watercolor', 'A soft watercolor painting portrait, flowing pigments, paper texture.'],
  ['line-art', 'A clean black ink line-art portrait illustration on white.'],
  ['pop-art', 'A bold pop-art portrait, halftone dots, bright primary colors.'],
  ['cinematic', 'A cinematic film-still portrait, teal-and-orange grade, shallow depth of field.'],
  ['neon', 'A neon cyberpunk portrait, glowing pink and cyan lights, night bokeh.'],
  ['golden-hour', 'A golden-hour portrait, warm sun flare, soft directional light.'],
  ['high-contrast', 'A high-contrast chiaroscuro portrait, deep shadows, bright highlights.'],
  ['film-grain', 'A grainy 35mm film portrait, analog texture, muted colors.'],
  ['oil-paint', 'An oil-painting portrait, thick visible brushstrokes, classical style.'],
  ['render-3d', 'A glossy 3D-rendered stylized character portrait, soft studio lighting.'],
  ['sketch', 'A detailed graphite pencil sketch portrait, hand-drawn cross-hatching on paper.'],
];

async function one(id, desc, attempt = 1) {
  try {
    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: desc + SUFFIX }] }],
      generationConfig: { responseModalities: ['image', 'text'] },
    });
    const parts = res.response.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData)?.inlineData;
    if (!img?.data) throw new Error('no image part');
    const ext = (img.mimeType || 'image/png').includes('jpeg') ? 'jpg' : 'png';
    const file = path.join(OUT, `${id}.${ext}`);
    fs.writeFileSync(file, Buffer.from(img.data, 'base64'));
    console.log(`OK   ${id}.${ext} (${Math.round(Buffer.from(img.data, 'base64').length / 1024)}kb)`);
    return `${id}.${ext}`;
  } catch (e) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 2500 * attempt));
      return one(id, desc, attempt + 1);
    }
    console.log(`FAIL ${id}: ${e.message}`);
    return null;
  }
}

const out = {};
for (const [id, desc] of ITEMS) {
  out[id] = await one(id, desc);
  await new Promise((r) => setTimeout(r, 800));
}
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(out, null, 2));
console.log('\nDONE', JSON.stringify(out));
