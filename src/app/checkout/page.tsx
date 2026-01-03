"use client";

import { useState } from "react";
import StripeCheckout from "@/components/StripeCheckout";
import ProductCustomizer, {
  ProductCustomization,
} from "@/components/ProductCustomizer";
import { createClient } from "@/lib/supabase/client";

type CheckoutStep = "customize" | "creating-product" | "shipping" | "payment";

// The custom product created from the design
interface CustomProduct {
  id: string;
  variant_id: number;
  title: string;
  price: number;
}

export default function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>("customize");
  const [customization, setCustomization] =
    useState<ProductCustomization | null>(null);
  const [customProduct, setCustomProduct] = useState<CustomProduct | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const supabase = createClient();

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "US",
    region: "",
    address1: "",
    address2: "",
    city: "",
    zip: "",
  });

  const handleCustomizationComplete = async (data: ProductCustomization) => {
    setCustomization(data);
    setCreatingProduct(true);
    setStep("creating-product");
    setError(null);

    try {
      // Create a custom product in Printify with the uploaded image(s) applied
      console.log("Creating custom product with data:", {
        blueprint_id: data.blueprint_id,
        print_provider_id: data.print_provider_id,
        print_areas: data.print_areas,
        variant_id: data.variant_id,
      });

      const { data: result, error } = await supabase.functions.invoke(
        "create-custom-product",
        {
          body: {
            blueprint_id: data.blueprint_id,
            print_provider_id: data.print_provider_id,
            print_areas: data.print_areas, // { front?: string, back?: string }
            variants: data.variant_id ? [data.variant_id] : undefined, // Pass selected variant
            title: `Custom ${data.product_title} - ${Date.now()}`,
            description: "Custom designed product",
          },
        }
      );

      if (error) throw new Error(error.message);
      if (!result.success)
        throw new Error(result.error || "Failed to create custom product");

      console.log("Custom product created:", result.product);

      // Get the first enabled variant from the new product
      const variant =
        result.product.variants?.find((v: any) => v.is_enabled) ||
        result.product.variants?.[0];

      if (!variant) {
        throw new Error("No variants available for the created product");
      }

      setCustomProduct({
        id: result.product.id,
        variant_id: variant.id,
        title: result.product.title,
        price: variant.price / 100, // cents to dollars
      });

      setStep("shipping");
    } catch (err) {
      console.error("Failed to create custom product:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create custom product"
      );
      setStep("customize");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !shippingAddress.first_name ||
      !shippingAddress.email ||
      !shippingAddress.address1 ||
      !shippingAddress.city
    ) {
      setError("Please fill in all required fields");
      return;
    }
    setError(null);
    setStep("payment");
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentStatus("success");
    setMessage(`Payment successful! Payment ID: ${paymentIntent.id}`);
    console.log("Payment succeeded:", paymentIntent);
  };

  const handlePaymentError = (errorMsg: string) => {
    setPaymentStatus("error");
    setMessage(errorMsg);
    console.error("Payment failed:", errorMsg);
  };

  // Calculate order amount (use custom product price if available)
  const orderAmount = customProduct
    ? customProduct.price * (customization?.quantity || 1)
    : customization
    ? customization.price * customization.quantity
    : 0;

  // Build line items for Stripe - use the custom product we created
  // Convert print_areas object to array format for the API
  const printAreasArray = customization?.print_areas
    ? Object.entries(customization.print_areas)
        .filter(([_, imageId]) => imageId)
        .map(([position, imageId]) => ({
          position,
          image_id: imageId,
        }))
    : [];

  const lineItems = customProduct
    ? [
        {
          product_id: customProduct.id,
          variant_id: customProduct.variant_id,
          quantity: customization?.quantity || 1,
          print_areas: printAreasArray,
          print_provider_id: customization?.print_provider_id || 99,
        },
      ]
    : [];

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Your order is being processed and will be sent to Printify for
              production.
            </p>
            <button
              onClick={() => {
                setPaymentStatus("idle");
                setStep("customize");
                setCustomization(null);
                setCustomProduct(null);
              }}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => {
                setPaymentStatus("idle");
                setMessage("");
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step indicator
  const steps = [
    { key: "customize", label: "Design" },
    { key: "shipping", label: "Shipping" },
    { key: "payment", label: "Payment" },
  ];

  // Helper to get step index (creating-product is part of customize)
  const getStepIndex = (s: CheckoutStep) => {
    if (s === "creating-product") return 0;
    return steps.findIndex((x) => x.key === s);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepIndex(step) === i
                      ? "bg-blue-600 text-white"
                      : getStepIndex(step) > i
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {getStepIndex(step) > i ? "✓" : i + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step: Creating Product (loading state) */}
        {step === "creating-product" && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Your Custom Product
            </h2>
            <p className="text-gray-600">
              Applying your design to the product... This may take a moment.
            </p>
          </div>
        )}

        {/* Step 1: Customize Product */}
        {step === "customize" && (
          <ProductCustomizer
            onCustomizationComplete={handleCustomizationComplete}
            onError={(err) => setError(err)}
          />
        )}

        {/* Step 2: Shipping Address */}
        {step === "shipping" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold mb-6">Shipping Address</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.first_name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.last_name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      email: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={shippingAddress.address1}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address1: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={shippingAddress.address2}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address2: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Region
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.region}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        region: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zip}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        zip: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        country: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep("customize")}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && customization && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="flex items-start gap-4 mb-4">
                {customization.preview_url && (
                  <img
                    src={customization.preview_url}
                    alt="Design"
                    className="w-20 h-20 object-contain border rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{customization.product_title}</p>
                  <p className="text-gray-600 text-sm">
                    {customization.variant_title}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Qty: {customization.quantity}
                  </p>
                </div>
                <p className="font-medium">${orderAmount.toFixed(2)}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${orderAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Shipping To</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    {shippingAddress.first_name} {shippingAddress.last_name}
                  </p>
                  <p>{shippingAddress.address1}</p>
                  {shippingAddress.address2 && (
                    <p>{shippingAddress.address2}</p>
                  )}
                  <p>
                    {shippingAddress.city}, {shippingAddress.region}{" "}
                    {shippingAddress.zip}
                  </p>
                  <p>{shippingAddress.email}</p>
                </div>
              </div>

              <button
                onClick={() => setStep("shipping")}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Edit shipping address
              </button>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Payment</h2>

              {/* Test Mode Toggle */}
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="testMode" className="text-sm text-gray-600">
                  Test Mode (use predefined payment methods)
                </label>
              </div>

              <StripeCheckout
                amount={orderAmount}
                lineItems={lineItems}
                shippingAddress={shippingAddress}
                testMode={testMode}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
