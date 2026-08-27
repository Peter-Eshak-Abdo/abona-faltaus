/**
 * Orthodox Prompt Engineering Engine & Style Presets
 * Designed specifically for canonical Coptic and Eastern Orthodox iconography & sacred Christian art.
 */

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
}

export const ICON_STYLES: Record<IconStyleType, StyleDefinition> = {
  coptic: {
    id: "coptic",
    title: "النمط القبطي التقليدي",
    subtitle: "أسلوب د. إيساك فانوس والأيقونة القبطية الأصيلة",
    description: "أيقونة قبطية كنسية أصيلة بمدرسة د. إيساك فانوس، عيون روحية واسعة، هالات ذهبية بها صلبان قبطية، خطوط هندسية واضحة، ألوان تمبرا زاهية وخلفية ذهبية مقدسة.",
    badge: "د. إيساك فانوس (قبطي أرثوذكسي)",
    samplePrompt: "السيدة العذراء مريم تحمل الطفل يسوع المسيح محاطة بالملاكين ميخائيل وغبريال",
    previewGradient: "from-amber-600/30 via-yellow-600/20 to-amber-950/40",
    systemDirective: `Authentic traditional Coptic Orthodox Iconography in the signature canonical style of master Dr. Isaac Fanous (مدرسة د. إيساك فانوس).
MEDIUM & TECHNIQUE: Traditional 2D flat egg tempera on gessoed wooden icon panel, burnished gold leaf background with engraved sacred motifs, crisp black outlines and geometric stylized contours.
FIGURE & ANATOMY: Stylized Coptic canonical proportions, large luminous almond-shaped spiritual eyes looking straight at the viewer reflecting heavenly peace, serene peaceful mouth, elongated noble figures.
LITURGICAL DETAILS: Prominent glowing circular golden halo with distinct Coptic cross markings (IC XC for Christ, MP ΘY for Virgin Mary), authentic traditional Coptic liturgical robes with embroidered crosses and geometric patterns, canonical Coptic hand gestures of blessing (three fingers touching), ancient Coptic text inscriptions.
COLOR PALETTE: Bright radiant liturgical colors — sacred crimson red, royal ultramarine blue, ochre yellow, pure white, and shimmering gold. High brightness, clear sacred visibility.
STRICT NEGATIVE EXCLUSIONS: NO 3D rendering, NO photorealism, NO modern western painting, NO cinematic dark shadows, NO dark gloomy lighting, NO Renaissance realism, NO Leonardo Da Vinci style, NO blurry faces, NO anime, NO distortion.`,
  },
  byzantine: {
    id: "byzantine",
    title: "النمط البيزنطي الكلاسيكي",
    subtitle: "أيقونات جبل آثوس والفسيفساء الأرثوذكسية",
    description: "أيقونة بيزنطية أرثوذكسية كلاسيكية، أسلوب أيقونات جبل آثوس والفسيفساء المذهبة، ملامح مهيبة، خطوط ذهبية على الملابس (الأسست)، هالات دقيقة وكتابات يونانية وسلافية.",
    badge: "بيزنطي أرثوذكسي (جبل آثوس)",
    samplePrompt: "السيد المسيح ضابط الكل (البانتوكراتور) ممسكاً بالإنجيل ومباركاً بيده اليمنى",
    previewGradient: "from-blue-600/30 via-amber-600/20 to-stone-900/40",
    systemDirective: `Masterpiece Eastern Byzantine Orthodox Iconography, classic Mount Athos and Hagia Sophia canonical iconostasis tradition.
MEDIUM & TECHNIQUE: Canonical 2D Byzantine egg tempera icon on seasoned wood or shimmering Byzantine gold mosaic tesserae, brilliant gold leaf background, rich Byzantine vermilion, lapis lazuli, imperial purple.
FIGURE & ANATOMY: Sacred solemn ascetic facial features, large vigilant spiritual eyes, refined golden line striations (assist / chrysography) radiating across liturgical vestments.
LITURGICAL DETAILS: Ornate cruciform halo for Christ with Greek lettering "O Ω N" (He Who Is), canonical Greek abbreviations (IC XC, MP ΘY), traditional Orthodox hand gesture of benediction, holding jeweled Gospel book, inverted byzantine sacred perspective.
COLOR & LIGHT: Divine uncreated heavenly light, no secular dramatic shadow, majestic transcendent Orthodox sacred atmosphere.
STRICT NEGATIVE EXCLUSIONS: NO western renaissance oil painting, NO modern digital 3D style, NO photorealism, NO dark gloomy shadows, NO deformed anatomy, NO anime, NO secular interpretation.`,
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
SCENE & ATMOSPHERE: Solemn, sacred, heavenly peaceful atmosphere, warm golden amber illumination, crystal clear detailed features, highly respectful liturgical composition.
STRICT NEGATIVE EXCLUSIONS: NO dark dingy muddy tones, NO modern casual clothing, NO horror or creepy faces, NO blurry distorted hands, NO fantasy RPG style, NO anime.`,
  },
};

export const QUICK_SUGGESTIONS = [
  {
    title: "السيد المسيح الراعي الصالح",
    arabicPrompt: "السيد المسيح الراعي الصالح يحمل الخروف الضال على كتفيه بين المروج الخضراء والينابيع الهادئة",
    style: "coptic" as IconStyleType,
  },
  {
    title: "السيدة العذراء والطفل يسوع",
    arabicPrompt: "السيدة العذراء مريم جالسة على العرش حاملة الطفل يسوع المسيح محاطة بهالات النور والملائكة",
    style: "coptic" as IconStyleType,
  },
  {
    title: "المسيح ضابط الكل (البانتوكراتور)",
    arabicPrompt: "السيد المسيح البانتوكراتور ضابط الكل ممسكاً بكتاب الحياة ومباركاً بيمينه على خلفية فسيفساء ذهبية",
    style: "byzantine" as IconStyleType,
  },
  {
    title: "الشهيد العظيم مارجرجس الروماني",
    arabicPrompt: "الشهيد العظيم مارجرجس يمتطي جواده الأبيض حاملاً رمح الصليب وينتصر على التنين رمز الشر",
    style: "coptic" as IconStyleType,
  },
  {
    title: "القديس أبونا فلتاؤس السرياني",
    arabicPrompt: "القديس المعاصر الراهب الصامت أبونا فلتاؤس السرياني بلحيته البيضاء وجلبابه الرهباني ممسكاً بالصليب والمسبحة في قلايته الرهبانية",
    style: "realistic" as IconStyleType,
  },
  {
    title: "رئيس الملائكة الجليل ميخائيل",
    arabicPrompt: "رئيس الملائكة الجليل ميخائيل حاملاً سيف الحق وميزان العدالة بأجنحة مهيبة متلألئة",
    style: "byzantine" as IconStyleType,
  },
  {
    title: "العشاء السري المقدس",
    arabicPrompt: "السيد المسيح مع تلاميذه الاثني عشر حول مائدة العشاء السري وكسر الخبز في العلية",
    style: "realistic" as IconStyleType,
  },
  {
    title: "القيامة المجيدة ونزول الجحيم",
    arabicPrompt: "أيقونة القيامة المجيدة (الأناستاسيس): السيد المسيح القائم من بين الأموات يمسك بآدم وحواء ويحطم أبواب الجحيم",
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
): { finalPrompt: string; styleDetails: StyleDefinition } {
  const styleDef = ICON_STYLES[style] || ICON_STYLES.coptic;

  let prompt = userQuery.trim();

  // Guardrails & Negative guidelines built directly into the prompt description
  const rules = theologicalGuardrails
    ? "Strict theological rules: strictly respectful Orthodox Christian depiction, holy aura, modest clothing, no distortion of holy figures, dignified posture, beautiful canonical art."
    : "";

  const finalPrompt = `Subject: ${prompt}. Art Style: ${styleDef.systemDirective}. Composition: Focused sacred composition, centered iconic posture, majestic and divine sacred art. ${rules}`;

  return {
    finalPrompt,
    styleDetails: styleDef,
  };
}
