const CONTACT_EMAIL = "petereshak11@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://abona-faltaus.vercel.app";

export default function TermsOfServicePage() {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen flex items-center justify-center from-slate-900 via-slate-800 to-slate-900 p-1">
      <main className="w-full max-w-7xl p-1 rounded-2xl backdrop-blur-md bg-white/6 border border-white/10 shadow-2xl">
        {/* Header */}
        <header className="flex items-center md:flex-row flex-col gap-1 mb-2">
          <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-white/8 border border-white/8">
            <img src="/images/logo.webp" alt="لوغو ابونا فلتاؤس" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">شروط الخدمة — موقع ابونا فلتاؤس</h1>
            <p className="text-sm mt-1 opacity-80">باستخدامك للموقع، أنت بتوافق على الشروط والأحكام الموضحة أدناه. يرجى قراءتها بعناية.</p>
          </div>
        </header>

        {/* Content */}
        <section className="space-y-1 text-right leading-relaxed">
          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">١. قبول الشروط</h2>
            <p className="mt-2">بمجرد دخولك واستخدامك لموقع {SITE_URL}، فأنك تقر بالتزامك الكامل بهذه الشروط. لو مش موافق على أي بند، يفضل عدم استخدام الموقع.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٢. وصف الخدمة</h2>
            <p className="mt-2">موقع "ابونا فلتاؤس" هو منصة لتقديم محتوى روحي، سير قديسين، طلبات صلاة، وترانيم. الخدمة مقدمة "كما هي" وبنحاول دايماً نحدث المحتوى ونحافظ على دقته.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٣. حقوق الملكية الفكرية</h2>
            <ul className="list-disc mr-1 mt-2">
              <li>كل المحتوى الموجود (نصوص، صور، تصاميم) ملك للموقع أو مستخدم بتصريح.</li>
              <li>يُسمح بالمشاركة الشخصية للمحتوى لغرض المنفعة الروحية، لكن يُمنع استغلاله تجارياً بدون إذن مسبق.</li>
            </ul>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٤. السلوك العام للمستخدم</h2>
            <p className="mt-2">عند استخدام الموقع، يرجى الالتزام بما يلي:</p>
            <ul className="list-disc mr-1 mt-2">
              <li>عدم استخدام الموقع في أي عمل غير قانوني أو يسيء للآخرين.</li>
              <li>عدم محاولة اختراق الموقع أو تعطيل سير العمل فيه.</li>
              <li>الاحترام الكامل في التعليقات أو طلبات الصلاة (في حال تفعيلها).</li>
            </ul>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٥. الروابط الخارجية</h2>
            <p className="mt-2">الموقع قد يحتوي على روابط لمواقع تانية (مثل فيديوهات يوتيوب أو مصادر خارجية). إحنا مش مسؤولين عن محتوى أو سياسات المواقع دي، واستخدامك ليها بيبقى على مسؤوليتك الشخصية.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٦. إخلاء المسؤولية</h2>
            <p className="mt-2">بنحاول بكل جهدنا إن الموقع يفضل شغال بدون أعطال، لكننا مش بنضمن عدم حدوث انقطاع تقني أو أخطاء غير مقصودة. الموقع غير مسؤول عن أي أضرار ناتجة عن استخدام الخدمة.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٧. التعديلات على الشروط</h2>
            <p className="mt-2">ممكن نعدل شروط الخدمة دي في أي وقت. التعديلات بتبدأ من لحظة نشرها على الصفحة دي. استمرارك في استخدام الموقع معناه إنك موافق على الشروط الجديدة.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٨. التواصل معنا</h2>
            <p className="mt-2">لو عندك أي استفسار بخصوص شروط الخدمة، تقدر تراسلنا:</p>
            <ul className="list-disc mr-1 mt-2">
              <li><strong>البريد الإلكتروني:</strong> <a href={"mailto:" + CONTACT_EMAIL} className="underline">{CONTACT_EMAIL}</a></li>
              <li className="mt-1"><strong>الموقع الرسمي:</strong> <a href={SITE_URL} className="underline">{SITE_URL}</a></li>
            </ul>
          </article>

          <footer className="mt-1 text-sm opacity-80">
            <p className="mt-2">آخر تحديث للشروط: {new Date().toLocaleDateString('ar-EG')}</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
