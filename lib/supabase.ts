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
  verification_requested?: boolean
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
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  text: string
  read: boolean
  created_at: string
}
