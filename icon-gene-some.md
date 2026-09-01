خطة توليد الأيقونات القبطية (icon-gene-some.md)
1. الفن القبطي المعاصر (Neo-Coptic Art)
هذه المدرسة التي أسسها الفنان "إيزاك فانوس" هي الأشهر حالياً في الكنائس القبطية وتتميز بالاعتماد على الهندسة والنور الداخلي.

الخصائص المرئية: خطوط هندسية حادة، عيون واسعة، مساحات لونية مسطحة (2D) بدون ظلال (لأن القديسين في النور)، هالة دائرية مثالية.

مثال للـ Prompt الإيجابي:

Neo-Coptic Orthodox icon of [Saint Name], geometric lines, large expressive eyes, small mouth, 2D flat style, light emanating from the face, no external shadows, rich earth tones, traditional Isaac Fanous style, flat golden halo, tempera texture.

ما لا يجب فعله (Negative Prompt):

3D render, realistic, photorealistic, shadows, dramatic lighting, western renaissance style, anime, modern clothes, glowing neon, text, letters, watermarks, signature.

2. الفن البيزنطي / التقليدي (Traditional Byzantine)
الأسلوب الكلاسيكي المنتشر في الكنائس الأرثوذكسية، ويميل أكثر لإظهار الهيبة والتفاصيل الغنية.

الخصائص المرئية: ألوان غامقة وثرية (الأحمر القاني، الأزرق الداكن)، خلفيات من الذهب الخالص، تدرج لوني خفيف (Shading) في الوجوه لإعطاء عمق نسبي، ملابس مزخرفة بدقة.

مثال للـ Prompt الإيجابي:

Traditional Byzantine Orthodox icon of [Saint Name], detailed majestic robes with golden patterns, pure solid gold background, deep rich colors, subtle facial shading, highly detailed tempera painting style, sacred and solemn atmosphere, golden halo.

ما لا يجب فعله (Negative Prompt):

Cartoon, flat design, geometric neo-coptic, modern digital art, smiling, casual posture, 3D, perspective, text, inscriptions.

3. الفن القبطي القديم / الشعبي (Ancient Monastic Coptic)
مستوحى من الجداريات القديمة في الأديرة (مثل دير باويط وأديرة البحر الأحمر).

الخصائص المرئية: بسيط جداً وعفوي، خطوط تحديد خارجية عريضة (Outlines)، ألوان أساسية مسطحة باهتة قليلاً، ملمس كأنه مرسوم على جدار أو خشب قديم.

مثال للـ Prompt الإيجابي:

Ancient Coptic fresco style icon of [Saint Name], raw monastic art, prominent thick outlines, flat primary colors, wide eyes, historical wall painting style, faded texture, ancient Egyptian Christian art influence, simple holy figure.

ما لا يجب فعله (Negative Prompt):

Clean vectors, modern digital art, realistic proportions, high definition, shiny, perfect symmetry, 3D, modern typography.

التعامل مع النصوص واسم القديس بالقبطي (Coptic Typography)
نماذج الذكاء الاصطناعي تفشل بشكل شبه كامل في كتابة الحروف القبطية الصحيحة (أو أي لغة غير لاتينية بشكل دقيق) وتميل إلى "الهلوسة" ورسم رموز عشوائية تشبه الحروف.

آلية العمل الموصى بها في نظامك:

أثناء التوليد (AI Generation): قم دائماً بإضافة كلمات مثل text, words, letters, inscriptions, numbers داخل الـ Negative Prompt لضمان توليد أيقونة نظيفة تماماً بدون أي شخبطة نصية.

بعد التوليد (Post-Processing): في الواجهة الأمامية لموقعك (باستخدام Next.js/Tailwind) أو عبر أداة معالجة صور برمجية، قم بوضع اسم القديس (مثل: Ⲡⲓⲁⲅⲓⲟⲥ Ⲫⲓⲗⲟⲑⲉⲟⲥ) كطبقة علوية (Overlay) فوق الأيقونة باستخدام خط قبطي مخصص (Coptic Fonts) لتضمن الدقة المطلقة في الاسم.
