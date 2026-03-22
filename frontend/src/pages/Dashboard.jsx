import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, Flame, Lightbulb, Target, MapPin, 
  Brain, ChevronRight, CheckCircle2, Clock, 
  Sparkles, ArrowRight, Play, BookOpen, Trophy, UserCircle
} from 'lucide-react';
import { streakService, learningPathService } from '../services/api';

const TIPS = [
  "Learning for 15 minutes a day is better than 2 hours once a week.",
  "Building projects is the fastest way to solidify your knowledge.",
  "Don't fear mistakes. Every error is a step towards mastery.",
  "If you're stuck on a quiz, review the learning materials again.",
  "Consistent daily streaks build unbreakable habits."
];

function Dashboard() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState({ count: 0, longestStreak: 0 });
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState("");

  useEffect(() => {
    setDailyTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const streakRes = await streakService.get();
      setStreak(streakRes.data || { count: 0, longestStreak: 0 });
      
      const pathsRes = await learningPathService.getAll();
      setPaths(pathsRes.data || []);
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
       <div className="relative w-20 h-20 flex items-center justify-center">
         <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
         <Sparkles className="text-blue-600 w-8 h-8 animate-pulse" />
       </div>
       <p className="mt-6 text-white text-sm font-bold tracking-widest uppercase animate-pulse">Crafting your dashboard...</p>
    </div>
  );

  const activePath = paths.length > 0 ? paths[paths.length - 1] : null;
  
  // Calculate Progress
  let totalModules = 0;
  let completedModules = 0;
  let currentStage = "Learning";
  let nextAction = "Start Module";
  
  if (activePath) {
    totalModules = activePath.steps?.length || 0;
    completedModules = activePath.steps?.filter(s => s.status === 'completed').length || 0;
    const currentStep = activePath.steps?.find(s => s.status !== 'completed');
    
    if (!currentStep && activePath.pathCompleted) {
      currentStage = "Course Certified! 🏆";
      nextAction = "View Badge";
    }
    else if (!currentStep) {
      currentStage = "Pending Final Verification";
      nextAction = "Upload Certificate";
    }
    else if (!currentStep.learningCompleted) {
      currentStage = `Module ${completedModules + 1}: Theory`;
      nextAction = "Read & Watch Materials";
    }
    else if (!currentStep.quizPassed) {
      currentStage = `Module ${completedModules + 1}: Assessment`;
      nextAction = "Take the Quiz";
    }
    else if (!currentStep.projectVerified) {
      currentStage = `Module ${completedModules + 1}: Project`;
      nextAction = "Submit GitHub Repo";
    }
  }

  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 -mt-8 pt-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in relative">
        
        {/* Floating Background Effects */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
          <button onClick={() => navigate('/profile')} className="px-5 py-2.5 bg-blue-50/80 hover:bg-blue-100 backdrop-blur-md border border-blue-200 text-blue-900 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2">
            <UserCircle size={18} /> My Profile
          </button>
        </div>

        {/* 🚀 1. HERO SECTION (DYNAMIC) */}
        <div className="relative z-10 text-center space-y-6 md:space-y-8 py-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 backdrop-blur-md rounded-full text-blue-900 text-xs lg:text-sm font-bold uppercase tracking-widest shadow-sm border border-blue-200">
            <Sparkles size={16} className="text-yellow-500" /> Learning Path Planner
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight drop-shadow-sm">
            {activePath ? (
              <>Ready to become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">{activePath.role}</span>?</>
            ) : (
              <>Ready to begin your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">journey</span>?</>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            {activePath 
              ? `You are ${progressPct}% through your master plan. Keep building momentum and unlock your next milestone today. ` 
              : "Generate your first personalized learning path and start mastering new skills today with a structured timeline."}
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {activePath ? (
              <button 
                onClick={() => navigate(`/path/${activePath._id}`)}
                className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <Play className="fill-white w-6 h-6" /> Resume Journey
              </button>
            ) : (
              <button 
                onClick={() => navigate('/create-path')}
                className="group relative px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <Rocket className="text-white w-6 h-6" /> Start Your Learning Journey
              </button>
            )}
          </div>
        </div>

        {/* 💡 8. MOTIVATIONAL BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-white/50 flex items-center gap-5 hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Flame className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Current Streak</p>
              <p className="text-2xl font-black text-black">
                {streak.count > 0 ? (
                  <>You're on a <span className="text-red-500">{streak.count}-day</span> streak!</>
                ) : (
                  "Start your streak today!"
                )}
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl border border-white/10 flex items-center gap-5 text-white hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
              <Lightbulb className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Tip of the Day</p>
              <p className="text-lg md:text-xl font-bold leading-tight drop-shadow-sm">{dailyTip}</p>
            </div>
          </div>
        </div>

        {/* 📚 6. DASHBOARD = STORY (Not just numbers) */}
        {!activePath ? (
          /* 🏁 2. EMPTY STATE REDESIGN */
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center shadow-inner mb-6 relative">
              <BookOpen className="w-12 h-12 text-blue-600" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full border-4 border-white flex items-center justify-center animate-bounce">
                <Rocket className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-4">You haven't started yet.</h2>
            <p className="text-gray-500 font-medium max-w-md text-lg mb-10">
              Let’s begin your first mission! Define your dream role, and we will generate a strict, guided curriculum to get you there.
            </p>
            
            {/* 📍 3. CLEAR USER FLOW GUIDANCE (Empty State) */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-3xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold mb-2">1</div>
                <p className="text-sm font-bold text-gray-700">Generate Path</p>
              </div>
              <ArrowRight className="text-gray-300 hidden md:block" />
              <div className="flex flex-col items-center text-center opacity-70">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold mb-2">2</div>
                <p className="text-sm font-bold text-gray-600">Start Learning</p>
              </div>
              <ArrowRight className="text-gray-300 hidden md:block" />
              <div className="flex flex-col items-center text-center opacity-50">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold mb-2">3</div>
                <p className="text-sm font-bold text-gray-600">Pass Assessments</p>
              </div>
              <ArrowRight className="text-gray-300 hidden md:block" />
              <div className="flex flex-col items-center text-center opacity-30">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold mb-2">4</div>
                <p className="text-sm font-bold text-gray-600">Earn Certificate</p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Path Dashboard Story */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Current Goal Box */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                   <Target className="w-6 h-6 text-blue-600" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">🎯 Current Goal</p>
                 <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{activePath.role}</h3>
                 <p className="text-sm font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-lg capitalize">{activePath.difficultyLevel} Level</p>
               </div>
            </div>

            {/* Current Stage Box */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                   <MapPin className="w-6 h-6 text-indigo-600" />
                 </div>
                 <div className="flex justify-between items-end mb-2">
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-500">📍 Current Stage</p>
                   <p className="text-xs font-black text-indigo-600">{completedModules}/{totalModules} Modules</p>
                 </div>
                 <h3 className="text-xl font-black text-gray-900 leading-tight md:truncate" title={currentStage}>{currentStage}</h3>
                 
                 {/* 📈 4. PROGRESS VISUALIZATION */}
                 <div className="mt-6 w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner relative">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 relative overflow-hidden" 
                      style={{ width: `${Math.max(progressPct, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                 </div>
                 <p className="text-right text-[10px] font-bold text-gray-400 mt-2">{progressPct}% Completed</p>
               </div>
            </div>

            {/* Learning Skills Box */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10 h-full flex flex-col">
                 <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                   <Brain className="w-6 h-6 text-teal-600" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">🧠 Skills Being Learned</p>
                 <div className="flex flex-wrap gap-2 flex-grow content-start">
                   {(activePath.skills || []).slice(0, 5).map(skill => (
                     <span key={skill} className="bg-white text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">{skill}</span>
                   ))}
                   {(activePath.skills?.length > 5) && (
                     <span className="bg-gray-50 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-100">+{activePath.skills.length - 5}</span>
                   )}
                 </div>
               </div>
            </div>

          </div>
        )}

        {/* ⏭ NEXT ACTION BANNER */}
        {activePath && (
          <div 
            onClick={() => navigate(`/path/${activePath._id}`)}
            className="w-full bg-white rounded-3xl p-6 shadow-xl border-l-[8px] border-l-blue-600 flex flex-col sm:flex-row items-center justify-between cursor-pointer group hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-5 flex-1 w-full sm:w-auto mb-4 sm:mb-0">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {currentStage.includes("Project") ? <Clock className="text-blue-600 w-6 h-6" /> : 
                 currentStage.includes("Assess") ? <Trophy className="text-blue-600 w-6 h-6" /> : 
                 currentStage.includes("Certif") ? <CheckCircle2 className="text-green-500 w-6 h-6" /> :
                 <BookOpen className="text-blue-600 w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">⏭ Next Action Required</p>
                <div className="flex items-center gap-3">
                   <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">{nextAction}</h3>
                   <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">~ {activePath.duration} remaining</span>
                </div>
              </div>
            </div>
            
            <button className="w-full sm:w-auto px-6 py-4 bg-gray-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors shadow-lg">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Secondary Paths Area (If they have multiple paths) */}
        {paths.length > 1 && (
          <div className="pt-10">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest">Other Learning Journeys</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {paths.slice(0, paths.length - 1).reverse().map(p => (
                 <div 
                   key={p._id} 
                   onClick={() => navigate(`/path/${p._id}`)}
                   className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group"
                 >
                   <div className="flex justify-between items-start mb-4">
                     <p className="font-bold text-gray-500 text-sm">{p.role}</p>
                     <ChevronRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                   </div>
                   <h4 className="font-black text-gray-900 text-lg mb-2 truncate">{p.title}</h4>
                   <p className="text-xs text-blue-600 font-semibold">{p.steps?.filter(s => s.status === 'completed').length || 0} / {p.steps?.length || 0} Modules Done</p>
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;