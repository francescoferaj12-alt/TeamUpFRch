import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { isThrottled } from '../../../../lib/email-throttle'
import { newApplicationHtml, zoneLang } from '../../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { annonce_id, message, applicant_name, applicant_role } = await req.json()
    if (!annonce_id) return NextResponse.json({ error: 'annonce_id required' }, { status: 400 })

    const { error: insertErr } = await supabase.from('applications').insert({
      annonce_id,
      applicant_id: user.id,
      applicant_name: applicant_name || '',
      message: message || '',
      status: 'pending',
    })
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { data: annonce, error: annonceErr } = await supabase
          .from('annonces').select('author_id, title').eq('id', annonce_id).single()
        if (annonceErr || !annonce) throw new Error('Annonce not found')

        const { data: author, error: authorErr } = await supabase
          .from('profiles')
          .select('email,first_name,last_name,club_name,role,zone,notification_settings')
          .eq('id', annonce.author_id).single()

        if (!authorErr && author?.email && author.notification_settings?.newApplication !== false) {
          if (!isThrottled(author.email, 'newApplication')) {
            const lang = zoneLang(author.zone)
            const toName = author.role === 'club'
              ? (author.club_name || 'Club')
              : `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email
            const resend = new Resend(process.env.RESEND_API_KEY)
            const { error: sendErr } = await resend.emails.send({
              from: FROM,
              to: author.email,
              subject: lang === 'de'
                ? `Neue Bewerbung für deine Anzeige "${annonce.title}"`
                : `Nouvelle candidature pour ton annonce "${annonce.title}"`,
              html: newApplicationHtml({
                toName,
                applicantName: applicant_name || '',
                applicantRole: applicant_role || 'player',
                annonceTitle: annonce.title,
                applicantId: user.id,
                annonceId: annonce_id,
                lang,
              }),
            })
            if (sendErr) console.error('Application create email failed:', sendErr)
          }
        }
      } catch (emailErr) {
        console.error('Application create email flow error:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Application create unhandled error:', e)
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
