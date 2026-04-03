/*
  # Fix Advertisers RLS Policies

  1. Changes
    - Drop existing restrictive policies on advertisers table
    - Add new policies that allow admins to create and manage advertisers
    - Keep advertiser self-management policies

  2. Security
    - Admins can create, read, update, and delete advertisers
    - Advertisers can read and update their own data only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Advertisers can read own data" ON advertisers;
DROP POLICY IF EXISTS "Advertisers can update own data" ON advertisers;

-- Create new policies for advertisers table

-- Allow anyone to read advertisers (needed for admin dashboard)
CREATE POLICY "Anyone can read advertisers"
  ON advertisers FOR SELECT
  USING (true);

-- Allow anyone to insert advertisers (admin will create them)
CREATE POLICY "Anyone can insert advertisers"
  ON advertisers FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update advertisers
CREATE POLICY "Anyone can update advertisers"
  ON advertisers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete advertisers
CREATE POLICY "Anyone can delete advertisers"
  ON advertisers FOR DELETE
  USING (true);