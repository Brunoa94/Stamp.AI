# Stamp AI brand voice

The source of truth for how Stamp AI sounds. All customer-facing copy lives in
`src/i18n/messages/en.json`; check new or changed strings against this guide.

## Personality

Stamp AI is **a friend who runs a great print shop**. You show them a photo or a
half-formed idea, they get it right away, handle the hard parts (artwork, print
files, fabric) and hand you something you will keep for years. No design jargon,
no minimums, no fuss — just quiet pride in doing it properly.

> Good design shouldn't need a design degree or a 500-unit minimum. Tell us what
> you want, and we'll help you make it — one piece at a time. — Stamp AI manifesto

## Voice attributes

| Attribute | We are | We are not | Sounds like | Does not sound like |
| --- | --- | --- | --- | --- |
| **Plain-spoken** | Short sentences, everyday words, one clear next step | Dumbed-down, or AI/tech jargon | "Type what you want in one or two simple sentences." | "Step 02 / Synthesis protocol initiated." |
| **Proud of the craft** | Specific about weights, inks, washing and timelines | Vague "premium" talk or empty superlatives | "Heavyweight blanks, 280 to 480 GSM, picked to survive years of wear." | "The best shirts in the world!" |
| **Warm and personal** | Focused on the person and what the piece means to them | Sentimental, gushing or cutesy | "Turn your cherished moments into lasting keepsakes." | "OMG your fur baby will look SO cute!!!" |
| **Playful in short bursts** | One confident, fun line at key moments (hero, main button, launches) | Jokey everywhere, loud caps, stacked exclamation marks | "From imagination to thing." / "Stamp it!" | "LET'S GOOO!! STAMP YOUR VIBE!!!" |

Spectrum: casual and conversational; peer-level about ideas, expert about printing;
warm; simple; calm and confident with short bursts of boldness; light humour. AI is
never the hero — the customer's photo or idea is.

## Audience

1. **People making something personal (primary)** — gifts and keepsakes from their own
   photos: pets, family, couples, milestones. Not designers; want it to look like *their*
   photo; a little nervous about quality. Speak to them as "you", warmly.
2. **Small brands and creators** — logos, streetwear, merch. Care about blank quality,
   consistent prints and no inventory. Be practical and specific.
3. **Groups and events** — birthdays, bachelor parties, teams. Care about speed and
   everyone getting the same design.

## Messaging pillars (in priority order)

1. **Your photo, reimagined.** Upload a photo (or describe an idea), get print-ready art.
   Lead with the photo — editing your own image is what sets Stamp AI apart.
2. **Built to last.** Heavyweight 280–480 GSM blanks, water-based inks, hand inspection.
3. **One piece at a time.** No minimums, made to order, less waste.
4. **Shop with confidence.** 30-day guarantee, tracked delivery, secure checkout.

## Tone by context

| Context | Tone | Example |
| --- | --- | --- |
| Homepage hero, ads | Bold, short, playful | "From imagination to thing." |
| Design studio steps | Clear, encouraging, one action at a time | "Not happy? Change a word and try again." |
| Product and quality | Proud, specific | "320 GSM, pre-shrunk, enzyme-washed." |
| Gifting campaigns | Warm, personal | "The photo they love, on something they'll wear." |
| Errors | Calm, blame-free, with a next step | "We couldn't find your bag. Please go back and add your items again." |
| Order and support emails | Reassuring, precise | "Your order is being printed. Expect it in 5 to 7 business days." |
| Brands and bulk | Practical, numbers-led | "No minimums. Orders of 25 or more get a volume discount." |

## Style rules

| Rule | Choice |
| --- | --- |
| Button and link labels | Sentence case, verb first ("Start creating", "Use this design"). Write strings in sentence case even where CSS displays them uppercase. |
| Main call to action | "Start creating" (product cards may use "Design yours") |
| Oxford comma | Yes ("fit, feel, and print quality") |
| Contractions | Yes |
| Exclamation marks | At most one per page, for celebration only ("Stamp it!") |
| Ranges | Words in sentences ("5 to 7 business days"); en dash in compact labels ("280–480 GSM") |
| Currency | Symbol first, no decimals for whole amounts ("€60") |
| Em dashes | Spaced ("word — word") |
| Emoji | Social media only, sparingly; never in the UI or emails |

## Terminology

| Use | Avoid | Notes |
| --- | --- | --- |
| Stamp AI | Stamp, STAMP IT | "Stamp it" is fine as a verb or button label |
| design studio | synthesis, protocol, process | |
| design (the artwork), piece (the product) | creation, output, result #01 | |
| edits | — | The **daily free allowance** ("5 free edits per day") |
| credits | tokens, coins | **Purchased** generations. Keep edits and credits distinct |
| bag | cart | Customer-facing copy only; legal pages are reviewed separately |
| your photo | reference image, input | |
| print-ready, made to order, heavyweight | archival, synthesized | Lead with the outcome; mention AI where it aids understanding or SEO |

## Claims we must not make

- **Environmental neutrality based on offsetting** — no "carbon neutral", "climate
  neutral" or similar. EU Directive 2024/825 (Empowering Consumers for the Green
  Transition) prohibits these claims. State verifiable facts instead (made to order,
  water-based inks, recycled packaging).
- **Guarantees broader than the Returns policy** — the guarantee covers print, fabric
  and fit problems within 30 days, not a change of mind. Never write "no questions
  asked" or "return any item".
- **Invented social proof** — no testimonials, ratings, review counts or order counts
  unless they come from real, verifiable data. Rendering is gated by
  `TRUST_SOCIAL_PROOF_ENABLED` in `src/shared/constants/trustMetrics.ts`.
- **Unqualified superlatives** — "best", "fastest", "only" need evidence.
