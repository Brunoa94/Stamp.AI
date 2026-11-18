#!/usr/bin/env node
/**
 * Generate lifestyle backdrop photos with OpenAI
 *
 * Makes new photos in the spirit of backdrops/ on the static-assets CDN: a person
 * using one of the shop's printed products in a real place. Each image combines,
 * at random:
 *   - a product, with one of its mockups from products-images/ on the CDN
 *     (NEXT_PUBLIC_SUPABASE_URL's static-assets bucket) sent as the
 *     reference for the blank (cut, colour, material, proportions)
 *   - a new artwork printed on it (a different style and subject each time)
 *   - a model, a place, light and weather, a camera and a colour grade
 *
 * Products rotate so a batch covers every product before repeating one, and no
 * artwork, model or place repeats within a batch (until a pool runs out).
 * Output goes to images-generated/backdrops/, with a manifest.json holding
 * every prompt so a good image can be regenerated or tweaked.
 *
 * Usage:
 *   node scripts/generate-backdrops.mjs [options]
 *
 * Options:
 *   --count <n>          Number of images (default 5)
 *   --products <list>    Comma-separated subset: hoodie,kid-tshirt,mug,tote,canvas
 *   --concepts <list>    Run hand-written briefs instead of random ones:
 *                        sports-brand,morning-coffee,football-team,luxury-hoodie,luxury-tote,
 *                        gym-hoodie-back,streetwear-tee,photo-canvas,orders-unboxing,
 *                        profile-tote
 *   --seed <n>           Seed for the random picks; same seed, same prompts
 *   --model <id>         OpenAI image model (default gpt-image-2)
 *   --quality <q>        low | medium | high (default high)
 *   --size <WxH>         Override the per-product size (e.g. 1024x1536)
 *   --concurrency <n>    Parallel requests (default 3)
 *   --out <dir>          Output directory (default images-generated/backdrops)
 *   --dry-run            Print the prompts without calling the API
 *
 * Examples:
 *   node scripts/generate-backdrops.mjs --dry-run
 *   node scripts/generate-backdrops.mjs --count 5
 *   node scripts/generate-backdrops.mjs --count 3 --products mug,tote --seed 42
 *   node scripts/generate-backdrops.mjs --concepts luxury-hoodie,luxury-tote
 *
 * Environment variables required:
 *   - OPENAI_API_KEY
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import fs from 'fs';
import path from 'path';
import OpenAI, { toFile } from 'openai';

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    count: 5,
    products: null,
    concepts: null,
    seed: Date.now() % 2147483647,
    model: 'gpt-image-2',
    quality: 'high',
    size: null,
    concurrency: 3,
    out: 'images-generated/backdrops',
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--count') opts.count = Number(next());
    else if (arg === '--products') opts.products = next().split(',').map((p) => p.trim());
    else if (arg === '--concepts') opts.concepts = next().split(',').map((c) => c.trim());
    else if (arg === '--seed') opts.seed = Number(next());
    else if (arg === '--model') opts.model = next();
    else if (arg === '--quality') opts.quality = next();
    else if (arg === '--size') opts.size = next();
    else if (arg === '--concurrency') opts.concurrency = Number(next());
    else if (arg === '--out') opts.out = next();
    else if (arg === '--dry-run') opts.dryRun = true;
    else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }
  return opts;
}

// ─── Seeded randomness ───────────────────────────────────────────────────────

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Picks from a pool without repeating until every item has been used. */
function makeDeck(pool, rand) {
  let deck = [];
  return (filter = () => true) => {
    let candidates = deck.filter(filter);
    if (candidates.length === 0) {
      deck = shuffle(pool, rand);
      candidates = deck.filter(filter);
    }
    const pick = candidates[0];
    deck.splice(deck.indexOf(pick), 1);
    return pick;
  };
}

// ─── Products ────────────────────────────────────────────────────────────────

/** Product mockups on the static-assets CDN (pushed by scripts/push-static-assets.mjs) */
function productsBaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required to fetch the product mockups');
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/static-assets/products-images`;
}

const PRODUCTS = {
  hoodie: {
    name: 'white pullover hoodie',
    audience: 'adult',
    size: '1024x1536',
    references: ['hoodie/hoodie-c-mockup-front.png', 'hoodie/hoodie-a-mockup-front-2.png'],
    printArea: 'centred on the chest, about 25 cm wide',
    surface: 'follows the soft folds and cotton-fleece texture of the hoodie',
    isTop: true,
    usage: [
      'wearing the hoodie, hood down, sleeves pushed slightly up',
      'wearing the hoodie loose and oversized, one hand resting in the front pocket',
      'wearing the hoodie mid-stride, hands relaxed at the sides',
    ],
  },
  'kid-tshirt': {
    name: "white children's crew-neck T-shirt",
    audience: 'kid',
    size: '1024x1024',
    references: ['kid-t-shirt/kid-t-shirt-g-mockup-front.png', 'kid-t-shirt/kid-t-shirt-n-mockup-front.png'],
    printArea: 'centred on the chest, filling most of the front',
    surface: 'follows the light folds and cotton texture of the T-shirt',
    isTop: true,
    usage: [
      'wearing the T-shirt, absorbed in play, body turned toward the camera',
      'wearing the T-shirt, mid-laugh, crouching to look at something on the ground',
      'wearing the T-shirt, standing proudly with hands on hips',
    ],
  },
  mug: {
    name: 'white glossy 11 oz ceramic mug',
    audience: 'adult',
    size: '1024x1024',
    references: ['mug/mug-a-mockup-front.png', 'mug/mug-h-mockup-front.png'],
    printArea: 'wrapped around the side facing the camera',
    surface: 'wraps the curve of the mug under a glossy glaze with soft reflections',
    isTop: false,
    usage: [
      'holding the mug in both hands close to the chest, steam rising',
      'holding the mug by the handle mid-sip pause, print turned toward the camera',
      'resting the mug on a knee while looking out of frame',
    ],
  },
  tote: {
    name: 'natural white canvas tote bag with long handles',
    audience: 'adult',
    size: '1024x1536',
    references: ['tote/tote-g-mockup-front.png', 'tote/tote-m-mockup-front.png'],
    printArea: 'covering the centre of the front panel',
    surface: 'sits in the woven canvas texture and bends with the bag',
    isTop: false,
    usage: [
      'carrying the tote over one shoulder, the front panel facing the camera',
      'holding the tote by both handles in front of the legs while walking',
      'with the tote hanging from the crook of an elbow, filled with a baguette and flowers',
    ],
  },
  canvas: {
    name: 'gallery-wrapped stretched canvas print, about 50 × 50 cm, with white edges',
    audience: 'adult',
    size: '1024x1536',
    references: ['canvas/canvas-b-mockup-front.png', 'canvas/canvas-d-mockup-front.png'],
    printArea: 'covering the whole front of the canvas',
    surface: 'shows the fine canvas weave, perfectly flat and taut',
    isTop: false,
    usage: [
      'carrying the canvas under one arm, artwork facing out, as if just bought',
      'leaning the canvas against a wall and stepping back to look at it',
      'hanging the canvas on a wall, hands still on the frame edges',
    ],
  },
};

// ─── Creative pools ──────────────────────────────────────────────────────────

/** Artwork printed on the product. `kid: true` marks designs that suit children. */
const ARTWORKS = [
  { kid: false, art: 'a loose watercolour portrait of an elderly couple dancing in their kitchen, soft bleeding washes of rose and ochre' },
  { kid: false, art: 'a single-line continuous ink drawing of two hands holding, minimalist, black on white' },
  { kid: false, art: 'a ukiyo-e woodblock print of a fox crossing a snowy bridge under a red moon' },
  { kid: false, art: 'a risograph-style print of a cyclist on a coastal road, two-colour fluorescent pink and teal with visible grain' },
  { kid: false, art: 'an Art Nouveau illustration of a woman with flowing hair framed by poppies, in the manner of 1900s poster art, gold and sage' },
  { kid: false, art: 'a charcoal sketch of a sleeping greyhound curled on a blanket, smudged shading' },
  { kid: false, art: 'a bold Mexican papel-picado-inspired paper-cut pattern of birds and marigolds in hot pink, orange and turquoise' },
  { kid: false, art: 'a vintage botanical engraving of lemons and leaves, hand-tinted in pale yellow and green' },
  { kid: false, art: 'a 1970s travel-poster-style illustration of a lighthouse at sunset, flat shapes in burnt orange, mustard and navy' },
  { kid: false, art: 'an expressive oil painting of a bouquet of peonies with thick palette-knife texture' },
  { kid: false, art: 'a Bauhaus geometric composition of circles, half-moons and stripes in red, cobalt and cream' },
  { kid: false, art: 'a delicate pencil portrait of a grandmother laughing, fine cross-hatching' },
  { kid: false, art: 'a Matisse-like cut-paper collage of swimming figures in ultramarine on white' },
  { kid: false, art: 'a moody gouache night scene of a lit tram passing through a rainy street' },
  { kid: false, art: 'an embroidered-look illustration of a cat asleep on a stack of books, stitched textures in muted wool colours' },
  { kid: false, art: 'a pop-art halftone portrait of a couple on a Vespa, Ben-Day dots, bold black outlines' },
  { kid: false, art: 'a Japanese sumi-e ink painting of a crane taking flight, with a small red seal stamp' },
  { kid: false, art: 'a mid-century modern illustration of a family picnic, flat shapes and a limited palette of olive, coral and cream' },
  { kid: false, art: 'a stained-glass-style design of a sun rising over mountains, jewel tones with dark leading lines' },
  { kid: false, art: 'a hand-lettered script reading "Home is wherever you are" wrapped in wild herbs, sepia ink' },
  { kid: true, art: 'a cheerful cartoon of an astronaut kid riding a rocket past Saturn, bright primary colours' },
  { kid: true, art: 'a crayon-style drawing of a family of hedgehogs having a picnic, waxy textures' },
  { kid: true, art: 'a kawaii illustration of a smiling whale with a tiny lighthouse on its back, pastel blues' },
  { kid: true, art: 'a comic-book panel of a girl superhero with a cape lifting a school bus, with the words "SUPER ME!"' },
  { kid: true, art: 'a playful paper-cut collage of a lion wearing a crown, mustard and tangerine' },
  { kid: true, art: 'a pixel-art dragon guarding a pile of cookies, retro 8-bit palette' },
  { kid: true, art: 'a storybook watercolour of a bear and a rabbit sharing an umbrella in the rain' },
  { kid: true, art: 'a bold sticker-style octopus playing drums, with the words "MAKE SOME NOISE"' },
];

/**
 * People. `kid: true` for children (kid T-shirt), otherwise adults of all ages.
 * `top` is dropped when the product is itself the top, so it never hides the print.
 */
const MODELS = [
  { kid: false, who: 'a Black woman in her late 20s with short natural curls', top: 'a fitted black turtleneck', rest: 'wide camel trousers and gold hoops' },
  { kid: false, who: 'a silver-haired Japanese man in his 70s with round tortoiseshell glasses', top: 'a grey wool overshirt', rest: 'charcoal trousers and suede desert boots' },
  { kid: false, who: 'a freckled red-haired Irish woman in her 30s with a messy braid', top: 'a cream cable-knit cardigan', rest: 'a rust corduroy midi skirt and ankle boots' },
  { kid: false, who: 'a South Asian man in his 20s with a neat beard', top: 'an open-collar white linen shirt', rest: 'pleated sand trousers and a slim gold chain' },
  { kid: false, who: 'a plus-size Brazilian woman in her 40s with long dark waves and bold red lipstick', top: 'a silky emerald blouse', rest: 'high-waisted black trousers and statement earrings' },
  { kid: false, who: 'a tall Senegalese man in his 30s with a shaved head', top: 'a fine-gauge navy knit', rest: 'olive cargo trousers and white leather sneakers' },
  { kid: false, who: 'an elegant grey-bobbed French woman in her 60s', top: 'a navy-and-white Breton top', rest: 'cropped ecru jeans, ballet flats and pearl studs' },
  { kid: false, who: 'a Korean woman in her early 20s with a sleek black bob', top: 'a cropped baby-blue cardigan', rest: 'a pleated grey skirt and loafers with white socks' },
  { kid: false, who: 'a Middle Eastern woman in her 30s wearing a soft sand-coloured hijab', top: 'a long beige trench coat', rest: 'wide cream trousers and minimal gold jewellery' },
  { kid: false, who: 'a Scandinavian man in his 40s with a blond beard', top: 'a chunky cream knit', rest: 'dark selvedge jeans and leather boots' },
  { kid: false, who: 'a Mexican grandmother in her 70s with long silver plaits', top: 'an embroidered shawl over a plain dress', rest: 'a long dark skirt and woven sandals' },
  { kid: false, who: 'a mixed-race non-binary person in their 20s with a bleached buzz cut and silver rings', top: 'an oversized pinstripe shirt', rest: 'baggy black trousers and chunky boots' },
  { kid: false, who: 'an Italian man in his 50s with salt-and-pepper hair', top: 'a tan suede jacket over a white tee', rest: 'navy chinos and brown loafers' },
  { kid: false, who: 'a young Nigerian mother in her 30s with long braids, a baby asleep in a wrap carrier on her back', top: 'a mustard wrap dress', rest: 'leather sandals and beaded bracelets' },
  { kid: false, who: 'a Portuguese woman in her 20s with dark curly hair', top: 'a white linen shirt dress', rest: 'espadrilles and a straw hat' },
  { kid: false, who: 'a Chinese man in his 30s using a wheelchair', top: 'a black bomber jacket', rest: 'grey joggers and white sneakers' },
  { kid: true, who: 'a 6-year-old Black girl with two puff buns', top: '', rest: 'denim dungaree shorts and pink sneakers' },
  { kid: true, who: 'a 7-year-old South Asian boy with a gap-toothed grin', top: '', rest: 'green shorts and velcro trainers' },
  { kid: true, who: 'a 5-year-old blonde Scandinavian girl', top: '', rest: 'yellow wellington boots and a raincoat tied round her waist' },
  { kid: true, who: 'an 8-year-old Latino boy with curly hair, holding a skateboard', top: '', rest: 'cuffed jeans and scuffed sneakers' },
  { kid: true, who: 'a 6-year-old East Asian girl with a bowl cut', top: '', rest: 'a tulle skirt and red sneakers' },
  { kid: true, who: 'a 4-year-old red-haired boy with freckles and muddy knees', top: '', rest: 'cord shorts and wellies' },
];

/**
 * Places. `kid`/`adult` mark who they suit. `indoor` picks the light pool;
 * `lights` replaces it for places whose season or weather is already fixed.
 */
const CONTEXTS = [
  { kid: false, adult: true, indoor: false, where: "a cobbled lane in Lisbon's Alfama with azulejo-tiled walls and a yellow tram behind" },
  { kid: false, adult: true, indoor: false, where: 'a Kyoto temple path lined with red torii gates', lights: ['Early-morning mist, soft and pearly', 'Light spring rain, glossy stone path'] },
  { kid: false, adult: true, indoor: false, where: 'the balcony of a Haussmann apartment in Paris overlooking zinc rooftops' },
  { kid: false, adult: true, indoor: false, where: 'a sun-bleached Greek island harbour with whitewashed walls and blue shutters', lights: ['Bright Mediterranean midday sun, crisp shadows', 'Warm low golden-hour sun with long shadows'] },
  { kid: false, adult: true, indoor: false, where: 'a New York brownstone stoop on a fall afternoon, amber leaves on the steps' },
  { kid: false, adult: true, indoor: false, where: 'a Marrakech riad courtyard with a tiled fountain and orange trees', lights: ['Warm late-afternoon sun bouncing off terracotta walls', 'Dusk with brass lanterns glowing'] },
  { kid: false, adult: true, indoor: true, where: 'a minimalist Copenhagen café with pale oak tables and big windows' },
  { kid: false, adult: true, indoor: false, where: 'an old Havana street with pastel façades and a vintage car', lights: ['Hot tropical late-afternoon sun', 'Warm low golden-hour sun with long shadows'] },
  { kid: false, adult: true, indoor: true, where: 'a London Underground platform with cream tiles, a train arriving in a motion blur', lights: ['Cool fluorescent station light with warm highlights from the train windows'] },
  { kid: false, adult: true, indoor: false, where: 'a vineyard in Tuscany, cypress trees on the ridge', lights: ['Warm low golden-hour sun with long shadows', 'Hazy late-summer afternoon'] },
  { kid: false, adult: true, indoor: true, where: 'a cosy Edinburgh bookshop with ladders and green-shaded lamps' },
  { kid: false, adult: true, indoor: false, where: 'a Mexico City flower market bursting with marigolds and roses' },
  { kid: false, adult: true, indoor: true, where: 'a modernist concrete gallery with a single shaft of skylight', lights: ['A single soft beam of skylight, the rest in gentle shadow'] },
  { kid: false, adult: true, indoor: false, where: 'a rooftop garden in Barcelona with terracotta pots and the Sagrada Família in the distance' },
  { kid: false, adult: true, indoor: true, where: 'a 1960s-style diner booth with chrome and teal vinyl' },
  { kid: false, adult: true, indoor: false, where: 'a Scottish highland lay-by beside a dry-stone wall and grazing highland cows', lights: ['Moody overcast sky with drifting mist', 'Low autumn sun breaking through clouds'] },
  { kid: true, adult: true, indoor: false, where: 'a sunflower field in Provence at the end of summer', lights: ['Warm low golden-hour sun with long shadows', 'Hazy late-summer afternoon'] },
  { kid: true, adult: true, indoor: false, where: 'a windswept Cornish beach with tide pools and a striped windbreak' },
  { kid: true, adult: true, indoor: false, where: "a farmers' market in Vermont with crates of apples and pumpkins" },
  { kid: true, adult: true, indoor: false, where: 'a snowy Alpine village square with wooden chalets and string lights', lights: ['Light snowfall, soft diffused light', 'Blue-hour twilight with string lights glowing on the snow'] },
  { kid: true, adult: false, indoor: true, where: 'a natural history museum hall beneath a huge dinosaur skeleton', lights: ['Soft daylight from high arched windows'] },
  { kid: true, adult: false, indoor: false, where: 'a backyard treehouse with a rope ladder and paper bunting' },
  { kid: true, adult: false, indoor: true, where: 'a botanical glasshouse full of giant tropical leaves and a koi pond', lights: ['Bright humid light diffused through the glass roof'] },
  { kid: true, adult: false, indoor: false, where: 'a seaside pier with a carousel and candy-striped kiosks' },
  { kid: true, adult: false, indoor: true, where: "a children's library corner with bean bags and towering picture-book shelves" },
];

const OUTDOOR_LIGHT = [
  'Soft overcast daylight just after rain, wet reflective ground',
  'Warm low golden-hour sun with long shadows and gentle lens flare',
  'Blue-hour twilight with warm lights glowing nearby',
  'Bright crisp morning light, clean shadows',
  'Dappled sunlight through leaves',
  'Hazy summer afternoon light',
];

const INDOOR_LIGHT = [
  'Gentle window light on a grey morning, rain on the glass',
  'Warm tungsten lamps mixed with cool daylight from a window',
  'Late-afternoon sun slanting through a window in long warm stripes',
  'Soft even daylight from a large window',
];

const CAMERA = [
  'Shot on a 50mm lens at f/1.8, waist-up, shallow depth of field',
  'Shot on an 85mm portrait lens, three-quarter body, creamy bokeh',
  'Full-body shot on a 35mm lens from slightly low, environment visible around the subject',
  'Candid street-photography framing on a 28mm lens, subject slightly off-centre',
  'Medium-format film look, centred composition, subtle grain',
  'Environmental portrait, subject turned three-quarters toward the camera',
];

const GRADE = [
  'Muted, desaturated editorial colour grade with lifted blacks, quiet-luxury mood',
  'Warm Kodak Portra 400 film tones',
  'Cool Fujifilm Pro 400H palette with soft greens',
  'Rich cinematic grade with deep shadows and glowing highlights',
  'Bright airy Scandinavian grade, clean whites',
  'Nostalgic 1990s fashion-magazine look, slight vignette',
];

/**
 * Hand-written briefs, run with --concepts. The brands are invented for the shop;
 * never name or imitate a real brand here.
 */
const CONCEPTS = {
  'sports-brand': {
    product: 'hoodie',
    size: '1024x1536',
    artwork:
      'the logo of an invented athletic brand called "STRIDA": a bold forward-leaning double chevron in signal orange above the word STRIDA in a heavy italic sans-serif, black. Clean, sharp vector logo',
    subject:
      'a lean Black female sprinter in her 20s with her hair in tight braids pulled back, wearing the hoodie hood down with black running tights and orange running shoes, resting one foot on the bottom bar of the track railing to stretch, breath visible in the cold air',
    setting:
      'an empty outdoor athletics track at dawn, terracotta lanes with crisp white lines, stadium floodlights still on against a pale blue sky, light mist over the infield',
    camera: 'Shot on an 85mm lens, three-quarter body, shallow depth of field, the logo sharp',
    grade: 'Cool, high-contrast sports-campaign grade with a warm sunrise rim light',
  },
  'morning-coffee': {
    product: 'mug',
    size: '1024x1024',
    artwork:
      'a refined custom fine-line illustration in deep navy ink of a small house with a round window, an olive tree and a sleeping cat on the doorstep, with the hand-lettered words "Our first home · 2026" beneath it',
    subject:
      'a woman in her 30s with dark tousled hair in a loose bun, wearing an oatmeal linen robe, holding the mug in both hands at chest height with the illustration turned fully toward the camera, eyes half closed enjoying the first sip, gentle steam rising',
    setting:
      'a sunlit kitchen in the early morning: pale oak counter, a moka pot and a croissant on a linen napkin, a vase of white tulips, soft out-of-focus window behind with sheer curtains',
    camera: 'Close-up chest-level framing on a 50mm lens at f/2, the mug large in the frame and tack-sharp, background softly blurred',
    grade: 'Warm, soft morning light with a gentle creamy grade, quiet-luxury mood',
  },
  'football-team': {
    product: 'kid-tshirt',
    size: '1536x1024',
    artwork:
      'an identical team crest on every shirt: a navy shield with a gold lion head and the words "FC LITTLE LIONS" on a ribbon below. Every shirt is exactly the same, with no numbers or names',
    subject:
      'a mixed children\'s football team of eleven boys and girls aged 8 to 10 from many backgrounds, all wearing the same white T-shirt with navy shorts and navy socks, posing for a proud team photo: back row standing with arms around each other, front row kneeling, the child in the middle of the front row holding a football and wearing goalkeeper gloves but the SAME white T-shirt as everyone else (no goalkeeper jersey), everyone grinning, one child doing a playful thumbs-up',
    setting:
      'the edge of a grassy community football pitch on a bright Saturday morning, a white goal and corner flag behind, a few parents blurred in the distance',
    camera: 'Wide team-photo framing on a 35mm lens at eye level, every shirt and crest clearly visible and in focus',
    grade: 'Bright natural colours with soft sunshine, cheerful and authentic',
    rules:
      'every child, including the one holding the ball, wears exactly the same white short-sleeved T-shirt with exactly the same crest in the same place; no other logos, sponsors, numbers, watermarks or captions; realistic faces and hands for every child; no illustration or CGI look.',
  },
  'luxury-hoodie': {
    product: 'hoodie',
    size: '1024x1536',
    artwork:
      'ONLY a small logo for an invented luxury house called "Maison Aurèle": an elegant interlocking "MA" monogram in fine champagne gold inside a thin circle, about 6 cm wide. It sits on the upper chest on the right side of the image as the viewer sees it (the wearer\'s left chest), like a discreet designer logo. The rest of the hoodie is completely plain white',
    subject:
      'a man in his late 20s with dark wavy hair and light stubble, wearing the hoodie with relaxed camel wool trousers and a slim gold chain, one hand in the front pocket, glancing to the side',
    setting:
      'a quiet Milan street at blue hour after rain: wet stone pavement reflecting warm boutique window lights, an elegant arcade behind, a few blurred passers-by with umbrellas',
    camera: 'Shot on a 50mm lens at f/1.8, waist-up, shallow depth of field, the small logo crisp',
    grade: 'Muted, desaturated editorial colour grade with lifted blacks, quiet-luxury mood',
  },
  'luxury-tote': {
    product: 'tote',
    size: '1024x1536',
    artwork:
      'ONLY a small logo for an invented luxury house called "Maison Aurèle": an elegant interlocking "MA" monogram in fine champagne gold inside a thin circle, with "MAISON AURÈLE" beneath in clearly legible spaced serif capitals in the same champagne gold, the whole mark about 14 cm wide, centred on the upper third of the front panel. The rest of the tote is completely plain natural canvas',
    subject:
      'a poised woman in her 40s with a sleek low chignon and gold sunglasses, wearing a cream knit top, wide ivory trousers and tan leather sandals, carrying the tote over her shoulder, a bunch of white peonies and a baguette peeking out, walking with an easy smile',
    setting:
      'a sunlit Parisian street of honey-coloured stone façades with wrought-iron balconies, a café terrace with rattan chairs blurred in the background',
    camera: 'Full-body shot on a 50mm lens from slightly low, the tote and its logo sharp',
    grade: 'Soft warm midday light with a refined, slightly faded editorial grade',
  },
  'gym-hoodie-back': {
    product: 'hoodie',
    reference: 'hoodie/hoodie-g-mockup-back.png',
    size: '1024x1536',
    artwork:
      'a large logo for an invented gym called "IRONHAUS", printed across the upper back of the hoodie, about 30 cm wide: a bold black emblem of a barbell crossed over a stylised anvil, with "IRONHAUS" arched above in heavy athletic block letters and "ATHLETIC CLUB · EST. 2026" in small spaced capitals below. Strong, clean, black on white',
    subject:
      'a broad-shouldered athletic man in his 30s with a short fade, seen from BEHIND so the back print fills the frame, wearing the hoodie hood down with black training shorts, chalk on his hands, one hand resting on a loaded barbell on a rack, head turned slightly to the side',
    setting:
      'a raw industrial gym in a converted warehouse: exposed brick, black rubber floor, iron plates stacked on racks, chalk dust hanging in a beam of light from a tall factory window',
    camera: 'Shot from behind on a 50mm lens, waist-up, the back print sharp and fully visible, background softly blurred',
    grade: 'Moody, desaturated high-contrast grade with deep blacks and a warm shaft of light',
  },
  'streetwear-tee': {
    product: 'kid-tshirt',
    size: '1024x1536',
    productOverrides: {
      name: "black heavyweight cotton crew-neck T-shirt in an adult relaxed fit",
      referenceUse:
        'its crew neck, short sleeves, seams and fabric weight. The shirt in the new photo is BLACK, not white, and sized for an adult',
      surface: 'sits in the heavyweight cotton with soft natural creases',
    },
    artwork:
      'a chest-sized logo for an invented skate-and-workwear brand called "CURBSIDE": a chunky rounded wordmark in off-white with a slight retro arc, above a small circular emblem of a stylised half-pipe under a rising sun in burnt orange, and "SKATE & SUPPLY CO." in small spaced capitals below. Simple screen-print look, two colours, centred on the chest, about 22 cm wide',
    subject:
      'a skater in his early 20s of mixed heritage with shoulder-length curly hair and a silver chain, wearing the black T-shirt with loose tan work trousers and worn suede skate shoes, sitting on the lip of a concrete bowl with his skateboard across his knees, relaxed half-smile',
    setting:
      'an outdoor concrete skate park at golden hour, graffiti-free smooth grey bowls, palm trees and a low city skyline behind, long warm shadows',
    camera: 'Shot on a 35mm lens at chest height, three-quarter body, the logo sharp and centred in the frame',
    grade: 'Warm Kodak Portra 400 film tones with a slight 1990s skate-magazine grain',
  },
  // backdrops/ (static-assets CDN) orders-unboxing.jpg is this image cropped to its left 1300px, so the
  // print clears the title in the /orders header band on desktop.
  'orders-unboxing': {
    product: 'hoodie',
    size: '1536x1024',
    artwork:
      'a large custom gouache portrait of a golden retriever lying in a meadow of wildflowers, warm saturated colours, soft painterly edges, centred on the chest and about 28 cm wide',
    subject:
      'a woman in her late 20s with wavy chestnut hair and a cream knit top, holding the hoodie up by its shoulders in front of her chest with both hands, the printed front facing the camera, looking down at it with a delighted smile; an opened kraft-paper shipping box with tissue paper on the table in front of her',
    setting:
      'a bright, calm living room with a pale plaster wall and a softly blurred window. The LEFT HALF of the frame is empty, uncluttered out-of-focus plaster wall with soft window light and no objects, reserved for a headline',
    camera:
      'Wide landscape shot on a 35mm lens from a few metres back. The woman, hoodie and box all sit between 55% and 85% of the frame width from the left; the centre of the printed artwork is at about 65% of the frame width and in the vertical middle of the frame; her face is in the upper third. Nothing important in the left 50% or the right 12% of the frame',
    grade: 'Soft even daylight from a large window, warm natural colours, gentle editorial grade',
  },
  // backdrops/ (static-assets CDN) profile-sofia-tote.jpg is this image cropped to its left 1450px, so the
  // print clears the title in the /profile header band on desktop.
  'profile-tote': {
    product: 'tote',
    size: '1536x1024',
    artwork:
      'a vibrant personalised retro illustration of a young woman riding a bicycle with a basket full of flowers down a sunny Lisbon street with a yellow tram, flat warm colours in tangerine, teal and cream, with the name "SOFIA" hand-lettered in a bold rounded script beneath, filling the centre of the front panel',
    subject:
      'a woman in her early 30s with a dark curly bob and gold hoops, wearing a white linen shirt, standing and holding the tote up in front of her chest by both handles to show it off, the printed front facing the camera, smiling proudly',
    setting:
      'a bright, calm entrance hall with a warm off-white limewashed wall and soft daylight. The LEFT HALF of the frame is empty, uncluttered out-of-focus wall with no objects, reserved for a headline',
    camera:
      'Wide landscape shot on a 35mm lens from a few metres back. The woman and the tote sit between 55% and 85% of the frame width from the left; the printed artwork is in the vertical middle of the frame; her face is in the upper third. Nothing important in the left 50% or the right 12% of the frame',
    grade: 'Soft even daylight, warm natural colours, gentle editorial grade',
  },
  'photo-canvas': {
    product: 'canvas',
    size: '1024x1536',
    artwork:
      'a real PHOTOGRAPH (not an illustration) printed edge to edge: a candid golden-hour beach photo of a young couple laughing as they walk barefoot along the shoreline, the man carrying a toddler on his shoulders, soft sea spray and a warm sunset sky. Natural photographic colours and detail',
    subject:
      'a woman in her 30s with a dark low ponytail, wearing a soft grey knit and light jeans, hanging the canvas on a white living-room wall, both hands on its edges, stepping back slightly with a warm, moved smile',
    setting:
      'a calm Scandinavian-style living room: white walls, a low oak sideboard with a ceramic vase of dried grasses, a linen sofa just in frame, a leaning ladder shelf with a few books',
    camera: 'Shot on a 35mm lens from slightly to the side, the whole canvas visible and sharp, the woman in three-quarter view',
    grade: 'Soft even daylight from a large window, bright airy Scandinavian grade, clean whites',
  },
};

// ─── Prompt building ─────────────────────────────────────────────────────────

const DEFAULT_RULES =
  'exactly one product of this kind in the frame; no other prints, brand logos, watermarks or captions; text only where the artwork itself specifies it; no illustration or CGI look.';

function buildPrompt({ product, artwork, subject, setting, camera, grade, rules = DEFAULT_RULES }) {
  return `Photorealistic lifestyle photograph for a premium print-on-demand gift shop.

REFERENCE IMAGE: the attached image shows the shop's real ${product.name}. Use it ONLY for the blank product itself: ${product.referenceUse ?? 'its exact cut, colour, fabric or material, proportions, seams and handles'}. IGNORE the artwork printed on it in the reference and replace it completely with the new artwork below.

NEW ARTWORK ON THE PRODUCT: ${artwork}. Printed as a real high-quality print that ${product.surface}. The artwork is clearly visible, sharp and not cropped.

SUBJECT: ${subject}. Natural, relaxed, unposed body language, a genuine expression.

SETTING: ${setting}.

CAMERA AND LOOK: ${camera}. ${grade}. Authentic editorial photography, real skin texture, natural hands with five fingers, believable fabric drape.

RULES: ${rules}`;
}

function makeJob(index, slug, productKey, parts, reference, opts, productOverrides = {}) {
  const product = { ...PRODUCTS[productKey], ...productOverrides };
  return {
    index,
    slug,
    productKey,
    reference,
    size: opts.size ?? parts.size ?? product.size,
    parts,
    prompt: buildPrompt({ product, ...parts }),
  };
}

function planConcepts(opts, rand) {
  return opts.concepts.map((key, i) => {
    const concept = CONCEPTS[key];
    if (!concept) {
      console.error(`Unknown concept "${key}". Use: ${Object.keys(CONCEPTS).join(', ')}`);
      process.exit(1);
    }
    const { product: productKey, reference, productOverrides, ...parts } = concept;
    const references = PRODUCTS[productKey].references;
    const ref = reference ?? references[Math.floor(rand() * references.length)];
    return makeJob(i + 1, key, productKey, parts, ref, opts, productOverrides);
  });
}

function planBatch(opts, rand) {
  const productKeys = opts.products ?? Object.keys(PRODUCTS);
  for (const key of productKeys) {
    if (!PRODUCTS[key]) {
      console.error(`Unknown product "${key}". Use: ${Object.keys(PRODUCTS).join(', ')}`);
      process.exit(1);
    }
  }

  const nextProduct = makeDeck(productKeys, rand);
  const nextArtwork = makeDeck(ARTWORKS, rand);
  const nextModel = makeDeck(MODELS, rand);
  const nextContext = makeDeck(CONTEXTS, rand);
  const pick = (list) => list[Math.floor(rand() * list.length)];

  return Array.from({ length: opts.count }, (_, index) => {
    const productKey = nextProduct();
    const product = PRODUCTS[productKey];
    const isKid = product.audience === 'kid';
    const context = nextContext((c) => (isKid ? c.kid : c.adult));
    const model = nextModel((m) => m.kid === isKid);
    const outfit = product.isTop || !model.top ? model.rest : `${model.top} with ${model.rest}`;
    const light = pick(context.lights ?? (context.indoor ? INDOOR_LIGHT : OUTDOOR_LIGHT));
    const parts = {
      artwork: `${nextArtwork((a) => a.kid === isKid).art}, ${product.printArea}`,
      subject: `${model.who}, ${pick(product.usage)}. Wearing ${outfit}`,
      setting: `${context.where}. ${light}`,
      camera: pick(CAMERA),
      grade: pick(GRADE),
    };
    return makeJob(index + 1, productKey, productKey, parts, pick(product.references), opts);
  });
}

// ─── Generation ──────────────────────────────────────────────────────────────

async function generateOne(client, job, opts, outDir) {
  const referenceUrl = `${productsBaseUrl()}/${job.reference}`;
  const referenceResponse = await fetch(referenceUrl);
  if (!referenceResponse.ok) throw new Error(`Could not fetch ${referenceUrl}: HTTP ${referenceResponse.status}`);
  const reference = await toFile(Buffer.from(await referenceResponse.arrayBuffer()), path.basename(job.reference), {
    type: 'image/png',
  });

  const started = Date.now();
  const response = await client.images.edit({
    model: opts.model,
    image: reference,
    prompt: job.prompt,
    size: job.size,
    quality: opts.quality,
    output_format: 'jpeg',
    output_compression: 90,
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI returned no image data');

  const filename = `${String(job.index).padStart(2, '0')}-${job.slug}-${opts.runId}.jpg`;
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
  return { filename, seconds: Math.round((Date.now() - started) / 1000) };
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(lanes);
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  opts.runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  const rand = mulberry32(opts.seed);
  const jobs = opts.concepts ? planConcepts(opts, rand) : planBatch(opts, rand);

  console.log(`=== Backdrop generator: ${jobs.length} image(s), seed ${opts.seed}, ${opts.model} (${opts.quality}) ===\n`);

  if (opts.dryRun) {
    for (const job of jobs) {
      console.log(`--- #${job.index} ${job.productKey} · ${job.size} · ref ${job.reference} ---`);
      console.log(job.prompt, '\n');
    }
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY not set');
    process.exit(1);
  }
  const client = new OpenAI({ apiKey, timeout: 10 * 60 * 1000, maxRetries: 2 });

  const outDir = path.resolve(opts.out);
  fs.mkdirSync(outDir, { recursive: true });

  const results = await runPool(jobs, opts.concurrency, async (job) => {
    const label = `#${job.index} ${job.slug}`;
    console.log(`→ ${label}: ${job.parts.subject.slice(0, 60)}… in ${job.parts.setting.slice(0, 50)}…`);
    try {
      const { filename, seconds } = await generateOne(client, job, opts, outDir);
      console.log(`✓ ${label}: ${filename} (${seconds}s)`);
      return { ...job, filename, error: null };
    } catch (error) {
      console.error(`✗ ${label}: ${error.message}`);
      return { ...job, filename: null, error: error.message };
    }
  });

  const manifestPath = path.join(outDir, 'manifest.json');
  const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
  const entries = results.map(({ parts, ...job }) => ({
    runId: opts.runId,
    seed: opts.seed,
    model: opts.model,
    quality: opts.quality,
    ...job,
    artwork: parts.artwork,
    subject: parts.subject,
    setting: parts.setting,
    camera: parts.camera,
    grade: parts.grade,
    generatedAt: new Date().toISOString(),
  }));
  fs.writeFileSync(manifestPath, JSON.stringify([...previous, ...entries], null, 2));

  const failed = results.filter((r) => r.error).length;
  console.log(`\nDone: ${results.length - failed} saved to ${path.relative(process.cwd(), outDir)}, ${failed} failed. Manifest: ${path.relative(process.cwd(), manifestPath)}`);
  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
