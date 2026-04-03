/*
  # Add Firebase UID to user_profiles

  1. Changes
    - Add `firebase_uid` column to `user_profiles` table to store Firebase Authentication user ID
    - This links Firebase auth with Supabase user profiles
    - Make it nullable since existing users don't have Firebase UIDs yet

  2. Security
    - No changes to RLS policies needed
    - The column is for internal tracking only
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN firebase_uid text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
