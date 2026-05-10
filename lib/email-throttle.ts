// In-memory rate limiter — 1 email per userId:eventType per minute
// Note: not shared across serverless instances; fine for low-traffic single-instance usage
const sent = new Map<string, number>()

export function isThrottled(userId: string, event: string, windowMs = 60_000): boolean {
  const key = `${userId}:${event}`
  const last = sent.get(key)
  const now = Date.now()
  if (last && now - last < windowMs) return true
  sent.set(key, now)
  if (sent.size > 5000) {
    for (const [k, t] of sent) {
      if (now - t > windowMs * 2) sent.delete(k)
    }
  }
  return false
}
