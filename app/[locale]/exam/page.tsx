"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLoading } from "@/app/loading-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ExamPage() {
  const t = useTranslations('Exams');
  const router = useRouter();
  const [examCode, setExamCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = examCode.trim();
    if (!cleanCode) {
      toast.error("يرجى إدخال كود الامتحان");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const { getQuiz } = await import("@/lib/supabase-utils");
      const quiz = await getQuiz(cleanCode);
      if (quiz) {
        toast.success(`تم العثور على المسابقة: ${quiz.title}`);
        router.push(`/exam/quiz/quiz/${quiz.id}/join`);
      } else {
        toast.error("كود الامتحان غير صحيح أو المسابقة غير موجودة");
      }
    } catch (err) {
      toast.error("تعذر التحقق من كود الامتحان");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-1 backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-4xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="text-center mb1">
          <h1 className="text-5xl font-bold mb-1 text-black drop-shadow-lg">{t('title')}</h1>
          <p className="text-black/90 drop-shadow-md">{t('subtitle')}</p>
        </div>

        {/* كارت الدخول السريع بكود الامتحان */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto w-full mb-4"
        >
          <Card className="border-amber-500/40 bg-white/90 dark:bg-zinc-900/90 shadow-xl backdrop-blur-md">
            <CardContent className="p-4">
              <form onSubmit={handleJoinWithCode} className="flex flex-col sm:flex-row gap-2 items-center">
                <div className="relative flex-1 w-full">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                  <Input
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    placeholder="أدخل كود الامتحان (مثال: 819203)"
                    className="pr-10 text-center font-mono font-bold tracking-widest text-base rounded-2xl h-11 border-stone-300 dark:border-zinc-700"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isVerifyingCode || !examCode.trim()}
                  className="w-full sm:w-auto h-11 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-1 shrink-0"
                >
                  {isVerifyingCode ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>دخول الامتحان</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
          {/* كارت الأسئلة المجمعة */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full space-y-1">
              <CardHeader>
                <CardTitle className="text-center text-blue-600 font-bold text-2xl">
                  {t('groupedTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between space-y-1">
                <p className="text-center text-gray-600">
                  {t('groupedDesc')}
                </p>
                <Button
                  variant="default" size="normal" className="text-black font-bold"
                  onClick={() => {
                    useLoading;
                    router.push("/exam/exam-settings");
                  }}
                  type="button"
                >
                  {t('startGrouped')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* كارت الأسئلة الفردية */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full space-y-1">
              <CardHeader>
                <CardTitle className="text-center text-green-600 font-bold text-2xl">
                  {t('individualTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between space-y-1">
                <p className="text-center text-gray-600">
                  {t('individualDesc')}
                </p>
                <Button
                  variant="default" size="normal" className="text-black font-bold"
                  onClick={() => {
                    useLoading;
                    router.push("/exam/individual-questions");
                  }}
                  type="button"
                >
                  {t('startIndividual')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* كارت الأسئلة كاهوت */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full space-y-1">
              <CardHeader>
                <CardTitle className="text-center text-green-600 font-bold text-2xl">
                  {t('kahootTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between space-y-1">
                <p className="text-center text-gray-600">
                  {t('kahootDesc')}
                </p>
                <Button
                  variant="default" size="normal" className="text-black font-bold"
                  onClick={() => {
                    useLoading;
                    router.push("/exam/quiz/dashboard");
                  }}
                  type="button"
                >
                  {t('startKahoot')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
