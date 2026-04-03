/*
  # Add Payments Table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `ad_campaign_id` (uuid, references ad_campaigns)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric) - Amount in SAR
      - `paylink_transaction_id` (text) - Paylink transaction reference
      - `paylink_order_number` (text) - Order number from Paylink
      - `status` (text) - Payment status: pending, completed, failed, refunded
      - `payment_url` (text) - Paylink payment URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payments` table
    - Add policy for users to view their own payments
    - Add policy for users to create payments
    
  3. Indexes
    - Add index on ad_campaign_id for faster lookups
    - Add index on user_id for faster user payment queries
    - Add index on paylink_transaction_id for webhook processing
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_campaign_id uuid REFERENCES ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10, 2) NOT NULL,
  paylink_transaction_id text,
  paylink_order_number text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments (for webhook updates)
CREATE POLICY "Users can update own payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_ad_campaign_id ON payments(ad_campaign_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paylink_transaction_id ON payments(paylink_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);