import { LiturgyDocument } from '../types';

export const gregoryLiturgy: LiturgyDocument = {
  id: 'gregory',
  slug: 'st-gregory',
  title: {
    arabic: 'القداس الغريغوري للقديس غريغوريوس اللاهوتي',
    coptic: 'Ⲡⲓⲁ̀ⲛⲁⲫⲟⲣⲁ ⲛ̀ⲧⲉ ⲡⲓⲁⲅⲓⲟⲥ Ⲅⲣⲏⲅⲟⲣⲓⲟⲥ',
    english: 'The Liturgy of Saint Gregory the Theologian'
  },
  subtitle: 'يتميز بالحديث المباشر مع الابن الكلمة المتجسد والتأمل في محبته الفائقة للبشر',
  description: 'يُصلّى به غالباً في الأعياد السيدية والمناسبات الخلاصية الكبرى، وهو مشحون بالمشاعر الإلهية والتأملات اللاهوتية العميقة.',
  iconName: 'church',
  accentColor: 'from-emerald-700 to-teal-950',
  groups: [
    {
      id: 'gregory-reconciliation',
      title: {
        arabic: 'صلاة الصلح الغريغورية',
        coptic: 'Ⲧⲉⲩⲭⲏ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ',
        english: 'Prayer of Reconciliation'
      },
      badge: 'الصلح والصفح والسلام',
      sections: [
        {
          id: 'gregory-peace-priest',
          title: { arabic: 'أيها الإله المحب للبشر الصالح', coptic: 'Ⲫ̀ⲛⲟⲩϯ ⲡⲓⲙⲁⲓⲣⲱⲙⲓ ⲛ̀ⲁ̀ⲅⲁⲑⲟⲥ', english: 'O God Lover of Mankind' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'أيها الإله المحب للبشر الصالح، صانع السلام وواهب الاتحاد، انزع عنا كل حقد وكل غش وكل رياء وكل خديعة.',
              coptic: 'Ⲫ̀ⲛⲟⲩϯ ⲡⲓⲙⲁⲓⲣⲱⲙⲓ ⲛ̀ⲁ̀ⲅⲁⲑⲟⲥ: ⲡⲓⲇⲩⲙⲓⲟⲩⲣⲅⲟⲥ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ ⲟⲩⲟϩ ⲡⲓⲣⲉϥϯ ⲛ̀ϯⲙⲉⲧⲟⲩⲁⲓ: ⲱ̀ⲗⲓ ⲉ̀ⲃⲟⲗ ϩⲁⲣⲟⲛ ⲛ̀ⲕⲟⲧ ⲛⲓⲃⲉⲛ ⲛ̀ⲧⲉ ⲡⲓⲙⲟⲥϯ.',
              coptic_arabic: 'إفنوتي بي ماي رومي إن آغاثوس: بي ذيمي أورغوس إنتي تي هيريني أووه بي ريفتي إنتي ميت أواي: أولي إيفول هارون إنكوت نيفين إنتي بي موستي.',
              english: 'O God, the Lover of Mankind, the good One, the Maker of peace and Giver of unity, take away from us all malice, guile, and hypocrisy.'
            }
          ]
        },
        {
          id: 'gregory-deacon-peace',
          title: { arabic: 'مرد الشماس بالصلح', english: 'Deacon Proclamation' },
          speaker: 'deacon',
          type: 'instruction',
          verses: [
            {
              arabic: 'صلوا من أجل السلام الكامل والمحبة والقبلة الطاهرة الرسولية.',
              coptic: 'Ⲡ̀ⲣⲟⲥⲉⲩⲝⲁⲥⲑⲉ ⲩ̀ⲡⲉⲣ ⲧⲏⲥ ⲧⲉⲗⲓⲁⲥ ⲓ̀ⲣⲏⲛⲏⲥ ⲕⲉ ⲁ̀ⲅⲁⲡⲏⲥ ⲕⲉ ⲧⲱⲛ ⲁ̀ⲅⲓⲱⲛ ⲁ̀ⲥⲡⲁⲥⲙⲱⲛ ⲧⲱⲛ ⲁ̀ⲡⲟⲥⲧⲟⲗⲱⲛ.',
              coptic_arabic: 'بروس إفكساسثي إيبير تيس تيلياس إيريني سكي أغابيس كي تون أجيون أسباسمون تون أبوستولون.',
              english: 'Pray for the perfect peace, love, and the holy apostolic kiss.'
            }
          ]
        }
      ]
    },
    {
      id: 'gregory-anaphora',
      title: {
        arabic: 'الأنافورا الغريغورية والتقديس',
        coptic: 'Ⲡⲓⲁ̀ⲛⲁⲫⲟⲣⲁ ⲛ̀Ⲅⲣⲏⲅⲟⲣⲓⲟⲥ',
        english: 'The Gregorian Anaphora'
      },
      badge: 'الخطاب المباشر للمخلص والحلول',
      sections: [
        {
          id: 'gregory-anaphora-dialogue',
          title: { arabic: 'محاورة الأنافورا الغريغورية', english: 'Anaphora Opening' },
          speaker: 'priest',
          type: 'anaphora',
          verses: [
            {
              arabic: 'الرب مع جميعكم.',
              coptic: 'Ⲟ̀ Ⲕⲩⲣⲓⲟⲥ ⲙⲉⲧⲁ ⲡⲁⲛⲧⲱⲛ ⲩ̀ⲙⲱⲛ.',
              coptic_arabic: 'أو كيريوس ميتا بانتون إيمون.',
              english: 'The Lord be with you all.'
            },
            {
              arabic: 'فلنشكر الرب.',
              coptic: 'Ⲉⲩⲭⲁⲣⲓⲥⲧⲏⲥⲱⲙⲉⲛ ⲧⲱ Ⲕⲩⲣⲓⲱ.',
              coptic_arabic: 'إفخارستيسومين تو كيريو.',
              english: 'Let us give thanks to the Lord.'
            }
          ]
        },
        {
          id: 'gregory-incarnation-praise',
          title: { arabic: 'أيها الكائن الذي كان', coptic: 'Ⲫⲏⲉⲧϣⲟⲡ ⲉ̀ⲛⲁϥϣⲟⲡ', english: 'You Who Are and Were' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'أيها الكائن الذي كان، الدائم إلى الأبد، الذاتي والمساوي والجليس والخالق معنا.',
              coptic: 'Ⲫⲏⲉⲧϣⲟⲡ ⲉ̀ⲛⲁϥϣⲟⲡ: ⲫⲏⲉⲑⲛⲏⲟⲩ ϣⲁ ⲉ̀ⲛⲉϩ: ⲡⲓⲁⲩⲧⲟⲟⲩⲥⲓⲟⲥ: ⲡⲓⲟ̀ⲙⲟⲟⲩⲥⲓⲟⲥ: ⲡⲓⲥⲩⲛⲑ̀ⲣⲟⲛⲟⲥ: ⲡⲓⲥⲩⲛⲇⲏⲙⲓⲟⲩⲣⲅⲟⲥ ⲛⲉⲙⲁⲛ.',
              coptic_arabic: 'في إتشوب إيناف شوب: في إثني أو شا إينيه: بي أفتو أوسيوس: بي أوموأوسيوس: بي سينثرونوس: بي سين ذيمي أورغوس نيمان.',
              english: 'O You Who Are and Were, eternal, self-existing, co-essential, enthroned together and Co-Creator with the Father.'
            },
            {
              arabic: 'لأجلي أنا الإنسان تنازلت، أخذت الذي لي وأعطيتني الذي لك. أتيت إلى الذبح كحمل، وإلى الصليب من أجل خلاصي.',
              coptic: 'Ⲉ̀ⲑⲃⲏⲧ ⲁ̀ⲛⲟⲕ ⲡⲓⲣⲱⲙⲓ ⲁⲕⲑⲉⲃⲓⲟ̀ⲕ: ⲁⲕϭⲓ ⲛ̀ⲛⲏ ⲉ̀ⲧⲉⲛⲟⲩⲓ: ⲁⲕϯ ⲛⲏⲓ ⲛ̀ⲛⲏ ⲉ̀ⲧⲉⲛⲟⲩⲕ: ⲁⲕⲓ̀ ⲉ̀ⲡⲓϧⲟⲗϧⲉⲗ ⲙ̀ⲫ̀ⲣⲏϯ ⲛ̀ⲟⲩϩⲓⲏⲃ.',
              coptic_arabic: 'إثفيت أنوك بي رومي أك ثيفيوك: أك تشي إن ني إيتينوي: أك تي ني إن ني إيتينوك: أك إي إيبي خولخيل إمفريتي إن أو هييب.',
              english: 'For my sake, O man, You humbled Yourself; You took what was mine and gave me what was Yours; You came to the slaughter as a lamb.'
            }
          ]
        },
        {
          id: 'gregory-institution',
          title: { arabic: 'تأسيس السر في القداس الغريغوري', english: 'Gregorian Institution' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'رسمت لي هذه الخدمة المملوءة سراً، ووضعت لي بذل جسدك ودمك.',
              coptic: 'Ⲁⲕⲥⲉⲙⲛⲓ ⲛⲏⲓ ⲛ̀ⲧⲁⲓⲇⲓⲁⲕⲟⲛⲓⲁ ⲉⲧⲙⲉϩ ⲙ̀ⲙⲩⲥⲧⲏⲣⲓⲟⲛ: ⲁⲕⲭⲱ ⲛⲏⲓ ⲙ̀ⲡⲓⲧⲁⲗⲟ ⲉ̀ⲡ̀ϣⲱⲓ ⲛ̀ⲧⲉ ⲡⲉⲕⲥⲱⲙⲁ ⲛⲉⲙ ⲡⲉⲕⲥ̀ⲛⲟϥ.',
              coptic_arabic: 'أك سيمني ني إن تاي دياكونيا إتميه إم ميستيريون: أك كو ني إمبي تالو إبشوي إنتي بيك سوما نيم بيك إسنوف.',
              english: 'You instituted for me this mystery-filled ministry, and placed before me the offering of Your Body and Blood.'
            }
          ]
        }
      ]
    }
  ]
};
