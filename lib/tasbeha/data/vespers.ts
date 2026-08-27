import { TasbehaDocument } from '../types';

export const vespersTasbeha: TasbehaDocument = {
  id: 'vespers',
  slug: 'vespers-praises',
  title: {
    arabic: 'تسبحة العشية',
    coptic: 'Ⲡⲓⲧⲱϣ ⲛ̀ⲧⲉ ⲡⲓⲣⲟⲩϩⲓ',
    english: 'Vespers Praises'
  },
  subtitle: 'صلوات وتسابيح المساء وأرباع الناقوس وذكصولوجيات العشية المباركة',
  description: 'تتلى صلاة تسبحة العشية قبل رفع بخور العشية، وتحتوي على الهوس الرابع وإبصاليات وثيؤطوكية اليوم وذكصولوجيات المساء.',
  iconName: 'sunset',
  accentColor: 'from-orange-800 to-amber-950',
  groups: [
    {
      id: 'vespers-main-group',
      title: {
        arabic: 'تسبحة المساء والهوس الرابع',
        coptic: 'Ⲡⲓϩⲱⲥ ⲇ̅ ⲛ̀ⲧⲉ ⲡⲓⲣⲟⲩϩⲓ',
        english: 'Evening Praises & Fourth Hoos'
      },
      badge: 'المساء والغروب',
      sections: [
        {
          id: 'vespers-cymbals-verses',
          title: { arabic: 'أرباع الناقوس المسائية', coptic: 'Ⲛⲓⲧⲱⲧ ⲛ̀ⲧⲉ ⲡⲓⲕⲩⲙⲃⲁⲗⲟⲛ', english: 'Verses of the Cymbals' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'نسجد للآب والابن والروح القدس، الثالوث القدوس المساوي في الجوهر.',
              coptic: 'Ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀Ϣⲏⲣⲓ ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ: ϯ̀Ⲧ̀ⲣⲓⲁⲥ Ⲉⲑⲟⲩⲁⲃ ⲛ̀ⲟ̀ⲙⲟⲟⲩⲥⲓⲟⲥ.',
              coptic_arabic: 'تين أوأوشت إم إفيوت نيم إبشيري نيم بي ابنفما إثؤواب: تي إترياس إثؤواب إن أوموأوسيوس.',
              english: 'We worship the Father, the Son, and the Holy Spirit: the Holy and Co-essential Trinity.'
            }
          ]
        },
        {
          id: 'vespers-doxologies',
          title: { arabic: 'ذكصولوجيات العشية للشهداء والقديسين', coptic: 'Ⲛⲓⲇⲟⲝⲟⲗⲟⲅⲓⲁ ⲛ̀ⲣⲟⲩϩⲓ', english: 'Evening Doxologies' },
          speaker: 'people',
          type: 'doxology',
          verses: [
            {
              arabic: 'السلام لميخائيل رئيس الملائكة العظيم، السلام لغبريال الملاك المبشر المفرح.',
              coptic: 'Ⲭⲉⲣⲉ ⲛⲁⲕ ⲱ̀ Ⲙⲓⲭⲁⲏⲗ: ⲡⲓⲛⲓϣϯ ⲛ̀ⲁⲣⲭⲏⲁⲅⲅⲉⲗⲟⲥ: ⲭⲉⲣⲉ Ⲅⲁⲃⲣⲓⲏⲗ: ⲡⲓⲁⲅⲅⲉⲗⲟⲥ ⲛ̀ⲣⲉϥϩⲓϣⲉⲛⲛⲟⲩϥⲓ.',
              coptic_arabic: 'شيري ناك أو ميخائيل: بي نيشتي إن أرشي أنجيلوس: شيري غابرييل: بي أنجيلوس إن ريف هيشين نوفي.',
              english: 'Hail to you, O Michael, the great archangel; hail to Gabriel, the joyful messenger angel.'
            }
          ]
        }
      ]
    }
  ]
};
