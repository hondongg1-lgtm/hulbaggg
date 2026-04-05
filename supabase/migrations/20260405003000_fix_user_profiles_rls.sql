-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Anyone can insert profile on signup" ON public.user_profiles;

-- 2. Create correct UUID-based policies
-- These policies use 'id' which references auth.users(id)

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- 3. Ensure admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );
