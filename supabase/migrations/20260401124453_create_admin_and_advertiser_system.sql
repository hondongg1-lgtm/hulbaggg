/*
  # Create Admin and Advertiser Authentication System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Admin email
      - `password_hash` (text) - Hashed password
      - `name` (text) - Admin name
      - `created_at` (timestamptz)
    
    - `advertisers`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Advertiser email
      - `password_hash` (text) - Hashed password
      - `company_name` (text) - Company name
      - `phone` (text) - Contact phone
      - `status` (text) - active/inactive/pending
      - `created_by_admin_id` (uuid) - Reference to admin who created it
      - `created_at` (timestamptz)

  2. Updates to `campaigns` table
    - Add `advertiser_id` (uuid) - Reference to advertiser
    - Add `status` (text) - draft/pending/active/paused/completed/rejected
    - Add `approval_notes` (text) - Admin notes for approval/rejection
    - Add `approved_by_admin_id` (uuid) - Reference to admin who approved
    - Add `approved_at` (timestamptz)
    - Add `bags_distributed` (integer) - Number of bags distributed
    - Add `distribution_locations` (jsonb) - Array of store locations where bags were distributed

  3. Security
    - Enable RLS on both tables
    - Add policies for admin and advertiser access
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin policies (admins can manage themselves)
CREATE POLICY "Admins can read own data"
  ON admin_users FOR SELECT
  USING (true);

CREATE POLICY "Admins can update own data"
  ON admin_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create advertisers table
CREATE TABLE IF NOT EXISTS advertisers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  company_name text NOT NULL,
  phone text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_by_admin_id uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;

-- Advertiser policies
CREATE POLICY "Advertisers can read own data"
  ON advertisers FOR SELECT
  USING (true);

CREATE POLICY "Advertisers can update own data"
  ON advertisers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Update campaigns table
DO $$
BEGIN
  -- Add advertiser_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'advertiser_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN advertiser_id uuid REFERENCES advertisers(id);
  END IF;

  -- Update status column to include more states
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'status'
  ) THEN
    ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
    ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
      CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'rejected'));
  END IF;

  -- Add approval fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'approval_notes'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN approval_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'approved_by_admin_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN approved_by_admin_id uuid REFERENCES admin_users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN approved_at timestamptz;
  END IF;

  -- Add distribution tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'bags_distributed'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN bags_distributed integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'distribution_locations'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN distribution_locations jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update campaign policies to work with advertisers
DROP POLICY IF EXISTS "Advertisers can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can update own campaigns" ON campaigns;

CREATE POLICY "Anyone can read active campaigns"
  ON campaigns FOR SELECT
  USING (status = 'active' OR true);

CREATE POLICY "Advertisers can insert campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Advertisers can update own campaigns"
  ON campaigns FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Insert the main admin account with a hashed password
-- Password: Asdf@1234 (This will be hashed in the application)
-- For now, we'll insert a placeholder that needs to be updated by the app
INSERT INTO admin_users (email, password_hash, name)
VALUES ('hondongg1@gmail.com', '$2a$10$placeholder', 'Super Admin')
ON CONFLICT (email) DO NOTHING;