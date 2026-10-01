/** Cancellation is mandatory even when database discovery is unavailable. */
export async function discoverAndCancel({ discover, register, cancel }) {
  const errors = [];
  let rows = [];
  try {
    rows = await discover();
    for (const row of rows) if (row.printify_order_id) register(row.printify_order_id);
  } catch (error) { errors.push(error); }
  try { await cancel(); } catch (error) { errors.push(error); }
  if (errors.length) throw new AggregateError(errors, errors.map(e => e.message).join('; '));
  return rows;
}
