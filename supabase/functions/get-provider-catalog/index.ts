import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ErrorCodes, handleError } from "../_shared/errors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { blueprint_ids, provider_id } = await req.json();

    console.log("=== GET PROVIDER CATALOG ===");
    console.log("Blueprint IDs:", blueprint_ids);
    console.log("Provider ID filter:", provider_id);

    const supabase = createServiceClient();

    let query = supabase
      .from("provider_catalog")
      .select("*")
      .gt("expires_at", new Date().toISOString());

    if (blueprint_ids && Array.isArray(blueprint_ids)) {
      query = query.in("blueprint_id", blueprint_ids);
    }

    if (provider_id) {
      query = query.eq("provider_id", provider_id);
    }

    const { data, error } = await query.order("blueprint_id", {
      ascending: true,
    });

    if (error) {
      throw ErrorCodes.DATABASE_ERROR(error.message);
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No cached data found. Please trigger catalog refresh.",
          cache_miss: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    console.log(`✅ Found ${data.length} cached entries`);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        count: data.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting provider catalog:", error);
    return handleError(error, corsHeaders);
  }
});
