"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  name: string;
  count: number;
};

export default function ExamSetupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [maxQuestions, setMaxQuestions] = useState(229);

  useEffect(() => {
    // تحميل الفئات المتاحة من ملف JSON
    const loadCategories = async () => {
      try {
        const res = await fetch("/exam/simple.json");
        const data = await res.json();

        const loadedCategories = data.map((cat: { category: string; questions: { length: number }[] }) => ({
          name: cat.category,
          count: cat.questions.length
        }));

        setCategories(loadedCategories);
        setSelectedCategories([loadedCategories[0].name]); // اختيار أول فئة افتراضيًا

        // حساب الحد الأقصى للأسئلة
        const totalQuestions = loadedCategories.reduce((sum: number, cat: Category) => sum + cat.count, 0);
        setMaxQuestions(totalQuestions);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const calculateMaxForSelected = () => {
    if (selectedCategories.length === 0) return 0;
    return Math.min(
      categories
        .filter(cat => selectedCategories.includes(cat.name))
        .reduce((sum, cat) => sum + cat.count, 0),
      maxQuestions// لا يتجاوز الحد الأقصى العام
    );
  };

  const handleStartExam = () => {
    const query = new URLSearchParams();
    query.set("questions", questionCount.toString());
    query.set("time", timeLimit.toString());
    query.set("categories", selectedCategories.join(","));

    router.push(`/exam/individual-questions/exam-individual?${query.toString()}`);
  };

  const selectedMax = calculateMaxForSelected();

  return (
    <>
      <div className="max-w-7xl mx-auto py-5">
        <div className="flex justify-center">
          <div className="w-full md:w-2/3">
            <div className="bg-white shadow-lg rounded-lg">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-bold text-center mb-0">إعدادات الامتحان</h2>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">اختر الفئات:</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryToggle(category.name)}
                        className={`px-3 py-1 rounded text-sm ${selectedCategories.includes(category.name)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
                        type="button"
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
                    عدد الأسئلة (الحد الأقصى: {selectedMax})
                  </label>
                  <input
                    type="range"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="1"
                    max={selectedMax}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    id="questionCount"
                  />
                  <div className="flex justify-between">
                    <span>1</span>
                    <span className="font-bold">{questionCount}</span>
                    <span>{selectedMax}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
                    الوقت المخصص (دقيقة)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    id="timeLimit"
                  >
                    <option value="5">5 دقائق</option>
                    <option value="10">10 دقائق</option>
                    <option value="20">20 دقائق</option>
                    <option value="30">30 دقائق</option>
                    <option value="45">45 دقائق</option>
                    <option value="60">60 دقيقة</option>
                    <option value="0">بدون وقت</option>
                  </select>
                </div>

                <div className="flex justify-between mt-4">
                  <Link href="/exam" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                    رجوع
                  </Link>
                  <button
                    onClick={handleStartExam}
                    disabled={selectedCategories.length === 0 || questionCount < 1}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    type="button"
                  >
                    بدء الامتحان
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
