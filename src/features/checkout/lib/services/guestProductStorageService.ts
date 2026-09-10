/**
 * GuestProductStorageService
 *
 * Manages guest product data in localStorage for users who create
 * products without being authenticated.
 *
 * When a guest creates a product:
 * 1. Product is created in Printify
 * 2. Product metadata is stored in localStorage
 * 3. Product is added to guest cart (via session_id)
 *
 * When guest logs in at checkout:
 * 1. Products are claimed from localStorage
 * 2. Entries are created in the products table
 * 3. localStorage is cleared
 *
 * HYBRID CART SYSTEM:
 * For logged-in users, we also store a "local cart" in localStorage that
 * displays alongside their DB cart. This allows users to see guest-created
 * products without immediately mutating their DB cart. Products are only
 * added to the DB cart when the user proceeds to checkout with them.
 */

export interface GuestProduct {
  printifyProductId: string;
  productName: string;
  blueprintId: number;
  printProviderId: number;
  printAreas: Record<string, string> | null;
  variantId?: string;
  unitPrice?: number;
  quantity?: number;
  customImageUrl?: string | null;
  createdAt: number;
}

/**
 * LocalCartItem represents a product stored in localStorage that can be
 * displayed in the cart alongside DB cart items. Contains all the data
 * needed for cart display and checkout.
 */
export interface LocalCartItem {
  /** Unique ID for this local cart item (generated UUID) */
  id: string;
  /** Printify product ID */
  productId: string;
  /** Printify variant ID */
  variantId: string;
  /** Display name for the product */
  productName: string;
  /** Price in cents */
  unitPrice: number;
  /** Number of items */
  quantity: number;
  /** URL to product image/mockup */
  customImageUrl: string | null;
  /** Blueprint ID for Printify */
  blueprintId: number;
  /** Print provider ID for Printify */
  printProviderId: number;
  /** Timestamp when added to local cart */
  createdAt: number;
}

interface GuestProductsData {
  products: GuestProduct[];
  timestamp: number;
}

interface LocalCartData {
  items: LocalCartItem[];
  timestamp: number;
}

const STORAGE_KEY = "guest_products";
const LOCAL_CART_KEY = "local_cart";
const SESSION_ID_KEY = "guest_session_id";
const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days
export const LOCAL_CART_UPDATED_EVENT = "local-cart-updated";

/**
 * Generate a UUID v4 for guest session
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class GuestProductStorageService {
  /**
   * Check if we're in a browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Get or create a session ID for guest users.
   * This ID persists across browser sessions and is used for guest carts.
   */
  static getSessionId(): string | null {
    if (!this.isBrowser()) return null;

    try {
      let sessionId = localStorage.getItem(SESSION_ID_KEY);

      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(SESSION_ID_KEY, sessionId);
        console.log("🆔 Created new guest session:", sessionId);
      }

      return sessionId;
    } catch (error) {
      console.error("Failed to get/create session ID:", error);
      return null;
    }
  }

  /**
   * Clear the guest session ID (call after user logs in and cart is merged)
   */
  static clearSessionId(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(SESSION_ID_KEY);
      console.log("🗑️ Cleared guest session ID");
    } catch (error) {
      console.error("Failed to clear session ID:", error);
    }
  }

  /**
   * Add a guest product to localStorage
   */
  static addProduct(product: GuestProduct): void {
    if (!this.isBrowser()) return;

    try {
      const data = this.getData();
      const products = data?.products || [];

      // Avoid duplicates
      const exists = products.some(
        (p) => p.printifyProductId === product.printifyProductId,
      );

      if (!exists) {
        products.push(product);
        this.saveData({ products, timestamp: Date.now() });
        console.log("💾 Stored guest product:", product.printifyProductId);
      }
    } catch (error) {
      console.error("Failed to add guest product:", error);
    }
  }

  /**
   * Get all stored guest products
   */
  static getProducts(): GuestProduct[] {
    if (!this.isBrowser()) return [];

    try {
      const data = this.getData();
      if (!data) return [];

      // Check expiration
      if (Date.now() - data.timestamp > EXPIRATION_TIME) {
        this.clearProducts();
        return [];
      }

      return data.products;
    } catch (error) {
      console.error("Failed to get guest products:", error);
      return [];
    }
  }

  /**
   * Check if there are any stored guest products
   */
  static hasProducts(): boolean {
    return this.getProducts().length > 0;
  }

  /**
   * Get a specific product by Printify ID
   */
  static getProduct(printifyProductId: string): GuestProduct | undefined {
    return this.getProducts().find(
      (p) => p.printifyProductId === printifyProductId,
    );
  }

  /**
   * Remove a specific product
   */
  static removeProduct(printifyProductId: string): void {
    if (!this.isBrowser()) return;

    try {
      const data = this.getData();
      if (!data) return;

      const products = data.products.filter(
        (p) => p.printifyProductId !== printifyProductId,
      );

      if (products.length > 0) {
        this.saveData({ products, timestamp: data.timestamp });
      } else {
        this.clearProducts();
      }
    } catch (error) {
      console.error("Failed to remove guest product:", error);
    }
  }

  /**
   * Clear all guest products
   */
  static clearProducts(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ Cleared guest products from localStorage");
    } catch (error) {
      console.error("Failed to clear guest products:", error);
    }
  }

  /**
   * Get raw data from localStorage
   */
  private static getData(): GuestProductsData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Save data to localStorage
   */
  private static saveData(data: GuestProductsData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ============================================
  // LOCAL CART METHODS (for hybrid cart system)
  // ============================================

  /**
   * Add an item to the local cart (localStorage).
   * Used when an authenticated user creates a product - it goes to local cart
   * first and is only added to DB cart when they proceed to checkout.
   */
  static addLocalCartItem(item: Omit<LocalCartItem, "id" | "createdAt">): void {
    if (!this.isBrowser()) return;

    try {
      const data = this.getLocalCartData();
      const items = data?.items || [];

      // Check for duplicates by productId + variantId
      const existingIndex = items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      );

      if (existingIndex >= 0) {
        // Update quantity instead of adding duplicate
        items[existingIndex].quantity += item.quantity;
        console.log("🛒 Updated local cart item quantity:", item.productId);
      } else {
        // Add new item with generated ID
        const newItem: LocalCartItem = {
          ...item,
          id: generateUUID(),
          createdAt: Date.now(),
        };
        items.push(newItem);
        console.log("🛒 Added to local cart:", item.productId);
      }

      this.saveLocalCartData({ items, timestamp: Date.now() });
    } catch (error) {
      console.error("Failed to add local cart item:", error);
    }
  }

  /**
   * Get all items from local cart
   */
  static getLocalCartItems(): LocalCartItem[] {
    if (!this.isBrowser()) return [];

    try {
      const data = this.getLocalCartData();
      if (!data) return [];

      // Check expiration
      if (Date.now() - data.timestamp > EXPIRATION_TIME) {
        this.clearLocalCart();
        return [];
      }

      return data.items;
    } catch (error) {
      console.error("Failed to get local cart items:", error);
      return [];
    }
  }

  /**
   * Check if there are items in local cart
   */
  static hasLocalCartItems(): boolean {
    return this.getLocalCartItems().length > 0;
  }

  /**
   * Update quantity of a local cart item
   */
  static updateLocalCartItemQuantity(itemId: string, quantity: number): void {
    if (!this.isBrowser()) return;

    try {
      const data = this.getLocalCartData();
      if (!data) return;

      const items = data.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      this.saveLocalCartData({ items, timestamp: data.timestamp });
    } catch (error) {
      console.error("Failed to update local cart item:", error);
    }
  }

  /**
   * Remove an item from local cart by its ID
   */
  static removeLocalCartItem(itemId: string): void {
    if (!this.isBrowser()) return;

    try {
      const data = this.getLocalCartData();
      if (!data) return;

      const items = data.items.filter((item) => item.id !== itemId);

      if (items.length > 0) {
        this.saveLocalCartData({ items, timestamp: data.timestamp });
      } else {
        this.clearLocalCart();
      }

      console.log("🗑️ Removed local cart item:", itemId);
    } catch (error) {
      console.error("Failed to remove local cart item:", error);
    }
  }

  /**
   * Remove items from local cart by their IDs (batch operation)
   */
  static removeLocalCartItems(itemIds: string[]): void {
    if (!this.isBrowser()) return;

    try {
      const data = this.getLocalCartData();
      if (!data) return;

      const itemIdsSet = new Set(itemIds);
      const items = data.items.filter((item) => !itemIdsSet.has(item.id));

      if (items.length > 0) {
        this.saveLocalCartData({ items, timestamp: data.timestamp });
      } else {
        this.clearLocalCart();
      }

      console.log("🗑️ Removed local cart items:", itemIds);
    } catch (error) {
      console.error("Failed to remove local cart items:", error);
    }
  }

  /**
   * Clear all items from local cart
   */
  static clearLocalCart(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(LOCAL_CART_KEY);
      this.emitLocalCartUpdated();
      console.log("🗑️ Cleared local cart");
    } catch (error) {
      console.error("Failed to clear local cart:", error);
    }
  }

  /**
   * Get raw local cart data from localStorage
   */
  private static getLocalCartData(): LocalCartData | null {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Save local cart data to localStorage
   */
  private static saveLocalCartData(data: LocalCartData): void {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(data));
    this.emitLocalCartUpdated();
  }

  /**
   * Notify same-tab listeners that local cart changed.
   * The native "storage" event only fires across different tabs.
   */
  private static emitLocalCartUpdated(): void {
    if (!this.isBrowser()) return;
    window.dispatchEvent(new Event(LOCAL_CART_UPDATED_EVENT));
  }
}
