import { TasbehaDocument } from '../types';

export const matinsTasbeha: TasbehaDocument = {
  id: 'matins',
  slug: 'matins-praises',
  title: {
    arabic: 'تسبحة باكر الصباحية',
    coptic: 'Ⲡⲓⲧⲱϣ ⲛ̀ⲧⲉ ⲡⲓϣⲱⲡ',
    english: 'Matins Praises'
  },
  subtitle: 'تسابيح الصباح المبهجة واستقبال نور المسيح قبل القداس الإلهي',
  description: 'تتلى تسبحة باكر مع بزوغ الصباح قبل صلاة رفع بخور باكر، وتمتلئ بالطلب لشروق شمس البر في القلوب والنفوس.',
  iconName: 'sun',
  accentColor: 'from-amber-600 to-yellow-950',
  groups: [
    {
      id: 'matins-main-group',
      title: {
        arabic: 'تسبحة شروق الصباح',
        coptic: 'Ⲡⲓϩⲱⲥ ⲛ̀ϣⲱⲡ',
        english: 'Morning Praise'
      },
      badge: 'الصباح والنور',
      sections: [
        {
          id: 'matins-doxology-light',
          title: { arabic: 'ذكصولوجية باكر (أيها النور الحقيقي)', coptic: 'Ⲡⲓⲟⲩⲱⲓⲛⲓ ⲛ̀ⲧⲁⲫ̀ⲙⲏⲓ', english: 'Doxology of the True Light' },
          speaker: 'people',
          type: 'doxology',
          verses: [
            {
              arabic: 'أيها النور الحقيقي الذي يضيء لكل إنسان آت إلى العالم، أتيت إلى العالم بمحبتك للبشر، وكل الخليقة تهللت بقدومك.',
              coptic: 'Ⲡⲓⲟⲩⲱⲓⲛⲓ ⲛ̀ⲧⲁⲫ̀ⲙⲏⲓ ⲫⲏⲉⲧⲉⲣⲟⲩⲱⲓⲛⲓ ⲉ̀ⲣⲱⲙⲓ ⲛⲓⲃⲉⲛ ⲉⲑⲛⲏⲟⲩ ⲉ̀ⲡⲓⲕⲟⲥⲙⲟⲥ: ⲁⲕⲓ̀ ⲉ̀ⲡⲓⲕⲟⲥⲙⲟⲥ ϧⲉⲛ ⲧⲉⲕⲙⲉⲧⲙⲁⲓⲣⲱⲙⲓ: ⲟⲩⲟϩ ⲡⲓⲥⲱⲛⲧ ⲧⲏⲣϥ ⲁϥⲑⲉⲗⲏⲗ ϧⲉⲛ ⲡⲉⲕϫⲓⲛⲓ̀.',
              coptic_arabic: 'بي أو أويني إن تاف مي في إت إير أو أويني إيرومي نيفين إثني أو إيبي كوزموس: أك إي إيبي كوزموس خين تيك ميت ماي رومي: أووه بي سونت تيرف أف ثيليل خين بيك جين إي.',
              english: 'O the true Light that enlightens every man coming into the world, You came into the world through Your love for mankind, and all creation rejoiced at Your coming.'
            }
          ]
        },
        {
          id: 'matins-cymbals-verses',
          title: { arabic: 'أرباع الناقوس الصباحية', coptic: 'Ⲛⲓⲧⲱⲧ ⲛ̀ϣⲱⲡ', english: 'Morning Verses of Cymbals' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'مبارك الآب والابن والروح القدس، الثالوث الكامل، نسجد له ونمجده.',
              coptic: 'Ϥ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ ⲛ̀ϫⲉ Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀Ϣⲏⲣⲓ ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ: ϯ̀Ⲧ̀ⲣⲓⲁⲥ ⲉⲧϫⲏⲕ ⲉ̀ⲃⲟⲗ: ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀ⲙⲟⲥ ⲧⲉⲛϯⲱ̀ⲟⲩ ⲛⲁⲥ.',
              coptic_arabic: 'إف إسمارؤوت إنجي إفيوت نيم إبشيري نيم بي ابنفما إثؤواب: تي إترياس إتجيك إيفول: تين أوأوشت إمموس تين تي أو أو ناس.',
              english: 'Blessed is the Father, the Son, and the Holy Spirit, the perfect Trinity: we worship Him and glorify Him.'
            }
          ]
        }
      ]
    }
  ]
};
