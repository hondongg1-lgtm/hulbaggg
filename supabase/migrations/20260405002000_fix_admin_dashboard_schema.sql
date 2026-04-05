-- 1. Ensure wallets table exists
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Ensure transactions table exists
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'campaign_payment', 'reward')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3. Fix PostgREST join for user_profiles and user_roles
-- Cleanup: Remove any orphan roles that don't have a corresponding profile
DELETE FROM user_roles WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- This direct FK allows 'user_profiles?select=*,user_roles(role)' to work
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_profile;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_profile 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Global Admins
DROP POLICY IF EXISTS "Admins can view all wallets" ON wallets;
CREATE POLICY "Admins can view all wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage wallets" ON wallets;
CREATE POLICY "Admins can manage wallets"
  ON wallets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Policies for Users (Wallets)
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 7. Policies for Users (Transactions)
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = transactions.wallet_id AND wallets.user_id = auth.uid()
    )
  );
