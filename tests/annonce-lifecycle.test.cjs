const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const mod = { exports: {} }
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../lib/annonce-lifecycle.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(mod, mod.exports)
const { annonceIsCurrent, ANNONCE_VALID_MS, currentAnnonceFilter } = mod.exports
const now = Date.parse('2026-11-12T12:00:00Z')
const recent = { status: 'active', created_at: new Date(now - 86400000).toISOString() }

test('old listings use publication date until the owner confirms them', () => {
  const old = { ...recent, created_at: new Date(now - 40 * 86400000).toISOString() }
  assert.equal(annonceIsCurrent(old, now), false)
  assert.equal(annonceIsCurrent({ ...old, last_confirmed_at: recent.created_at }, now), true)
  assert.equal(annonceIsCurrent({ ...old, last_confirmed_at: recent.created_at, status: 'closed' }, now), false)
})
test('the 30-day boundary is exact and invalid dates fail closed', () => {
  assert.equal(annonceIsCurrent(recent, now), true)
  assert.equal(annonceIsCurrent({ ...recent, created_at: new Date(now - ANNONCE_VALID_MS).toISOString() }, now), false)
  assert.equal(annonceIsCurrent({ ...recent, created_at: new Date(now - ANNONCE_VALID_MS + 1).toISOString() }, now), true)
  assert.equal(annonceIsCurrent({ ...recent, last_confirmed_at: 'invalid' }, now), false)
})
test('client queries preserve legacy null confirmation dates without changing ordering', () => {
  const filter = currentAnnonceFilter(now)
  assert.match(filter, /last_confirmed_at\.gt\.2026-10-13T12:00:00.000Z/)
  assert.match(filter, /and\(last_confirmed_at.is.null,created_at.gt\./)
})
