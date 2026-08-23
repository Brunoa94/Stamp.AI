# T-Shirt Design Generator

3 sample designs across 3 categories, generated with Gemini in one command.

## Run it

```bash
npm init -y && npm pkg set type=module
npm i @google/genai
export GEMINI_API_KEY=...        # aistudio.google.com/apikey

node generate.js --dry           # writes every prompt to disk, spends nothing
node generate.js                 # generate everything  (~$0.20, ~1 min)
node generate.js --size 2K       # bigger resolution
node generate.js --size 4K       # biggest, more expensive
```

Output lands in `out/<category>/<label>.png`, with the exact prompt saved beside each image as `.txt`. Existing files are skipped, so you can re-run to fill gaps or kill it halfway without losing work.

**Start with `--dry`.** It costs nothing and shows you every assembled prompt. Read a few before spending anything.

## The catalogue

| Category | id | n | Notes |
|---|---|---|---|
| Pets in costume | `pets` | 1 | Astronaut corgi |
| Food obsessions | `food` | 1 | Ramen bowl |
| Plants and nature | `nature` | 1 | Monstera leaf |

## How a prompt is built

`prompts.js` holds the catalogue as data. Each variant contributes a short body; the runner appends the shared blocks:

```
variant body          "An illustrated portrait of a corgi in an astronaut suit…"
+ style               "Style: bold flat vector illustration, thick outlines…"
+ category extra      "The animal is the hero of the composition…"
+ BLOCKS.candid       (group scenes only)
+ BLOCKS.print        printability constraints — the important one
+ BLOCKS.ip           no trademarked characters or brands
```

`BLOCKS.print` is where most of the quality comes from. It pins down flat white background, hard edges, ≤6 distinguishable colours, no gradients or shadows, minimum stroke weight, and legibility at three metres. Edit it once and all 71 designs change.

There is no `negativePrompt` field in this API, which is why every constraint is phrased as a positive statement rather than a "no X" list. Google's own guidance calls these semantic negatives.

## Two things the code does deliberately

**Text is resolved before generation.** For the `logos` category, a text-model call invents the brand name, tagline and motif as JSON first; only then is the image prompt built. Gemini renders text far more reliably when the string is handed to it than when it has to invent and render simultaneously. Same principle applies to every `text: true` category — the exact strings are in `prompts.js`, not left to the model.

**Prompts are saved next to the images.** When something comes out well you'll want to know exactly what produced it, and when you edit `BLOCKS.print` you'll want to diff. The `.txt` beside each `.png` is the whole audit trail.

## Costs

Google's published rates, per image:

| Model | 1K | 2K | 4K |
|---|---|---|---|
| `gemini-3.1-flash-image` (default) | $0.067 | $0.11 | $0.151 |
| `gemini-3-pro-image` | $0.134 | $0.134 | $0.24 |
| `gemini-3.1-flash-lite-image` | $0.034 | — | — |

Full run at 1K (default) is about **$0.20**. There's no free tier on image generation, so `--dry` first is worth the thirty seconds.

## Tweaking

- **New design:** add an entry to a category's `variants` array. `label` becomes the filename.
- **New category:** add an object to `CATEGORIES` with `id`, `aspect` and `variants`.
- **Different look overall:** edit `STYLES` at the top of `prompts.js` — every variant references those by name.
- **Different print rules:** edit `BLOCKS.print`.
- **More per idea:** run twice with different `--size`, or duplicate a variant with a different `style`.

## Model note

`gemini-3.1-flash-image` is current as of August 2026. Imagen was shut down on 17 August 2026 and `gemini-2.5-flash-image` goes in October — ignore any tutorial using `generateImages` or `generate_content` for images; the current path is the Interactions API (`ai.interactions.create`). Model IDs live in one place at the top of `generate.js` for exactly this reason.
