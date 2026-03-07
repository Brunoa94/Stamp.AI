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
      <div className={footerTheme.inner}>
        <FooterBrand />

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
