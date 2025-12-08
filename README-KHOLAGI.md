1. نُسخ/أضف بيانات coptish-datastore إلى المشروع.
- أبسط طريقة: انسخ مجلد `output` من المستودع https://github.com/markrofail/coptish-datastore/tree/main/output
وانقله إلى `data/coptish-datastore/output` داخل مشروعك.
- بديل (مفضل للمزامنة): استخدم git submodule:
git submodule add https://github.com/markrofail/coptish-datastore data/coptish-datastore
ثم بعد ذلك يمكنك تحديثه عبر `git submodule update --remote`.


2. تأكد أن لديك Bootstrap محمّل (لأن الواجهة تستخدم Bootstrap):
- في `app/layout.tsx` أضف في الـ head:
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
- أو ثبت عبر npm `npm i bootstrap` وادخل CSS في ملف الجذور.


3. أنشئ المسارات والملفات التالية (الموجودة في هذا الملف):
- app/kholagi/page.tsx
- components/kholagi/KholagiClient.tsx


4. حقوق الاستخدام: بيانات `coptish-datastore` مرخّصة تحت MPL-2.0 — أضف إقرارًا بسيطًا ومنح رابط للمستودع في قسم "حول" الصفحة.


5. تحسينات مقترحة لاحقًا:
- عرض نص منسق (HTML) بدل JSON (إذا كانت ملفات الـ JSON تحتوي على حقول نصية لـ Arabic/English/Coptic)،
- إضافة تشغيل صوت للألحان إن توفرت ملفات صوتية،
- دعم التخزين المؤقت (caching) وService Worker للعرض offline.
