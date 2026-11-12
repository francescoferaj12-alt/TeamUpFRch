const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')

// Render the real page with hook state and asynchronous data adapters. This
// checks that confirmation sends persisted answers instead of empty defaults.
function harness(profile, lang = 'fr') {
  const state = [], effects = [], writes = [], cache = new Map()
  let cursor = 0, initial = true
  const react = { ...require('react'), useState(value) {
    const index = cursor++
    if (!(index in state)) state[index] = value
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
  }, useEffect(fn) { if (initial) effects.push(fn) } }
  const router = { push() {} }
  const supabase = { auth: { getSession: async () => ({ data: { session: { user: { id: 'test-user' }, access_token: 'test-token' } } }) },
    from(table) {
      let projection
      const query = { select(columns) { projection = columns; return query }, eq() { return query },
        single: async () => ({ data: !profile ? null : projection === '*' ? profile : Object.fromEntries(projection.split(',').map(k => [k.trim(), profile[k.trim()]])) }),
        order: async () => ({ data: [], error: null }) }
      return query
    } }
  function load(file) {
    file = path.resolve(root, file)
    if (cache.has(file)) return cache.get(file).exports
    const mod = { exports: {} }; cache.set(file, mod)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
    } }).outputText
    const localRequire = name => {
      if (name === 'react') return react
      if (name === 'next/navigation') return { useRouter: () => router }
      if (name.endsWith('/supabase')) return { supabase }
      if (name.endsWith('/lang-context')) return { useLang: () => ({ lang }) }
      if (!name.startsWith('.')) return require(name)
      const base = path.resolve(path.dirname(file), name)
      return load(['.ts', '.tsx', '.js'].map(ext => base + ext).find(p => fs.existsSync(p)))
    }
    const fetch = async (url, options) => {
      writes.push({ url, body: JSON.parse(options.body) })
      return { ok: true, json: async () => ({ profile_completed: false }) }
    }
    new Function('module', 'exports', 'require', 'fetch', code)(mod, mod.exports, localRequire, fetch)
    return mod.exports
  }
  const Page = load('app/onboarding/page.tsx').default
  return { writes, render() { cursor = 0; const tree = Page(); initial = false; return tree },
    async init() { this.render(); effects.forEach(fn => fn()); await flush(); return this.render() } }
}
async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve() }
function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return []
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate))
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)]
}
const field = (tree, label) => nodes(tree, n => n.props?.label === label)[0]
const base = { profile_completed: false, onboarding_step: 0 }

for (const sample of [
  { role: 'player', values: { position: 'Gardien', position_secondary: 'Attaquant' }, label: 'Position principale *', value: 'Gardien', expected: { position: 'Gardien', position_secondary: 'Attaquant' } },
  { role: 'coach', values: { coach_experience: '3-5 ans' }, label: 'Depuis combien de temps entraînes-tu ?', value: '3-5 ans', expected: { coach_experience: '3-5 ans' } },
  { role: 'club', step: 1, values: { ligue: '3ème Ligue Féminine' }, label: 'Votre ligue', value: '3ème Ligue Féminine', expected: { ligue: '3ème Ligue Féminine' } },
]) test(`${sample.role}: saved signup answers are visible and confirmed without retyping`, async () => {
  const h = harness({ ...base, role: sample.role, onboarding_step: sample.step || 0, ...sample.values })
  const tree = await h.init()
  const inputs = nodes(tree, n => n.props?.value === sample.value)
  assert.ok(inputs.length, 'The saved answer must be displayed')
  const next = nodes(tree, n => n.type === 'button' && n.props.children === 'Confirmer et continuer →')[0]
  assert.ok(next); next.props.onClick(); await flush()
  assert.equal(h.writes.length, 1)
  assert.deepEqual(h.writes[0].body.data, sample.expected)
})

test('resuming a saved player step restores league and region, including women’s leagues', async () => {
  const h = harness({ ...base, role: 'player', onboarding_step: 2, ligue: 'FF-17', zone: 'Lac' })
  const tree = await h.init()
  assert.ok(nodes(tree, n => n.props?.value === 'FF-17').length)
  assert.ok(nodes(tree, n => n.props?.value === 'Lac').length)
  const leagues = nodes(tree, n => n.props?.groups)[0]
  const selectTree = leagues.type(leagues.props)
  assert.ok(nodes(selectTree, n => n.type === 'option' && n.props.value === 'FF-17').length)
})

test('club contact details and coach diploma remain populated on resumed steps', async () => {
  for (const profile of [
    { ...base, role: 'club', onboarding_step: 4, first_name: 'Ada', last_name: 'Test', club_contact_role: 'Président(e)', club_email_public: 'public@example.test' },
    { ...base, role: 'coach', onboarding_step: 1, coach_diploma: 'UEFA B' },
  ]) {
    const tree = await harness(profile).init()
    for (const value of profile.role === 'club' ? ['Ada', 'Test', 'Président(e)', 'public@example.test'] : ['UEFA B']) {
      assert.ok(nodes(tree, n => n.props?.value === value).length)
    }
  }
})

test('a failed profile load cannot expose a blank form or overwrite saved answers', async () => {
  const h = harness(null), tree = await h.init()
  assert.equal(tree.props.role, 'alert')
  assert.equal(nodes(tree, n => n.props?.onChange).length, 0)
  assert.equal(h.writes.length, 0)
})

test('German onboarding translates saved choices without changing stored values', async () => {
  const h = harness({ ...base, role: 'player', position: 'Gardien' }, 'de')
  const tree = await h.init(), select = nodes(tree, n => n.props?.value === 'Gardien')[0]
  const rendered = select.type(select.props)
  assert.ok(nodes(rendered, n => n.type === 'option' && n.props.value === 'Gardien' && n.props.children === 'Torwart').length)
})
