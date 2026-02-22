"use client";

import PaymentForm from "@/features/checkout/paymentForm/PaymentForm";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { componentThemes } from "@/theme/components";
import { useMemo } from "react";
import type { PrintifyLineItem } from "@/types/printifyOrder";

/**
 * Convert cart items to Printify line items format
 *
 * Two scenarios:
 * 1. Existing Printify product: Use product_id + variant_id (NO print_provider_id)
 * 2. Custom on-the-fly product: Use blueprint_id + print_provider_id + variant_id + print_areas
 */
function buildPrintifyLineItems(cartItems: any[]): PrintifyLineItem[] {
  console.log("🔨 Building Printify line items from cart items...");

  const lineItems = cartItems.map((item, index) => {
    console.log(`\n--- Processing cart item ${index} ---`);
    console.log("Full cart item:", JSON.stringify(item, null, 2));

    // Get product data from the cart item
    const product = item.product;

    if (!product && item.product_id) {
      // Product ID exists but wasn't loaded - it might be a Printify product not in our database
      console.warn(
        `⚠️ Cart item ${index}: Has product_id "${item.product_id}" but product data wasn't loaded`,
      );
      console.log(
        "This is likely a Printify product that hasn't been saved to the database yet",
      );
      console.log("Cart item:", item);

      // Use the Printify product_id directly for existing Printify products
      console.log(`✅ Item ${index}: Using Printify product ID directly`);
      return {
        product_id: item.product_id,
        variant_id: parseInt(item.variant_id) || 0,
        quantity: item.quantity || 1,
      };
    }

    if (!product) {
      console.warn(
        `⚠️ Cart item ${index} has no product reference - custom product without database record`,
      );
      console.log("Cart item data:", {
        product_id: item.product_id,
        product_name: item.product_name,
        variant_id: item.variant_id,
        custom_image_url: item.custom_image_url,
      });

      // Cannot create Printify order without blueprint_id, print_provider_id, print_areas
      console.error(
        `❌ Cart item ${index}: Cannot create Printify order - missing Printify product data`,
      );
      console.error(
        `To fix: Save Printify products to the database when they're created`,
      );
      return null;
    }

    console.log(`Product data for item ${index}:`, {
      id: product.id,
      name: product.name,
      blueprint_id: product.blueprint_id,
      print_provider_id: product.print_provider_id,
      has_print_areas: !!product.print_areas,
    });

    const lineItem: PrintifyLineItem = {
      variant_id: parseInt(item.variant_id) || 0,
      quantity: item.quantity || 1,
    };

    // Check if this is a custom product (has blueprint_id AND print_provider_id)
    // For custom products, we need BOTH blueprint_id and print_provider_id
    if (product.blueprint_id && product.print_provider_id) {
      console.log(`✅ Item ${index}: Custom product with blueprint`);
      lineItem.blueprint_id = product.blueprint_id;
      lineItem.print_provider_id = product.print_provider_id;

      // Add print areas if available
      if (product.print_areas) {
        lineItem.print_areas = product.print_areas as Record<string, any[]>;
        console.log(`✅ Item ${index}: Added print areas`);
      }
    }
    // Check if this is just a blueprint without print_provider_id
    else if (product.blueprint_id && !product.print_provider_id) {
      console.warn(
        `⚠️ Item ${index}: Has blueprint_id but missing print_provider_id, adding default`,
      );
      lineItem.blueprint_id = product.blueprint_id;
      lineItem.print_provider_id = 99; // Default to Printify Choice

      if (product.print_areas) {
        lineItem.print_areas = product.print_areas as Record<string, any[]>;
      }
    }
    // Check if print_provider_id exists without blueprint_id (INVALID)
    else if (product.print_provider_id && !product.blueprint_id) {
      console.error(
        `❌ Item ${index}: Has print_provider_id but missing blueprint_id - SKIPPING`,
      );
      return null;
    }
    // Otherwise, it's an existing Printify product (use product_id only)
    else if (product.id) {
      console.log(`✅ Item ${index}: Existing Printify product`);
      lineItem.product_id = product.id;
      // IMPORTANT: Do NOT include print_provider_id for existing products
    } else {
      console.error(
        `❌ Item ${index}: Invalid product - no product_id or blueprint_id`,
      );
      return null;
    }

    // Final validation
    if (lineItem.print_provider_id && !lineItem.blueprint_id) {
      console.error(
        `❌ Item ${index}: VALIDATION FAILED - print_provider_id without blueprint_id`,
        lineItem,
      );
      return null;
    }

    if (
      lineItem.product_id &&
      (lineItem.blueprint_id || lineItem.print_provider_id)
    ) {
      console.warn(
        `⚠️ Item ${index}: Conflicting fields detected, cleaning...`,
      );
      // Remove the conflicting fields - prefer product_id for existing products
      delete lineItem.blueprint_id;
      delete lineItem.print_provider_id;
      delete lineItem.print_areas;
    }

    console.log(`✅ Item ${index}: Built line item:`, lineItem);
    return lineItem;
  });

  const validLineItems = lineItems.filter(Boolean) as PrintifyLineItem[];
  console.log(
    `\n📦 Final result: ${validLineItems.length}/${cartItems.length} line items built successfully`,
  );

  return validLineItems;
}

export function PaymentSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const testMode = CheckoutSelectors.testMode();
  const triggerPayment = CheckoutSelectors.triggerPayment();
  const orderAmount = CheckoutSelectors.orderAmount();
  const cartItems = CheckoutSelectors.cartItems();

  const {
    setTestMode,
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentSubmitComplete,
  } = useCheckoutSubscriberActions();

  // Build Printify line items from cart items
  const lineItems = useMemo(() => {
    console.log("🛒 Raw cart items:", JSON.stringify(cartItems, null, 2));
    const items = buildPrintifyLineItems(cartItems);
    console.log(
      "📦 Built Printify line items:",
      JSON.stringify(items, null, 2),
    );
    return items;
  }, [cartItems]);

  console.log("✅ PaymentSection: Rendering payment form");

  return (
    <section className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>Payment</h2>
          <p className={componentThemes.text.caption}>
            Complete your purchase securely
          </p>
        </header>

        {/* Test Mode Toggle */}
        <div className="mb-6 flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-slate-600 focus:ring-2 focus:ring-slate-500 rounded"
          />
          <label htmlFor="testMode" className="text-sm text-gray-700">
            Test Mode (use predefined payment methods)
          </label>
        </div>

        {shippingAddress ? (
          <PaymentForm
            lineItems={lineItems}
            amount={orderAmount}
            shippingAddress={shippingAddress}
            testMode={testMode}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            hideButton={true}
            triggerSubmit={triggerPayment}
            onSubmitComplete={handlePaymentSubmitComplete}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Please fill in your shipping address first</p>
          </div>
        )}
      </div>
    </section>
  );
}
