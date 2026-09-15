import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { removeUserInvoicePdfs } from "./invoiceStorageCleanup";

const mocks = {
  list: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
  in: vi.fn(),
};

const supabaseAdmin = {
  storage: {
    from: vi.fn(() => ({ list: mocks.list, remove: mocks.remove })),
  },
  from: vi.fn(() => ({ update: mocks.update })),
} as unknown as SupabaseClient<Database>;

describe("removeUserInvoicePdfs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue({ data: [], error: null });
    mocks.remove.mockResolvedValue({ data: null, error: null });
    mocks.update.mockReturnValue({ in: mocks.in });
    mocks.in.mockResolvedValue({ error: null });
  });

  it("removes reported pdfs and clears the invoice references", async () => {
    const result = await removeUserInvoicePdfs(supabaseAdmin, "user-1", [
      { bucket: "invoices", path: "user-1/INV-2026-00001.pdf" },
      { bucket: "invoices", path: "user-1/INV-2026-00002.pdf" },
    ]);

    expect(mocks.remove).toHaveBeenCalledWith([
      "user-1/INV-2026-00001.pdf",
      "user-1/INV-2026-00002.pdf",
    ]);
    expect(mocks.update).toHaveBeenCalledWith({ pdf_bucket: null, pdf_path: null });
    expect(mocks.in).toHaveBeenCalledWith("pdf_path", [
      "user-1/INV-2026-00001.pdf",
      "user-1/INV-2026-00002.pdf",
    ]);
    expect(result).toEqual({
      removed: [
        "invoices/user-1/INV-2026-00001.pdf",
        "invoices/user-1/INV-2026-00002.pdf",
      ],
      failed: [],
    });
  });

  it("also sweeps orphaned objects in the user's folder without duplicates", async () => {
    mocks.list.mockResolvedValue({
      data: [{ name: "INV-2026-00001.pdf" }, { name: "orphan.pdf" }],
      error: null,
    });

    const result = await removeUserInvoicePdfs(supabaseAdmin, "user-1", [
      { bucket: "invoices", path: "user-1/INV-2026-00001.pdf" },
    ]);

    expect(mocks.list).toHaveBeenCalledWith("user-1", { limit: 1000 });
    expect(mocks.remove).toHaveBeenCalledWith([
      "user-1/INV-2026-00001.pdf",
      "user-1/orphan.pdf",
    ]);
    expect(result.removed).toHaveLength(2);
  });

  it("reports failures instead of throwing and keeps the db references", async () => {
    mocks.remove.mockResolvedValue({ data: null, error: new Error("storage down") });

    const result = await removeUserInvoicePdfs(supabaseAdmin, "user-1", [
      { bucket: "invoices", path: "user-1/INV-2026-00001.pdf" },
    ]);

    expect(result.failed).toEqual(["invoices/user-1/INV-2026-00001.pdf"]);
    expect(result.removed).toEqual([]);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("does nothing when there is nothing to remove", async () => {
    const result = await removeUserInvoicePdfs(supabaseAdmin, "user-1", []);

    expect(mocks.remove).not.toHaveBeenCalled();
    expect(result).toEqual({ removed: [], failed: [] });
  });
});
