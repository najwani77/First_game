'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [totalScore, setTotalScore] = useState(0);
  const [lastAttemptScore, setLastAttemptScore] = useState(0);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [weeklyScores, setWeeklyScores] = useState({});
  const [lastWeekPlayed, setLastWeekPlayed] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all score data from localStorage
    const total = parseInt(localStorage.getItem('totalScore') || '0', 10);
    const lastAttempt = parseInt(localStorage.getItem('lastAttemptScore') || '0', 10);
    const firstAttempt = localStorage.getItem('isFirstAttempt') === 'true';
    const weekly = JSON.parse(localStorage.getItem('weeklyScores') || '{}');
    const lastWeek = localStorage.getItem('lastWeekPlayed') || '';

    setTotalScore(total);
    setLastAttemptScore(lastAttempt);
    setIsFirstAttempt(firstAttempt);
    setWeeklyScores(weekly);
    setLastWeekPlayed(lastWeek);
    setLoading(false);
  }, []);

  function handleRestart() {
    // Clear only temporary scores
    localStorage.removeItem('currentAttemptScore');
    localStorage.removeItem('lastAttemptScore');
    
    // Get the last week played and restart it
    if (lastWeekPlayed) {
      router.push(`/episode/${lastWeekPlayed}`);
    } else {
      router.push('/episode/week1');
    }
  }

  function handleHome() {
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Display score based on attempt type
  const displayScore = isFirstAttempt ? lastAttemptScore : lastAttemptScore;
  const maxScore = 9; // 3 questions max
  const percentage = (displayScore / maxScore) * 100;
  
  let rating = '';
  let ratingColor = '';
  let stars = 0;
  
  if (percentage >= 90) {
    rating = 'ممتاز';
    ratingColor = 'text-green-400';
    stars = 5;
  } else if (percentage >= 75) {
    rating = 'جيد جداً';
    ratingColor = 'text-blue-400';
    stars = 4;
  } else if (percentage >= 60) {
    rating = 'جيد';
    ratingColor = 'text-yellow-400';
    stars = 3;
  } else if (percentage >= 40) {
    rating = 'مقبول';
    ratingColor = 'text-orange-400';
    stars = 2;
  } else {
    rating = 'يحتاج تحسين';
    ratingColor = 'text-red-400';
    stars = 1;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center">🏆 لوحة النتائج</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        {/* Attempt Status Banner */}
        {!isFirstAttempt && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-blue-300">
              📝 هذه محاولة إضافية - نقاطك الأصلية محفوظة
            </p>
          </div>
        )}

        {/* Score Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 mb-6">
          {/* نقاطي Section - Current Attempt */}
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-4">
              {isFirstAttempt ? 'نقاطي' : 'نقاط هذه المحاولة'}
            </h2>
            <div className="relative inline-block">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {displayScore}
              </div>
              <div className="text-gray-400 text-lg mt-2">من {maxScore}</div>
            </div>
          </div>

          {/* Total Score Across All Weeks */}
          {isFirstAttempt && Object.keys(weeklyScores).length > 0 && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30 mb-6">
              <h3 className="text-center text-lg font-bold mb-3 text-purple-300">
                المجموع الكلي لجميع الأسابيع
              </h3>
              <div className="text-center text-4xl font-bold text-purple-400">
                {totalScore}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="text-center mb-6">
            <div className={`text-2xl md:text-3xl font-bold ${ratingColor} mb-3`}>
              {rating}
            </div>
            <div className="flex justify-center gap-2 text-3xl">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < stars ? 'text-yellow-400' : 'text-gray-600'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>

          {/* Percentage Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>النسبة المئوية</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Weekly Progress */}
          {Object.keys(weeklyScores).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-center">تقدمك الأسبوعي</h3>
              <div className="space-y-3">
                {Object.entries(weeklyScores).map(([week, score]) => (
                  <div key={week} className="flex justify-between items-center">
                    <span className="text-gray-300">
                      {week === 'week1' ? '📅 الأسبوع الأول' : `📅 ${week}`}
                    </span>
                    <span className="text-yellow-400 font-bold">{score}/9</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            🔄 محاولة جديدة
          </button>
          
          <button
            onClick={handleHome}
            className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 px-6 py-4 rounded-xl font-bold text-lg transition-all"
          >
            🏠 العودة للصفحة الرئيسية
          </button>
        </div>

        {/* Motivational Message */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30">
            <p className="text-lg text-gray-300 leading-relaxed">
              {!isFirstAttempt ? (
                <>المحاولات الإضافية لا تؤثر على نقاطك الأصلية. استمر في التعلم! 📚</>
              ) : percentage >= 80 ? (
                <>رائع! نقاطك محفوظة. استمر في التعلم والتطبيق 🌟</>
              ) : percentage >= 60 ? (
                <>أداء جيد! نقاطك محفوظة. يمكنك تحسين معرفتك بمشاهدة القصص على الانستقرام 📱</>
              ) : (
                <>نقاطك محفوظة! تابع قصص الانستقرام للمزيد من المعرفة 💪</>
              )}
            </p>
          </div>
        </div>

        {/* Instagram Follow */}
        <div className="mt-6 text-center">
          <a
            href="https://www.instagram.com/tadreescamp/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
          >
            <span className="text-2xl">📱</span>
            <span>تابعنا على الانستقرام</span>
          </a>
        </div>
      </div>
    </div>
  );
}