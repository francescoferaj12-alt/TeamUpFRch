import * as Sentry from '@sentry/nextjs'
import { sanitizeTelemetry } from './lib/telemetry-privacy'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  beforeBreadcrumb: sanitizeTelemetry,
  beforeSendTransaction: sanitizeTelemetry,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection',
    /^Network Error/,
    /^Loading chunk/,
    'AbortError',
  ],
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') return null
    return sanitizeTelemetry(event)
  },
})
