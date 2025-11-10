
// app/loading.jsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="inline-block relative">
          <div className="w-20 h-20 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-xl text-gray-600 font-semibold">جاري التحميل...</p>
      </div>
    </div>
  );
}