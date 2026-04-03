/*
  # Fix Advertiser Deletion and Status Logic

  1. Changes
    - Update foreign key constraint on campaigns.advertiser_id to CASCADE on delete
    - This allows admins to delete advertisers even if they have campaigns
    - When advertiser is deleted, all their campaigns will be deleted automatically
  
  2. Security
    - Maintains referential integrity
    - Prevents orphaned campaigns
*/

-- Drop the existing foreign key constraint
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_advertiser_id_fkey;

-- Recreate it with CASCADE delete
ALTER TABLE campaigns
ADD CONSTRAINT campaigns_advertiser_id_fkey 
FOREIGN KEY (advertiser_id) 
REFERENCES advertiser_accounts(id) 
ON DELETE CASCADE;
