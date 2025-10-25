"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLoading } from "../loading-context";
import SkeletonLoader from "@/components/SkeletonLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExamPage() {
  const router = useRouter();
  const { loading, setLoading } = useLoading();

  return (
    <>
      {loading && <SkeletonLoader />}
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="w-full max-w-7xl space-y-4 backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-4xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
          <div className="text-center mb-3">
            <h1 className="text-5xl font-bold mb-2 text-black drop-shadow-lg">نظام الاختبارات الإلكتروني</h1>
            <p className="text-black/90 drop-shadow-md">اختر نوع الاختبار المناسب لك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* كارت الأسئلة المجمعة */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full space-y-2">
                <CardHeader>
                  <CardTitle className="text-center text-blue-600 font-bold text-2xl">
                    الأسئلة المجمعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between space-y-2">
                  <p className="text-center text-gray-600">
                    نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
                  </p>
                  <Button
                    variant="default" size="normal" className="text-black font-bold"
                    onClick={() => {
                      setLoading(true);
                      router.push("/exam/exam-settings");
                    }}
                    type="button"
                  >
                    ابدأ الاختبار المجمع
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* كارت الأسئلة المجمعة اونلاين */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full space-y-2">
                <CardHeader>
                  <CardTitle className="text-center text-blue-600 font-bold text-2xl">
                    الأسئلة المجمعة اونلاين
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between space-y-2">
                  <p className="text-center text-gray-600">
                    نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="default" size="normal" className="text-black font-bold"
                      onClick={() => {
                        setLoading(true);
                        router.push("/exam/group/admin");
                      }}
                      type="button"
                    >
                      إنشاء غرفة
                    </Button>
                    <Button
                      variant="default" size="normal" className="text-black font-bold"
                      onClick={() => {
                        setLoading(true);
                        router.push("/exam/group/join");
                      }}
                      type="button"
                    >
                      انضم إلى غرفة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* كارت الأسئلة الفردية */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full space-y-2">
                <CardHeader>
                  <CardTitle className="text-center text-green-600 font-bold text-2xl">
                    الأسئلة الفردية
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between space-y-2">
                  <p className="text-center text-gray-600">
                    نظام الأسئلة الفردية مع إمكانية التنقل بين الأسئلة بحرية.
                  </p>
                  <Button
                    variant="default" size="normal" className="text-black font-bold"
                    onClick={() => {
                      setLoading(true);
                      router.push("/exam/individual-questions");
                    }}
                    type="button"
                  >
                    ابدأ الاختبار الفردي
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
              <Card className="h-full space-y-2">
                <CardHeader>
                  <CardTitle className="text-center text-green-600 font-bold text-2xl">
                    الأسئلة الكاهوتية
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between space-y-2">
                  <p className="text-center text-gray-600">
                    نظام الأسئلة الكاهوتية مع إمكانية التنقل بين الأسئلة بحرية.
                  </p>
                  <Button
                    variant="default" size="normal" className="text-black font-bold"
                    onClick={() => {
                      setLoading(true);
                      router.push("/exam/quiz/dashboard");
                    }}
                    type="button"
                  >
                    ابدأ الاختبار الكاهوتي
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
