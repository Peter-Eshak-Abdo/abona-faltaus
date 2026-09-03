"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Church,
  BookOpen,
  Music,
  FileText,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  ShieldAlert,
  HeartHandshake,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  subtitle: string;
  desc: string;
  icon: any;
  color: string;
  highlightAction: string;
}

const SERVANT_TOUR_STEPS: Step[] = [
  {
    title: "أهلاً بك يا خادم المسيح في موقع أبونا فلتاؤس!",
    subtitle: "المنصة الأرثوذكسية الشاملة لخدمة الكنيسة والشباب والألحان",
    desc: "تم تصميم هذا الموقع ليكون رفيقك الروحي والكنسي اليومي، حيث يجمع كل ما تحتاجه للتحضير، الخدمة، التعليم، والصلاة في مكان واحد وبأحدث تقنيات الذكاء الاصطناعي الأرثوذكسي.",
    icon: Church,
    color: "from-amber-600 to-yellow-500",
    highlightAction: "جولة سريعة وممتعة للتعرف على أهم الأدوات المتاحة لك",
  },
  {
    title: "1. نوتة التحضير الذكية وصانع العروض (Slides)",
    subtitle: "إعداد دروس مدارس الأحد والعظات والشرائح بضغطة زر",
    desc: "أداة ذكية تمكنك من تحضير دروس الخدمة، وتوليد عروض PowerPoint (PPTX) ونوتات PDF جاهزة للشرح والعرض في قاعات الكنيسة مع ربط الآيات وشواهد الكتاب المقدس.",
    icon: FileText,
    color: "from-teal-600 to-emerald-500",
    highlightAction: "توفير وقت التحضير مع الحفاظ على العمق الآبائي والطقسي",
  },
  {
    title: "2. صندوق صراحة وأسئلة المخدومين السرية",
    subtitle: "استقبال أسئلة واستفسارات الشباب بخصوصية تامة 100%",
    desc: "أنشئ رابط صراحة خاص بك كخادم وشاركه مع أسرة الخدمة. يتيح للمخدومين طرح أسئلتهم الصعبة أو مشكلاتهم الروحية بحرية كاملة دون ظهور أي بيانات عن هويتهم.",
    icon: HeartHandshake,
    color: "from-rose-600 to-pink-500",
    highlightAction: "فتح باب الحوار الروحي وبناء جسور الثقة مع المخدومين",
  },
  {
    title: "3. مولد الأيقونات والصور الأرثوذكسية الذكي",
    subtitle: "رسم الأيقونات القبطية بمدارس الفن الكنسي المعتمدة",
    desc: "محرك فني مدرب على مدرسة د. إيساك فانوس والبيزنطي الكلاسيكي، مع استخراج الأسماء القبطية والتأملات اللاهوتية الرصينة لكل قديس ومشهد إنجيلي.",
    icon: Sparkles,
    color: "from-amber-500 to-orange-600",
    highlightAction: "توليد أيقونات كنسية نقية بدون تشوهات وبأعلى جودة",
  },
  {
    title: "4. المكتبة الليتورجية (السنكسار، الألحان، الإنجيل، التسبحة)",
    subtitle: "قراءات اليوم وتصفح كامل بدون الحاجة لاتصال إنترنت",
    desc: "تصفح السنكسار اليومي، هزات وتسجيلات الألحان التراثية، والأجبية مع خاصية التحميل الأوفلاين للعمل داخل الكنائس والمناطق ضعيفة التغطية.",
    icon: BookOpen,
    color: "from-blue-600 to-indigo-600",
    highlightAction: "تطبيق كامل PWA مثبت على هاتفك وحاسوبك",
  },
];

const ONBOARDING_STORAGE_KEY = "servant_onboarding_completed_v1";

export default function ServantOnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // فحص ما إذا كان الخادم يزور الموقع لأول مرة
    const hasSeenTour = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < SERVANT_TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleOpenManually = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = SERVANT_TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <>
      {/* زر عائم أو استدعاء يدوي لدليل الخادم */}
      <button
        onClick={handleOpenManually}
        className="fixed bottom-1 left-1 z-40 pointer-events-auto bg-amber-600/90 hover:bg-amber-600 text-white p-0.5 sm:px-1 sm:py-0.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-0.5 text-xs font-bold transition hover:scale-105 border border-amber-400/40"
        title="دليل مزايا الموقع للخادم"
      >
        <Sparkles className="w-2 h-2 text-yellow-300 animate-spin-slow" />
        <span className="hidden sm:inline">دليل مزايا الخادم</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleComplete();
              }
            }}
            className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-0.5 sm:p-1 bg-black/80 backdrop-blur-md cursor-pointer"
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.2)] flex flex-col text-stone-100 cursor-default pointer-events-auto"
            >
              {/* Top Accent Gradient Header */}
              <div className={`p-0.5 sm:p-1 bg-linear-to-r ${step.color} relative flex items-center justify-between text-white shadow-md`}>
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    <StepIcon className="w-2 h-2 text-white" />
                  </div>
                  <div>
                    <span className="text-[20px] font-bold uppercase tracking-wider bg-black/20 px-0.5 py-0.25 rounded-full">
                      خطوة {currentStep + 1} من {SERVANT_TOUR_STEPS.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleComplete}
                  className="p-0.5 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition"
                  title="إغلاق الدليل"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content with Animation */}
              <div className="p-0.5 sm:p-1 space-y-0.5 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-0.5 text-right"
                  >
                    <h2 className="text-2xl sm:text-2xl font-bold text-amber-200 leading-snug">
                      {step.title}
                    </h2>
                    <p className="text-lg sm:text-lg font-semibold text-amber-400/90">
                      {step.subtitle}
                    </p>
                    <p className="text-lg sm:text-lg text-stone-300 leading-relaxed pt-0.5 font-sans">
                      {step.desc}
                    </p>

                    <div className="mt-0.5 p-0.5 rounded-2xl bg-amber-950/40 border border-amber-500/20 text-lg text-amber-200 flex items-center gap-0.5 font-medium">
                      <Sparkles className="w-2 h-2 text-amber-400 shrink-0" />
                      <span>{step.highlightAction}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer navigation */}
              <div className="p-0.5 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-0.5">
                {/* Step Indicators (Dots) */}
                <div className="flex items-center gap-0.25">
                  {SERVANT_TOUR_STEPS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentStep === idx
                          ? "w-4 bg-amber-400"
                          : "w-1.5 bg-stone-700 hover:bg-stone-500"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-0.5">
                  {currentStep > 0 && (
                    <Button
                      onClick={handlePrev}
                      variant="ghost"
                      className="rounded-xl bg-linear-to-r text-xs from-stone-500 to-stone-600 hover:from-stone-400 hover:to-stone-500 text-stone-400 hover:text-500 w-7"
                    >
                      <ChevronRight className="w-1 h-1.5" />
                      <span>السابق</span>
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-0.25 w-7"
                  >
                    {currentStep === SERVANT_TOUR_STEPS.length - 1 ? (
                      <>
                        <Check className="w-1 h-1.5" />
                        <span>ابدأ الاستخدام الآن</span>
                      </>
                    ) : (
                      <>
                        <span>التالي</span>
                        <ChevronLeft className="w-1 h-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
