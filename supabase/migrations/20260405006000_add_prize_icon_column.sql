-- Add missing 'icon' column to the prizes table
-- This fixes the error during campaign creation where the frontend tries to save an icon name.

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prizes' AND column_name = 'icon'
  ) THEN
    ALTER TABLE prizes ADD COLUMN icon text DEFAULT 'gift';
  END IF;
END $$;
