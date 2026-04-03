/*
  # Make phone column optional in user_profiles

  1. Changes
    - Alter `user_profiles` table to make `phone` column nullable
    - This allows users to register without providing a phone number
  
  2. Reason
    - Phone verification has been removed from the application
    - Users no longer need to provide phone numbers during registration
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND column_name = 'phone'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN phone DROP NOT NULL;
  END IF;
END $$;