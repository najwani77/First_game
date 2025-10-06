'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EpisodePage({ params }) {
  const router = useRouter();
  const [episode, setEpisode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);

  // Load episode data
  useEffect(() => {
    async function loadEpisode() {
      try {
const res = await fetch(`https://first-game-swart-three.vercel.app/episodes/${params.slug}.json`);
        const data = await res.json();
        
        // Clear any previous attempt score
        localStorage.setItem('currentAttemptScore', '0');
        
        // Shuffle questions for randomization
        const shuffledQuestions = shuffleArray([...data.questions]);
        
        // Shuffle choices within each question
        const questionsWithShuffledChoices = shuffledQuestions.map(q => ({
          ...q,
          choices: shuffleArray([...q.choices])
        }));
        
        setEpisode(data);
        setQuestions(questionsWithShuffledChoices);
        
        // Check if this week was already completed
        const weeklyScores = JSON.parse(localStorage.getItem('weeklyScores') || '{}');
        const weekKey = `week${data.weekNumber}`;
        setIsFirstAttempt(!weeklyScores[weekKey]);
        
        console.log('Starting game:', {
          week: weekKey,
          isFirstAttempt: !weeklyScores[weekKey],
          existingWeeklyScores: weeklyScores
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading episode:', error);
        setLoading(false);
      }
    }
    loadEpisode();
  }, [params.slug]);

  // Shuffle array helper
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Handle choice selection
  function handleChoice(choice, index) {
    if (selectedChoice !== null) return; // Prevent multiple selections

    setSelectedChoice(index);
    setShowFeedback(true);
    
    // Add points - ensure delta exists
    const pointsToAdd = choice.delta || 0;
    const newScore = score + pointsToAdd;
    setScore(newScore);

    // Save current attempt score (temporary)
    localStorage.setItem('currentAttemptScore', newScore.toString());
    
    // Debug log
    console.log('Choice selected:', choice.text, 'Points:', pointsToAdd, 'New Score:', newScore);
  }

  // Move to next question
  function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentDialogueIndex(0);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      // Game finished - get the ACTUAL score from localStorage (not state, as state updates are async)
      const finalScore = parseInt(localStorage.getItem('currentAttemptScore') || '0', 10);
      
      console.log('Game finished! Final score:', finalScore);
      
      // Save score if first attempt
      if (isFirstAttempt) {
        const weeklyScores = JSON.parse(localStorage.getItem('weeklyScores') || '{}');
        const weekKey = `week${episode.weekNumber}`;
        weeklyScores[weekKey] = finalScore;
        localStorage.setItem('weeklyScores', JSON.stringify(weeklyScores));
        
        // Calculate total score across all weeks
        const totalScore = Object.values(weeklyScores).reduce((sum, s) => sum + s, 0);
        localStorage.setItem('totalScore', totalScore.toString());
        
        console.log('First attempt - saved to weeklyScores:', weeklyScores);
      }
      
      // Save current attempt info
      localStorage.setItem('lastAttemptScore', finalScore.toString());
      localStorage.setItem('isFirstAttempt', isFirstAttempt.toString());
      localStorage.setItem('lastWeekPlayed', `week${episode.weekNumber}`);
      
      // Go to dashboard
      router.push('/dashboard');
    }
  }

  // Progress through dialogue
  function handleDialogueNext(e) {
    if (e) e.stopPropagation();
    const currentQ = questions[currentQuestionIndex];
    if (currentQ.dialogue && currentDialogueIndex < currentQ.dialogue.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      // Dialogue complete, move to question
      setCurrentDialogueIndex(currentQ.dialogue ? currentQ.dialogue.length : 0);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!episode || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">لم يتم العثور على الحلقة</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasDialogue = currentQuestion.dialogue && currentQuestion.dialogue.length > 0;
  const showingDialogue = hasDialogue && currentDialogueIndex < currentQuestion.dialogue.length;
  const showingQuestion = !hasDialogue || currentDialogueIndex >= currentQuestion.dialogue.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-lg font-bold">{episode.title}</div>
          <div className="flex gap-4 items-center">
            <div className="text-sm">
              السؤال {currentQuestionIndex + 1} من {questions.length}
            </div>
            <div className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
              {score} نقطة
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 pb-8">
        {/* Instagram Reference Questions */}
        {currentQuestion.type === 'instagram_reference' && (
          <div className="vn-container mt-8">
            {/* Instagram Badge - Clickable */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <a 
                href="https://www.instagram.com/tadreescamp/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
              >
                <span className="text-2xl">📱</span>
                <span className="text-sm">بناءً على قصة الانستقرام</span>
              </a>
            </div>

            {/* Story Title */}
            <div className="text-center mb-6">
              <div className="inline-block bg-gray-800 px-6 py-3 rounded-lg border-2 border-purple-500">
                <div className="text-sm text-gray-400 mb-1">{currentQuestion.category}</div>
                <div className="text-xl font-bold">{currentQuestion.storyTitle}</div>
                <div className="text-xs text-purple-400 mt-1">{currentQuestion.instagramHandle}</div>
              </div>
            </div>

            {/* Background Image with Overlay */}
            {currentQuestion.background && (
              <div 
                className="instagram-bg rounded-lg overflow-hidden mb-4 relative"
                style={{
                  backgroundImage: `url(/bg/${currentQuestion.background})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: 'min(25vh, 200px)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/90"></div>
              </div>
            )}

            {/* Question Body */}
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-4 md:mb-6 border-r-4 border-purple-500">
              <div className="text-base md:text-lg leading-relaxed whitespace-pre-line">
                {currentQuestion.body}
              </div>
            </div>

            {/* Choices */}
            <div className="space-y-2 md:space-y-3">
              {currentQuestion.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice, index)}
                  disabled={selectedChoice !== null}
                  className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-right text-sm md:text-base ${
                    selectedChoice === null
                      ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-750'
                      : selectedChoice === index
                      ? choice.isCorrect
                        ? 'bg-green-900 border-green-500'
                        : 'bg-red-900 border-red-500'
                      : 'bg-gray-800 border-gray-700 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="leading-snug">{choice.text}</span>
                    {selectedChoice === index && (
                      <span className="text-xl md:text-2xl flex-shrink-0 mr-2">
                        {choice.isCorrect ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && selectedChoice !== null && (
              <div className="mt-4 md:mt-6 p-4 bg-gray-800 rounded-lg border-r-4 border-yellow-500">
                <div className="text-base md:text-lg">
                  {currentQuestion.choices[selectedChoice].feedback}
                </div>
                <button
                  onClick={handleNext}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg w-full font-bold transition-colors text-base md:text-lg"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'السؤال التالي' : 'إنهاء'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Situational Questions (VN Style) */}
        {currentQuestion.type === 'situational' && (
          <div className="vn-container">
            {/* Category Badge */}
            <div className="mb-4 text-center">
              <div className="inline-block bg-green-900 px-4 py-2 rounded-full border-2 border-green-500">
                <span className="text-sm font-bold">{currentQuestion.category}</span>
              </div>
            </div>

            {/* Dialogue Phase */}
            {showingDialogue && (
              <>
                {/* Background with dialogue */}
                <div 
                  className="vn-bg rounded-lg overflow-hidden relative"
                  style={{
                    backgroundImage: `url(/bg/${currentQuestion.background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: 'min(50vh, 400px)'
                  }}
                >
                  {/* Character Sprite */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none" style={{ paddingBottom: 'min(18vh, 140px)' }}>
                    {currentQuestion.dialogue[currentDialogueIndex].speaker === 'ali' && (
                      <img
                        src="/chars/ali_serious.png"
                        alt="علي"
                        className="vn-char"
                        style={{ maxHeight: 'min(30vh, 240px)' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    {currentQuestion.dialogue[currentDialogueIndex].speaker === 'meetham' && (
                      <img
                        src="/chars/meetham_thinking.png"
                        alt="ميثم"
                        className="vn-char"
                        style={{ maxHeight: 'min(30vh, 240px)' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  {/* Dialogue Box - Fixed at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-4 md:p-6">
                    <div className="max-w-4xl mx-auto">
                      {/* Speaker name */}
                      {currentQuestion.dialogue[currentDialogueIndex].speaker !== 'narrator' && (
                        <div className="text-yellow-400 font-bold mb-2 text-right text-sm md:text-base">
                          {currentQuestion.dialogue[currentDialogueIndex].speaker === 'ali' ? 'علي' : 'ميثم'}
                        </div>
                      )}
                      
                      {/* Dialogue text */}
                      <div className="text-base md:text-lg leading-relaxed mb-3 md:mb-4 text-right">
                        {currentQuestion.dialogue[currentDialogueIndex].text}
                      </div>
                      
                      {/* Continue button - Always visible */}
                      <div className="flex justify-center">
                        <button
                          onClick={handleDialogueNext}
                          className="bg-yellow-600 hover:bg-yellow-700 px-6 md:px-8 py-2 md:py-3 rounded-lg font-bold transition-colors text-base md:text-lg"
                        >
                          {currentDialogueIndex < currentQuestion.dialogue.length - 1 ? 'التالي ←' : 'متابعة للسؤال ←'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skip button outside */}
                <div className="text-center mt-2 md:mt-3">
                  <button
                    onClick={() => setCurrentDialogueIndex(currentQuestion.dialogue.length)}
                    className="text-gray-400 hover:text-white text-xs md:text-sm underline"
                  >
                    تخطي الحوار
                  </button>
                </div>
              </>
            )}

            {/* Question Phase */}
            {showingQuestion && (
              <>
                {/* Background image */}
                <div 
                  className="vn-bg rounded-lg overflow-hidden mb-4 md:mb-6"
                  style={{
                    backgroundImage: `url(/bg/${currentQuestion.background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: 'min(20vh, 180px)',
                    opacity: 0.5
                  }}
                />

                {/* Question Body */}
                <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-4 md:mb-6 border-r-4 border-green-500">
                  <div className="text-lg md:text-xl font-bold leading-relaxed">
                    {currentQuestion.body}
                  </div>
                </div>

                {/* Choices */}
                <div className="space-y-2 md:space-y-3">
                  {currentQuestion.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(choice, index)}
                      disabled={selectedChoice !== null}
                      className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-right text-sm md:text-base ${
                        selectedChoice === null
                          ? 'bg-gray-800 border-gray-700 hover:border-green-500 hover:bg-gray-750'
                          : selectedChoice === index
                          ? 'bg-green-900 border-green-500'
                          : 'bg-gray-800 border-gray-700 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="leading-snug flex-1">{choice.text}</span>
                        {selectedChoice === index && (
                          <span className="text-yellow-400 text-xs md:text-sm font-bold whitespace-nowrap">
                            +{choice.delta} نقطة
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {showFeedback && selectedChoice !== null && (
                  <div className="mt-4 md:mt-6 p-4 bg-gray-800 rounded-lg border-r-4 border-yellow-500">
                    <div className="text-base md:text-lg">
                      {currentQuestion.choices[selectedChoice].feedback}
                    </div>
                    <button
                      onClick={handleNext}
                      className="mt-4 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg w-full font-bold transition-colors text-base md:text-lg"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'السؤال التالي' : 'إنهاء'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}