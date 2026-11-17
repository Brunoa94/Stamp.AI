"use client";

import type { Ref } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { stampNavIconButtonVariants } from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  open: boolean;
  controlsId: string;
  /** Lets the header return focus here when Escape closes the menu. */
  buttonRef: Ref<HTMLButtonElement>;
  onToggle: () => void;
}

/** Hamburger / close button for the mobile menu, below `lg`. */
export function StampMenuToggle({ open, controlsId, buttonRef, onToggle }: PropsI) {
  const t = useTranslations("stamp.header");
  const Icon = open ? X : Menu;

  return (
    <Button
      ref={buttonRef}
      variant="unstyled"
      onClick={onToggle}
      aria-label={open ? t("closeMenu") : t("openMenu")}
      aria-expanded={open}
      aria-controls={controlsId}
      className={cn(stampNavIconButtonVariants(), "lg:hidden")}
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
    </Button>
  );
}
