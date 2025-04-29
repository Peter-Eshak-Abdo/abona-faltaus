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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0 text-center">إعدادات الامتحان</h2>
            </div>

            <div className="card-body">
              <div className="mb-4">
                <h3 className="h5 mb-3">اختر الفئات:</h3>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryToggle(category.name)}
                      className={`btn btn-sm ${selectedCategories.includes(category.name)
                        ? "btn-primary"
                        : "btn-outline-primary"}`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="questionCount" className="form-label">
                  عدد الأسئلة (الحد الأقصى: {selectedMax})
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max={selectedMax}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  id="questionCount"
                />
                <div className="d-flex justify-content-between">
                  <span>1</span>
                  <span className="fw-bold">{questionCount}</span>
                  <span>{selectedMax}</span>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="timeLimit" className="form-label">
                  الوقت المخصص (دقيقة)
                </label>
                <select
                  className="form-select"
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

              <div className="d-flex justify-content-between mt-4">
                <Link href="/exam" className="btn btn-secondary">
                  رجوع
                </Link>
                <button
                  onClick={handleStartExam}
                  disabled={selectedCategories.length === 0 || questionCount < 1}
                  className="btn btn-primary"
                >
                  بدء الامتحان
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
