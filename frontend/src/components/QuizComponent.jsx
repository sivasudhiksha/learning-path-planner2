import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trophy, RefreshCcw, Loader2 } from "lucide-react";
import { quizService } from "../services/api";

const QuizComponent = ({ topic, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getByTopic(topic);
        setQuiz(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [topic]);

  const handleAnswer = () => {
    if (selectedOption === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
      const finalScore = score + (selectedOption === quiz.questions[currentQuestion].correctAnswer ? 1 : 0);
      const passed = finalScore >= (quiz.questions.length * 0.7);
      if (onComplete) onComplete(finalScore, passed);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!quiz) return <div className="text-center py-12">No quiz available for this topic.</div>;

  if (showResult) {
    const passed = score >= (quiz.questions.length * 0.7);
    return (
      <div className="glass-card p-12 text-center max-w-lg mx-auto animate-fade-in border-white/10 shadow-2xl bg-gradient-to-br from-surface/80 to-surface/40">
        <div className={`w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center mb-8 shadow-xl ${passed ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/10' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
          {passed ? <Trophy size={56} className="animate-bounce-subtle" /> : <XCircle size={56} />}
        </div>
        <h3 className="text-4xl font-black mb-3 text-white">{passed ? "Topic Mastered!" : "Keep Practicing!"}</h3>
        <p className="text-text-muted text-lg mb-10">You scored <strong className="text-white text-2xl">{score}</strong> out of {quiz.questions.length}</p>
        <button onClick={() => window.location.reload()} className="h-14 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-all hover-lift">
          <RefreshCcw size={20} /> Restart Quiz
        </button>
      </div>
    );
  }

  const q = quiz.questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <span className="text-sm font-medium text-text-muted">Question {currentQuestion + 1} of {quiz.questions.length}</span>
        <div className="h-2 w-32 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="glass-card hover-lift p-10 border-white/10 mb-8 bg-surface/50 shadow-xl">
        <h3 className="text-2xl font-bold text-white leading-relaxed">{q.questionText}</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`w-full p-4 md:p-6 text-left rounded-2xl transition-all duration-300 border-2 flex items-center gap-6 !shadow-none !bg-none ${
              selectedOption === idx 
                ? 'border-primary !bg-primary/10 text-slate-900 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' 
                : 'border-slate-200 !bg-white/50 text-slate-600 hover:!bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black shrink-0 transition-all ${
              selectedOption === idx 
                ? 'border-primary bg-primary text-white shadow-lg' 
                : 'border-slate-300 text-slate-400 bg-white shadow-sm'
            }`}>
              {String.fromCharCode(65 + idx)}
            </div>
            <span className={`text-[16px] md:text-[18px] transition-all !text-black ${selectedOption === idx ? 'font-black opacity-100' : 'text-slate-700 opacity-80 font-medium'}`}>
              {opt}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleAnswer}
        disabled={selectedOption === null}
        className="w-full h-16 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/30"
      >
        {currentQuestion + 1 === quiz.questions.length ? "Finish Assessment" : "Confirm Answer"}
      </button>
    </div>
  );
};

export default QuizComponent;
