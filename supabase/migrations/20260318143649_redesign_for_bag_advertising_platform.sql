/*
  # Redesign Database for Bag Advertising Platform

  1. Changes to Tables
    - Drop old categories table and create new service_packages table
    - Update ads table to ad_slots table with new structure
    - Add grocery_stores table
    - Add ad_campaigns table

  2. New Tables
    - `service_packages`
      - `id` (uuid, primary key)
      - `name_ar` (text) - Package name in Arabic
      - `name_en` (text) - Package name in English
      - `slots_count` (integer) - Number of ad slots (1-4)
      - `price_per_month` (numeric) - Monthly price
      - `price_per_3months` (numeric) - 3 months price
      - `price_per_6months` (numeric) - 6 months price
      - `bags_distribution` (integer) - Number of bags distributed
      - `features` (jsonb) - Package features
      - `created_at` (timestamptz)
    
    - `grocery_stores`
      - `id` (uuid, primary key)
      - `name` (text) - Store name
      - `owner_name` (text) - Owner name
      - `phone` (text) - Contact phone
      - `city` (text) - City
      - `neighborhood` (text) - Neighborhood
      - `bags_needed_monthly` (integer) - Monthly bags needed
      - `status` (text) - pending, approved, active
      - `user_id` (uuid) - Reference to user who registered
      - `created_at` (timestamptz)
    
    - `ad_campaigns`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Advertiser user ID
      - `package_id` (uuid) - Selected package
      - `business_name` (text) - Business name
      - `business_type` (text) - Type of business
      - `ad_text` (text) - Advertisement text
      - `logo_url` (text) - Logo image URL
      - `phone` (text) - Contact phone
      - `website` (text) - Website URL
      - `duration_months` (integer) - Campaign duration
      - `total_price` (numeric) - Total payment
      - `status` (text) - pending, active, completed, cancelled
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create service packages table
CREATE TABLE IF NOT EXISTS service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  slots_count integer NOT NULL,
  price_per_month numeric NOT NULL DEFAULT 0,
  price_per_3months numeric NOT NULL DEFAULT 0,
  price_per_6months numeric NOT NULL DEFAULT 0,
  bags_distribution integer NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create grocery stores table
CREATE TABLE IF NOT EXISTS grocery_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  neighborhood text NOT NULL,
  bags_needed_monthly integer NOT NULL DEFAULT 1000,
  status text DEFAULT 'pending',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create ad campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid REFERENCES service_packages(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  business_type text NOT NULL,
  ad_text text NOT NULL,
  logo_url text,
  phone text NOT NULL,
  website text,
  duration_months integer NOT NULL DEFAULT 1,
  total_price numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies for service_packages (public read)
CREATE POLICY "Anyone can view packages"
  ON service_packages FOR SELECT
  TO public
  USING (true);

-- Policies for grocery_stores
CREATE POLICY "Anyone can view approved stores"
  ON grocery_stores FOR SELECT
  TO public
  USING (status = 'approved' OR status = 'active');

CREATE POLICY "Users can register stores"
  ON grocery_stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores"
  ON grocery_stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for ad_campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON ad_campaigns FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Users can create campaigns"
  ON ad_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own campaigns"
  ON ad_campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON ad_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default service packages
INSERT INTO service_packages (name_ar, name_en, slots_count, price_per_month, price_per_3months, price_per_6months, bags_distribution, features) VALUES
  (
    'مساحة واحدة',
    'Single Slot',
    1,
    500,
    1350,
    2400,
    5000,
    '["مساحة إعلانية واحدة", "توزيع 5000 كيس شهرياً", "تصميم احترافي", "طباعة عالية الجودة"]'::jsonb
  ),
  (
    'مساحتان',
    'Two Slots',
    2,
    900,
    2430,
    4320,
    5000,
    '["مساحتان إعلانيتان", "توزيع 5000 كيس شهرياً", "تصميم احترافي", "طباعة عالية الجودة", "خصم 10%"]'::jsonb
  ),
  (
    'ثلاث مساحات',
    'Three Slots',
    3,
    1250,
    3375,
    6000,
    5000,
    '["ثلاث مساحات إعلانية", "توزيع 5000 كيس شهرياً", "تصميم احترافي", "طباعة عالية الجودة", "خصم 17%", "أولوية في المواقع"]'::jsonb
  ),
  (
    'أربع مساحات - الكيس كامل',
    'Full Bag - Four Slots',
    4,
    1500,
    4050,
    7200,
    5000,
    '["أربع مساحات إعلانية", "توزيع 5000 كيس شهرياً", "تصميم احترافي", "طباعة عالية الجودة", "خصم 25%", "ملكية حصرية للكيس", "تقارير شهرية مفصلة"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Insert sample grocery stores
INSERT INTO grocery_stores (name, owner_name, phone, city, neighborhood, bags_needed_monthly, status) VALUES
  ('بقالة النور', 'أحمد محمد', '0501234567', 'الرياض', 'النرجس', 2000, 'active'),
  ('سوبر ماركت الفيصلية', 'خالد العلي', '0551234567', 'جدة', 'الفيصلية', 3000, 'active'),
  ('بقالة السلام', 'محمد الشمري', '0561234567', 'الدمام', 'الشاطئ', 1500, 'active'),
  ('مركز التسوق المميز', 'عبدالله القحطاني', '0571234567', 'مكة', 'العزيزية', 2500, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample ad campaigns
INSERT INTO ad_campaigns (business_name, business_type, ad_text, phone, website, duration_months, total_price, status, start_date, end_date, package_id) VALUES
  (
    'مطعم الذواق',
    'مطاعم',
    'أشهى المأكولات الشرقية والغربية - توصيل مجاني',
    '0501112233',
    'www.althawaq.com',
    3,
    1350,
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 months',
    (SELECT id FROM service_packages WHERE slots_count = 1 LIMIT 1)
  ),
  (
    'صيدلية العافية',
    'صيدليات',
    'منتجات طبية وتجميلية - خصومات يومية',
    '0551122334',
    'www.alafiapharmacy.com',
    6,
    4320,
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '6 months',
    (SELECT id FROM service_packages WHERE slots_count = 2 LIMIT 1)
  ),
  (
    'معرض الأناقة للأثاث',
    'أثاث ومفروشات',
    'أحدث تشكيلات الأثاث العصري - أقساط مريحة',
    '0561122335',
    'www.elegancefurniture.com',
    3,
    3375,
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 months',
    (SELECT id FROM service_packages WHERE slots_count = 3 LIMIT 1)
  )
ON CONFLICT DO NOTHING;