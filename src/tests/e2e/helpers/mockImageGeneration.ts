import type { Page } from "@playwright/test";

const imageUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=";

/** Keep wizard UI tests deterministic without spending the test user's coins. */
export async function mockImageGeneration(page: Page, prompt: string) {
  await page.route("**/api/generate-image", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        imageUrl,
        enhancedPrompt: prompt,
        originalPrompt: prompt,
      }),
    }),
  );
}
