"use client";

import { useState } from "react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { ProviderCatalogService } from "@/services/providerCatalogService";

/**
 * Admin page to manually trigger catalog refresh
 * Access: /admin/refresh-catalog
 */
export default function RefreshCatalogPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: any;
  } | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setResult(null);

    try {
      await ProviderCatalogService.refreshCatalog();
      setResult({
        success: true,
        message: "✅ Catalog refreshed successfully!",
      });
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-concrete p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Span variant="sm" className="mb-2 text-ink/40">
            ADMIN TOOLS
          </Span>
          <Heading as="h1" variant="title" className="text-ink">
            Refresh Product Catalog
          </Heading>
        </div>

        <div className="rounded-2xl border-2 border-ink/10 bg-white p-8">
          <div className="space-y-6">
            <div>
              <Span variant="sm" className="mb-2 text-ink">
                CATALOG REFRESH
              </Span>
              <p className="text-sm text-ink/60 mt-2">
                This will trigger the <code className="bg-ink/5 px-2 py-1 rounded">fetch-provider-catalog</code> Edge Function
                to refresh the product catalog cache in the database.
              </p>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="brutalist-primary"
              className="w-full"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Catalog Now"}
            </Button>

            {result && (
              <div
                className={`rounded-xl border-2 p-4 ${
                  result.success
                    ? "border-green-500/20 bg-green-50"
                    : "border-red-500/20 bg-red-50"
                }`}
              >
                <pre className="text-sm whitespace-pre-wrap font-space">
                  {result.message}
                </pre>
                {result.summary && (
                  <pre className="mt-2 text-xs text-ink/60">
                    {JSON.stringify(result.summary, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-ink/10 bg-white p-8">
          <Span variant="sm" className="mb-2 text-ink">
            TROUBLESHOOTING
          </Span>
          <ul className="mt-4 space-y-2 text-sm text-ink/60">
            <li>• Check that the Edge Function is deployed to Supabase</li>
            <li>• Verify your environment variables are set correctly</li>
            <li>• Check Supabase logs for error details</li>
            <li>• Ensure the database schema includes provider_catalog table</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
