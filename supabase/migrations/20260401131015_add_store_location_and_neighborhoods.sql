/*
  # Add Store Location and Neighborhood Distribution System

  ## Changes Made
  
  1. Campaign Updates
    - Add `store_location` field to store the physical location/address of the store
    - Add `neighborhoods` field (JSONB array) to track which neighborhoods get bags
    - Each neighborhood entry represents 1000 bags distribution
    
  ## Business Logic
  
  - Every 1000 bags allows advertiser to select 1 neighborhood
  - Example: 2000 bags = 2 neighborhoods, 3000 bags = 3 neighborhoods
  - Neighborhoods stored as JSON array: ["الملقا", "النرجس"]
  
  ## Notes
  
  - Store location will be displayed on campaign cards
  - Neighborhoods help users find relevant local campaigns
*/

-- Add store location and neighborhoods to campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'store_location'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN store_location text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'neighborhoods'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN neighborhoods jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;