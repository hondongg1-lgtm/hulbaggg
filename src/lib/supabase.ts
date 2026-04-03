import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ServicePackage = {
  id: string;
  name_ar: string;
  name_en: string;
  slots_count: number;
  price_per_month: number;
  price_per_3months: number;
  price_per_6months: number;
  bags_distribution: number;
  features: string[];
  created_at: string;
};

export type GroceryStore = {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  city: string;
  neighborhood: string;
  bags_needed_monthly: number;
  status: string;
  user_id?: string;
  created_at: string;
};

export type AdCampaign = {
  id: string;
  user_id?: string;
  package_id: string;
  business_name: string;
  business_type: string;
  ad_text: string;
  logo_url?: string;
  phone: string;
  website?: string;
  duration_months: number;
  total_price: number;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
};
