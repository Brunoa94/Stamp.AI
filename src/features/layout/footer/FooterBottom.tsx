import { useTranslations } from "next-intl";
import { Heart, Shield } from "lucide-react";

export function FooterBottom() {
  const t = useTranslations("layout.footerBottom");
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-4 border-t border-purple-200 dark:border-purple-800/50 max-w-[95%] mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
          {t.rich("copyright", {
            year: currentYear,
            heart: () => (
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            ),
          })}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700">
            <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              {t("securePrivate")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
