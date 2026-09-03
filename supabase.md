# تحليل وتخفيض حجم قاعدة البيانات في Supabase
الحجم الحالي: **0.491 / 0.5 GB (98%)**

---

### سبب امتلاء المساحة (Root Cause):
1. **جدول `orthodox_documents` (المتجهات RAG):**
   - يحتوي على **47,181 سجل** مع أعمدة `vector(768)`.
   - من بينها **25,782 سجل صلوات قداس (`liturgy`)** تم عمل Embedding لها ومخزنة في الداتابيز رغم أنها متوفرة ومحفوظة محلياً في ملفات الـ JSON والبوربوينت بالكامل.
2. **فهرس HNSW الخاص بالـ pgvector:**
   - تم إنشاء الفهرس التالي:
     ```sql
     CREATE INDEX orthodox_docs_embedding_hnsw_idx ON public.orthodox_documents USING hnsw (embedding vector_cosine_ops);
     ```
   - فهرس HNSW لـ 47 ألف متجه 768-dim يستهلك من **250MB إلى 350MB** بمفرده على القرص.
3. **مساحة الـ Dead Tuples:**
   - يحتاج بوستجرس لتشغيل `VACUUM FULL` لإعادة الصفحات الفارغة إلى نظام الملفات (Free Disk Space).

---

### خطوات التخفيض الفوري (استرجاع أكثر من 300MB - 350MB):

افتح **Supabase Dashboard** -> **SQL Editor** ونفذ التالي:

```sql
-- 1. فحص أحجام الجداول والفهارس
SELECT 
    schemaname || '.' || relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS data_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- 2. إزالة فهرس HNSW الضخم فوراً (يوفر حوالي 200MB - 300MB)
DROP INDEX IF EXISTS public.orthodox_docs_embedding_hnsw_idx;

-- 3. حذف وثائق صلوات القداس من الداتابيز (25,782 سجل مكرر لا نحتاجه في الـ Vector DB)
DELETE FROM public.orthodox_documents WHERE corpus_category = 'liturgy';

-- 4. إرجاع المساحة للقرص الصلب فوراً (استرجاع المساحة لنظام التشغيل)
VACUUM FULL public.orthodox_documents;
VACUUM FULL;

-- 5. (اختياري) إنشاء فهرس خفيف جداً IVFFlat بدلاً من HNSW
-- يستهلك مساحة صغيرة جداً (أقل من 20MB):
CREATE INDEX IF NOT EXISTS orthodox_docs_embedding_ivfflat_idx 
ON public.orthodox_documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

تم حفظ السكربت كاملاً في: [supabase/reduce_db_size.sql](file:///p:/Projects/abona-faltaus/supabase/reduce_db_size.sql).
