/**
 * Process Catalog Sync Queue
 * Worker function that processes queued catalog sync jobs
 *
 * This can be triggered:
 * 1. By cron job (every 5 minutes)
 * 2. Manually via POST request
 * 3. By webhook when product is added
 *
 * Usage:
 * POST /process-catalog-queue
 * {
 *   "maxJobs": 5  // Optional: max jobs to process in one run
 * }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireServiceRoleOrCron } from "../_shared/authGuard.ts";

const PRINTIFY_API_BASE = "https://api.printify.com/v1";

interface QueueJob {
  queue_id: string;
  blueprint_id: number;
  product_id: string;
  countries: string[];
}

Deno.serve(async (req) => {
  try {
    requireServiceRoleOrCron(req);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PRINTIFY_API_TOKEN = Deno.env.get("PRINTIFY_API_TOKEN")!;
    const PRINTIFY_SHOP_ID = Deno.env.get("PRINTIFY_SHOP_ID")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get request parameters
    const { maxJobs = 5 } = await req.json().catch(() => ({}));

    console.log(`Processing up to ${maxJobs} queued sync jobs...`);

    const results = {
      processed: 0,
      completed: 0,
      failed: 0,
      jobs: [] as Array<{ blueprint_id: number; status: string; error?: string }>,
    };

    // Process jobs one by one
    for (let i = 0; i < maxJobs; i++) {
      // Get next job from queue
      const { data: jobs, error: queueError } = await supabase.rpc(
        "get_next_product_to_sync"
      );

      if (queueError) {
        console.error("Error fetching from queue:", queueError);
        break;
      }

      if (!jobs || jobs.length === 0) {
        console.log("No more jobs in queue");
        break;
      }

      const job: QueueJob = jobs[0];
      console.log(`Processing job: Blueprint ${job.blueprint_id}`);

      try {
        // Call the sync-catalog function for this blueprint
        const syncResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/sync-catalog`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blueprintIds: [job.blueprint_id],
              countries: job.countries,
              forceUpdate: true,
            }),
          }
        );

        const syncResult = await syncResponse.json();

        if (syncResult.success && syncResult.errors.length === 0) {
          // Mark as completed
          await supabase.rpc("update_sync_queue_status", {
            p_queue_id: job.queue_id,
            p_status: "completed",
          });

          results.completed++;
          results.jobs.push({
            blueprint_id: job.blueprint_id,
            status: "completed",
          });

          console.log(`✅ Blueprint ${job.blueprint_id} synced successfully`);
        } else {
          // Mark as failed
          const errorMsg =
            syncResult.errors?.[0]?.error || "Sync failed with unknown error";

          await supabase.rpc("update_sync_queue_status", {
            p_queue_id: job.queue_id,
            p_status: "failed",
            p_error_message: errorMsg,
          });

          results.failed++;
          results.jobs.push({
            blueprint_id: job.blueprint_id,
            status: "failed",
            error: errorMsg,
          });

          console.error(`❌ Blueprint ${job.blueprint_id} failed:`, errorMsg);
        }

        results.processed++;
      } catch (error) {
        // Mark as failed with error
        const errorMsg = error instanceof Error ? error.message : String(error);

        await supabase.rpc("update_sync_queue_status", {
          p_queue_id: job.queue_id,
          p_status: "failed",
          p_error_message: errorMsg,
        });

        results.failed++;
        results.jobs.push({
          blueprint_id: job.blueprint_id,
          status: "failed",
          error: errorMsg,
        });

        console.error(`❌ Blueprint ${job.blueprint_id} failed:`, error);
      }
    }

    // Clean up old queue entries
    const { data: cleanupCount } = await supabase.rpc("cleanup_old_sync_queue");
    if (cleanupCount) {
      console.log(`🧹 Cleaned up ${cleanupCount} old queue entries`);
    }

    console.log(
      `Queue processing complete: ${results.completed} succeeded, ${results.failed} failed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.processed,
        completed: results.completed,
        failed: results.failed,
        jobs: results.jobs,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Queue processor error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
