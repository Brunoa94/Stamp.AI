import { expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import { HomeLaunchOffersSection } from "./HomeLaunchOffersSection";
import { LaunchPromotionBanner } from "../components/LaunchPromotionBanner";
import { ProductPrice } from "@/shared/ui/ProductPrice";
import type { ProductCardData } from "../../lib/mappers/productCardMapper";
vi.mock("../components/HomeProductCard", () => ({ HomeProductCard: ({ product }: { product: ProductCardData }) => <div>{product.name}</div> }));
afterEach(cleanup);
const products = [{ name: "Regular", blueprintId: 1, isPromotional: false },
  { name: "Offer B", blueprintId: 2, isPromotional: true },
  { name: "Offer A", blueprintId: 3, isPromotional: true }] as ProductCardData[];
function wrap(children: React.ReactNode) {
  return render(<NextIntlClientProvider locale="en" messages={messages}>{children}</NextIntlClientProvider>);
}
it("shows only promotional inventory in input order and hides an empty section", () => {
  const { container } = wrap(<HomeLaunchOffersSection products={products} />);
  expect(screen.getByRole("heading", { name: "Launch offers" })).toBeVisible();
  expect(screen.queryByText("Regular")).toBeNull();
  expect(container.textContent).toBe("Launch offersOffer BOffer A");
  cleanup();
  expect(wrap(<HomeLaunchOffersSection products={[]} />).container.textContent).toBe("");
});
it("links the banner to launch offers and exposes accessible dual prices", () => {
  wrap(<><LaunchPromotionBanner /><ProductPrice priceCents={2000} regularPriceCents={3000} /></>);
  expect(screen.getByRole("link", { name: "Shop launch offers" })).toHaveAttribute("href", "/#launch-offers");
  expect(screen.getByText("Regular price")).toBeInTheDocument();
  expect(screen.getByText("Promotional price")).toBeInTheDocument();
  expect(screen.getByText("€30.00").tagName).toBe("DEL");
  expect(screen.getByText("€20.00")).toBeInTheDocument();
});
