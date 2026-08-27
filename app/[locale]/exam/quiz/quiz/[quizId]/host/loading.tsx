export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-purple-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl font-bold">جاري تحميل صفحة الإدارة...</p>
        <p className="text-white/80 text-lg mt-2">يرجى الانتظار</p>
      </div>
    </div>
  )
}
