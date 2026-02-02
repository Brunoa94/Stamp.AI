const DEFAULT_HEADERS = {
  "Accept": "*/*",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PRINTIFY_API_TOKEN}`,
};

export async function GET<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: T = await response.json();
  return data;
}

export async function POST<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: T = await response.json();
  return data;
}
