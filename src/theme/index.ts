// Main theme export file

export * from "./animations";
export * from "./colors";
export * from "./components";
export * from "./icons";
export * from "./shadows";

// Pre-built theme combinations with dark mode support
export const theme = {
  page: {
    background: "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900/20 dark:to-gray-900/20 min-h-screen transition-colors duration-300",
    container: "grow flex flex-col pb-24 px-6 relative max-w-7xl mx-auto w-full pt-4",
  },

  dashboard: {
    header: "text-center mb-12",
    title: "h-14 text-5xl font-bold bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent animate-[fadeInUp_0.8s_ease-out]",
    subtitle: "text-xl text-gray-600 dark:text-gray-300 animate-[fadeInUp_0.8s_ease-out_0.2s_both]",
    grid: "grid md:grid-cols-2 gap-12",
  },

  upload: {
    section: "space-y-6",
    card: "bg-gradient-to-br from-gray-50/50 via-slate-100/40 to-gray-100/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-slate-800/30 rounded-2xl p-8 shadow-xl shadow-slate-500/20 dark:shadow-slate-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/30 dark:hover:shadow-gray-500/20",
    title: "text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 dark:from-slate-400 dark:to-gray-400 bg-clip-text text-transparent mb-6",
  },

  prompt: {
    section: "space-y-6",
    card: "relative bg-transparent backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-500/20 dark:shadow-slate-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/30 dark:hover:shadow-gray-500/20 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-slate-400 before:via-gray-400 before:to-slate-500 dark:before:from-slate-500 dark:before:via-gray-500 dark:before:to-slate-600 before:-z-10 after:content-[''] after:absolute after:inset-[2px] after:rounded-2xl after:bg-white/5 dark:after:bg-gray-900/80 after:-z-10",
    title: "text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 dark:from-slate-400 dark:to-gray-400 bg-clip-text text-transparent",
  },

  button: {
    submit: {
      base: "w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300",
      enabled: "bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 hover:from-slate-700 hover:via-gray-700 hover:to-slate-800 dark:from-slate-600 dark:via-gray-600 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:via-gray-700 dark:hover:to-slate-800 text-white shadow-lg hover:shadow-xl hover:shadow-slate-500/30 dark:hover:shadow-slate-500/40 hover:scale-105 active:scale-95",
      disabled: "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
    }
  },

  animations: {
    slideInLeft: "animate-[slideInLeft_0.6s_ease-out]",
    slideInRight: "animate-[slideInRight_0.6s_ease-out]",
    bounceIn: "animate-[bounceIn_0.6s_ease-out]",
    fadeIn: "animate-[fadeIn_0.6s_ease-out]",
    float: "animate-[float_3s_ease-in-out_infinite]",
  }
} as const;