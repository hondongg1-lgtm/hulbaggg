-- Add missing UI/UX fields to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS bag_color text DEFAULT '#22c55e';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_code text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description_en text;

-- Add missing fields to prizes table
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS total_quantity integer DEFAULT 0;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS quantity_remaining integer DEFAULT 0;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS value numeric DEFAULT 0;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS prize_type text DEFAULT 'coupon';

-- Add index and uniqueness where appropriate
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_code ON campaigns(campaign_code);
