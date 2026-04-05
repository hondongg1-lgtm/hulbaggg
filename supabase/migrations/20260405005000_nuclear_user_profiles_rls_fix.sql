-- Nuclear RLS Clean Slate for user_profiles
-- This script drops ALL typical policy names for user_profiles to ensure no legacy 
-- firebase_uid policies are blocking the signup/update flow.

DO $$
BEGIN
  -- 1. Create a function to drop all policies for a table if not exists (internal utility)
  -- This is a very clean way to ensure we wipe everything before re-creating.
  
  -- 2. Drop all known/found policies on user_profiles
  DROP POLICY IF EXISTS "Users can insert own profile only" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile only" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can view own profile only" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Anyone can view user profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Anyone can insert profile on signup" ON public.user_profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can view own profiles" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can update own profiles" ON public.user_profiles;
END $$;

-- 3. Re-create the Essential Standard Policies (using ID = UUID)
-- These are the only policies that should exist for this table.

-- Select (Self + Admin)
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin');

-- Insert (Self Only)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Update (Self Only)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Delete (Self Only)
CREATE POLICY "Users can delete own profile"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- 4. Global Policy to allow Admins to manage profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Force Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
