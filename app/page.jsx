import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-xl p-5">
      <header className="py-10">
        <h1 className="text-3xl font-extrabold">اللعبة التفاعلية</h1>
        <p className="mt-2 opacity-90">نموذج تجريبي بحلقة واحدة لإظهار الفكرة.</p>
      </header>

      <div className="grid gap-4">
        <Link href="/episode/week1" className="block rounded-2xl border border-slate-800 p-4 hover:bg-slate-900">
          <div className="text-xl font-semibold">ابدأ الحلقة ١</div>
          <div className="text-sm opacity-80">قرارات قصيرة + نقاط أخلاق</div>
        </Link>

        <Link href="/dashboard" className="block rounded-2xl border border-slate-800 p-4 hover:bg-slate-900">
          <div className="text-xl font-semibold">لوحة التقدّم</div>
          <div className="text-sm opacity-80">نتيجتك الإجمالية</div>
        </Link>
      </div>
    </div>
  );
}
