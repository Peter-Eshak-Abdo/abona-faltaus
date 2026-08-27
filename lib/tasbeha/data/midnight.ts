import { TasbehaDocument } from '../types';

export const midnightTasbeha: TasbehaDocument = {
  id: 'midnight',
  slug: 'midnight-praises',
  title: {
    arabic: 'تسبحة نصف الليل اليومية والسنوية',
    coptic: 'Ⲡⲓⲧⲱϣ ⲛ̀ⲧⲉ ⲡⲓⲧϫⲱⲣϩ',
    english: 'Midnight Praises (Epsali of Midnight)'
  },
  subtitle: 'تسبحة القيامة والهوسات الأربعة والمجمع والثيؤطوكيات والمدائح اليومية',
  description: 'صلوات التسبحة اليومية تتلى في السحر قبل القداس الإلهي، وتتألف من تن ثينو، الهوسات الأربعة ولبشاتها، إبصاليات الأيام، المجمع، والذكصولوجيات.',
  iconName: 'moon',
  accentColor: 'from-blue-900 to-indigo-950',
  groups: [
    {
      id: 'midnight-intro',
      title: {
        arabic: 'مقدمة التسبحة (قوموا يا بني النور)',
        coptic: 'Ⲧⲉⲛⲑⲏⲛⲟⲩ ⲉ̀ⲡ̀ϣⲱⲓ',
        english: 'Ten Thino (Arise Children of Light)'
      },
      badge: 'الاستعداد والصحوة',
      sections: [
        {
          id: 'ten-thino-section',
          title: { arabic: 'لحن تن ثينو (قوموا يا بني النور)', coptic: 'Ⲧⲉⲛⲑⲏⲛⲟⲩ', english: 'Ten Thino' },
          speaker: 'people',
          type: 'hymn',
          rubric: { arabic: 'يرتل باللحن السنوي أو الصيامي أو الكيهكي' },
          verses: [
            {
              arabic: 'قوموا يا بني النور، لنسبح رب القوات، لكي ينعم لنا بخلاص نفوسنا.',
              coptic: 'Ⲧⲉⲛⲑⲏⲛⲟⲩ ⲉ̀ⲡ̀ϣⲱⲓ ⲛⲓϣⲏⲣⲓ ⲛ̀ⲧⲉ ⲡⲓⲟⲩⲱⲓⲛⲓ: ⲛ̀ⲧⲉⲛϩⲱⲥ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ: ϩⲟⲡⲱⲥ ⲛ̀ⲧⲉϥⲉⲣϩ̀ⲙⲟⲧ ⲛⲁⲛ ⲙ̀ⲡ̀ⲥⲱϯ ⲛ̀ⲧⲉ ⲛⲉⲛⲯⲩⲭⲏ.',
              coptic_arabic: 'تين ثينو إي إبشوي ني شيري إنتي بي أو أويني: إنتين هوس إي إبشويس إنتي ني جوم: هوبوس إنتيف إر إهموت نان إمبي سوتي إنتي نين إبسيشي.',
              english: 'Arise, O children of the light, let us praise the Lord of hosts, that He may grant us the salvation of our souls.'
            },
            {
              arabic: 'ها باركوا الرب يا عبيد الرب، القائمين في بيت الرب، في ديار بيت إلهنا. المجد لك يا محب البشر.',
              coptic: 'Ϩⲏⲡⲡⲉ ⲇⲉ ⲥ̀ⲙⲟⲩ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛⲓⲉ̀ⲃⲓⲁⲓⲕ ⲛ̀ⲧⲉ Ⲡ̀ϭⲟⲓⲥ: ⲛⲏⲉⲧⲟ̀ϩⲓ ⲉ̀ⲣⲁⲧⲟⲩ ϧⲉⲛ ⲡ̀ⲏⲓ ⲙ̀Ⲡ̀ϭⲟⲓⲥ: ϧⲉⲛ ⲛⲓⲁⲩⲗⲏⲟⲩ ⲛ̀ⲧⲉ ⲡ̀ⲏⲓ ⲙ̀Ⲡⲉⲛⲛⲟⲩϯ: Ⲇⲟⲝⲁ ⲥⲓ Ⲫⲓⲗⲁⲛⲑ̀ⲣⲱⲡⲉ.',
              coptic_arabic: 'هيبي ذي إسمو إي إبشويس ني إيفيايك إنتي إبشويس: ني إت أوهي إيرات أو خين إبئي إم إبشويس: خين ني أفليو إنتي إبئي إمبينوتي: ذوكصا سي فيلانثروبي.',
              english: 'Behold, bless the Lord all you servants of the Lord, who stand in the house of the Lord, in the courts of the house of our God. Glory to You O Lover of Mankind.'
            }
          ]
        },
        {
          id: 'ten-nav-sunday',
          title: { arabic: 'لحن تين ناف (إبصالية القيامة للآحاد)', coptic: 'Ⲧⲉⲛⲛⲁⲩ ⲉ̀ⲡⲓⲁ̀ⲛⲁⲥⲧⲁⲥⲓⲥ', english: 'Ten Nav (Resurrection Psali)' },
          speaker: 'people',
          type: 'psali',
          verses: [
            {
              arabic: 'ننظر إلى قيامة المسيح، فلنسجد للقدوس الرب يسوع، الذي بلا خطية وحده.',
              coptic: 'Ⲧⲉⲛⲛⲁⲩ ⲉ̀ϯⲁ̀ⲛⲁⲥⲧⲁⲥⲓⲥ ⲛ̀ⲧⲉ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ: ⲙⲁⲣⲉⲛⲟⲩⲱϣⲧ ⲙ̀ⲡⲓⲁⲅⲓⲟⲥ Ⲡ̀ϭⲟⲓⲥ Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ: ⲡⲓⲁⲧⲛⲟⲃⲓ ⲙ̀ⲙⲁⲩⲁⲧϥ.',
              coptic_arabic: 'تين ناف إيتي أناستاسيس إنتي بيخرستوس: مارين أوأوشت إمبي أجيوس إبشويس إيسوس بيخرستوس: بي أت نوفي إممافاتف.',
              english: 'We behold the Resurrection of Christ; let us worship the Holy Lord Jesus Christ, the only sinless One.'
            }
          ]
        }
      ]
    },
    {
      id: 'first-hoos-group',
      title: {
        arabic: 'الهوس الأول ولبشه (تسبحة موسى النبي)',
        coptic: 'Ⲡⲓϩⲱⲥ ⲁ̅ ⲛⲉⲙ ⲡⲉϥⲗⲱⲃϣ',
        english: 'The First Hoos & Its Lobsh'
      },
      badge: 'عبور البحر الأحمر والانتصار',
      sections: [
        {
          id: 'first-hoos-content',
          title: { arabic: 'الهوس الأول (حينئذ سبح موسى)', coptic: 'Ⲧⲟⲧⲉ ⲁϥϩⲱⲥ ⲛ̀ϫⲉ Ⲙⲱⲩ̀ⲥⲏⲥ', english: 'The First Hoos' },
          speaker: 'people',
          type: 'hoos',
          verses: [
            {
              arabic: 'حينئذ سبح موسى وبنو إسرائيل بهذه التسبحة للرب وقالوا: فلنسبح الرب لأنه بالمجد قد تمجد.',
              coptic: 'Ⲧⲟⲧⲉ ⲁϥϩⲱⲥ ⲛ̀ϫⲉ Ⲙⲱⲩ̀ⲥⲏⲥ ⲛⲉⲙ ⲛⲉⲛϣⲏⲣⲓ ⲙ̀Ⲡⲓⲥ̀ⲣⲁⲏⲗ ϧⲉⲛ ⲧⲁⲓϩⲱⲇⲏ ⲉ̀Ⲡ̀ϭⲟⲓⲥ: ⲟⲩⲟϩ ⲁⲩϫⲟⲥ ⲉⲩϫⲱ ⲙ̀ⲙⲟⲥ: ϫⲉ ⲙⲁⲣⲉⲛϩⲱⲥ ⲉ̀Ⲡ̀ϭⲟⲓⲥ: ϫⲉ ϧⲉⲛ ⲟⲩⲱ̀ⲟⲩ ⲅⲁⲣ ⲁϥϭⲓⲱ̀ⲟⲩ.',
              coptic_arabic: 'توتى أف هوس إنجي مويسيس نيم نين شيري إمبي إسرائيل خين تاي هودي إي إبشويس: أووه أف جوس إفجو إمموس: جي مارين هوس إي إبشويس: جي خين أو أو أو غار أف تشي أو أو.',
              english: 'Then Moses and the children of Israel sang this song to the Lord, and spoke, saying: Let us sing unto the Lord, for He has triumphed gloriously.'
            },
            {
              arabic: 'الفرس وراكبه طرحهما في البحر. معيني وساتري صار لي خلاصاً.',
              coptic: 'Ⲟⲩϩ̀ⲑⲟ ⲛⲉⲙ ⲟⲩϭⲁⲥⲓϩ̀ⲑⲟ ⲁϥⲃⲉⲣⲃⲱⲣⲟⲩ ⲉ̀ⲫ̀ⲓⲟⲙ: ⲟⲩⲃⲟⲏ̀ⲑⲟⲥ ⲛⲉⲙ ⲟⲩⲥ̀ⲕⲉⲡⲁⲥⲧⲏⲥ ⲁϥϣⲱⲡⲓ ⲛⲏⲓ ⲉ̀ⲩⲥⲱⲧⲏⲣⲓⲁ.',
              coptic_arabic: 'أو إهثو نيم أو تشاسي إهثو أف فيرفورو إي إفيوم: أو فويثوس نيم أو سكيباستيس أف شوبي ني إي أو سوتيريا.',
              english: 'The horse and its rider He has thrown into the sea. The Lord is my strength and song, and He has become my salvation.'
            }
          ]
        },
        {
          id: 'first-lobsh',
          title: { arabic: 'لبش الهوس الأول (خين أو شوت)', coptic: 'Ϧⲉⲛ ⲟⲩϣⲱⲧ ⲁϥϣⲱⲧ', english: 'Lobsh of the First Hoos' },
          speaker: 'people',
          type: 'lobsh',
          verses: [
            {
              arabic: 'قطعاً انقطع ماء البحر، والعمق العميق صار مسلكاً، أرض غير ظاهرة أشرقت عليها الشمس، وطريق غير مسلوكة مشوا عليها.',
              coptic: 'Ϧⲉⲛ ⲟⲩϣⲱⲧ ⲁϥϣⲱⲧ ⲛ̀ϫⲉ ⲡⲓⲙⲱⲟⲩ ⲛ̀ⲧⲉ ⲫ̀ⲓⲟⲙ: ⲟⲩⲟϩ ⲡⲓϣⲱⲕ ⲉⲧϣⲏⲕ ⲁϥϣⲱⲡⲓ ⲛ̀ⲟⲩⲙⲱⲓⲧ ⲛ̀ⲙⲟϣⲓ.',
              coptic_arabic: 'خين أو شوت أف شوت إنجي بي مو أو إنتي إفيوم: أووه بي شوك إت شيك أف شوبي إن أو مويت إن موشي.',
              english: 'In a division the water of the sea was divided, and the deep abyss became a pathway.'
            }
          ]
        }
      ]
    },
    {
      id: 'second-hoos-group',
      title: {
        arabic: 'الهوس الثاني ولبشه (مزمور 135 والشكر الدائم)',
        coptic: 'Ⲡⲓϩⲱⲥ ⲃ̅ ⲛⲉⲙ ⲡⲉϥⲗⲱⲃϣ',
        english: 'The Second Hoos & Its Lobsh'
      },
      badge: 'لأن إلى الأبد رحمته',
      sections: [
        {
          id: 'second-hoos-content',
          title: { arabic: 'الهوس الثاني (اشكروا الرب لأنه صالح)', coptic: 'Ⲟⲩⲱⲛϩ ⲉ̀ⲃⲟⲗ ⲙ̀Ⲡ̀ϭⲟⲓⲥ', english: 'The Second Hoos' },
          speaker: 'people',
          type: 'hoos',
          verses: [
            {
              arabic: 'اشكروا الرب لأنه صالح: هلليلويا: لأن إلى الأبد رحمته. اشكروا إله الآلهة: هلليلويا: لأن إلى الأبد رحمته.',
              coptic: 'Ⲟⲩⲱⲛϩ ⲉ̀ⲃⲟⲗ ⲙ̀Ⲡ̀ϭⲟⲓⲥ ϫⲉ ⲟⲩⲭ̀ⲣⲏⲥⲧⲟⲥ ⲡⲉ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ: ϫⲉ ⲡⲉϥⲛⲁⲓ ϣⲟⲡ ϣⲁ ⲉ̀ⲛⲉϩ: Ⲟⲩⲱⲛϩ ⲉ̀ⲃⲟⲗ ⲙ̀Ⲫ̀ⲛⲟⲩϯ ⲛ̀ⲧⲉ ⲛⲓⲛⲟⲩϯ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ: ϫⲉ ⲡⲉϥⲛⲁⲓ ϣⲟⲡ ϣⲁ ⲉ̀ⲛⲉϩ.',
              coptic_arabic: 'أو أونه إيفول إم إبشويس جي أو خريستوس بي: الليلويا: جي بيف ناي شوب شا إينيه: أو أونه إيفول إم إفنوتي إنتي نينوتي: الليلويا: جي بيف ناي شوب شا إينيه.',
              english: 'Give thanks to the Lord, for He is good: Alleluia: For His mercy endures forever. Give thanks to the God of gods: Alleluia: For His mercy endures forever.'
            }
          ]
        },
        {
          id: 'second-lobsh',
          title: { arabic: 'لبش الهوس الثاني (مارين أو أونه إيفول)', coptic: 'Ⲙⲁⲣⲉⲛⲟⲩⲱⲛϩ ⲉ̀ⲃⲟⲗ', english: 'Lobsh of the Second Hoos' },
          speaker: 'people',
          type: 'lobsh',
          verses: [
            {
              arabic: 'فلنشكر المسيح إلهنا مع المرتل داود النبي، لأنه جعل السموات بعقل، لأن إلى الأبد رحمته.',
              coptic: 'Ⲙⲁⲣⲉⲛⲟⲩⲱⲛϩ ⲉ̀ⲃⲟⲗ ⲙ̀Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ Ⲡⲉⲛⲛⲟⲩϯ: ⲛⲉⲙ ⲡⲓⲯⲁⲗⲧⲏⲥ Ⲇⲁⲩⲓⲇ ⲡⲓⲡ̀ⲣⲟⲫⲏⲧⲏⲥ: ϫⲉ ⲫⲏⲉ̀ⲧⲁϥⲑⲁⲙⲓⲟ̀ ⲛ̀ⲛⲓⲫⲏⲟⲩⲓ̀ ϧⲉⲛ ⲟⲩⲕⲁϯ: ϫⲉ ⲡⲉϥⲛⲁⲓ ϣⲟⲡ ϣⲁ ⲉ̀ⲛⲉϩ.',
              coptic_arabic: 'مارين أو أونه إيفول إمبيخرستوس بينوتي: نيم بي بسالتيس دافيد بي بروفيتيس: جي في إيطاف ثاميو إن ني في أوي خين أو كاتي: جي بيف ناي شوب شا إينيه.',
              english: 'Let us give thanks to Christ our God with the psalmist David the prophet, who made the heavens with understanding, for His mercy endures forever.'
            }
          ]
        }
      ]
    },
    {
      id: 'third-hoos-group',
      title: {
        arabic: 'الهوس الثالث وإبصالية آري بسالين (تسبحة الثلاثة فتية)',
        coptic: 'Ⲡⲓϩⲱⲥ ⲅ̅ ⲛⲉⲙ Ⲁ̀ⲣⲓⲯⲁⲗⲓⲛ',
        english: 'The Third Hoos & Arepsalin'
      },
      badge: 'أتون النار وتسبيح الخليقة',
      sections: [
        {
          id: 'third-hoos-content',
          title: { arabic: 'الهوس الثالث (سبحوا الرب وباركوه)', coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛⲓϩ̀ⲃⲏⲟⲩⲓ̀ ⲧⲏⲩ', english: 'The Third Hoos' },
          speaker: 'people',
          type: 'hoos',
          verses: [
            {
              arabic: 'باركوا الرب يا جميع أعمال الرب، سبحوه وزيدوه علواً إلى الأبد.',
              coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛⲓϩ̀ⲃⲏⲟⲩⲓ̀ ⲧⲏⲣⲟⲩ ⲛ̀ⲧⲉ Ⲡ̀ϭⲟⲓⲥ: ϩⲱⲥ ⲉ̀ⲣⲟϥ ⲁ̀ⲣⲓϩⲟⲩⲟ̀ ϭⲁⲥϥ ϣⲁ ⲛⲓⲉ̀ⲛⲉϩ.',
              coptic_arabic: 'إسمو إي إبشويس ني إهفي أوي تيرو إنتي إبشويس: هوس إيروف أري هو أو تشاسف شا ني إينيه.',
              english: 'Bless the Lord, all you works of the Lord; praise Him and highly exalt Him forever.'
            }
          ]
        },
        {
          id: 'arepsalin-hymn',
          title: { arabic: 'إبصالية آري بسالين (رتلوا للذي صلب عنا)', coptic: 'Ⲁ̀ⲣⲓⲯⲁⲗⲓⲛ ⲉ̀ⲫⲏⲉ̀ⲧⲁⲩⲁϣϥ', english: 'Arepsalin (Sing to Him who was crucified)' },
          speaker: 'people',
          type: 'psali',
          verses: [
            {
              arabic: 'رتلوا للذي صلب عنا، وقُبر وقام، وداس الموت وأبطل سلطانه، سبحوه وزيدوه علواً إلى الأبد.',
              coptic: 'Ⲁ̀ⲣⲓⲯⲁⲗⲓⲛ ⲉ̀ⲫⲏⲉ̀ⲧⲁⲩⲁϣϥ ⲉ̀ⲑⲃⲏⲧⲉⲛ: ⲁⲩⲕⲟⲥϥ ⲁϥⲧⲱⲛϥ ⲁϥϩⲱⲙⲓ ⲉ̀ϫⲉⲛ ⲡⲓⲙⲟⲩ: ϩⲱⲥ ⲉ̀ⲣⲟϥ ⲁ̀ⲣⲓϩⲟⲩⲟ̀ ϭⲁⲥϥ ϣⲁ ⲛⲓⲉ̀ⲛⲉϩ.',
              coptic_arabic: 'أري بسالين إيفي إيطاف أشف إثفيتين: أف كوسف أف تونف أف هومي إيجين بي مو: هوس إيروف أري هو أو تشاسف شا ني إينيه.',
              english: 'Sing unto Him who was crucified for us, buried and rose, and trampled down death; praise Him and highly exalt Him forever.'
            }
          ]
        }
      ]
    },
    {
      id: 'fourth-hoos-group',
      title: {
        arabic: 'الهوس الرابع والذكصولوجيات (المزامير 148-150)',
        coptic: 'Ⲡⲓϩⲱⲥ ⲇ̅ ⲛⲉⲙ Ⲛⲓⲇⲟⲝⲟⲗⲟⲅⲓⲁ',
        english: 'The Fourth Hoos & Doxologies'
      },
      badge: 'التسبيح النهائي',
      sections: [
        {
          id: 'fourth-hoos-content',
          title: { arabic: 'الهوس الرابع (سبحوا الرب من السموات)', coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲛⲓⲫⲏⲟⲩⲓ̀', english: 'The Fourth Hoos' },
          speaker: 'people',
          type: 'hoos',
          verses: [
            {
              arabic: 'سبحوا الرب من السموات: هلليلويا: سبحوه في الأعالي. سبحوه يا جميع ملائكته: هلليلويا: سبحوه يا جميع جنوده.',
              coptic: 'Ⲥ̀ⲙⲟⲩ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲛⲓⲫⲏⲟⲩⲓ̀: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ: ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ ϧⲉⲛ ⲛⲏⲉⲧϭⲟⲥⲓ: ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ ⲛⲉϥⲁⲅⲅⲉⲗⲟⲥ ⲧⲏⲣⲟⲩ: Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ: ⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ ⲛⲉϥⲇⲩⲛⲁⲙⲓⲥ ⲧⲏⲣⲟⲩ.',
              coptic_arabic: 'إسمو إي إبشويس إيفول خين ني في أوي: الليلويا: إسمو إيروف خين ني إت تشوسي: إسمو إيروف نيف أنجيلوس تيرو: الليلويا: إسمو إيروف نيف ذيناميس تيرو.',
              english: 'Praise the Lord from the heavens: Alleluia: Praise Him in the heights. Praise Him, all His angels: Alleluia: Praise Him, all His hosts.'
            }
          ]
        },
        {
          id: 'doxology-st-mary',
          title: { arabic: 'ذكصولوجية العذراء مريم (شيري ني ماريا)', coptic: 'Ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ ϯϭⲣⲟⲙⲡⲓ ⲉⲑⲛⲉⲥⲱⲥ', english: 'Doxology of St. Mary' },
          speaker: 'people',
          type: 'doxology',
          verses: [
            {
              arabic: 'السلام لكِ يا مريم الحمامة الحسنة، التي ولدت لنا الله الكلمة.',
              coptic: 'Ⲭⲉⲣⲉ ⲛⲉ Ⲙⲁⲣⲓⲁ: ϯϭ̀ⲣⲟⲙⲡⲓ ⲉⲑⲛⲉⲥⲱⲥ: ⲑⲏⲉ̀ⲧⲁⲥⲙⲓⲥⲓ ⲛⲁⲛ: ⲙ̀Ⲫ̀ⲛⲟⲩϯ ⲡⲓⲖⲟⲅⲟⲥ.',
              coptic_arabic: 'شيري ني ماريا: تي إتشرومبي إثنيسوس: ثي إيطاسميسي نان: إم إفنوتي بي لوغوس.',
              english: 'Hail to you, Mary, the fair dove, who brought forth unto us God the Word.'
            }
          ]
        },
        {
          id: 'your-mercies-hymn',
          title: { arabic: 'لحن مراحمك يا إلهي (ختام الثيؤطوكيات)', coptic: 'Ⲛⲉⲕⲛⲁⲓ ⲱ̀ Ⲡⲁⲛⲟⲩϯ', english: 'Neknai O Panouti (Your Mercies O My God)' },
          speaker: 'people',
          type: 'conclusion',
          verses: [
            {
              arabic: 'مراحمك يا إلهي غير محصاة، وكثيرة جداً هي رأفاتك، قطرات المطر محصاة عندك، ورمل البحر كائن أمام عينيك.',
              coptic: 'Ⲛⲉⲕⲛⲁⲓ ⲱ̀ Ⲡⲁⲛⲟⲩϯ ϩⲁⲛⲁⲧⲏ̀ⲡⲓ ⲙ̀ⲙⲱⲟⲩ ⲛⲉ: ⲟⲩⲟϩ ϩⲁⲛⲛⲓϣϯ ⲉ̀ⲙⲁϣⲱ ⲛⲉ ⲛⲉⲕⲙⲉⲧϣⲉⲛϩⲏⲧ: ⲛⲓⲧⲉⲗϯ ⲛ̀ⲧⲉ ⲡⲓⲙⲟⲩⲛϩⲱⲟⲩ ϩⲁⲛⲏ̀ⲡⲓ ⲛⲁϩⲣⲁⲕ ⲛⲉ: ⲟⲩⲟϩ ⲡⲓϣⲱ ⲛ̀ⲧⲉ ⲫ̀ⲓⲟⲙ ϥ̀ⲭⲏ ⲙ̀ⲡⲉⲕⲙ̀ⲑⲟ.',
              coptic_arabic: 'نيك ناي أو بانوتي هان أت إيبي إممو أو ني: أووه هان نيشتي إيماشو ني نيك ميت شينهيت: ني تيلتي إنتي بي مون هو أو هان إيبي ناهراك ني: أووه بي شو إنتي إفيوم إفكي إمبيك إمثو.',
              english: 'Your mercies, O my God, are countless; and exceedingly abundant are Your compassions.'
            }
          ]
        }
      ]
    }
  ]
};
