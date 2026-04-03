import { QRCodeSVG } from 'qrcode.react';

interface AdSlot {
  logo?: string;
  businessName: string;
  description: string;
  phone: string;
  website?: string;
}

interface BagPreviewProps {
  adSlots: AdSlot[];
}

export function BagPreview({ adSlots }: BagPreviewProps) {
  const emptySlot: AdSlot = {
    businessName: 'مساحة إعلانية متاحة',
    description: 'احجز مساحتك الإعلانية الآن',
    phone: '05X XXX XXXX'
  };

  const slots = [...adSlots];
  while (slots.length < 4) {
    slots.push(emptySlot);
  }

  return (
    <div className="relative max-w-md mx-auto">
      <div className="relative">
        <div
          className="bg-white rounded-t-[200px] shadow-2xl border-4 border-slate-200 overflow-hidden"
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 8%, 100% 100%, 0% 100%, 0% 8%)'
          }}
        >
          <div className="pt-20 pb-8 px-6">
            <div className="text-center mb-6 pt-6">
              <div className="inline-block bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-200">
                <p className="text-xs text-emerald-700 font-bold">حلول الحقيبة</p>
              </div>
            </div>

            <div className="space-y-4">
              {slots.slice(0, 4).map((slot, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    slot === emptySlot
                      ? 'border-dashed border-slate-300 bg-slate-50'
                      : 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        slot.logo
                          ? 'bg-white border border-slate-200'
                          : 'bg-slate-100'
                      }`}
                    >
                      {slot.logo ? (
                        <img
                          src={slot.logo}
                          alt={slot.businessName}
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-slate-300">
                          {slot.businessName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-bold mb-1 truncate ${
                          slot === emptySlot ? 'text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {slot.businessName}
                      </h3>

                      <p
                        className={`text-xs mb-2 line-clamp-2 leading-tight ${
                          slot === emptySlot ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {slot.description}
                      </p>

                      <p
                        className={`text-xs font-bold ${
                          slot === emptySlot ? 'text-slate-400' : 'text-emerald-600'
                        }`}
                        dir="ltr"
                      >
                        {slot.phone}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {slot === emptySlot ? (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <span className="text-slate-300 text-xs">QR</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-white p-1 border border-slate-200">
                          <QRCodeSVG
                            value={slot.website || `tel:${slot.phone}`}
                            size={56}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <div className="inline-block bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
                <p className="text-xs text-slate-500">
                  معاينة تقريبية للكيس
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 bg-slate-300 rounded-b-full border-4 border-t-0 border-slate-200 shadow-inner"></div>
      </div>
    </div>
  );
}
