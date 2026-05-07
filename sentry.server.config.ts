import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
  beforeSend(event) {
    // Strip PII from request data
    if (event.request?.cookies) event.request.cookies = {};
    if (event.request?.headers?.authorization) {
      event.request.headers.authorization = '[Filtered]';
    }
    return event;
  },
});
