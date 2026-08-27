# دليـل تشغيـل منظومـة الليتورجيـا والـ RAG الكـامـل (100%)

## 1. استخراج ملفات البوربوينت كاملة (PPTX to JSON Dataset)
```powershell
python Liturgypptxm.py
```
> يُنتج ملف `coptic_liturgy_dataset.json` ويحتوي على كافة النصوص والصلوات والألحان المستخرجة.

---

## 2. تدريب نموذج الذكاء الاصطناعي (LLM Fine-Tuning LoRA)
```powershell
python liturgygene.py
```
> يتم تدريب النموذج وحفظ الأوزان الجاهزة في مجلد `coptic_liturgy_lora_model/`.

---

## 3. تجربة واختبار النموذج المدرب (Model Inference Test)
```powershell
python test_model.py
```

---

## 4. تجهيز مقاطع الـ RAG وفهرستها في Supabase Vector Store
```powershell
# 1. تجهيز الدفعات الكاملة (12,700+ مقطع طقسي)
python prepare_full_liturgy_rag.py

# 2. رفع وفهرسة أي دفعة في قاعدة البيانات (Vector Embeddings 768)
npx tsx scripts/import-rag-json.ts data/rag_sources/liturgy_rag_batch_1.json
```

---

## 5. تشغيل واجهات الموقع التفاعلية (Next.js App)
```powershell
npm run dev
```
- صفحة القداسات الإلهية: `http://localhost:3000/liturgies`
- صفحة التسبحة والإبصالمودية: `http://localhost:3000/tasbeha`
- الشات بوت الأرثوذكسي بنظام الـ RAG: `http://localhost:3000/chat`
