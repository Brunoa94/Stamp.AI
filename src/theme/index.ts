// Main theme export file

export * from "./animations";
export * from "./colors";
export * from "./components";

// Pre-built theme combinations
export const theme = {
  page: {
    background: "bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen",
    container: "container mx-auto px-4 py-8",
  },

  dashboard: {
    header: "text-center mb-12",
    title: "text-5xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent my-8 animate-[fadeInUp_0.8s_ease-out]",
    subtitle: "text-xl text-gray-600 animate-[fadeInUp_0.8s_ease-out_0.2s_both]",
    grid: "grid md:grid-cols-2 gap-12",
  },

  upload: {
    section: "space-y-6",
    card: "bg-linear-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 shadow-xl shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30",
    title: "text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6",
  },

  prompt: {
    section: "space-y-6",
    card: "bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30",
    title: "text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
  },

  button: {
    submit: {
      base: "w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300",
      enabled: "bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95",
      disabled: "bg-gray-200 text-gray-400 cursor-not-allowed"
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