const { withSentryConfig } = require('@sentry/nextjs/config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
})
