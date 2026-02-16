"use client";

import {
  Home,
  HelpCircle,
  Store,
  Package,
  ShoppingCart,
  Mail,
  Shield,
  FileText,
} from "lucide-react";
import {
  FooterBrand,
  FooterLinkSection,
  FooterConnect,
  FooterBottom,
} from "./footer/index";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Store },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

const supportLinks = [
  { href: "/help", label: "Help Center", icon: HelpCircle },
  { href: "/contact", label: "Contact Us", icon: Mail },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms of Service", icon: FileText },
];

export function Footer() {
  return (
    <footer className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-purple-200 dark:border-purple-700 transition-all duration-300 mt-16">
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-6 max-w-[95%] mx-auto">
          <FooterBrand />
          <FooterLinkSection
            title="Quick Links"
            icon={Home}
            links={quickLinks}
          />
          <FooterLinkSection
            title="Support"
            icon={HelpCircle}
            links={supportLinks}
          />
          <FooterConnect />
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
}

export default Footer;
