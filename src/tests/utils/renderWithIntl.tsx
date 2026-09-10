import type { ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";

/**
 * renderWithIntl
 *
 * Testing-library render wrapped in NextIntlClientProvider with the real
 * English catalog, so components using useTranslations render actual copy.
 */
export function renderWithIntl(ui: ReactElement): RenderResult {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}
