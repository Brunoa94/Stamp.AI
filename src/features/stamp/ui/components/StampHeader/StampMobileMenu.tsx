"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/features/ui/separator";
import { isStampNavItemActive } from "@/features/stamp/lib/helpers/stampNavHelpers";
import {
  stampMobileMenuVariants,
  stampMobileNavLinkVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";
import type { StampNavItemT } from "@/features/stamp/lib/types/stampNavTypes";
import { StampHeaderCta } from "./StampHeaderCta";
import { StampMobileAccount } from "./StampMobileAccount";

interface PropsI {
  id: string;
  open: boolean;
  items: StampNavItemT[];
  pathname: string;
  isRegistered: boolean;
  onNavigate: () => void;
}

/**
 * Floating card under the header pill, below `lg`. While closed it is
 * `invisible`, so its links leave the tab order and accessibility tree.
 */
export function StampMobileMenu({
  id,
  open,
  items,
  pathname,
  isRegistered,
  onNavigate,
}: PropsI) {
  const t = useTranslations("stamp.header");
  const profileActive = isStampNavItemActive(pathname, "/profile");

  return (
    <div id={id} className={stampMobileMenuVariants({ open })}>
      <nav aria-label={t("mobileNavAria")} className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isStampNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={stampMobileNavLinkVariants({ active })}
            >
              {t(item.labelKey)}
              <ArrowUpRight className="size-5 opacity-40" aria-hidden />
            </Link>
          );
        })}
        {isRegistered && (
          <Link
            href="/profile"
            onClick={onNavigate}
            aria-label={t("profileAria")}
            aria-current={profileActive ? "page" : undefined}
            className={stampMobileNavLinkVariants({ active: profileActive })}
          >
            {t("profile")}
            <ArrowUpRight className="size-5 opacity-40" aria-hidden />
          </Link>
        )}
      </nav>

      <Separator className="my-3 bg-(--color-stamp-divider)" />

      <div className="flex flex-col gap-2 p-1">
        <StampHeaderCta size="lg" onNavigate={onNavigate} />
        <StampMobileAccount isRegistered={isRegistered} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
