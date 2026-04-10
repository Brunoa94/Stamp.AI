import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OrderService } from "./orderService";
import { OrderItemService } from "./orderItemService";
import { OrderServiceMapper } from "@/mappers/services";

describe("OrderService.createOrderFromCart", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps shipping details into customer fields and addresses", async () => {
    const user = {
      id: "user-1",
      email: "account@email.com",
    } as any;

    const cart = {
      cart_items: [{ id: "item-1" }],
    } as any;

    const shippingAddress = {
      first_name: "Bruno",
      last_name: "Afonso",
      email: "checkout@email.com",
      phone: "+351912345678",
      country: "PT",
      region: "Lisbon",
      address1: "Rua A",
      address2: "Apt 2",
      city: "Lisbon",
      zip: "1000-001",
    };

    vi.spyOn(OrderServiceMapper, "generateOrderNumber").mockReturnValue("ORD-123");
    vi.spyOn(OrderServiceMapper, "calculateOrderTotals").mockReturnValue({
      subtotal: 10,
      tax_amount: 0,
      shipping_cost: 0,
      total_amount: 10,
    });
    vi.spyOn(OrderServiceMapper, "mapUserAndTotalsToCreateOrder").mockReturnValue({
      user_id: user.id,
      customer_email: user.email,
      order_number: "ORD-123",
      status: "waiting_payment",
      payment_status: "pending",
      subtotal: 10,
      shipping_cost: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 10,
    } as any);

    vi.spyOn(OrderServiceMapper, "mapCartItemToOrderItem").mockReturnValue({} as any);

    const createOrderSpy = vi
      .spyOn(OrderService, "createOrder")
      .mockResolvedValue({ id: "order-1" } as any);

    const createOrderItemsSpy = vi
      .spyOn(OrderItemService, "createOrderItems")
      .mockResolvedValue([] as any);

    await OrderService.createOrderFromCart({
      user,
      cart,
      paymentStatus: "pending",
      orderStatus: "waiting_payment",
      paymentMethod: "stripe",
      shippingAddress,
    });

    expect(createOrderSpy).toHaveBeenCalledTimes(1);

    const payload = createOrderSpy.mock.calls[0][0] as any;

    expect(payload.customer_name).toBe("Bruno Afonso");
    expect(payload.customer_phone).toBe("+351912345678");
    expect(payload.customer_email).toBe("checkout@email.com");
    expect(payload.shipping_address).toEqual(shippingAddress);
    expect(payload.billing_address).toEqual(shippingAddress);
    expect(payload.payment_method).toBe("stripe");

    expect(createOrderItemsSpy).toHaveBeenCalledTimes(1);
  });

  it("uses available shipping first name even when last name is missing", async () => {
    const user = {
      id: "user-1",
      email: "account@email.com",
    } as any;

    const cart = {
      cart_items: [],
    } as any;

    const shippingAddress = {
      first_name: "OnlyFirst",
      email: "checkout@email.com",
      country: "PT",
      address1: "Rua A",
      city: "Lisbon",
    } as any;

    vi.spyOn(OrderServiceMapper, "generateOrderNumber").mockReturnValue("ORD-123");
    vi.spyOn(OrderServiceMapper, "calculateOrderTotals").mockReturnValue({
      subtotal: 0,
      tax_amount: 0,
      shipping_cost: 0,
      total_amount: 0,
    });
    vi.spyOn(OrderServiceMapper, "mapUserAndTotalsToCreateOrder").mockReturnValue({
      user_id: user.id,
      customer_email: user.email,
      order_number: "ORD-123",
      status: "waiting_payment",
      payment_status: "pending",
      subtotal: 0,
      shipping_cost: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
    } as any);

    const createOrderSpy = vi
      .spyOn(OrderService, "createOrder")
      .mockResolvedValue({ id: "order-2" } as any);

    vi.spyOn(OrderItemService, "createOrderItems").mockResolvedValue([] as any);

    await OrderService.createOrderFromCart({
      user,
      cart,
      paymentStatus: "pending",
      orderStatus: "waiting_payment",
      shippingAddress,
    });

    const payload = createOrderSpy.mock.calls[0][0] as any;

    expect(payload.customer_name).toBe("OnlyFirst");
    expect(payload.customer_phone).toBeUndefined();
    expect(payload.customer_email).toBe("checkout@email.com");
  });
});
