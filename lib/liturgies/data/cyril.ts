import { LiturgyDocument } from '../types';

export const cyrilLiturgy: LiturgyDocument = {
  id: 'cyril',
  slug: 'st-cyril',
  title: {
    arabic: 'القداس الكيرلسي للقديس كيرلس عمود الدين',
    coptic: 'Ⲡⲓⲁ̀ⲛⲁⲫⲟⲣⲁ ⲛ̀ⲧⲉ ⲡⲓⲁⲅⲓⲟⲥ Ⲕⲩⲣⲓⲗⲗⲟⲥ',
    english: 'The Liturgy of Saint Cyril (The Markan Liturgy)'
  },
  subtitle: 'القداس المرقسي الأصل - صيغ بروح القديس مرقس الرسول ورتبه البابا كيرلس الأول',
  description: 'يتميز بأواشيه الطويلة البديعة والطلبات العميقة لسلام العالم، ومياه الأنهار والزروع، والمسافرين، والراقدين.',
  iconName: 'church',
  accentColor: 'from-indigo-800 to-purple-950',
  groups: [
    {
      id: 'cyril-reconciliation',
      title: {
        arabic: 'صلاة الصلح الكيرلسية',
        coptic: 'Ⲧⲉⲩⲭⲏ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ ⲛ̀Ⲕⲩⲣⲓⲗⲗⲟⲥ',
        english: 'Prayer of Reconciliation'
      },
      badge: 'رئيس السلام وملك الدهور',
      sections: [
        {
          id: 'cyril-peace-priest',
          title: { arabic: 'يا رئيس الحياة وملك الدهور', coptic: 'Ⲡⲓⲁⲣⲭⲏⲅⲟⲥ ⲛ̀ⲧⲉ ⲡⲱⲛϧ', english: 'O Prince of Life and King of the Ages' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'يا رئيس الحياة وملك الدهور، يسوع المسيح ربنا، الكلمة الذي بلا ابتداء، أرسل روحك القدوس على هذه القرابين الموضوعة.',
              coptic: 'Ⲡⲓⲁⲣⲭⲏⲅⲟⲥ ⲛ̀ⲧⲉ ⲡⲱⲛϧ: ⲟⲩⲟϩ Ⲡ̀ⲟⲩⲣⲟ ⲛ̀ⲧⲉ ⲛⲓⲉ̀ⲛⲉϩ: Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ Ⲡⲉⲛϭⲟⲓⲥ: ⲡⲓⲖⲟⲅⲟⲥ ⲛ̀ⲁⲧⲁⲣⲭⲏ: ⲟⲩⲱⲣⲡ ⲙ̀Ⲡⲉⲕⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ ⲉ̀ϫⲉⲛ ⲛⲁⲓⲇⲱⲣⲟⲛ.',
              coptic_arabic: 'بي أرشيغوس إنتي بؤنخ: أووه إب أورو إنتي ني إينيه: إيسوس بيخرستوس بينشويس: بي لوغوس إن أت أرشي: أوأورب إمبيك ابنفما إثؤواب إيجين ناي ذورون.',
              english: 'O Prince of Life and King of the Ages, Jesus Christ our Lord, the Word without beginning, send Your Holy Spirit upon these gifts set forth.'
            }
          ]
        }
      ]
    },
    {
      id: 'cyril-litanies',
      title: {
        arabic: 'الأواشي الكيرلسية الكبرى',
        coptic: 'Ⲛⲓⲉⲩⲭⲏ ⲉⲧⲛⲏϣϯ',
        english: 'The Great Cyrillian Litanies'
      },
      badge: 'أواشي الطبيعة والمسافرين والأنهار',
      sections: [
        {
          id: 'cyril-waters-crops',
          title: { arabic: 'أوشية مياه الأنهار والزروع والثمار', coptic: 'Ⲧⲉⲩⲭⲏ ⲛ̀ⲛⲓⲙⲱⲟⲩ', english: 'Litany of the Waters and Crops' },
          speaker: 'priest',
          type: 'litany',
          verses: [
            {
              arabic: 'مياه النهر باركها في هذا العام واصعدها كمقاديرها، فرّح وجه الأرض، وليعول حرثها ولتكثر أثمارها.',
              coptic: 'Ⲛⲓⲙⲱⲟⲩ ⲛ̀ⲧⲉ ⲫ̀ⲓⲁⲣⲟ ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲱⲟⲩ ϧⲉⲛ ⲡⲁⲓⲣⲟⲙⲡⲓ ⲑⲁⲓ: ⲙⲁⲧⲥⲉⲗⲥⲩⲗ ⲡ̀ϩⲟ ⲙ̀ⲡ̀ⲕⲁϩⲓ: ⲙⲁⲣⲉ ⲛⲉϥⲧⲉⲗⲉⲙ ⲥⲟⲩⲉⲛ ⲟⲩⲱⲧⲉⲃ.',
              coptic_arabic: 'ني مو أو إنتي إفيارو إسمو إيرو أو خين باي رومبي ثاي: ماتسيلسيل إبهو إمبيكاهي: مارى نيف تيليم سوين أوأوتيب.',
              english: 'Bless the waters of the river in this present year, and bring them up according to their measure; gladden the face of the earth.'
            }
          ]
        },
        {
          id: 'cyril-people-response',
          title: { arabic: 'مرد الشعب - كيرياليسون ثلاثاً', english: 'People: Lord have mercy thrice' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'يا رب ارحم، يا رب ارحم، يا رب بارك. آمين.',
              coptic: 'Ⲕⲩⲣⲓⲉ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ: Ⲕⲩⲣⲓⲉ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ: Ⲕⲩⲣⲓⲉ ⲉⲩⲗⲟⲅⲏⲥⲟⲛ. Ⲁ̀ⲙⲏⲛ.',
              coptic_arabic: 'كيريى إيليسون: كيريى إيليسون: كيريى إفلوجيسون. آمين.',
              english: 'Lord have mercy, Lord have mercy, Lord bless us. Amen.'
            }
          ]
        }
      ]
    }
  ]
};
