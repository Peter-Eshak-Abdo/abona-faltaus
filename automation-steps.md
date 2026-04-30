## الخطوة 1: تحديث البيانات المحلية (Fetch)
افتح الـ Terminal في VS Code واكتب:
git fetch origin
هذا الأمر يخبر جهازك: "اذهب إلى GitHub واعرف ما هي الـ Branches الجديدة هناك دون تحميلها فعلياً".

## الخطوة 2: الانتقال إلى الـ Branch الجديد (Checkout)
الآن تريد "الدخول" إلى النسخة التي عدلها الذكاء الاصطناعي.
يمكنك الضغط على اسم الـ Branch الحالي (غالباً يكون main) في أسفل يسار الشاشة في VS Code، ستظهر لك قائمة، اختر منها الـ Branch الجديد (مثلاً feat/notion-task-1).
أو عبر الـ Terminal:
git checkout feat/notion-task-1

## الخطوة 3: مراجعة التغييرات (Review)
اذهب إلى أيقونة Source Control في القائمة الجانبية (الاختصار Ctrl+Shift+G).
ستجد قائمة بالملفات التي تم تعديلها. اضغط على أي ملف ليفتح لك شاشة Split View (المقارنة)، حيث ترى الكود القديم على اليسار والجديد على اليمين.

## الخطوة 4: التجربة والتشغيل (Testing)
بما أنك تعمل على مشروع برمجي، يجب التأكد من أن التعديلات لم تكسر شيئاً:
شغل مشروعك محلياً (مثلاً npm run dev).
اختبر الميزة الجديدة أو التعديل الذي قام به الـ Automation.
إذا وجدت أخطاء أو أردت تحسين الكود، قم بتعديله مباشرة في VS Code كأنك أنت من كتبته.

## الخطوة 5: حفظ تعديلاتك (Commit)
إذا قمت بإضافة لمساتك الخاصة على الـ Branch:
git add .
git commit -m "Refining AI generated code"

## الخطوة 6: دمج الكود في الـ Main (Merging)
بمجرد التأكد من أن كل شيء "تمام"، حان وقت نقل التعديلات للمشروع الأساسي. لديك طريقتان:
الطريقة الأولى (الأفضل والأكثر أماناً - Pull Request):
ارفع تعديلاتك النهائية للـ Branch: git push origin feat/notion-task-1.
اذهب لصفحة الـ Repo على GitHub واضغط Compare & pull request.
اضغط Merge pull request. (هذا يضمن توثيق العملية).

الطريقة الثانية (سريعة من داخل VS Code):
عد إلى الـ Main: git checkout main.
اسحب آخر تحديثات الـ Main (احتياطاً): git pull origin main.
ادمج الـ Branch الجديد فيه: git merge feat/notion-task-1.
ارفع الـ Main الجديد إلى GitHub:
git push origin main

## الخطوة 7: التنظيف (Cleanup)
حذفه محلياً: git branch -d feat/notion-task-1
حذفه من GitHub: git push origin --delete feat/notion-task-1

### --------------
git fetch origin
git checkout feature/
git push origin feature/
git branch -d feature/
git push origin -d feature/
