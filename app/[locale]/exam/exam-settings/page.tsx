"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useLoading } from "@/app/loading-context";

type Category = {
  name: string;
  count: number;
};

export default function ExamSettings() {
  const router = useRouter();
  const { setLoading } = useLoading();

  const [questionCount, setQuestionCount] = useState(10);
  const [groupCount, setGroupCount] = useState(1);
  const [timePerGroup, setTimePerGroup] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxQuestions, setMaxQuestions] = useState(0);

  useEffect(() => {
    // Simulate page load completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, [setLoading]);

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
    <div className="py-5">
      <div className="flex justify-center">
        <div className="w-full md:w-2/3">
          <Card className="shadow">
            <CardHeader className="bg-blue-500 text-white text-center">
              <h2 className="text-lg mb-0">إعدادات الامتحان للمجموعات</h2>
            </CardHeader>

            <CardContent>
              {/* اختيار الفئات */}
              <div className="mb-4">
                <h5 className="text-lg mb-3">اختر الفئات:</h5>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.name}
                      size="sm"
                      variant={selectedCategories.includes(cat.name) ? "default" : "outline"}
                      onClick={() => handleCategoryToggle(cat.name)}
                    >
                      {cat.name} ({cat.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* عدد الأسئلة */}
              <div className="mb-4">
                <label className="block mb-2">
                  عدد الأسئلة (الحد الأقصى: {selectedMax})
                </label>
                <Slider
                  min={1}
                  max={selectedMax}
                  value={[questionCount]}
                  onValueChange={(value) => setQuestionCount(value[0])}
                  className="mb-2"
                />
                <div className="flex justify-between">
                  <span>1</span>
                  <span className="font-bold">{questionCount}</span>
                  <span>{selectedMax}</span>
                </div>
              </div>

              {/* عدد المجموعات */}
              <div className="mb-4">
                <label className="block mb-2">عدد المجموعات:</label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  placeholder="أدخل عدد المجموعات"
                />
              </div>

              {/* الوقت لكل مجموعة */}
              <div className="mb-4">
                <label className="block mb-2">الوقت لكل مجموعة (بالدقائق):</label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={timePerGroup}
                  onChange={(e) => setTimePerGroup(Number(e.target.value))}
                  placeholder="أدخل الوقت لكل مجموعة"
                />
              </div>

              {/* الأزرار */}
              <div className="flex justify-between mt-4">
                <Link href="/exam">
                  <Button variant="secondary">رجوع</Button>
                </Link>
                <Button
                  onClick={handleStartExam}
                  disabled={selectedCategories.length === 0 || questionCount < 1}
                  variant="default"
                >
                  ابدأ الامتحان
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
