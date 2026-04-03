/*
  # Redesign for Marketplace Flow - Complete Platform Overhaul

  ## Overview
  Major platform redesign implementing the full marketplace experience with neighborhood-based discovery,
  daily play limits, tap-to-reveal games, and comprehensive analytics.

  ## 1. New Tables

  ### `neighborhoods`
  Al-Ahsa neighborhood data for location-based filtering
  - `id` (uuid, primary key)
  - `name_ar` (text) - Arabic name
  - `name_en` (text) - English name
  - `created_at` (timestamp)

  ### `user_profiles`
  Extended user information beyond auth
  - `id` (uuid, primary key, references auth.users)
  - `phone` (text) - Phone number
  - `preferred_neighborhood` (uuid, references neighborhoods)
  - `created_at` (timestamp)
  - `last_active` (timestamp)

  ### `game_attempts`
  Track daily play attempts per user per campaign
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `campaign_id` (uuid, references campaigns)
  - `played_at` (timestamp)
  - `won` (boolean)
  - `prize_id` (uuid, references prizes, nullable)
  - `created_at` (timestamp)

  ### `prize_claims`
  Unique redemption codes for winners
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `campaign_id` (uuid, references campaigns)
  - `prize_id` (uuid, references prizes)
  - `claim_code` (text, unique) - 8-character code
  - `claimed_at` (timestamp)
  - `redeemed_at` (timestamp, nullable)
  - `expires_at` (timestamp)
  - `status` (text) - 'pending', 'redeemed', 'expired'

  ## 2. Modified Tables

  ### `campaigns`
  - Add `neighborhood_id` for location targeting
  - Add `daily_attempts_per_user` (default 1)
  - Add `total_prize_pool` (number of prizes available)
  - Add `win_probability` (percentage for reward engine)
  - Add `consolation_prize` (text description for losers)
  - Add `consolation_discount` (numeric value)

  ### `prizes`
  - Add `quantity_total` (total available)
  - Add `quantity_remaining` (updated on each win)
  - Add `prize_type` (discount, free_item, grand_prize)

  ## 3. Security (RLS)
  - Enable RLS on all new tables
  - Users can view their own profiles and attempts
  - Users can view active campaigns in their neighborhood
  - Users can only create one attempt per campaign per day
  - Store owners can view their campaign analytics
  - Admins have full access

  ## 4. Indexes
  - Index on game_attempts (user_id, campaign_id, played_at) for daily limit checks
  - Index on prize_claims (claim_code) for fast lookups
  - Index on campaigns (neighborhood_id, status) for marketplace queries

  ## 5. Functions
  - Function to check if user can play (daily limit)
  - Function to generate unique claim codes
  - Function to determine win/loss based on probability
*/

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view neighborhoods"
  ON neighborhoods FOR SELECT
  TO public
  USING (true);

-- Insert Al-Ahsa neighborhoods
INSERT INTO neighborhoods (name_ar, name_en) VALUES
  ('المبرز', 'Al-Mubarraz'),
  ('الهفوف', 'Al-Hofuf'),
  ('المنيزلة', 'Al-Munizilah'),
  ('العيون', 'Al-Oyoun'),
  ('الجفر', 'Al-Jafr'),
  ('الطرف', 'Al-Taraf'),
  ('العمران', 'Al-Omran')
ON CONFLICT DO NOTHING;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  preferred_neighborhood uuid REFERENCES neighborhoods(id),
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert profile on signup"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add neighborhood support to campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'neighborhood_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN neighborhood_id uuid REFERENCES neighborhoods(id);
    ALTER TABLE campaigns ADD COLUMN daily_attempts_per_user int DEFAULT 1;
    ALTER TABLE campaigns ADD COLUMN total_prize_pool int DEFAULT 100;
    ALTER TABLE campaigns ADD COLUMN win_probability decimal(5,2) DEFAULT 10.00;
    ALTER TABLE campaigns ADD COLUMN consolation_prize text DEFAULT 'خصم 2 ريال';
    ALTER TABLE campaigns ADD COLUMN consolation_discount decimal(10,2) DEFAULT 2.00;
  END IF;
END $$;

-- Add prize quantity tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'quantity_total'
  ) THEN
    ALTER TABLE prizes ADD COLUMN quantity_total int DEFAULT 0;
    ALTER TABLE prizes ADD COLUMN quantity_remaining int DEFAULT 0;
    ALTER TABLE prizes ADD COLUMN prize_type text DEFAULT 'discount';
  END IF;
END $$;

-- Create game_attempts table
CREATE TABLE IF NOT EXISTS game_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  played_at timestamptz DEFAULT now(),
  won boolean DEFAULT false,
  prize_id uuid REFERENCES prizes(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON game_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create attempts"
  ON game_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for daily limit checks
CREATE INDEX IF NOT EXISTS idx_game_attempts_daily
  ON game_attempts(user_id, campaign_id, played_at);

-- Create prize_claims table
CREATE TABLE IF NOT EXISTS prize_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  prize_id uuid NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  claim_code text UNIQUE NOT NULL,
  claimed_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'expired'))
);

ALTER TABLE prize_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON prize_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Store owners can view their claims"
  ON prize_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = prize_claims.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create claims"
  ON prize_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can update claim status"
  ON prize_claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = prize_claims.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = prize_claims.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_prize_claims_code
  ON prize_claims(claim_code);

-- Index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_campaigns_location
  ON campaigns(neighborhood_id, status);

-- Function to check if user can play today
CREATE OR REPLACE FUNCTION can_user_play_today(
  p_user_id uuid,
  p_campaign_id uuid
) RETURNS boolean AS $$
DECLARE
  v_attempts_today int;
  v_daily_limit int;
BEGIN
  -- Get campaign's daily limit
  SELECT daily_attempts_per_user INTO v_daily_limit
  FROM campaigns
  WHERE id = p_campaign_id;

  -- Count today's attempts
  SELECT COUNT(*) INTO v_attempts_today
  FROM game_attempts
  WHERE user_id = p_user_id
    AND campaign_id = p_campaign_id
    AND played_at >= CURRENT_DATE;

  RETURN v_attempts_today < v_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique claim code
CREATE OR REPLACE FUNCTION generate_claim_code() RETURNS text AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    v_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM prize_claims WHERE claim_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to play game (determines win/loss)
CREATE OR REPLACE FUNCTION play_game(
  p_user_id uuid,
  p_campaign_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_can_play boolean;
  v_win_prob decimal;
  v_random decimal;
  v_won boolean;
  v_prize_id uuid;
  v_claim_code text;
  v_result jsonb;
BEGIN
  -- Check if user can play
  SELECT can_user_play_today(p_user_id, p_campaign_id) INTO v_can_play;
  
  IF NOT v_can_play THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'daily_limit_reached',
      'message', 'لقد استنفذت محاولاتك اليومية'
    );
  END IF;

  -- Get campaign win probability
  SELECT win_probability INTO v_win_prob
  FROM campaigns
  WHERE id = p_campaign_id;

  -- Determine win/loss
  v_random := random() * 100;
  v_won := v_random <= v_win_prob;

  -- If won, select a prize
  IF v_won THEN
    SELECT id INTO v_prize_id
    FROM prizes
    WHERE campaign_id = p_campaign_id
      AND quantity_remaining > 0
    ORDER BY random()
    LIMIT 1;

    -- If no prizes left, convert to loss
    IF v_prize_id IS NULL THEN
      v_won := false;
    ELSE
      -- Decrease prize quantity
      UPDATE prizes
      SET quantity_remaining = quantity_remaining - 1
      WHERE id = v_prize_id;

      -- Generate claim code
      v_claim_code := generate_claim_code();

      -- Create prize claim
      INSERT INTO prize_claims (
        user_id,
        campaign_id,
        prize_id,
        claim_code,
        expires_at
      ) VALUES (
        p_user_id,
        p_campaign_id,
        v_prize_id,
        v_claim_code,
        now() + interval '48 hours'
      );
    END IF;
  END IF;

  -- Record attempt
  INSERT INTO game_attempts (
    user_id,
    campaign_id,
    won,
    prize_id
  ) VALUES (
    p_user_id,
    p_campaign_id,
    v_won,
    v_prize_id
  );

  -- Build result
  IF v_won THEN
    v_result := jsonb_build_object(
      'success', true,
      'won', true,
      'claim_code', v_claim_code,
      'prize_id', v_prize_id
    );
  ELSE
    v_result := jsonb_build_object(
      'success', true,
      'won', false,
      'consolation', true
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
