// Prompt catalogue. Every entry becomes one generated image.
// Shared blocks are appended by the runner — don't repeat them here.

export const BLOCKS = {
  print: `
This artwork will be printed onto a t-shirt.
Single centred subject on a clean white background with clear margins.
The design should be visually striking and detailed.
No signature, no watermark, and no text of any kind beyond what is explicitly
specified above.`,

  logo: `
Clean logo design on a pure white background.
The design should be visually striking, professional, and versatile.
No signature, no watermark.`,

  ip: `
All designs, emblems, costumes, logos and typography are entirely original
inventions. Do not reproduce or imitate any existing trademarked character,
brand, sports club, film, game or franchise.`,

  likeness: `
This depicts a specific individual from the provided photograph, not a generic
lookalike. Preserve face shape, eye shape and colour, nose, mouth, jawline,
skin tone, hairline and hairstyle, facial hair, glasses and any distinguishing
marks. Someone who knows them must recognise them immediately.
Do not idealise, slim, smooth or beautify.`,

  candid: `
This is a candid moment, not a posed shoot. Expressions are unguarded and
mid-motion. Postures are asymmetric and relaxed. Nobody is looking at the
camera with a neutral smile. Clothing is ordinary and lived-in.`,
};

// Reusable style vocabulary. Referenced by name from variants below.
export const STYLES = {
  vector:    "vibrant digital illustration with rich gradients, detailed shading, dynamic lighting, polished and professional look",
  line:      "elegant fine line art with delicate cross-hatching, detailed textures, artistic pen and ink illustration",
  screen70s: "psychedelic 1970s poster art, vibrant saturated colours, retro gradients, groovy flowing shapes",
  linocut:   "dramatic high-contrast linocut print, bold carved textures, striking black and white with rich colour accents",
  gouache:   "lush gouache painting with visible brushstrokes, rich layered colours, warm atmospheric lighting",
  woodblock: "traditional Japanese ukiyo-e woodblock print, intricate details, elegant colour gradations, delicate linework",
  plate:     "detailed Victorian botanical illustration, precise scientific rendering, subtle watercolour washes, naturalistic shading",
  badge:     "vintage embroidered patch aesthetic, textured stitching details, worn authentic look",
  athletic:  "bold varsity typography with dimensional lettering, fabric texture, classic sportswear aesthetic",
  engraved:  "intricate Victorian engraving, fine crosshatching, detailed stippling, classical illustration style",
};

const S = STYLES;

export const CATEGORIES = [

  // ─── 1. Family portraits ────────────────────────────────────────────────
  {
    id: "families",
    name: "Family portraits",
    aspect: "4:5",
    extra: `Warm, loving family moments. Natural poses, genuine emotions, timeless quality.`,
    variants: [
      { label: "two-parents-two-kids", style: S.line,
        prompt: `A warm illustrated family portrait: two parents and two young children standing close together, relaxed poses, genuine smiles. Soft lighting, cozy atmosphere, capturing love and connection.` },
      { label: "siblings-bond", style: S.gouache,
        prompt: `Two siblings of different ages sharing a moment together, the older one with arm around the younger. Playful yet tender, natural expressions, warm family feeling.` },
      { label: "family-with-dog", style: S.vector,
        prompt: `A happy family portrait with parents, two kids, and their beloved dog sitting in front. Everyone looking at the viewer with joy, the dog with tongue out. Heartwarming composition.` },
    ],
  },

  // ─── 2. Friend group moments ────────────────────────────────────────────
  {
    id: "friends",
    name: "Friend group moments",
    aspect: "4:5",
    candid: true,
    extra: `Authentic friendship moments. Laughter, connection, memories being made.`,
    variants: [
      { label: "house-party", style: S.screen70s,
        prompt: `A vibrant group of five friends crowded together mid-celebration, arms raised, drinks in hand, confetti falling. Pure joy and energy, friendship goals aesthetic.` },
      { label: "road-trip", style: S.vector,
        prompt: `Four friends sitting on the roof of a vintage car at a scenic overlook, sunset colors in the sky. Adventure, freedom, friendship. Nostalgic travel memories.` },
      { label: "reunion-selfie", style: S.line,
        prompt: `Six friends squeezed into a chaotic group selfie, some making faces, some laughing, authentic imperfect moment. Real friendship captured, candid and fun.` },
    ],
  },

  // ─── 3. Kids illustrations ──────────────────────────────────────────────
  {
    id: "kids",
    name: "Kids illustrations",
    aspect: "4:5",
    extra: `Charming, whimsical designs perfect for children. No cartoon mascots, just beautiful illustration.`,
    variants: [
      { label: "dinosaur-explorer", style: S.gouache,
        prompt: `A friendly long-necked dinosaur in a prehistoric jungle, looking curious and gentle. Lush vegetation, warm sunlight filtering through trees. Appealing to kids but artistically rendered.` },
      { label: "rocket-dreams", style: S.vector,
        prompt: `A child's bedroom at night with a toy rocket on the windowsill, stars and planets visible outside, magical dreamy atmosphere. Imagination and wonder.` },
      { label: "ocean-friends", style: S.woodblock,
        prompt: `Friendly sea creatures swimming together: a whale, dolphin, turtle, and colorful fish. Peaceful underwater scene, gentle flowing movement. Ocean wonder for kids.` },
    ],
  },

  // ─── 4. Amateur teams ───────────────────────────────────────────────────
  {
    id: "teams",
    name: "Amateur teams",
    aspect: "1:1",
    extra: `Team pride and identity. Bold crests, athletic styling, team spirit.`,
    variants: [
      { label: "soccer-crest", style: S.badge,
        prompt: `A classic soccer team crest with a ball, shield shape, laurel wreath accents. Bold team colors, professional sports aesthetic, pride and unity.` },
      { label: "running-club", style: S.line,
        prompt: `A minimalist running club emblem featuring a stylized runner in motion, continuous flowing lines. Speed, endurance, community spirit.` },
      { label: "basketball-squad", style: S.athletic,
        prompt: `A bold basketball team logo with a flaming basketball, dynamic angular shapes. Urban streetball aesthetic, energy and competition.` },
    ],
  },

  // ─── 5. Fictional gig posters ───────────────────────────────────────────
  {
    id: "music",
    name: "Fictional gig posters",
    aspect: "4:5",
    extra: `Concert poster aesthetic. Bold, artistic, rock and roll spirit.`,
    variants: [
      { label: "indie-festival", style: S.screen70s,
        prompt: `A psychedelic music festival poster with swirling patterns, a setting sun, silhouettes of a crowd with hands raised. Vintage concert aesthetic, peace and music vibes.` },
      { label: "jazz-club", style: S.linocut,
        prompt: `An intimate jazz club scene with a saxophone player silhouette, smoky atmosphere, art deco styling. Cool, sophisticated, late night music mood.` },
      { label: "punk-show", style: S.engraved,
        prompt: `A raw punk rock concert poster with a screaming figure at a microphone, explosive energy radiating outward. DIY aesthetic, rebellion and passion.` },
    ],
  },

  // ─── 8. Personal milestones ─────────────────────────────────────────────
  {
    id: "milestones",
    name: "Personal milestones",
    aspect: "4:5",
    extra: `Celebrating life achievements. Pride, accomplishment, personal victory.`,
    variants: [
      { label: "marathon-finisher", style: S.badge,
        prompt: `A marathon finisher medal design with a running figure, laurel wreath, distance marker. Achievement unlocked, endurance pride, runner's triumph.` },
      { label: "first-home", style: S.line,
        prompt: `A charming house illustration with a key, heart details, new homeowner celebration. Life milestone, dreams realized, new chapter beginning.` },
      { label: "new-parent", style: S.gouache,
        prompt: `Tiny baby footprints alongside larger parent footprints, soft pastel colors, tender emotional moment. New life celebration, parenthood journey beginning.` },
    ],
  },

  // ─── 9. Gym clothing logos ──────────────────────────────────────────────
  {
    id: "gym",
    name: "Gym clothing logos",
    aspect: "1:1",
    extra: `Bold, powerful, motivational. The logo should look professional and work well on athletic wear.`,
    variants: [
      { label: "beast-mode", style: S.vector,
        prompt: `A fierce roaring lion head logo for gym apparel. Powerful mane flowing like flames, intense determined eyes, sharp geometric styling. Modern athletic aesthetic with bold lines and dramatic shading.` },
      { label: "iron-warriors", style: S.badge,
        prompt: `A vintage-style gym logo featuring crossed barbells behind a shield. Strong industrial aesthetic with rivets and metal texture. Bold typography integrated into the design.` },
      { label: "lift-heavy", style: S.athletic,
        prompt: `A powerful gorilla silhouette mid-deadlift, muscles defined, raw strength on display. Minimalist but impactful design with strong contrast. Athletic wear aesthetic.` },
      { label: "no-excuses", style: S.linocut,
        prompt: `A clenched fist breaking through chains, symbolizing breaking limits. Dramatic lighting, bold graphic style. Motivational and powerful imagery for fitness apparel.` },
      { label: "spartan-fit", style: S.engraved,
        prompt: `A Spartan warrior helmet in profile, detailed with battle scratches and wear. Classical Greek styling with modern edge. Strong, disciplined, elite athlete aesthetic.` },
      { label: "wolf-pack", style: S.vector,
        prompt: `A fierce wolf head howling, geometric low-poly style with sharp angles. Pack mentality, team spirit. Bold blacks and grays with piercing eyes. Modern streetwear aesthetic.` },
      { label: "rise-grind", style: S.screen70s,
        prompt: `A phoenix rising from flames, wings spread wide. Rebirth and transformation symbolism. Warm fiery colors, dynamic upward movement. Motivational athletic brand feel.` },
    ],
  },

];
