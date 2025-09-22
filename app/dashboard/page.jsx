"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("score") || "0");
    setScore(s);
  }, []);

  return (
    <div className="mx-auto max-w-xl p-5">
      <h1 className="text-2xl font-bold mb-4">لوحة التقدّم</h1>
      <div className="rounded-2xl border border-slate-800 p-4">أخلاقك: {score}</div>
      <button
        className="mt-6 w-full rounded-2xl border border-red-800 bg-red-950 px-4 py-3 hover:bg-red-900"
        onClick={() => { localStorage.clear(); location.reload(); }}
      >
        إعادة تعيين (مسح التقدّم)
      </button>
    </div>
  );
}
