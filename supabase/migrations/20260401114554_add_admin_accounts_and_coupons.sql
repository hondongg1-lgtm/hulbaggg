/*
  # إضافة جدول حسابات الإدارة وكوبونات الجوائز

  ## الجداول الجديدة
  
  ### 1. `admin_accounts`
  حسابات الإدارة مع الإيميلات وكلمات المرور
  - `id` (uuid, primary key)
  - `email` (text, unique) - البريد الإلكتروني
  - `password` (text) - كلمة المرور (سيتم تشفيرها)
  - `full_name` (text) - الاسم الكامل
  - `role` (text) - الدور (super_admin, admin)
  - `is_active` (boolean) - نشط أم لا
  - `created_at` (timestamp)
  - `last_login` (timestamp, nullable)
  
  ### 2. تحديث جدول `prize_claims`
  إضافة معلومات إضافية للكوبونات:
  - `qr_code` (text, unique) - رمز QR للكوبون
  - `user_phone` (text) - رقم جوال المستخدم
  - `store_location` (text, nullable) - موقع المحل
  
  ### 3. إضافة حقل `store_location` في campaigns
  
  ## الأمان
  - تفعيل RLS على جدول admin_accounts
  - سياسات محكمة للوصول
*/

-- جدول حسابات الإدارة
CREATE TABLE IF NOT EXISTS admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- السياسات: فقط المدراء يمكنهم القراءة والتعديل
CREATE POLICY "Admins can read admin accounts"
  ON admin_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.email = auth.jwt()->>'email'
      AND admin_accounts.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin accounts"
  ON admin_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.email = auth.jwt()->>'email'
      AND admin_accounts.role = 'super_admin'
      AND admin_accounts.is_active = true
    )
  );

-- إضافة حقول إضافية لجدول prize_claims
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prize_claims' AND column_name = 'qr_code'
  ) THEN
    ALTER TABLE prize_claims ADD COLUMN qr_code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prize_claims' AND column_name = 'user_phone'
  ) THEN
    ALTER TABLE prize_claims ADD COLUMN user_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prize_claims' AND column_name = 'redeemed_by'
  ) THEN
    ALTER TABLE prize_claims ADD COLUMN redeemed_by text;
  END IF;
END $$;

-- إضافة حقل موقع المحل في campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'store_location'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN store_location text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'store_address'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN store_address text DEFAULT '';
  END IF;
END $$;

-- إدراج حساب مدير افتراضي (يمكن تغييره لاحقاً)
INSERT INTO admin_accounts (email, password, full_name, role, is_active)
VALUES ('admin@bagad.sa', 'Admin@123', 'المدير العام', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;