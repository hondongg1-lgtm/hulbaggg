/*
  Make campaigns.user_id nullable for public campaigns
  
  This allows creating test campaigns without requiring a user_id.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' 
    AND column_name = 'user_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE campaigns ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;
