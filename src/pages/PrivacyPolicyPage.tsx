import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const { t, dir } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
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
            سياسة الخصوصية
          </h1>

          <p className="text-gray-600 text-center mb-8">
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </p>

          <div className="space-y-8 text-right">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. مقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                نحن في منصة الإعلانات ملتزمون بحماية خصوصيتك. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لخدماتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. المعلومات التي نجمعها</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">2.1 معلومات الحساب:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>رقم الهاتف المحمول</li>
                  <li>الاسم (اختياري)</li>
                  <li>معرف Firebase الفريد</li>
                </ul>

                <p className="font-semibold mt-4">2.2 بيانات الاستخدام:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>سجل المشاركة في الحملات الإعلانية</li>
                  <li>الجوائز المكتسبة والمستردة</li>
                  <li>الموقع الجغرافي للحي (لعرض الإعلانات المحلية)</li>
                  <li>تاريخ ووقت النشاط على المنصة</li>
                </ul>

                <p className="font-semibold mt-4">2.3 معلومات الإعلان:</p>
                <ul className="list-disc list-inside space-y-2 mr-6">
                  <li>بيانات الشركات المعلنة</li>
                  <li>تفاصيل الحملات الإعلانية</li>
                  <li>معلومات الجوائز والعروض</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. كيفية استخدام معلوماتك</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                <li>تقديم وتحسين خدماتنا</li>
                <li>إدارة حسابك ومصادقة هويتك</li>
                <li>عرض الإعلانات والعروض المناسبة لموقعك</li>
                <li>معالجة مشاركاتك في الحملات الإعلانية</li>
                <li>إدارة الجوائز والقسائم</li>
                <li>التواصل معك بشأن الخدمة</li>
                <li>الامتثال للمتطلبات القانونية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. مشاركة المعلومات</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                نحن لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                <li>مع الشركات المعلنة (فقط عند استرداد الجوائز)</li>
                <li>مع مزودي الخدمات التقنية (Firebase, Supabase)</li>
                <li>عند الطلب القانوني من الجهات المختصة</li>
                <li>لحماية حقوقنا وسلامة المستخدمين</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. حماية البيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6 mt-3">
                <li>التشفير عند نقل البيانات (SSL/TLS)</li>
                <li>سياسات أمان صارمة على مستوى الصفوف (RLS)</li>
                <li>المصادقة الآمنة عبر Firebase</li>
                <li>الوصول المحدود للبيانات حسب الصلاحيات</li>
                <li>مراقبة أمنية مستمرة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. حقوقك</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mr-6">
                <li>الوصول إلى معلوماتك الشخصية</li>
                <li>تصحيح أو تحديث معلوماتك</li>
                <li>حذف حسابك وبياناتك</li>
                <li>الاعتراض على معالجة بياناتك</li>
                <li>تقييد معالجة بياناتك</li>
                <li>نقل بياناتك إلى خدمة أخرى</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. الاحتفاظ بالبيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بمعلوماتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. عند حذف حسابك، سنقوم بحذف أو إخفاء هوية بياناتك الشخصية خلال 30 يوماً، باستثناء ما يتطلبه القانون.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. ملفات تعريف الارتباط</h2>
              <p className="text-gray-700 leading-relaxed">
                نستخدم ملفات تعريف الارتباط (Cookies) والتقنيات المشابهة لتحسين تجربتك، وتذكر تفضيلاتك، وتحليل استخدام المنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. خصوصية الأطفال</h2>
              <p className="text-gray-700 leading-relaxed">
                خدماتنا غير موجهة للأطفال دون سن 18 عاماً. نحن لا نجمع معلومات شخصية عن قصد من الأطفال. إذا اكتشفنا أننا جمعنا معلومات من طفل، سنحذفها فوراً.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. التغييرات على السياسة</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر المنصة أو البريد الإلكتروني. استمرارك في استخدام الخدمة بعد التغييرات يعني موافقتك على السياسة المحدثة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. اتصل بنا</h2>
              <p className="text-gray-700 leading-relaxed">
                إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية أو معالجة بياناتك، يرجى الاتصال بنا:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">البريد الإلكتروني: privacy@example.com</p>
                <p className="text-gray-700">الهاتف: +966 XX XXX XXXX</p>
                <p className="text-gray-700">العنوان: المملكة العربية السعودية</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. الامتثال القانوني</h2>
              <p className="text-gray-700 leading-relaxed">
                نحن ملتزمون بالامتثال لجميع القوانين واللوائح المحلية المتعلقة بحماية البيانات والخصوصية في المملكة العربية السعودية، بما في ذلك نظام حماية البيانات الشخصية.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              بتاريخ استخدامك للمنصة، فإنك توافق على سياسة الخصوصية هذه.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}