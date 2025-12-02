import React from "react";

const CONTACT_EMAIL = "petereshak11@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://abona-faltaus.vercel.app";

export default function PrivacyPolicyPage() {
  return (
    <div dir="rtl" lang="ar" className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 p-1">
      <main className="w-full max-w-7xl p-1 rounded-2xl backdrop-blur-md bg-white/6 border border-white/10 shadow-2xl">
        {/* Header */}
        <header className="flex items-start gap-1 mb-2">
          <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-white/8 border border-white/8">
            <img src="/images/logo.jpg" alt="لوغو ابونا فلتاؤس" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">سياسة الخصوصية — موقع ابونا فلتاؤس</h1>
            <p className="text-sm mt-1 opacity-80">نحترم خصوصيتك ونلتزم بحماية بيانات زوار الموقع ومرتاديه. اقرأ التفاصيل أدناه لتعرف إزاي بنجمع ونستخدم ونحمي البيانات.</p>
          </div>
        </header>

        {/* Content */}
        <section className="space-y-1 text-right leading-relaxed">
          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">١. التعريف والمقدِّمة</h2>
            <p className="mt-2">هذه الصفحة توضّح كيفية جمعنا للمعلومات الشخصية والغير شخصية، وطرق استخدامها وحماية البيانات لمستخدمي الموقع {SITE_URL} — (ابونا فلتاؤس). ننصحك تقرأ السياسة كاملة علشان تكون على علم بحقوقك.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٢. المعلومات التي نجمعها</h2>
            <ul className="list-disc mr-1 mt-2">
              <li>المعلومات التي تقدمها طوعياً: مثل البريد الإلكتروني عند التسجيل أو التواصل.</li>
              <li>المعلومات التقنية: مثل عنوان الـ IP، نوع المتصفح، صفحات الزيارة، وبيانات الاستخدام لتحسين الخدمة.</li>
              <li>ملفات التخزين المؤقت (Cookies) وتقنيات مماثلة لتخصيص التجربة وتحليل الأداء.</li>
            </ul>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٣. لماذا ونستخدم هذه البيانات؟</h2>
            <ul className="list-disc mr-1 mt-2">
              <li>لتشغيل وصيانة الموقع وتحسين تجربة المستخدم.</li>
              <li>للرد على الاستفسارات والاتصالات (مثل طلبات الصلاة، طلبات كلمات الترانيم، أو ملاحظات عن المحتوى).</li>
              <li>لأغراض أمنية منعاً لسوء الاستعمال أو الأنشطة الضارة.</li>
              <li>لتحليل الاستخدام إحصائياً حتى نطوّر المحتوى والخدمات.</li>
            </ul>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٤. ملفات تعريف الارتباط (Cookies)</h2>
            <p className="mt-2">نستخدم الكوكيز لتذكر تفضيلاتك، لقياس أداء الموقع، ولتحسين تجربة الاستخدام. تقدر تمنع الكوكيز من إعدادات متصفحك لكن في الحالة دي بعض أجزاء الموقع ممكن متشتغلش بشكل كامل.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٥. الخدمات الخارجية (جهات خارجية)</h2>
            <p className="mt-2">الموقع قد يعتمد على خدمات خارجية (مثل Vercel لاستضافة الواجهة، Firebase أو خدمات تحليلات) — هتتبادل بعض البيانات التقنية معهم لضمان عمل الموقع. لو في تكاملات تانية (مثل مزودي الفيديو أو خرائط) هنذكرها هنا ونوضّح طبيعتها وسبب مشاركتها.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٦. كيف نحمي بياناتك</h2>
            <ul className="list-disc mr-1 mt-2">
              <li>نتخذ تدابير تقنية وإدارية لحماية البيانات من الوصول غير المصرح به.</li>
              <li>نوصي بتحديث كلمات المرور وعدم مشاركتها مع أحد.</li>
              <li>رغم كده، لا يوجد نظام آمن 100%، وإذا حصل أي خرق هنقوم بالإجراءات القانونية والإعلامية اللازمة.</li>
            </ul>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٧. حفظ البيانات ومدة الاحتفاظ</h2>
            <p className="mt-2">نحتفظ بالبيانات طالما كانت مطلوبة لتقديم الخدمة أو للامتثال للقوانين المعمول بها. لو احتجت حذف أي بيانات، تقدر تراسلنا (سياسة الحذف أدناه).</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٨. حقوق المستخدمين</h2>
            <p className="mt-2">لك الحق في الوصول لبياناتك، طلب تصحيحها، طلب حذفها، وطلب تقييد معالجتها. لو عايز تمارس أي من الحقوق دي، ابعتلنا رسالة على البريد التالي:</p>
            <div className="mt-1 p-1 rounded-md bg-white/4 border border-white/6">
              <strong>البريد الإلكتروني للتواصل:</strong>
              <p className="mt-1">{CONTACT_EMAIL} <span className="text-sm opacity-80 mr-2">(استبدل البريد ده بالبريد الرسمي للموقع)</span></p>
            </div>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">٩. الأطفال</h2>
            <p className="mt-2">الموقع مخصّص عامة للجمهور. لا نجمع عن قصد بيانات شخصية من أطفال دون موافقة الوالدين أو الأوصياء. لو اكتشفنا أننا جمعنا بيانات طفل سنقوم بحذفها فوراً عند طلب ذلك.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">١٠. تغييرات على سياسة الخصوصية</h2>
            <p className="mt-2">نحتفظ بحق تحديث السياسة بحسب الحاجة. أي تغييرات هتظهر هنا مع تاريخ آخر تحديث. ننصحك بزيارة الصفحة دورياً.</p>
          </article>

          <article className="p-1 rounded-xl bg-white/3 border border-white/6">
            <h2 className="font-semibold text-lg">١١. تواصل معنا</h2>
            <p className="mt-2">لو عندك أي استفسار، أو طلب حذف بيانات، أو ملاحظة على سياسة الخصوصية تواصل معنا:</p>
            <ul className="list-disc mr-1 mt-2">
              <li><strong>البريد الإلكتروني:</strong> {CONTACT_EMAIL}</li>
              <li className="mt-1"><strong>الموقع الرسمي:</strong> <a href={SITE_URL} className="underline">{SITE_URL}</a></li>
              <li className="mt-1">لو عايز تشوف الكود المصدري أو تساهم: <a href="https://github.com/Peter-Eshak-Abdo/abona-faltaus" className="underline">مستودع GitHub</a></li>
            </ul>
          </article>

          <footer className="mt-1 text-sm opacity-80">
            <p>صياغة مصرية أرثوذكسية — تم إعداد هذه السياسة لتناسب موقع كنسي واحتياجات مجتمعنا. لو حابب تعديل في الأسلوب (أدبي، قانوني رسمي، أو مبسط للشباب) أقدر أعدّ لك نسخة مخصّصة.</p>
            <p className="mt-2">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          </footer>
        </section>
      </main>
    </div>
  );
}
