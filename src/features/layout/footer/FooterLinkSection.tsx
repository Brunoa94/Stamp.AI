import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FooterLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  title: string;
  icon: LucideIcon;
  links: FooterLink[];
}

export function FooterLinkSection({ title, icon: Icon, links }: Props) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-purple-500" />
        {title}
      </h3>
      <ul className="space-y-1.5">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex items-center gap-2 group py-1 px-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <LinkIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                <span className="font-medium">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
