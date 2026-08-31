/**
 * Comprehensive Coptic & Orthodox Saints, Scenes & Inscriptions Database
 * Contains precise canonical Coptic inscriptions, theological symbolism, and prompt helpers.
 */

export interface SaintIconDefinition {
  id: string;
  arabicName: string;
  copticName: string;
  copticTitleInscription: string;
  category: "christ" | "theotokos" | "apostles" | "martyrs" | "monastics" | "archangels" | "events";
  canonicalColors: {
    tunic: string;
    mantle: string;
    halo: string;
  };
  keyAttributes: string[];
  copticPromptGuidance: string;
  byzantinePromptGuidance: string;
  theologicalSignificance: string;
}

export const COPTIC_SAINTS_REGISTRY: SaintIconDefinition[] = [
  // 1. السيد المسيح
  {
    id: "christ-pantocrator",
    arabicName: "السيد المسيح ضابط الكل (البانتوكراتور)",
    copticName: "ⲒⲎⲤⲞⲨⲤ ⲠⲒⲬⲢⲒⲤⲦⲞⲤ ⲠⲒⲠⲀⲚⲦⲞⲔⲢⲀⲦⲰⲢ",
    copticTitleInscription: "ⲒⲎⲤ ⲠⲬⲤ",
    category: "christ",
    canonicalColors: {
      tunic: "Crimson Red (symbolizing Divinity and Incarnation)",
      mantle: "Royal Blue (symbolizing Humanity)",
      halo: "Golden Cruciform halo with Coptic Cross and letters O W N",
    },
    keyAttributes: ["Holding open jeweled Gospel in left hand", "Right hand raised in canonical Coptic blessing gesture", "Frontal direct gaze"],
    copticPromptGuidance: "Christ Pantocrator enthroned, holding Gospel with golden cross, right hand blessing with 3 fingers, cruciform halo with letters 'O Ω N', inscribed 'ⲒⲎⲤ ⲠⲬⲤ'",
    byzantinePromptGuidance: "Christ Pantocrator, Mount Athos iconostasis style, majestic gaze, deep gold chrysography folds, holding open Book of Life, inscribed 'IC XC'",
    theologicalSignificance: "ضابط الكل وملك الملوك، يجمع بين اللاهوت (الرداء الأحمر) والناسوت (الرداء الأزرق)، وبركته تفيض على المؤمنين.",
  },
  {
    id: "christ-resurrection",
    arabicName: "القيامة المجيدة والنزول إلى الجحيم (الأناستاسيس)",
    copticName: "ⲠⲒϪⲒⲚⲦⲰⲚϤ ⲈⲂⲞⲖ ϦⲈⲚ ⲚⲎⲈⲐⲘⲰⲞⲨⲦ",
    copticTitleInscription: "ⲠⲒⲬⲢⲒⲤⲦⲞⲤ ⲀϤⲦⲰⲚϤ",
    category: "events",
    canonicalColors: {
      tunic: "Radiant Pure White and Gold (Victory and Transfigured Light)",
      mantle: "Luminous Translucent White",
      halo: "Blazing Golden Cruciform halo",
    },
    keyAttributes: ["Christ pulling Adam and Eve by their wrists from Hades", "Shattered brass gates and broken locks under His feet", "Bound Satan in the abyss below", "Triumphant white garments"],
    copticPromptGuidance: "The Holy Resurrection (Anastasis) icon in Coptic cross shape, Christ in dazzling white garments pulling Adam and Eve from dark hades, broken bronze gates, bound demon below, inscribed 'ⲠⲒⲬⲢⲒⲤⲦⲞⲤ ⲀϤⲦⲰⲚϤ'",
    byzantinePromptGuidance: "Harrowing of Hades (Anastasis), Christ pulling Adam and Eve from tombs, mandorla of divine uncreated light, angels, shattered locks, inscribed 'H ANACTACIC'",
    theologicalSignificance: "قيامة المخلص منتصراً على الموت، مكسراً أبواب الجحيم ومخرجاً آدم وحواء مخلصين بنور نصرته.",
  },
  {
    id: "christ-good-shepherd",
    arabicName: "السيد المسيح الراعي الصالح",
    copticName: "ⲒⲎⲤⲞⲨⲤ ⲠⲒⲘⲀⲚⲈⲤⲰⲞⲨ ⲈⲐⲚⲀⲚⲈϤ",
    copticTitleInscription: "ⲠⲒⲘⲀⲚⲈⲤⲰⲞⲨ",
    category: "christ",
    canonicalColors: {
      tunic: "Sacred Crimson Red",
      mantle: "Deep Sky Blue",
      halo: "Golden Cruciform halo",
    },
    keyAttributes: ["Carrying the lost sheep tenderly on shoulders", "Holding shepherd's staff with Coptic cross top", "Peaceful pastoral landscape with peaceful waters"],
    copticPromptGuidance: "Christ the Good Shepherd carrying the lost white lamb on His shoulders, holding wooden crook staff with Coptic cross, serene green meadow, inscribed 'ⲠⲒⲘⲀⲚⲈⲤⲰⲞⲨ'",
    byzantinePromptGuidance: "Christ the Good Shepherd, classical Byzantine icon, carrying tender sheep, gold leaf background, inscribed 'IC XC O ΠOIMHN'",
    theologicalSignificance: "المخلص الذي يبذل نفسه عن الخراف، يحمل الضعفاء على منكبيه فرحاً.",
  },

  // 2. السيدة العذراء
  {
    id: "theotokos-virgin-mary",
    arabicName: "السيدة العذراء مريم والدة الإله (الثيؤطوكوس)",
    copticName: "ϮⲐⲈⲞⲦⲞⲔⲞⲤ ⲘⲀⲢⲒⲀ",
    copticTitleInscription: "ⲘⲢ ⲐⲨ",
    category: "theotokos",
    canonicalColors: {
      tunic: "Pure Liturgical White or Rose Pink",
      mantle: "Royal Blue / Purple Maphorion edged with golden fringes and 3 gold stars of virginity",
      halo: "Golden circular halo",
    },
    keyAttributes: ["Holding Child Jesus seated in her arm", "Three golden stars on forehead and both shoulders denoting perpetual virginity", "Gentle pointing hand towards Christ (Hodegetria)"],
    copticPromptGuidance: "The Virgin Mary Theotokos holding Christ Child, wearing deep blue mantle with three golden star rosettes of perpetual virginity, gentle spiritual eyes, inscribed 'ϮⲐⲈⲞⲦⲞⲔⲞⲤ ⲘⲀⲢⲒⲀ' and 'ⲘⲢ ⲐⲨ'",
    byzantinePromptGuidance: "Theotokos Hodegetria, Mount Athos icon, Virgin Mary pointing to Christ, three gold stars on maphorion, inscribed 'MP ΘY'",
    theologicalSignificance: "والدة الإله الدائمة البتولية، التي تشير بيدها للمسيح فادي العالم.",
  },

  // 3. الآباء الرسل
  {
    id: "saint-mark",
    arabicName: "القديس مارمرقس الرسول كاروز الديار المصرية",
    copticName: "ⲠⲒⲀⲄⲒⲞⲤ ⲘⲀⲢⲔⲞⲤ ⲠⲒⲀⲠⲞⲤⲦⲞⲖⲞⲤ",
    copticTitleInscription: "ⲠⲒⲁⲅⲓⲟⲥ Ⲙⲁⲣⲕⲟⲥ",
    category: "apostles",
    canonicalColors: {
      tunic: "Pure Off-White with Coptic embroidered stole",
      mantle: "Warm Ochre / Coral Mantle",
      halo: "Radiant Gold halo",
    },
    keyAttributes: ["Holding Gospel of Saint Mark", "Accompanied by the symbolic winged lion of Saint Mark", "Alexandria lighthouse tower in background"],
    copticPromptGuidance: "Saint Mark the Apostle in Coptic episcopal vestments, holding jeweled Gospel book, symbolic lion sitting calmly beside him, Pharos of Alexandria in background, inscribed 'Ⲡⲓⲁⲅⲓⲟⲥ Ⲙⲁⲣⲕⲟⲥ'",
    byzantinePromptGuidance: "Saint Mark Evangelist writing in Gospel scroll, noble apostolic face, stylized lion, inscribed 'O AΓIOC MAPKOC'",
    theologicalSignificance: "ناظر الإله الإنجيلي ومؤسس الكنيسة القبطية الأرثوذكسية والكرسي المرقسي.",
  },

  // 4. الشهداء
  {
    id: "saint-george",
    arabicName: "الشهيد العظيم مارجرجس الروماني أمير الشهداء",
    copticName: "ⲠⲒⲀⲄⲒⲞⲤ ⲄⲈⲰⲢⲄⲒⲞⲤ ⲠⲒⲘⲀⲢⲦⲨⲢⲞⲤ",
    copticTitleInscription: "ⲠⲒⲁⲅⲓⲟⲥ Ⲅⲉⲱⲣⲅⲓⲟⲥ",
    category: "martyrs",
    canonicalColors: {
      tunic: "Royal Roman Military Cuirass under red martyrdom cape",
      mantle: "Vibrant Scarlet Cape (symbol of martyrdom and victory)",
      halo: "Golden circular halo",
    },
    keyAttributes: ["Riding a noble white horse", "Spear crowned with a Coptic cross piercing the defeated dragon", "Palm of martyrdom or cross", "Crown of martyrdom lowered by an angel"],
    copticPromptGuidance: "Saint George riding a white charger horse, wearing Roman soldier armor with red cape, holding long spear topped with Coptic cross piercing the dragon, inscribed 'Ⲡⲓⲁⲅⲓⲟⲥ Ⲅⲉⲱⲣⲅⲓⲟⲥ'",
    byzantinePromptGuidance: "Saint George the Great Martyr on white steed slaying the dragon with spear, golden shield, inscribed 'O AΓIOC ΓEΩPΓIOC'",
    theologicalSignificance: "أمير الشهداء المنتصر على قوى الشر بقوة صليب المخلص.",
  },
  {
    id: "saint-mina",
    arabicName: "الشهيد العظيم مارمينا العجائبي",
    copticName: "ⲀⲂⲂⲀ ⲘⲎⲚⲀ ⲠⲒⲈⲚⲐⲞϢ",
    copticTitleInscription: "Ⲁⲡⲁ Ⲙⲏⲛⲁ",
    category: "martyrs",
    canonicalColors: {
      tunic: "Roman military tunic",
      mantle: "Scarlet Martyrdom Cloak",
      halo: "Pure Gold halo",
    },
    keyAttributes: ["Two kneeling camels on both sides looking upwards", "Hands raised in ancient orant prayer posture or holding cross"],
    copticPromptGuidance: "Saint Mena the Wonderworker standing with hands raised in prayer, flanked by two kneeling camels at his feet, red martyr cape, inscribed 'Ⲁⲡⲁ Ⲙⲏⲛⲁ'",
    byzantinePromptGuidance: "Saint Menas of Egypt with two camels, holding cross of martyrdom, golden aura, inscribed 'O AΓIOC MHNAC'",
    theologicalSignificance: "الشهيد العجائبي حامي صحراء مريوط، شفيع الضيقات والطلبات المستجابة.",
  },

  // 5. الآباء الرهبان
  {
    id: "saint-anthony",
    arabicName: "القديس الأنبا أنطونيوس كوكب البرية وأبو الرهبان",
    copticName: "ⲀⲂⲂⲀ ⲀⲚⲦⲰⲚⲒⲞⲤ ⲠⲒⲚⲒϢϮ",
    copticTitleInscription: "Ⲁⲡⲁ Ⲁⲛⲧⲱⲛⲓⲟⲥ",
    category: "monastics",
    canonicalColors: {
      tunic: "Dark brown monastic tunic and Kolonshawa (hood with 12 crosses)",
      mantle: "Earthy ochre monastic schema mantle",
      halo: "Golden circular halo",
    },
    keyAttributes: ["Monastic cowl/hood (Kolonshawa) with 12 embroidered crosses", "Long flowing silver-white beard", "Holding wooden staff with Coptic cross and monastic leather cross", "Red Sea mountain caves in background"],
    copticPromptGuidance: "Abba Anthony the Great, father of monks, long white beard, wearing Coptic monastic Kolonshawa hood with 12 crosses, holding wooden hand-cross and shepherd staff, desert mountain background, inscribed 'Ⲁⲡⲁ Ⲁⲛⲧⲱⲛⲓⲟⲥ'",
    byzantinePromptGuidance: "Saint Anthony the Great, ascetic monk holding parchment scroll of monastic wisdom, austere solemn look, gold leaf icon, inscribed 'O AΓIOC ANTWNIOC'",
    theologicalSignificance: "أبو جميع الرهبان ومؤسس الحياة النسكية والجهاد الروحي في برية مصر.",
  },
  {
    id: "saint-paul-hermit",
    arabicName: "القديس الأنبا بولا أول السواح",
    copticName: "ⲀⲂⲂⲀ ⲠⲀⲨⲖⲈ ⲠⲒϢⲞⲢⲠ ⲚⲤⲀⲨⲀϨ",
    copticTitleInscription: "Ⲁⲡⲁ Ⲡⲁⲩⲗⲉ",
    category: "monastics",
    canonicalColors: {
      tunic: "Tunic woven of palm leaves",
      mantle: "Natural palm fiber robe",
      halo: "Pure Gold halo",
    },
    keyAttributes: ["Tunic woven from palm tree fiber", "Raven bird bringing a full loaf of bread in beak", "Two lions digging his grave at feet", "Long venerable white beard reaching the ground"],
    copticPromptGuidance: "Saint Paul the First Hermit (Anba Paula), wearing woven palm-leaf tunic, venerable long white beard, black raven holding full loaf of bread above, two lions resting below, inscribed 'Ⲁⲡⲁ Ⲡⲁⲩⲗⲉ'",
    byzantinePromptGuidance: "Saint Paul the Theban First Hermit, palm-tree garment, raven with bread, ascetic desert icon, inscribed 'O AΓIOC ΠAYΛOC'",
    theologicalSignificance: "أول السواح الذي عاش قرابة قرن في البرية متفرغاً للصلاة والاتحاد بالله.",
  },
  {
    id: "saint-abona-faltaus",
    arabicName: "القديس أبونا فلتاؤس السرياني نسر البرية",
    copticName: "ⲀⲂⲂⲀ ⲪⲒⲖⲞⲐⲈⲞⲤ ⲠⲒⲤⲨⲢⲒⲀⲚⲞⲤ",
    copticTitleInscription: "Ⲁⲡⲁ Ⲫⲓⲗⲟⲑⲉⲟⲥ",
    category: "monastics",
    canonicalColors: {
      tunic: "Black Coptic monastic robe and Kolonshawa",
      mantle: "Black/dark monastic shawl",
      halo: "Luminous heavenly golden halo",
    },
    keyAttributes: ["Contemporary Egyptian monk face with loving luminous smile and white beard", "Holding leather Coptic hand-cross and prayer rope (Agbeya / Mesbaha)", "Monastic cell in Syrian Monastery (Deir El-Suryan) in background"],
    copticPromptGuidance: "Abba Faltaus the Syrian (El-Souryani), contemporary Coptic saint monk, smiling luminous peaceful face, silver-white beard, black monastic cowl with crosses, holding prayer rope and wooden cross, inscribed 'Ⲁⲡⲁ Ⲫⲓⲗⲟⲑⲉⲟⲥ'",
    byzantinePromptGuidance: "Saint Faltaus the Syrian, modern Orthodox hermit monk, radiant compassionate eyes, black monastic garb, holding cross, golden aura background, inscribed 'Ⲁⲡⲁ Ⲫⲓⲗⲟⲑⲉⲟⲥ'",
    theologicalSignificance: "الراهب الصامت المحب، نسر برية شيهيت وشفيع المحتاجين والمتألمين في عصرنا المعاصر.",
  },

  // 6. رؤساء الملائكة
  {
    id: "archangel-michael",
    arabicName: "رئيس الملائكة الجليل ميخائيل",
    copticName: "ⲠⲒⲀⲢⲬⲀⲄⲄⲈⲖⲞⲤ ⲘⲒⲬⲀⲎⲖ",
    copticTitleInscription: "ⲠⲒⲁⲣⲭⲁⲅⲅⲉⲗⲟⲥ Ⲙⲓⲭⲁⲏⲗ",
    category: "archangels",
    canonicalColors: {
      tunic: "Royal Purple or Golden Diaconate Alb",
      mantle: "Brilliant Turquoise / Royal Blue Cape",
      halo: "Radiant Sun-Gold halo with headband",
    },
    keyAttributes: ["Holding fiery sword of truth or spear", "Holding scale of justice in left hand", "Grand luminous angelic wings with detailed golden feathers"],
    copticPromptGuidance: "Archangel Michael in ornate deacon liturgical vestments with large colorful patterned wings, holding drawn sword of light and scales of balance, inscribed 'Ⲙⲓⲭⲁⲏⲗ'",
    byzantinePromptGuidance: "Holy Archangel Michael, Byzantine military court dress, holding sword and orb of Christ, imposing majestic wings, inscribed 'O APX MIΧAHΛ'",
    theologicalSignificance: "رئيس الجند السماوي والمشفع في مياه النيل وثمار الأرض.",
  },
  {
    id: "archangel-gabriel",
    arabicName: "رئيس الملائكة الجليل غبريال المبشر",
    copticName: "ⲠⲒⲀⲢⲬⲀⲄⲄⲈⲖⲞⲤ ⲄⲀⲂⲢⲒⲎⲖ",
    copticTitleInscription: "ⲠⲒⲁⲣⲭⲁⲅⲅⲉⲗⲟⲥ ⲄⲁⲂⲢⲒⲎⲖ",
    category: "archangels",
    canonicalColors: {
      tunic: "Pure Luminous White with Gold Trimmings",
      mantle: "Celestial Azure Blue Cape",
      halo: "Glistening Gold halo",
    },
    keyAttributes: ["Holding white lily flower or scroll of the Annunciation", "Holding lantern of light in right hand", "Luminous majestic wings"],
    copticPromptGuidance: "Archangel Gabriel holding white lily blossom and proclamation scroll, celestial blue and white robes, beautiful luminous wings, inscribed 'ⲄⲁⲂⲢⲒⲎⲖ'",
    byzantinePromptGuidance: "Archangel Gabriel of the Annunciation, Byzantine icon, holding herald staff and lily, inscribed 'O APX ΓABPIHΛ'",
    theologicalSignificance: "مبشر البشرية بالخلاص وتجسد ابن الله في بطن السيدة العذراء.",
  },
];

/**
 * Finds saint definition by query or returns default coptic icon template
 */
export function lookupSaintIcon(query: string): SaintIconDefinition | null {
  const normalized = query.trim().toLowerCase();
  for (const s of COPTIC_SAINTS_REGISTRY) {
    if (
      normalized.includes(s.id) ||
      normalized.includes(s.arabicName.toLowerCase()) ||
      s.arabicName.split(" ").some((w) => w.length > 3 && normalized.includes(w.toLowerCase()))
    ) {
      return s;
    }
  }
  return null;
}
