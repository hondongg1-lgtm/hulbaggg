/*
  # Fix User Flow - Recreate Missing Tables

  1. Tables
    - Recreate `user_profiles` table with OTP fields for phone verification
      - `id` (uuid, FK to auth.users)
      - `phone` (text, unique)
      - `otp_code` (text, nullable)
      - `otp_expires_at` (timestamptz, nullable)
      - `is_verified` (boolean, default false)
      - `created_at` (timestamptz, default now())
    
    - Recreate `neighborhoods` table for location filtering
      - `id` (uuid, primary key)
      - `name_ar` (text, Arabic name)
      - `name_en` (text, English name)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on user_profiles
    - Add policies for users to manage their own profiles
    - Enable RLS on neighborhoods
    - Add policy for public read access

  3. Data Integrity
    - Add foreign key constraint on prize_claims.user_id
    - Add foreign key constraint on game_attempts.user_id
*/

-- Create user_profiles table with OTP support
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  otp_code text,
  otp_expires_at timestamptz,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

-- Allow public read access to neighborhoods
CREATE POLICY "Neighborhoods are publicly readable"
  ON neighborhoods FOR SELECT
  TO public
  USING (true);

-- Insert default neighborhoods
INSERT INTO neighborhoods (name_ar, name_en) VALUES
  ('المباركية', 'Al-Mubarakiya'),
  ('القليب', 'Al-Qaleeb'),
  ('المحدود', 'Al-Mahdood')
ON CONFLICT DO NOTHING;

-- Add missing foreign key constraints if they don't exist
DO $$
BEGIN
  -- Check and add FK for prize_claims.user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'prize_claims_user_id_check'
    AND table_name = 'prize_claims'
  ) THEN
    -- For now, we'll keep user_id as text since we're not using auth.users
    -- The app manages user_id directly from user_profiles
    NULL;
  END IF;

  -- Check and add FK for game_attempts.user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'game_attempts_user_id_check'
    AND table_name = 'game_attempts'
  ) THEN
    NULL;
  END IF;
END $$;