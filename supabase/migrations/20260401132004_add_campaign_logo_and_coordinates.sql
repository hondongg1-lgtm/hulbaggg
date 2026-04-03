/*
  # Add Campaign Logo and Location Coordinates

  1. Changes
    - Add `logo_url` column to campaigns table for storing logo images
    - Add `latitude` and `longitude` columns for precise location coordinates
    - Add `neighborhood` text field for filtering campaigns by area
    
  2. Purpose
    - Enable advertisers to upload beautiful logos for their campaigns
    - Support geolocation-based filtering to show nearby campaigns
    - Allow filtering by neighborhood for better user experience
*/

-- Add logo URL column for campaign branding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN logo_url text DEFAULT '';
  END IF;
END $$;

-- Add latitude and longitude for precise location
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN latitude numeric(10, 8);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN longitude numeric(11, 8);
  END IF;
END $$;

-- Add neighborhood field for filtering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'neighborhood'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN neighborhood text DEFAULT '';
  END IF;
END $$;
