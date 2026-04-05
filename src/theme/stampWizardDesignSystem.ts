export const stampWizardDesignSystem = {
  shell: {
    container:
      "max-w-5xl w-full md:mx-auto rounded-3xl md:rounded-2xl flex flex-col md:flex-row overflow-hidden border border-white/50 relative z-10 bg-linear-to-br from-[#7C3AED]/8 via-white/90 to-[#06B6D4]/10 backdrop-blur-xl shadow-[0_24px_48px_-18px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.5)]",
    normalHeight: "md:h-240",
    sizingHeight: "md:h-320",
    mainPanel:
      "flex-1 flex flex-col relative bg-white/30 overflow-y-auto border-l border-white/40",
  },

  sidebar: {
    root: "w-80 border-r border-white/50 bg-linear-to-b from-white/55 via-white/40 to-[#7C3AED]/8 flex flex-col min-h-[750px] backdrop-blur-md",
    title:
      "mb-10 border-b border-slate-200/80 pb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400 font-accent",
    infoBox:
      "rounded-xl border border-white/60 bg-linear-to-br from-[#7C3AED]/10 via-white/90 to-[#06B6D4]/10 p-6 shadow-sm backdrop-blur-sm",
    infoTitle: "mb-3 flex items-center gap-2 text-[#7C3AED]",
    infoDescription: "text-sm leading-relaxed text-slate-600 font-accent",
  },

  step: {
    container:
      "group flex cursor-pointer items-center gap-4 rounded-xl border p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
    active:
      "border-[#7C3AED]/35 bg-linear-to-r from-[#7C3AED]/14 via-white/80 to-[#06B6D4]/12 shadow-[0_12px_28px_-14px_rgba(124,58,237,0.45)]",
    inactive:
      "border-transparent bg-white/35 hover:border-[#7C3AED]/20 hover:bg-white/65",
    iconBox:
      "h-12 w-12 shrink-0 rounded-lg border flex items-center justify-center transition-all duration-300",
    iconActive:
      "border-[#7C3AED]/50 bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white shadow-[0_6px_16px_rgba(124,58,237,0.32)]",
    iconInactive:
      "border-white/50 bg-white/50 text-slate-400 group-hover:text-[#7C3AED] group-hover:border-[#7C3AED]/35",
    title: "font-heading text-xl tracking-wide transition-all duration-300",
    titleActive: "text-slate-900",
    titleInactive: "text-slate-400 group-hover:text-slate-900",
    description: "mt-0.5 text-xs font-accent font-medium",
    descriptionActive: "text-slate-500",
    descriptionInactive: "text-slate-400",
  },

  sectionHeader: {
    container: "relative flex items-center justify-between overflow-hidden px-12 py-12",
    bg:
      "pointer-events-none absolute inset-0 bg-linear-to-br from-[#7C3AED]/10 via-white/92 to-[#06B6D4]/10",
    stepBadge:
      "rounded-md border border-[#7C3AED]/20 bg-[#7C3AED]/8 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C3AED]",
    separator: "h-px w-12 bg-linear-to-r from-[#7C3AED]/50 to-transparent",
    title: "text-3xl font-bold tracking-tight text-slate-900",
    progressPrimary: "h-1 w-12 rounded-full bg-[#7C3AED]",
    progressSecondary: "h-1 w-2 rounded-full bg-[#06B6D4]/45",
    dotBase: "h-2.5 w-2.5 rounded-full transition-all duration-300",
    dotActive: "bg-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.4)]",
    dotInactive: "bg-slate-200",
  },

  content: {
    container: "flex-1 flex flex-col p-10",
    description: "mb-8 max-w-2xl text-lg text-slate-600",
    footer: "flex justify-end gap-4 border-t border-slate-100/90 px-10 py-6",
    backButton:
      "rounded-xl px-8 py-3 font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900",
    nextButtonBase:
      "flex items-center gap-2 rounded-xl px-8 py-3 font-bold transition-all",
    nextButtonEnabled:
      "bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/35",
    nextButtonDisabled: "cursor-not-allowed bg-slate-200 text-slate-400",
  },

  mobileNav: {
    root: "md:hidden shrink-0 border-b border-white/60 bg-linear-to-r from-[#7C3AED]/6 via-white/85 to-[#06B6D4]/6 backdrop-blur-md",
    button: "relative h-auto w-full rounded-none px-0 py-1 hover:bg-transparent",
    bubbleBase: "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300",
    bubbleActive:
      "bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white ring-4 ring-purple-100/70 shadow-lg shadow-purple-300/40",
    bubbleCompleted: "border border-[#7C3AED]/25 bg-[#7C3AED]/12 text-[#7C3AED]",
    bubbleIdle: "border border-slate-100 bg-white/80 text-slate-400",
    label: "text-sm font-heading uppercase tracking-wide whitespace-nowrap",
    labelActive: "text-[#7C3AED]",
    labelIdle: "text-slate-400",
    activeBar: "absolute -bottom-4 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-[#7C3AED] to-[#06B6D4]",
  },
} as const;
