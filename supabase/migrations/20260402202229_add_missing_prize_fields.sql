/*
  # Add Missing Prize Fields

  1. Changes
    - Add `description_ar` field to prizes table
    - Add `description_en` field to prizes table
    - Add `image_url` field to prizes table
    - Add `quantity` field as alias for total_quantity

  2. Notes
    - These fields are required by the advertiser dashboard
    - All fields are optional to maintain backward compatibility
*/

-- Add missing fields to prizes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE prizes ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'description_en'
  ) THEN
    ALTER TABLE prizes ADD COLUMN description_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE prizes ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prizes' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE prizes ADD COLUMN quantity integer;
  END IF;
END $$;