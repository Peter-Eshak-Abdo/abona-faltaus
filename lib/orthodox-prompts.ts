import { lookupSaintIcon, COPTIC_SAINTS_REGISTRY } from "./coptic-saints-database";

export type IconStyleType = "coptic" | "byzantine" | "realistic";
export type AspectRatioType = "1:1" | "9:16" | "3:4" | "16:9";

export interface StyleDefinition {
  id: IconStyleType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  samplePrompt: string;
  previewGradient: string;
  systemDirective: string;
  negativePrompt: string;
}

export const CANONICAL_COPTIC_RULES = {
  colors: [
    { name: "الأبيض", meaning: "طهر ونقاء وبهاء النور الإلهي", hex: "#FFFFFF" },
    { name: "الأحمر", meaning: "الخلاص والمجد وفداء دم الشهداء", hex: "#C02626" },
    { name: "الأخضر الزاهي", meaning: "الحياة والتجديد وقوة القيامة", hex: "#16A34A" },
    { name: "الأخضر الشاحب", meaning: "للموت والشر المدحور", hex: "#86A789" },
    { name: "الأزرق", meaning: "السماء الأبدية والمجد الإلهي", hex: "#2563EB" },
    { name: "البنفسجي", meaning: "الاتحاد بالله والملوكية الروحية", hex: "#7C3AED" },
    { name: "البني", meaning: "النسك والتقشف وتواضع الرهبنة", hex: "#78350F" },
    { name: "الأصفر", meaning: "النور الإلهي الساطع غير المخلوق", hex: "#EAB308" },
    { name: "الذهبي", meaning: "الملكوت والأبدية وحضرة الله الفائقة", hex: "#D4AF37" }
  ],
  perspective: {
    title: "المنظور المسطح والروحي (Flat Spiritual Perspective)",
    description: "الأيقونة القبطية لا تتبع المنظور الأرضي الواقعي أو البعد المكاني ثلاثي الأبعاد، بل تقدم واقعاً روحياً مسطحاً (2D)؛ لأن العمق الروحي أهم من البعد المكاني، وكل تفصيلة وضعت لخدمة الرسالة اللاهوتية وليس الجمال الشكلي فقط."
  },
  facialFeatures: [
    { feature: "العين الكبيرة", meaning: "البصيرة الروحية وعمق الرؤية والإدراك الإلهي بدلاً من التركيز على الماديات" },
    { feature: "الفم الصغير", meaning: "الصمت الهادئ وحفظ أسرار الله وترجمة الحكمة الإلهية بدون ثرثرة كلامية" },
    { feature: "الوجه المستقيم", meaning: "الثبات والاتزان والوقوف الدائم في حضرة الله بقوة وسلام" },
    { feature: "الابتسامة الهادئة", meaning: "فرح وسلام داخلي عميق ومطمئن دون إظهار الأسنان" },
    { feature: "الجسد والملابس", meaning: "ملابس من نور سماوي دون إبراز لتفاصيل الجسم العضلي المادية" }
  ],
  symbols: [
    { symbol: "الصليب المقدس", meaning: "رمز المجد والانتصار والغلبة بالقيامة" },
    { symbol: "الكتاب المقدس", meaning: "كلمة الله الحية وإنجيل الخلاص للبشرية" },
    { symbol: "يد البركة", meaning: "الحضور الإلهي المباشر ونيل البركة (أصابع IC XC)" },
    { symbol: "الهالة المذهبة", meaning: "المجد والنور الإلهي غير المخلوق المحيط بالقديسين" }
  ]
};

export const ICON_STYLES: Record<IconStyleType, StyleDefinition> = {
  coptic: {
    id: "coptic",
    title: "الفن القبطي المعاصر (مدرسة إيساك فانوس)",
    subtitle: "هندسة ونور داخلي، مساحات لونية مسطحة 2D",
    description: "أيقونة قبطية معاصرة بمدرسة د. إيساك فانوس: خطوط هندسية حادة، عيون واسعة متيقظة، فم صغير، مساحات لونية مسطحة (2D) بدون ظلال أرضية، هالة دائرية ذهبية مثالية بصلبان قبطية.",
    badge: "د. إيساك فانوس (قبطي أرثوذكسي)",
    samplePrompt: "السيدة العذراء مريم تحمل الطفل يسوع المسيح محاطة بالملاكين ميخائيل وغبريال",
    previewGradient: "from-amber-600/30 via-yellow-600/20 to-amber-950/40",
    systemDirective: `Neo-Coptic Orthodox sacred icon, authentic canon of Dr. Isaac Fanous school and ancient Coptic theology.
CANONICAL COPTIC ICONOGRAPHIC LAWS:
1. PERSPECTIVE: Strictly 2D flat spiritual perspective. Non-linear vanishing point. Spiritual depth prioritized over worldly physical spatial illusion. No secular 3D drop shadows.
2. FACIAL FEATURES:
   - Large prominent almond spiritual eyes expressing heavenly contemplation and divine perception.
   - Small quiet mouth symbolizing sacred silence, keeping divine mysteries, and speaking through prayer.
   - Upright balanced head showing spiritual stability and eternal steadfastness before God.
   - Serene peaceful subtle smile of interior divine peace, never showing teeth.
   - Holy garments rendered as draperies of uncreated light, without physical muscular contours.
3. CANONICAL LITURGICAL COLORS:
   - White: Purity and divine radiance.
   - Red: Salvation, martyrs blood, and divine glory.
   - Bright Green: Life, renewal, and resurrection power.
   - Deep Celestial Blue: Eternal heaven and divine glory.
   - Imperial Purple: Union with God and spiritual sovereignty.
   - Earthy Brown: Monastic asceticism and humility.
   - Luminous Gold: Uncreated divine light, the Heavenly Kingdom, and eternity.
4. SACRED SYMBOLS:
   - Perfectly circular pure gold halo with engraved Coptic Cross.
   - Hand formed in the canonical Coptic blessing gesture (IC XC fingers).
   - Holy Gospel book or martyr cross held firmly.
   - Egg tempera brushwork on seasoned wooden panel texture.`,
    negativePrompt: `3D render, 3D CGI, photorealistic, realistic skin pores, drop shadows, cast shadows, secular lighting, western renaissance style, baroque, smiling with teeth, mouth open, muscular anatomical definition, anime, modern clothes, glowing neon, fantasy RPG, text, letters, watermark, signature, deformed hands, extra fingers.`,
  },
  byzantine: {
    id: "byzantine",
    title: "الفن البيزنطي التقليدي (جبل آثوس)",
    subtitle: "هيبة وتفاصيل مذهبة عريقة وخلفيات من الذهب الخالص",
    description: "أيقونة بيزنطية أرثوذكسية كلاسيكية: ألوان غامقة وثرية (أحمر قاني، أزرق داكن)، خلفيات من الذهب الخالص، تدرج لوني خفيف بالوجوه لإعطاء وقار نسكي، ملابس مطرزة بدقة.",
    badge: "تراثي بيزنطي (جبل آثوس)",
    samplePrompt: "السيد المسيح ضابط الكل (البانتوكراتور) ممسكاً بالإنجيل ومباركاً بيده اليمنى",
    previewGradient: "from-blue-600/30 via-amber-600/20 to-stone-900/40",
    systemDirective: `Traditional Byzantine Eastern Orthodox sacred icon masterpiece, classic Mount Athos and ancient Eastern church iconostasis tradition.
VISUAL TRAITS: Detailed majestic holy robes with golden chrysography assist patterns, pure solid gold leaf background, deep rich liturgical colors (imperial vermilion, deep lapis lazuli), subtle sacred facial shading for solemn ascetic contemplation, highly detailed tempera painting style, sacred and solemn atmosphere, elaborate radiant golden halo.`,
    negativePrompt: `cartoon, flat design, geometric neo-coptic, modern digital art, smiling, casual posture, 3D, perspective, western baroque, text, words, inscriptions, letters, numbers, blurry facial features, low quality, warped anatomy, signature, watermark, modern clothes.`,
  },
  realistic: {
    id: "realistic",
    title: "الفن القبطي القديم والرهباني (Monastic Fresco)",
    subtitle: "جداريات الأديرة العتيقة وبساطة فن دير باويط وبوش",
    description: "مستوحى من الجداريات القديمة في الأديرة القبطية: خطوط تحديد خارجية عريضة (Outlines)، ألوان مسطحة عتيقة، وملمس كأنه مرسوم على جص أو خشب أثري قديم.",
    badge: "فن جداري رهباني قديم",
    samplePrompt: "القديس مارمرقس الرسول الإنجيلي كاروز الديار المصرية",
    previewGradient: "from-amber-900/40 via-stone-800/30 to-zinc-950/50",
    systemDirective: `Ancient Monastic Coptic fresco style icon, raw authentic early Christian Egyptian monastic art (inspired by ancient Bawit and Red Sea monastery murals).
VISUAL TRAITS: Prominent thick graphic outlines, flat earthen primary colors, wide spiritual eyes, historical wall fresco texture with aged patina, ancient Egyptian Christian sacred art influence, dignified holy figure with glowing peaceful halo.`,
    negativePrompt: `clean modern vectors, modern digital art, realistic proportions, high definition, shiny glossy, perfect symmetry, 3D render, western renaissance, text, letters, words, inscriptions, typography, watermark, signature.`,
  },
};

export const QUICK_SUGGESTIONS = [
  {
    title: "السيد المسيح البانتوكراتور (ضابط الكل)",
    arabicPrompt: "السيد المسيح ضابط الكل ممسكاً بكتاب الحياة ومباركاً بيمينه برداء أحمر وأزرق وهالة صليبية مذهبة بحروف ⲒⲎⲤ ⲠⲬⲤ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "أيقونة القيامة المجيدة ونزول الجحيم (الأناستاسيس)",
    arabicPrompt: "أيقونة القيامة القبطية: السيد المسيح بلباس النصرة الأبيض يحطم أبواب الجحيم ويقيم آدم وحواء من الجب والشيطان مقيد بالأسفل، مكتوب عليها ⲠⲒⲬⲢⲒⲤⲦⲞⲤ ⲀϤⲦⲰⲚϤ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "السيدة العذراء مريم (الثيؤطوكوس)",
    arabicPrompt: "السيدة العذراء مريم تحمل الطفل يسوع المسيح محاطة بالنجوم الثلاثة البتولية وهالات النور المذهبة بحروف ϮⲐⲈⲞⲦⲞⲔⲞⲤ ⲘⲀⲢⲒⲀ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "الشهيد العظيم مارجرجس الروماني",
    arabicPrompt: "الشهيد مارجرجس على جواده الأبيض يطعن التنين برمح الصليب ومكتوب اسمه بالقبطي ⲠⲒⲀⲄⲒⲞⲤ ⲄⲈⲰⲢⲄⲒⲞⲤ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "القديس الأنبا أنطونيوس كوكب البرية",
    arabicPrompt: "الأنبا أنطونيوس أبو الرهبان بالقلنسوة القبطية ذات الـ 12 صليباً واللحية البيضاء حاملاً الصليب الخشبي والعصا ومكتوب ⲀⲠⲀ ⲀⲚⲦⲰⲚⲒⲞⲤ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "القديس أبونا فلتاؤس السرياني",
    arabicPrompt: "القديس المعاصر أبونا فلتاؤس السرياني بالقلنسوة الرهبانية واللحية البيضاء حاملاً صليب الجلد والمسبحة ومكتوب ⲀⲠⲀ ⲪⲒⲖⲞⲐⲈⲞⲤ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "القديس مارمرقس الرسول الإنجيلي",
    arabicPrompt: "القديس مارمرقس كاروز الديار المصرية ممسكاً بالإنجيل وبجواره الأسد الرمزي ومنارة الإسكندرية ومكتوب ⲠⲒⲀⲄⲒⲞⲤ ⲘⲀⲢⲔⲞⲤ",
    style: "coptic" as IconStyleType,
  },
  {
    title: "رئيس الملائكة الجليل ميخائيل",
    arabicPrompt: "رئيس الملائكة ميخائيل بثياب الشماسية المذهبة وأجنحة نورانية حاملاً سيف الحق وميزان العدالة ومكتوب ⲘⲒⲬⲀⲎⲖ",
    style: "byzantine" as IconStyleType,
  },
];

/**
 * Builds an enhanced, theologically respectful prompt for the AI image generation model
 */
export function buildEnhancedOrthodoxPrompt(
  userQuery: string,
  style: IconStyleType = "coptic",
  theologicalGuardrails = true
): { finalPrompt: string; styleDetails: StyleDefinition; detectedSaint?: any } {
  const styleDef = ICON_STYLES[style] || ICON_STYLES.coptic;
  const saint = lookupSaintIcon(userQuery);

  let specificGuidance = "";
  if (saint) {
    if (style === "coptic") {
      specificGuidance = `Subject: ${saint.copticPromptGuidance}. Canonical Inscription: "${saint.copticTitleInscription}". Liturgical Colors: ${saint.canonicalColors.tunic}, ${saint.canonicalColors.mantle}. Key Attributes: ${saint.keyAttributes.join(", ")}.`;
    } else if (style === "byzantine") {
      specificGuidance = `Subject: ${saint.byzantinePromptGuidance}. Canonical Inscription: "${saint.copticTitleInscription}". Key Attributes: ${saint.keyAttributes.join(", ")}.`;
    } else {
      specificGuidance = `Subject: ${saint.arabicName} in sacred Orthodox realism. Key Attributes: ${saint.keyAttributes.join(", ")}.`;
    }
  }

  const prompt = userQuery.trim();
  const rules = theologicalGuardrails
    ? "Strict canonical Orthodox iconography rules: authentic respectful facial features, large almond spiritual eyes, correct Coptic cross halo, no distortion, precise sacred symbolism."
    : "";

  const finalPrompt = `${styleDef.systemDirective}\n\n${specificGuidance ? `Canonical Subject: ${specificGuidance}\n` : ""}User Details: ${prompt}.\nComposition: Symmetrical sacred icon composition, reverent holy atmosphere. ${rules}`;

  return {
    finalPrompt,
    styleDetails: styleDef,
    detectedSaint: saint,
  };
}

