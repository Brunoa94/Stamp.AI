/**
 * DashboardProfileSection
 *
 * Profile card: avatar with verified mark, display name, email and a
 * link to the profile settings page.
 */

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, UserRound } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { UserI } from "@/types/auth";
import {
  getAvatarUrl,
  getDisplayName,
  isEmailVerified,
} from "../../lib/helpers/userPresentation";
import { DashboardCard } from "../components/DashboardCard";

interface DashboardProfileSectionPropsI {
  user?: UserI | null;
}

export function DashboardProfileSection({
  user,
}: DashboardProfileSectionPropsI) {
  const verified = isEmailVerified(user);

  return (
    <DashboardCard
      label="User profile"
      icon={<UserRound className="h-4 w-4 text-(--color-stamp-taupe)" />}
    >
      <div className="flex items-center gap-6">
        <div className="relative h-20 w-20 flex-none border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
          <Image
            src={getAvatarUrl(user)}
            alt={`${getDisplayName(user)} avatar`}
            width={80}
            height={80}
            unoptimized
            className="h-full w-full object-cover"
          />
          {verified && (
            <Span
              unstyled
              className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center bg-(--color-stamp-gold) text-(--color-stamp-chocolate)"
              title="Verified account"
            >
              <BadgeCheck className="h-4 w-4" aria-hidden />
              <Span unstyled className="sr-only">
                Verified account
              </Span>
            </Span>
          )}
        </div>
        <div className="min-w-0">
          <Heading as="h2" variant="card" className="truncate">
            {getDisplayName(user)}
          </Heading>
          <Paragraph
            variant="quote"
            className="mt-1 truncate text-(--color-stamp-taupe)"
          >
            {user?.email ?? ""}
          </Paragraph>
        </div>
      </div>
      <Button asChild variant="secondary-brown" className="mt-8 w-full">
        <Link href="/profile">Edit profile</Link>
      </Button>
    </DashboardCard>
  );
}
