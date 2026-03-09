"use client";

import { FooterBrand } from "./footer/FooterBrand";
import { FooterMission } from "./footer/FooterMission";
import { FooterLinkSection } from "./footer/FooterLinkSection";
import { FooterConnect } from "./footer/FooterConnect";
import { footerTheme } from "@/theme/components";

const platformLinks = [
  { id: "footer-link-how", href: "/stamp", label: "How it Works" },
  { id: "footer-link-showcase", href: "/dashboard", label: "Showcase" },
  { id: "footer-link-pricing", href: "/orders", label: "Bulk Pricing" },
];

const companyLinks = [
  { id: "footer-link-about", href: "/profile", label: "About Us" },
  { id: "footer-link-blog", href: "/dashboard", label: "Blog" },
  { id: "footer-link-careers", href: "/dashboard", label: "Careers" },
];

const supportLinks = [
  { id: "footer-link-help", href: "/help", label: "Help Center" },
  { id: "footer-link-terms", href: "/terms", label: "Terms of Service" },
  { id: "footer-link-privacy", href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer
      id="global-footer"
      className={footerTheme.container}
      style={{ viewTransitionName: "footer" }}
    >
      {/* Glass effect gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-white/40 to-white/20 dark:from-gray-900/50 dark:to-gray-900/20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Frosted glass texture */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
        aria-hidden="true"
      />

      {/* Subtle shimmer effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-cyan-500/8 dark:from-purple-500/12 dark:to-cyan-500/12 pointer-events-none animate-pulse"
        style={{ animationDuration: "8s" }}
        aria-hidden="true"
      />

      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent dark:via-purple-500/70 pointer-events-none"
        aria-hidden="true"
      />

      {/* Secondary accent line */}
      <div
        className="absolute top-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent dark:via-cyan-500/40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Side accent blobs */}
      <div
        className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className={footerTheme.inner}>
        <FooterBrand />

        {/* Decorative gradient bar */}
        <div className="flex justify-center mb-12" aria-hidden="true">
          <div className="h-1.5 w-24 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-lg shadow-purple-500/20" />
        </div>

        <div className={footerTheme.grid}>
          <FooterMission />
          <FooterLinkSection title="Platform" links={platformLinks} />
          <FooterLinkSection title="Company" links={companyLinks} />
          <FooterLinkSection title="Support" links={supportLinks} />
        </div>

        <FooterConnect />
      </div>
    </footer>
  );
}

export default Footer;
