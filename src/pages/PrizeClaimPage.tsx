import { useEffect, useState } from 'react';
import { Check, Copy, MapPin, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Prize } from '../types';

interface PrizeClaimPageProps {
  prizeId: string;
  claimCode: string;
  onFinish: () => void;
}

export default function PrizeClaimPage({ prizeId, claimCode, onFinish }: PrizeClaimPageProps) {
  const { t, language, dir } = useLanguage();
  const [prize, setPrize] = useState<Prize | null>(null);
  const [copied, setCopied] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    loadPrize();
    loadStores();
  }, [prizeId]);

  const loadPrize = async () => {
    const { data } = await supabase
      .from('prizes')
      .select('*')
      .eq('id', prizeId)
      .single();

    if (data) setPrize(data);
  };

  const loadStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (data) setStores(data);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prize) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('تم الفوز بالجائزة!', 'Prize Won!')}
              </h1>
              <p className="text-green-50">
                {t('احفظ الكود واذهب للمحل لاستلام جائزتك', 'Save the code and go to store to claim')}
              </p>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {language === 'ar' ? prize.name_ar : prize.name_en}
                </h2>

                {prize.type === 'instant' && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 text-center">
                    <p className="text-4xl font-bold text-orange-600 mb-2">
                      {prize.value} {t('ريال', 'SAR')}
                    </p>
                    <p className="text-gray-600">
                      {t('قيمة الجائزة', 'Prize Value')}
                    </p>
                  </div>
                )}

                {prize.type === 'points' && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 text-center">
                    <p className="text-4xl font-bold text-orange-600 mb-2">
                      {prize.points_value} {t('نقطة', 'Points')}
                    </p>
                    <p className="text-gray-600">
                      {t('أضيفت إلى رصيدك', 'Added to your balance')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-center">
                  {t('كود الاستلام', 'Claim Code')}
                </h3>

                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={claimCode} size={200} level="H" />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex-1 text-center">
                    <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
                      {claimCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>{t('تم النسخ', 'Copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>{t('نسخ', 'Copy')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">
                  {t('أقرب المحلات', 'Nearest Stores')}
                </h3>

                <div className="space-y-3">
                  {stores.map((store) => (
                    <div key={store.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-2">{store.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{store.neighborhood}, {store.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{store.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t('تعليمات الاستلام:', 'Claim Instructions:')}
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>{t('اذهب إلى أحد المحلات المشاركة', 'Go to one of the participating stores')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>{t('اعرض كود الاستلام أو رمز QR', 'Show the claim code or QR code')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>{t('استلم جائزتك من الموظف', 'Collect your prize from staff')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onFinish}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('إنهاء', 'Finish')}</span>
                <BackIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
