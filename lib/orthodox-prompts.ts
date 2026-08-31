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

export const ICON_STYLES: Record<IconStyleType, StyleDefinition> = {
  coptic: {
    id: "coptic",
    title: "النمط القبطي التقليدي",
    subtitle: "مدرسة د. إيساك فانوس والأيقونة القبطية الأصيلة",
    description: "أيقونة قبطية كنسية أصيلة بمدرسة د. إيساك فانوس: عيون لوزية واسعة روحية متيقظة، ألوان تمبرا صريحة مسطحة 2D، هالات ذهبية بها صلبان قبطية متساوية الأضلاع، وكتابة اسم القديس بحروف قبطية كنسية دقيقة.",
    badge: "د. إيساك فانوس (قبطي أرثوذكسي)",
    samplePrompt: "السيدة العذراء مريم تحمل الطفل يسوع المسيح محاطة بالملاكين ميخائيل وغبريال",
    previewGradient: "from-amber-600/30 via-yellow-600/20 to-amber-950/40",
    systemDirective: `Authentic canonical 2D Coptic Orthodox Iconography in the signature sacred style of Dr. Isaac Fanous (مدرسة د. إيساك فانوس للأيقونة القبطية).
MEDIUM & TECHNIQUE: Traditional 2D flat egg tempera on gessoed wooden board icon, radiant gold leaf background, crisp precise black graphic outlines, flat planar sacred colors.
ANATOMY & SACRED EXPRESSION: Canonical Coptic proportions, large wide almond-shaped spiritual eyes looking forward with serene eternal peace, noble elongated features, small peaceful holy mouth, canonical Coptic three-finger hand blessing gesture.
LITURGICAL ATTIRE & HALO: Bright circular golden halos adorned with canonical Coptic cross engravings, authentic Coptic liturgical robes and epitrachelion with embroidered Coptic crosses.
AUTHENTIC COPTIC INSCRIPTION: Prominent, clear ancient Coptic letters and inscriptions written in authentic Coptic ecclesiastical script framing the top/sides of the icon.
COLOR PALETTE: Pure liturgical pigments — vermilion red, ultramarine blue, ochre gold, white linen. No secular shadows, divine uncreated heavenly light.`,
    negativePrompt: `3D CGI, western renaissance oil painting, realistic skin pores, photorealism, heavy shadows, dark gloomy atmosphere, anime, deformed hands, extra fingers, distorted eyes, asymmetric eyes, western cross, Latin characters, distorted letters, modern clothing, fantasy armor, signature, watermark.`,
  },
  byzantine: {
    id: "byzantine",
    title: "النمط التراثي الأرثوذكسي الكلاسيكي",
    subtitle: "أيقونات جبل آثوس والفسيفساء الأرثوذكسية",
    description: "أيقونة تراثية أرثوذكسية كلاسيكية على طراز جبل آثوس وحامل الأيقونات: ملامح نسكية مهيبة، خطوط ذهبية براقة (الأسست)، هالات محفورة مذهبة، وحروف قبطية ويونانية كنسية.",
    badge: "تراثي بيزنطي (جبل آثوس)",
    samplePrompt: "السيد المسيح ضابط الكل (البانتوكراتور) ممسكاً بالإنجيل ومباركاً بيده اليمنى",
    previewGradient: "from-blue-600/30 via-amber-600/20 to-stone-900/40",
    systemDirective: `Masterpiece Eastern Byzantine Orthodox Sacred Iconography, classic Mount Athos and ancient Eastern church iconostasis tradition.
MEDIUM & TECHNIQUE: 2D Byzantine egg tempera and burnished gold leaf on seasoned wood panel, rich lapis lazuli and imperial vermilion.
ANATOMY & SACRED EXPRESSION: Ascetic solemn holy face, deep contemplative vigilant eyes, golden striations (chrysography / assist) illuminating garment folds.
LITURGICAL ATTIRE & HALO: Elaborate golden halo, for Christ a cruciform halo with inscribed letters "O Ω N", holding jeweled Gospel book, traditional Orthodox benediction hand gesture.
SACRED INSCRIPTIONS: Inscribed holy monograms and titles in authentic Coptic or Greek liturgical script. Divine celestial light without secular shadows.`,
    negativePrompt: `photorealistic, 3D render, casual realism, western baroque style, naked cherubs, gothic darkness, blurry facial features, low quality, warped anatomy, signature, watermark, modern clothes.`,
  },
  realistic: {
    id: "realistic",
    title: "النمط الفني المقدس الواقعي",
    subtitle: "لوحات كنسية أرثوذكسية كلاسيكية مهيبة",
    description: "فن كنسي كلاسيكي موقر بأسلوب أساتذة الفن المقدس الأرثوذكسي، إضاءة سماوية نيرة، ملابس تاريخية محتشمة ومهابة روحية فائقة مع هالات مقدسة واضحة.",
    badge: "فن كنسي كلاسيكي مهيب",
    samplePrompt: "القديس مارمرقس الرسول يكتب إنجيله وبجواره الأسد الرمزي",
    previewGradient: "from-amber-900/40 via-stone-800/30 to-zinc-950/50",
    systemDirective: `Masterpiece Classical Eastern Orthodox Sacred Christian Fine Art (inspired by Viktor Vasnetsov, Mikhail Nesterov, and Heinrich Hofmann).
MEDIUM & STYLE: Exquisite museum-quality sacred classical oil painting, luminous celestial warm divine lighting, rich textured biblical drapery and linen.
FIGURE & EXPRESSION: Dignified, highly reverent, holy biblical figures with peaceful, prayerful, luminous faces, distinct holy glowing golden halos, reverent orthodox vestments with ornate embroideries.
SCENE & ATMOSPHERE: Solemn, sacred, heavenly peaceful atmosphere, warm golden amber illumination, crystal clear detailed features, highly respectful liturgical composition.`,
    negativePrompt: `dark dingy muddy tones, modern casual clothing, horror or creepy faces, blurry distorted hands, fantasy RPG style, anime, low quality.`,
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

