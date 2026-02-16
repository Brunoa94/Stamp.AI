import { Wand2, Sparkles } from "lucide-react";
import { colors } from "@/theme";

export function FooterBrand() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 group">
        <div className="p-1.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
          <Wand2 className="w-5 h-5 text-white animate-[wiggle_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center gap-1">
          <h2 className={`text-lg font-bold ${colors.textGradient}`}>
            AI Magic Studio
          </h2>
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        Transform your ideas into stunning designs with AI-powered creativity.
      </p>
    </div>
  );
}
