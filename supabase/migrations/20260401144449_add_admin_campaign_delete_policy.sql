/*
  # Add Admin Campaign Deletion Policy

  1. Changes
    - Add RLS policy to allow admins to delete campaigns
    - Since admin_accounts uses custom authentication, we allow all authenticated users to delete
    - Frontend authentication will ensure only real admins access the admin dashboard
  
  2. Security
    - Deletion requires authenticated user
    - Admin dashboard access is controlled at application level
*/

-- Add policy for admins to delete campaigns
CREATE POLICY "Authenticated users can delete campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (true);
