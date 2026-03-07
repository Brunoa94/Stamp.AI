# Queries Layer Pattern

## Overview

The `queries` folder contains all **React Query queries and mutations** for the application. This layer sits between the UI components and the service layer, providing a centralized location for all server state management.

## Architecture Layers

```
┌─────────────────────────────────────┐
│        Components/Hooks             │
│     (UI Logic & Local State)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Queries Layer               │
│  (React Query Hooks & Mutations)    │
│      /src/queries/*.ts              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        Services Layer               │
│   (Business Logic & API Calls)      │
│      /src/services/*.ts             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│          Data Sources               │
│   (Supabase, External APIs, etc.)   │
└─────────────────────────────────────┘
```

## Why Separate Queries from Hooks?

### **Problem: Decentralized React Query Logic**

Without a queries layer, React Query hooks end up scattered across:
- Component files
- Feature-specific hook files
- Multiple locations calling the same service

This leads to:
- ❌ Duplicate query definitions
- ❌ Inconsistent query keys
- ❌ Cache invalidation bugs
- ❌ Hard to find all queries for a feature
- ❌ Difficult to maintain and refactor

### **Solution: Centralized Queries Layer**

With a dedicated queries folder:
- ✅ Single source of truth for all queries
- ✅ Consistent query keys across the app
- ✅ Easy cache invalidation
- ✅ Reusable across components
- ✅ Better organization and maintainability

## Folder Structure

```
src/
├── queries/
│   ├── orderQueries.ts         # Order-related queries & mutations
│   ├── cartQueries.ts          # Cart-related queries & mutations
│   ├── productQueries.ts       # Product-related queries & mutations
│   ├── authQueries.ts          # Auth-related queries & mutations
│   └── customProductQueries.ts # Custom product queries & mutations
├── services/
│   ├── orderService.ts         # Order service methods
│   ├── cartService.ts          # Cart service methods
│   └── ...
└── hooks/
    ├── useTheme.ts             # Global utility hooks
    ├── useErrorHandler.ts      # Error handling hook
    └── ...                     # Non-query hooks only
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Query files | `[domain]Queries.ts` | `orderQueries.ts`, `productQueries.ts` |
| Query hooks | `use[Domain][Action]` | `useOrder`, `useOrders` |
| Mutation hooks | `use[Action][Domain]` | `useCreateOrder`, `useUpdateOrder` |
| Query keys | Array with domain prefix | `["orders", orderId]`, `["products", "list"]` |

## Query Pattern

### Basic Query Hook

```typescript
// src/queries/orderQueries.ts
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";

/**
 * Fetch a single order by ID
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      return OrderService.getOrder(orderId);
    },
    enabled: !!orderId, // Only run query when orderId exists
  });
}

/**
 * Fetch all orders for a user
 */
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => OrderService.getOrders(userId),
    // Optional: Add stale time for caching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch order by order number
 */
export function useOrderByNumber(orderNumber: string | null) {
  return useQuery({
    queryKey: ["orders", "number", orderNumber],
    queryFn: () => {
      if (!orderNumber) {
        throw new Error("Order number is required");
      }
      return OrderService.getOrderByNumber(orderNumber);
    },
    enabled: !!orderNumber,
  });
}
```

### Mutation Pattern

```typescript
// src/queries/orderQueries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";
import { CreateOrderT, UpdateOrderT } from "@/types/order";

/**
 * Create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderT) => OrderService.createOrder(payload),
    onSuccess: (data) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Optionally set the new order in cache
      queryClient.setQueryData(["orders", data.id], data);
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
    },
  });
}

/**
 * Update an existing order
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderT }) =>
      OrderService.updateOrder(orderId, payload),
    onSuccess: (data, variables) => {
      // Update the specific order in cache
      queryClient.setQueryData(["orders", variables.orderId], data);

      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      OrderService.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Delete an order
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.deleteOrder(orderId),
    onSuccess: (_, orderId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["orders", orderId] });

      // Refetch orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
```

## Query Key Conventions

**IMPORTANT:** Query keys must be consistent across the application to ensure proper cache management.

### Query Key Patterns

```typescript
// Single resource by ID
["orders", orderId]                    // Specific order
["products", productId]                // Specific product
["users", userId]                      // Specific user

// Collection/List queries
["orders"]                             // All orders
["orders", { userId }]                 // Orders filtered by user
["orders", { status: "pending" }]      // Orders filtered by status
["products", "list"]                   // All products
["products", { category: "tshirt" }]   // Products filtered by category

// Nested resources
["orders", orderId, "items"]           // Order items for specific order
["carts", cartId, "items"]             // Cart items for specific cart

// Special lookups
["orders", "number", orderNumber]      // Order by unique identifier
["users", "email", email]              // User by email

// Computed/derived data
["orders", "stats"]                    // Order statistics
["cart", "summary"]                    // Cart summary/totals
```

### Query Key Best Practices

1. **Use arrays, not strings**: `["orders"]` not `"orders"`
2. **Most specific first**: `["orders", orderId]` not `[orderId, "orders"]`
3. **Use objects for filters**: `["orders", { userId, status }]` for complex filters
4. **Keep keys stable**: Don't use dynamic timestamps or random values
5. **Match service domain**: Query keys should align with service organization

## Usage in Components

### Using Queries

```typescript
// ✅ Good: Import from centralized queries
import { useOrder, useOrders } from "@/queries/orderQueries";

function OrderDetailsPage({ orderId }: Props) {
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) return <OrderSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!order) return <NotFound />;

  return <OrderDetails order={order} />;
}

// ❌ Bad: Defining queries in components
function OrderDetailsPage({ orderId }: Props) {
  const { data: order } = useQuery({
    queryKey: ["order", orderId], // Inconsistent key
    queryFn: () => OrderService.getOrder(orderId),
  });

  // This creates duplicate definitions across components
}
```

### Using Mutations

```typescript
// ✅ Good: Import mutations from centralized queries
import { useCreateOrder, useUpdateOrderStatus } from "@/queries/orderQueries";

function CreateOrderForm() {
  const createOrder = useCreateOrder();
  const { handleError } = useErrorHandler();

  const handleSubmit = async (data: CreateOrderT) => {
    try {
      const order = await createOrder.mutateAsync(data);
      toast.success("Order created successfully!");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      handleError({
        message: "Failed to create order",
        error: "ORDER_CREATE_FAILED",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button
        type="submit"
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? "Creating..." : "Create Order"}
      </Button>
    </form>
  );
}

// ❌ Bad: Defining mutations in components
function CreateOrderForm() {
  const queryClient = useQueryClient();
  const createOrder = useMutation({
    mutationFn: OrderService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // This creates duplicate mutation logic
}
```

## Advanced Patterns

### Optimistic Updates

```typescript
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      OrderService.updateOrderStatus(orderId, status),

    // Optimistically update the UI before the server responds
    onMutate: async ({ orderId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orders", orderId] });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData(["orders", orderId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["orders", orderId], (old: any) => ({
        ...old,
        status,
      }));

      // Return context with the previous value
      return { previousOrder };
    },

    // On error, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["orders", variables.orderId],
          context.previousOrder
        );
      }
    },

    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.orderId] });
    },
  });
}
```

### Dependent Queries

```typescript
export function useOrderWithDetails(orderId: string | null) {
  // First query: Fetch the order
  const orderQuery = useOrder(orderId);

  // Second query: Fetch order items (only if order exists)
  const itemsQuery = useQuery({
    queryKey: ["orders", orderId, "items"],
    queryFn: () => OrderItemService.getOrderItems(orderId!),
    enabled: !!orderId && !!orderQuery.data,
  });

  return {
    order: orderQuery.data,
    items: itemsQuery.data,
    isLoading: orderQuery.isLoading || itemsQuery.isLoading,
    error: orderQuery.error || itemsQuery.error,
  };
}
```

### Prefetching

```typescript
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["orders", orderId],
      queryFn: () => OrderService.getOrder(orderId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

// Usage in a list component
function OrderList({ orders }: Props) {
  const prefetchOrder = usePrefetchOrder();

  return (
    <div>
      {orders.map((order) => (
        <div
          key={order.id}
          onMouseEnter={() => prefetchOrder(order.id)}
        >
          <Link href={`/orders/${order.id}`}>
            {order.order_number}
          </Link>
        </div>
      ))}
    </div>
  );
}
```

## Complete Example: Product Queries

```typescript
// src/queries/productQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductService } from "@/services/productService";
import { CreateProductT, UpdateProductT } from "@/types/product";

// ============================================
// QUERIES (Read Operations)
// ============================================

/**
 * Fetch all products
 */
export function useProducts(filters?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => ProductService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Fetch a single product by ID
 */
export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => {
      if (!productId) throw new Error("Product ID is required");
      return ProductService.getProduct(productId);
    },
    enabled: !!productId,
  });
}

/**
 * Fetch products by category
 */
export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ["products", { category }],
    queryFn: () => ProductService.getProductsByCategory(category),
  });
}

// ============================================
// MUTATIONS (Write Operations)
// ============================================

/**
 * Create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductT) => ProductService.createProduct(payload),
    onSuccess: (data) => {
      // Add to cache
      queryClient.setQueryData(["products", data.id], data);

      // Refetch products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: UpdateProductT }) =>
      ProductService.updateProduct(productId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["products", variables.productId], data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => ProductService.deleteProduct(productId),
    onSuccess: (_, productId) => {
      queryClient.removeQueries({ queryKey: ["products", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

## Migration Guide

### Migrating from Component-Level Queries

**Before:**
```typescript
// components/OrderList.tsx
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "@/services/orderService";

function OrderList() {
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: OrderService.getOrders,
  });

  // Component logic...
}
```

**After:**
```typescript
// src/queries/orderQueries.ts
export function useOrders(userId?: string) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => OrderService.getOrders(userId),
  });
}

// components/OrderList.tsx
import { useOrders } from "@/queries/orderQueries";

function OrderList() {
  const { data: orders } = useOrders();

  // Component logic...
}
```

## Best Practices

### ✅ DO

1. **Centralize all queries**: Put all React Query hooks in `src/queries/`
2. **One file per domain**: Match service file organization
3. **Consistent query keys**: Use the documented patterns
4. **Handle errors**: Include onError callbacks in mutations
5. **Invalidate caches**: Always invalidate related queries after mutations
6. **Use TypeScript**: Properly type all query/mutation functions
7. **Document hooks**: Add JSDoc comments explaining what each hook does
8. **Enable conditionally**: Use `enabled` option for dependent queries

### ❌ DON'T

1. **Don't define queries in components**: Always import from queries folder
2. **Don't duplicate query logic**: Reuse existing query hooks
3. **Don't use inconsistent keys**: Stick to the documented patterns
4. **Don't skip cache invalidation**: Always update cache after mutations
5. **Don't mix concerns**: Keep queries separate from business logic
6. **Don't hardcode values**: Use variables for query key filters
7. **Don't forget loading states**: Always handle isLoading and error states
8. **Don't skip enabled checks**: Use `enabled` for conditional queries

## Testing Queries

```typescript
// __tests__/queries/orderQueries.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOrder, useCreateOrder } from "@/queries/orderQueries";
import { OrderService } from "@/services/orderService";

// Mock the service
jest.mock("@/services/orderService");

describe("Order Queries", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it("should fetch order successfully", async () => {
    const mockOrder = { id: "1", order_number: "ORD-123" };
    (OrderService.getOrder as jest.Mock).mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useOrder("1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrder);
  });

  it("should create order successfully", async () => {
    const mockOrder = { id: "1", order_number: "ORD-123" };
    (OrderService.createOrder as jest.Mock).mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    await result.current.mutateAsync({ user_id: "user1" });

    expect(OrderService.createOrder).toHaveBeenCalled();
  });
});
```

## Summary

The queries layer provides:

- **Centralized server state management** - Single source of truth
- **Consistent caching strategy** - Predictable query keys
- **Reusable across features** - Import queries anywhere
- **Type-safe API** - Full TypeScript support
- **Easy cache invalidation** - Consistent query key patterns
- **Better maintainability** - Clear separation of concerns

By following this pattern, your application's server state management becomes more predictable, maintainable, and scalable.
