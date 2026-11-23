"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Paragraph } from "@/features/ui/paragraph";
import { parseTrackOrderRequest } from "@/lib/orders/trackOrder";
import type { TrackOrderErrorT, TrackOrderRequestT } from "@/shared/types/trackOrder";

/**
 * TrackOrderForm
 *
 * Order number + email lookup for guests. Checks the input's shape before
 * submitting and shows the lookup's refusal (unknown order, too many tries)
 * under the fields.
 */

interface PropsI {
  initialOrderNumber: string;
  isLooking: boolean;
  error: TrackOrderErrorT | null;
  onSubmit: (request: TrackOrderRequestT) => void;
}

export function TrackOrderForm({ initialOrderNumber, isLooking, error, onSubmit }: PropsI) {
  const t = useTranslations("orders.track");
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const request = parseTrackOrderRequest({ orderNumber, email });
    setIsInvalid(request === null);
    if (request) onSubmit(request);
  };

  const shownError: TrackOrderErrorT | null = isInvalid ? "invalidRequest" : error;
  // Only these say the input is wrong; a rate limit or an outage is not the fields' fault
  const areFieldsInvalid = shownError === "invalidRequest" || shownError === "notFound";
  const errorId = shownError ? "track-order-error" : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-lg border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="track-order-number">{t("form.orderNumber")}</Label>
          <Input
            id="track-order-number"
            name="orderNumber"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={t("form.orderNumberPlaceholder")}
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            aria-invalid={areFieldsInvalid}
            aria-describedby={errorId}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="track-order-email">{t("form.email")}</Label>
          <Input
            id="track-order-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("form.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={areFieldsInvalid}
            aria-describedby={errorId}
            required
          />
        </div>
      </div>

      {shownError && (
        <Paragraph unstyled id="track-order-error" role="alert" className="text-sm text-(--color-stamp-error)">
          {t(`errors.${shownError}`)}
        </Paragraph>
      )}

      <Button type="submit" variant="primary" disabled={isLooking} className="w-full gap-2 md:w-auto">
        {isLooking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isLooking ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
