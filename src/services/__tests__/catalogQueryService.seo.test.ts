import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { CatalogQueryService } from "../catalogQueryService";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Mock ErrorClient so throwing paths don't hit Sentry
vi.mock("../errorClient", () => ({
  ErrorClient: {
    handleError: vi.fn(({ error }) => new Error(error.message)),
  },
}));

const mockProduct = {
  blueprint_id: 145,
  display_title: "Unisex Softstyle T-Shirt",
  base_image_url: "https://images.printify.com/tshirt.jpg",
  min_price_cents: 1500,
  shipping_cents: 500,
  is_active: true,
  print_provider_id: 99,
  selling_price_cents: null,
  original_price_cents: null,
  is_on_sale: false,
  discount_percent: null,
  is_product_of_month: false,
  last_synced_at: null,
  created_at: "2026-08-13T00:00:00Z",
  updated_at: "2026-08-13T00:00:00Z",
};

const mockSeo = {
  blueprint_id: 145,
  printify_description: "<p>Soft unisex tee</p>",
  meta_title: null,
  meta_description: null,
  meta_keywords: null,
  created_at: "2026-08-13T00:00:00Z",
  updated_at: "2026-08-13T00:00:00Z",
};

interface MockSupabaseI {
  from: Mock;
  select: Mock;
  eq: Mock;
  single: Mock;
}

describe("CatalogQueryService SEO queries", () => {
  let mockSupabase: MockSupabaseI;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    vi.mocked(createClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof createClient>
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductWithSeo", () => {
    it("returns the product with its embedded product_seo relation", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockProduct, product_seo: mockSeo },
        error: null,
      });

      const result = await CatalogQueryService.getProductWithSeo(145);

      expect(result).toEqual({ ...mockProduct, product_seo: mockSeo });
      expect(mockSupabase.from).toHaveBeenCalledWith("catalog_products");
      expect(mockSupabase.select).toHaveBeenCalledWith("*, product_seo(*)");
      expect(mockSupabase.eq).toHaveBeenCalledWith("blueprint_id", 145);
      expect(mockSupabase.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("returns product with null product_seo when no SEO row exists", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockProduct, product_seo: null },
        error: null,
      });

      const result = await CatalogQueryService.getProductWithSeo(145);

      expect(result?.product_seo).toBeNull();
    });

    it("returns null when the product is not found (PGRST116)", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      const result = await CatalogQueryService.getProductWithSeo(999);

      expect(result).toBeNull();
    });

    it("throws on other database errors", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST301", message: "Connection failed" },
      });

      await expect(CatalogQueryService.getProductWithSeo(145)).rejects.toThrow(
        "Connection failed"
      );
    });
  });

  describe("getProductOfMonth", () => {
    it("selects the product_seo relation alongside the product", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockProduct, is_product_of_month: true, product_seo: mockSeo },
        error: null,
      });

      const result = await CatalogQueryService.getProductOfMonth();

      expect(mockSupabase.select).toHaveBeenCalledWith("*, product_seo(*)");
      expect(mockSupabase.eq).toHaveBeenCalledWith("is_product_of_month", true);
      expect(result?.product_seo).toEqual(mockSeo);
    });

    it("returns null when no product of the month is set (PGRST116)", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      const result = await CatalogQueryService.getProductOfMonth();

      expect(result).toBeNull();
    });
  });
});
