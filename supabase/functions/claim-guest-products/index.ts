import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleClaimGuestProducts } from "./handler.ts";
import "../_shared/sentry.ts";

serve(handleClaimGuestProducts);
