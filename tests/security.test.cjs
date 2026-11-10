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
    module, exports: module.exports, Buffer, console,
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only', RESEND_API_KEY: 'test-only' } },
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name]
      if (name.endsWith('/logger')) return { captureError() {} }
      if (name.endsWith('/email-throttle')) return { isThrottled: () => false }
      if (name.endsWith('/email-templates')) return load('lib/email-templates.ts')
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

function profileHandler({ expectedProof = proof, existing = false, createdAt = new Date().toISOString() } = {}) {
  const inserts = []
  const client = {
    auth: { admin: { getUserById: async () => ({ data: { user: {
      id: uid, email: 'owner@example.com', created_at: createdAt,
      user_metadata: { profile_creation_token: expectedProof },
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
