export const navbarDesignSystem = {
  container: `relative z-50 w-full`,
  inner: `max-w-[1376px] mx-auto px-2 md:px-4 lg:px-8 pt-4 md:pt-6`,
  content: `h-[60px] md:h-[70px] rounded-full px-4 md:px-6 lg:px-10 flex items-center gap-2 md:gap-3 lg:gap-6 bg-white/55 dark:bg-slate-900/55 backdrop-blur-2xl border border-white/55 dark:border-white/15 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)]`,

  desktop: {
    base: `hidden md:block sticky top-0 w-full transition-all duration-500 ease-out`,
    scrolled: `translate-y-0`,
    transparent: `translate-y-0`,
    topAccent: `pointer-events-none absolute left-1/2 top-0 hidden h-1 w-[78%] -translate-x-1/2 rounded-b-full bg-linear-to-r from-fuchsia-300/70 via-cyan-200/70 to-emerald-200/70 blur-[1px] md:block`,
    brandSlot: `flex shrink-0 items-center justify-start`,
    centerSlot: `flex flex-1 items-center justify-center min-w-0`,
    actionsSlot: `flex shrink-0 items-center justify-end`,
  },

  brand: {
    link: `flex items-center gap-2 md:gap-3 group cursor-pointer`,
    text: `text-lg md:text-xl lg:text-2xl font-heading tracking-widest uppercase whitespace-nowrap`,
    dot: `inline-block mx-0.5 w-1.5 md:w-2 h-1.5 md:h-2 rounded-full [background:linear-gradient(45deg,#7C3AED,#06B6D4,#FF8C42)] [background-size:200%_200%] animate-[gradientPulse_3s_ease-in-out_infinite]`,
  },

  navigation: {
    container: `hidden md:flex items-center justify-center gap-3 md:gap-4 lg:gap-6 xl:gap-10`,
    link: {
      base: `relative whitespace-nowrap font-sans text-[11px] md:text-[12px] lg:text-[13px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full`,
      active: `text-black dark:text-white`,
      inactive: `text-black/65 hover:text-black dark:text-white/70 dark:hover:text-white`,
    },
    stampButton: `flex items-center justify-center text-center whitespace-nowrap h-[48px] lg:h-[52px] px-8! md:px-6 lg:px-10 rounded-full bg-linear-to-r from-[#a855f7] to-[#06b6d4] text-white font-heading text-sm md:text-base lg:text-lg uppercase tracking-wider shadow-[0_10px_15px_-3px_rgba(168,85,247,0.25),0_4px_6px_-4px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.03] hover:brightness-110 hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.3),0_8px_10px_-6px_rgba(6,182,212,0.3)]`,
    stampButtonActive: `drop-shadow-[0_0_14px_rgba(255,255,255,0.55)]`,
  },

  actions: {
    container: `flex items-center gap-1 md:gap-2 lg:gap-3`,
    unauthContainer: `flex items-center gap-1 md:gap-2`,
    loginButton: `h-8 md:h-10 rounded-full border border-black/15 bg-white/45 px-3 md:px-4 text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.1em] md:tracking-[0.12em] text-black/80 hover:bg-white/70 dark:border-white/20 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/20`,
    registerButton: `h-8 md:h-10 rounded-full border border-transparent px-3 md:px-4 text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.1em] md:tracking-[0.12em] text-black/65 hover:bg-white/40 hover:text-black dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white`,
    coinsBadge: `rounded-full border border-white/40 bg-white/35 px-2 md:px-3 py-1 md:py-1.5 text-amber-500 dark:border-white/20 dark:bg-white/10 text-sm`,
    themeButton: `relative h-8 w-8 md:h-10 md:w-10 rounded-full border border-transparent bg-transparent text-black/60 transition-all hover:bg-white/45 hover:text-black dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white`,
    cartButton: `relative h-8 w-8 md:h-10 md:w-10 rounded-full border border-black/10 bg-white/45 text-black/70 transition-all hover:bg-white/70 hover:text-black focus-visible:ring-2 focus-visible:ring-purple-500/40 dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white`,
    cartIcon: `h-4 w-4 md:h-5 md:w-5`,
    cartBadge: `absolute -right-1 -top-1 h-4 min-w-4 md:h-4.5 md:min-w-4.5 rounded-full border border-white/70 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 px-0.5 md:px-1 text-[9px] md:text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(139,92,246,0.35)] flex items-center justify-center`,
    divider: `mx-0.5 md:mx-1 h-6 md:h-8 w-px bg-black/10 dark:bg-white/15`,
    profileButton: `group flex items-center rounded-full border border-white/35 bg-white/45 p-0.5 md:p-1 pr-2 md:pr-3 transition-all hover:bg-white/65 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20`,
    profileIcon: `h-6 w-6 md:h-8 md:w-8 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center border border-white/80 shadow-sm`,
    profileMeta: `ml-1.5 md:ml-2 flex flex-col leading-none`,
    profileAmount: `font-sans text-xs md:text-sm font-bold text-black dark:text-white`,
    signOutButton: `h-auto flex-col gap-0.5 px-1.5 md:px-2 py-1 text-[10px] md:text-xs text-black/45 hover:text-red-500 dark:text-white/45 dark:hover:text-red-400`,
  },

  mobileHeader: {
    wrapper: `px-3 pt-3`,
    row: `h-[60px] px-3 flex items-center justify-between gap-2 rounded-full bg-white/55 dark:bg-slate-900/55 backdrop-blur-2xl border border-white/55 dark:border-white/15 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] px-8`,
    stampCta: `flex items-center justify-center gap-2 text-base`,
    cartButton: `relative w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-300 rounded-full hover:bg-white/50`,
    badge: `absolute -top-0.5 -right-0.5 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center`,
    menuButton: `w-9 h-9 rounded-full active:scale-95 transition-transform shrink-0 hover:bg-white/50`,
  },

  mobileSidebar: {
    root: `fixed inset-0 z-[100]`,
    backdrop: `absolute inset-0 bg-slate-900/40 backdrop-blur-sm`,
    panel: `absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-[slideInRight_0.3s_cubic-bezier(0.4,0,0.2,1)]`,
    panelHeader: `flex justify-between items-center p-6 border-b border-slate-100 dark:border-gray-800`,
    closeButton: `w-10 h-10 rounded-full text-slate-400 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100`,
    nav: `flex-1 overflow-y-auto px-6 py-8 space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`,
    footer: `p-6 border-t border-slate-100 dark:border-gray-800`,
    themeToggle: {
      button: `w-full flex items-center justify-between py-4 px-4 text-slate-600 dark:text-slate-300 active:bg-slate-50 rounded-xl transition-colors`,
      switchTrack: `w-10 h-5 rounded-full relative transition-colors duration-300`,
      switchThumb: `absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300`,
    },
  },
} as const;
