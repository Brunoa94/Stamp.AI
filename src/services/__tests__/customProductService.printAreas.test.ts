import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomProductService } from "../customProductService";

/**
 * Verifies the payload the client sends to the create-custom-product edge
 * function — the client half of the socks IMAGE_REQUIRED regression:
 * - without print_positions it must fall back to a front print area
 *   (the server remaps it when the blueprint has no front), and
 * - with print_positions it must send every enabled position plus its
 *   placement.
 */

vi.mock("@/services/productService", () => ({
  ProductService: {
    mapPrintifyProductToInput: vi.fn().mockReturnValue({}),
    savePrintifyProduct: vi.fn().mockResolvedValue(undefined),
  },
}));

const UPLOADED_IMAGE_ID = "6a70d64dbce32fa63384af72";

const uploadResponse = {
  success: true,
  image: {
    id: UPLOADED_IMAGE_ID,
    file_name: "design.png",
    height: 1024,
    width: 1024,
    size: 123456,
    mime_type: "image/png",
    preview_url: "https://images.printify.com/preview.png",
  },
};

const createResponse = {
  success: true,
  product: {
    id: "product-1",
    title: "Custom Design",
    variants: [{ id: 101, title: "S", price: 2999, is_enabled: true }],
    images: [],
  },
};

const basePayload = {
  blueprint_id: 462,
  print_provider_id: 99,
  image_url: "https://images.unsplash.com/design.png",
  title: "Custom Design",
  description: "AI-generated custom design",
  user_id: "123e4567-e89b-12d3-a456-426614174000",
  customer_email: "user@example.com",
  selected_color: "White",
  selected_size: "M",
};

function mockFetchSequence() {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => uploadResponse,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => createResponse,
    });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function sentCreateBody(fetchMock: ReturnType<typeof vi.fn>) {
  // Call 0 = image upload, call 1 = create-custom-product
  const [url, init] = fetchMock.mock.calls[1];
  expect(String(url)).toContain("create-custom-product");
  return JSON.parse((init as RequestInit).body as string);
}

describe("CustomProductService.createCustomProduct print areas", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses all config positions for known placement-disabled products (socks 462)", async () => {
    const fetchMock = mockFetchSequence();

    await CustomProductService.createCustomProduct(basePayload);

    const body = sentCreateBody(fetchMock);
    expect(body.print_areas).toEqual({
      left_leg: UPLOADED_IMAGE_ID,
      right_leg: UPLOADED_IMAGE_ID,
    });
    expect(body.placements).toBeUndefined();
    expect(body.image_width).toBe(1024);
    expect(body.image_height).toBe(1024);
  });

  it("falls back to a front print area for unknown blueprints (server remaps if needed)", async () => {
    // A socks product whose blueprint isn't in PRODUCT_CONFIGS resolves to the
    // apparel default and sends "front" — the edge function's
    // resolvePrintAreas fallback is what keeps this from failing server-side.
    const fetchMock = mockFetchSequence();

    await CustomProductService.createCustomProduct({
      ...basePayload,
      blueprint_id: 999999,
    });

    const body = sentCreateBody(fetchMock);
    expect(body.print_areas).toEqual({ front: UPLOADED_IMAGE_ID });
    expect(body.placements).toBeUndefined();
  });

  it("sends every enabled position and its placement when print positions are given", async () => {
    const fetchMock = mockFetchSequence();

    const leftPlacement = { x: 0.5, y: 0.5, scale: 1, angle: 0 };
    const rightPlacement = { x: 0.4, y: 0.6, scale: 0.8, angle: 90 };

    await CustomProductService.createCustomProduct({
      ...basePayload,
      print_positions: [
        { position: "left_leg", placement: leftPlacement },
        { position: "right_leg", placement: rightPlacement },
      ],
    });

    const body = sentCreateBody(fetchMock);
    expect(body.print_areas).toEqual({
      left_leg: UPLOADED_IMAGE_ID,
      right_leg: UPLOADED_IMAGE_ID,
    });
    expect(body.placements).toEqual({
      left_leg: leftPlacement,
      right_leg: rightPlacement,
    });
  });

  it("rejects invalid placements before any network call", async () => {
    const fetchMock = mockFetchSequence();

    await expect(
      CustomProductService.createCustomProduct({
        ...basePayload,
        print_positions: [
          // x outside 0-1 must fail schema validation
          { position: "front", placement: { x: 7, y: 0.5, scale: 1, angle: 0 } },
        ],
      }),
    ).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
