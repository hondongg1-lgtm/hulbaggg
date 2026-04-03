/*
  # Fix cascade delete for game_attempts.prize_id

  1. Changes
    - Drop existing foreign key constraint `game_attempts_prize_id_fkey` with NO ACTION
    - Recreate the constraint with ON DELETE CASCADE
    
  2. Security
    - No RLS changes needed
    
  3. Important Notes
    - This ensures when a prize is deleted, all related game_attempts are automatically deleted
    - Prevents foreign key constraint violations when deleting campaigns with prizes
    - Maintains data integrity by properly cascading deletions
*/

-- Drop the existing foreign key constraint
ALTER TABLE game_attempts 
DROP CONSTRAINT IF EXISTS game_attempts_prize_id_fkey;

-- Recreate the constraint with CASCADE delete
ALTER TABLE game_attempts 
ADD CONSTRAINT game_attempts_prize_id_fkey 
FOREIGN KEY (prize_id) 
REFERENCES prizes(id) 
ON DELETE CASCADE;
