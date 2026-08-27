import { TasbehaDocument } from '../types';

export const kiahkTasbeha: TasbehaDocument = {
  id: 'kiahk',
  slug: 'kiahk-praises',
  title: {
    arabic: 'تسبحة كيهك الكيهكية (شهر التسابيح)',
    coptic: 'Ⲡⲓⲧⲱϣ ⲛ̀ⲧⲉ Ⲭⲟⲓⲁⲕ',
    english: 'Kiahk Praises (Month of Praises & Nativity Fast)'
  },
  subtitle: 'المدائح الكيهكية السبعة، وإبصاليات الهوسات، والذكصولوجيات المبهجة المخصصة لوالدة الإله',
  description: 'تتميز تسبحة شهر كيهك بطقسها البهيج وألحانها المديدة وتأملاتها العميقة في سر التجسد الإلهي ورموز العذراء مريم في العهد القديم.',
  iconName: 'sparkles',
  accentColor: 'from-amber-700 to-rose-950',
  groups: [
    {
      id: 'kiahk-special-group',
      title: {
        arabic: 'مدائح وثيؤطوكيات شهر كيهك',
        coptic: 'Ⲛⲓⲑⲉⲟ̀ⲧⲟⲕⲓⲁ ⲛ̀ⲧⲉ Ⲭⲟⲓⲁⲕ',
        english: 'Kiahk Theotokias & Praises'
      },
      badge: 'السبعة والسبعة وكيهك',
      sections: [
        {
          id: 'kiahk-bush-hymn',
          title: { arabic: 'مديح العليقة (العليقة التي رآها موسى النبي)', coptic: 'Ⲡⲓⲃⲁⲧⲟⲥ', english: 'The Burning Bush (Pi-Batos)' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'العليقة التي رآها موسى النبي في البرية، والنار تلتهب فيها ولم تحترق أغصانها، هي مثال مريم العذراء غير الدنسة، التي أتى وتجسد منها كلمة الآب.',
              coptic: 'Ⲡⲓⲃⲁⲧⲟⲥ ⲉ̀ⲧⲁ Ⲙⲱⲩ̀ⲥⲏⲥ ⲛⲁⲩ ⲉ̀ⲣⲟϥ ϩⲓ ⲡ̀ϣⲁϥⲉ: ⲡⲓⲭ̀ⲣⲱⲙ ⲉ̀ⲛⲁϥⲙⲟϩ ⲛ̀ϧⲏⲧϥ ⲟⲩⲟϩ ⲙ̀ⲡⲉ ⲛⲉϥϫⲁⲗ ⲣⲱⲕϩ: ⲡⲉ ⲡ̀ⲧⲩⲡⲟⲥ ⲛ̀Ⲙⲁⲣⲓⲁ ϯⲠⲁⲣⲑⲉⲛⲟⲥ ⲛ̀ⲁⲧⲑⲱⲗⲉⲃ: ⲑⲏⲉ̀ⲧⲁ ⲡⲓⲖⲟⲅⲟⲥ ⲛ̀ⲧⲉ Ⲫ̀ⲓⲱⲧ ⲓ̀ ⲁϥϭⲓⲥⲁⲣⲝ ⲉ̀ⲃⲟⲗ ⲛ̀ϧⲏⲧⲥ.',
              coptic_arabic: 'بي باتوس إيطا مويسيس ناف إيروف هي إبشافي: بي إكروم إيناف موه إنخيتف أووه إمبي نيف جال روكح: بي إبتيبوس إن ماريا تي بارثينوس إن أت ثوليب: ثي إيطا بي لوغوس إنتي إفيوت إي أف تشي ساركس إيفول إنخيتس.',
              english: 'The burning bush that Moses saw in the wilderness, the fire was blazing in it and its branches were not consumed; it is a figure of Mary the undefiled Virgin.'
            }
          ]
        },
        {
          id: 'kiahk-arise-hymn',
          title: { arabic: 'إبصالية قوموا يا بني النور الكيهكية (تين ثينو الكيهكي)', english: 'Kiahk Ten Thino' },
          speaker: 'people',
          type: 'psali',
          verses: [
            {
              arabic: 'قوموا يا بني النور، لنسبح رب القوات.. لأن النور الحقيقي قد أشرق وأضاء للمؤمنين.',
              coptic: 'Ⲧⲉⲛⲑⲏⲛⲟⲩ ⲉ̀ⲡ̀ϣⲱⲓ ⲛⲓϣⲏⲣⲓ ⲛ̀ⲧⲉ ⲡⲓⲟⲩⲱⲓⲛⲓ: ⲛ̀ⲧⲉⲛϩⲱⲥ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ.',
              coptic_arabic: 'تين ثينو إي إبشوي ني شيري إنتي بي أو أويني: إنتين هوس إي إبشويس إنتي ني جوم.',
              english: 'Arise O children of the light, let us sing to the Lord of hosts, for the true Light has shone upon all believers.'
            }
          ]
        }
      ]
    }
  ]
};
