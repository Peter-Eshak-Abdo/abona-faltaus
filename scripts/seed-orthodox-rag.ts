import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("Missing Gemini API Key in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const SEED_CORPUS = [
  // 1. Father Tadros Yacoub Malaty (Patristic Commentary)
  {
    corpus_category: "patristic_commentary",
    author: "القمص تادرس يعقوب ملطي",
    work_title: "تفسير إنجيل يوحنا - الأصحاح الأول",
    reference_location: "يوحنا 1: 1",
    content: "«في البدء كان الكلمة»: يؤكد القديس يوحنا الإنجيلي أزلية السيد المسيح ولاهوته. الكلمة (اللوغوس) ليس مجرد صفة نطقية لله، بل هو الأقنوم الثاني المولود أزلياً من الآب قبل كل الدهور، نور من نور، إله حق من إله حق، مساوٍ للآب في الجوهر والكيان الإلهي.",
    metadata: { era: "Contemporary Patristics", subject: "Christology & Trinity" }
  },
  {
    corpus_category: "patristic_commentary",
    author: "القمص تادرس يعقوب ملطي",
    work_title: "تفسير الرسالة إلى أهل رومية",
    reference_location: "رومية 8: 1",
    content: "«إذاً لا شيء من الدينونة الآن على الذين هم في المسيح يسوع»: المؤمن الذي اتحد بالسيد المسيح في سر المعمودية المقدس ويحيا حياة التوبة المستمرة والجهاد الروحي، يعيش في حرية مجد أولاد الله، حيث حرره ناموس روح الحياة في المسيح من ناموس الخطية والموت.",
    metadata: { era: "Contemporary Patristics", subject: "Salvation & Grace" }
  },

  // 2. Father Antonios Fikry (Biblical Exegesis)
  {
    corpus_category: "patristic_commentary",
    author: "القمص أنطونيوس فكري",
    work_title: "تفسير سفر التكوين",
    reference_location: "تكوين 1: 26",
    content: "«نعمل الإنسان على صورتنا كشبهنا»: صورة الله تشير إلى العقل والحرية والخلود والقداسة والمحبة. الإنسان خُلق حراً ليختار الله بمحبته وطاعته، وسقوط آدم بالمعصية شوه هذه الصورة، لكن التجسد الإلهي والفداء على الصليب أعاد تجديد الطبيعة البشرية ورسم صورة المسيح فينا.",
    metadata: { era: "Contemporary Exegesis", subject: "Creation & Anthropological Theology" }
  },
  {
    corpus_category: "patristic_commentary",
    author: "القمص أنطونيوس فكري",
    work_title: "تفسير إنجيل متى",
    reference_location: "متى 26: 26-28",
    content: "«خذوا كلوا هذا هو جسدي... واشربوا منها كلكم لأن هذا هو دمي»: سر الإفخارستيا ليس مجرد ذكرى رمزية بل هو تحول حقيقي بحلول الروح القدس إلى جسد الرب ودمه الأقدسين، غفراناً للخطايا وحياة أبدية لمن يتناول منه باستحقاق واستعداد وتوبة.",
    metadata: { era: "Contemporary Exegesis", subject: "Sacramental Theology" }
  },

  // 3. Early Church Fathers (Chrysostom, Athanasius, Cyril of Alexandria, Basil)
  {
    corpus_category: "early_church_fathers",
    author: "القديس أثناسيوس الرسولي",
    work_title: "تجسد الكلمة (De Incarnatione)",
    reference_location: "الفصل 54",
    content: "تجسد كلمة الله لكي يؤلهنا (أي يجعلنا شركاء الطبيعة الإلهية بالنعمة والتبني لا بالجوهر)، وأظهر نفسه بالجسد لكي ندرك نحن الآب غير المنظور، واحتمل إهانات البشر لكي نرث نحن عدم الفساد والخلود.",
    metadata: { era: "4th Century", council: "Nicaea (325 AD)", subject: "Incarnation & Theosis" }
  },
  {
    corpus_category: "early_church_fathers",
    author: "القديس كيرلس عمود الدين",
    work_title: "رسائل القديس كيرلس الإسكندري إلى نسطور",
    reference_location: "الرسالة الثالثة والحروم الاثنا عشر",
    content: "نعترف بطبيعة واحدة متجسدة لله الكلمة (ميا فيزيس تو ثيو لوغو سيساركوميني)، كاتحاد أقنومي بغير اختلاط ولا امتزاج ولا تغيير ولا انفصال. العذراء مريم هي بالحقيقة والدة الإله (ثيئوطوكوس) لأنها ولدت بالجسد الكلمة الأزلي المتجسد.",
    metadata: { era: "5th Century", council: "Ephesus (431 AD)", subject: "Theotokos & Christology" }
  },
  {
    corpus_category: "early_church_fathers",
    author: "القديس يوحنا ذهبي الفم",
    work_title: "عظات عن الصلاة والتوبة والكهنوت",
    reference_location: "الميمر الخامس في الصلاة",
    content: "الصلاة هي ميناء للغريق، وسلاح للمحارب، وكنز للفقير، ودواء للمريض، ونور للجالسين في الظلمة. الصلاة لا تعني فقط تحريك الشفاه بل رفع العقل والقلب نحو الله بخشوع وشكر دائم وانسحاق روح.",
    metadata: { era: "4th-5th Century", subject: "Spiritual Life & Prayer" }
  },
  {
    corpus_category: "early_church_fathers",
    author: "القديس باسيليوس الكبير",
    work_title: "كتاب في الروح القدس وعظات الصوم",
    reference_location: "الفصل التاسع",
    content: "الروح القدس هو الرب المحيي، المنبثق من الآب وحده، المسجود له والممجد مع الآب والابن. هو الذي يقدس النفس ويجدد الخليقة ويهب المواهب الروحية وينير عقول المؤمنين لفهم أسرار الإنجيل.",
    metadata: { era: "4th Century", council: "Constantinople (381 AD)", subject: "Pneumatology & Holy Spirit" }
  },

  // 4. Coptic Liturgical Texts
  {
    corpus_category: "liturgy",
    author: "الكنيسة القبطية الأرثوذكسية",
    work_title: "القداس الباسيلي - صلاة الصلح والاعتراف الأخير",
    reference_location: "القداس الإلهي",
    content: "«يا الله العظيم الأبدي، الذي جبل الإنسان على غير فساد، والموت الذي دخل إلى العالم بحسد إبليس هدمته بالمجيء المحيي الذي لابنك الوحيد... أعترف إلى النفس الأخير أن هذا هو الجسد المحيي الذي أخذه ابنك الوحيد ربنا وإلهنا ومخلصنا يسوع المسيح من سيدتنا كلنا والدة الإله القديسة مريم، وجعله واحداً مع لاهوته بغير اختلاط ولا امتزاج ولا تغيير».",
    metadata: { type: "Anaphora", tradition: "St. Basil Liturgy", subject: "Liturgy & Mystery of Faith" }
  },

  // 5. Dogmatic & Comparative Theology (Pope Shenouda III)
  {
    corpus_category: "dogmatics",
    author: "قداسة البابا شنودة الثالث",
    work_title: "طبيعة المسيح",
    reference_location: "الباب الأول",
    content: "طبيعة السيد المسيح هي طبيعة واحدة من طبيعتين (لاهوتية وناسوتية)، لاهوته لم يفارق ناسوته لحظة واحدة ولا طرفة عين. كل أفعاله وأقواله تصدر من الشخص الواحد الإله المتجسد، فالصلب والموت بالجسد كان لإله متجسد دمه ذو قيمة غير محدودة لفداء العالم كله.",
    metadata: { era: "Contemporary", subject: "Christology" }
  },
  {
    corpus_category: "dogmatics",
    author: "قداسة البابا شنودة الثالث",
    work_title: "الخلاص في المفهوم الأرثوذكسي",
    reference_location: "الباب الثاني: الإيمان والجهاد والأسرار",
    content: "الخلاص في الكنيسة الأرثوذكسية ليس لحظة واحدة ماضية بل هو مسيرة حياة مستمرة بالإيمان الحي العامل بالمحبة، ونيل مفاعيل الفداء عبر سر المعمودية والميرون والتناول مع التوبة والاعتراف والجهاد ضد الخطية والتمسك بالوصايا حتى النفس الأخير.",
    metadata: { era: "Contemporary", subject: "Soteriology" }
  },

  // 6. Prayers: Agpeya and Psalmody
  {
    corpus_category: "prayers",
    author: "صلوات الكنيسة القبطية",
    work_title: "الأجبية المقدسة - صلاة باكر",
    reference_location: "مقدمة الأجبية وصلاة الشكر",
    content: "«فلنشكر صانع الخيرات الرحوم الله أبا ربنا وإلهنا ومخلصنا يسوع المسيح، لأنه سترنا، وأعاننا، وحفظنا، وقبلنا إليه، وأشفق علينا، وعضدنا، وأتى بنا إلى هذه الساعة... كل حسد وكل تجربة وكل فعل الشيطان ومؤامرة الناس الأشرار انزعها عنا وعن موضعك المقدس هذا».",
    metadata: { service: "Prime", book: "Agpeya" }
  }
];

async function seedCorpus() {
  console.log("Starting Orthodox RAG Knowledge Corpus Ingestion...");

  for (let i = 0; i < SEED_CORPUS.length; i++) {
    const item = SEED_CORPUS[i];
    console.log(`[${i + 1}/${SEED_CORPUS.length}] Embedding: ${item.work_title} (${item.author})...`);

    try {
      const fullText = `${item.work_title} - ${item.author} - ${item.reference_location}\n${item.content}`;
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: fullText,
      });

      const embedding = response.embeddings?.values;
      if (!embedding) {
        console.error(`Failed to get embedding for: ${item.work_title}`);
        continue;
      }

      const { error } = await supabase.from("orthodox_documents").insert({
        corpus_category: item.corpus_category,
        author: item.author,
        work_title: item.work_title,
        reference_location: item.reference_location,
        content: item.content,
        embedding: embedding,
        metadata: item.metadata,
      });

      if (error) {
        console.error(`Supabase insert error for ${item.work_title}:`, error.message);
      } else {
        console.log(`✓ Successfully indexed: ${item.work_title}`);
      }
    } catch (err: any) {
      console.error(`Error processing item ${item.work_title}:`, err.message);
    }
  }

  console.log("Orthodox RAG Corpus Ingestion completed successfully!");
}

seedCorpus().catch(console.error);
