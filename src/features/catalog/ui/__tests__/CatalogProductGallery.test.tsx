import { describe, expect, it } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import messages from "@/i18n/messages/en.json";
import { CatalogProductGallery } from "../components/CatalogProductGallery";

const IMAGE_URLS = [
  "https://images.printify.com/1.jpg",
  "https://images.printify.com/2.jpg",
  "https://images.printify.com/3.jpg",
];

describe("CatalogProductGallery", () => {
  it("renders the first photo with one thumbnail per image", () => {
    renderWithIntl(
      <CatalogProductGallery name="Classic Tee" imageUrls={IMAGE_URLS} />
    );

    expect(
      screen.getByAltText("Classic Tee — photo 1 of 3")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Show photo 1", pressed: true })
    ).toBeInTheDocument();
  });

  it("switches the main photo when a thumbnail is clicked", () => {
    renderWithIntl(
      <CatalogProductGallery name="Classic Tee" imageUrls={IMAGE_URLS} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Show photo 2" }));

    expect(
      screen.getByAltText("Classic Tee — photo 2 of 3")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show photo 2", pressed: true })
    ).toBeInTheDocument();
  });

  it("hides the thumbnail strip for a single photo", () => {
    renderWithIntl(
      <CatalogProductGallery name="Classic Tee" imageUrls={[IMAGE_URLS[0]]} />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a no-image placeholder when there are no photos", () => {
    renderWithIntl(<CatalogProductGallery name="Classic Tee" imageUrls={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      messages.catalog.dialog.noImage
    );
  });
});
