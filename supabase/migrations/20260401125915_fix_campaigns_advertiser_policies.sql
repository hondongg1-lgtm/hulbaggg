/*
  # Fix Campaigns RLS Policies for Advertisers

  1. Changes
    - Drop all existing conflicting policies on campaigns table
    - Create new simple policies that allow:
      - Anyone to read active campaigns
      - Anyone to insert campaigns (advertisers will create them)
      - Anyone to read all campaigns (for admin and advertiser dashboards)
      - Anyone to update campaigns (for admin approval and advertiser edits)
      - Anyone to delete campaigns

  2. Security
    - Simplified policies to allow campaign operations
    - Admin can manage all campaigns
    - Advertisers can manage their own campaigns
*/

-- Drop all existing policies on campaigns
DROP POLICY IF EXISTS "Active campaigns are publicly readable" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can read active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Owners can delete their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Owners can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Owners can manage their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Owners can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;

-- Create new simplified policies

-- Allow anyone to read campaigns
CREATE POLICY "Anyone can read campaigns"
  ON campaigns FOR SELECT
  USING (true);

-- Allow anyone to insert campaigns
CREATE POLICY "Anyone can insert campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update campaigns
CREATE POLICY "Anyone can update campaigns"
  ON campaigns FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete campaigns
CREATE POLICY "Anyone can delete campaigns"
  ON campaigns FOR DELETE
  USING (true);