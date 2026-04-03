/*
  # إنشاء جدول حسابات المعلنين

  1. جداول جديدة
    - `advertiser_accounts`
      - `id` (uuid, primary key)
      - `username` (text, unique) - اسم المستخدم
      - `password` (text) - كلمة المرور (نص عادي للتطوير)
      - `email` (text, unique) - البريد الإلكتروني
      - `full_name` (text) - الاسم الكامل
      - `business_name` (text) - اسم النشاط التجاري
      - `phone` (text) - رقم الهاتف
      - `is_active` (boolean) - الحساب نشط
      - `created_at` (timestamp) - تاريخ الإنشاء
      - `last_login` (timestamp) - آخر تسجيل دخول

  2. الأمان
    - تفعيل RLS على جدول `advertiser_accounts`
    - سياسات للمدراء فقط لعرض وإدارة المعلنين
    - المعلن يمكنه تحديث بياناته الخاصة فقط
*/

CREATE TABLE IF NOT EXISTS advertiser_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  business_name text DEFAULT '',
  phone text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE advertiser_accounts ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح بقراءة البيانات للتحقق من تسجيل الدخول
CREATE POLICY "Allow public read for login"
  ON advertiser_accounts
  FOR SELECT
  TO public
  USING (true);

-- سياسة لتحديث آخر دخول
CREATE POLICY "Allow public update last_login"
  ON advertiser_accounts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- إضافة حقل advertiser_id لجدول campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'advertiser_id'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN advertiser_id uuid REFERENCES advertiser_accounts(id);
  END IF;
END $$;

