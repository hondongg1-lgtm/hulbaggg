/*
  # إصلاح سياسات RLS لجدول admin_accounts

  ## التعديلات
  - حذف السياسات القديمة المعقدة
  - إضافة سياسة بسيطة للسماح بتسجيل الدخول
  - السياسة تسمح بقراءة الحسابات النشطة فقط أثناء تسجيل الدخول
*/

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Admins can read admin accounts" ON admin_accounts;
DROP POLICY IF EXISTS "Super admins can manage admin accounts" ON admin_accounts;

-- سياسة جديدة للسماح بتسجيل الدخول (قراءة الحسابات النشطة)
CREATE POLICY "Allow login for active admins"
  ON admin_accounts FOR SELECT
  USING (is_active = true);

-- سياسة للسماح بتحديث آخر دخول
CREATE POLICY "Allow update last login"
  ON admin_accounts FOR UPDATE
  USING (is_active = true)
  WITH CHECK (is_active = true);

-- سياسة للمدراء المسجلين للقراءة والتعديل
CREATE POLICY "Authenticated admins can manage"
  ON admin_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND admin_accounts.is_active = true
    )
  );
