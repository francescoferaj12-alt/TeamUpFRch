const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const root = path.resolve(__dirname, '..')
const cache = new Map()
function load(file) {
  const absolute = path.resolve(root, file)
  if (cache.has(absolute)) return cache.get(absolute).exports
  const mod = { exports: {} }
  cache.set(absolute, mod)
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const localRequire = name => {
    if (!name.startsWith('.')) return require(name)
    const base = path.resolve(path.dirname(absolute), name)
    const target = ['', '.ts', '.tsx', '.js'].map(ext => base + ext).find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    if (!target) throw new Error('Unresolved import ' + name)
    return load(target)
  }
  new Function('module', 'exports', 'require', code)(mod, mod.exports, localRequire)
  return mod.exports
}
const SeasonStats = load('components/SeasonStats.tsx').default
const CareerSection = load('components/CareerSection.tsx').default
const CareerModal = load('components/CareerExperienceModal.tsx').default
const { footballLabel } = load('lib/football-labels.ts')
const { strengthLabel } = load('lib/strength-labels.ts')
const { clubCopy, relativeTime } = load('lib/club-copy.ts')
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props))
const values = markup => [...markup.matchAll(/class="season-stat-value"[^>]*>([^<]*)</g)].map(match => match[1])
const missingProfile = { goals: null, assists: null, matches: null, goals_prev: null, assists_prev: null, matches_prev: null }

test('unfilled season fields render dashes and never fabricate a delta', () => {
  const html = render(SeasonStats, { profile: missingProfile, lang: 'de' })
  assert.deepEqual(values(html), ['—', '—', '—'])
  assert.match(html, /nicht angegeben/)
  assert.doesNotMatch(html, /season-stat-delta|Letzte Saison/)
})

test('real zero statistics remain visible, including an all-zero previous season', () => {
  const html = render(SeasonStats, { profile: Object.fromEntries(Object.keys(missingProfile).map(key => [key, 0])), lang: 'fr' })
  assert.deepEqual(values(html), ['0', '0', '0', '0', '0', '0'])
  assert.match(html, /Saison précédente/)
  assert.doesNotMatch(html, /non renseigné/)
})

test('a previous value cannot generate a comparison against a missing current value', () => {
  const html = render(SeasonStats, { profile: { ...missingProfile, goals_prev: 10, assists: 4, assists_prev: 2, matches: 15 }, lang: 'de' })
  assert.deepEqual(values(html), ['—', '4', '15', '10', '2', '—'])
  assert.equal((html.match(/class="season-stat-delta"/g) || []).length, 1)
  assert.match(html, /▲ 2/)
})

test('public empty careers describe missing content; owners retain the completion prompt', () => {
  for (const lang of ['fr', 'de']) {
    const publicHtml = render(CareerSection, { experiences: [], role: 'player', lang })
    const ownHtml = render(CareerSection, { experiences: [], role: 'player', lang, canEdit: true, onAdd() {} })
    assert.match(publicHtml, lang === 'de' ? /Noch kein Werdegang angegeben/ : /Parcours non renseigné/)
    assert.doesNotMatch(publicHtml, /Füge deinen|Ajoute ton/)
    assert.match(ownHtml, lang === 'de' ? /Füge deinen/ : /Ajoute ton/)
  }
})

test('German careers translate league, position, coach role and edit actions without altering club names', () => {
  const exp = { id: 'test', club_name: 'FC Exemple Français', league: '3ème Ligue', position: 'Attaquant', coach_role: 'Entraîneur adjoint', start_date: '2025-08-01', is_current: true, matches: 0 }
  const player = render(CareerSection, { experiences: [exp], role: 'player', lang: 'de', canEdit: true, onEdit() {}, onDelete() {} })
  assert.match(player, /FC Exemple Français/)
  assert.match(player, /3\. Liga/)
  assert.match(player, /Sturm/)
  assert.match(player, /Bearbeiten/)
  assert.match(player, /Löschen/)
  assert.doesNotMatch(player, /3ème Ligue|Attaquant|Modifier|Supprimer/)
  const coach = render(CareerSection, { experiences: [exp], role: 'coach', lang: 'de' })
  assert.match(coach, /Assistenztrainer/)
})

test('German career editor translates controls while retaining canonical option values', () => {
  const html = render(CareerModal, { userId: 'test', role: 'player', lang: 'de', onClose() {}, onSaved() {} })
  assert.match(html, /value="Attaquant"[^>]*>Sturm/)
  assert.match(html, /Torwart/)
  assert.match(html, /Statistiken \(optional\)/)
  assert.match(html, /— Monat/)
  assert.match(html, /Abbrechen/)
  assert.doesNotMatch(html, /— Mois|— Année|Statistiques \(optionnel\)|>Annuler</)
})

test('all homepage leagues have localized display labels and preserve French stored values', () => {
  const { liguesHomme, liguesFemme } = load('lib/data.ts')
  for (const group of [...liguesHomme, ...liguesFemme]) for (const label of group.items) {
    assert.equal(footballLabel(label, 'fr'), label)
    assert.doesNotMatch(footballLabel(label, 'de'), /ème|degré|Juniors|Féminine/)
  }
  assert.equal(footballLabel('Junior B', 'de'), 'Junioren B')
})

test('existing player and coach careers offer every league as a native dropdown in both languages', () => {
  const { liguesHomme, liguesFemme } = load('lib/data.ts')
  for (const role of ['player', 'coach']) for (const lang of ['fr', 'de']) {
    const html = render(CareerModal, { userId: 'test', role, lang, onClose() {}, onSaved() {} })
    assert.match(html, /<select[^>]*aria-label="(?:Ligue|Liga)[^"]*"/)
    for (const group of [...liguesHomme, ...liguesFemme]) for (const league of group.items) {
      assert.ok(html.includes(`value="${league}"`), `${role}/${lang}: ${league}`)
    }
    assert.doesNotMatch(html, /<input[^>]*aria-label="(?:Ligue|Liga)[^"]*"/)
  }
})

test('strength labels respect the role and keep unknown personal text intact', () => {
  assert.equal(strengthLabel('youth', 'de', 'club'), 'Jugendförderung')
  assert.equal(strengthLabel('youth', 'de', 'coach'), 'Jugendausbildung')
  assert.equal(strengthLabel('fast', 'de', 'player'), 'Schnell')
  assert.equal(strengthLabel('Custom value', 'de', 'player'), 'Custom value')
})

test('club interface dictionaries have matching keys and relative dates follow the selected language', () => {
  assert.deepEqual(Object.keys(clubCopy.fr), Object.keys(clubCopy.de))
  const now = Date.parse('2026-11-11T12:00:00Z')
  assert.match(relativeTime('2026-11-11T10:00:00Z', 'de', now), /vor 2 Stunden/)
  assert.match(relativeTime('2026-11-11T10:00:00Z', 'fr', now), /il y a 2 heures/)
  assert.equal(relativeTime('invalid', 'de', now), '')
})

test('season statistics accept missing and zero values, but reject negative, decimal and overflowing input', () => {
  const { parseSeasonStatistics, seasonStatFields } = load('lib/season-statistics.ts')
  const empty = Object.fromEntries(seasonStatFields.map(field => [field, '']))
  assert.equal(parseSeasonStatistics({ ...empty, goals: '0', assists: '12', matches: '20' }).goals, 0)
  assert.equal(parseSeasonStatistics(empty).goals, null)
  for (const bad of ['-1', '1.5', 'NaN', '2e3', '2147483648']) assert.throws(() => parseSeasonStatistics({ ...empty, matches: bad }))
})
