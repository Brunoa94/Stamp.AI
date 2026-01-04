import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import { colors } from "@/theme";

export function NavbarBrand() {
  return (
    <div className="flex items-center">
      <Link href="/" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
          <Wand2 className="w-6 h-6 text-white animate-[wiggle_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center gap-1">
          <h1 className={`text-2xl font-bold ${colors.textGradient} transition-all duration-300`}>
            AI Magic Studio
          </h1>
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>
      </Link>
    </div>
  );
}