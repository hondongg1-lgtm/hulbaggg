import { useState } from 'react';
import { QrCode, Keyboard, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface QRScannerPageProps {
  onScan: (code: string) => void;
  onBack: () => void;
}

export default function QRScannerPage({ onScan, onBack }: QRScannerPageProps) {
  const { t, dir } = useLanguage();
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          <span className="font-medium">{t('رجوع', 'Back')}</span>
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <QrCode className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('امسح رمز QR', 'Scan QR Code')}
              </h1>
              <p className="text-gray-600">
                {t('ابحث عن رمز QR على الكيس وامسحه', 'Find the QR code on the bag and scan it')}
              </p>
            </div>

            {!showManualInput ? (
              <div className="space-y-6">
                <div className="bg-gray-100 rounded-xl p-12 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {t('وجّه الكاميرا نحو رمز QR', 'Point camera at QR code')}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    {t('لا يمكنك مسح الكود؟', "Can't scan the code?")}
                  </p>
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <Keyboard className="w-5 h-5" />
                    <span>{t('أدخل الكود يدوياً', 'Enter code manually')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('أدخل كود الحملة', 'Enter Campaign Code')}
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder={t('مثال: CAMP-12345', 'Example: CAMP-12345')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono uppercase"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualInput(false);
                      setManualCode('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {t('تأكيد', 'Confirm')}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                {t('نصائح للمسح:', 'Scanning Tips:')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{t('تأكد من الإضاءة الجيدة', 'Ensure good lighting')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{t('احتفظ بالكاميرا ثابتة', 'Keep camera steady')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{t('تأكد من أن الكود واضح ونظيف', 'Make sure code is clear and clean')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
