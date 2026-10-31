import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { useUser } from "@/shared/queries/authQueries";
import { useUserCoins } from "@/shared/queries/coinsQueries";
import { SynthesisSection } from "../SynthesisSection";

vi.mock("@/shared/queries/authQueries");
vi.mock("@/shared/queries/coinsQueries");
vi.mock("../../../../lib/hooks/useStampImageGeneration", () => ({
  useStampImageGeneration: () => ({ handleGenerate: vi.fn(), isGenerating: false }),
}));
vi.mock("../../../../lib/hooks/useSkipGeneration", () => ({
  useSkipGeneration: () => ({
    handleSkipGeneration: vi.fn(),
    canSkip: false,
    hasCachedImages: false,
    hasUploadedImage: false,
  }),
}));
vi.mock("../../../../lib/hooks/useMobileStepAction", () => ({
  useRegisterMobileAction: vi.fn(),
}));
vi.mock("../SynthesisVisual", () => ({ SynthesisVisual: () => null }));
vi.mock("../../../components/CoinsDisplay", () => ({ CoinsDisplay: () => null }));
vi.mock("../../../components/CoinsOverlay/CoinsOverlay", () => ({
  CoinsOverlay: ({ variant }: { variant: string }) => (
    <div data-testid={`coins-overlay-${variant}`} />
  ),
}));

function mockUser(user: { id: string; is_anonymous?: boolean } | null) {
  vi.mocked(useUser).mockReturnValue({
    data: user,
    isLoading: false,
  } as unknown as ReturnType<typeof useUser>);
}

describe("SynthesisSection", () => {
  beforeEach(() => {
    vi.mocked(useUserCoins).mockReturnValue({
      data: { coins: 3 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useUserCoins>);
  });

  it("shows the not-logged-in overlay to a guest with an anonymous session", () => {
    mockUser({ id: "anon-1", is_anonymous: true });

    renderWithIntl(<SynthesisSection />);

    expect(screen.getByTestId("coins-overlay-not-logged-in")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stamp it!" })).toBeDisabled();
  });

  it("does not show the login overlay to a registered user", () => {
    mockUser({ id: "user-1", is_anonymous: false });

    renderWithIntl(<SynthesisSection />);

    expect(screen.queryByTestId("coins-overlay-not-logged-in")).not.toBeInTheDocument();
  });
});
