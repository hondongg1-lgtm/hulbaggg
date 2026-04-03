/*
  # Fix cascade delete for prizes.campaign_id

  1. Changes
    - Drop existing foreign key constraint `prizes_campaign_id_fkey` with NO ACTION
    - Recreate the constraint with ON DELETE CASCADE
    
  2. Security
    - No RLS changes needed
    
  3. Important Notes
    - This ensures when a campaign is deleted, all related prizes are automatically deleted
    - Combined with the existing CASCADE on game_attempts and prize_claims, this creates a complete cascade chain
    - Maintains data integrity by properly cascading deletions from campaigns → prizes → game_attempts/prize_claims
*/

-- Drop the existing foreign key constraint
ALTER TABLE prizes 
DROP CONSTRAINT IF EXISTS prizes_campaign_id_fkey;

-- Recreate the constraint with CASCADE delete
ALTER TABLE prizes 
ADD CONSTRAINT prizes_campaign_id_fkey 
FOREIGN KEY (campaign_id) 
REFERENCES campaigns(id) 
ON DELETE CASCADE;
