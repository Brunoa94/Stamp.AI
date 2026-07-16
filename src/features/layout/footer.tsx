"use client";

import { useTranslations } from "next-intl";
import { footerTheme } from "@/theme/components";
import { FooterLinkSection } from "./footer/FooterLinkSection";
import { FooterConnect } from "./footer/FooterConnect";

const companyLinks = [
  { id: "footer-about", href: "/about" },
  { id: "footer-contact", href: "/contact" },
  { id: "footer-careers", href: "/careers" },
];

const supportLinks = [
  { id: "footer-help", href: "/help" },
  { id: "footer-faq", href: "/faq" },
  { id: "footer-shipping", href: "/shipping" },
];

const legalLinks = [
  { id: "footer-privacy", href: "/privacy" },
  { id: "footer-terms", href: "/terms" },
  { id: "footer-refunds", href: "/refunds" },
];

export function Footer() {
  const t = useTranslations("layout.footer");

  const withLabels = (links: { id: string; href: string }[]) =>
    links.map((link) => ({ ...link, label: t(`links.${link.id}`) }));

  return (
    <footer className="relative mt-24 w-full pb-8">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-t border-white/40 dark:border-slate-700/40 rounded-t-2xl shadow-lg shadow-purple-500/5">
        <div className={footerTheme.inner}>
          {/* Top row: Brand on left, Links on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 pb-8">
            {/* Brand & Mission - Left side */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-start">
                <span className="text-2xl font-heading tracking-widest uppercase text-slate-900 dark:text-white">
                  {t.rich("brand", {
                    dot: () => (
                      <span
                        className="inline-block mx-0.5 w-2 h-2 rounded-full [background:linear-gradient(45deg,#7C3AED,#06B6D4,#FF8C42)] bg-size-[200%_200%] animate-[gradientPulse_3s_ease-in-out_infinite]"
                        aria-hidden="true"
                      />
                    ),
                  })}
                </span>
              </div>
              <p className={footerTheme.missionText}>{t("mission")}</p>
            </div>

            {/* Links - Right side */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <FooterLinkSection
                title={t("sections.company")}
                links={withLabels(companyLinks)}
              />
              <FooterLinkSection
                title={t("sections.support")}
                links={withLabels(supportLinks)}
              />
              <FooterLinkSection
                title={t("sections.legal")}
                links={withLabels(legalLinks)}
              />
            </div>
          </div>

          {/* Bottom with Copyright and Social */}
          <FooterConnect />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
