-- Sample test data for marketplace platform

-- Create test advertiser user
-- Email: test@advertiser.com
-- Password: test123456

-- Create test campaigns (run this after creating an advertiser account)

-- Sample campaign 1: Restaurant in Al-Mubarraz
INSERT INTO campaigns (
  user_id,
  store_name,
  business_type,
  neighborhood_id,
  description,
  total_prize_pool,
  win_probability,
  consolation_prize,
  consolation_discount,
  daily_attempts_per_user,
  status,
  start_date,
  end_date
) VALUES (
  'YOUR_USER_ID_HERE',
  'مطعم الذواق',
  'restaurant',
  (SELECT id FROM neighborhoods WHERE name_ar = 'المبرز' LIMIT 1),
  'جرّب حظك واربح خصم 50% على وجبتك القادمة',
  1000,
  15.00,
  'خصم 2 ريال على أي وجبة',
  2.00,
  1,
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
) RETURNING id;

-- Add prizes for campaign 1
INSERT INTO prizes (
  campaign_id,
  name,
  description,
  prize_type,
  quantity_total,
  quantity_remaining
) VALUES (
  'CAMPAIGN_ID_FROM_ABOVE',
  'خصم 50% على الوجبة',
  'خصم نصف قيمة الوجبة عند الزيارة القادمة',
  'discount',
  150,
  150
);

-- Sample campaign 2: Pharmacy in Al-Hofuf
INSERT INTO campaigns (
  user_id,
  store_name,
  business_type,
  neighborhood_id,
  description,
  total_prize_pool,
  win_probability,
  consolation_prize,
  consolation_discount,
  daily_attempts_per_user,
  status,
  start_date,
  end_date
) VALUES (
  'YOUR_USER_ID_HERE',
  'صيدلية العافية',
  'pharmacy',
  (SELECT id FROM neighborhoods WHERE name_ar = 'الهفوف' LIMIT 1),
  'فرصة للفوز بمنتجات عناية مجانية',
  1000,
  10.00,
  'خصم 5 ريال',
  5.00,
  1,
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Add prizes for campaign 2
INSERT INTO prizes (
  campaign_id,
  name,
  description,
  prize_type,
  quantity_total,
  quantity_remaining
) VALUES (
  'CAMPAIGN_ID_FROM_ABOVE',
  'منتج عناية مجاني',
  'اختر أي منتج عناية بقيمة 30 ريال',
  'free_item',
  100,
  100
);

-- Sample campaign 3: Cafe in Al-Omran
INSERT INTO campaigns (
  user_id,
  store_name,
  business_type,
  neighborhood_id,
  description,
  total_prize_pool,
  win_probability,
  consolation_prize,
  consolation_discount,
  daily_attempts_per_user,
  status,
  start_date,
  end_date
) VALUES (
  'YOUR_USER_ID_HERE',
  'كافيه الأناقة',
  'cafe',
  (SELECT id FROM neighborhoods WHERE name_ar = 'العمران' LIMIT 1),
  'قهوة مجانية لكل فائز',
  500,
  20.00,
  'خصم 3 ريال',
  3.00,
  1,
  'active',
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Add prizes for campaign 3
INSERT INTO prizes (
  campaign_id,
  name,
  description,
  prize_type,
  quantity_total,
  quantity_remaining
) VALUES (
  'CAMPAIGN_ID_FROM_ABOVE',
  'قهوة مجانية',
  'اختر أي مشروب من القائمة',
  'free_item',
  100,
  100
);
