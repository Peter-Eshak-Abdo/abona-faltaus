"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  name: string;
  count: number;
};

export default function ExamSettings() {
  const router = useRouter();

  const [questionCount, setQuestionCount] = useState(10);
  const [groupCount, setGroupCount] = useState(1);
  const [timePerGroup, setTimePerGroup] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxQuestions, setMaxQuestions] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/exam/simple.json");
        const data = await res.json();
        const loaded = data.map((cat: { category: string; questions: { length: number }[] }) => ({
          name: cat.category,
          count: cat.questions.length,
        }));

        setCategories(loaded);
        setSelectedCategories([loaded[0]?.name]);
        setMaxQuestions(
          loaded.reduce((sum: number, cat: Category) => sum + cat.count, 0)
        );
      } catch (err) {
        console.error("خطأ في تحميل الفئات:", err);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const calculateMaxForSelected = () => {
    if (selectedCategories.length === 0) return 0;
    return Math.min(
      categories
        .filter((cat) => selectedCategories.includes(cat.name))
        .reduce((sum, cat) => sum + cat.count, 0),
      maxQuestions
    );
  };

  const handleStartExam = () => {
    const query = new URLSearchParams();
    query.set("questions", questionCount.toString());
    query.set("groups", groupCount.toString());
    query.set("time", timePerGroup.toString());
    query.set("categories", selectedCategories.join(","));

    router.push(`/exam/exam-settings/exam-groups?${query.toString()}`);
  };

  const selectedMax = calculateMaxForSelected();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">إعدادات الامتحان للمجموعات</h2>
            </div>

            <div className="card-body">
              {/* اختيار الفئات */}
              <div className="mb-4">
                <h5 className="mb-3">اختر الفئات:</h5>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.name)}
                      className={`btn btn-sm ${selectedCategories.includes(cat.name)
                        ? "btn-primary"
                        : "btn-outline-primary"}`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* عدد الأسئلة */}
              <div className="mb-4">
                <label className="form-label">
                  عدد الأسئلة (الحد الأقصى: {selectedMax})
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max={selectedMax}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  title="عدد الأسئلة"
                />
                <div className="d-flex justify-content-between">
                  <span>1</span>
                  <span className="fw-bold">{questionCount}</span>
                  <span>{selectedMax}</span>
                </div>
              </div>

              {/* عدد المجموعات */}
              <div className="mb-4">
                <label className="form-label">عدد المجموعات:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  className="form-control"
                  placeholder="أدخل عدد المجموعات"
                />
              </div>

              {/* الوقت لكل مجموعة */}
              <div className="mb-4">
                <label className="form-label">الوقت لكل مجموعة (بالدقائق):</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={timePerGroup}
                  onChange={(e) => setTimePerGroup(Number(e.target.value))}
                  className="form-control"
                  placeholder="أدخل الوقت لكل مجموعة"
                />
              </div>

              {/* الأزرار */}
              <div className="d-flex justify-content-between mt-4">
                <Link href="/exam" className="btn btn-secondary">رجوع</Link>
                <button
                  onClick={handleStartExam}
                  disabled={selectedCategories.length === 0 || questionCount < 1}
                  className="btn btn-primary"
                >
                  ابدأ الامتحان
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
