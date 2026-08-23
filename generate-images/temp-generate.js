import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';

const ai = new GoogleGenAI({});

const images = [
  {
    name: 'luxury-fashion-house',
    folder: 'brands',
    prompt: `An elegant luxury fashion brand logo featuring the name "MAISON AURÈLE" in refined serif typography with gold foil texture. Delicate intertwined monogram "MA" above the text, surrounded by subtle laurel leaves. Sophisticated black and gold color palette with subtle embossed effect. High-end Parisian fashion house aesthetic, timeless elegance and exclusivity.

Style: intricate Victorian engraving, fine crosshatching, detailed stippling, classical illustration style.

This artwork will be printed onto a t-shirt.
Single centred subject on a clean white background with clear margins.
The design should be visually striking and detailed.
No signature, no watermark.

All designs, emblems, costumes, logos and typography are entirely original
inventions. Do not reproduce or imitate any existing trademarked character,
brand, sports club, film, game or franchise.`
  },
  {
    name: 'stamp-ai-premium',
    folder: 'brands',
    prompt: `A sophisticated premium brand logo for "Stamp.AI" - an AI-powered custom merchandise platform. The word "Stamp" in elegant modern serif typography with "AI" subtly highlighted in a refined accent. A minimalist abstract stamp/seal icon integrated into the design, with subtle circuit patterns suggesting AI technology. Premium color palette of deep charcoal and metallic gold accents. Clean, modern luxury tech aesthetic that conveys creativity, quality, and innovation.

Style: vibrant digital illustration with rich gradients, detailed shading, dynamic lighting, polished and professional look.

This artwork will be printed onto a t-shirt.
Single centred subject on a clean white background with clear margins.
The design should be visually striking and detailed.
No signature, no watermark.

All designs, emblems, costumes, logos and typography are entirely original
inventions. Do not reproduce or imitate any existing trademarked character,
brand, sports club, film, game or franchise.`
  },
  {
    name: 'quote-casablanca',
    folder: 'quotes',
    prompt: `Elegant typographic design featuring the quote "Here's looking at you, kid" in sophisticated 1940s art deco lettering. The text arranged in a classic Hollywood golden age composition with subtle film noir shadows. Vintage cinema aesthetic with warm sepia and cream tones, evoking romance and timeless charm.

Style: elegant fine line art with delicate cross-hatching, detailed textures, artistic pen and ink illustration.

This artwork will be printed onto a t-shirt.
Single centred subject on a clean white background with clear margins.
The design should be visually striking and detailed.
No signature, no watermark, and no text of any kind beyond the quote specified above.

All designs, emblems, costumes, logos and typography are entirely original
inventions. Do not reproduce or imitate any existing trademarked character,
brand, sports club, film, game or franchise.`
  },
  {
    name: 'quote-starwars',
    folder: 'quotes',
    prompt: `Bold typographic design featuring the quote "May the Force be with you" in powerful futuristic lettering with cosmic energy radiating outward. Stars and nebula swirls integrated subtly into the composition. Deep space blues and purples with glowing highlights, epic sci-fi adventure aesthetic evoking hope and heroism.

Style: vibrant digital illustration with rich gradients, detailed shading, dynamic lighting, polished and professional look.

This artwork will be printed onto a t-shirt.
Single centred subject on a clean white background with clear margins.
The design should be visually striking and detailed.
No signature, no watermark, and no text of any kind beyond the quote specified above.

All designs, emblems, costumes, logos and typography are entirely original
inventions. Do not reproduce or imitate any existing trademarked character,
brand, sports club, film, game or franchise.`
  }
];

console.log(`\nGenerating ${images.length} images...\n`);

for (const img of images) {
  const started = Date.now();
  console.log(`⏳ Generating ${img.name}...`);

  try {
    const res = await ai.interactions.create({
      model: 'gemini-3.1-flash-image',
      input: img.prompt,
      response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '1:1', image_size: '1K' },
    });

    if (!res.output_image) throw new Error('No image returned');

    fs.mkdirSync(`out/${img.folder}`, { recursive: true });
    fs.writeFileSync(`out/${img.folder}/${img.name}.jpg`, Buffer.from(res.output_image.data, 'base64'));
    fs.writeFileSync(`out/${img.folder}/${img.name}.txt`, img.prompt);

    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`✓ ${img.name} saved (${secs}s) - $0.067\n`);
  } catch (err) {
    console.log(`✗ ${img.name} failed: ${err.message}\n`);
  }
}

console.log('Done! Total cost: $0.27');
