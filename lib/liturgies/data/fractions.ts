import { LiturgyDocument } from '../types';

export const fractionsLiturgy: LiturgyDocument = {
  id: 'fractions',
  slug: 'fractions',
  title: {
    arabic: 'صلوات القسمة المقدسة',
    coptic: 'Ⲛⲓⲉⲩⲭⲏ ⲛ̀ⲧⲉ ⲡⲓⲫⲱϣ',
    english: 'The Holy Fractions'
  },
  subtitle: 'صلوات كسر الجسد المقدس والتأمل في سر الفداء والآلام والقيامة',
  description: 'تتلى صلوات القسمة أثناء تجزئة الجسد المقدس على الصينية، وتختلف بحسب المناسبات والأعياد والأصوام.',
  iconName: 'sparkles',
  accentColor: 'from-rose-800 to-red-950',
  groups: [
    {
      id: 'annual-fractions',
      title: {
        arabic: 'القسم السنوية',
        coptic: 'Ⲛⲓⲫⲱϣ ⲛ̀ϣⲉⲛⲁⲩ',
        english: 'Annual Fractions'
      },
      badge: 'السنوي والعام',
      sections: [
        {
          id: 'fraction-father-annual',
          title: { arabic: 'قسمة سنوية للآب (أيها السيد الرب إلهنا)', coptic: 'Ⲫ̀ⲛⲏⲃ Ⲡ̀ϭⲟⲓⲥ Ⲡⲉⲛⲛⲟⲩϯ', english: 'Annual Fraction to the Father' },
          speaker: 'priest',
          type: 'fraction',
          rubric: { arabic: 'يقسم الكاهن الجسد المقدس إلى اثني عشر جزءاً والاسباديقون في الوسط' },
          verses: [
            {
              arabic: 'أيها السيد الرب إلهنا، الضابط الكل، صانع الكل، نسجد لك ونطلب إليك ونشكرك.. يا من أحببتنا حتى بذلت ابنك الوحيد من أجل خلاصنا.',
              coptic: 'Ⲫ̀ⲛⲏⲃ Ⲡ̀ϭⲟⲓⲥ Ⲡⲉⲛⲛⲟⲩϯ: ⲡⲓⲠⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ: ⲡⲓⲇⲩⲙⲓⲟⲩⲣⲅⲟⲥ ⲛ̀ⲧⲉ ⲡⲧⲏⲣϥ: ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀ⲙⲟⲕ: ⲧⲉⲛⲧⲱⲃϩ ⲙ̀ⲙⲟⲕ: ⲧⲉⲛϣⲉⲡϩⲙⲟⲧ ⲛ̀ⲧⲟⲧⲕ.',
              coptic_arabic: 'إفنيف إبشويس بينوتي: بي بانتوكراتور: بي ذيمي أورغوس إنتي إبتيرف: تين أوأوشت إمموك: تين طوبه إمموك: تين شيبهوت إنتوتك.',
              english: 'O Master, Lord our God, the Almighty, the Maker of all, we worship You, we entreat You, and we give thanks to You.'
            }
          ]
        },
        {
          id: 'fraction-son-annual',
          title: { arabic: 'قسمة سنوية للابن (أيها الابن الوحيد)', coptic: 'Ⲡⲓⲙⲟⲛⲟⲅⲉⲛⲏⲥ ⲛ̀Ϣⲏⲣⲓ', english: 'Annual Fraction to the Son' },
          speaker: 'priest',
          type: 'fraction',
          verses: [
            {
              arabic: 'أيها الابن الوحيد الجنس، كلمة الله، الذي نزل من السماء لخلاصنا وتجسد من الروح القدس ومن القديسة مريم العذراء.. هب لنا نقاوة النفس والجسد.',
              coptic: 'Ⲡⲓⲙⲟⲛⲟⲅⲉⲛⲏⲥ ⲛ̀Ϣⲏⲣⲓ ⲡⲓⲖⲟⲅⲟⲥ ⲛ̀ⲧⲉ Ⲫ̀ⲛⲟⲩϯ: ⲫⲏⲉ̀ⲧⲁϥⲓ̀ ⲉ̀ⲡⲉⲥⲏⲧ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲧ̀ⲫⲉ ⲉⲑⲃⲉ ⲡⲉⲛⲟⲩϫⲁⲓ: ⲁϥϭⲓⲥⲁⲣⲝ ⲉ̀ⲃⲟⲗ ϧⲉⲛ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ ⲛⲉⲙ ϯⲁⲅⲓⲁ Ⲙⲁⲣⲓⲁ ϯⲠⲁⲣⲑⲉⲛⲟⲥ.',
              coptic_arabic: 'بي مونوجينيس إن شيري بي لوغوس إنتي إفنوتي: في إيطاف إي إيبيسيت إيفول خين إتفي إثفي بين أوجاي: أف تشي ساركس إيفول خين بي ابنفما إثؤواب نيم تي أجيّا ماريا تي بارثينوس.',
              english: 'O Only-begotten Son, the Word of God, who came down from heaven for our salvation, and was incarnate of the Holy Spirit and of the Holy Virgin Saint Mary.'
            }
          ]
        }
      ]
    },
    {
      id: 'fasts-feasts-fractions',
      title: {
        arabic: 'قسم الأصوام والأعياد',
        coptic: 'Ⲛⲓⲫⲱϣ ⲛ̀ⲧⲉ ⲛⲓⲛⲏⲥⲧⲓⲁ',
        english: 'Feasts and Fasts Fractions'
      },
      badge: 'الصوم الكبير والقيامة',
      sections: [
        {
          id: 'fraction-great-lent',
          title: { arabic: 'قسمة الصوم الكبير (صام عنا مخلصنا)', coptic: 'Ⲁϥⲉⲣⲛⲏⲥⲧⲉⲩⲓⲛ ⲉ̀ϩ̀ⲣⲏⲓ ⲉ̀ϫⲱⲛ', english: 'Great Lent Fraction' },
          speaker: 'priest',
          type: 'fraction',
          verses: [
            {
              arabic: 'صام عنا مخلصنا أربعين يوماً وأربعين ليلة ليعلمنا كيف نغلب الأعداء الشياطين ونقهر الشهوات بالصلاة والصوم والدموع النقية.',
              coptic: 'Ⲁϥⲉⲣⲛⲏⲥⲧⲉⲩⲓⲛ ⲉ̀ϩ̀ⲣⲏⲓ ⲉ̀ϫⲱⲛ ⲛ̀ϫⲉ Ⲡⲉⲛⲥⲱⲧⲏⲣ ⲛ̀ϩ̀ⲙⲉ ⲛ̀ⲉ̀ϩⲟⲟⲩ ⲛⲉⲙ ϩ̀ⲙⲉ ⲛ̀ⲉ̀ϫⲱⲣϩ: ⲉ̀ⲡϫⲓⲛⲧⲉϥⲧ̀ⲥⲁⲃⲟⲛ ⲉ̀ⲡⲓϭⲣⲟ ⲉ̀ϫⲉⲛ ⲛⲓϫⲁϫⲓ.',
              coptic_arabic: 'أف إير نيستيفين إيهري إيجون إنجي بين سوتير إنهيم إي إيهو أو نيم هيم إي إيجوره: إبجين تيف تسافون إيبي تشرو إيجين ني جاجي.',
              english: 'Our Savior fasted for us forty days and forty nights to teach us how to overcome the spiritual enemy by prayer and fasting.'
            }
          ]
        }
      ]
    }
  ]
};
