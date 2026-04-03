/*
  # إضافة حقول جديدة لجدول البقالات

  1. التعديلات
    - إضافة حقل `website` لرابط موقع البقالة (اختياري)
    - إضافة حقل `description` للملاحظات والاستفسارات (اختياري)
    - حذف حقل `neighborhood` (الحي) لأنه لم يعد مطلوباً
  
  2. الأمان
    - لا تغيير في سياسات RLS
*/

-- إضافة حقل رابط الموقع
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_stores' AND column_name = 'website'
  ) THEN
    ALTER TABLE grocery_stores ADD COLUMN website text;
  END IF;
END $$;

-- إضافة حقل الوصف/الملاحظات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_stores' AND column_name = 'description'
  ) THEN
    ALTER TABLE grocery_stores ADD COLUMN description text;
  END IF;
END $$;

-- حذف حقل الحي إذا كان موجوداً
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'grocery_stores' AND column_name = 'neighborhood'
  ) THEN
    ALTER TABLE grocery_stores DROP COLUMN neighborhood;
  END IF;
END $$;