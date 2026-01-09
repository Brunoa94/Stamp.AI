// Animation utilities and keyframe definitions

export const animations = {
  // Bounce animations
  bounce: "animate-bounce",
  bounceIn: "animate-[bounceIn_0.6s_ease-out]",

  // Fade animations
  fadeIn: "animate-[fadeIn_0.6s_ease-out]",
  fadeInUp: "animate-[fadeInUp_0.8s_ease-out]",
  fadeInScale: "animate-[fadeInScale_0.5s_ease-out]",

  // Pulse and glow
  pulse: "animate-pulse",
  glow: "animate-[glow_2s_ease-in-out_infinite_alternate]",

  // Shake and wiggle
  shake: "animate-[shake_0.5s_ease-in-out]",
  wiggle: "animate-[wiggle_0.8s_ease-in-out_infinite]",

  // Floating
  float: "animate-[float_3s_ease-in-out_infinite]",

  // Scale animations
  scaleIn: "animate-[scaleIn_0.3s_ease-out]",
  scaleHover: "hover:animate-[scaleHover_0.2s_ease-out]",

  // Slide animations
  slideInLeft: "animate-[slideInLeft_0.6s_ease-out]",
  slideInRight: "animate-[slideInRight_0.6s_ease-out]",

  // Rainbow animations
  rainbow: "animate-[rainbow_3s_linear_infinite]",
  rainbowText: "bg-linear-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-[rainbow_3s_linear_infinite]",
} as const;

export const animationClasses = {
  // Container animations
  cardHover: "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25",
  buttonHover: "transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95",

  // Loading states
  shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent",

  // Interactive elements
  clickable: "cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95",

  // Borders and outlines
  glowBorder: "border border-transparent bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-border",

} as const;

// CSS keyframes to be added to globals.css
export const keyframes = `
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
    50% { opacity: 1; transform: scale(1.05) rotate(5deg); }
    70% { transform: scale(0.9) rotate(-2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes glow {
    from { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    to { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(236, 72, 153, 0.3); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes scaleIn {
    from { transform: scale(0) rotate(180deg); }
    to { transform: scale(1) rotate(0deg); }
  }

  @keyframes scaleHover {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes rainbow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
`;