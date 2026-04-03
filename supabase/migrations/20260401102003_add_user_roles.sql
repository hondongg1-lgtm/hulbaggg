/*
  # Add user roles system

  1. Changes
    - Add `role` column to auth.users metadata
    - Add `user_roles` table to track user roles (admin, advertiser)
    - Add RLS policies for role-based access
    - Set hondongg1@gmail.com as admin
    
  2. Security
    - Enable RLS on `user_roles` table
    - Only admins can view all data
    - Advertisers can only view their own data
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'advertiser')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update campaigns table policies to check roles
DROP POLICY IF EXISTS "Advertisers can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can create own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can delete own campaigns" ON campaigns;

CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());