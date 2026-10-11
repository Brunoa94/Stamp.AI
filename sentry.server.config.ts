// Sentry for the Node.js server runtime. Options (DSN, environment, PII
// scrubbing) are shared with the browser and edge runtimes; Sentry is off
// unless NEXT_PUBLIC_SENTRY_DSN is set.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { buildSentryOptions } from "@/lib/observability/sentryConfig";

Sentry.init(buildSentryOptions());
