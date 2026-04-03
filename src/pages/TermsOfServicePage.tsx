import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsOfServicePageProps {
  onBack?: () => void;
}

export default function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
  const { t, dir } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للرئيسية
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            شروط الخدمة
          </h1>

          <p className="text-gray-600 text-center mb-8">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </p>

          <div className="space-y-8 text-right">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. قبول الشروط</h2>
              <p className="text-gray-700 leading-relaxed">
                مرحباً بك في منصة الإعلانات. باستخدامك لخدماتنا، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. وصف الخدمة</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                منصتنا تربط بين المستخدمين والشركات المعلنة من خلال:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                <li>عرض إعلانات محلية على أكياس التسوق</li>
                <li>ألعاب تفاعلية للفوز بجوائز وقسائم خصم</li>
                <li>استرداد الجوائز في المتاجر المشاركة</li>
                <li>واجهة للمعلنين لإدارة حملاتهم الإعلانية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. التسجيل والحساب</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">3.1 الأهلية:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>يجب أن تكون بعمر 18 عاماً أو أكثر</li>
                  <li>يجب أن تقدم معلومات صحيحة ودقيقة</li>
                  <li>يجب أن يكون لديك رقم هاتف صالح</li>
                </ul>

                <p className="font-semibold mt-4">3.2 أمان الحساب:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>أنت مسؤول عن الحفاظ على سرية حسابك</li>
                  <li>أنت مسؤول عن جميع الأنشطة التي تتم من خلال حسابك</li>
                  <li>يجب إخطارنا فوراً بأي استخدام غير مصرح به</li>
                  <li>لا يجوز مشاركة حسابك مع الآخرين</li>
                </ul>

                <p className="font-semibold mt-4">3.3 حساب واحد لكل مستخدم:</p>
                <p className="mr-6">
                  يُسمح بحساب واحد فقط لكل مستخدم. إنشاء حسابات متعددة قد يؤدي إلى تعليق جميع الحسابات.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. استخدام المنصة</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">4.1 الاستخدام المسموح:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>مشاهدة الإعلانات المحلية</li>
                  <li>المشاركة في الألعاب والحملات</li>
                  <li>الفوز بالجوائز واسترداد القسائم</li>
                  <li>التفاعل مع المحتوى بطريقة قانونية</li>
                </ul>

                <p className="font-semibold mt-4">4.2 الاستخدام المحظور:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>استخدام البوتات أو البرامج الآلية</li>
                  <li>محاولة التلاعب أو الغش في الألعاب</li>
                  <li>إنشاء حسابات وهمية أو متعددة</li>
                  <li>التحايل على القيود أو الحدود المفروضة</li>
                  <li>اختراق أو محاولة الوصول غير المصرح به</li>
                  <li>جمع بيانات المستخدمين الآخرين</li>
                  <li>نشر محتوى مسيء أو غير قانوني</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>استخدام المنصة لأغراض تجارية غير مصرح بها</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. الجوائز والقسائم</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">5.1 الفوز بالجوائز:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>يُسمح بمحاولة واحدة يومياً لكل حملة</li>
                  <li>الجوائز تُمنح بناءً على الفرصة والحظ</li>
                  <li>الجوائز غير قابلة للتحويل إلى نقد</li>
                  <li>لكل جائزة تاريخ صلاحية محدد</li>
                </ul>

                <p className="font-semibold mt-4">5.2 استرداد الجوائز:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>يجب استرداد الجائزة قبل انتهاء صلاحيتها</li>
                  <li>الاسترداد يتم في المتجر المحدد فقط</li>
                  <li>يجب إظهار رمز QR للموظف</li>
                  <li>لا يمكن استرداد الجائزة أكثر من مرة</li>
                  <li>الجوائز المنتهية الصلاحية لا يمكن استردادها</li>
                </ul>

                <p className="font-semibold mt-4">5.3 حقوق المنصة:</p>
                <p className="mr-6">
                  نحتفظ بالحق في إلغاء أو تعديل أو إيقاف أي جائزة في حالة الاشتباه في غش أو انتهاك للشروط.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. المعلنون والحملات</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">6.1 حسابات المعلنين:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>يجب تقديم معلومات تجارية صحيحة</li>
                  <li>يجب الموافقة على الحساب من قبل الإدارة</li>
                  <li>يجب الامتثال لجميع القوانين الإعلانية</li>
                </ul>

                <p className="font-semibold mt-4">6.2 محتوى الإعلانات:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>يجب أن يكون المحتوى قانونياً وأخلاقياً</li>
                  <li>ممنوع الإعلان عن منتجات محظورة</li>
                  <li>يجب عدم انتهاك حقوق الملكية الفكرية</li>
                  <li>المنصة تحتفظ بحق رفض أي إعلان</li>
                </ul>

                <p className="font-semibold mt-4">6.3 مسؤولية الجوائز:</p>
                <p className="mr-6">
                  المعلنون مسؤولون عن توفير الجوائز الموعودة والامتثال لشروط حملاتهم.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. حقوق الملكية الفكرية</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                جميع المحتويات والعلامات التجارية والشعارات على المنصة هي ملك لنا أو لمرخصينا. يُحظر:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                <li>نسخ أو تعديل أو توزيع المحتوى دون إذن</li>
                <li>استخدام العلامات التجارية دون تصريح</li>
                <li>الهندسة العكسية للمنصة</li>
                <li>إنشاء أعمال مشتقة من المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. إخلاء المسؤولية</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">8.1 الخدمة "كما هي":</p>
                <p className="mr-6">
                  نقدم الخدمة "كما هي" و "حسب التوفر" دون أي ضمانات صريحة أو ضمنية.
                </p>

                <p className="font-semibold mt-4">8.2 عدم ضمان:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>الدقة أو الاكتمال للمعلومات</li>
                  <li>التوفر المستمر للخدمة</li>
                  <li>عدم وجود أخطاء أو فيروسات</li>
                  <li>جودة المنتجات أو الخدمات المعلن عنها</li>
                </ul>

                <p className="font-semibold mt-4">8.3 مسؤولية الطرف الثالث:</p>
                <p className="mr-6">
                  نحن لسنا مسؤولين عن المنتجات أو الخدمات المقدمة من المعلنين. أي نزاع بخصوص الجوائز أو المنتجات يجب حله مباشرة مع المعلن.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. تحديد المسؤولية</h2>
              <p className="text-gray-700 leading-relaxed">
                إلى الحد الأقصى الذي يسمح به القانون، لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية، بما في ذلك على سبيل المثال لا الحصر فقدان الأرباح أو البيانات أو الاستخدام، الناشئة عن أو المتعلقة باستخدامك للمنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. التعويض</h2>
              <p className="text-gray-700 leading-relaxed">
                توافق على تعويضنا والدفاع عنا وحمايتنا من أي مطالبات أو أضرار أو التزامات أو خسائر أو نفقات (بما في ذلك أتعاب المحاماة المعقولة) الناشئة عن أو المتعلقة باستخدامك للمنصة أو انتهاكك لهذه الشروط.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. إنهاء الخدمة</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">11.1 الإنهاء من قبلك:</p>
                <p className="mr-6">
                  يمكنك إنهاء حسابك في أي وقت من خلال الاتصال بنا.
                </p>

                <p className="font-semibold mt-4">11.2 الإنهاء من قبلنا:</p>
                <p className="mr-6 mb-2">
                  نحتفظ بالحق في تعليق أو إنهاء حسابك فوراً دون إشعار إذا:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>انتهكت هذه الشروط</li>
                  <li>شاركت في سلوك احتيالي أو غير قانوني</li>
                  <li>أضررت بسمعة المنصة أو مستخدميها</li>
                  <li>لأسباب أمنية أو تشغيلية</li>
                </ul>

                <p className="font-semibold mt-4">11.3 آثار الإنهاء:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>فقدان الوصول إلى حسابك وبياناتك</li>
                  <li>إلغاء جميع الجوائز غير المستردة</li>
                  <li>استمرار سريان الأقسام ذات الصلة من الشروط</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. التعديلات على الشروط</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنخطرك بالتغييرات الجوهرية عبر المنصة أو البريد الإلكتروني. استمرارك في استخدام الخدمة بعد التغييرات يشكل قبولاً للشروط المعدلة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. القانون المنظم</h2>
              <p className="text-gray-700 leading-relaxed">
                تخضع هذه الشروط وتُفسر وفقاً لقوانين المملكة العربية السعودية. أي نزاع ناشئ عن هذه الشروط يخضع للاختصاص الحصري لمحاكم المملكة العربية السعودية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. أحكام عامة</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">14.1 الاتفاق الكامل:</p>
                <p className="mr-6">
                  تشكل هذه الشروط، مع سياسة الخصوصية، الاتفاق الكامل بينك وبيننا.
                </p>

                <p className="font-semibold mt-4">14.2 قابلية الفصل:</p>
                <p className="mr-6">
                  إذا كان أي بند من هذه الشروط غير قابل للتنفيذ، فإن البنود المتبقية تظل سارية المفعول.
                </p>

                <p className="font-semibold mt-4">14.3 عدم التنازل:</p>
                <p className="mr-6">
                  عدم ممارستنا لأي حق أو بند لا يشكل تنازلاً عن ذلك الحق أو البند.
                </p>

                <p className="font-semibold mt-4">14.4 عدم قابلية التحويل:</p>
                <p className="mr-6">
                  لا يمكنك تحويل حقوقك أو التزاماتك بموجب هذه الشروط دون موافقتنا الكتابية.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. اتصل بنا</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                إذا كان لديك أي أسئلة حول شروط الخدمة، يرجى الاتصال بنا:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">البريد الإلكتروني: support@example.com</p>
                <p className="text-gray-700">الهاتف: +966 XX XXX XXXX</p>
                <p className="text-gray-700">العنوان: المملكة العربية السعودية</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600 font-semibold">
              باستخدامك للمنصة، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بشروط الخدمة هذه.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}