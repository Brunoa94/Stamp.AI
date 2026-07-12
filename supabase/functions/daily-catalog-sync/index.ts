/**
 * Daily Catalog Sync Cron Job (Simplified)
 * Scheduled to run daily at 3 AM UTC
 * Syncs product costs from Printify Choice (provider 99)
 */

Deno.serve(async (req) => {
  // Verify this is a cron request
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.includes("Bearer")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    console.log("Starting daily catalog sync (Printify Choice)...");

    // Call the sync-catalog Edge Function
    const syncResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/sync-catalog`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blueprintIds: [12, 6, 145, 1389], // 1389 = Tote Bag (AOP) with EU shipping
          forceUpdate: true,
        }),
      },
    );

    const result = await syncResponse.json();

    console.log("Daily catalog sync completed:", result);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        syncResult: result,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Daily catalog sync failed:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
