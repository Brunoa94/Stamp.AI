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
  /**
   * The account this item was copied into at login. Its product now belongs
   * to that account, so checking it out needs that login.
   */
  mergedInto?: string;
};

export type NewLocalCartItemT = Omit<LocalCartItemT, "id" | "createdAt" | "isSelected" | "mergedInto">;

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

/** Saves the cart; false when storage is full or blocked (private mode) and nothing was kept. */
function writeItems(items: LocalCartItemT[]): boolean {
  let saved = true;
  try {
    if (items.length > 0) {
      const data: LocalCartDataT = { items, timestamp: Date.now() };
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(LOCAL_CART_KEY);
    }
  } catch {
    saved = false;
  }
  emitUpdated();
  return saved;
}

/** The browser refused to store the bag, so the item was not added. */
export class LocalCartStorageError extends Error {
  constructor() {
    super("The local cart could not be saved");
    this.name = "LocalCartStorageError";
  }
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

  /**
   * Adds an item, or adds to the quantity of the same product and variant.
   * Throws LocalCartStorageError when the browser cannot store the bag.
   */
  static addItem(item: NewLocalCartItemT): void {
    if (!isBrowser()) return;

    const items = this.getItems();
    // A merged line belongs to an account; a new add starts its own line.
    const existing = items.find(
      (i) =>
        i.productId === item.productId && i.variantId === item.variantId && !i.mergedInto,
    );

    const next = existing
      ? items.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
      )
      : [
        ...items,
        { ...item, id: crypto.randomUUID(), isSelected: true, createdAt: Date.now() },
      ];

    if (!writeItems(next)) throw new LocalCartStorageError();
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

  /** True when any of these items was copied into an account (and needs that login). */
  static hasMergedItem(itemIds: readonly string[]): boolean {
    const ids = new Set(itemIds);
    return this.getItems().some((item) => ids.has(item.id) && Boolean(item.mergedInto));
  }

  /** Records that these items were copied into an account's cart. */
  static markMerged(itemIds: readonly string[], accountId: string): void {
    if (!isBrowser()) return;
    const merged = new Set(itemIds);
    writeItems(
      this.getItems().map((item) =>
        merged.has(item.id) ? { ...item, mergedInto: accountId } : item
      ),
    );
  }

  /** Drops the items that were selected for checkout (after they were paid for). */
  static removeSelectedItems(): void {
    if (!isBrowser()) return;
    writeItems(this.getItems().filter((item) => !item.isSelected));
  }

  /**
   * Takes the paid quantities out of the bag once a payment is confirmed.
   * Matches by product and variant, so items bagged after the payment
   * started (in this tab or another) stay.
   */
  static removePaidItems(
    paid: readonly { productId: string; variantId: string; quantity: number }[],
  ): void {
    if (!isBrowser()) return;
    const remaining = new Map(
      paid.map((line) => [`${line.productId}:${line.variantId}`, line.quantity]),
    );
    writeItems(
      this.getItems()
        .map((item) => {
          const key = `${item.productId}:${item.variantId}`;
          const paidQuantity = remaining.get(key) ?? 0;
          remaining.delete(key);
          return { ...item, quantity: item.quantity - paidQuantity };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  static clear(): void {
    if (!isBrowser()) return;
    writeItems([]);
  }
}
