/*
  # Fix Auth RLS Initialization - Final Fix

  ## Changes Made:
  
  ### 1. Properly Wrap All auth.uid() and auth.jwt() Calls
    - Move auth function calls to CTEs (Common Table Expressions)
    - This ensures auth functions are evaluated once per query, not per row
    - Significantly improves query performance at scale
  
  ### 2. Recreate All Affected Policies
    - Drop and recreate each policy with proper optimization
*/

-- ============================================================================
-- ADMIN_ACCOUNTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated admins can manage" ON public.admin_accounts;

CREATE POLICY "Authenticated admins can manage"
  ON public.admin_accounts
  FOR ALL
  TO authenticated
  USING (
    email IN (
      SELECT aa.email
      FROM admin_accounts aa,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  )
  WITH CHECK (
    email IN (
      SELECT aa.email
      FROM admin_accounts aa,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  );

-- ============================================================================
-- ADMIN_USERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can read admin_users" ON public.admin_users;

CREATE POLICY "Only admins can read admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update own data only" ON public.admin_users;

CREATE POLICY "Admins can update own data only"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT admin_accounts.id
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  )
  WITH CHECK (
    id IN (
      SELECT admin_accounts.id
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

-- ============================================================================
-- ADVERTISER_ACCOUNTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Advertisers can read own account" ON public.advertiser_accounts;

CREATE POLICY "Advertisers can read own account"
  ON public.advertiser_accounts
  FOR SELECT
  TO authenticated
  USING (
    email IN (SELECT auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Only admins can insert advertiser accounts" ON public.advertiser_accounts;

CREATE POLICY "Only admins can insert advertiser accounts"
  ON public.advertiser_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Only admins can update advertiser accounts" ON public.advertiser_accounts;

CREATE POLICY "Only admins can update advertiser accounts"
  ON public.advertiser_accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Only admins can delete advertiser accounts" ON public.advertiser_accounts;

CREATE POLICY "Only admins can delete advertiser accounts"
  ON public.advertiser_accounts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

-- ============================================================================
-- ADVERTISERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can insert advertisers" ON public.advertisers;

CREATE POLICY "Only admins can insert advertisers"
  ON public.advertisers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Only admins can update advertisers" ON public.advertisers;

CREATE POLICY "Only admins can update advertisers"
  ON public.advertisers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Only admins can delete advertisers" ON public.advertisers;

CREATE POLICY "Only admins can delete advertisers"
  ON public.advertisers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

-- ============================================================================
-- CAMPAIGNS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Advertisers can create own campaigns" ON public.campaigns;

CREATE POLICY "Advertisers can create own campaigns"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    advertiser_id IN (
      SELECT advertiser_accounts.id
      FROM advertiser_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE advertiser_accounts.email = auth_data.current_email
        AND advertiser_accounts.is_active = true
    )
    OR EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Campaign owners and admins can update campaigns" ON public.campaigns;

CREATE POLICY "Campaign owners and admins can update campaigns"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (
    advertiser_id IN (
      SELECT advertiser_accounts.id
      FROM advertiser_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE advertiser_accounts.email = auth_data.current_email
        AND advertiser_accounts.is_active = true
    )
    OR EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  )
  WITH CHECK (
    advertiser_id IN (
      SELECT advertiser_accounts.id
      FROM advertiser_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE advertiser_accounts.email = auth_data.current_email
        AND advertiser_accounts.is_active = true
    )
    OR EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Campaign owners and admins can delete campaigns" ON public.campaigns;

CREATE POLICY "Campaign owners and admins can delete campaigns"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (
    advertiser_id IN (
      SELECT advertiser_accounts.id
      FROM advertiser_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE advertiser_accounts.email = auth_data.current_email
        AND advertiser_accounts.is_active = true
    )
    OR EXISTS (
      SELECT 1
      FROM admin_accounts,
           (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

-- ============================================================================
-- PRIZES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Campaign owners can insert prizes" ON public.prizes;

CREATE POLICY "Campaign owners can insert prizes"
  ON public.prizes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  );

DROP POLICY IF EXISTS "Campaign owners can update prizes" ON public.prizes;

CREATE POLICY "Campaign owners can update prizes"
  ON public.prizes
  FOR UPDATE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  );

DROP POLICY IF EXISTS "Campaign owners can delete prizes" ON public.prizes;

CREATE POLICY "Campaign owners can delete prizes"
  ON public.prizes
  FOR DELETE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  );

-- ============================================================================
-- GAME_ATTEMPTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own attempts" ON public.game_attempts;

CREATE POLICY "Users can view own attempts"
  ON public.game_attempts
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_profiles.id
      FROM user_profiles
      CROSS JOIN (SELECT auth.uid()::text as current_uid) auth_data
      WHERE user_profiles.firebase_uid = auth_data.current_uid
    )
  );

DROP POLICY IF EXISTS "Users can create attempts" ON public.game_attempts;

CREATE POLICY "Users can create attempts"
  ON public.game_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_profiles.id
      FROM user_profiles
      CROSS JOIN (SELECT auth.uid()::text as current_uid) auth_data
      WHERE user_profiles.firebase_uid = auth_data.current_uid
    )
  );

-- ============================================================================
-- PRIZE_CLAIMS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own claims" ON public.prize_claims;

CREATE POLICY "Users can view own claims"
  ON public.prize_claims
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_profiles.id
      FROM user_profiles
      CROSS JOIN (SELECT auth.uid()::text as current_uid) auth_data
      WHERE user_profiles.firebase_uid = auth_data.current_uid
    )
  );

DROP POLICY IF EXISTS "Store owners can view their claims" ON public.prize_claims;

CREATE POLICY "Store owners can view their claims"
  ON public.prize_claims
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can create claims" ON public.prize_claims;

CREATE POLICY "Users can create claims"
  ON public.prize_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT user_profiles.id
      FROM user_profiles
      CROSS JOIN (SELECT auth.uid()::text as current_uid) auth_data
      WHERE user_profiles.firebase_uid = auth_data.current_uid
    )
  );

DROP POLICY IF EXISTS "Store owners can update claim status" ON public.prize_claims;

CREATE POLICY "Store owners can update claim status"
  ON public.prize_claims
  FOR UPDATE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT c.id
      FROM campaigns c
      INNER JOIN advertiser_accounts aa ON c.advertiser_id = aa.id
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE aa.email = auth_data.current_email
        AND aa.is_active = true
    )
  );

-- ============================================================================
-- USER_PROFILES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert own profile only" ON public.user_profiles;

CREATE POLICY "Users can insert own profile only"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    firebase_uid IN (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can update own profile only" ON public.user_profiles;

CREATE POLICY "Users can update own profile only"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    firebase_uid IN (SELECT auth.uid()::text)
  )
  WITH CHECK (
    firebase_uid IN (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can view own profile only" ON public.user_profiles;

CREATE POLICY "Users can view own profile only"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    firebase_uid IN (SELECT auth.uid()::text)
    OR EXISTS (
      SELECT 1
      FROM admin_accounts
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );

-- ============================================================================
-- USER_ROLES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_profiles.id
      FROM user_profiles
      CROSS JOIN (SELECT auth.uid()::text as current_uid) auth_data
      WHERE user_profiles.firebase_uid = auth_data.current_uid
    )
  );

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_accounts
      CROSS JOIN (SELECT auth.jwt()->>'email' as current_email) auth_data
      WHERE admin_accounts.email = auth_data.current_email
        AND admin_accounts.is_active = true
    )
  );