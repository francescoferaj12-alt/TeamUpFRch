import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  role: 'player' | 'coach' | 'club'
  first_name: string
  last_name: string
  position?: string
  ligue?: string
  zone?: string
  age?: number
  birthdate?: string
  foot?: string
  available: boolean
  bio?: string
  club_name?: string
  avatar_url?: string
  goals?: number
  assists?: number
  matches?: number
  goals_prev?: number
  assists_prev?: number
  matches_prev?: number
  strengths?: string
  video1_url?: string
  video2_url?: string
  video3_url?: string
  rating?: number
  phone?: string
  career?: string
  genre?: 'homme' | 'femme'
  verified?: boolean
  hidden?: boolean
  coach_experience?: string
  coach_diploma?: string
  coach_specialty?: string
  coach_availability?: string
  club_website?: string
  club_instagram?: string
  club_facebook?: string
  club_whatsapp?: string
  club_phone_public?: string
  club_email_public?: string
  verification_requested?: boolean
  // Player extended
  position_secondary?: string
  jersey_number?: number
  height_cm?: number
  level?: string
  // Coach extended
  coach_categories?: string
  coach_philosophy?: string
  coach_certificates?: string
  // Club extended
  club_founded_year?: number
  club_teams_count?: number
  club_stadium_name?: string
  club_stadium_address?: string
  club_color_primary?: string
  club_color_secondary?: string
  club_categories?: string
  created_at: string
}

export type Annonce = {
  id: string
  author_id: string
  author_name: string
  author_type: 'player' | 'coach' | 'club'
  title: string
  body: string
  ligue: string
  position?: string
  zone: string
  status: 'active' | 'closed'
  type?: 'club_cherche_joueur' | 'joueur_cherche_club' | 'coach_cherche_club' | 'club_cherche_coach' | 'coach_cherche_joueurs'
  created_at: string
}

export type Application = {
  id: string
  annonce_id: string
  applicant_id: string
  applicant_name: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  seen_by_owner?: boolean
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  text: string
  read: boolean
  created_at: string
  file_url?: string
  file_type?: string
  file_name?: string
}

export type CareerExperience = {
  id: string
  user_id: string
  club_name: string
  club_logo_url?: string
  league?: string
  position?: string
  jersey_number?: number
  coach_role?: string
  start_date: string
  end_date?: string
  is_current: boolean
  matches?: number
  goals?: number
  assists?: number
  wins?: number
  win_rate?: number
  description?: string
  created_at: string
}
