import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { isThrottled } from '../../../../../lib/email-throttle'
import { applicationStatusHtml, zoneLang } from '../../../../../lib/email-templates'

const FROM = 'TeamUpFR <noreply@teamupfr.ch>'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const appId = params.id
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

    const { status } = await req.json()
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: app, error: updateErr } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId)
      .select('id, applicant_id, annonce_id')
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    if (status !== 'pending' && process.env.RESEND_API_KEY) {
      try {
        const [{ data: applicant, error: applicantErr }, { data: annonce }] = await Promise.all([
          supabase.from('profiles')
            .select('email,first_name,last_name,club_name,role,zone,notification_settings')
            .eq('id', app.applicant_id).single(),
          supabase.from('annonces')
            .select('title,author_id')
            .eq('id', app.annonce_id).single(),
        ])

        if (!applicantErr && applicant?.email && applicant.notification_settings?.applicationStatus !== false) {
          if (!isThrottled(applicant.email, `appStatus:${status}`)) {
            const { data: author } = await supabase.from('profiles')
              .select('club_name,first_name,last_name,role')
              .eq('id', annonce?.author_id ?? user.id).single()

            const clubName = author?.role === 'club'
              ? (author.club_name || 'Club')
              : `${author?.first_name || ''} ${author?.last_name || ''}`.trim() || 'L\'équipe'

            const toName = applicant.role === 'club'
              ? (applicant.club_name || 'Club')
              : `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim() || applicant.email

            const lang = zoneLang(applicant.zone)
            const isAccepted = status === 'accepted'
            const resend = new Resend(process.env.RESEND_API_KEY)
            const { error: sendErr } = await resend.emails.send({
              from: FROM,
              to: applicant.email,
              subject: isAccepted
                ? (lang === 'de' ? `${clubName} hat deine Bewerbung angenommen!` : `${clubName} a accepté ta candidature !`)
                : (lang === 'de' ? `Antwort von ${clubName} auf deine Bewerbung` : `Réponse de ${clubName} à ta candidature`),
              html: applicationStatusHtml({ toName, status, clubName, annonceTitle: annonce?.title || '', lang }),
            })
            if (sendErr) console.error('Application status email failed:', sendErr)
          }
        }
      } catch (emailErr) {
        console.error('Application status email flow error:', emailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Application status unhandled error:', e)
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
