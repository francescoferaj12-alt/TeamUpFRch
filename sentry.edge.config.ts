import * as Sentry from '@sentry/nextjs'
import { sanitizeTelemetry } from './lib/telemetry-privacy'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  beforeSend: sanitizeTelemetry,
  beforeBreadcrumb: sanitizeTelemetry,
  beforeSendTransaction: sanitizeTelemetry,
})
