-- Make phone column nullable to allow initial profile creation without a phone number
-- (e.g. for Google Auth users who haven't provided it yet)

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'phone' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN phone DROP NOT NULL;
  END IF;
END $$;

-- Also let's make full_name have a default empty string if not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN full_name SET DEFAULT '';
  END IF;
END $$;
