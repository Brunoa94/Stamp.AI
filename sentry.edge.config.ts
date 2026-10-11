// Sentry for edge features (middleware, edge routes). Unrelated to the
// Vercel Edge Runtime and also required when running locally. Options are
// shared with the other runtimes; Sentry is off unless NEXT_PUBLIC_SENTRY_DSN is set.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { buildSentryOptions } from "@/lib/observability/sentryConfig";

Sentry.init(buildSentryOptions());
