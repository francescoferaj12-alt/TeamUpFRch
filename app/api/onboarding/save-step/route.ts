import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { captureError } from '../../../../lib/logger'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Last step index per role (0-indexed)
const LAST_STEP: Record<string, number> = { player: 6, coach: 5, club: 4 }

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const supabase = createClient(url, anonKey, token
    ? { global: { headers: { Authorization: `Bearer ${token}` } } }
    : {}
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { stepIndex, role, data } = body as { stepIndex: number; role: string; data: Record<string, unknown> }
  if (stepIndex === undefined || !role || !data) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const isLast = stepIndex === LAST_STEP[role]

  // career_experiences is handled separately
  if (data.career_experiences) {
    const experiences = data.career_experiences as Array<Record<string, unknown>>
    if (experiences.length > 0) {
      // Delete existing onboarding career entries for this user to avoid duplicates
      await supabase.from('career_experiences').delete().eq('user_id', user.id)

      const rows = experiences.map(exp => ({
        user_id: user.id,
        club_name: exp.club_name as string,
        league: exp.league as string | undefined,
        position: exp.position as string | undefined,
        coach_role: exp.coach_role as string | undefined,
        start_date: exp.start_date as string,
        end_date: exp.end_date as string | undefined,
        is_current: exp.is_current as boolean ?? false,
      }))

      const { error: careerErr } = await supabase.from('career_experiences').insert(rows)
      if (careerErr) {
        captureError(careerErr, { api: 'onboarding/save-step', step: 'career_insert', userId: user.id })
        return NextResponse.json({ error: 'Career insert failed' }, { status: 500 })
      }
    }

    // Update onboarding_step only
    const updatePayload: Record<string, unknown> = { onboarding_step: stepIndex }
    if (isLast) {
      updatePayload.profile_completed = true
      updatePayload.onboarding_completed_at = new Date().toISOString()
    }
    await supabase.from('profiles').update(updatePayload).eq('id', user.id)
    return NextResponse.json({ ok: true, profile_completed: isLast })
  }

  // Build profile update from step data
  const profileUpdate: Record<string, unknown> = { onboarding_step: stepIndex }

  // Joueur steps
  if (role === 'player') {
    if (stepIndex === 0) {
      if (data.position) profileUpdate.position = data.position
      if (data.position_secondary !== undefined) profileUpdate.position_secondary = data.position_secondary
    } else if (stepIndex === 1) {
      if (data.foot) profileUpdate.foot = data.foot
      if (data.birthdate) profileUpdate.birthdate = data.birthdate
    } else if (stepIndex === 2) {
      if (data.ligue) profileUpdate.ligue = data.ligue
      if (data.zone) profileUpdate.zone = data.zone
    } else if (stepIndex === 4) {
      if (data.bio) profileUpdate.bio = data.bio
    } else if (stepIndex === 5) {
      if (data.avatar_url) profileUpdate.avatar_url = data.avatar_url
    } else if (stepIndex === 6) {
      if (data.video1_url !== undefined) profileUpdate.video1_url = data.video1_url
      if (data.video2_url !== undefined) profileUpdate.video2_url = data.video2_url
      if (data.video3_url !== undefined) profileUpdate.video3_url = data.video3_url
    }
  }

  // Coach steps
  if (role === 'coach') {
    if (stepIndex === 0) {
      if (data.coach_experience) profileUpdate.coach_experience = data.coach_experience
    } else if (stepIndex === 1) {
      if (data.coach_diploma) profileUpdate.coach_diploma = data.coach_diploma
    } else if (stepIndex === 2) {
      if (data.coach_philosophy) profileUpdate.coach_philosophy = data.coach_philosophy
    } else if (stepIndex === 4) {
      if (data.coach_categories) profileUpdate.coach_categories = data.coach_categories
    } else if (stepIndex === 5) {
      if (data.avatar_url) profileUpdate.avatar_url = data.avatar_url
    }
  }

  // Club steps
  if (role === 'club') {
    if (stepIndex === 0) {
      if (data.avatar_url) profileUpdate.avatar_url = data.avatar_url
    } else if (stepIndex === 1) {
      if (data.ligue) profileUpdate.ligue = data.ligue
    } else if (stepIndex === 2) {
      if (data.zone) profileUpdate.zone = data.zone
    } else if (stepIndex === 3) {
      if (data.bio) profileUpdate.bio = data.bio
    } else if (stepIndex === 4) {
      if (data.first_name) profileUpdate.first_name = data.first_name
      if (data.last_name) profileUpdate.last_name = data.last_name
      if (data.club_contact_role) profileUpdate.club_contact_role = data.club_contact_role
      if (data.club_email_public !== undefined) profileUpdate.club_email_public = data.club_email_public
    }
  }

  if (isLast) {
    profileUpdate.profile_completed = true
    profileUpdate.onboarding_completed_at = new Date().toISOString()
  }

  const { error: updateErr } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
  if (updateErr) {
    captureError(updateErr, { api: 'onboarding/save-step', step: stepIndex, role, userId: user.id })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, profile_completed: isLast })
}
