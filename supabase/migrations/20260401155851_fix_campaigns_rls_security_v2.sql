/*
  # Fix Campaigns RLS Policies for Better Security

  1. Security Changes
    - Remove overly permissive public policies on campaigns
    - Restrict campaign creation to authenticated users only
    - Restrict campaign updates/deletes to campaign owners and admins
    - Keep public read access for marketplace functionality

  2. Notes
    - Campaigns can be created by authenticated users
    - Only campaign owners and admins can edit/delete campaigns
    - All users (including anonymous) can view active campaigns in the marketplace
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can read campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can delete campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can delete campaigns" ON campaigns;

-- Create secure policies

-- Public can read all campaigns (for marketplace)
CREATE POLICY "Public can read campaigns"
  ON campaigns FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create campaigns
CREATE POLICY "Authenticated users can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Campaign owners and admins can update campaigns
CREATE POLICY "Campaign owners and admins can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Campaign owners and admins can delete campaigns
CREATE POLICY "Campaign owners and admins can delete campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());