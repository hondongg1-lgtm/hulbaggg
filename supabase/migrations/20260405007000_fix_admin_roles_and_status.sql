-- 1. Create a secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- 1. Check by UID (standard)
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- 2. Fallback: Check by Email (for manual Supabase entries with NULL user_id)
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = (auth.jwt() ->> 'email') AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix user_roles permissions
-- Ensure 'user' is a valid role string in the table check constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'advertiser', 'user'));

-- Clear existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
DROP POLICY IF EXISTS "Users can set own role" ON user_roles;
DROP POLICY IF EXISTS "Users can manage own role" ON user_roles;
-- Dynamic Policy: Admins can do everything
CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (is_admin());

-- Dynamic Policy: Users can manage their own role (non-admin roles only)
-- We use FOR ALL for simplicity and LOWER() to prevent case-sensitivity issues.
CREATE POLICY "Users can manage own role"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    LOWER(email) = LOWER(auth.jwt() ->> 'email')
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND 
    role IN ('user', 'advertiser')
  );

-- NEW Policy: Users can set their own role (during first-time signup)
-- This allows INSERT and UPDATE for own record, restricted to non-admin roles.
CREATE POLICY "Users can set own role"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND 
    role IN ('user', 'advertiser')
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND 
    role IN ('user', 'advertiser')
  );

-- 3. Ensure status column exists in user_profiles and defaults to 'active'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- 4. Update existing NULL or empty status to 'active'
UPDATE user_profiles SET status = 'active' WHERE status IS NULL OR status = '';

-- 5. Fix user_profiles and user_roles constraints/permissions
-- Cleanup duplicates in user_roles (keep the one with a user_id or the latest one)
DELETE FROM user_roles a
USING user_roles b
WHERE a.id < b.id AND a.email = b.email;

-- Add UNIQUE constraint to email if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_email_key'
    ) THEN
        ALTER TABLE user_roles ADD CONSTRAINT user_roles_email_key UNIQUE (email);
    END IF;
END $$;

-- Clear legacy policies that might be recursive
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 6. Final setup
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE user_roles TO authenticated;
GRANT ALL ON TABLE user_roles TO service_role;
GRANT ALL ON TABLE user_profiles TO authenticated;
GRANT ALL ON TABLE user_profiles TO service_role;

