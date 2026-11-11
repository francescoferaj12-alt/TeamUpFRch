const origin = 'https://teamupfr.ch'

export function internalRedirect(value: string | null): string {
  if (!value?.startsWith('/') || /^[/][ /\\]/.test(value) || /[\\\u0000-\u001f\u007f]/.test(value)) return '/annonces'
  const target = new URL(value, origin)
  if (target.origin !== origin || target.pathname.startsWith('//')) return '/annonces'
  return target.pathname + target.search + target.hash
}
