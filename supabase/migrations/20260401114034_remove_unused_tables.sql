/*
  # حذف الجداول القديمة غير المستخدمة

  ## الجداول المحذوفة
  هذه الجداول من أنظمة قديمة ولم تعد مستخدمة في المشروع الحالي:
  
  1. `service_packages` - باقات الخدمات القديمة
  2. `grocery_stores` - نظام البقالات القديم
  3. `ad_campaigns` - نظام الحملات الإعلانية القديم (مختلف عن campaigns)
  4. `payments` - نظام المدفوعات القديم
  5. `qr_codes` - نظام رموز QR القديم
  6. `user_profiles` - ملفات المستخدمين القديمة
  7. `scans` - نظام المسح القديم
  8. `draws` - نظام السحوبات القديم
  9. `stores` - نظام المحلات القديم
  10. `neighborhoods` - نظام الأحياء القديم

  ## الجداول المستخدمة حالياً (لن يتم حذفها)
  - `campaigns` - الحملات الإعلانية النشطة
  - `prizes` - الجوائز
  - `game_attempts` - محاولات اللعب
  - `prize_claims` - استلام الجوائز
  - `user_roles` - أدوار المستخدمين
*/

-- حذف الجداول القديمة بالترتيب الصحيح (من الأسفل للأعلى حسب العلاقات)
DROP TABLE IF EXISTS scans CASCADE;
DROP TABLE IF EXISTS draws CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS grocery_stores CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;