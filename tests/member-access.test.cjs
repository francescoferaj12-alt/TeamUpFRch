const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const root = path.resolve(__dirname, '..')

function harness(pathname, session = null, authLoading = false, lang = 'fr') {
  const cache = new Map()
  function load(file) {
    file = path.resolve(root, file)
    if (cache.has(file)) return cache.get(file).exports
    const mod = { exports: {} }; cache.set(file, mod)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
    } }).outputText
    const localRequire = name => {
      if (name === 'next/navigation') return { usePathname: () => pathname }
      if (name === 'next/link') return { __esModule: true, default: props => React.createElement('a', props) }
      if (name.endsWith('/auth-context')) return { useAuth: () => ({ session, authLoading }) }
      if (name.endsWith('/lang-context')) return { useLang: () => ({ lang }) }
      if (!name.startsWith('.')) return require(name)
      const base = path.resolve(path.dirname(file), name)
      return load(['.ts', '.tsx'].map(ext => base + ext).find(p => fs.existsSync(p)))
    }
    new Function('module', 'exports', 'require', code)(mod, mod.exports, localRequire)
    return mod.exports
  }
  let mounted = false
  function PrivatePage() { mounted = true; return React.createElement('div', null, 'PRIVATE MEMBER DATA') }
  const Gate = load('components/MemberAccessGate.tsx').default
  const html = renderToStaticMarkup(React.createElement(Gate, null, React.createElement(PrivatePage)))
  return { html, mounted, access: load('lib/member-access.ts') }
}

test('all member pages fail closed without mounting or exposing their children', () => {
  for (const route of ['/annonces', '/recherche', '/clubs', '/club/fc-test', '/profil', '/profil/test-id', '/messages', '/dashboard', '/candidatures', '/publier', '/admin', '/admin/clubs', '/onboarding', '/faq', '/a-propos', '/unknown-future-page']) {
    const r = harness(route)
    assert.equal(r.mounted, false, route)
    assert.doesNotMatch(r.html, /PRIVATE MEMBER DATA/)
    assert.match(r.html, /Créer un compte/)
    assert.match(r.html, /Se connecter/)
  }
})

test('loading authentication never flashes protected data', () => {
  const r = harness('/profil/test-id', null, true)
  assert.equal(r.mounted, false)
  assert.match(r.html, /role="status"/)
})

test('authenticated members still reach each protected page', () => {
  for (const route of ['/annonces', '/clubs', '/messages', '/profil/test-id']) {
    const r = harness(route, { user: { id: 'member' } })
    assert.equal(r.mounted, true)
    assert.match(r.html, /PRIVATE MEMBER DATA/)
  }
})

test('landing, signup, email confirmation, recovery and legal pages stay accessible', () => {
  for (const route of ['/', '/accueil', '/login', '/verify-email', '/verify-email-pending', '/reset-password', '/privacy', '/cgu', '/login/']) {
    assert.equal(harness(route).mounted, true, route)
  }
})

test('both gate actions preserve destination; German copy is complete', () => {
  const r = harness('/profil/member-id', null, false, 'de')
  assert.match(r.html, /Konto erstellen/)
  assert.match(r.html, /Anmelden/)
  assert.match(r.html, /Zurück zum Video/)
  assert.doesNotMatch(r.html, /Créer|Se connecter/)
  for (const register of [false, true]) {
    const url = new URL(r.access.memberLoginHref('/messages?to=member', register), 'https://teamupfr.ch')
    assert.equal(url.searchParams.get('redirect'), '/messages?to=member')
    assert.equal(url.searchParams.get('mode'), register ? 'register' : null)
  }
  assert.match(r.access.memberLoginHref('//evil.example'), /redirect=%2Fannonces/)
})
