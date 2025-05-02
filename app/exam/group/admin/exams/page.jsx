// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { QRCodeSVG } from "qrcode.react";
// import io from "socket.io-client";

// const socket = io("http://localhost:3001");
// export default function AdminPanel() {
//   const router = useRouter();
//   const [roomId, setRoomId] = useState("");
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [examSettings, setExamSettings] = useState(null); // إضافة حالة للإعدادات

// useEffect(() => {
//   const loadSettingsAndQuestions = async () => {
//     try {
//       const savedSettings = localStorage.getItem("examGroupSettings");

//       if (!savedSettings) {
//         throw new Error("الرجاء تعيين إعدادات الامتحان أولاً");
//       }

//       const settings = JSON.parse(savedSettings);
//       setExamSettings(settings);

//       // جلب البيانات ومعالجتها أولاً
//       const res = await fetch("/exam/simple.json");
//       if (!res.ok) throw new Error("فشل تحميل الأسئلة");

//       const data = await res.json();
//       if (!Array.isArray(data)) throw new Error("هيكل الملف غير صحيح");

//       socket.on("connect_error", (err) => {
//         console.error("خطأ الاتصال:", err.message);
//         alert(`خطأ تقني: ${err.message}`);
//         router.push("/exam/admin");
//       });

//       // معالجة الأسئلة
//       const filteredQuestions = data
//         .filter(
//           (cat) =>
//             settings.categories.includes(cat.category) &&
//             cat.questions?.length > 0
//         )
//         .flatMap((cat) =>
//           cat.questions.map((q) => ({
//             ...q,
//             category: cat.category,
//             options: q.type === "tf" ? ["صح", "خطأ"] : q.options || [],
//           }))
//         )
//         .sort(() => Math.random() - 0.5)
//         .slice(0, settings.questionCount);

//       // النقاش هنا بعد تعريف المتغير
//       console.log("عدد الأسئلة المطلوبة:", settings.questionCount);
//       console.log("الأسئلة المتاحة بعد التصفية:", filteredQuestions.length);

//       if (filteredQuestions.length === 0) {
//         throw new Error("لا توجد أسئلة متاحة للفئات المحددة");
//       }
//       setQuestions(filteredQuestions);
//     } catch (err) {
//       console.error(err.message);
//       alert(err.message);
//       router.push("/exam/group/admin");
//     }
//   };

//   loadSettingsAndQuestions();
// }, [router]);
//   const createRoom = () => {
//     if (!examSettings) return; // تأكيد وجود الإعدادات

//     const newRoomId = Math.random().toString(36).substring(2, 15);
//     setRoomId(newRoomId);
//     socket.emit("create-room", {
//       roomId: newRoomId,
//       settings: examSettings,
//     });
//   };

//   const sendNextQuestion = () => {
//    if (!socket.connected || !socket.id) {
//      alert("يرجى الانتظار حتى اكتمال الاتصال بالخادم");
//      return;
//    }

//   if (currentQuestionIndex >= questions.length) {
//     alert("تم إرسال جميع الأسئلة");
//     socket.emit("exam-finished", { roomId });
//     return;
//   }

//   const questionToSend = {
//     ...questions[currentQuestionIndex],
//     time: examSettings.timePerQuestion,
//     questionNumber: currentQuestionIndex + 1,
//     totalQuestions: questions.length,
//   };

//   // التعديل هنا: استخدام الحدث الذي يستخدمه الخادم
//   socket.emit("send-question", {
//     roomId,
//     question: questionToSend,
//   });

//   setCurrentQuestionIndex((prev) => prev + 1);
//   };

//   useEffect(() => {
//     const handleConnect = () => console.log("✅ متصل بالخادم");
//     const handleDisconnect = () => console.log("❌ قطع الاتصال");

//     socket.on("connect", handleConnect);
//     socket.on("disconnect", handleDisconnect);

//     return () => {
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//     };
//   }, []);

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       {!roomId ? (
//         <button
//           onClick={createRoom}
//           className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
//         >
//           🚀 إنشاء غرفة جديدة
//         </button>
//       ) : (
//         <div className="space-y-6">
//           <div className="bg-white p-6 rounded-xl shadow-lg">
//             <h2 className="text-2xl font-bold mb-4">🎮 لوحة التحكم</h2>

//             <div className="mb-6">
//               <h3 className="text-xl mb-2">🔗 رابط الغرفة:</h3>
//               <div className="bg-gray-100 p-3 rounded break-all">
//                 {`${window.location.origin}/exam/group/session/${roomId}`}
//               </div>
//             </div>

//             <div className="mb-6">
//               <h3 className="text-xl mb-2">📲 كود QR للانضمام:</h3>
//               <div className="p-4 bg-white rounded border">
//                 <QRCodeSVG
//                   value={`${window.location.origin}/exam/group/session/${roomId}`}
//                   size={200}
//                 />
//               </div>
//             </div>
//             <div className="mb-4">
//               <div className="flex items-center gap-2">
//                 <div
//                   className={`w-3 h-3 rounded-full ${
//                     socket.connected ? "bg-green-500" : "bg-red-500"
//                   }`}
//                 ></div>
//                 <span className="text-sm">
//                   {socket.connected ? "متصل بالخادم" : "غير متصل"}
//                 </span>
//               </div>
//             </div>

//             <div className="mb-4 p-4 bg-blue-50 rounded">
//               <h3 className="text-lg font-semibold">حالة النظام:</h3>
//               <div className="mt-2 space-y-2">
//                 <div className="flex items-center gap-2">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       questions.length > 0 ? "bg-green-500" : "bg-gray-300"
//                     }`}
//                   ></div>
//                   <span>تم تحميل {questions.length} سؤال</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       socket.connected ? "bg-green-500" : "bg-red-500"
//                     }`}
//                   ></div>
//                   <span>
//                     حالة الاتصال: {socket.connected ? "نشط" : "غير متصل"}
//                   </span>
//                 </div>
//               </div>
//               </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={sendNextQuestion}
//                 className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
//               >
//                 ▶️ إرسال السؤال التالي ({currentQuestionIndex + 1}/
//                 {questions.length})
//               </button>

//               <button
//                 onClick={() => setRoomId("")}
//                 className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
//               >
//                 ⏹️ إنهاء الامتحان
//               </button>
//             </div>
//           </div>
//           <div className="bg-gray-50 p-4 rounded">
//             <h3 className="text-lg font-semibold mb-2">السؤال الحالي:</h3>
//             {questions[currentQuestionIndex] ? (
//               <div>
//                 <p className="text-lg">
//                   {questions[currentQuestionIndex].question}
//                 </p>
//                 <div className="mt-2 text-sm text-gray-600">
//                   {questions[currentQuestionIndex].options?.join(" | ")}
//                 </div>
//               </div>
//             ) : (
//               "تم إرسال جميع الأسئلة"
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// app/exam/group/admin/AdminPanel.jsx
// app/exam/group/admin/AdminPanel.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  path: "/socket.io", // تأكد المسار بدون slash زائد
  transports: ["websocket"], // فقط WebSocket، لا polling
  withCredentials: true,
});

export default function AdminPanel() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examSettings, setExamSettings] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [results, setResults] = useState({});
  const [examEnded, setExamEnded] = useState(false);

  // Load settings and questions
  useEffect(() => {
    const loadSettingsAndQuestions = async () => {
      try {
        const savedSettings = localStorage.getItem("examGroupSettings");
        if (!savedSettings) {
          throw new Error("الرجاء تعيين إعدادات الامتحان أولاً");
        }
        const settings = JSON.parse(savedSettings);
        setExamSettings(settings);

        const res = await fetch("/exam/simple.json");
        if (!res.ok) throw new Error("فشل تحميل الأسئلة");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("هيكل الملف غير صحيح");

        // Filter and map
        const filtered = data
          .filter(cat => settings.categories.includes(cat.category) && cat.questions?.length > 0)
          .flatMap(cat =>
            cat.questions.map(q => ({
              ...q,
              category: cat.category,
              options: q.type === "tf" ? ["صح", "خطأ"] : q.options || []
            }))
          )
          .sort(() => Math.random() - 0.5)
          .slice(0, settings.questionCount);

        if (filtered.length === 0) {
          throw new Error("لا توجد أسئلة متاحة للفئات المحددة");
        }
        setQuestions(filtered);
      } catch (err) {
        console.error(err.message);
        alert(err.message);
        router.push("/exam/group/admin");
      }
    };
    loadSettingsAndQuestions();
  }, [router]);

  // Socket event handling
  useEffect(() => {
    socket.on("connect", () => console.log("✅ متصل بالخادم"));
    socket.on("disconnect", () => console.log("❌ قطع الاتصال"));
    socket.on("participant-joined", () =>
      setParticipantsCount(c => c + 1)
    );
    socket.on("answer-submitted", ({ questionNumber, correct }) => {
      setResults(prev => {
        const q = prev[questionNumber] || { correct: 0, incorrect: 0 };
        return {
          ...prev,
          [questionNumber]: {
            correct: q.correct + (correct ? 1 : 0),
            incorrect: q.incorrect + (correct ? 0 : 1)
          }
        };
      });
    });
    socket.on("exam-ended", () => setExamEnded(true));
    return () => socket.disconnect();
  }, []);

  const createRoom = () => {
    if (!examSettings) return;
    const newRoomId = Math.random().toString(36).substring(2, 15);
    setRoomId(newRoomId);
    socket.emit("create-room", { roomId: newRoomId, settings: examSettings });
  };

  const sendNextQuestion = () => {
    if (!socket.connected) {
      alert("يرجى الانتظار حتى اكتمال الاتصال بالخادم");
      return;
    }
    if (currentQuestionIndex >= questions.length) {
      socket.emit("exam-finished", { roomId });
      return;
    }
    const questionToSend = {
      ...questions[currentQuestionIndex],
      time: examSettings.timePerQuestion,
      questionNumber: currentQuestionIndex + 1,
      totalQuestions: questions.length
    };
    socket.emit("send-question", { roomId, question: questionToSend });
    setCurrentQuestionIndex(i => i + 1);
  };

  return (
    <div className="d-flex flex-column align-items-center p-4">
      {!roomId ? (
        <button onClick={createRoom} className="btn btn-primary btn-lg">
          🚀 إنشاء غرفة جديدة
        </button>
      ) : (
        <div className="w-100 w-md-75">
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="h3">🎮 لوحة التحكم</h2>
            <p>
              🔗 <code className="bg-light p-2 rounded">{`${window.location.origin}/exam/group/session/${roomId}`}</code>
            </p>
            <div className="mb-3">
              <QRCodeSVG value={`${window.location.origin}/exam/group/session/${roomId}`} size={150} />
            </div>
            <p>👥 المنضمين: <span className="fw-bold">{participantsCount}</span></p>
            <p>
              ✉️ أسئلة مرسلة: <span className="fw-bold">{currentQuestionIndex}</span> / <span className="fw-bold">{questions.length}</span>
            </p>
            <div className="d-flex gap-2">
              <button onClick={sendNextQuestion} className="btn btn-success">
                ▶️ إرسال السؤال التالي
              </button>
              <button onClick={() => setRoomId("")} className="btn btn-danger">
                ⏹️ إنهاء الامتحان
              </button>
            </div>
          </div>

          <AnimatePresence>
            {examEnded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-light p-4 rounded shadow">
                <h3 className="h4">📊 ملخص النتائج</h3>
                {Object.entries(results).map(([num, res]) => (
                  <div key={num} className="d-flex justify-content-between mb-2">
                    <span>سؤال {num}:</span>
                    <span>✅ {res.correct} | ❌ {res.incorrect}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
