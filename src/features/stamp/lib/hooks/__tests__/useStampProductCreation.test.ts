import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStampProductCreation } from "../useStampProductCreation";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  nextStep: vi.fn(),
  goToStep: vi.fn(),
  handleError: vi.fn(),
  mutateAsync: vi.fn(),
  ensureGuestSession: vi.fn(),
  user: null as { id: string; email: string; is_anonymous?: boolean } | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));
vi.mock("../useStampNavigation", () => ({
  useStampNavigation: () => ({ nextStep: mocks.nextStep, goToStep: mocks.goToStep }),
}));
vi.mock("../useStampSelectors", () => ({
  useStampSelectedImage: () => ({
    selectedImageUrl: "https://cdn/design.png",
    enhancedPrompt: "A cat",
  }),
  useStampFinalization: () => ({
    setIsFinalizing: vi.fn(),
    setCreatedProductId: vi.fn(),
    setCreatedVariantId: vi.fn(),
    setMockupImageUrl: vi.fn(),
    setMockupImages: vi.fn(),
    setProductionProgress: vi.fn(),
  }),
}));
vi.mock("@/shared/queries/productQueries", () => ({
  useCreateCustomProduct: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
}));
vi.mock("@/shared/queries/authQueries", () => ({
  useUser: () => ({ data: mocks.user }),
  useEnsureGuestSession: () => mocks.ensureGuestSession,
}));
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: mocks.handleError }),
}));
vi.mock("../../helpers/stampLogger", () => ({
  logStampError: vi.fn(),
  logStampInfo: vi.fn(),
  logStampWarn: vi.fn(),
}));

const PARAMS = {
  blueprintId: 6,
  printProviderId: 99,
  fabricColor: "White",
  size: "M",
};

describe("useStampProductCreation for a guest", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    mocks.user = null;
    mocks.ensureGuestSession.mockResolvedValue({
      id: "anon-1",
      email: "",
      is_anonymous: true,
    });
    mocks.mutateAsync.mockResolvedValue({
      id: "prod-1",
      selected_variant_id: 101,
      images: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("starts an anonymous session, then creates the product, without redirecting to login", async () => {
    const { result } = renderHook(() => useStampProductCreation());

    await result.current.handleCreateProduct(PARAMS);

    expect(mocks.ensureGuestSession).toHaveBeenCalledTimes(1);
    expect(mocks.ensureGuestSession.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.mutateAsync.mock.invocationCallOrder[0],
    );
    expect(mocks.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "anon-1", blueprint_id: 6 }),
    );
    expect(mocks.push).not.toHaveBeenCalledWith("/auth/login");
  });

  it("does not send customer_email with the product", async () => {
    const { result } = renderHook(() => useStampProductCreation());

    await result.current.handleCreateProduct(PARAMS);

    expect(mocks.mutateAsync.mock.calls[0][0]).not.toHaveProperty("customer_email");
  });

  it("shows guestSession and stays on the step when the anonymous sign-in fails", async () => {
    mocks.ensureGuestSession.mockRejectedValue(new Error("rate limited"));
    const { result } = renderHook(() => useStampProductCreation());

    await result.current.handleCreateProduct(PARAMS);

    expect(mocks.handleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "guestSession" }),
    );
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(mocks.nextStep).not.toHaveBeenCalled();
  });

  it("uses the registered user's session without signing in again", async () => {
    mocks.user = { id: "user-1", email: "a@b.c", is_anonymous: false };
    mocks.ensureGuestSession.mockResolvedValue(mocks.user);
    const { result } = renderHook(() => useStampProductCreation());

    await result.current.handleCreateProduct(PARAMS);

    expect(mocks.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1" }),
    );
  });
});
