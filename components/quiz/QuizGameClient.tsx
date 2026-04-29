'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

const dummyQuestions: Question[] = [
  {
    id: '1',
    text: 'ما هو اسم أول خليفة في الإسلام؟',
    options: ['أبو بكر الصديق', 'عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب'],
    correctAnswer: 'أبو بكر الصديق',
  },
  {
    id: '2',
    text: 'كم عدد أركان الإسلام؟',
    options: ['ثلاثة', 'أربعة', 'خمسة', 'ستة'],
    correctAnswer: 'خمسة',
  },
  {
    id: '3',
    text: 'في أي شهر يصوم المسلمون؟',
    options: ['شوال', 'رمضان', 'محرم', 'ذو الحجة'],
    correctAnswer: 'رمضان',
  },
];

const QuizGameClient: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQuestion = dummyQuestions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (option === currentQuestion.correctAnswer) {
      setScore(score + 1);
      setFeedback('إجابة صحيحة!');
    } else {
      setFeedback(`إجابة خاطئة. الإجابة الصحيحة هي: ${currentQuestion.correctAnswer}`);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setFeedback(null);
    if (currentQuestionIndex < dummyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
        <div className="bg-white text-gray-800 rounded-lg shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-md text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">نتائج الامتحان</h2>
          <p className="text-xl sm:text-2xl mb-6">لقد حصلت على {score} من {dummyQuestions.length} إجابات صحيحة.</p>
          <button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setScore(0);
              setShowResult(false);
              setSelectedOption(null);
              setFeedback(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out text-base sm:text-lg"
          >
            إعادة الامتحان
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
      <div className="bg-white text-gray-800 rounded-lg shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-center text-blue-700">
          امتحان المعرفة الدينية
        </h1>
        <div className="mb-6 text-center">
          <p className="text-lg sm:text-xl font-semibold">السؤال {currentQuestionIndex + 1} من {dummyQuestions.length}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-4 leading-relaxed">
            {currentQuestion.text}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => !selectedOption && handleOptionSelect(option)}
              className={`
                p-3 sm:p-4 rounded-lg text-left transition duration-300 ease-in-out
                ${selectedOption === option
                  ? (option === currentQuestion.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-800 border border-gray-200'
                }
                ${selectedOption ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                text-base sm:text-lg
              `}
              disabled={!!selectedOption}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`text-center p-3 rounded-lg mb-6 ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-base sm:text-lg`}>
            {feedback}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleNextQuestion}
            disabled={!selectedOption}
            className={`
              bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full
              transition duration-300 ease-in-out text-base sm:text-lg
              ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {currentQuestionIndex < dummyQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتائج'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizGameClient;
