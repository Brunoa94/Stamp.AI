/**
 * LocalCartStorageService
 *
 * The guest cart, kept in localStorage. Guests (no account, or only an
 * anonymous Supabase session) always read and change this cart; it is copied
 * into a database cart only when they start a payment, and the paid items are
 * removed from it once the return page confirms the order.
 */

export type LocalCartItemT = {
  /** Unique ID for this local cart item (generated UUID) */
  id: string;
  /** ID of the created product (products.id / Printify product ID) */
  productId: string;
  /** Printify variant ID */
  variantId: string;
  productName: string;
  /** Price in cents */
  unitPrice: number;
  quantity: number;
  /** URL to product image/mockup */
  customImageUrl: string | null;
  blueprintId: number | null;
  printProviderId: number | null;
  /** Selected for checkout on the cart page (mirrors cart_items.is_selected) */
  isSelected: boolean;
  /** Timestamp when added to local cart */
  createdAt: number;
};

export type NewLocalCartItemT = Omit<LocalCartItemT, "id" | "createdAt" | "isSelected">;

type LocalCartDataT = {
  items: LocalCartItemT[];
  timestamp: number;
};

const LOCAL_CART_KEY = "local_cart";
const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days
export const LOCAL_CART_UPDATED_EVENT = "local-cart-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readData(): LocalCartDataT | null {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored) as Partial<LocalCartDataT> | null;
    if (!data || !Array.isArray(data.items) || typeof data.timestamp !== "number") {
      return null;
    }
    return data as LocalCartDataT;
  } catch {
    return null;
  }
}

/**
 * Notify same-tab listeners that the local cart changed.
 * The native "storage" event only fires across different tabs.
 */
function emitUpdated(): void {
  window.dispatchEvent(new Event(LOCAL_CART_UPDATED_EVENT));
}

function writeItems(items: LocalCartItemT[]): void {
  try {
    if (items.length > 0) {
      const data: LocalCartDataT = { items, timestamp: Date.now() };
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(LOCAL_CART_KEY);
    }
  } catch (error) {
    // Storage full or blocked (private mode): the cart cannot be kept.
    console.error("Failed to save local cart:", error);
  }
  emitUpdated();
}

export class LocalCartStorageService {
  static getItems(): LocalCartItemT[] {
    if (!isBrowser()) return [];

    const data = readData();
    if (!data) return [];

    if (Date.now() - data.timestamp > EXPIRATION_TIME) {
      this.clear();
      return [];
    }

    return data.items;
  }

  /** Adds an item, or adds to the quantity of the same product and variant. */
  static addItem(item: NewLocalCartItemT): void {
    if (!isBrowser()) return;

    const items = this.getItems();
    const existing = items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (existing) {
      writeItems(
        items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      );
      return;
    }

    writeItems([
      ...items,
      { ...item, id: crypto.randomUUID(), isSelected: true, createdAt: Date.now() },
    ]);
  }

  static updateQuantity(itemId: string, quantity: number): void {
    if (!isBrowser()) return;
    writeItems(
      this.getItems().map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  }

  static removeItem(itemId: string): void {
    if (!isBrowser()) return;
    writeItems(this.getItems().filter((item) => item.id !== itemId));
  }

  /** Marks exactly these items as selected for checkout. */
  static setSelection(selectedItemIds: readonly string[]): void {
    if (!isBrowser()) return;
    const selected = new Set(selectedItemIds);
    writeItems(
      this.getItems().map((item) => ({ ...item, isSelected: selected.has(item.id) })),
    );
  }

  /** Drops the items that were selected for checkout (after they were paid for). */
  static removeSelectedItems(): void {
    if (!isBrowser()) return;
    writeItems(this.getItems().filter((item) => !item.isSelected));
  }

  static clear(): void {
    if (!isBrowser()) return;
    writeItems([]);
  }
}
