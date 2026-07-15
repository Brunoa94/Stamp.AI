# Suggested-edit thumbnails

The Synthesis step renders a Gemini-style grid of 15 style suggestions
(`src/features/stamp/lib/constants/stampProducts.ts` → `STAMP_EDIT_SUGGESTIONS`).
Each tile expects a photographic thumbnail at `<id>.png` in this folder.

- Subject: a **single person portrait** rendered in that style.
- Framing: **vertical 4:5 portrait**, full-bleed, no text/watermark/border.
- Save each as `<id>.png` (`.jpg` works too — update the `image` paths in the
  constants file to match).

You can generate them with `scripts/gen-edit-photos.mjs` (uses the project's
Gemini image model, so it bills the `GOOGLE_GEMINI_API_KEY` account), or paste
the prompts below into any image generator.

## Prompts (one per file)

Each prompt already includes the shared framing constraints.

| File | Prompt |
|------|--------|
| `vibrant.png` | A vivid high-saturation studio portrait, punchy bold colors. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `monochrome.png` | A dramatic black-and-white portrait, rich tonal range. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `vintage.png` | A 1970s vintage film portrait, faded warm retro tones. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `minimal.png` | A minimalist studio portrait, clean negative space, muted palette. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `watercolor.png` | A soft watercolor painting portrait, flowing pigments, paper texture. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `line-art.png` | A clean black ink line-art portrait illustration on white. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `pop-art.png` | A bold pop-art portrait, halftone dots, bright primary colors. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `cinematic.png` | A cinematic film-still portrait, teal-and-orange grade, shallow depth of field. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `neon.png` | A neon cyberpunk portrait, glowing pink and cyan lights, night bokeh. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `golden-hour.png` | A golden-hour portrait, warm sun flare, soft directional light. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `high-contrast.png` | A high-contrast chiaroscuro portrait, deep shadows, bright highlights. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `film-grain.png` | A grainy 35mm film portrait, analog texture, muted colors. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `oil-paint.png` | An oil-painting portrait, thick visible brushstrokes, classical style. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `render-3d.png` | A glossy 3D-rendered stylized character portrait, soft studio lighting. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
| `sketch.png` | A detailed graphite pencil sketch portrait, hand-drawn cross-hatching on paper. Full-bleed photographic thumbnail, vertical 4:5 portrait framing, a single subject centered, no text, no watermark, no border. |
