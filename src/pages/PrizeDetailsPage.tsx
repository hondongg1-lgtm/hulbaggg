import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Gift, MapPin, Clock, CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';

interface PrizeDetailsPageProps {
  claimCode: string;
  userId: string;
  onBack: () => void;
}

interface PrizeDetails {
  prize_name: string;
  store_name: string;
  store_address?: string;
  neighborhood: string;
  claimed_at: string;
  expires_at: string;
  status: string;
  prize_type: string;
}

export default function PrizeDetailsPage({ claimCode, userId, onBack }: PrizeDetailsPageProps) {
  const { language } = useLanguage();
  const [details, setDetails] = useState<PrizeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    loadPrizeDetails();
  }, []);

  useEffect(() => {
    if (!details) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(details.expires_at);
      const diff = expires.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      } else {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [details]);

  const loadPrizeDetails = async () => {
    try {
      const { data } = await supabase
        .from('prize_claims')
        .select(`
          status,
          claimed_at,
          expires_at,
          prizes (
            name,
            prize_type
          ),
          campaigns (
            store_name,
            store_address,
            neighborhoods (
              name_ar,
              name_en
            )
          )
        `)
        .eq('claim_code', claimCode)
        .eq('user_id', userId)
        .single();

      if (data) {
        setDetails({
          prize_name: (data.prizes as any).name,
          store_name: (data.campaigns as any).store_name,
          store_address: (data.campaigns as any).store_address,
          neighborhood: language === 'ar'
            ? (data.campaigns as any).neighborhoods.name_ar
            : (data.campaigns as any).neighborhoods.name_en,
          claimed_at: data.claimed_at,
          expires_at: data.expires_at,
          status: data.status,
          prize_type: (data.prizes as any).prize_type
        });
      }
    } catch (error) {
      console.error('Error loading prize:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTimeRemaining = () => {
    if (!details) return '';
    const now = new Date();
    const expires = new Date(details.expires_at);
    const hours = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60));
    return hours > 0 ? `${hours} ${language === 'ar' ? 'ساعة' : 'hours'}` : language === 'ar' ? 'منتهية' : 'Expired';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <p className="text-gray-600 mb-4">
            {language === 'ar' ? 'لم يتم العثور على الجائزة' : 'Prize not found'}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all transform hover:scale-105"
          >
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pb-20 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-all hover:gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
        </button>

        {/* Status Badge */}
        {details.status === 'redeemed' && (
          <div className="bg-success-100 border border-success-300 rounded-lg p-4 mb-6 flex items-center gap-3 animate-scale-in">
            <CheckCircle className="w-6 h-6 text-success-600" />
            <div>
              <p className="font-bold text-success-900">
                {language === 'ar' ? 'تم الاستلام' : 'Redeemed'}
              </p>
              <p className="text-sm text-success-700">
                {language === 'ar' ? 'شكراً لاستخدامك المنصة' : 'Thank you for using our platform'}
              </p>
            </div>
          </div>
        )}

        {/* Prize Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 animate-scale-in">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{details.prize_name}</h1>
                <p className="text-blue-100">{details.store_name}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* QR Code */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 flex flex-col items-center">
              <QRCodeSVG
                value={claimCode}
                size={200}
                level="H"
                includeMargin
              />
              <p className="text-sm text-gray-600 mt-3">
                {language === 'ar' ? 'أظهر هذا الكود للمحل' : 'Show this code at the store'}
              </p>
            </div>

            {/* Claim Code */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 mb-6 border-2 border-primary-200">
              <p className="text-sm text-gray-600 mb-2 text-center font-medium">
                {language === 'ar' ? 'كود الاستلام' : 'Claim Code'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-3xl font-mono font-bold text-primary-700 tracking-wider animate-pulse-slow">
                  {claimCode}
                </div>
                <button
                  onClick={copyCode}
                  className="p-2 hover:bg-primary-100 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                  title={language === 'ar' ? 'نسخ' : 'Copy'}
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-success-600 animate-scale-in" />
                  ) : (
                    <Copy className="w-5 h-5 text-primary-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'الموقع' : 'Location'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {details.store_name} - {details.neighborhood}
                  </p>
                  {details.store_address && (
                    <p className="text-sm text-gray-600">{details.store_address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    {language === 'ar' ? 'الوقت المتبقي' : 'Time Remaining'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary-700">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-primary-600">{language === 'ar' ? 'ساعة' : 'Hours'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-secondary-700">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-secondary-600">{language === 'ar' ? 'دقيقة' : 'Minutes'}</div>
                    </div>
                    <div className="bg-gradient-to-br from-danger-100 to-danger-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-danger-700 animate-pulse">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-danger-600">{language === 'ar' ? 'ثانية' : 'Seconds'}</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    {language === 'ar' ? 'ينتهي في' : 'Expires on'}{' '}
                    {new Date(details.expires_at).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm font-medium text-yellow-900 mb-2">
                {language === 'ar' ? '📌 تعليمات الاستلام' : '📌 Redemption Instructions'}
              </p>
              <ol className="text-sm text-yellow-800 space-y-1" style={{ listStyle: language === 'ar' ? 'arabic-indic' : 'decimal', paddingInlineStart: '20px' }}>
                <li>{language === 'ar' ? 'توجه إلى المحل المذكور أعلاه' : 'Visit the store mentioned above'}</li>
                <li>{language === 'ar' ? 'أظهر كود QR أو الرقم للموظف' : 'Show the QR code or number to staff'}</li>
                <li>{language === 'ar' ? 'استلم جائزتك خلال المدة المحددة' : 'Claim within the validity period'}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-glow-primary"
        >
          {language === 'ar' ? 'العودة للعروض' : 'Back to Offers'}
        </button>
      </div>
    </div>
  );
}
