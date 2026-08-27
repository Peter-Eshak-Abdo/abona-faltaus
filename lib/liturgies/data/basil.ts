import { LiturgyDocument } from '../types';

export const basilLiturgy: LiturgyDocument = {
  id: 'basil',
  slug: 'st-basil',
  title: {
    arabic: 'القداس الباسيلي للقديس باسيليوس الكبير',
    coptic: 'Ⲡⲓⲁ̀ⲛⲁⲫⲟⲣⲁ ⲛ̀ⲧⲉ ⲡⲓⲁⲅⲓⲟⲥ Ⲃⲁⲥⲓⲗⲓⲟⲥ',
    english: 'The Liturgy of Saint Basil the Great'
  },
  subtitle: 'القداس الأكثر استخداماً في الكنيسة القبطية الأرثوذكسية على مدار السنة',
  description: 'يتميز القداس الباسيلي بعمقه اللاهوتي وشموليته، ويُصلّى به في غالبية أيام السنة الكنسية.',
  iconName: 'church',
  accentColor: 'from-amber-600 to-amber-900',
  groups: [
    {
      id: 'matins-incense',
      title: {
        arabic: 'رفع بخور باكر والعشية',
        coptic: 'Ⲡⲓϭⲓⲥ̀ⲑⲟⲓⲛⲟⲩϥⲓ ⲛ̀ϣⲱⲡ',
        english: 'Raising of Incense'
      },
      badge: 'الاستعداد والبخور',
      sections: [
        {
          id: 'thanksgiving-priest-1',
          title: { arabic: 'صلاة الشكر', coptic: 'Ⲡⲓϣⲏⲡϩⲙⲟⲧ', english: 'Thanksgiving Prayer' },
          speaker: 'priest',
          type: 'prayer',
          rubric: { arabic: 'يقول الكاهن صلاة الشكر ممسكاً بالصليب والشموع' },
          verses: [
            {
              arabic: 'فلنشكر صانع الخيرات الرحوم الله، أبا ربنا وإلهنا ومخلصنا يسوع المسيح.',
              coptic: 'Ⲙⲁⲣⲉⲛϣⲉⲡϩⲙⲟⲧ ⲛ̀ⲧⲟⲧϥ ⲙ̀ⲡⲓⲣⲉϥⲉⲣⲡⲉⲑⲛⲁⲛⲉϥ ⲟⲩⲟϩ ⲛ̀ⲛⲁⲏⲧ Ⲫ̀ⲛⲟⲩϯ: Ⲫ̀ⲓⲱⲧ ⲙ̀Ⲡⲉⲛϭⲟⲓⲥ ⲟⲩⲟϩ Ⲡⲉⲛⲛⲟⲩϯ ⲟⲩⲟϩ Ⲡⲉⲛⲥⲱⲧⲏⲣ Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ.',
              coptic_arabic: 'مارين شيبهوت إنتوتف إمبيريف إربيثنانيف أووه إن نايت إفنوتي: إفيوت إمبينشويس أووه بينوتي أووه بين سوتير إيسوس بيخرستوس.',
              english: 'Let us give thanks unto the beneficent and merciful God, the Father of our Lord, God, and Savior Jesus Christ.'
            }
          ]
        },
        {
          id: 'thanksgiving-deacon-1',
          title: { arabic: 'تنبيه الشماس بصلاة الشكر', english: 'Deacon Response' },
          speaker: 'deacon',
          type: 'instruction',
          verses: [
            {
              arabic: 'صلوا.',
              coptic: 'Ⲡ̀ⲣⲟⲥⲉⲩⲝⲁⲥⲑⲉ.',
              coptic_arabic: 'بروس إفكساسثي.',
              english: 'Pray.'
            }
          ]
        },
        {
          id: 'thanksgiving-people-1',
          title: { arabic: 'مرد الشعب - كيرياليسون', english: 'Lord have mercy' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'يا رب ارحم.',
              coptic: 'Ⲕⲩⲣⲓⲉ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ.',
              coptic_arabic: 'كيريى إيليسون.',
              english: 'Lord have mercy.'
            }
          ]
        },
        {
          id: 'verses-cymbals',
          title: { arabic: 'أرباع الناقوس', coptic: 'Ⲛⲓⲧⲱⲧ ⲛ̀ⲧⲉ ⲡⲓⲕⲩⲙⲃⲁⲗⲟⲛ', english: 'Verses of the Cymbals' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'نسجد للآب والابن والروح القدس، الثالوث القدوس المساوي في الجوهر.',
              coptic: 'Ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀Ϣⲏⲣⲓ ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ: ϯ̀Ⲧ̀ⲣⲓⲁⲥ Ⲉⲑⲟⲩⲁⲃ ⲛ̀ⲟ̀ⲙⲟⲟⲩⲥⲓⲟⲥ.',
              coptic_arabic: 'تين أوأوشت إم إفيوت نيم إبشيري نيم بي ابنفما إثؤواب: تي إترياس إثؤواب إن أوموأوسيوس.',
              english: 'We worship the Father, the Son, and the Holy Spirit: the Holy and Co-essential Trinity.',
              hymnRef: {
                id: 'ten-ou-osht',
                name: 'لحن البركة (تين_أوأوشت)',
                src: 'لحن_البركة_(تين_أوأوشت)',
                hazatSrc: '/al7an/hazat/الطقس السنوي_page-0066.jpg',
                duration: '2:03'
              }
            },
            {
              arabic: 'السلام للكنيسة بيت الملائكة: السلام للعذراء التي ولدت مخلصنا.',
              coptic: 'Ⲭⲉⲣⲉ ϯⲉⲕⲕ̀ⲗⲏⲥⲓⲁ: ⲡ̀ⲏⲓ ⲛ̀ⲧⲉ ⲛⲓⲁⲅⲅⲉⲗⲟⲥ: ⲭⲉⲣⲉ ϯⲠⲁⲣⲑⲉⲛⲟⲥ: ⲉ̀ⲧⲁⲥⲙⲁⲥ Ⲡⲉⲛⲥⲱⲧⲏⲣ.',
              coptic_arabic: 'شيري تي إكليسيا: إبئي إنتي ني أنجيلوس: شيري تي بارثينوس: إي طاسماس بين سوتير.',
              english: 'Hail to the church, house of the angels: Hail to the Virgin who gave birth to our Savior.'
            }
          ]
        },
        {
          id: 'sick-litany',
          title: { arabic: 'أوشية المرضى', coptic: 'Ⲧⲉⲩⲭⲏ ⲛ̀ⲛⲓⲉⲧϣⲱⲛⲓ', english: 'Litany of the Sick' },
          speaker: 'priest',
          type: 'litany',
          verses: [
            {
              arabic: 'اذكر يا رب مرضى شعبك، تعهدهم بالمراحم والرأفات، اشفهم.',
              coptic: 'Ⲁ̀ⲣⲓⲫ̀ⲙⲉⲩⲓ Ⲡ̀ϭⲟⲓⲥ ⲛ̀ⲛⲏⲉⲧϣⲱⲛⲓ ⲛ̀ⲧⲉ ⲡⲉⲕⲗⲁⲟⲥ: ϫⲉⲙⲡⲟⲩϣⲓⲛⲓ ϧⲉⲛ ϩⲁⲛⲛⲁⲓ ⲛⲉⲙ ϩⲁⲛⲙⲉⲧϣⲉⲛϩⲏⲧ: ⲙⲁⲧⲁⲗϭⲱⲟⲩ.',
              coptic_arabic: 'أريفميفي إبشويس إن ني إتشوني إنتي بيك لاؤس: جيم بو شيني خين هان ناي نيم هان ميتشينهيت: ما طالتشو أو.',
              english: 'Remember, O Lord, the sick among Your people; visit them with mercies and compassions; heal them.'
            }
          ]
        },
        {
          id: 'doxologies-intro',
          title: { arabic: 'الذكصولوجيات', coptic: 'Ⲛⲓⲇⲟⲝⲟⲗⲟⲅⲓⲁ', english: 'Doxologies' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'بصلوات والدة الإله القديسة مريم، يا رب أنعم لنا بمغفرة خطايانا.',
              coptic: 'Ϩⲓⲧⲉⲛ ⲛⲓⲡ̀ⲣⲉⲥⲃⲓⲁ: ⲛ̀ⲧⲉ ϯⲑⲉⲟ̀ⲧⲟⲕⲟⲥ ⲉⲑⲟⲩⲁⲃ Ⲙⲁⲣⲓⲁ: Ⲡ̀ϭⲟⲓⲥ ⲁ̀ⲣⲓϩ̀ⲙⲟⲧ ⲛⲁⲛ ⲙ̀ⲡⲓⲭⲱ ⲉ̀ⲃⲟⲗ ⲛ̀ⲧⲉ ⲛⲉⲛⲛⲟⲃⲓ.',
              coptic_arabic: 'هيتين ني إبريسفيا: إنتي تي ثيؤطوكوس إثؤواب ماريا: إبشويس أري هُموت نان إمبي كو إيفول إنتي نين نوفي.',
              english: 'Through the intercessions of the Mother of God Saint Mary, O Lord grant us the forgiveness of our sins.'
            }
          ]
        }
      ]
    },
    {
      id: 'offering-lamb',
      title: {
        arabic: 'تقديم الحمل',
        coptic: 'Ⲡⲓⲧⲁⲗⲟ ⲉ̀ⲡ̀ϣⲱⲓ ⲙ̀ⲡⲓϩⲓⲏⲃ',
        english: 'Offering of the Lamb'
      },
      badge: 'اختيار الحمل والبركة',
      sections: [
        {
          id: 'lamb-alleluia',
          title: { arabic: 'لحن الليلويا إي أ إيخون', english: 'Alleluia I will enter' },
          speaker: 'people',
          type: 'hymn',
          rubric: { arabic: 'يقال أثناء طواف الكاهن بالحمل حول المذبح' },
          verses: [
            {
              arabic: 'هلليلويا، أدخل إلى مذبح الله، أمام الله الذي يبهج شبابي. اعترف لك يا الله إلهي بالقيثارة.',
              coptic: 'Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ: ⲉⲓⲉ̀ⲓ̀ ⲉ̀ϧⲟⲩⲛ ϩⲁ ⲡⲓⲙⲁⲛ̀ⲉⲣϣⲱⲟⲩϣⲓ ⲛ̀ⲧⲉ Ⲫ̀ⲛⲟⲩϯ: ⲛⲁϩⲣⲉⲛ ⲡ̀ϩⲟ ⲙ̀Ⲫ̀ⲛⲟⲩϯ ⲫⲏⲉ̀ⲧⲁϥϯ ⲙ̀ⲡⲟⲩⲛⲟϥ ⲛ̀ⲧⲉ ⲧⲁⲙⲉⲧⲁ̀ⲗⲟⲩ.',
              coptic_arabic: 'الليلويا: إي إي إيخون ها بيما إن إيرشوأوشي إنتي إفنوتي: ناهرين إبهو إم إفنوتي في إيطاف تي إمبؤنوف إنتي تاميت ألو.',
              english: 'Alleluia. I will enter to the altar of God, before the face of God who makes glad my youth.',
              hymnRef: {
                id: 'alleluia-ei-e-ekhon',
                name: 'الليلويا إي ا ايخون',
                src: 'الليلويا إي ا ايخون',
                hazatSrc: '/al7an/hazat/الصوم الكبير و صوم نينوي_page-0031.jpg',
                duration: '2:04'
              }
            }
          ]
        },
        {
          id: 'absolution-servants',
          title: { arabic: 'تحليل الخدام', coptic: 'Ⲡⲓⲃⲱⲗ ⲉ̀ⲃⲟⲗ ⲛ̀ⲧⲉ ⲛⲓⲇⲓⲁⲕⲟⲛⲟⲥ', english: 'Absolution of the Servants' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'عبيدك يا رب، خدام هذا اليوم، القمامصة والقسوس والشمامسة وسائر الإكليروس وكل شعبك، يكونون محاللين من فم الثالوث القدوس.',
              coptic: 'Ⲛⲉⲕⲃⲱⲕ Ⲡ̀ϭⲟⲓⲥ ⲛⲓⲣⲉϥϣⲉⲙϣⲓ ⲛ̀ⲧⲉ ⲡⲁⲓⲉ̀ϩⲟⲟⲩ: ⲛⲓϩⲏⲅⲟⲩⲙⲉⲛⲟⲥ ⲛⲉⲙ ⲛⲓⲡ̀ⲣⲉⲥⲃⲩⲧⲉⲣⲟⲥ ⲛⲉⲙ ⲛⲓⲇⲓⲁⲕⲱⲛ: ⲙⲁⲣⲟⲩϣⲱⲡⲓ ⲉⲩⲃⲏⲗ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲣⲱϥ ⲛ̀ϯ̀Ⲧ̀ⲣⲓⲁⲥ Ⲉⲑⲟⲩⲁⲃ.',
              coptic_arabic: 'نيك فوك إبشويس ني ريف شيمشي إنتي باي إيهو أو: ني هيجومينوس نيم ني إبريسفيتيروس نيم ني دياكون: مارو شوبي إففيل إيفول خين روف إنتي تي إترياس إثؤواب.',
              english: 'May Your servants, O Lord, the ministers of this day—the hegumens, priests, deacons, all clergy and all Your people—be absolved by the Holy Trinity.'
            }
          ]
        }
      ]
    },
    {
      id: 'liturgy-word',
      title: {
        arabic: 'قداس الكلمة (الموعوظين)',
        coptic: 'Ⲡⲓⲁ̀ⲛⲁⲅⲛⲱⲥⲧⲏⲥ ⲛ̀ⲧⲉ ⲛⲓⲕⲁⲧⲏⲭⲟⲩⲙⲉⲛⲟⲥ',
        english: 'Liturgy of the Word'
      },
      badge: 'القراءات والرسائل والإنجيل',
      sections: [
        {
          id: 'tai-shori',
          title: { arabic: 'لحن تاي شوري (المجمرة الذهب)', coptic: 'Ⲧⲁⲓϣⲟⲩⲣⲏ', english: 'Tai Shori' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'هذه المجمرة الذهب النقي الحاملة العنبر، التي في يدي هرون الكاهن، يرفع بخوراً فوق المذبح.',
              coptic: 'Ⲧⲁⲓϣⲟⲩⲣⲏ ⲛ̀ⲛⲟⲩⲃ ⲛ̀ⲕⲁⲑⲁⲣⲟⲥ ⲉⲧϥⲁⲓ ϧⲁ ⲡⲓⲁ̀ⲣⲱⲙⲁⲧⲁ: ⲉⲧϧⲉⲛ ⲛⲉⲛϫⲓϫ ⲛ̀Ⲁ̀ⲁⲣⲱⲛ ⲡⲓⲟ̀ⲩⲏⲃ: ⲉϥⲧⲁⲗⲉ ⲟⲩⲥ̀ⲑⲟⲓⲛⲟⲩϥⲓ ⲉ̀ⲡ̀ϣⲱⲓ ⲉ̀ϫⲉⲛ ⲡⲓⲙⲁⲛ̀ⲉ̀ⲣϣⲱⲟ̀ⲩϣⲓ.',
              coptic_arabic: 'تاي شوري إننوب إنكاثاروس إتفاي خا بي أروماتا: إتخين نين جيج إن أهرون بي أويب: إف تالي أو إسطوينوفي إبشوي إيجين بي ما إن إيرشوأوشي.',
              english: 'This is the censer of pure gold, bearing the aroma, in the hands of Aaron the priest, offering incense upon the altar.'
            }
          ]
        },
        {
          id: 'trisagion-agios',
          title: { arabic: 'لحن أجيوس (الثلاث تقديسات)', coptic: 'Ⲡⲓⲁ̀ⲅⲓⲟⲥ', english: 'The Trisagion' },
          speaker: 'people',
          type: 'hymn',
          verses: [
            {
              arabic: 'قدوس الله، قدوس القوي، قدوس الذي لا يموت، الذي ولد من العذراء، ارحمنا.',
              coptic: 'Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ: Ⲁ̀ⲅⲓⲟⲥ Ⲓⲥⲭⲩⲣⲟⲥ: Ⲁ̀ⲅⲓⲟⲥ Ⲁ̀ⲑⲁⲛⲁⲧⲟⲥ: ⲟ̀ ⲉⲕ Ⲡⲁⲣⲑⲉⲛⲟⲩ ⲅⲉⲛⲛⲏⲑⲓⲥ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ ⲏ̀ⲙⲁⲥ.',
              coptic_arabic: 'أجيوس أو ثيئوس: أجيوس إسشيروس: أجيوس أثاناتوس: أو إك بارثينو جينيثيس إليسون إيماس.',
              english: 'Holy God, Holy Mighty, Holy Immortal, who was born of the Virgin, have mercy upon us.'
            },
            {
              arabic: 'قدوس الله، قدوس القوي، قدوس الذي لا يموت، الذي صُلب عنا، ارحمنا.',
              coptic: 'Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ: Ⲁ̀ⲅⲓⲟⲥ Ⲓⲥⲭⲩⲣⲟⲥ: Ⲁ̀ⲅⲓⲟⲥ Ⲁ̀ⲑⲁⲛⲁⲧⲟⲥ: ⲟ̀ ⲥⲧⲁⲩⲣⲱⲑⲓⲥ ⲇⲓ ⲏ̀ⲙⲁⲥ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ ⲏ̀ⲙⲁⲥ.',
              coptic_arabic: 'أجيوس أو ثيئوس: أجيوس إسشيروس: أجيوس أثاناتوس: أو إستافروسيس دي إيماس إليسون إيماس.',
              english: 'Holy God, Holy Mighty, Holy Immortal, who was crucified for us, have mercy upon us.'
            },
            {
              arabic: 'قدوس الله، قدوس القوي، قدوس الذي لا يموت، الذي قام من الأموات وصعد إلى السموات، ارحمنا.',
              coptic: 'Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ: Ⲁ̀ⲅⲓⲟⲥ Ⲓⲥⲭⲩⲣⲟⲥ: Ⲁ̀ⲅⲓⲟⲥ Ⲁ̀ⲑⲁⲛⲁⲧⲟⲥ: ⲟ̀ ⲁ̀ⲛⲁⲥⲧⲁⲥ ⲉⲕ ⲧⲱⲛ ⲛⲉⲕⲣⲱⲛ ⲕⲉ ⲁ̀ⲛⲉⲗⲑⲱⲛ ⲓⲥ ⲧⲟⲩⲥ ⲟⲩ̀ⲣⲁⲛⲟⲩⲥ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ ⲏ̀ⲙⲁⲥ.',
              coptic_arabic: 'أجيوس أو ثيئوس: أجيوس إسشيروس: أجيوس أثاناتوس: أو أناستاس إك تون نيكرون كي أنيلثون إس توس أورانوس إليسون إيماس.',
              english: 'Holy God, Holy Mighty, Holy Immortal, who rose from the dead and ascended into heaven, have mercy upon us.'
            }
          ]
        },
        {
          id: 'gospel-litany',
          title: { arabic: 'أوشية الإنجيل', coptic: 'Ⲧⲉⲩⲭⲏ ⲙ̀ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ', english: 'Litany of the Gospel' },
          speaker: 'priest',
          type: 'litany',
          verses: [
            {
              arabic: 'أيها السيد الرب يسوع المسيح إلهنا، الذي قال لتلاميذه القديسين ورسله الأطهار المكرمين: إن أنبياء وأبراراً كثيرين اشتهوا أن يروا ما أنتم ترون ولم يروا، وأن يسمعوا ما أنتم تسمعون ولم يسمعوا.',
              coptic: 'Ⲫ̀ⲛⲏⲃ Ⲡ̀ϭⲟⲓⲥ Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ Ⲡⲉⲛⲛⲟⲩϯ: ⲫⲏⲉ̀ⲧⲁϥϫⲟⲥ ⲛ̀ⲛⲉϥⲁⲅⲓⲟⲥ ⲙ̀ⲙⲁⲑⲏⲧⲏⲥ ⲟⲩⲟϩ ⲛ̀ⲁ̀ⲡⲟⲥⲧⲟⲗⲟⲥ ⲉⲑⲟⲩⲁⲃ ⲉⲧⲧⲁⲓⲏⲟⲩⲧ: ϫⲉ ⲟⲩⲙⲏϣ ⲙ̀ⲡ̀ⲣⲟⲫⲏⲧⲏⲥ ⲛⲉⲙ ϩⲁⲛⲑ̀ⲙⲏⲓ ⲁⲩⲉⲡⲓⲑⲩⲙⲓⲛ ⲉ̀ⲛⲁⲩ ⲉ̀ⲛⲏ ⲉ̀ⲧⲉⲧⲉⲛⲛⲁⲩ ⲉ̀ⲣⲱⲟⲩ ⲟⲩⲟϩ ⲙ̀ⲡⲟⲩⲛⲁⲩ.',
              coptic_arabic: 'إفنيف إبشويس إيسوس بيخرستوس بينوتي: في إيطاف جوس إن نيف أجيوس إمماثيتيس أووه إن أبوستولوس إثؤواب إتطايوت: جي أو ميش إمبروفيتيس نيم هان ثيمي أف إبيثيمين إيناف إيني إتيتين ناف إيرو أو أووه إمبو ناف.',
              english: 'O Master, Lord Jesus Christ our God, who said to His holy disciples and honored apostles: Many prophets and righteous men desired to see what you see, and did not see them.'
            }
          ]
        }
      ]
    },
    {
      id: 'anaphora-faithful',
      title: {
        arabic: 'قداس المؤمنين (الأنافورا والتقديس)',
        coptic: 'Ⲡⲓⲁ̀ⲛⲁⲫⲟⲣⲁ ⲛ̀ⲧⲉ ⲛⲓⲡⲓⲥⲧⲟⲥ',
        english: 'Liturgy of the Faithful (Anaphora)'
      },
      badge: 'صلاة الصلح، التقديس، وسر الإفخارستيا',
      sections: [
        {
          id: 'reconciliation-prayer',
          title: { arabic: 'صلاة الصلح (أيها الرب إله القوات)', coptic: 'Ⲡ̀ϭⲟⲓⲥ Ⲫ̀ⲛⲟⲩϯ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ', english: 'Prayer of Reconciliation' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'يا الله العظيم الأبدي، الذي جبل الإنسان على غير فساد، والموت الذي دخل إلى العالم بحسد إبليس هدمته.',
              coptic: 'Ⲫ̀ⲛⲟⲩϯ ⲡⲓⲛⲓϣϯ ⲡⲓⲉ̀ⲛⲉϩ: ⲫⲏⲉ̀ⲧⲁϥⲑⲁⲙⲓⲟ̀ ⲙ̀ⲡⲓⲣⲱⲙⲓ ϧⲉⲛ ⲟⲩⲙⲉⲧⲁⲧⲧⲁⲕⲟ: ⲟⲩⲟϩ ⲡⲓⲙⲟⲩ ⲉ̀ⲧⲁϥⲓ̀ ⲉ̀ϧⲟⲩⲛ ⲉ̀ⲡⲓⲕⲟⲥⲙⲟⲥ ϩⲓⲧⲉⲛ ⲡⲓⲫ̀ⲑⲟⲛⲟⲥ ⲛ̀ⲧⲉ ⲡⲓⲇⲓⲁⲃⲟⲗⲟⲥ: ⲁⲕϣⲟⲣϣⲣⲉϥ.',
              coptic_arabic: 'إفنوتي بي نيشتي بي إينيه: في إيطاف ثاميو إمبي رومي خين أو ميت أت تاكو: أووه بي مو إيطاف إي إيخون إيبي كوزموس هيتين بي إفثونوس إنتي بي ديافولوس: أك شورشريف.',
              english: 'O God the Great and Eternal, who formed man in incorruption, and abolished death that entered into the world through the envy of the devil.'
            }
          ]
        },
        {
          id: 'deacon-kiss-peace',
          title: { arabic: 'مرد الشماس - قبلوا بعضكم بعضاً', english: 'Deacon: Greet one another' },
          speaker: 'deacon',
          type: 'instruction',
          verses: [
            {
              arabic: 'قبلوا بعضكم بعضاً بقبلة مقدسة. يا رب ارحم.',
              coptic: 'Ⲁ̀ⲥⲡⲁⲍⲉⲥⲑⲉ ⲁ̀ⲗⲗⲏⲗⲟⲩⲥ ⲉⲛ ⲫⲓⲗⲏⲙⲁⲧⲓ ⲁ̀ⲅⲓⲱ: Ⲕⲩⲣⲓⲉ ⲉ̀ⲗⲉⲏ̀ⲥⲟⲛ.',
              coptic_arabic: 'أسبازيسثي ألي لوس إن فيليماتي أجي إو: كيريى إيليسون.',
              english: 'Greet one another with a holy kiss. Lord have mercy.'
            }
          ]
        },
        {
          id: 'anaphora-dialogue-1',
          title: { arabic: 'الأنافورا (محاورة الكاهن والشعب)', coptic: 'Ⲡⲓⲁ̀ⲛⲁⲫⲟⲣⲁ', english: 'The Anaphora Dialogue' },
          speaker: 'priest',
          type: 'anaphora',
          verses: [
            {
              arabic: 'الرب مع جميعكم.',
              coptic: 'Ⲟ̀ Ⲕⲩⲣⲓⲟⲥ ⲙⲉⲧⲁ ⲡⲁⲛⲧⲱⲛ ⲩ̀ⲙⲱⲛ.',
              coptic_arabic: 'أو كيريوس ميتا بانتون إيمون.',
              english: 'The Lord be with you all.'
            }
          ]
        },
        {
          id: 'anaphora-dialogue-2',
          title: { arabic: 'مرد الشعب - ومع روحك أيضاً', english: 'People: And with your spirit' },
          speaker: 'people',
          type: 'anaphora',
          verses: [
            {
              arabic: 'ومع روحك أيضاً.',
              coptic: 'Ⲕⲉ ⲙⲉⲧⲁ ⲧⲱ ⲡ̀ⲛⲉⲩⲙⲁⲧⲟⲥ ⲥⲟⲩ.',
              coptic_arabic: 'كي ميتا تو بنفماتوس سو.',
              english: 'And with your spirit.'
            }
          ]
        },
        {
          id: 'anaphora-dialogue-3',
          title: { arabic: 'الكاهن - ارفعوا قلوبكم', english: 'Priest: Lift up your hearts' },
          speaker: 'priest',
          type: 'anaphora',
          verses: [
            {
              arabic: 'ارفعوا قلوبكم.',
              coptic: 'Ⲁ̀ⲛⲱ ⲩ̀ⲙⲱⲛ ⲧⲁⲥ ⲕⲁⲣⲇⲓⲁⲥ.',
              coptic_arabic: 'آنو إيمون تاس كارذياس.',
              english: 'Lift up your hearts.'
            }
          ]
        },
        {
          id: 'anaphora-dialogue-4',
          title: { arabic: 'الشعب - هي عند الرب', english: 'People: We have them with the Lord' },
          speaker: 'people',
          type: 'anaphora',
          verses: [
            {
              arabic: 'هي عند الرب.',
              coptic: 'Ⲉ̀ⲭⲟⲙⲉⲛ ⲡ̀ⲣⲟⲥ ⲧⲟⲛ Ⲕⲩⲣⲓⲟⲛ.',
              coptic_arabic: 'إخومين بروس تون كيريون.',
              english: 'We have them with the Lord.'
            }
          ]
        },
        {
          id: 'anaphora-dialogue-5',
          title: { arabic: 'الكاهن - فلنشكر الرب', english: 'Priest: Let us give thanks to the Lord' },
          speaker: 'priest',
          type: 'anaphora',
          verses: [
            {
              arabic: 'فلنشكر الرب.',
              coptic: 'Ⲉⲩⲭⲁⲣⲓⲥⲧⲏⲥⲱⲙⲉⲛ ⲧⲱ Ⲕⲩⲣⲓⲱ.',
              coptic_arabic: 'إفخارستيسومين تو كيريو.',
              english: 'Let us give thanks to the Lord.'
            }
          ]
        },
        {
          id: 'anaphora-dialogue-6',
          title: { arabic: 'الشعب - مستحق وعادل', english: 'People: Meet and right' },
          speaker: 'people',
          type: 'anaphora',
          verses: [
            {
              arabic: 'مستحق وعادل.',
              coptic: 'Ⲁ̀ⲝⲓⲟⲛ ⲕⲉ ⲇⲓⲕⲉⲟⲛ.',
              coptic_arabic: 'أكسيون كي ذيكيئون.',
              english: 'It is meet and right.'
            }
          ]
        },
        {
          id: 'institution-narrative-priest',
          title: { arabic: 'تأسيس السر وتقديس القربان', coptic: 'Ⲡⲓⲧⲁϩⲟ ⲉ̀ⲣⲁⲧϥ ⲙ̀ⲡⲓⲙⲩⲥⲧⲏⲣⲓⲟⲛ', english: 'Institution Narrative' },
          speaker: 'priest',
          type: 'prayer',
          rubric: { arabic: 'يأخذ الكاهن الخبز على يديه ويرشم الصليب ثلاثاً' },
          verses: [
            {
              arabic: 'أخذ خبزاً على يديه الطاهرتين اللتين بلا عيب ولا دنس، الطوباويتين المحييتين.. وشكر، وباركه، وقدسه، وقسمه، وأعطاه لتلاميذه القديسين ورسله الأطهار قائلاً: خذوا كلوا منه كلكم، هذا هو جسدي الذي يُبذل عنكم وعن كثيرين يُعطى لمغفرة الخطايا. هذا اصنعوه لذكري.',
              coptic: 'Ⲁϥϭⲓ ⲛ̀ⲟⲩⲱⲓⲕ ⲉ̀ϫⲉⲛ ⲛⲉϥϫⲓϫ ⲉⲑⲟⲩⲁⲃ ⲟⲩⲟϩ ⲛ̀ⲁⲧⲁϭⲛⲓ ⲟⲩⲟϩ ⲛ̀ⲁⲧⲑⲱⲗⲉⲃ... ⲁϥϣⲉⲡϩⲙⲟⲧ: ⲁϥⲥ̀ⲙⲟⲩ ⲉ̀ⲣⲟϥ: ⲁϥⲧⲟⲩⲃⲟϥ: ⲁϥⲫⲁϣϥ: ⲁϥϯ ⲛ̀ⲛⲉϥⲁⲅⲓⲟⲥ ⲙ̀ⲙⲁⲑⲏⲧⲏⲥ ⲟⲩⲟϩ ⲛ̀ⲁ̀ⲡⲟⲥⲧⲟⲗⲟⲥ ⲉⲑⲟⲩⲁⲃ ⲉϥϫⲱ ⲙ̀ⲙⲟⲥ: ϫⲉ ϭⲓ ⲟⲩⲱⲙ ⲉ̀ⲃⲟⲗ ⲛ̀ϧⲏⲧϥ ⲧⲏⲣⲟⲩ: ⲫⲁⲓ ⲅⲁⲣ ⲡⲉ ⲡⲁⲥⲱⲙⲁ.',
              coptic_arabic: 'أف تشي إن أو أويك إيجين نيف جيج إثؤواب أووه إن أت أتشنى أووه إن أت ثوليب... أف شيبهوت: أف إسمو إيروف: أف توفوف: أف فاشف: أف تي إن نيف أجيوس إمماثيتيس أووه إن أبوستولوس إثؤواب إفجو إمموس: جي تشي أوم إيفول إنخيتف تيرو: فاي غار بي با سوما.',
              english: 'He took bread into His holy, spotless, undefiled, blessed, and life-giving hands... He gave thanks, blessed it, sanctified it, broke it, and gave it to His holy disciples and apostles saying: Take, eat of it all of you: for this is My Body.'
            }
          ]
        },
        {
          id: 'commemoration-saints',
          title: { arabic: 'مجمع القديسين', coptic: 'Ⲡⲓⲙⲁϩ ⲛ̀ⲛⲓⲁⲅⲓⲟⲥ', english: 'Commemoration of the Saints' },
          speaker: 'priest',
          type: 'prayer',
          verses: [
            {
              arabic: 'لأن هذا يا رب هو أمر ابنك الوحيد، أن نشترك في تذكار قديسيك: وبالأكثر القديسة الممتلئة مجداً، العذراء كل حين، والدة الإله القديسة مريم.. والقديس يوحنا المعمدان، والشهيد اسطفانوس، وناظر الإله مرقس الإنجيلي، وأبانا أنطونيوس والأنبا بولا وأبانا فلتاؤس السرياني وجميع مصاف القديسين.',
              coptic: 'Ⲉ̀ⲑⲃⲉ ϫⲉ ⲫⲁⲓ ⲡⲉ Ⲡ̀ϭⲟⲓⲥ ⲡ̀ⲟⲩⲁϩⲥⲁϩⲛⲓ ⲛ̀ⲧⲉ Ⲡⲉⲕⲙⲟⲛⲟⲅⲉⲛⲏⲥ ⲛ̀Ϣⲏⲣⲓ: ϫⲉ ⲛ̀ⲧⲉⲛⲉⲣϣ̀ⲫⲏⲣ ⲉ̀ⲡⲓⲉⲣⲫ̀ⲙⲉⲩⲓ ⲛ̀ⲧⲉ ⲛⲉⲕⲁⲅⲓⲟⲥ: ⲙⲁⲗⲓⲥⲧⲁ ϯⲁⲅⲓⲁ ⲙ̀ⲙⲉϩ ⲛ̀ⲱ̀ⲟⲩ ⲛ̀ⲥⲏⲟⲩ ⲛⲓⲃⲉⲛ ϯⲠⲁⲣⲑⲉⲛⲟⲥ ϯⲑⲉⲟ̀ⲧⲟⲕⲟⲥ ⲁⲅⲓⲁ Ⲙⲁⲣⲓⲁ.',
              coptic_arabic: 'إثفي جي فاي بي إبشويس إب أوأه ساهني إنتي بيك مونوجينيس إن شيري: جي إنتين إير إشفير إيبي إير إفميفي إنتي نيك أجيوس: ماليستا تي أجيّا إم ميه إن أو أو إن سيو نيفين تي بارثينوس تي ثيئوطوكوس أجيّا ماريا.',
              english: 'For this, O Lord, is the command of Your Only-begotten Son, that we share in the commemoration of Your saints: especially the holy, full of glory, ever-virgin Mother of God Saint Mary.'
            }
          ]
        },
        {
          id: 'confession-deacon',
          title: { arabic: 'الاعتراف الأخير', coptic: 'Ⲡⲓⲟ̀ⲙⲟⲗⲟⲅⲓⲁ', english: 'The Holy Confession' },
          speaker: 'priest',
          type: 'communion',
          verses: [
            {
              arabic: 'آمين آمين آمين، أؤمن أؤمن أؤمن وأعترف إلى النفس الأخير، أن هذا هو الجسد المحيي الذي لابنك الوحيد ربنا وإلهنا ومخلصنا يسوع المسيح، أخذه من سيدتنا كلنا والدة الإله القديسة مريم.',
              coptic: 'Ⲁ̀ⲙⲏⲛ ⲁ̀ⲙⲏⲛ ⲁ̀ⲙⲏⲛ: ϯⲛⲁϩϯ ϯⲛⲁϩϯ ϯⲛⲁϩϯ ⲟⲩⲟϩ ϯⲟ̀ⲙⲟⲗⲟⲅⲓⲛ ϣⲁ ⲡⲓⲛⲓϥⲓ ⲛ̀ϧⲁⲉ̀: ϫⲉ ⲫⲁⲓ ⲡⲉ ⲡⲓⲥⲱⲙⲁ ⲛ̀ⲣⲉϥⲧⲁⲛϧⲟ ⲛ̀ⲧⲉ Ⲡⲉⲕⲙⲟⲛⲟⲅⲉⲛⲏⲥ ⲛ̀Ϣⲏⲣⲓ Ⲡⲉⲛϭⲟⲓⲥ ⲟⲩⲟϩ Ⲡⲉⲛⲛⲟⲩϯ ⲟⲩⲟϩ Ⲡⲉⲛⲥⲱⲧⲏⲣ Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ.',
              coptic_arabic: 'آمين آمين آمين: تي ناهتي تي ناهتي تي ناهتي أووه تي أومولوجين شا بينيفي إن خاي: جي فاي بي بي سوما إن ريف تانخو إنتي بيك مونوجينيس إن شيري بينشويس أووه بينوتي أووه بين سوتير إيسوس بيخرستوس.',
              english: 'Amen, Amen, Amen. I believe, I believe, I believe and confess to the last breath, that this is the life-giving Body that Your Only-begotten Son, our Lord, God and Savior Jesus Christ took from our Lady, the Mother of God, Saint Mary.'
            }
          ]
        }
      ]
    }
  ]
};
