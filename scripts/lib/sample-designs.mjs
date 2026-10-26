/**
 * Sample designs for scripts/create-sample-products.mjs
 *
 * `id` is "<prefix>-<letter>" and continues the lettering already used in each
 * folder of public/products-images (e.g. tote had a–c, so the first new one is tote-d).
 * All brands and characters are fictional.
 * `position` sets the print position (default: the product's first, usually front).
 */

/** Shared instruction for artwork that is printed straight onto a white product */
const PRINT_READY = 'Centered composition on a plain pure white background with a generous empty margin on every side, so no text or element touches or is cut off by the edges. No border, no frame, no mockup, no watermark. High resolution, print-ready.';

/** Shared instruction for photos that fill the whole print area (mugs, canvas, totes) */
const FULL_BLEED = 'Full bleed, no border, no text, no watermark. High resolution.';

/** Printify product and variant settings per output folder */
const PRODUCT_BY_FOLDER = {
  hoodie: { productKey: 'hoodie' },
  'kid t-shirt': { productKey: 'tshirt-kids' },
  // The mug print area wraps all the way around; cap the width so the design stays on the visible front
  mug: { productKey: 'mug', maxScale: 0.42 },
  // Canvas has no colors; use the square sizes (14", 24", 32") to match the 1:1 artwork
  canvas: { productKey: 'canvas', variantFilter: title => !/horizontal|vertical/.test(title) },
  // The AOP tote's print area wraps past the visible front panel; cap the width so designs don't run into the seams
  tote: { productKey: 'tote-aop', maxScale: 0.7 },
};

/**
 * Print-ready artwork (anything that isn't a full-bleed photo) is generated with a
 * transparent background where the provider supports it, so the white/cream
 * canvas doesn't print as a visible box on the product.
 */
const design = (id, folder, fields) => ({
  id,
  folder,
  ...PRODUCT_BY_FOLDER[folder],
  transparentBackground: fields.prompt.endsWith(PRINT_READY),
  ...fields,
});

export const DESIGNS = [
  // First batch
  design('hoodie-a', 'hoodie', {
    title: 'Tabby Cat Portrait Hoodie',
    kind: 'Pet photo',
    removeBackground: true,
    prompt: `A realistic photograph of a tabby cat wearing a small red knitted scarf, sitting and looking at the camera, soft studio lighting, isolated subject. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-c', 'kid t-shirt', {
    title: 'Astronaut Fox Kids Tee',
    kind: 'Kids illustration',
    prompt: `A flat, kid-friendly vector-style illustration of a cute orange fox in a white space suit floating among a ringed planet and stars, with the hand-lettered text "Dream Big, Little One" above it. Warm, friendly colors. ${PRINT_READY}`,
  }),
  design('mug-a', 'mug', {
    title: 'Grandparents on the Bench Mug',
    kind: 'Family photo',
    prompt: `A realistic, warm candid photograph of an older couple laughing together on a wooden park bench in autumn, orange leaves on the ground, soft natural light. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-a', 'canvas', {
    title: 'First Dance Canvas',
    kind: 'Special-occasion photo',
    prompt: `A realistic photograph of a bride and groom sharing their first dance under festoon string lights at an outdoor evening wedding reception, warm golden tones, soft bokeh. ${FULL_BLEED}`,
  }),
  design('tote-d', 'tote', {
    title: 'Little Fern Bakery Tote',
    kind: 'Small-business logo',
    prompt: `A minimal flat logo for a fictional bakery called "Little Fern Bakery": a line-art croissant framed by a fern-leaf wreath, with the name in a clean rounded serif below. Terracotta on off-white. ${PRINT_READY}`,
  }),

  // Second batch, alternating hoodie → kids tee → mug → canvas → tote
  design('hoodie-b', 'hoodie', {
    title: 'Wander More Mountain Hoodie',
    kind: 'Illustration',
    prompt: `A retro outdoor badge illustration: layered mountains under a striped orange and mustard sunset inside a circle, pine trees in front, with the text "Wander More" in a bold vintage font curved below. Limited palette of navy, orange and cream. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-d', 'kid t-shirt', {
    title: 'Roller Skating Unicorn Kids Tee',
    kind: 'Kids illustration',
    prompt: `A cheerful cartoon unicorn with a pastel rainbow mane zooming on pink roller skates, little speed lines and sparkles behind it, with the playful hand-lettered text "Roll With It" above. Bright pastel colors. ${PRINT_READY}`,
  }),
  design('mug-b', 'mug', {
    title: 'Beagle Puppy Mug',
    kind: 'Pet photo',
    prompt: `A realistic photograph of a beagle puppy peeking out of a wicker basket on a cozy knitted blanket, warm window light, shallow depth of field. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-b', 'canvas', {
    title: 'Baking Together Canvas',
    kind: 'Family photo',
    prompt: `A realistic candid photograph of a mother and her young daughter laughing while baking cookies in a sunny kitchen, flour on the counter and on their hands, warm natural light. ${FULL_BLEED}`,
  }),
  design('tote-e', 'tote', {
    title: 'Saltwater Pottery Studio Tote',
    kind: 'Small-business logo',
    prompt: `A minimal line-art logo for a fictional ceramics studio called "Saltwater Pottery Studio": a simple vase shape with a wave line across it, the name in a clean uppercase sans-serif below. Deep navy on white. ${PRINT_READY}`,
  }),
  design('hoodie-c', 'hoodie', {
    title: 'Frenchie in a Raincoat Hoodie',
    kind: 'Pet photo',
    removeBackground: true,
    prompt: `A realistic photograph of a French bulldog wearing a bright yellow raincoat, sitting and looking at the camera with a curious head tilt, soft studio lighting, isolated subject. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-e', 'kid t-shirt', {
    title: 'Little Explorer Bear Kids Tee',
    kind: 'Kids illustration',
    prompt: `A cute flat illustration of a small brown bear cub with a green backpack and binoculars, standing next to a signpost and a little tent, with the rounded hand-lettered text "Little Explorer" above. Earthy greens and browns. ${PRINT_READY}`,
  }),
  design('mug-c', 'mug', {
    title: 'One More Chapter Mug',
    kind: 'Illustration',
    prompt: `A soft watercolor illustration of a ginger cat asleep on a stack of books next to a steaming cup of tea, with the elegant script text "Just One More Chapter" beside it. Warm muted colors, wide landscape layout. ${PRINT_READY}`,
  }),
  design('canvas-c', 'canvas', {
    title: 'Graduation Day Canvas',
    kind: 'Special-occasion photo',
    prompt: `A realistic photograph of a smiling young woman in a navy graduation gown tossing her cap into the air on a green campus lawn, blue sky, golden afternoon light. ${FULL_BLEED}`,
  }),
  design('tote-f', 'tote', {
    title: 'Grow Wild Wildflowers Tote',
    kind: 'Illustration',
    prompt: `A delicate botanical line-art bouquet of wildflowers (poppies, daisies, lavender and grasses) tied with a ribbon, with the hand-lettered text "Grow Wild" underneath. Sage green and dusty pink. ${PRINT_READY}`,
  }),
  design('hoodie-d', 'hoodie', {
    title: 'Harbor Run Club Hoodie',
    kind: 'Small-business logo',
    prompt: `A sporty badge logo for a fictional running club called "Harbor Run Club": a circular emblem with a lighthouse, waves and a running shoe wing, "EST. 2024" at the bottom, bold collegiate lettering. Navy and red. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-f', 'kid t-shirt', {
    title: 'Golden Puppy Kids Tee',
    kind: 'Pet photo',
    removeBackground: true,
    prompt: `A realistic photograph of a fluffy golden retriever puppy sitting with its head tilted and tongue out, soft studio lighting, isolated subject. ${PRINT_READY}`,
  }),
  design('mug-d', 'mug', {
    title: 'Northbound Coffee Roasters Mug',
    kind: 'Small-business logo',
    prompt: `A clean modern logo for a fictional coffee roastery called "Northbound Coffee Roasters": a coffee bean with a compass needle inside it, the name in a geometric sans-serif beside it, wide horizontal layout. Espresso brown and copper. ${PRINT_READY}`,
  }),
  design('canvas-d', 'canvas', {
    title: 'Window Cats at Sunset Canvas',
    kind: 'Pet photo',
    prompt: `A realistic photograph of two cats, one black and one white, sitting side by side on a windowsill looking out at a warm orange sunset, cozy interior, soft backlight. ${FULL_BLEED}`,
  }),
  design('tote-g', 'tote', {
    title: 'Fishing with Grandpa Tote',
    kind: 'Family photo',
    prompt: `A realistic photograph of a grandfather and his young grandson fishing together from a wooden dock on a calm lake at sunrise, mist on the water, seen from behind and slightly to the side. ${FULL_BLEED}`,
  }),
  design('hoodie-e', 'hoodie', {
    title: 'Coffee & Chill Hoodie',
    kind: 'Illustration',
    prompt: `A fun cartoon of a smiling takeaway coffee cup wearing sunglasses and lounging, little steam swirls above, with the bold rounded text "Coffee & Chill" below. Bold outlines, warm brown, teal and cream. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-g', 'kid t-shirt', {
    title: 'Super Sister Kids Tee',
    kind: 'Kids illustration',
    prompt: `An original cartoon of a little girl superhero with a purple cape and a star on her chest, flying with one fist forward among clouds, with the comic-style text "Super Sister" above. No existing superhero logos. Bright purple, yellow and sky blue. ${PRINT_READY}`,
  }),
  design('mug-e', 'mug', {
    title: 'Sunday Nap Mug',
    kind: 'Family photo',
    prompt: `A realistic, tender photograph of a father and his toddler asleep together on a sofa under a soft blanket on a lazy afternoon, warm window light. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-e', 'canvas', {
    title: 'First Birthday Canvas',
    kind: 'Special-occasion photo',
    prompt: `A realistic photograph of a laughing one-year-old toddler at a cake smash, frosting on their hands and face, a small cake with a single candle, pastel balloons in the background, bright and soft lighting. ${FULL_BLEED}`,
  }),
  design('tote-h', 'tote', {
    title: 'Fresh & Local Market Tote',
    kind: 'Illustration',
    prompt: `A hand-drawn illustration of a wooden crate overflowing with fresh vegetables (carrots, tomatoes, leafy greens, radishes), with the vintage hand-lettered text "Fresh & Local" above it. Warm earthy colors. ${PRINT_READY}`,
  }),

  // Third batch: animals, alternating hoodie → kids tee → mug → canvas → tote,
  // and front/back on the products that have a back print area (hoodie, kids tee)
  design('hoodie-f', 'hoodie', {
    title: 'Stay Wild Wolf Hoodie',
    kind: 'Animal illustration',
    position: 'front',
    prompt: `A geometric line-art illustration of a wolf howling at a full moon above pine trees, inside a circle, with the text "Stay Wild" in a clean uppercase font below. Charcoal and slate blue. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-h', 'kid t-shirt', {
    title: 'Splash Time Elephant Kids Tee',
    kind: 'Kids illustration',
    position: 'front',
    prompt: `A cute cartoon baby elephant happily spraying water from its trunk, little water droplets and bubbles around it, with the bubbly hand-lettered text "Splash Time!" above. Soft grey, aqua and pink. ${PRINT_READY}`,
  }),
  design('mug-f', 'mug', {
    title: 'Red Fox in the Snow Mug',
    kind: 'Animal photo',
    prompt: `A realistic wildlife photograph of a red fox standing in a snowy forest clearing, snowflakes falling, soft winter light, sharp focus on the fox. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-f', 'canvas', {
    title: 'Golden Hour Lion Canvas',
    kind: 'Animal photo',
    prompt: `A realistic wildlife portrait of a male lion with a full mane resting in tall savanna grass at golden hour, warm backlight glowing through the mane, calm gaze. ${FULL_BLEED}`,
  }),
  design('tote-i', 'tote', {
    title: 'Ocean Soul Sea Turtle Tote',
    kind: 'Animal illustration',
    prompt: `A soft watercolor illustration of a sea turtle swimming among bubbles and a few small fish, with the hand-lettered text "Ocean Soul" below. Teal, turquoise and sandy gold. ${PRINT_READY}`,
  }),
  design('hoodie-g', 'hoodie', {
    title: 'Fearless Tiger Back Print Hoodie',
    kind: 'Animal illustration',
    position: 'back',
    prompt: `A bold vintage tattoo-style illustration of a roaring tiger head surrounded by peonies, with a ribbon banner reading "Fearless" underneath. Large back-print composition, tall layout. Orange, black, red and cream. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-i', 'kid t-shirt', {
    title: 'Cool Penguin Back Print Kids Tee',
    kind: 'Kids illustration',
    position: 'back',
    prompt: `A cute cartoon penguin in a red scarf and beanie skiing down a snowy hill, snow spraying behind, with the playful hand-lettered text "Too Cool" above. Icy blue, white and red. ${PRINT_READY}`,
  }),
  design('mug-g', 'mug', {
    title: 'Slow Mornings Sloth Mug',
    kind: 'Animal illustration',
    prompt: `A charming illustration of a smiling sloth hanging from a leafy branch while holding a steaming coffee cup, with the relaxed script text "Slow Mornings" beside it. Wide landscape layout. Mossy green, beige and brown. ${PRINT_READY}`,
  }),
  design('canvas-g', 'canvas', {
    title: 'Hummingbird and Hibiscus Canvas',
    kind: 'Animal photo',
    prompt: `A realistic macro photograph of an iridescent green hummingbird hovering next to a bright pink hibiscus flower, wings motion-blurred, soft green bokeh background. ${FULL_BLEED}`,
  }),
  design('tote-j', 'tote', {
    title: 'Highland Cow Tote',
    kind: 'Animal photo',
    prompt: `A realistic photograph of a shaggy ginger highland cow with long horns standing in a misty green Scottish meadow, looking at the camera, soft overcast light. ${FULL_BLEED}`,
  }),
  design('hoodie-h', 'hoodie', {
    title: 'Blue-Eyed Husky Hoodie',
    kind: 'Pet photo',
    position: 'front',
    removeBackground: true,
    prompt: `A realistic photograph of a Siberian husky with striking blue eyes sitting and looking at the camera, soft studio lighting, isolated subject. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-j', 'kid t-shirt', {
    title: 'Wise Little Owl Kids Tee',
    kind: 'Kids illustration',
    position: 'front',
    prompt: `A cute flat illustration of a round little owl with big glasses reading a book while sitting on a branch with a few leaves, with the rounded hand-lettered text "Wise Little Owl" above. Warm brown, mustard and teal. ${PRINT_READY}`,
  }),
  design('mug-h', 'mug', {
    title: 'Running Corgi Mug',
    kind: 'Pet photo',
    prompt: `A realistic, joyful photograph of a corgi running across a sunny green lawn towards the camera, ears up and tongue out, shallow depth of field. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-h', 'canvas', {
    title: 'Elephant Mother and Calf Canvas',
    kind: 'Animal photo',
    prompt: `A realistic wildlife photograph of a mother elephant and her calf walking side by side towards a waterhole at sunset, dusty orange sky, acacia trees silhouetted in the background. ${FULL_BLEED}`,
  }),
  design('tote-k', 'tote', {
    title: 'Cat Person Botanical Tote',
    kind: 'Animal illustration',
    prompt: `A minimal line-art illustration of a sitting cat silhouette framed by delicate leaves and small flowers, with the text "Cat Person" in a clean serif font below. Black line work with sage green accents. ${PRINT_READY}`,
  }),
  design('hoodie-i', 'hoodie', {
    title: 'Soaring Eagle Back Print Hoodie',
    kind: 'Animal illustration',
    position: 'back',
    prompt: `A vintage outdoor-style illustration of a bald eagle with wings spread wide soaring over snowy mountain peaks and pine forest, with the text "Free Spirit" in a bold retro font below. Large back-print composition. Navy, brown, gold and cream. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-k', 'kid t-shirt', {
    title: 'Rock On Octopus Back Print Kids Tee',
    kind: 'Kids illustration',
    position: 'back',
    prompt: `A funny cartoon purple octopus playing a drum kit with all eight arms, music notes flying around, with the bold comic text "Rock On!" above. Purple, orange and yellow. ${PRINT_READY}`,
  }),
  design('mug-i', 'mug', {
    title: 'Bamboo Break Panda Mug',
    kind: 'Animal illustration',
    prompt: `A kawaii-style illustration of a chubby panda sitting and happily munching bamboo, a few bamboo stalks and leaves around it, with the cute text "Bamboo Break" beside it. Wide landscape layout. Black, white and fresh green. ${PRINT_READY}`,
  }),
  design('canvas-i', 'canvas', {
    title: 'Polar Bear Under the Aurora Canvas',
    kind: 'Animal photo',
    prompt: `A realistic photograph of a polar bear standing on sea ice under a vivid green and purple aurora borealis in a starry night sky, snow sparkling in the foreground. ${FULL_BLEED}`,
  }),
  design('tote-l', 'tote', {
    title: 'Bee Kind Tote',
    kind: 'Animal illustration',
    prompt: `A cheerful retro illustration of a smiling bumblebee flying over a honeycomb pattern and a few daisies, with the hand-lettered text "Bee Kind" above. Honey yellow, black and white. ${PRINT_READY}`,
  }),

  // Fourth batch: personal memories turned into art (like public/promo-sections/memories),
  // alternating products and front/back on hoodie and kids tee
  design('hoodie-j', 'hoodie', {
    title: 'Ferris Wheel Couple Sketch Hoodie',
    kind: 'Memory art',
    position: 'front',
    prompt: `A colored-pencil drawing of a young couple hugging and smiling in a sunny park with a ferris wheel and trees behind them, visible pencil strokes, soft vignette that fades out to the edges (no rectangular background). ${PRINT_READY}`,
  }),
  design('kid-t-shirt-l', 'kid t-shirt', {
    title: 'Girl and Her Dog Kids Tee',
    kind: 'Memory art',
    position: 'front',
    prompt: `A cute cartoon illustration of a smiling little girl with pigtails hugging her fluffy black dog, both looking happy, a few small hearts around them. Soft warm colors. ${PRINT_READY}`,
  }),
  design('mug-j', 'mug', {
    title: 'Baking with Grandma Sketch Mug',
    kind: 'Memory art',
    prompt: `A black-and-white pencil sketch of a grandmother and her young grandson rolling cookie dough together at a kitchen table, both laughing, fine shading, wide landscape layout. ${PRINT_READY}`,
  }),
  design('canvas-j', 'canvas', {
    title: 'Sunset Beach Family Watercolor Canvas',
    kind: 'Memory art',
    prompt: `A soft watercolor painting of a family of four walking hand in hand along the beach at sunset, seen from behind, gentle waves and a pink and orange sky, loose brush strokes on textured paper. ${FULL_BLEED}`,
  }),
  design('tote-m', 'tote', {
    title: 'Mother and Newborn Sketch Tote',
    kind: 'Memory art',
    prompt: `A delicate black-and-white pencil sketch portrait of a mother tenderly holding her sleeping newborn baby against her cheek, fine realistic shading that fades out at the edges. ${PRINT_READY}`,
  }),
  design('hoodie-k', 'hoodie', {
    title: 'Superhero Pup Back Print Hoodie',
    kind: 'Memory art',
    position: 'back',
    prompt: `A playful cartoon portrait of a black labrador wearing a plain red superhero cape and mask (no logos or emblems), standing proudly with the cape flowing, a few comic-style action lines behind it. Large back-print composition. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-m', 'kid t-shirt', {
    title: 'Sibling Hug Anime Back Print Kids Tee',
    kind: 'Memory art',
    position: 'back',
    prompt: `An anime-style illustration of an older sister hugging her curly-haired little brother in a green summer field, both smiling, soft cel shading, oval vignette that fades to the edges. ${PRINT_READY}`,
  }),
  design('mug-k', 'mug', {
    title: 'Kitchen Dance Oil Painting Mug',
    kind: 'Memory art',
    prompt: `An impressionist oil painting of a couple slow-dancing barefoot in a cozy warm kitchen in the evening, visible thick brush strokes, golden lamp light. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-k', 'canvas', {
    title: 'First Bike Ride Colored Pencil Canvas',
    kind: 'Memory art',
    prompt: `A colored-pencil drawing of a father running beside his young daughter as she rides a bike for the first time in a leafy park, both laughing, visible pencil texture on paper, warm summer colors. ${FULL_BLEED}`,
  }),
  design('tote-n', 'tote', {
    title: 'Beach Kiss One-Line Tote',
    kind: 'Memory art',
    prompt: `A minimalist single continuous-line drawing of a couple sharing a kiss on the beach with a small heart and a simple sun above them. Thin black line only. ${PRINT_READY}`,
  }),
  design('hoodie-l', 'hoodie', {
    title: 'Cat Cuddle Watercolor Hoodie',
    kind: 'Memory art',
    position: 'front',
    prompt: `A watercolor portrait of a young woman cuddling her orange cat against her cheek, both eyes closed and content, soft splashes of color that fade out to the edges. ${PRINT_READY}`,
  }),
  design('kid-t-shirt-n', 'kid t-shirt', {
    title: 'Best Summer Ever Camping Kids Tee',
    kind: 'Memory art',
    position: 'front',
    prompt: `A cheerful cartoon of a family of four roasting marshmallows around a campfire next to a tent under a starry sky, with the hand-lettered text "Best Summer Ever" above. ${PRINT_READY}`,
  }),
  design('mug-l', 'mug', {
    title: 'Best Friends Pop Art Mug',
    kind: 'Memory art',
    prompt: `A bold pop-art comic style portrait of two best friends laughing together cheek to cheek, halftone dots, thick black outlines, bright pink, yellow and teal background. Wide landscape framing. ${FULL_BLEED}`,
  }),
  design('canvas-l', 'canvas', {
    title: 'Golden Anniversary Oil Painting Canvas',
    kind: 'Memory art',
    prompt: `A warm oil painting of an elderly couple dancing together at their golden wedding anniversary party, string lights and smiling family softly blurred behind them, rich textured brush strokes. ${FULL_BLEED}`,
  }),
  design('tote-o', 'tote', {
    title: 'Story Time with Grandpa Sketch Tote',
    kind: 'Memory art',
    prompt: `A black-and-white pencil sketch of a grandfather reading a storybook to his granddaughter on his lap in a big armchair, both smiling, fine realistic shading that fades out at the edges. ${PRINT_READY}`,
  }),
];
