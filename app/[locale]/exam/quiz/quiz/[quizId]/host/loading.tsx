export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-purple-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-base font-bold">جاري تحميل صفحة الإدارة...</p>
        <p className="text-white/80 text-xs mt-2">يرجى الانتظار</p>
      </div>
    </div>
  )
}
