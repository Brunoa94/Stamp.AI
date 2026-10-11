/**
 * Sends the order confirmation and shipping notification emails.
 *
 * Best-effort: these never throw. Each email is claimed atomically through
 * its orders.*_email_sent_at column (PATCH ... WHERE column IS NULL), so
 * concurrent webhooks or sync runs send it at most once; a failed send
 * releases the claim so a later run retries.
 */

import { supabaseRest } from "./supabase.ts";
import { sendBrevoEmail } from "./brevoEmail.ts";
import { reportError } from "./errorReporting.ts";
import {
  renderOrderConfirmationEmail,
  renderShippingNotificationEmail,
  type EmailOrderI,
  type EmailOrderItemI,
  type RenderedEmailI,
} from "./orderEmailContent.ts";

type SentColumnT = "confirmation_email_sent_at" | "shipping_email_sent_at";

interface ClaimedOrderI extends EmailOrderI {
  id: string;
  customer_email: string | null;
}

const ORDER_COLUMNS = "id,order_number,customer_email,customer_name,currency,subtotal,discount_amount,shipping_cost,tax_amount,total_amount,shipping_address,tracking_number,tracking_url";

async function claim(orderId: string, column: SentColumnT, extraFilter = ""): Promise<ClaimedOrderI | null> {
  const result = await supabaseRest<ClaimedOrderI[]>(
    `orders?id=eq.${orderId}&${column}=is.null${extraFilter}&select=${ORDER_COLUMNS}`,
    "PATCH",
    { [column]: new Date().toISOString() },
    { prefer: "return=representation" },
  );
  if (result.error) throw new Error(`Could not claim ${column}`);
  return result.data?.[0] ?? null;
}

async function release(orderId: string, column: SentColumnT): Promise<void> {
  await supabaseRest(`orders?id=eq.${orderId}`, "PATCH", { [column]: null });
}

async function sendClaimed(
  orderId: string,
  column: SentColumnT,
  extraFilter: string,
  render: (order: ClaimedOrderI) => Promise<RenderedEmailI>,
): Promise<boolean> {
  let order: ClaimedOrderI | null = null;
  try {
    order = await claim(orderId, column, extraFilter);
    if (!order) return false; // already sent, or not eligible
    if (!order.customer_email) {
      await release(orderId, column);
      return false;
    }
    const email = await render(order);
    const sent = await sendBrevoEmail({ to: order.customer_email, subject: email.subject, htmlContent: email.html, textContent: email.text });
    if (!sent) await release(orderId, column);
    return sent;
  } catch (error) {
    console.error(`Failed to send ${column} email for order ${orderId}:`, error);
    reportError(error, { orderId, email: column });
    if (order) await release(orderId, column).catch(() => {});
    return false;
  }
}

export function sendOrderConfirmationEmail(orderId: string): Promise<boolean> {
  return sendClaimed(orderId, "confirmation_email_sent_at", "&payment_status=eq.paid", async (order) => {
    const items = await supabaseRest<EmailOrderItemI[]>(
      `order_items?order_id=eq.${orderId}&select=product_name,variant_name,quantity,total_price`,
      "GET",
    );
    if (items.error) throw new Error("Could not load order items");
    return renderOrderConfirmationEmail(order, items.data ?? []);
  });
}

export function sendShippingNotificationEmail(orderId: string): Promise<boolean> {
  return sendClaimed(orderId, "shipping_email_sent_at", "&tracking_number=not.is.null", async (order) =>
    renderShippingNotificationEmail(order));
}
