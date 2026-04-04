import { ErrorCodeT } from "@/shared-types";
import { AppError } from "./errorClient";

const DEFAULT_HEADERS = {
  "Accept": "*/*",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN}`,
};

interface RequestOptions {
  signal?: AbortSignal;
}

export async function GET<T>(url: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: DEFAULT_HEADERS,
    signal: options?.signal,
  });

  if (!response.ok) {
    const { message, code } = await extractErrorDetails(response);
    throw new AppError(`HTTP ${response.status}: ${message}`, code);
  }

  const data: T = await response.json();
  return data;
}

export async function POST<T>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  // Detect if body is FormData to handle headers appropriately
  const isFormData = body instanceof FormData;

  const headers = isFormData
    ? { "Accept": "*/*" } // Let browser set Content-Type with boundary for FormData
    : DEFAULT_HEADERS;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    signal: options?.signal,
  });

  if (!response.ok) {
    const { message, code } = await extractErrorDetails(response);
    throw new AppError(`HTTP ${response.status}: ${message}`, code);
  }

  const data: T = await response.json();
  return data;
}

async function extractErrorDetails(response: Response): Promise<{ message: string; code?: ErrorCodeT }> {
  try {
    const errorResult = await response.json() as { error?: unknown; message?: unknown };

    if (typeof errorResult.error === "string") {
      return {
        message: errorResult.error,
        code: errorResult.error as ErrorCodeT,
      };
    }

    if (typeof errorResult.message === "string") {
      return {
        message: errorResult.message,
      };
    }

    return { message: response.statusText || "Unknown error" };
  } catch {
    return { message: response.statusText || "Unknown error" };
  }
}
