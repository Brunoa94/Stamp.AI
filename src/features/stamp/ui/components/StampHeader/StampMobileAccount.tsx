"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Login } from "@/features/auth/ui/components/Login";
import { Register } from "@/features/auth/ui/components/Register";
import { useLogout } from "@/shared/queries/authQueries";
import { stampNavAuthLinkVariants } from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  isRegistered: boolean;
  onNavigate: () => void;
}

/** Full-width account buttons at the foot of the mobile menu. */
export function StampMobileAccount({ isRegistered, onNavigate }: PropsI) {
  const t = useTranslations("stamp.header");
  const logoutMutation = useLogout();

  if (!isRegistered) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Login className={stampNavAuthLinkVariants({ emphasis: "outline" })}>
          {t("signIn")}
        </Login>
        <Register className={stampNavAuthLinkVariants({ emphasis: "outline" })}>
          {t("signUp")}
        </Register>
      </div>
    );
  }

  return (
    <Button
      variant="unstyled"
      onClick={() => {
        logoutMutation.mutate();
        onNavigate();
      }}
      disabled={logoutMutation.isPending}
      aria-label={t("logoutAria")}
      className={stampNavAuthLinkVariants({ emphasis: "outline" })}
    >
      {t("logout")}
    </Button>
  );
}
