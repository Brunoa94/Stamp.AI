import { ErrorCodes } from "./errors.ts"

// Environment variable validation
export const validateEnvVars = {
  supabaseUrl: (): string => {
    const url = Deno.env.get('SUPABASE_URL')
    if (!url) throw ErrorCodes.SUPABASE_URL_MISSING()
    return url
  },

  supabaseServiceKey: (): string => {
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!key) throw ErrorCodes.SUPABASE_SERVICE_ROLE_KEY_MISSING()
    return key
  },

  supabaseAnonKey: (): string => {
    const key = Deno.env.get('SUPABASE_ANON_KEY')
    if (!key) throw ErrorCodes.SUPABASE_SERVICE_ROLE_KEY_MISSING()
    return key
  },

  printifyToken: (): string => {
    const token = Deno.env.get('PRINTIFY_API_TOKEN')
    if (!token) throw ErrorCodes.PRINTIFY_TOKEN_MISSING()
    return token
  },

  printifyShopId: (): string => {
    const shopId = Deno.env.get('PRINTIFY_SHOP_ID')
    if (!shopId) throw ErrorCodes.PRINTIFY_SHOP_ID_MISSING()
    return shopId
  },

  stripeSecretKey: (): string => {
    const key = Deno.env.get('STRIPE_SECRET_KEY')
    if (!key) throw ErrorCodes.STRIPE_SECRET_KEY_MISSING()
    return key
  },

  stripeWebhookSecret: (): string => {
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!secret) throw ErrorCodes.STRIPE_WEBHOOK_SECRET_MISSING()
    return secret
  },

  // PayPal environment validators
  paypalClientId: (): string => {
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    if (!clientId) throw ErrorCodes.PAYPAL_CLIENT_ID_MISSING()
    return clientId
  },

  paypalClientSecret: (): string => {
    const secret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    if (!secret) throw ErrorCodes.PAYPAL_CLIENT_SECRET_MISSING()
    return secret
  },

  paypalWebhookId: (): string => {
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
    if (!webhookId) throw ErrorCodes.PAYPAL_WEBHOOK_ID_MISSING()
    return webhookId
  },

  paypalMode: (): 'sandbox' | 'live' => {
    const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox'
    return mode === 'live' ? 'live' : 'sandbox'
  },

  // Mollie environment validators
  mollieApiKey: (): string => {
    const apiKey = Deno.env.get('MOLLIE_API_KEY')
    if (!apiKey) throw ErrorCodes.MOLLIE_API_KEY_MISSING()
    return apiKey
  },

  mollieMode: (): 'test' | 'live' => {
    const apiKey = Deno.env.get('MOLLIE_API_KEY') || ''
    // Mollie API keys start with 'test_' or 'live_'
    return apiKey.startsWith('live_') ? 'live' : 'test'
  }
}

// Request validation
export const validateRequest = {
  email: (email?: string): string => {
    if (!email) throw ErrorCodes.EMAIL_REQUIRED()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw ErrorCodes.INVALID_EMAIL_FORMAT()
    }

    return email
  },

  password: (password?: string): string => {
    if (!password) throw ErrorCodes.PASSWORD_REQUIRED()

    if (password.length < 8) {
      throw ErrorCodes.PASSWORD_TOO_SHORT()
    }

    return password
  },

  blueprintId: (blueprintId?: number): number => {
    if (!blueprintId) throw ErrorCodes.BLUEPRINT_ID_REQUIRED()
    return blueprintId
  },

  printProviderId: (printProviderId?: number): number => {
    if (!printProviderId) throw ErrorCodes.PRINT_PROVIDER_ID_REQUIRED()
    return printProviderId
  },

  amount: (amount?: number): number => {
    if (!amount) throw ErrorCodes.AMOUNT_REQUIRED()

    if (typeof amount !== 'number' || amount <= 0) {
      throw ErrorCodes.INVALID_AMOUNT()
    }

    return amount
  },

  token: (token?: string): string => {
    if (!token) throw ErrorCodes.INVALID_TOKEN()
    return token
  },

  webhookSignature: (signature?: string | null): string => {
    if (!signature) throw ErrorCodes.WEBHOOK_SIGNATURE_MISSING()
    return signature
  },

  imageUpload: (imageUrl?: string, imageBase64?: string): void => {
    if (!imageUrl && !imageBase64) {
      throw ErrorCodes.IMAGE_URL_OR_BASE64_REQUIRED()
    }
  }
}

// JWT token extraction from Authorization header
export const extractBearerToken = (authHeader?: string | null): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ErrorCodes.INVALID_TOKEN()
  }
  return authHeader.replace('Bearer ', '')
}

/**
 * Verified auth result interface
 */
export interface VerifiedAuthResultI {
  userId: string;
  userEmail: string;
}

/**
 * Verify authentication - accepts both user JWT tokens and service role key.
 * Returns user info if available, or service identifier if using service role.
 */
export async function verifyAuth(authHeader: string | null): Promise<VerifiedAuthResultI> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = validateEnvVars.supabaseUrl();
  const supabaseAnonKey = validateEnvVars.supabaseAnonKey();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Check if it's the service role key (server-to-server calls)
  if (serviceRoleKey && token === serviceRoleKey) {
    console.log("Authenticated with service role key");
    return {
      userId: "service-role",
      userEmail: "service@system.internal",
    };
  }

  // Otherwise, validate as user JWT token
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!response.ok) {
    // Do not log token material or response bodies (may contain PII).
    console.error("Auth verification failed:", response.status);
    throw ErrorCodes.INVALID_TOKEN();
  }

  const user = await response.json();

  if (!user || !user.id) {
    throw ErrorCodes.INVALID_TOKEN();
  }

  console.log("Authenticated user:", user.id);
  return {
    userId: user.id,
    userEmail: user.email || "",
  };
}