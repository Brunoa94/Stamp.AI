"use client";

import { footerTheme } from "@/theme/components";
import { FooterLinkSection } from "./footer/FooterLinkSection";
import { FooterConnect } from "./footer/FooterConnect";

const companyLinks = [
  { id: "footer-about", href: "/about", label: "About Us" },
  { id: "footer-contact", href: "/contact", label: "Contact" },
  { id: "footer-careers", href: "/careers", label: "Careers" },
];

const supportLinks = [
  { id: "footer-help", href: "/help", label: "Help Center" },
  { id: "footer-faq", href: "/faq", label: "FAQ" },
  { id: "footer-shipping", href: "/shipping", label: "Shipping Info" },
];

const legalLinks = [
  { id: "footer-privacy", href: "/privacy", label: "Privacy Policy" },
  { id: "footer-terms", href: "/terms", label: "Terms of Service" },
  { id: "footer-refunds", href: "/refunds", label: "Refund Policy" },
];

export function Footer() {
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
                  Stamp
                  <span
                    className="inline-block mx-0.5 w-2 h-2 rounded-full [background:linear-gradient(45deg,#7C3AED,#06B6D4,#FF8C42)] bg-size-[200%_200%] animate-[gradientPulse_3s_ease-in-out_infinite]"
                    aria-hidden="true"
                  />
                  AI
                </span>
              </div>
              <p className={footerTheme.missionText}>
                Empowering creators with AI-driven apparel design. High quality prints,
                delivered to your door.
              </p>
            </div>

            {/* Links - Right side */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <FooterLinkSection title="Company" links={companyLinks} />
              <FooterLinkSection title="Support" links={supportLinks} />
              <FooterLinkSection title="Legal" links={legalLinks} />
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
