import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { isThrottled } from '../../../lib/email-throttle'
import { newMessageHtml, zoneLang } from '../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let messageId: unknown
  try {
    ({ messageId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (typeof messageId !== 'string' || !/^[0-9a-f-]{36}$/i.test(messageId)) {
    return NextResponse.json({ error: 'Invalid messageId' }, { status: 400 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Notification service is not configured' }, { status: 503 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: message, error: messageError } = await admin.from('messages')
    .select('id,sender_id,receiver_id,text,file_name')
    .eq('id', messageId)
    .eq('sender_id', user.id)
    .maybeSingle()
  if (messageError || !message) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  const [{ data: sender }, { data: receiver }] = await Promise.all([
    admin.from('profiles').select('first_name,last_name,club_name,role').eq('id', user.id).maybeSingle(),
    admin.from('profiles').select('email,first_name,last_name,club_name,role,zone,notification_settings').eq('id', message.receiver_id).maybeSingle(),
  ])
  if (!sender || !receiver?.email || receiver.notification_settings?.newMessage === false) {
    return NextResponse.json({ ok: true, skipped: true })
  }
  if (isThrottled(user.id, `messageNotification:${message.receiver_id}`)) {
    return NextResponse.json({ ok: true, throttled: true })
  }
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 })

  const senderName = sender.role === 'club'
    ? (sender.club_name || 'Un club')
    : `${sender.first_name || ''} ${sender.last_name || ''}`.trim() || 'Un utilisateur'
  const receiverName = receiver.role === 'club'
    ? (receiver.club_name || '')
    : `${receiver.first_name || ''} ${receiver.last_name || ''}`.trim()
  const preview = message.text?.slice(0, 120) || (message.file_name ? `[Fichier: ${message.file_name.slice(0, 80)}]` : '…')
  const lang = zoneLang(receiver.zone)
  const { error: sendError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM,
    to: receiver.email,
    subject: lang === 'de' ? `${senderName} hat dir eine Nachricht gesendet — TeamUpFR` : `${senderName} t'a envoyé un message — TeamUpFR`,
    html: newMessageHtml({ toName: receiverName, fromName: senderName, preview, fromUserId: user.id, lang }),
  })
  if (sendError) return NextResponse.json({ error: 'Could not send notification email' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
