// Called only after every known remote order has verified cancellation.
export async function cleanAccountData(admin, id) {
  const checked = (result, operation) => {
    if (result.error) {
      const cause = [result.error.code, result.error.status, result.error.message].filter(Boolean).join(' / ') || 'unknown';
      throw new Error(`${operation} failed (${cause}); account ledger retained`);
    }
    return result.data;
  };
  const orders = checked(await admin.from('orders').select('id').eq('user_id', id), 'Order cleanup discovery').map(r => r.id);
  const carts = checked(await admin.from('carts').select('id').eq('user_id', id), 'Cart cleanup discovery').map(r => r.id);
  if (orders.length) {
    const invoices = checked(await admin.from('invoices').select('pdf_bucket,pdf_path').in('order_id', orders), 'Invoice cleanup discovery');
    for (const invoice of invoices) {
      if (invoice.pdf_bucket && invoice.pdf_path) checked(await admin.storage.from(invoice.pdf_bucket).remove([invoice.pdf_path]), 'Invoice PDF cleanup');
    }
    for (const table of ['refunds', 'invoices', 'order_items']) checked(await admin.from(table).delete().in('order_id', orders), `${table} cleanup`);
    checked(await admin.from('orders').delete().in('id', orders), 'Order cleanup');
  }
  if (carts.length) checked(await admin.from('cart_items').delete().in('cart_id', carts), 'Cart item cleanup');
  for (const table of ['carts', 'products', 'payment_transactions', 'payment_recovery']) checked(await admin.from(table).delete().eq('user_id', id), `${table} cleanup`);
  // Optional audit tables are absent in older test schemas. Missing tables have
  // no rows to remove; all other cleanup errors still preserve the ledger.
  for (const table of ['amount_validation_failures', 'test_mode_violations']) {
    const result = await admin.from(table).delete().eq('user_id', id);
    if (result.error?.code === 'PGRST205') console.warn(`Test schema missing optional audit table: ${table}`);
    else checked(result, `${table} cleanup`);
  }
  const deletedUser = await admin.auth.admin.deleteUser(id);
  // Recovery can resume after a prior run deleted the user but stopped before
  // marking the durable account ledger complete.
  if (deletedUser.error?.code !== 'user_not_found') checked(deletedUser, 'Isolated user cleanup');
}
