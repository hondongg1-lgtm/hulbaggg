/*
  # Add missing prize fields

  1. Changes
    - Add name column to prizes table (used by CreateCampaignPage)
    - Add description column to prizes table
  
  2. Notes
    - These fields complement name_ar/name_en
    - Default values prevent breaking existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'name'
  ) THEN
    ALTER TABLE prizes ADD COLUMN name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'description'
  ) THEN
    ALTER TABLE prizes ADD COLUMN description text DEFAULT '';
  END IF;
END $$;