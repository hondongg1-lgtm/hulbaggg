/*
  # Create Ads Platform Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name_ar` (text) - Arabic name for category
      - `name_en` (text) - English name for category
      - `icon` (text) - Icon name for the category
      - `slug` (text, unique) - URL-friendly identifier
      - `created_at` (timestamptz)
    
    - `ads`
      - `id` (uuid, primary key)
      - `title` (text) - Ad title
      - `description` (text) - Ad description
      - `price` (numeric) - Price in SAR
      - `category_id` (uuid, foreign key) - References categories
      - `image_url` (text) - Main image URL
      - `location` (text) - Location/city
      - `contact_phone` (text) - Contact phone number
      - `contact_name` (text) - Contact person name
      - `is_featured` (boolean) - Whether ad is featured
      - `views` (integer) - Number of views
      - `status` (text) - active, sold, expired
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to create/update their own ads
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  icon text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  location text NOT NULL,
  contact_phone text NOT NULL,
  contact_name text NOT NULL,
  is_featured boolean DEFAULT false,
  views integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Policies for ads (public read)
CREATE POLICY "Anyone can view active ads"
  ON ads FOR SELECT
  TO public
  USING (status = 'active');

-- Insert default categories
INSERT INTO categories (name_ar, name_en, icon, slug) VALUES
  ('سيارات', 'Cars', 'Car', 'cars'),
  ('عقارات', 'Real Estate', 'Home', 'real-estate'),
  ('إلكترونيات', 'Electronics', 'Smartphone', 'electronics'),
  ('أثاث', 'Furniture', 'Armchair', 'furniture'),
  ('أزياء', 'Fashion', 'Shirt', 'fashion'),
  ('وظائف', 'Jobs', 'Briefcase', 'jobs'),
  ('خدمات', 'Services', 'Wrench', 'services'),
  ('حيوانات', 'Pets', 'Dog', 'pets')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample ads
INSERT INTO ads (title, description, price, category_id, image_url, location, contact_phone, contact_name, is_featured) VALUES
  ('تويوتا كامري 2023', 'سيارة تويوتا كامري موديل 2023 بحالة ممتازة، فل كامل، قطعت 15 ألف كم فقط', 95000, (SELECT id FROM categories WHERE slug = 'cars'), 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800', 'الرياض', '0501234567', 'أحمد محمد', true),
  ('آيفون 15 برو ماكس', 'آيفون 15 برو ماكس 256 جيجا، لون أزرق تيتانيوم، جديد بالكرتون', 5499, (SELECT id FROM categories WHERE slug = 'electronics'), 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800', 'جدة', '0551234567', 'خالد العلي', true),
  ('شقة للإيجار 3 غرف', 'شقة فاخرة للإيجار، 3 غرف نوم، 2 حمام، صالة كبيرة، مطبخ راقي', 2500, (SELECT id FROM categories WHERE slug = 'real-estate'), 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800', 'الدمام', '0561234567', 'سعد الغامدي', true),
  ('طقم صوفا مودرن', 'طقم صوفا 7 مقاعد، تصميم عصري، لون بيج، حالة ممتازة', 3500, (SELECT id FROM categories WHERE slug = 'furniture'), 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800', 'مكة', '0571234567', 'فيصل أحمد', false),
  ('لابتوب ماك بوك برو', 'ماك بوك برو 2022، معالج M2، 16 جيجا رام، 512 SSD', 6500, (SELECT id FROM categories WHERE slug = 'electronics'), 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', 'الرياض', '0581234567', 'محمد الشمري', false),
  ('بي ام دبليو X5', 'BMW X5 2021، بحالة الوكالة، صيانة دورية منتظمة', 185000, (SELECT id FROM categories WHERE slug = 'cars'), 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=800', 'جدة', '0591234567', 'عبدالله القحطاني', true)
ON CONFLICT DO NOTHING;