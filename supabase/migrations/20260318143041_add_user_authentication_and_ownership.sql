/*
  # Add User Authentication and Ad Ownership

  1. Updates to Tables
    - `ads`
      - Add `user_id` (uuid) column to track ad owner
      - Add foreign key reference to auth.users

  2. Security Updates
    - Add RLS policies for authenticated users to create ads
    - Add RLS policies for users to update/delete their own ads
    - Update existing policies to work with user ownership

  3. Notes
    - Users must be authenticated to create, update, or delete ads
    - All users can view active ads (existing policy)
    - Users can only modify their own ads
*/

-- Add user_id column to ads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE ads ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can create ads" ON ads;
DROP POLICY IF EXISTS "Users can update own ads" ON ads;
DROP POLICY IF EXISTS "Users can delete own ads" ON ads;

-- Create policy for authenticated users to create ads
CREATE POLICY "Users can create ads"
  ON ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own ads
CREATE POLICY "Users can update own ads"
  ON ads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own ads
CREATE POLICY "Users can delete own ads"
  ON ads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update sample ads to have a system user (optional, for demo purposes)
-- Note: In production, these would be linked to actual users