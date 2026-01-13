// Main theme export file

export * from "./animations";
export * from "./colors";
export * from "./components";
export * from "./icons";

// Pre-built theme combinations with dark mode support
export const theme = {
  page: {
    background: "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 min-h-screen transition-colors duration-300",
    container: "container mx-auto px-4 py-8",
  },

  dashboard: {
    header: "text-center mb-12",
    title: "text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent my-8 animate-[fadeInUp_0.8s_ease-out]",
    subtitle: "text-xl text-gray-600 dark:text-gray-300 animate-[fadeInUp_0.8s_ease-out_0.2s_both]",
    grid: "grid md:grid-cols-2 gap-12",
  },

  upload: {
    section: "space-y-6",
    card: "bg-gradient-to-br from-purple-50/50 via-purple-100/40 to-pink-50/50 dark:from-gray-800/80 dark:via-purple-800/30 dark:to-pink-800/30 backdrop-blur-sm border border-purple-100 dark:border-purple-800/30 rounded-2xl p-8 shadow-xl shadow-purple-500/20 dark:shadow-purple-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20",
    title: "text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6",
  },

  prompt: {
    section: "space-y-6",
    card: "relative bg-transparent backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/20 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-blue-400 before:via-purple-400 before:to-pink-400 dark:before:from-blue-500 dark:before:via-purple-500 dark:before:to-pink-500 before:-z-10 after:content-[''] after:absolute after:inset-[2px] after:rounded-2xl after:bg-white/5 dark:after:bg-gray-900/80 after:-z-10",
    title: "text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent",
  },

  button: {
    submit: {
      base: "w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300",
      enabled: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 dark:hover:from-blue-700 dark:hover:via-purple-700 dark:hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-500/40 hover:scale-105 active:scale-95",
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