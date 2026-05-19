import * as Sentry from '@sentry/nextjs'

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
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
  log('error', error instanceof Error ? error.message : String(error), context)
}
