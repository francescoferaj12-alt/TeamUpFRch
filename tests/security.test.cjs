const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const uid = '00000000-0000-4000-8000-000000000001'
const proof = '00000000-0000-4000-8000-000000000002'
const receiverId = '00000000-0000-4000-8000-000000000003'

// Exercise the real handlers with isolated database and email adapters.
function load(file, mocks = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Buffer, URL, console,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only', RESEND_API_KEY: 'test-only', CRON_SECRET: 'test-only' } },
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name]
      if (name.endsWith('/logger')) return { captureError() {} }
      if (name.endsWith('/email-throttle')) return { isThrottled: () => false }
      if (name.endsWith('/football-labels')) return load('lib/football-labels.ts')
      if (name.endsWith('/email-templates')) return load('lib/email-templates.ts')
      if (name.endsWith('/onboarding-career')) return load('lib/onboarding-career.ts')
      if (name.endsWith('/annonce-lifecycle')) return load('lib/annonce-lifecycle.ts')
      return require(name)
    },
  }, { filename: file })
  return module.exports
}

function request(body, token = 'test-token') {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
}

function profileHandler({ expectedProof = proof, existing = false, createdAt = new Date().toISOString(), language } = {}) {
  const inserts = []
  const client = {
    auth: { admin: { getUserById: async () => ({ data: { user: {
      id: uid, email: 'owner@example.com', created_at: createdAt,
      user_metadata: { profile_creation_token: expectedProof, language },
    } } }) } },
    from: () => ({
      select() { return this }, eq() { return this },
      maybeSingle: async () => ({ data: existing ? { id: uid } : null }),
      insert: async row => { inserts.push(row); return { error: null } },
    }),
  }
  return { inserts, ...load('app/api/auth/create-profile/route.ts', { '@supabase/supabase-js': { createClient: () => client } }) }
}

const signup = { userId: uid, profileToken: proof, profileData: { email: 'owner@example.com', role: 'club', club_name: 'Test Club' } }

function careerHandler({ error = null, signedIn = true, actualRole = 'player', updateMissing = false } = {}) {
  const saves = []
  const writes = []
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: uid } : null }, error: null }) },
    rpc: async (name, data) => { saves.push({ name, data }); return { error } },
    from: table => {
      assert.equal(table, 'profiles')
      let update = false
      return {
        select() { return this },
        eq(key, value) { assert.equal(value, uid); return this },
        update(fields) { update = true; writes.push(fields); return this },
        async maybeSingle() {
          return { data: update ? (updateMissing ? null : { id: uid }) : (actualRole ? { role: actualRole } : null) }
        },
      }
    },
  }
  return { saves, writes, ...load('app/api/onboarding/save-step/route.ts', { '@supabase/supabase-js': { createClient: () => client } }) }
}

const careerRequest = entries => ({ stepIndex: 3, role: 'player', data: { career_experiences: entries } })

test('onboarding converts selected years and clears an empty or current end date', async () => {
  const api = careerHandler()
  const response = await api.POST(request(careerRequest([
    { id: uid, club_name: ' Club ', start_date: '2019', end_date: '' },
    { club_name: 'Current', start_date: '2024', end_date: '2023', is_current: true },
  ])))
  assert.equal(response.status, 200)
  assert.equal(api.saves.length, 1)
  assert.equal(api.saves[0].name, 'save_onboarding_career')
  assert.equal(api.saves[0].data.experiences[0].id, uid)
  assert.equal(api.saves[0].data.experiences[0].start_date, '2019-01-01')
  assert.equal(api.saves[0].data.experiences[0].club_name, 'Club')
  assert.equal(api.saves[0].data.experiences[0].end_date, null)
  assert.equal(api.saves[0].data.experiences[1].end_date, null)
})

test('invalid career dates or malformed entries never reach the database', async () => {
  for (const entries of [null, {}, [null], [{ club_name: 'Club', start_date: '' }],
    [{ id: 'invalid', club_name: 'Club', start_date: '2024' }],
    [{ club_name: 'Club', start_date: '2023-02-29' }],
    [{ club_name: 'Club', start_date: '2024', end_date: '2020' }]]) {
    const api = careerHandler()
    assert.equal((await api.POST(request(careerRequest(entries)))).status, 400)
    assert.equal(api.saves.length, 0)
  }
})

test('career failures do not report success and unauthenticated calls cannot write', async () => {
  const api = careerHandler({ error: { message: 'transaction rejected' } })
  assert.equal((await api.POST(request(careerRequest([])))).status, 500)
  const anonymous = careerHandler({ signedIn: false })
  assert.equal((await anonymous.POST(request(careerRequest([]), ''))).status, 401)
  assert.equal(anonymous.saves.length, 0)
})

test('empty career replacement is explicit and a different step cannot replace it', async () => {
  const api = careerHandler()
  assert.equal((await api.POST(request(careerRequest([])))).status, 200)
  assert.equal(api.saves[0].data.experiences.length, 0)
  assert.equal((await api.POST(request({ ...careerRequest([]), stepIndex: 6 }))).status, 400)
  assert.equal(api.saves.length, 1)
})

test('registration without the account creation proof cannot create a profile', async () => {
  const api = profileHandler()
  const response = await api.POST(request({ ...signup, profileToken: receiverId }))
  assert.equal(response.status, 403)
  assert.equal(api.inserts.length, 0)
})

test('registration cannot overwrite an existing profile', async () => {
  const api = profileHandler({ existing: true })
  assert.equal((await api.POST(request(signup))).status, 409)
  assert.equal(api.inserts.length, 0)
})

test('an expired registration proof cannot create a profile', async () => {
  const api = profileHandler({ createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() })
  assert.equal((await api.POST(request(signup))).status, 403)
  assert.equal(api.inserts.length, 0)
})

test('new clubs stay pending and cannot set their own badge', async () => {
  const api = profileHandler()
  const response = await api.POST(request({ ...signup, profileData: { ...signup.profileData, verified: true, hidden: false, club_verification_status: 'approved' } }))
  assert.equal(response.status, 200)
  assert.equal(api.inserts.length, 1)
  assert.equal(api.inserts[0].hidden, true)
  assert.equal(api.inserts[0].club_verification_status, 'pending')
  assert.equal(api.inserts[0].verified, undefined)
})

test('club signup stores the selected email language and ignores unsupported values', async () => {
  for (const language of ['de', 'fr', 'unsupported']) {
    const api = profileHandler({ language })
    assert.equal((await api.POST(request(signup))).status, 200)
    assert.equal(api.inserts[0].club_verification_status, 'pending')
    assert.equal(api.inserts[0].notification_settings?.language, language === 'unsupported' ? undefined : language)
  }
})

test('club approval email follows the club language before falling back to its region', async () => {
  for (const [language, zone, expected] of [
    ['de', 'Sarine', 'de'], ['fr', 'Sensebezirk', 'fr'], [undefined, 'Sensebezirk', 'de'],
  ]) {
    const sent = []
    const updates = []
    const club = { email: 'club@example.com', club_name: 'Test Club', zone, notification_settings: { language } }
    const client = {
      auth: { getUser: async () => ({ data: { user: { email: 'teamupfr.ch@gmail.com' } } }) },
      from: () => ({
        select() { return this }, eq() { return this },
        single: async () => ({ data: club }),
        update(values) { updates.push(values); return { eq: async () => ({ error: null }) } },
      }),
    }
    const api = load('app/api/admin/clubs/[id]/approve/route.ts', {
      '@supabase/supabase-js': { createClient: () => client },
      resend: { Resend: class { emails = { send: async email => { sent.push(email); return {} } } } },
    })
    assert.equal((await api.POST(request({}), { params: Promise.resolve({ id: uid }) })).status, 200)
    assert.equal(updates[0].club_verification_status, 'approved')
    assert.equal(sent.length, 1)
    assert.equal(sent[0].to, club.email)
    assert.ok(sent[0].html.includes(`<html lang="${expected}">`))
    assert.match(sent[0].subject, expected === 'de' ? /wurde verifiziert/ : /a été vérifié/)
  }
})

function messageHandler({ foreignMessage = false, optedOut = false } = {}) {
  const sent = []
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: uid } } }) },
    from(table) {
      const filters = {}
      return {
        select() { return this }, eq(key, value) { filters[key] = value; return this },
        async maybeSingle() {
          if (table === 'messages') {
            assert.equal(filters.sender_id, uid, 'message access must be bound to the authenticated sender')
            return { data: foreignMessage ? null : { sender_id: uid, receiver_id: receiverId, text: '<script>bad</script>' } }
          }
          return { data: filters.id === uid
            ? { first_name: 'Sender', role: 'player' }
            : { first_name: 'Receiver', email: 'receiver@example.com', notification_settings: { newMessage: !optedOut } } }
        },
      }
    },
  }
  const mocks = {
    '@supabase/supabase-js': { createClient: () => client },
    resend: { Resend: class { emails = { send: async email => { sent.push(email); return {} } } } },
  }
  return { sent, ...load('app/api/send-message-notification/route.ts', mocks) }
}

test('anonymous callers cannot send message notifications', async () => {
  const api = messageHandler()
  assert.equal((await api.POST(request({ messageId: proof }, null))).status, 401)
  assert.equal(api.sent.length, 0)
})

test('a user cannot notify someone about another sender’s message', async () => {
  const api = messageHandler({ foreignMessage: true })
  assert.equal((await api.POST(request({ messageId: proof }))).status, 404)
  assert.equal(api.sent.length, 0)
})

test('message notifications honor the recipient’s opt-out', async () => {
  const api = messageHandler({ optedOut: true })
  assert.equal((await api.POST(request({ messageId: proof }))).status, 200)
  assert.equal(api.sent.length, 0)
})

test('notification recipient and content come from the stored message, with HTML escaped', async () => {
  const api = messageHandler()
  assert.equal((await api.POST(request({ messageId: proof, toEmail: 'attacker@example.com', preview: 'forged' }))).status, 200)
  assert.equal(api.sent.length, 1)
  assert.equal(api.sent[0].to, 'receiver@example.com')
  assert.ok(api.sent[0].html.includes('&lt;script&gt;bad&lt;/script&gt;'))
  assert.ok(!api.sent[0].html.includes('<script>bad</script>'))
  assert.ok(!api.sent[0].html.includes('forged'))
})

test('attachment references cannot point to another sender or an external website', () => {
  const { isMessageAttachmentPath } = load('lib/message-attachments.ts')
  assert.equal(isMessageAttachmentPath(`${uid}/attachment.pdf`, uid), true)
  for (const invalid of [`${receiverId}/attachment.pdf`, `${uid}/../secret.pdf`, `https://example.com/tracker.svg`, `${uid}/nested/file.pdf`]) {
    assert.equal(isMessageAttachmentPath(invalid, uid), false)
  }
})

test('message attachments use temporary URLs without changing stored object references', async () => {
  const { resolveMessageAttachments } = load('lib/message-attachments.ts')
  const objectPath = `${uid}/attachment.pdf`
  const stored = [{ id: proof, sender_id: uid, file_url: objectPath, file_name: 'attachment.pdf' }]
  const client = { storage: { from(bucket) {
    assert.equal(bucket, 'message-files')
    return { createSignedUrls: async (paths, seconds) => {
      assert.equal(JSON.stringify(paths), JSON.stringify([objectPath]))
      assert.ok(seconds > 0 && seconds <= 3600)
      return { data: [{ path: objectPath, signedUrl: 'https://example.com/temporary-file?token=test' }] }
    } }
  } } }
  const visible = await resolveMessageAttachments(client, stored)
  assert.equal(visible[0].file_url, 'https://example.com/temporary-file?token=test')
  assert.equal(stored[0].file_url, objectPath)
})

test('an unavailable private attachment never falls back to a public URL', async () => {
  const { resolveMessageAttachments } = load('lib/message-attachments.ts')
  const client = { storage: { from: () => ({ createSignedUrls: async () => ({ data: null, error: { message: 'denied' } }) }) } }
  const visible = await resolveMessageAttachments(client, [{ id: proof, sender_id: uid, file_url: `${uid}/attachment.pdf`, file_name: 'attachment.pdf' }])
  assert.equal(visible[0].file_url, undefined)
  assert.equal(visible[0].file_name, 'attachment.pdf')
})

test('video cleanup only removes obsolete objects in the authenticated owner folder', async () => {
  const url = 'https://example.supabase.co/storage/v1/object/public/videos'
  const active = `${url}/${uid}/video_1.mp4`
  const obsolete = `${url}/${uid}/video_2.webm?t=123`
  const removed = []
  const client = {
    auth: { getUser: async token => ({ data: { user: token === 'test-token' ? { id: uid } : null } }) },
    from() {
      return {
        select() { return this },
        eq(key, value) { assert.equal(value, uid); return this },
        async single() { return { data: { video1_url: active } } },
      }
    },
    storage: { from(bucket) {
      assert.equal(bucket, 'videos')
      return { async remove(paths) { removed.push(...paths); return {} } }
    } },
  }
  const api = load('app/api/profile/obsolete-videos/route.ts', {
    '@supabase/supabase-js': { createClient: () => client },
    '../../../../lib/profile-videos': load('lib/profile-videos.ts'),
  })
  assert.equal((await api.POST(request({ urls: [obsolete] }, null))).status, 401)
  assert.equal((await api.POST(request({ urls: [`${url}/${receiverId}/video_1.mp4`] }))).status, 400)
  assert.equal((await api.POST(request({ urls: ['https://other.example/video.mp4'] }))).status, 400)
  assert.equal((await api.POST(request({ urls: [active + '?t=99', obsolete, obsolete] }))).status, 200)
  assert.deepEqual(removed, [`${uid}/video_2.webm`])
})

test('daily job sends one admin reminder and one localized digest for opted-in matching searches', async () => {
  const sent = []
  const visibleListing = {
    id: 'matching', author_id: uid, title: 'Recherche gardien', body: 'Disponible', author_name: 'FC Test',
    zone: 'Sarine', position: 'Gardien', ligue: '3ème Ligue', author_type: 'club', created_at: '2026-01-02T08:00:00Z',
  }
  const search = {
    owner_id: receiverId, query: 'GARDIEN', zone: 'Sarine', position: 'Gardien',
    ligue: '', author_type: 'club', created_at: '2026-01-01T08:00:00Z',
  }
  const db = { from(table) {
    let head = false
    const result = {
      select(fields, options) { head = options?.head; return this },
      eq() { return this }, lt() { return this }, gte() { return this }, order() { return this }, in() { return this }, or() { return this },
      async maybeSingle() { return { data: { email: 'receiver@example.test', zone: 'Sarine', notification_settings: { language: 'de' } } } },
      then(resolve) {
        const rows = {
          annonces: [visibleListing, { ...visibleListing, id: 'hidden', author_id: proof }],
          saved_annonce_searches: [search, { ...search, query: '' }],
          public_profiles: [{ id: uid }],
        }
        return Promise.resolve(head ? { count: 1 } : { data: rows[table] }).then(resolve)
      },
    }
    return result
  } }
  const api = load('app/api/cron/daily-notifications/route.ts', {
    '@supabase/supabase-js': { createClient: () => db },
    '../../../../lib/annonce-search': load('lib/annonce-search.ts'),
    resend: { Resend: class { emails = { send: async (message, options) => { sent.push({ message, options }); return {} } } } },
  })
  assert.equal((await api.GET(new Request('http://localhost/api/test'))).status, 401)
  assert.equal(sent.length, 0)
  assert.equal((await api.GET(new Request('http://localhost/api/test', { headers: { Authorization: 'Bearer test-only' } }))).status, 200)
  assert.equal(sent.length, 2)
  assert.equal(sent[0].message.to, 'teamupfr.ch@gmail.com')
  assert.match(sent[0].options.idempotencyKey, /^club-reminder\//)
  assert.equal(sent[1].message.to, 'receiver@example.test')
  assert.match(sent[1].message.subject, /neue Treffer/)
  assert.match(sent[0].message.text, /^Une demande de club est/)
  assert.match(sent[1].message.text, /^Eine neue Anzeige passt/)
})

test('login preserves valid site routes and falls back for untrusted redirect targets', () => {
  const { internalRedirect } = load('lib/internal-redirect.ts')
  assert.equal(internalRedirect('/messages?partner=fixture#chat'), '/messages?partner=fixture#chat')
  assert.equal(internalRedirect(null), '/annonces')
  assert.equal(internalRedirect('https://example.test'), '/annonces')
  assert.equal(internalRedirect('//example.test'), '/annonces')
})

test('onboarding completes each actual role only on its final step', async () => {
  for (const [role, stepIndex, field, value] of [
    ['player', 6, 'video1_url', 'https://example.test/video'],
    ['coach', 5, 'avatar_url', 'https://example.test/coach'],
    ['club', 4, 'club_contact_role', 'Responsable sportif'],
  ]) {
    const api = careerHandler({ actualRole: role })
    const early = await api.POST(request({ role, stepIndex: 0, data: {} }))
    assert.equal((await early.json()).profile_completed, false)
    const end = await api.POST(request({ role, stepIndex, data: { [field]: value, verified: true } }))
    assert.equal(end.status, 200)
    assert.equal((await end.json()).profile_completed, true)
    assert.equal(api.writes[1][field], value)
    assert.equal(api.writes[1].verified, undefined)
  }
})

test('onboarding rejects a mismatched role and a missing profile update', async () => {
  const mismatch = careerHandler({ actualRole: 'coach' })
  assert.equal((await mismatch.POST(request({ role: 'club', stepIndex: 4, data: {} }))).status, 400)
  assert.equal(mismatch.writes.length, 0)
  const missing = careerHandler({ actualRole: 'player', updateMissing: true })
  assert.equal((await missing.POST(request({ role: 'player', stepIndex: 6, data: {} }))).status, 404)
})

test('abandoned video cleanup preserves active files and recent drafts and fails closed on listing errors', async () => {
  const base='https://example.supabase.co/storage/v1/object/public/videos'
  const active='video_1_00000000-0000-4000-8000-000000000011.mp4'
  const old='video_2_00000000-0000-4000-8000-000000000012.mp4'
  const recent='video_3_00000000-0000-4000-8000-000000000013.mp4'
  const removed=[]; let listingError=false
  const client={
    auth:{getUser:async()=>({data:{user:{id:uid}}})},
    from(){return{select(){return this},eq(){return this},single:async()=>({data:{video1_url:`${base}/${uid}/${active}`}})}},
    storage:{from(){return{
      list:async owner=>{assert.equal(owner,uid);return listingError?{error:{message:'offline'}}:{data:[
        {name:active,updated_at:'2020-01-01T00:00:00Z'},
        {name:old,updated_at:'2020-01-01T00:00:00Z'},
        {name:recent,updated_at:new Date().toISOString()},
        {name:`../${receiverId}/${old}`,updated_at:'2020-01-01T00:00:00Z'},
        {name:'unrecognized.mp4',updated_at:'2020-01-01T00:00:00Z'},
      ]}},
      remove:async paths=>{removed.push(...paths);return{}},
    }}},
  }
  const api=load('app/api/profile/obsolete-videos/route.ts',{'@supabase/supabase-js':{createClient:()=>client},'../../../../lib/profile-videos':load('lib/profile-videos.ts')})
  assert.equal((await api.POST(request({urls:[],cleanup:true}))).status,200)
  assert.deepEqual(removed,[`${uid}/${old}`])
  listingError=true
  assert.equal((await api.POST(request({urls:[],cleanup:true}))).status,502)
  assert.equal(removed.length,1)
})
