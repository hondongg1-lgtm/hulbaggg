/*
  # Update Campaigns with Neighborhood IDs

  1. Data Migration
    - Update existing campaigns to use the new neighborhood_id field
    - Map old neighborhoods jsonb to new neighborhood_id references
    - Set default neighborhood for campaigns without location

  2. Notes
    - neighborhoods column is jsonb type
    - Map based on the first neighborhood in the array
*/

-- Update campaigns that have المباركية in their neighborhoods jsonb
UPDATE campaigns
SET neighborhood_id = (SELECT id FROM neighborhoods WHERE name_ar = 'المباركية' LIMIT 1)
WHERE neighborhoods::text LIKE '%المباركية%'
AND neighborhood_id IS NULL;

-- Update campaigns that have القليب in their neighborhoods jsonb
UPDATE campaigns
SET neighborhood_id = (SELECT id FROM neighborhoods WHERE name_ar = 'القليب' LIMIT 1)
WHERE neighborhoods::text LIKE '%القليب%'
AND neighborhood_id IS NULL;

-- Update campaigns that have المحدود in their neighborhoods jsonb
UPDATE campaigns
SET neighborhood_id = (SELECT id FROM neighborhoods WHERE name_ar = 'المحدود' LIMIT 1)
WHERE neighborhoods::text LIKE '%المحدود%'
AND neighborhood_id IS NULL;

-- For campaigns without a neighborhood, set a default (المباركية)
UPDATE campaigns
SET neighborhood_id = (SELECT id FROM neighborhoods WHERE name_ar = 'المباركية' LIMIT 1)
WHERE neighborhood_id IS NULL;