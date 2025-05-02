// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import io from "socket.io-client";

// const socket = io("http://localhost:3001");
// export default function ExamRoom() {
//   const { roomId } = useParams();
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // <-- إضافة هذا المتغير

//   useEffect(() => {
//     // إضافة listeners للاتصال
//     socket.on("connect", () => {
//       console.log("✅ Connected to socket server");
//       socket.emit("join-room", roomId); // <-- تأكيد انضمام للغرفة
//     });

//     socket.on("reconnect_attempt", () => {
//       console.log("محاولة إعادة الاتصال...");
//     });

//     socket.on("reconnect", () => {
//       console.log("تم إعادة الاتصال بنجاح");
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected from socket server");
//     });

//     socket.on("new-question", (question) => {
//       console.log("📥 Received question:", question);
//       setCurrentQuestion({
//         question: question.question, // التأكد من اسم الحقل
//         options: question.options,
//         time: question.time,
//         questionNumber: question.questionNumber,
//         totalQuestions: question.totalQuestions,
//       });
//       setTimeLeft(question.time);
//       setCurrentQuestionIndex(question.questionNumber); // تحديث الفهرس بشكل صحيح
//     });

//     socket.on("exam-ended", () => {
//       setCurrentQuestion(null);
//       alert("انتهى الامتحان - تم إرسال جميع الأسئلة");
//     });

//     socket.on("error", (err) => {
//       console.error("Socket error:", err);
//       alert(`خطأ تقني: ${err.message}`);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [roomId]);

//   // useEffect(() => {
//   //   socket.on("broadcast-question", (data) => {
//   //     if (data.roomId === roomId) {
//   //       setCurrentQuestion({
//   //         question: data.question.text,
//   //         options: data.question.options,
//   //         time: data.question.time,
//   //         questionNumber: data.question.questionNumber,
//   //         totalQuestions: data.question.totalQuestions,
//   //       });
//   //       setTimeLeft(data.question.time);
//   //     }
//   //   });
//   // }, [roomId]);

//   // مؤقت العد التنازلي
//   useEffect(() => {
//     if (timeLeft <= 0) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft]);

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       {currentQuestion ? (
//         <div className="bg-white p-6 rounded-xl shadow-lg">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold">
//               السؤال {currentQuestionIndex} {/* استخدام القيمة المحدثة */}
//             </h1>
//             <div className="bg-red-500 text-white px-4 py-2 rounded">
//               ⏳ {timeLeft} ثانية
//             </div>
//           </div>

//           <div className="mb-6">
//             <h2 className="text-xl font-semibold mb-4">السؤال:</h2>
//             <p className="text-lg">{currentQuestion.question}</p>{" "}
//             {/* تصحيح اسم الحقل */}
//           </div>

//           <div className="space-y-3">
//             {currentQuestion.options?.length > 0 ? (
//               currentQuestion.options.map((option, index) => (
//                 <button key={index}>{option}</button>
//               ))
//             ) : (
//               <p>لا توجد خيارات متاحة لهذا السؤال</p>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <h2 className="text-2xl font-bold mb-4">🎓 في انتظار بدء الامتحان</h2>
//           <p className="text-gray-600">رقم الغرفة: {roomId}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// app/exam/group/session/[roomId]/ExamRoom.jsx
// app/exam/group/session/[roomId]/ExamRoom.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  path: "/socket.io", // تأكد المسار بدون slash زائد
  transports: ["websocket"], // فقط WebSocket، لا polling
  withCredentials: true,
});

export default function ExamRoom() {
  const { roomId } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState({});
  const [shareImageURL, setShareImageURL] = useState(null);
  const [questionStatus, setQuestionStatus] = useState({});

  useEffect(() => {
    socket.on("connect", () => socket.emit("join-room", roomId));
    socket.on("new-question", (q) => {
      // setQuestions((prev) => (prev.length ? prev : questions.concat(q)));
      setQuestions((prev) => (prev.length ? prev : prev.concat(q)));
      setCurrentQuestion(q);
      setTimeLeft(q.time);
    });
    socket.on("exam-ended", () => setQuizFinished(true));
    return () => socket.disconnect();
  }, [roomId]);

  useEffect(() => {
    if (!timeLeft) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const handleAnswer = (option) => {
    setSelectedAnswers((ans) => ({
      ...ans,
      [currentQuestion.questionNumber]: option,
    }));
    if (option === currentQuestion.correct) setScore((s) => s + 1);
    setQuestionStatus((prev) => ({
      ...prev,
      [currentQuestion.questionNumber]: true, // ← استخدام questionNumber كـ key
      //   [currentId]: true,
    }));
  };

  const changeQuestion = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentQuestionIndex(idx);
    setCurrentQuestion(questions[idx]);
    setTimeLeft(questions[idx].time);
  };

  const handleFinishQuiz = () => {
    const counts = {};
    questions.forEach(
      (q) => (counts[q.category] = (counts[q.category] || 0) + 1)
    );
    setCategoriesCount(counts);
    setQuizFinished(true);
  };

  const formatTime = (sec) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const generateShareImage = async () => {
    const element = document.getElementById("result-share-box");
    if (!element) return;

    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL("image/png");
    setShareImageURL(dataUrl);

    // مشاركة عبر Web Share API (للأجهزة التي تدعمه)
    if (navigator.canShare && navigator.canShare({ files: [] })) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "result.png", { type: "image/png" });
        navigator.share({
          title: "نتيجتي في الامتحان 🎉",
          text: "جرب تطبيق الاختبارات هذا!",
          files: [file],
        });
      });
    }
  };

  const renderPagination = useCallback(
    () => (
      <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
        {questions.map((q, index) => {
          const answered = selectedAnswers[q.id];
          const status = questionStatus[q.id];
          return (
            <button
              key={q.id}
              className={`btn btn-sm rounded-circle ${
                currentQuestionIndex === index
                  ? "btn-primary"
                  : answered
                  ? status
                    ? "btn-success"
                    : "btn-danger"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
              style={{ width: 36, height: 36 }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    ),
    [questions, selectedAnswers, questionStatus, currentQuestionIndex]
  );

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-75 p-3 position-relative">
      <div className="position-absolute w-100 top-0 start-0">
        <div className="wave-animation"></div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={quizFinished ? "result" : currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded shadow w-100 w-md-75"
        >
          {quizFinished ? (
            <ResultShareBox
              score={score}
              total={questions.length}
              categoriesCount={categoriesCount}
              shareImageURL={shareImageURL}
              generateShareImage={generateShareImage}
              onBack={() => router.push("/exam")}
            />
          ) : currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              total={questions.length}
              timeLeft={timeLeft}
              formatTime={formatTime}
              selectedAnswers={selectedAnswers}
              handleAnswer={handleAnswer}
              changeQuestion={changeQuestion}
              onFinish={handleFinishQuiz}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  total,
  timeLeft,
  formatTime,
  selectedAnswers,
  handleAnswer,
  changeQuestion,
  onFinish,
}) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span
          className={`text-muted ${
            selectedAnswers[question.questionNumber]
              ? "text-primary"
              : "text-danger"
          }`}
        >
          سؤال {index + 1} من {total}
        </span>

        {timeLeft > 0 && (
          <div
            className={`badge ${
              timeLeft < 60 ? "bg-danger" : "bg-warning"
            } text-dark`}
          >
            الوقت المتبقي: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="badge bg-secondary">{question.category}</span>
      </div>

      <div className="mb-4">
        <h2 className="h5">{question.question}</h2>
        {question.type === "mcq" && (
          <small className="text-muted">اختر الإجابة الصحيحة</small>
        )}
      </div>

      <div className="d-grid gap-3 mb-4">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className={`btn btn-outline-primary text-start ${
              selectedAnswers[question.questionNumber] === opt ? "active" : ""
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="d-flex justify-content-between">
        <button
          onClick={() => changeQuestion(index - 1)}
          disabled={index === 0}
          className="btn btn-secondary"
        >
          السابق
        </button>
        <button
          onClick={() =>
            index === total - 1 ? onFinish() : changeQuestion(index + 1)
          }
          className="btn btn-primary"
        >
          {index === total - 1 ? "إنهاء الامتحان" : "التالي"}
        </button>
      </div>
      {renderPagination()}
    </>
  );
}

function ResultShareBox({
  score,
  total,
  categoriesCount,
  shareImageURL,
  generateShareImage,
  onBack,
}) {
  return (
    <div id="result-share-box" className="text-center">
      <audio autoPlay>
        <source src="/exam/success.mp3" type="audio/mpeg" />
      </audio>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-success text-white p-4 rounded shadow-xl border-2 border-success"
      >
        <h2 className="h4">🎉 مبروك!</h2>
        <p className="h5 mt-3">
          لقد أجبت على <span className="fw-bold">{score}</span> من{" "}
          <span className="fw-bold">{total}</span> سؤال بشكل صحيح
        </p>
        <div className="mt-3">
          <h5 className="h6">توزيع الأسئلة:</h5>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {Object.entries(categoriesCount).map(([cat, count]) => (
              <span key={cat} className="badge bg-info text-dark">
                {cat}: {count}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <img
            src="/exam/celebration.gif"
            alt="احتفال"
            width={125}
            height={125}
            className="w-50 mx-auto rounded-circle shadow"
          />
        </motion.div>
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={generateShareImage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            مشاركة نتيجتي
          </button>
          {shareImageURL && (
            <a
              href={shareImageURL}
              download="my_exam_result.png"
              className="text-sm text-blue-500 underline"
            >
              تحميل الصورة
            </a>
          )}
        </div>
        <button onClick={onBack} className="btn btn-light mt-3">
          العودة إلى صفحة الاختبارات
        </button>
      </motion.div>
    </div>
  );
}
