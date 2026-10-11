import { describe, expect, it } from "vitest";
import { isAllowedImageSource } from "../../../supabase/functions/_shared/imageSourceRules";
const project = "https://own.supabase.co";
describe("image sources", () => {
  it.each(["https://evil.supabase.co/storage/v1/object/public/a.png", "https://attacker.s3.amazonaws.com/a.png", "https://own.supabase.co/auth/v1/user", "https://user:pass@images.printify.com/a.png", "https://images.printify.com:8443/a.png", "http://images.printify.com/a.png", "http://169.254.169.254/"])("rejects %s", url => { expect(isAllowedImageSource(url, project)).toBe(false); });
  it.each(["https://own.supabase.co/storage/v1/object/sign/designs/a.png?token=example", "https://images.printify.com/a.png", "https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com/a.png"])("allows %s", url => { expect(isAllowedImageSource(url, project)).toBe(true); });
});
