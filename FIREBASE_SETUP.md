# Firebase Phone Authentication Setup Guide

## Overview
Firebase Phone Authentication has been integrated into this project to provide secure SMS-based verification for users in Saudi Arabia and Kuwait.

## Features
- Real SMS delivery via Firebase
- reCAPTCHA Enterprise for advanced bot protection
- Automatic phone number validation
- Support for Saudi (+966) and Kuwait (+965) numbers
- Free tier: 10,000 verifications per month

## Current Configuration
- **reCAPTCHA Enterprise Site Key**: Already configured
- **Script Loaded**: Automatically loads in index.html
- **Action**: LOGIN (for phone verification)

---

## Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Click **Enable** toggle
4. Save changes

### Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### Step 4: Configure Environment Variables

Update the `.env` file with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 5: Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `yourdomain.com`)
3. `localhost` is already authorized for development

### Step 6: Test the Integration

1. Start the development server: `npm run dev`
2. Navigate to the phone verification page
3. Enter a phone number (with country code: +966XXXXXXXXX or +965XXXXXXXX)
4. You should receive an SMS with a 6-digit code
5. Enter the code to complete verification

---

## Important Notes

### Free Tier Limits
- **10,000 verifications per month** - FREE
- After limit: $0.06 per verification
- Monitor usage in Firebase Console

### Phone Number Format
Users should enter phone numbers with country code:
- Saudi Arabia: `+966512345678` or just `966512345678`
- Kuwait: `+96512345678` or just `96512345678`

The app will automatically add `+` prefix if missing.

### Security Features
- Invisible reCAPTCHA prevents bot abuse
- Firebase automatically rate-limits SMS to prevent spam
- OTP codes expire after 60 seconds
- Phone numbers are validated before sending SMS

### Troubleshooting

**Error: "reCAPTCHA not initialized"**
- Make sure the `recaptcha-container` div exists in the DOM
- Check that Firebase config is correct in `.env`

**Error: "auth/invalid-phone-number"**
- Verify phone number includes country code
- Check number format: +966XXXXXXXXX (no spaces or dashes)

**Error: "auth/too-many-requests"**
- User has exceeded rate limit
- Wait 1-2 hours before trying again
- Consider implementing additional client-side rate limiting

**Error: "auth/quota-exceeded"**
- Monthly quota exceeded
- Upgrade Firebase plan or wait for next month
- Check Firebase Console for usage stats

### Testing Phone Numbers (Development Only)

You can add test phone numbers in Firebase Console that don't send real SMS:

1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Expand **Phone numbers for testing**
3. Add test numbers with fixed verification codes
4. Use these during development to save SMS costs

Example:
- Phone: `+966555555555`
- Code: `123456`

---

## Integration Details

### Files Modified
1. **`src/lib/firebase.ts`** - Firebase initialization
2. **`src/lib/phoneAuth.ts`** - Phone authentication service
3. **`src/pages/PhoneVerificationPage.tsx`** - Updated UI with Firebase integration
4. **`.env`** - Firebase configuration variables
5. **Database migration** - Added `firebase_uid` column to link Firebase with Supabase

### How It Works
1. User enters phone number
2. Firebase sends SMS with 6-digit OTP code
3. User enters OTP code
4. Firebase verifies the code
5. App stores Firebase UID in Supabase `user_profiles` table
6. User is authenticated and can proceed

### Data Flow
```
User Input (Phone) → Firebase (Send SMS) → User Receives OTP
User Input (OTP) → Firebase (Verify) → Success
Success → Supabase (Store firebase_uid) → Complete
```

---

## Cost Calculator

**Free Tier:** 10,000 verifications/month

**After Free Tier:** $0.06 per verification

Examples:
- 15,000 verifications = (15,000 - 10,000) × $0.06 = **$300/month**
- 50,000 verifications = (50,000 - 10,000) × $0.06 = **$2,400/month**
- 100,000 verifications = (100,000 - 10,000) × $0.06 = **$5,400/month**

💡 **Tip:** Monitor usage in Firebase Console → Usage & Billing

---

## Support Resources

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [Firebase Console](https://console.firebase.google.com/)

---

## Security Best Practices

1. **Never commit** your `.env` file to version control
2. **Enable App Check** (optional but recommended) for production
3. **Monitor** authentication logs in Firebase Console
4. **Set up billing alerts** to avoid unexpected charges
5. **Use test phone numbers** during development
6. **Implement rate limiting** on your app side for additional protection

---

## Next Steps

After setup:
1. Test with real phone numbers in development
2. Add your production domain to Firebase authorized domains
3. Set up billing alerts in Firebase Console
4. Monitor first 1000 verifications to estimate monthly costs
5. Consider App Check for production security

---

**Setup Complete!** Your app now sends real SMS messages via Firebase. 🎉
