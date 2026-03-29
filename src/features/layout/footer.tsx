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
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-purple-500/50 to-transparent dark:via-purple-500/70 pointer-events-none"
        aria-hidden="true"
      />

      {/* Secondary accent line */}
      <div
        className="absolute top-0.5 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400/30 to-transparent dark:via-cyan-500/40 pointer-events-none"
        aria-hidden="true"
      />

      <div className={footerTheme.inner}>
        <FooterBrand />

        {/* Decorative gradient bar */}
        <div className="flex justify-center mb-12" aria-hidden="true">
          <div className="h-1.5 w-24 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-lg shadow-purple-500/20" />
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
