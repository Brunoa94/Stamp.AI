import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability/errorCapture";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
  };
}

interface HealthCheck {
  status: "pass" | "fail" | "warn";
  message?: string;
  latencyMs?: number;
}

const startTime = Date.now();

/**
 * Health Check Endpoint
 *
 * GET /api/health - Returns application health status
 *
 * Used by:
 * - Load balancers for routing decisions
 * - Kubernetes liveness/readiness probes
 * - Monitoring systems for uptime tracking
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const checks: HealthStatus["checks"] = {
    database: await checkDatabase(),
    memory: checkMemory(),
  };

  const allPassing = Object.values(checks).every((c) => c.status === "pass");
  const anyFailing = Object.values(checks).some((c) => c.status === "fail");

  const status: HealthStatus = {
    status: anyFailing ? "unhealthy" : allPassing ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  // Return 503 if unhealthy, 200 otherwise
  const httpStatus = status.status === "unhealthy" ? 503 : 200;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    const supabase = await createClient();

    // Simple query to verify connectivity
    const { error } = await supabase.from("profiles").select("id").limit(1);

    const latencyMs = Date.now() - start;

    // The endpoint is public: details go to the server log, not the response.
    if (error) {
      captureError(new Error(error.message), { service: "HealthAPI", action: "checkDatabase" });
      return {
        status: "fail",
        message: "Database query failed",
        latencyMs,
      };
    }

    // Warn if latency is high (> 500ms)
    if (latencyMs > 500) {
      return {
        status: "warn",
        message: "Database latency is high",
        latencyMs,
      };
    }

    return {
      status: "pass",
      latencyMs,
    };
  } catch (error) {
    captureError(error, { service: "HealthAPI", action: "checkDatabase" });
    return {
      status: "fail",
      message: "Database connection failed",
      latencyMs: Date.now() - start,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheck {
  // Only available in Node.js runtime
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    const percentUsed = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    // Only the level is public; heap sizes would help an attacker size a DoS.
    if (percentUsed > 95) {
      return { status: "fail", message: "Critical memory usage" };
    }

    if (percentUsed > 80) {
      return { status: "warn", message: "High memory usage" };
    }

    return { status: "pass" };
  }

  return {
    status: "pass",
    message: "Memory check not available in this runtime",
  };
}
