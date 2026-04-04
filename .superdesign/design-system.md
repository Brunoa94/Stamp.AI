# Design System (SuperDesign)

## Product Context

- Product: Imaginary Builder AI — AI-powered custom tee design builder.
- Key flows: Upload artwork → AI synthesis → Final review → Fabric & sizing → Add to cart.
- UI personality: Retro-futurist, premium, playful, high-contrast gradients, glassmorphism accents.

## Typography

- Body: Poppins (`--font-poppins`), fallback sans-serif.
- Heading: Bebas Neue (`--font-heading`) for display headings.
- Accent serif: Zodiak ("Zodiak", serif) for highlights and italic callouts.
- Supporting: Geist Sans/Mono for system text and monospace tokens.

## Color System

Defined via CSS variables in `src/app/globals.css` (OKLCH palette).

- Background: `--background` (#f8f8fa), Dark: `oklch(0.141 0.005 285.823)`
- Foreground: `--foreground`
- Primary: `--primary` with `--primary-foreground`
- Secondary: `--secondary` with `--secondary-foreground`
- Accent: `--accent` with `--accent-foreground`
- Muted: `--muted` with `--muted-foreground`
- Border/Input/Ring: `--border`, `--input`, `--ring`
- Destructive: `--destructive`
- Sidebar tokens: `--sidebar*`

Gradient motifs:

- Purple/violet gradients: `from-purple-500` → `to-pink-500` and `from-[#7C3AED]` → `#4F46E5`
- Slate/gray gradients for neutrals.

## Spacing & Radius

- Global radius: `--radius: 0.625rem`.
- Derived radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`.
- Layout spacing uses Tailwind spacing scale with generous padding for cards and sections.

## Shadows & Glass

- Glass effect utility: `.glass-card` with blur, semi-transparent white, soft shadow.
- Shadows: subtle layered shadows on cards and call-to-action buttons.

## Motion

- Soft transitions: `.transition-soft` (cubic-bezier 0.4,0,0.2,1).
- Animations: bounceIn, fadeIn, fadeInUp, fadeInScale, glow, wiggle, float, shimmer.

## Component Style Patterns

- Buttons: gradient primary CTA, elevated shadow, hover translate and glow.
- Cards: rounded-2xl, soft borders, glass blur.
- Inputs: subtle borders, focus ring using `--ring`.
- Wizard layout: split sidebar + main panel with glass background.

## Layout Structure

- Global layout: top Navbar (fixed), main content with top padding, Footer.
- Wizard: `WizardSidebar` + main content sections; step header and action footer on wizard pages.

## Accessibility

- Use design-system components from `src/features/ui/`.
- Focus ring applied via Tailwind and CSS variables.

## Reference Files

- Tokens & CSS: `src/app/globals.css`
- Theme helpers: `src/theme/*.ts`
- UI components: `src/features/ui/*`
