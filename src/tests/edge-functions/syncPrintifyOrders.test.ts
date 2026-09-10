import { describe, expect, it } from "vitest";
import {
  mapPrintifyToOrderUpdate,
  PRINTIFY_TO_ORDER_STATUS,
  REVIEW_STATUSES,
  type PrintifyOrderI,
  type SyncOrderRowI,
} from "../../../supabase/functions/sync-printify-orders/mapping";

/**
 * Sync Printify Orders Edge Function Test Suite
 *
 * Tests the pure status-mapping logic used by the sync-printify-orders
 * edge function (cron-driven Printify order status polling):
 * - Printify status → orders.status mapping for every known status
 * - Delivery inference from shipments (Printify has no "delivered" status)
 * - No-regression rule (status never moves backwards)
 * - Review statuses record printify_status without changing orders.status
 * - Tracking extraction from shipments
 */

const NOW = "2026-08-17T12:00:00.000Z";

function makeDbOrder(overrides: Partial<SyncOrderRowI> = {}): SyncOrderRowI {
  return {
    id: "order-1",
    status: "confirmed",
    printify_status: null,
    printify_order_id: "pf-1",
    tracking_number: null,
    tracking_url: null,
    shipped_at: null,
    delivered_at: null,
    ...overrides,
  };
}

function makePrintifyOrder(overrides: Partial<PrintifyOrderI> = {}): PrintifyOrderI {
  return {
    id: "pf-1",
    status: "in-production",
    shipments: [],
    ...overrides,
  };
}

describe("mapPrintifyToOrderUpdate", () => {
  describe("status mapping table", () => {
    const preProduction = [
      "pending",
      "on-hold",
      "payment-not-received",
      "cost-calculation",
    ];
    it.each(preProduction)("maps %s to confirmed", (printifyStatus) => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "waiting_confirmation" }),
        makePrintifyOrder({ status: printifyStatus }),
        NOW
      );
      expect(update?.status).toBe("confirmed");
      expect(update?.printify_status).toBe(printifyStatus);
    });

    const production = [
      "sending-to-production",
      "sending_to_production_delegate",
      "sending_to_production_delegate_sync",
      "in-production",
    ];
    it.each(production)("maps %s to processing", (printifyStatus) => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "confirmed" }),
        makePrintifyOrder({ status: printifyStatus }),
        NOW
      );
      expect(update?.status).toBe("processing");
    });

    it.each(["fulfilled", "partially-fulfilled"])(
      "maps %s to shipped",
      (printifyStatus) => {
        const update = mapPrintifyToOrderUpdate(
          makeDbOrder({ status: "processing" }),
          makePrintifyOrder({ status: printifyStatus }),
          NOW
        );
        expect(update?.status).toBe("shipped");
      }
    );

    it("maps canceled to cancelled", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing" }),
        makePrintifyOrder({ status: "canceled" }),
        NOW
      );
      expect(update?.status).toBe("cancelled");
    });

    it("covers every known Printify status in the mapping or review set", () => {
      const allKnownStatuses = [
        "pending",
        "on-hold",
        "payment-not-received",
        "cost-calculation",
        "sending-to-production",
        "sending_to_production_delegate",
        "sending_to_production_delegate_sync",
        "in-production",
        "fulfilled",
        "partially-fulfilled",
        "canceled",
        "has-issues",
        "unfulfillable",
        "source-check-failed",
      ];
      for (const status of allKnownStatuses) {
        const isMapped = status in PRINTIFY_TO_ORDER_STATUS;
        const isReview = REVIEW_STATUSES.has(status);
        expect(isMapped || isReview).toBe(true);
      }
    });
  });

  describe("review statuses", () => {
    it.each(["has-issues", "unfulfillable", "source-check-failed"])(
      "%s records printify_status but leaves orders.status untouched",
      (printifyStatus) => {
        const update = mapPrintifyToOrderUpdate(
          makeDbOrder({ status: "processing" }),
          makePrintifyOrder({ status: printifyStatus }),
          NOW
        );
        expect(update?.printify_status).toBe(printifyStatus);
        expect(update?.status).toBeUndefined();
      }
    );

    it("returns null when a review status was already recorded", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing", printify_status: "has-issues" }),
        makePrintifyOrder({ status: "has-issues" }),
        NOW
      );
      expect(update).toBeNull();
    });
  });

  describe("delivery inference from shipments", () => {
    const deliveredShipments = [
      {
        carrier: "usps",
        number: "TRACK123",
        url: "https://track.example.com/TRACK123",
        delivered_at: "2026-08-15 10:00:00+00:00",
      },
      {
        carrier: "usps",
        number: "TRACK456",
        url: "https://track.example.com/TRACK456",
        delivered_at: "2026-08-16 10:00:00+00:00",
      },
    ];

    it("marks delivered when every shipment has delivered_at", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "shipped", printify_status: "fulfilled" }),
        makePrintifyOrder({ status: "fulfilled", shipments: deliveredShipments }),
        NOW
      );
      expect(update?.status).toBe("delivered");
    });

    it("uses the latest shipment delivered_at as the order delivered_at", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "shipped", printify_status: "fulfilled" }),
        makePrintifyOrder({ status: "fulfilled", shipments: deliveredShipments }),
        NOW
      );
      expect(update?.delivered_at).toBe("2026-08-16 10:00:00+00:00");
    });

    it("does not mark delivered while any shipment is still in transit", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing" }),
        makePrintifyOrder({
          status: "fulfilled",
          shipments: [
            deliveredShipments[0],
            { ...deliveredShipments[1], delivered_at: null },
          ],
        }),
        NOW
      );
      expect(update?.status).toBe("shipped");
      expect(update?.delivered_at).toBeUndefined();
    });

    it("does not mark delivered when there are no shipments", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing" }),
        makePrintifyOrder({ status: "fulfilled", shipments: [] }),
        NOW
      );
      expect(update?.status).toBe("shipped");
    });
  });

  describe("no-regression rule", () => {
    it("never downgrades a shipped order back to processing", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "shipped", printify_status: "fulfilled" }),
        makePrintifyOrder({ status: "in-production" }),
        NOW
      );
      expect(update?.status).toBeUndefined();
      expect(update?.printify_status).toBe("in-production");
    });

    it("never downgrades processing back to confirmed", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing", printify_status: "in-production" }),
        makePrintifyOrder({ status: "on-hold" }),
        NOW
      );
      expect(update?.status).toBeUndefined();
      expect(update?.printify_status).toBe("on-hold");
    });

    it("keeps the same status without emitting a redundant update", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing", printify_status: "in-production" }),
        makePrintifyOrder({ status: "in-production" }),
        NOW
      );
      expect(update).toBeNull();
    });

    it("still cancels an already-shipped order when Printify cancels it", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "shipped", printify_status: "fulfilled" }),
        makePrintifyOrder({ status: "canceled" }),
        NOW
      );
      expect(update?.status).toBe("cancelled");
    });

    it("ignores unknown future Printify statuses without crashing", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing" }),
        makePrintifyOrder({ status: "some-new-status" }),
        NOW
      );
      expect(update?.status).toBeUndefined();
      expect(update?.printify_status).toBe("some-new-status");
    });
  });

  describe("tracking fields", () => {
    const shipment = {
      carrier: "usps",
      number: "TRACK123",
      url: "https://track.example.com/TRACK123",
      delivered_at: null,
    };

    it("extracts tracking number and url from the first shipment", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing" }),
        makePrintifyOrder({ status: "fulfilled", shipments: [shipment] }),
        NOW
      );
      expect(update?.tracking_number).toBe("TRACK123");
      expect(update?.tracking_url).toBe("https://track.example.com/TRACK123");
    });

    it("does not re-write unchanged tracking fields", () => {
      const update = mapPrintifyToOrderUpdate(
        makeDbOrder({
          status: "shipped",
          printify_status: "fulfilled",
          tracking_number: "TRACK123",
          tracking_url: "https://track.example.com/TRACK123",
          shipped_at: NOW,
        }),
        makePrintifyOrder({ status: "fulfilled", shipments: [shipment] }),
        NOW
      );
      expect(update).toBeNull();
    });

    it("sets shipped_at on the first transition to shipped only", () => {
      const first = mapPrintifyToOrderUpdate(
        makeDbOrder({ status: "processing" }),
        makePrintifyOrder({ status: "fulfilled", shipments: [shipment] }),
        NOW
      );
      expect(first?.shipped_at).toBe(NOW);

      const second = mapPrintifyToOrderUpdate(
        makeDbOrder({
          status: "shipped",
          printify_status: "fulfilled",
          tracking_number: "TRACK123",
          tracking_url: "https://track.example.com/TRACK123",
          shipped_at: "2026-08-10T00:00:00.000Z",
        }),
        makePrintifyOrder({ status: "fulfilled", shipments: [shipment] }),
        NOW
      );
      expect(second?.shipped_at).toBeUndefined();
    });
  });
});
