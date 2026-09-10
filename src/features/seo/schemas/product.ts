import { SITE_URL, SITE_NAME } from "../config/site";
import type { ProductData } from "./types";

export function productSchema(product: ProductData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.sku && { sku: product.sku }),
    brand: {
      "@type": "Brand",
      name: product.brand ?? SITE_NAME,
    },
    ...(product.price && {
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.priceCurrency ?? "USD",
        availability: `https://schema.org/${product.availability ?? "InStock"}`,
        ...(product.url && { url: product.url }),
        seller: {
          "@id": `${SITE_URL}/#organization`,
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: product.priceCurrency ?? "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 2,
              maxValue: 3,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 3,
              maxValue: 7,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 30,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    }),
  };
}
