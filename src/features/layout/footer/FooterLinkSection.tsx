import Link from "next/link";
import { footerTheme } from "@/theme/components";

interface FooterLink {
  id: string;
  href: string;
  label: string;
}

interface FooterLinkSectionProps {
  title: string;
  links: FooterLink[];
}

export function FooterLinkSection({ title, links }: FooterLinkSectionProps) {
  return (
    <div>
      <h3 className={footerTheme.sectionTitle}>{title}</h3>
      <ul className={footerTheme.linkList}>
        {links.map((link) => (
          <li key={link.id}>
            <Link id={link.id} href={link.href} className={footerTheme.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
