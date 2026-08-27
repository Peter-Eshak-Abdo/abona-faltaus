import { LiturgyDocument } from '../types';

export const distributionLiturgy: LiturgyDocument = {
  id: 'distribution',
  slug: 'distribution',
  title: {
    arabic: 'التوزيع السنوي وألحان التناول',
    coptic: 'Ⲡⲓⲧⲱϣ ⲛ̀ⲧⲉ ϯⲙⲉⲧⲁⲗⲏⲙⲯⲓⲥ',
    english: 'The Holy Communion & Distribution'
  },
  subtitle: 'تسبحة مزمور 150 والألحان المعزية أثناء تناول الأسرار الإلهية',
  description: 'ترتل هذه التسابيح والألحان أثناء توزيع الأسرار المقدسة (الجسد والدم الطاهرين)، لتمجيد الله وطلب مراحمه.',
  iconName: 'music',
  accentColor: 'from-blue-700 to-indigo-950',
  groups: [
    {
      id: 'psalm-150-group',
      title: {
        arabic: 'مزمور 150 (سبحوا الله)',
        coptic: 'Ⲯⲁⲗⲙⲟⲥ ⲣⲛ',
        english: 'Psalm 150 (Smou Efnouti)'
      },
      badge: 'لحن التوزيع الأساسي',
      sections: [
        {
          id: 'psalm-150-full',
          title: { arabic: 'مزمور 150 السنوي', coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀Ⲫ̀ⲛⲟⲩϯ', english: 'Psalm 150' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'سبحوا الله في جميع قديسيه. هلليلويا.',
              coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀Ⲫ̀ⲛⲟⲩϯ ϧⲉⲛ ⲛⲏⲉⲑⲟⲩⲁⲃ ⲧⲏⲣⲟⲩ ⲛ̀ⲧⲁϥ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ.',
              coptic_arabic: 'إسمو إي إفنوتي خين ني إثؤواب تيرو إنتاف: الليلويا.',
              english: 'Praise God in all His saints. Alleluia.'
            },
            {
              arabic: 'سبحوه في فلك قوته. هلليلويا.',
              coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ ϧⲉⲛ ⲡⲓⲧⲁϫⲣⲟ ⲛ̀ⲧⲉ ⲧⲉϥϫⲟⲙ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ.',
              coptic_arabic: 'إسمو إيروف خين بي تاجرو إنتي تيف جوم: الليلويا.',
              english: 'Praise Him in the firmament of His power. Alleluia.'
            },
            {
              arabic: 'سبحوه على مقدرته. هلليلويا.',
              coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ ⲉ̀ϩ̀ⲣⲏⲓ ⲉ̀ϫⲉⲛ ⲧⲉϥⲙⲉⲧϫⲱⲣⲓ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ.',
              coptic_arabic: 'إسمو إيروف إيهري إيجين تيف ميتجوري: الليلويا.',
              english: 'Praise Him for His mighty acts. Alleluia.'
            },
            {
              arabic: 'سبحوه ككثرة عظمته. هلليلويا.',
              coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ ⲕⲁⲧⲁ ⲡ̀ⲁ̀ϣⲁⲓ ⲛ̀ⲧⲉ ⲧⲉϥⲙⲉⲧⲛⲓϣϯ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ.',
              coptic_arabic: 'إسمو إيروف كاطا إب آشاى إنتي تيف ميتنيشتي: الليلويا.',
              english: 'Praise Him according to His excellent greatness. Alleluia.'
            },
            {
              arabic: 'كل نسمة فلتسبح اسم الرب إلهنا. هلليلويا.',
              coptic: 'Ⲛⲓϥⲓ ⲛⲓⲃⲉⲛ ⲙⲁⲣⲟⲩⲥ̀ⲙⲟⲩ ⲉ̀ⲫ̀ⲣⲁⲛ ⲙ̀Ⲡ̀ϭⲟⲓⲥ Ⲡⲉⲛⲛⲟⲩϯ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ.',
              coptic_arabic: 'نيفي نيفين مارو إسمو إي إفران إمبشويس بينوتي: الليلويا.',
              english: 'Let everything that has breath praise the name of the Lord our God. Alleluia.'
            }
          ]
        },
        {
          id: 'pi-oik-hymn',
          title: { arabic: 'لحن بي أويك (خبز الحياة)', coptic: 'Ⲡⲓⲱⲓⲕ ⲛ̀ⲧⲉ ⲡ̀ⲱⲛϧ', english: 'Pi-Oik (Bread of Life)' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'خبز الحياة الذي نزل من السماء، وهب الحياة للعالم.',
              coptic: 'Ⲡⲓⲱⲓⲕ ⲛ̀ⲧⲉ ⲡ̀ⲱⲛϧ: ⲉ̀ⲧⲁϥⲓ̀ ⲉ̀ⲡⲉⲥⲏⲧ ⲛⲁⲛ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲧ̀ⲫⲉ: ⲁϥϯ ⲙ̀ⲡ̀ⲱⲛϧ ⲙ̀ⲡⲓⲕⲟⲥⲙⲟⲥ.',
              coptic_arabic: 'بي أويك إنتي إب أونخ: إيطاف إي إيبيسيت نان إيفول خين إتفي: أف تي إمبؤنخ إمبي كوزموس.',
              english: 'The Bread of Life that came down to us from heaven, has given life to the world.'
            },
            {
              arabic: 'وأنت أيضاً يا مريم حملتِ في بطنك المن العقلي الذي أتى من الآب.',
              coptic: 'Ⲛ̀ⲑⲟ ϩⲱⲓ Ⲙⲁⲣⲓⲁ: ⲁ̀ⲣⲉϥⲁⲓ ϧⲉⲛ ⲧⲉⲛⲉϫⲓ: ⲙ̀ⲡⲓⲙⲁⲛⲛⲁ ⲛ̀ⲛⲟⲏⲧⲟⲛ: ⲉ̀ⲧⲁϥⲓ̀ ⲉ̀ⲃⲟⲗ ϧⲉⲛ Ⲫ̀ⲓⲱⲧ.',
              coptic_arabic: 'إنثو هوي ماريا: آريفاي خين تينيجي: إمبي ماننا إن نو إيطون: إيطاف إي إيفول خين إفيوت.',
              english: 'You too, O Mary, carried in your womb the rational Manna that came from the Father.'
            }
          ]
        },
        {
          id: 'ek-smaro-out',
          title: { arabic: 'لحن إك إسمارؤوت آليثوس', coptic: 'Ⲕ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ ⲁ̀ⲗⲏⲑⲱⲥ', english: 'Ek-Smaro-out Alithos' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'مبارك أنت بالحقيقة، مع أبيك الصالح والروح القدس، لأنك أتيت وخلصتنا. آمين هلليلويا.',
              coptic: 'Ⲕ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ ⲁ̀ⲗⲏⲑⲱⲥ: ⲛⲉⲙ Ⲡⲉⲕⲓⲱⲧ ⲛ̀ⲁ̀ⲅⲁⲑⲟⲥ: ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ: ϫⲉ ⲁⲕⲓ̀ ⲁⲕⲥⲱϯ ⲙ̀ⲙⲟⲛ: Ⲁ̀ⲙⲏⲛ Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ.',
              coptic_arabic: 'إك إسمارؤوت آليثوس: نيم بيكيوت إن آغاثوس: نيم بي ابنفما إثؤواب: جي أك إي أك سوتي إممون: آمين الليلويا.',
              english: 'Blessed are You truly, with Your good Father and the Holy Spirit, for You came and saved us. Amen Alleluia.'
            }
          ]
        }
      ]
    }
  ]
};
