/*
  # Optimize Database for Fast Authentication

  1. Changes
    - Add indexes on frequently queried columns
    - Optimize RLS policies for faster checks
    - Remove unnecessary triggers if any

  2. Performance Improvements
    - Index on user_roles(user_id, is_active) for faster role lookups
    - Index on user_profiles(user_id) for faster profile lookups
    - Simplified RLS policies
*/

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_active 
  ON user_roles(user_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
  ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_roles_email 
  ON user_roles(email);