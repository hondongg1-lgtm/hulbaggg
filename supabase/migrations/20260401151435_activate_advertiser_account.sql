/*
  # تفعيل حساب المعلن
  
  1. التغييرات
    - تفعيل حساب المعلن hondong6@gmail.com
    - تغيير حالة is_active إلى true
*/

-- تفعيل الحساب
UPDATE advertiser_accounts 
SET is_active = true 
WHERE email = 'hondong6@gmail.com';
