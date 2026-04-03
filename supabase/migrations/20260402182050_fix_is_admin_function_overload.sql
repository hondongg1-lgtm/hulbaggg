/*
  # Fix is_admin Function Overload

  ## Changes Made:
  
  ### 1. Remove Old is_admin Function Without Parameters
    - The old function without parameters has a mutable search_path
    - Replace with the secure version that has search_path set
*/

-- Drop the old is_admin function without parameters
DROP FUNCTION IF EXISTS public.is_admin();

-- Ensure the secure version exists
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_accounts
    WHERE email = user_email
      AND is_active = true
  );
END;
$$;