"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLoading } from "@/app/loading-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ExamPage() {
  const t = useTranslations('Exams');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-1 backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-4xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="text-center mb1">
          <h1 className="text-5xl font-bold mb-1 text-black drop-shadow-lg">{t('title')}</h1>
          <p className="text-black/90 drop-shadow-md">{t('subtitle')}</p>
        </div>
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
