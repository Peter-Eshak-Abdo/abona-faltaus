import { useEffect, useState } from "react";

export default function Question({ data, timer, onSubmit }) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(timer);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  return (
    <div>
      <h2>{data.question}</h2>
      <div>الوقت المتبقي: {timeLeft}</div>
      {data.options.map((option, index) => (
        <button key={index} onClick={() => setSelectedAnswer(option)}>
          {option}
        </button>
      ))}
      <button onClick={() => onSubmit(selectedAnswer)}>تأكيد الإجابة</button>
    </div>
  );
}
