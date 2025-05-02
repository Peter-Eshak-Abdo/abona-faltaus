"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ExamPage() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container min-vh-100 d-flex flex-column align-items-center justify-content-center py-5"
    >
      <motion.h1
        className="mb-5 text-center fw-bold text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        نظام الاختبارات الإلكتروني
      </motion.h1>
      <div className="row row-cols-1 row-cols-md-2 g-4 w-100">
        {/* كارت الأسئلة المجمعة */}
        <motion.div
          className="col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card shadow border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title text-center text-primary fw-bold">
                  الأسئلة المجمعة
                </h5>
                <p className="card-text text-center text-muted">
                  نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
                </p>
              </div>
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={() => router.push("/exam/exam-settings")}
              >
                ابدأ الاختبار المجمع
              </button>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card shadow border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title text-center text-primary fw-bold">
                  الأسئلة المجمعة اونلاين
                </h5>
                <p className="card-text text-center text-muted">
                  نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
                </p>
              </div>
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={() => router.push("/exam/group/admin")}
              >
                ابدأ الاختبار المجمع الاونلاين
              </button>
            </div>
          </div>
        </motion.div>

        {/* كارت الأسئلة الفردية */}
        <motion.div
          className="col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card shadow border-0 h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-title text-center text-success fw-bold">
                  الأسئلة الفردية
                </h5>
                <p className="card-text text-center text-muted">
                  نظام الأسئلة الفردية مع إمكانية التنقل بين الأسئلة بحرية.
                </p>
              </div>
              <button
                className="btn btn-success w-100 mt-3"
                onClick={() => router.push("/exam/individual-questions")}
              >
                ابدأ الاختبار الفردي
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
