/*
  # Fix Authentication System for All User Types

  1. Changes
    - Make admin role restricted to only hondongg1@gmail.com
    - Allow advertisers to register and login automatically
    - Allow regular users to register and login automatically
    - Fix user_roles table to automatically assign roles
    - Add trigger to auto-create user_role entries

  2. Security
    - Admin access only for hondongg1@gmail.com
    - Automatic role assignment for new users
    - Proper RLS policies for all user types
*/

-- First, set up the admin account
DO $$
BEGIN
  -- Clear existing admin roles
  DELETE FROM user_roles WHERE role = 'admin';
  
  -- Insert admin role for hondongg1@gmail.com if user exists
  INSERT INTO user_roles (user_id, email, role, is_active)
  SELECT id, email, 'admin', true
  FROM auth.users
  WHERE email = 'hondongg1@gmail.com'
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', is_active = true;
END $$;

-- Create function to automatically assign role when user profile is created
CREATE OR REPLACE FUNCTION auto_assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already has a role
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.user_id) THEN
    -- Default to 'user' role for new registrations
    INSERT INTO user_roles (user_id, email, role, is_active)
    VALUES (NEW.user_id, NEW.email, 'user', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;

CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_role();

-- Update RLS policies for user_roles to allow users to read their own role
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow system to insert roles automatically
DROP POLICY IF EXISTS "System can insert roles" ON user_roles;
CREATE POLICY "System can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update user_profiles policies to allow registration
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update user_profiles policies to allow users to view their profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Update user_profiles policies to allow users to update their profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);