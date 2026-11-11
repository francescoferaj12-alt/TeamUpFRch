// Keep visible pages up to date if the free Realtime connection quota is reached
// or a mobile network drops its WebSocket. Healthy subscriptions do not poll.
export function realtimeFallback(refresh: () => void, intervalMs = 30_000) {
  let healthy = false
  let stopped = false
  const poll = () => {
    if (!stopped && !healthy && document.visibilityState === 'visible') refresh()
  }
  const timer = setInterval(poll, intervalMs)
  document.addEventListener('visibilitychange', poll)
  return {
    status(status: string) {
      if (stopped) return
      const wasHealthy = healthy
      healthy = status === 'SUBSCRIBED'
      if (healthy && !wasHealthy && document.visibilityState === 'visible') refresh()
    },
    stop() {
      stopped = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', poll)
    },
  }
}
