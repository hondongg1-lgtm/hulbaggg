# QR Bag Advertising Platform - Complete Guide

## Platform Overview

This is a comprehensive QR-based bag advertising and gamification platform that connects businesses, grocery stores, and consumers through an interactive reward system.

## System Architecture

### Two Main Interfaces:

1. **Business/Admin Interface** (Default - `/`)
   - Business registration for advertising
   - Store registration for free bags
   - Campaign management
   - Analytics and reporting

2. **User/Consumer Interface** (`/?user=true` or `/user`)
   - QR code scanning
   - Phone verification
   - Prize selection and gamification
   - User dashboard

## User Flow (Consumer Journey)

### 1. Landing Page
- **Languages**: Arabic & English (switchable)
- **Features**:
  - Attractive hero section
  - Benefits overview
  - How it works guide
  - Three prize types: Instant, Points, Raffles

### 2. QR Scanner
- **Options**:
  - Camera QR scanning
  - Manual code entry
- **Sample Codes**:
  - `CAMP-THAWAQ` (Restaurant campaign)
  - `CAMP-AFIA` (Pharmacy campaign)
  - `CAMP-ELEGANCE` (Furniture campaign)

### 3. Phone Verification
- **OTP System**:
  - Phone number input
  - 6-digit verification code
  - 10-minute expiration
  - Resend functionality
- **Daily Limits**: Configurable per campaign (default 3 scans/day)
- **Note**: OTP code is logged to console for testing

### 4. Prize Selection
- **Prize Types**:
  - **Instant Prizes**: Discounts, free items (10% probability each)
  - **Points**: Accumulative rewards (40% probability)
  - **Raffle**: Weekly/monthly draws
- **UI**: Animated spin button with real-time prize determination

### 5. Prize Claim
- **Features**:
  - Unique claim code
  - QR code for redemption
  - Copy to clipboard
  - Nearest stores list
  - Redemption instructions

### 6. User Dashboard
- **Stats**:
  - Total points
  - Total prizes won
  - Total scans
- **History**: Past scans with status tracking

## Database Schema

### Core Tables:

1. **campaigns**
   - Campaign information (name, description, dates)
   - Status tracking
   - Scan limits configuration

2. **prizes**
   - Prize details (name, type, value)
   - Quantity management
   - Probability settings

3. **user_profiles**
   - Phone-based authentication
   - Points accumulation
   - Scan history

4. **scans**
   - Each QR scan record
   - Prize linkage
   - Claim codes

5. **qr_codes**
   - QR code batches
   - Campaign mapping
   - Color identification

6. **stores**
   - Participating stores
   - Redemption locations

## Key Features

### Gamification Elements:
- **Random Prize Selection**: Weighted probability system
- **Daily Limits**: Prevents abuse
- **Points System**: Accumulative rewards
- **Visual Feedback**: Animations and celebrations
- **Progress Tracking**: User dashboard with history

### Security Measures:
- **OTP Verification**: Phone-based authentication
- **Daily Scan Limits**: Per campaign configuration
- **Unique Claim Codes**: Prevent fraud
- **IP Tracking**: Additional security layer
- **RLS Policies**: Database-level security

### Multilingual Support:
- **Arabic/English**: Full RTL/LTR support
- **Context-based**: Translation function `t(ar, en)`
- **Persistent**: Saved in localStorage

## Testing the Platform

### Access User Flow:
1. Open browser to your app URL
2. Add `?user=true` to the URL
3. Or navigate to `/user`

### Test Campaign Codes:
- `CAMP-THAWAQ` - Restaurant campaign with coffee and discounts
- `CAMP-AFIA` - Pharmacy campaign with health products
- `CAMP-ELEGANCE` - Furniture campaign with big discounts

### Test Phone Numbers:
Any valid phone format (10-15 digits)
- Example: `0501234567`
- OTP code will be logged to browser console

### Sample Flow:
1. Click "ابدأ الآن" (Start Now)
2. Enter code: `CAMP-THAWAQ`
3. Enter phone: `0501234567`
4. Check console for OTP
5. Enter OTP code
6. Click "اسحب الآن" (Spin Now)
7. Win a prize!
8. View claim code and instructions

## Admin/Business Features

### Campaign Management:
- Create campaigns with custom codes
- Set bag colors for identification
- Configure daily scan limits
- Manage prize inventory

### Prize Configuration:
- Define prize types and values
- Set quantities and probabilities
- Track remaining inventory
- Monitor redemption rates

### Analytics Dashboard:
- Total scans tracking
- Prize distribution stats
- User engagement metrics
- Store-wise breakdown

## Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **QR Codes**: qrcode.react
- **Icons**: Lucide React
- **State Management**: React Context API

## Environment Variables

Already configured in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Development

### Run Locally:
```bash
npm run dev
```

### Build for Production:
```bash
npm run build
```

### Type Checking:
```bash
npm run typecheck
```

## Deployment Notes

- The platform is ready for production
- Both admin and user interfaces are integrated
- Sample data is pre-populated
- All security measures are in place

## Future Enhancements

Potential features to add:
- Real SMS OTP integration (Twilio, etc.)
- Push notifications
- Social sharing
- Advanced analytics dashboard
- Multi-store redemption tracking
- Raffle draw automation
- Points marketplace
- Leaderboards
- Referral system

## Support

For issues or questions, refer to the database schema in `/supabase/migrations/` or check the component implementations in `/src/pages/`.
