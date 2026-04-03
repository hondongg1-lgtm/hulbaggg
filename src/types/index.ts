export interface Campaign {
  id: string;
  user_id?: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  bag_color: string;
  campaign_code: string;
  start_date: string;
  end_date: string;
  max_scans_per_user_per_day: number;
  status: string;
  created_at: string;
}

export interface Prize {
  id: string;
  campaign_id: string;
  name_ar: string;
  name_en: string;
  type: 'instant' | 'points' | 'raffle';
  value: number;
  points_value: number;
  total_quantity: number;
  remaining_quantity: number;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  otp_code?: string;
  otp_expires_at?: string;
  total_points: number;
  total_scans: number;
  is_verified: boolean;
  created_at: string;
}

export interface Scan {
  id: string;
  user_profile_id: string;
  qr_code_id?: string;
  campaign_id: string;
  prize_id?: string;
  claim_code?: string;
  status: 'scanned' | 'won' | 'claimed' | 'expired';
  scanned_at: string;
}

export interface QRCode {
  id: string;
  campaign_id: string;
  code: string;
  bag_color: string;
  batch_number: string;
  is_active: boolean;
  created_at: string;
}

export interface Draw {
  id: string;
  campaign_id: string;
  prize_id: string;
  draw_type: 'weekly' | 'monthly';
  draw_date: string;
  winner_profile_id?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
}
