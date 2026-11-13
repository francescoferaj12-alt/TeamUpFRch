import * as Sentry from '@sentry/nextjs'
import { sanitizeTelemetry, telemetryText } from './telemetry-privacy'

type LogLevel = 'info' | 'warn' | 'error'

export function log(level: LogLevel, message: string, data?: object) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...data,
  }

  if (level === 'error') {
    console.error(JSON.stringify(sanitizeTelemetry(entry)))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(sanitizeTelemetry(entry)))
  } else {
    console.log(JSON.stringify(sanitizeTelemetry(entry)))
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
  log('error', telemetryText(error instanceof Error ? error.message : String(error)), context)
}
