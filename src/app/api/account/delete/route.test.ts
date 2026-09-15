import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ACCOUNT_DELETION_CONFIRMATION_PHRASE } from "@/schemas/account";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signOut: vi.fn(),
  userRpc: vi.fn(),
  signInWithPassword: vi.fn(),
  deleteUser: vi.fn(),
  isAccountActionAllowed: vi.fn(),
  removeUserInvoicePdfs: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser, signOut: mocks.signOut },
    rpc: mocks.userRpc,
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      admin: { deleteUser: mocks.deleteUser },
    },
  }),
}));

vi.mock("@/lib/security/accountActionProtection", () => ({
  isAccountActionAllowed: mocks.isAccountActionAllowed,
}));

vi.mock("@/lib/account/invoiceStorageCleanup", () => ({
  removeUserInvoicePdfs: mocks.removeUserInvoicePdfs,
}));

vi.mock("@/lib/observability/errorCapture", () => ({
  captureError: mocks.captureError,
}));

import { POST } from "./route";

const USER_ID = "11111111-1111-4111-8111-111111111111";

const passwordUser = {
  id: USER_ID,
  email: "user@example.com",
  app_metadata: { provider: "email", providers: ["email"] },
};

const socialUser = {
  id: USER_ID,
  email: "user@example.com",
  app_metadata: { provider: "google", providers: ["google"] },
};

const okResult = {
  ok: true,
  user_id: USER_ID,
  invoice_pdfs: [{ bucket: "invoices", path: `${USER_ID}/INV-2026-00001.pdf` }],
  orders_anonymised: 2,
  invoices_anonymised: 1,
  payments_anonymised: 2,
};

function request(body: unknown = {}) {
  return new NextRequest("https://stamp.ai/api/account/delete", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function validBody(overrides = {}) {
  return {
    confirmation: ACCOUNT_DELETION_CONFIRMATION_PHRASE,
    password: "correct-horse",
    reason: "No longer needed",
    ...overrides,
  };
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    mocks.getUser.mockResolvedValue({ data: { user: passwordUser }, error: null });
    mocks.isAccountActionAllowed.mockResolvedValue(true);
    mocks.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    mocks.userRpc.mockResolvedValue({ data: okResult, error: null });
    mocks.removeUserInvoicePdfs.mockResolvedValue({ removed: ["x"], failed: [] });
    mocks.deleteUser.mockResolvedValue({ data: {}, error: null });
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it("rejects anonymous requests before reading the body", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(401);
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("rejects malformed bodies", async () => {
    expect((await POST(request("not json"))).status).toBe(400);
    expect((await POST(request({}))).status).toBe(400);
  });

  it("rate limits deletion attempts", async () => {
    mocks.isAccountActionAllowed.mockResolvedValue(false);

    const response = await POST(request(validBody()));

    expect(response.status).toBe(429);
    expect(mocks.isAccountActionAllowed).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "account-delete",
      USER_ID,
    );
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("requires the exact confirmation phrase", async () => {
    const response = await POST(request(validBody({ confirmation: "delete" })));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "CONFIRMATION_PHRASE_MISMATCH" });
    expect(mocks.userRpc).not.toHaveBeenCalled();
  });

  it("requires the password for password accounts", async () => {
    const response = await POST(request(validBody({ password: undefined })));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "PASSWORD_REQUIRED" });
  });

  it("rejects a wrong password without touching data", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: {},
      error: { code: "invalid_credentials" },
    });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "INVALID_PASSWORD" });
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "correct-horse",
    });
    expect(mocks.userRpc).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("lets social sign-in accounts delete with the phrase alone", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: socialUser }, error: null });

    const response = await POST(request(validBody({ password: undefined })));

    expect(response.status).toBe(200);
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(mocks.deleteUser).toHaveBeenCalledWith(USER_ID);
  });

  it("returns 409 with the blocking orders and leaves the auth user intact", async () => {
    mocks.userRpc.mockResolvedValue({
      data: {
        ok: false,
        reason: "OPEN_ORDERS",
        open_orders: [
          { order_number: "ORD-1", status: "shipped", payment_status: "paid" },
        ],
        pending_payment_recoveries: 0,
        unresolved_refunds: 1,
      },
      error: null,
    });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "OPEN_ORDERS",
      openOrders: [{ order_number: "ORD-1", status: "shipped", payment_status: "paid" }],
      pendingPaymentRecoveries: 0,
      unresolvedRefunds: 1,
    });
    expect(mocks.removeUserInvoicePdfs).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("runs the full deletion: rpc on the user session, storage cleanup, auth delete, sign out", async () => {
    const response = await POST(request(validBody()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      retained: { orders: 2, invoices: 1, payments: 2 },
    });

    expect(mocks.userRpc).toHaveBeenCalledWith("delete_own_account", {
      p_reason: "No longer needed",
    });
    expect(mocks.removeUserInvoicePdfs).toHaveBeenCalledWith(
      expect.anything(),
      USER_ID,
      okResult.invoice_pdfs,
    );
    expect(mocks.deleteUser).toHaveBeenCalledWith(USER_ID);
    expect(mocks.signOut).toHaveBeenCalled();

    const order = [
      mocks.userRpc.mock.invocationCallOrder[0],
      mocks.removeUserInvoicePdfs.mock.invocationCallOrder[0],
      mocks.deleteUser.mock.invocationCallOrder[0],
      mocks.signOut.mock.invocationCallOrder[0],
    ];
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("still deletes the auth user when storage cleanup partially fails, but logs it", async () => {
    mocks.removeUserInvoicePdfs.mockResolvedValue({
      removed: [],
      failed: ["invoices/x.pdf"],
    });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(200);
    expect(mocks.deleteUser).toHaveBeenCalled();
    expect(mocks.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ action: "removeInvoicePdfs" }),
      "warning",
    );
  });

  it("fails closed when the auth deletion errors", async () => {
    mocks.deleteUser.mockResolvedValue({ data: {}, error: new Error("gotrue down") });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "ACCOUNT_DELETE_FAILED" });
  });

  it("fails closed when the rpc returns an unexpected shape", async () => {
    mocks.userRpc.mockResolvedValue({ data: { weird: true }, error: null });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(500);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
});
