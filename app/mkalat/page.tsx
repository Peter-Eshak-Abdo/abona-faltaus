import Footer from "@/components/Footer";
import Header from "@/components/Header";

function Mkalat() {
  return (
    <>
      {/* <link href="../css/bootstrap/blog.rtl.css" rel="stylesheet" /> */}
      <Header />
      <div className="container">
        <header className="border-bottom lh-1 py-3">
          <div className="row flex-nowrap justify-content-between align-items-center">
            <div className="col-4 pt-1">
              <a className="link-secondary" href="#">
                الإشتراك في النشرة البريدية
              </a>
            </div>
            <div className="col-4 text-center">
              <a className="blog-header-logo text-body-emphasis text-decoration-none" href="#">
                كبير
              </a>
            </div>
            <div className="col-4 d-flex justify-content-end align-items-center">
              <a className="link-secondary" href="#" aria-label="بحث">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="mx-3"
                  role="img"
                  viewBox="0 0 24 24"
                >
                  <title>بحث</title>
                  <circle cx="10.5" cy="10.5" r="7.5" />
                  <path d="M21 21l-5.2-5.2" />
                </svg>
              </a>
              <a className="btn btn-sm btn-outline-secondary" href="#">
                إنشاء حساب
              </a>
            </div>
          </div>
        </header>

        <div className="nav-scroller py-1 mb-3 border-bottom">
          <nav className="nav nav-underline justify-content-between">
            <a className="nav-item nav-link link-body-emphasis active" href="#">
              العالم
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              الولايات المتحدة
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              التقنية
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              التصميم
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              الحضارة
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              المال والأعمال
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              السياسة
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              الرأي العام
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              العلوم
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              الصحة
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              الموضة
            </a>
            <a className="nav-item nav-link link-body-emphasis" href="#">
              السفر
            </a>
          </nav>
        </div>
      </div>

      <main className="container">
        <div className="p-4 p-md-5 mb-4 rounded text-body-emphasis bg-body-secondary">
          <div className="col-lg-6 px-0">
            <h1 className="display-4 fst-italic">عنوان تدوينة مميزة أطول</h1>
            <p className="lead my-3">
              عدة أسطر نصية متعددة تعبر عن التدوية، وذلك لإعلام القراء الجدد بسرعة وكفاءة حول أكثر الأشياء إثارة للاهتمام في محتويات هذه التدوينة.
            </p>
            <p className="lead mb-0">
              <a href="#" className="text-body-emphasis fw-bold">
                أكمل القراءة...
              </a>
            </p>
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
              <div className="col p-4 d-flex flex-column position-static">
                <strong className="d-inline-block mb-2 text-primary-emphasis">العالم</strong>
                <h3 className="mb-0">مشاركة مميزة</h3>
                <div className="mb-1 text-body-secondary">نوفمبر 12</div>
                <p className="card-text mb-auto">هذه بطاقة أوسع مع نص داعم أدناه كمقدمة طبيعية لمحتوى إضافي.</p>
                <a href="#" className="icon-link gap-1 icon-link-hover stretched-link">
                  أكمل القراءة
                  {/* <svg className="bi"><use xlink:href="#chevron-right" /></svg> */}
                </a>
              </div>
              <div className="col-auto d-none d-lg-block">
                <svg
                  className="bd-placeholder-img"
                  width="200"
                  height="250"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Placeholder: صورة مصغرة"
                  preserveAspectRatio="xMidYMid slice"
                  focusable="false"
                >
                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#55595c" />
                  <text x="50%" y="50%" fill="#eceeef" dy=".3em">
                    صورة مصغرة
                  </text>
                </svg>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
              <div className="col p-4 d-flex flex-column position-static">
                <strong className="d-inline-block mb-2 text-success-emphasis">التصميم</strong>
                <h3 className="mb-0">عنوان الوظيفة</h3>
                <div className="mb-1 text-body-secondary">نوفمبر 11</div>
                <p className="mb-auto">هذه بطاقة أوسع مع نص داعم أدناه كمقدمة طبيعية لمحتوى إضافي.</p>
                <a href="#" className="icon-link gap-1 icon-link-hover stretched-link">
                  أكمل القراءة
                  {/* <svg className="bi"><use xlink:href="#chevron-right" /></svg> */}
                </a>
              </div>
              <div className="col-auto d-none d-lg-block">
                <svg
                  className="bd-placeholder-img"
                  width="200"
                  height="250"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Placeholder: صورة مصغرة"
                  preserveAspectRatio="xMidYMid slice"
                  focusable="false"
                >
                  <title>Placeholder</title>
                  <rect width="100%" height="100%" fill="#55595c" />
                  <text x="50%" y="50%" fill="#eceeef" dy=".3em">
                    صورة مصغرة
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-5">
          <div className="col-md-8">
            <h3 className="pb-4 mb-4 fst-italic border-bottom">من Firehose</h3>

            <article className="blog-post">
              <h2 className="display-5 link-body-emphasis mb-1">مثال على تدوينة</h2>
              <p className="blog-post-meta">
                1 يناير 2021 بواسطة <a href="#"> Mark </a>
              </p>

              <p>
                تعرض مشاركة المدونة هذه بضعة أنواع مختلفة من المحتوى الذي يتم دعمه وتصميمه باستخدام Bootstrap. النصوص الأساسية، الصور، والأكواد مدعومة
                بشكل كامل.
              </p>
              <hr />
              <p>
                يشكِّل تأمين الغذاء في المستقبل قضية تؤرِّق حكومات العالَم والعلماء على حدٍّ سواء. فخلال القرن العشرين ازداد عدد سكان الأرض أربعة
                أضعاف، وتشير التقديرات إلى أن العدد سوف يصل إلى عشرة مليارات إنسان بحلول عام 2050م. وسوف تمثل هذه الزيادة الهائلة تحدياً كبيراً وضغطاً
                متصاعداً على قدرة الإنتاج الزراعي. الأمر الذي كان ولا بد من أن يدفع إلى تطوير تقنيات مبتكرة في تصنيع الغذاء غير الزراعة، منها تقنية
                مستقبلية تقوم على تصنيع الغذاء من الهواء.
              </p>
              <blockquote className="blockquote">
                <p>
                  تشغل الزراعة مساحات كبيرة من اليابسة، وتستهلك كميات هائلة من المياه، كما أن إنتاج الغذاء بواسطة الزراعة يسهم بنسبة عالية من انبعاثات
                  غازات الاحتباس الحراري العالمية
                </p>
              </blockquote>
              <p>
                تشغل الزراعة مساحات كبيرة من اليابسة، وتستهلك كميات هائلة من المياه. كما أن إنتاج الغذاء بواسطة الزراعة يسهم بنسبة عالية من انبعاثات
                غازات الاحتباس الحراري العالمية، وللمقارنة فإن هذه النسبة من الانبعاثات هي أكبر مما ينتجه قطاع النقل بكل ما فيه من سيارات وشاحنات
                وطائرات وقطارات.
              </p>
              <h2>عنوان</h2>
              <p>
                تحصل النباتات على غذائها بواسطة عملية تسمى البناء الضوئي، حيث تقوم النباتات بتحويل ضوء الشمس والماء وثاني أكسيد الكربون الموجود في
                الغلاف الجوي إلى غذاء وتطلق الأكسجين كمنتج ثانوي لهذا التفاعل الكيميائي. وتحدث هذه العملية في &ldquo;البلاستيدات الخضراء&ldquo;.
                فالنباتات تستفيد من طاقة ضوء الشمس في تقسيم الماء إلى هيدروجين وأكسجين، وتحدث تفاعلات كيميائية أخرى ينتج عنها سكر الجلكوز الذي تستخدمه
                كمصدر للغذاء وينطلق الأكسجين من النباتات إلى الغلاف الجوي. وهذا يعني أن النباتات تحوِّل ثاني أكسيد الكربون إلى غذاء من خلال تفاعلات
                كيميائية معقَّدة. ويُعد البناء الضوئي من أهم التفاعلات الكيميائية على كوكب الأرض، فقد ساعد في الماضي على تطوُّر كوكبنا وظهور الحياة
                عليه. فالنباتات تستخدم ثاني أكسيد الكربون لصنع غذائها، وتطلق الأكسجين لتساعد الكائنات الأخرى على التنفس!
              </p>
              <h3>عنوان فرعي</h3>
              <p>
                ألهمت هذه العملية علماء وكالة الفضاء الأمريكية (ناسا) خلال الستينيات من القرن الماضي، لبحث فكرة إطعام روَّاد الفضاء في مهمات الفضاء
                الطويلة مثل السفر إلى المريخ. وكانت واحدة من الأفكار الواعدة تصنيع الغذاء عن طريق ثاني أكسيد الكربون الذي ينتجه روَّاد الفضاء، لكن ليس
                بواسطة النباتات بل عن طريق ميكروبات صغيرة وحيدة الخلية قادرة على حصد ثاني أكسيد الكربون لإنتاج كميات وفيرة من البروتين المغذي على شكل
                مسحوق عديم النكهة، كما يمكن استخدام المادة في صنع الأطعمة المألوفة لدينا.
              </p>
              <pre>
                <code>Example code block</code>
              </pre>
              <p>
                وخلافاً لما هو الحال في عالم النبات، فإن هذه الميكروبات لا تستخدم الضوء كما يحدث في عملية البناء الضوئي التي تستخدمها النباتات للحصول
                على الغذاء، أي لأنها قادرة على النمو في الظلام. تسمى هذه البكتريا &ldquo;هيدروجينوتروف&ldquo; (Hydrogenotrophs)، وهي تستخدم الهيدروجين
                كوقود لإنتاج الغذاء من ثاني أكسيد الكربون. فعندما يُنتج روَّاد الفضاء ثاني أكسيد الكربون، تلتقطه الميكروبات، ويتحوَّل مع مدخلات أخرى
                إلى غذاء غني بالكربون. وبهذه الطريقة سوف نحصل على دورة كربون مغلقة الحلقة.
              </p>
              <h3>عنوان فرعي</h3>
              <p>
                بعد مرور أكثر من نصف قرن على أبحاث ناسا، تعمل حالياً عدة شركات في قطاع البيولوجيا التركيبية من ضمنها إير بروتين (Air Protein) وسولار
                فودز (Solar Foods) على تطوير جيل جديد من المنتجات الغذائية المستدامة، من دون وجود بصمة كربونية. ولن تقتصر هذه المنتجات الغذائية على
                روَّاد الفضاء فحسب، بل سوف تمتد لتشمل جميع سكان الأرض، وسوف تُنتَج في فترة زمنية قصيرة، بدلاً من الشهور، ومن دون الاعتماد على الأراضي
                الزراعية. وهذا يعني الحصول على منتجات غذائية بشكل سريع جداً. كما سيصبح من الممكن تصنيع الغذاء بطريقة عمودية من خلال هذه الميكروبات،
                بدلاً من الطريقة الأفقية التقليدية الشبيهة بتقنية الزراعة العمودية الحديثة. وهذا يعني توفير منتجات غذائية أكبر من المساحة نفسها.
              </p>
              <p>يتكوَّن الغذاء البشري من ثلاثة أنواع رئيسة، هي:</p>
              <ul>
                <li>البروتينات</li>
                <li>الكربوهيدرات</li>
                <li>الدهون</li>
              </ul>
              <p>
                وتتكوَّن البروتينات من الأحماض الأمينية، وهي مجموعة من المركبات العضوية يبلغ عددها في جسم الإنسان عشرين حمضاً أمينياً، من بينها تسعة
                أساسية يحصل عليها الجسم من الغذاء. وتتكوَّن الأحماض الأمينية بشكل أساس من:
              </p>
              <ol>
                <li>الكربون</li>
                <li>الهيدروجين</li>
                <li>الأكسجين</li>
                <li>النيتروجين</li>
              </ol>
              <p>
                ومن الملاحظ أن النيتروجين يشكِّل نسبة %78 من الهواء، كما أن الهيدروجين نحصل عليه من خلال التحليل الكهربائي للماء، ومن الممكن نظرياً
                سحب الكربون من الهواء لتشكيل هذه الأحماض، ذلك أن الكربون هو العمود الفقري للأحماض الأمينية، كما أن الحياة على كوكب الأرض قائمة على
                الكربون لقدرته على تكوين سلاسل كربونية طويلة، وهذا ما تفعله الميكروبات بتصنيع أحماض أمينية من ثاني أكسيد الكربون من خلال مجموعة من
                التفاعلات الكيميائية المعقَّدة. وإضافة إلى صنع وجبات غنية بالبروتين، فهذه الميكروبات تنتج منتجات أخرى مثل الزيوت التي لها عديد من
                الاستخدامات.
              </p>
            </article>

            <article className="blog-post">
              <h2 className="display-5 link-body-emphasis mb-1">تدوينة أخرى</h2>
              <p className="blog-post-meta">
                23 ديسمبر 2020 بواسطة <a href="#">Jacob</a>
              </p>

              <p>
                في الوقت الحالي، تدرس عدَّة شركات هذه الميكروبات بشكل أعمق، وتستزرعها من أجل الحصول على الغذاء. ففي عام 2019م، أعلن باحثون في شركة
                (Air Protein) الأمريكية نجاحهم في تحويل ثاني أكسيد الكربون الموجود في الهواء إلى لحوم صناعية مصنوعة من البروتين، التي لا تتطلَّب أي
                أرض زراعية، بل هي معتمدة بشكل أساسي على الهواء.
              </p>
              <blockquote>
                <p>تم تصنيع اللحوم بأنواع عديدة</p>
              </blockquote>
              <p>
                إذ استخدم هؤلاء الباحثون الهواء والطاقة المتجدِّدة كمدخلات في عملية مشابهة للتخمير، لإنتاج بروتين يحتوي على الأحماض الأمينية التسعة
                الأساسية وغني بالفيتامينات والمعادن، كما أنه خالٍ من الهرمونات والمضادات الحيوية والمبيدات الحشرية ومبيدات الأعشاب.
              </p>
              <p>
                وتم تصنيع اللحوم بأنواع عديدة بما فيها الدواجن والأبقار والمأكولات البحرية، من دون حصول انبعاثات كربونية، على عكس تربية الأبقار التي
                تسهم في انبعاث غاز الميثان أحد غازات الاحتباس الحراري.
              </p>
            </article>

            <article className="blog-post">
              <h2 className="display-5 link-body-emphasis mb-1">ميزة جديدة</h2>
              <p className="blog-post-meta">
                14 ديسمبر 2020 بواسطة <a href="#">Jacob</a>
              </p>

              <p>
                كما أن الشركة الفنلندية (Solar Foods) طوَّرت تقنية لإنتاج البروتين من الهواء، حيث تبدأ العملية بتقسيم الماء إلى مكوناته الهيدروجين
                والأكسجين عن طريق الكهرباء. فالهيدروجين يوفِّر الطاقة للبكتريا لتحويل ثاني أكسيد الكربون والنيتروجين الموجودين في الهواء إلى مادة
                عضوية غنية بالبروتين بشكل أكفأ من نمو النباتات باستخدام البناء الضوئي. وهذا البروتين يشبه دقيق القمح وقد أطلق عليه اسم
                &ldquo;سولين&ldquo; (Solein).
              </p>
              <p>
                وتقوم الشركة حالياً بجمع البيانات حول المنتج الغذائي لتقديمه إلى الاتحاد الأوروبي بهدف الحصول على ترخيص غذائي، كما أنها تخطط لبدء
                الإنتاج التجاري في العام المقبل 2021م. وقد أوضحت الشركة أنها مهتمة بإنتاج أطعمة صديقة للبيئة من خلال استخدام المواد الأساسية: الكهرباء
                وثاني أكسيد الكربون، وهذه الأطعمة سوف تجنبنا الأثر السلبي البيئي للزراعة التقليدية الذي يشمل كل شيء من استخدام الأرض والمياه إلى
                الانبعاثات الناتجة من تسميد المحاصيل أو تربية الحيوانات.
              </p>
              <p>وعلى هذا، فإن البروتينات المشتقة من الميكروبات سوف:</p>
              <ul>
                <li>توفر حلاً ممكناً في ظل زيادة الطلب العالمي المستقبلي على الغذاء</li>
                <li>تتوسع مصانع الغذاء في المستقبل لتكون أكفأ وأكثر استدامة</li>
                <li>تصبح قادرة على توفير الغذاء لروَّاد الفضاء في سفرهم إلى المريخ وجميع سكان كوكب الأرض في عام 2050م</li>
              </ul>
              <p>
                فتخيّل أن الميكروبات ستكون مصانع المستقبل، وأن غذاء المستقبل سيكون مصنوعاً من الهواء! وأن عام 2050م سيكون مختلفاً تماماً عن عالمنا
                اليوم. فهو عالم من دون زراعة ولا تربية حيوانات من أجل الغذاء! قد يبدو ذلك خيالياً لكنه ليس مستحيلاً!
              </p>
            </article>

            <nav className="blog-pagination" aria-label="Pagination">
              <a className="btn btn-outline-primary rounded-pill" href="#">
                تدوينات أقدم
              </a>
              <a className="btn btn-outline-secondary rounded-pill disabled" aria-disabled="true">
                تدوينات أحدث
              </a>
            </nav>
          </div>

          <div className="col-md-4">
            <div className="position-sticky" style={{ top: "2rem" }}>
              <div className="p-4 mb-3 bg-body-tertiary rounded">
                <h4 className="fst-italic">حول</h4>
                <p className="mb-0">
                  أقبلت، فأقبلت معك الحياة بجميع صنوفها وألوانها: فالنبات ينبت، والأشجار تورق وتزهر، والهرة تموء، والقمري يسجع، والغنم يثغو، والبقر
                  يخور، وكل أليف يدعو أليفه. كل شيء يشعر بالحياة وينسي هموم الحياة، ولا يذكر إلا سعادة الحياة، فإن كان الزمان جسدا فأنت روحه، وإن كان
                  عمرا فأنت شبابه.
                </p>
              </div>

              <div>
                <h4 className="fst-italic">المشاركات الاخيرة</h4>
                <ul className="list-unstyled">
                  <li>
                    <a
                      className="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top"
                      href="#"
                    >
                      <svg
                        className="bd-placeholder-img"
                        width="100%"
                        height="96"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        preserveAspectRatio="xMidYMid slice"
                        focusable="false"
                      >
                        <rect width="100%" height="100%" fill="#777" />
                      </svg>
                      <div className="col-lg-8">
                        <h6 className="mb-0">مثال على عنوان منشور المدونة</h6>
                        <small className="text-body-secondary">15 يناير 2024</small>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      className="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top"
                      href="#"
                    >
                      <svg
                        className="bd-placeholder-img"
                        width="100%"
                        height="96"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        preserveAspectRatio="xMidYMid slice"
                        focusable="false"
                      >
                        <rect width="100%" height="100%" fill="#777" />
                      </svg>
                      <div className="col-lg-8">
                        <h6 className="mb-0">هذا عنوان آخر للمدونة</h6>
                        <small className="text-body-secondary">14 يناير 2024</small>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      className="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top"
                      href="#"
                    >
                      <svg
                        className="bd-placeholder-img"
                        width="100%"
                        height="96"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        preserveAspectRatio="xMidYMid slice"
                        focusable="false"
                      >
                        <rect width="100%" height="100%" fill="#777" />
                      </svg>
                      <div className="col-lg-8">
                        <h6 className="mb-0">أطول عنوان منشور للمدونة: يحتوي هذا الخط على عدة أسطر!</h6>
                        <small className="text-body-secondary">13 يناير 2024</small>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="p-4">
                <h4 className="fst-italic">الأرشيف</h4>
                <ol className="list-unstyled mb-0">
                  <li>
                    <a href="#">مارس 2021</a>
                  </li>
                  <li>
                    <a href="#">شباط 2021</a>
                  </li>
                  <li>
                    <a href="#">يناير 2021</a>
                  </li>
                  <li>
                    <a href="#">ديسمبر 2020</a>
                  </li>
                  <li>
                    <a href="#">نوفمبر 2020</a>
                  </li>
                  <li>
                    <a href="#">أكتوبر 2020</a>
                  </li>
                  <li>
                    <a href="#">سبتمبر 2020</a>
                  </li>
                  <li>
                    <a href="#">اغسطس 2020</a>
                  </li>
                  <li>
                    <a href="#">يوليو 2020</a>
                  </li>
                  <li>
                    <a href="#">يونيو 2020</a>
                  </li>
                  <li>
                    <a href="#">مايو 2020</a>
                  </li>
                  <li>
                    <a href="#">ابريل 2020</a>
                  </li>
                </ol>
              </div>

              <div className="p-4">
                <h4 className="fst-italic">في مكان آخر</h4>
                <ol className="list-unstyled">
                  <li>
                    <a href="#">GitHub</a>
                  </li>
                  <li>
                    <a href="#">Twitter</a>
                  </li>
                  <li>
                    <a href="#">Facebook</a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Mkalat;

