-- ============================================
-- TeamUpFR — Supabase Database Schema
-- Copie et colle tout ça dans l'éditeur SQL
-- de ton dashboard Supabase
-- ============================================

-- TABLE: profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('player', 'coach', 'club')) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  position TEXT,
  ligue TEXT,
  zone TEXT,
  age INTEGER,
  foot TEXT,
  available BOOLEAN DEFAULT true,
  bio TEXT,
  club_name TEXT,
  avatar_url TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  matches INTEGER DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- TABLE: annonces
CREATE TABLE annonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  author_type TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ligue TEXT,
  position TEXT,
  zone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Annonces are viewable by everyone"
  ON annonces FOR SELECT USING (true);

CREATE POLICY "Users can insert own annonces"
  ON annonces FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own annonces"
  ON annonces FOR UPDATE USING (auth.uid() = author_id);

-- TABLE: applications (candidatures)
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id UUID REFERENCES annonces(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  applicant_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annonce_id, applicant_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applications viewable by author and applicant"
  ON applications FOR SELECT USING (
    auth.uid() = applicant_id OR
    auth.uid() IN (SELECT author_id FROM annonces WHERE id = annonce_id)
  );

CREATE POLICY "Users can apply"
  ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Annonce authors can update status"
  ON applications FOR UPDATE USING (
    auth.uid() IN (SELECT author_id FROM annonces WHERE id = annonce_id)
  );

-- TABLE: messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their messages"
  ON messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
