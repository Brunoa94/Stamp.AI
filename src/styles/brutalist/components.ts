/**
 * Brutalist Component Theme Classes
 *
 * Reusable component styling for the brutalist design system
 */

export const brutalistComponents = {
  // Product card
  productCard: {
    container: "group cursor-pointer",
    imageWrapper: "aspect-[3/4] bg-white border border-ink overflow-hidden relative mb-4",
    image: "w-full h-full object-cover grayscale-hover",
    badge: "absolute bottom-4 left-4 bg-white px-2 py-1 text-[8px] font-bold tracking-widest border border-ink uppercase",
    content: "flex justify-between items-start",
    title: "font-anton text-lg uppercase leading-tight",
    price: "font-mono font-bold",
    specs: "text-[10px] opacity-50 font-bold tracking-widest uppercase mt-1",
  },

  // Process card (6-step grid)
  processCard: {
    container: "bg-ink text-white border border-white/5 group p-10 min-h-[300px] flex flex-col justify-between transition-colors",
    number: "font-anton text-4xl opacity-20 group-hover:opacity-100 transition-opacity",
    content: "relative z-10",
    title: "font-anton text-3xl mb-3 uppercase tracking-tight",
    description: "text-sm leading-relaxed opacity-80 uppercase",
  },

  // Value/About card
  valueCard: {
    container: "bg-white border border-ink p-8 shadow-[8px_8px_0px_rgba(10,10,10,1)] hover:-translate-y-1 transition-transform",
    icon: "text-3xl mb-4",
    title: "font-anton text-2xl uppercase mb-2",
    description: "text-sm opacity-70 uppercase tracking-tight",
  },

  // Testimonial/Review card
  testimonialCard: {
    gradientBorder: "cta-gradient-border group min-h-[320px] w-full flex",
    container: "bg-ink p-10 flex flex-col justify-between w-full h-full relative",
    header: "flex justify-between items-start",
    stars: "flex text-brandOrange text-sm",
    platformIcon: "text-2xl opacity-40 group-hover:opacity-100 transition-opacity",
    quote: "text-base italic my-8 opacity-80 leading-relaxed font-light",
    footer: "flex justify-between items-end border-t border-white/10 pt-6",
    author: "font-anton text-xl tracking-tight uppercase group-hover:text-brandCyan transition-colors",
    meta: "text-[9px] opacity-30 uppercase tracking-[0.3em] mt-1",
    helpful: "flex items-center gap-2 bg-white/5 px-3 py-1 border border-white/10 group-hover:border-brandCyan/30 transition-colors",
  },

  // FAQ accordion
  faqAccordion: {
    details: "group border border-ink/10 p-8 transition-all duration-300 hover:border-brandPurple/50 open:bg-concrete/50",
    summary: "flex justify-between items-center cursor-pointer list-none font-anton text-2xl uppercase tracking-tight",
    icon: "group-open:-rotate-90 transition-transform text-3xl",
    content: "mt-8 text-xs opacity-60 leading-loose uppercase tracking-widest border-t border-ink/10 pt-6",
  },

  // Section header
  sectionHeader: {
    eyebrow: "text-xs font-bold tracking-widest uppercase block mb-4",
    title: "font-anton text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-none uppercase tracking-tighter",
    subtitle: "text-xs tracking-widest font-bold opacity-30 uppercase",
  },

  // CTA buttons
  cta: {
    primary: "px-12 py-6 bg-gradient-to-r from-brandPurple to-brandCyan font-anton text-xl uppercase tracking-widest hover:scale-105 transition-transform text-center text-white",
    secondary: "px-12 py-6 border-2 border-white font-anton text-xl uppercase tracking-widest hover:bg-white hover:text-ink transition-all text-center",
    stampIt: "cta-gradient-border bg-ink px-12 py-3.5 font-anton text-xl tracking-widest uppercase hover:scale-110 transition-all duration-300 rounded-none shadow-[8px_8px_0px_rgba(10,10,10,0.1)] text-white",
  },
} as const;
