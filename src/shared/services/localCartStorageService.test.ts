import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCAL_CART_UPDATED_EVENT,
  LocalCartStorageService,
  type NewLocalCartItemT,
} from "./localCartStorageService";

const LOCAL_CART_KEY = "local_cart";

function newItem(overrides: Partial<NewLocalCartItemT> = {}): NewLocalCartItemT {
  return {
    productId: "prod-1",
    variantId: "101",
    productName: "Tee",
    unitPrice: 2500,
    quantity: 1,
    customImageUrl: "https://cdn/mockup.png",
    blueprintId: 6,
    printProviderId: 99,
    ...overrides,
  };
}

/** The cart as a fresh page load would read it from localStorage. */
function reloadedItems() {
  return LocalCartStorageService.getItems();
}

describe("LocalCartStorageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts empty", () => {
    expect(LocalCartStorageService.getItems()).toEqual([]);
  });

  it("adds an item that survives a reload, selected for checkout", () => {
    LocalCartStorageService.addItem(newItem());

    const [item] = reloadedItems();
    expect(item).toMatchObject({ ...newItem(), isSelected: true });
    expect(item.id).toEqual(expect.any(String));
  });

  it("adds to the quantity when the same product and variant is added again", () => {
    LocalCartStorageService.addItem(newItem());
    LocalCartStorageService.addItem(newItem({ quantity: 2 }));

    expect(reloadedItems()).toHaveLength(1);
    expect(reloadedItems()[0].quantity).toBe(3);
  });

  it("keeps a different variant of the same product as its own line", () => {
    LocalCartStorageService.addItem(newItem());
    LocalCartStorageService.addItem(newItem({ variantId: "102" }));

    expect(reloadedItems().map((item) => item.variantId)).toEqual(["101", "102"]);
  });

  it("updates the quantity of one item", () => {
    LocalCartStorageService.addItem(newItem());
    const [{ id }] = reloadedItems();

    LocalCartStorageService.updateQuantity(id, 4);

    expect(reloadedItems()[0].quantity).toBe(4);
  });

  it("removes one item", () => {
    LocalCartStorageService.addItem(newItem());
    LocalCartStorageService.addItem(newItem({ productId: "prod-2" }));
    const [first] = reloadedItems();

    LocalCartStorageService.removeItem(first.id);

    expect(reloadedItems().map((item) => item.productId)).toEqual(["prod-2"]);
  });

  it("removes only the selected items", () => {
    LocalCartStorageService.addItem(newItem());
    LocalCartStorageService.addItem(newItem({ productId: "prod-2" }));
    const [first] = reloadedItems();
    LocalCartStorageService.setSelection([first.id]);

    LocalCartStorageService.removeSelectedItems();

    expect(reloadedItems().map((item) => item.productId)).toEqual(["prod-2"]);
  });

  it("stores which items are selected for checkout", () => {
    LocalCartStorageService.addItem(newItem());
    LocalCartStorageService.addItem(newItem({ productId: "prod-2" }));
    const [first, second] = reloadedItems();

    LocalCartStorageService.setSelection([second.id]);

    expect(reloadedItems().map((item) => item.isSelected)).toEqual([false, true]);
    expect(first.id).not.toBe(second.id);
  });

  it("clears the cart", () => {
    LocalCartStorageService.addItem(newItem());

    LocalCartStorageService.clear();

    expect(reloadedItems()).toEqual([]);
  });

  it("returns an empty cart for corrupt JSON", () => {
    localStorage.setItem(LOCAL_CART_KEY, "{not json");

    expect(LocalCartStorageService.getItems()).toEqual([]);
  });

  it("returns an empty cart for valid JSON in the wrong shape", () => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify({ items: "nope" }));

    expect(LocalCartStorageService.getItems()).toEqual([]);
  });

  it("drops a cart nobody touched for more than 7 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    LocalCartStorageService.addItem(newItem());

    vi.setSystemTime(new Date("2026-10-09T00:00:00Z"));

    expect(LocalCartStorageService.getItems()).toEqual([]);
  });

  it("tells same-tab listeners when the cart changes", () => {
    const listener = vi.fn();
    window.addEventListener(LOCAL_CART_UPDATED_EVENT, listener);

    LocalCartStorageService.addItem(newItem());
    LocalCartStorageService.clear();

    window.removeEventListener(LOCAL_CART_UPDATED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
