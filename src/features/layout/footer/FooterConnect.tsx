import { Sparkles, Mail } from "lucide-react";

export function FooterConnect() {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        Connect
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
        Get in touch with us
      </p>
      <div className="flex gap-2">
        <a
          href="mailto:hello@aimagicstudio.com"
          className="p-2 rounded-lg bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 border border-purple-200 dark:border-purple-700 transition-all duration-200 hover:scale-110 hover:shadow-md hover:shadow-purple-500/20"
          aria-label="Email us"
        >
          <Mail className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </a>
      </div>
    </div>
  );
}
