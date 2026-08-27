export const metadata = {
  title: "نظام الاختبارات الإلكترونية تفاحة",
  description: "امتحانات دينية فردية وجماعية حسب المواسم الكنسية.",
  keywords: [
    "امتحانات دينية",
    "اختبارات إلكترونية",
    "أسئلة دينية",
    "مواسم كنسية",
    "امتحانات فردية",
    "امتحانات جماعية",
  ],
};

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return<>{children}</>;
}
