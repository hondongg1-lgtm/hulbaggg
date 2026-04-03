/*
  # Add missing campaign fields

  1. Changes
    - Add store_name column to campaigns table
    - Add business_type column to campaigns table
    - Add description column to campaigns table (separate from description_ar/en)
  
  2. Notes
    - These fields are needed by the CreateCampaignPage component
    - All fields have default values to avoid breaking existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'store_name'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN store_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'business_type'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN business_type text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'description'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN description text DEFAULT '';
  END IF;
END $$;