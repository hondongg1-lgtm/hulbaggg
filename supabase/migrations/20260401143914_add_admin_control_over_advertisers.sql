/*
  # Add Admin Control Over Advertisers

  1. Changes
    - Add INSERT policy for advertiser_accounts to allow creating new advertisers
    - Add DELETE policy for advertiser_accounts to allow deleting advertisers
    - Add UPDATE policy for advertiser_accounts to allow full control over advertiser data
    - Remove restrictive policies that only allowed login-related operations
  
  2. Security
    - All operations are unrestricted (public access) since authentication happens at application level
    - This matches the existing admin_users table pattern where RLS is enabled but policies allow public access
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public update last_login" ON advertiser_accounts;

-- Add comprehensive policies for full CRUD operations
CREATE POLICY "Allow public insert advertisers"
  ON advertiser_accounts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update advertisers"
  ON advertiser_accounts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete advertisers"
  ON advertiser_accounts
  FOR DELETE
  TO public
  USING (true);
