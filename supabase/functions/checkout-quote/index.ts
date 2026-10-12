import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkoutQuoteHandler } from "../_shared/checkoutQuote.ts";

serve(checkoutQuoteHandler);
