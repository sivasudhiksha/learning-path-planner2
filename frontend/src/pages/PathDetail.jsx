import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, isBefore, addDays } from "date-fns";
import { Trophy, CheckCircle, Circle, BookMarked, StickyNote, Github, ExternalLink, Plus, Trash2, Loader2, Play, BookOpen, PenTool, CheckSquare, Sparkles, TrendingUp, LayoutDashboard, Calendar, Clock, AlertCircle, RefreshCw, MessageSquare } from "lucide-react";
import { noteService, bookmarkService, githubService, learningPathService, quizService, streakService } from "../services/api";
import QuizComponent from "../components/QuizComponent";

const PathDetail = () => {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [activeTab, setActiveTab] = useState("learn");
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const [githubUrl, setGithubUrl] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
 
  const updateStepDate = async (stepIndex, newDate) => {
    try {
      const updatedSteps = [...path.steps];
      updatedSteps[stepIndex].scheduledDate = newDate;
      const res = await learningPathService.update(id, { steps: updatedSteps });
      setPath(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to update schedule");
    }
  };

  const handleStepUpdate = async (updates) => {
    try {
      const updatedSteps = [...path.steps];
      const finalUpdates = { ...updates };
      if (updates.status === 'completed' && !updatedSteps[selectedStepIndex].completedDate) {
        finalUpdates.completedDate = new Date();
      }
      updatedSteps[selectedStepIndex] = { ...updatedSteps[selectedStepIndex], ...finalUpdates };
      const res = await learningPathService.update(id, { steps: updatedSteps });
      setPath(res.data);
    } catch (err) {
      console.error("Failed to update step state", err);
    }
  };

  const handleFinalCompletion = async () => {
    try {
      const res = await learningPathService.update(id, { pathCompleted: true });
      setPath(res.data);
      alert("Course Successfully Completed! Check your Dashboard for your new Badge.");
    } catch (err) {
      console.error("Failed to complete path", err);
    }
  };

  const handleAdaptiveUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await learningPathService.adaptiveUpdate(id);
      setPath(res.data);
      setSelectedStepIndex(0); // Reset to first pending step
      alert("Your roadmap has been intelligently updated based on your progress!");
    } catch (err) {
      console.error("Failed to update roadmap", err);
      alert("Failed to intelligently update roadmap. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStepStatus = (step) => {
    if (step.status === 'completed') return { label: 'Completed', color: 'text-green-400', icon: <CheckCircle size={14}/> };
    if (!step.scheduledDate) return { label: 'Not Scheduled', color: 'text-slate-500', icon: <Clock size={14}/> };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const scheduled = new Date(step.scheduledDate);
    scheduled.setHours(0,0,0,0);
    
    const diffDays = differenceInDays(scheduled, today);
    
    if (diffDays < 0) return { label: `${Math.abs(diffDays)} Days Overdue`, color: 'text-red-400', icon: <AlertCircle size={14}/> };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-yellow-400', icon: <Clock size={14}/> };
    return { label: `Due in ${diffDays} Days`, color: 'text-primary', icon: <Calendar size={14}/> };
  };

  const getOverallPace = () => {
    if (!path || !path.steps) return { label: "On Track", color: "text-white/60", bg: "bg-white/5" };
    
    const overdueCount = path.steps.filter(s => {
      if (s.status === 'completed' || !s.scheduledDate) return false;
      return isBefore(new Date(s.scheduledDate), new Date());
    }).length;

    if (overdueCount > 1) return { label: "Behind", color: "text-red-400", bg: "bg-red-400/10" };
    
    const earlyCount = path.steps.filter(s => {
      if (s.status !== 'completed' || !s.scheduledDate || !s.completedDate) return false;
      return isBefore(new Date(s.completedDate), new Date(s.scheduledDate));
    }).length;

    if (earlyCount > 1) return { label: "Ahead", color: "text-green-400", bg: "bg-green-400/10" };
    
    return { label: "On Track", color: "text-yellow-400", bg: "bg-yellow-400/10" };
  };

  // Calculate overall progress percentage
  const calcProgress = () => {
    if (!path || !path.steps) return 0;
    const completed = path.steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / path.steps.length) * 100);
  };

  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");

  useEffect(() => {
    fetchPath();
    fetchNotes();
    fetchBookmarks();
  }, [id]);

  const fetchPath = async () => {
    try {
      const res = await learningPathService.getById(id);
      setPath(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchNotes = async () => {
    try {
      const res = await noteService.getByPath(id);
      setNotes(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await bookmarkService.getAll();
      setBookmarks(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  if (!path) return <div className="text-center py-20">Path not found.</div>;

  const currentStep = path.steps[selectedStepIndex];
  const allStepsCompleted = path.steps.length > 0 && path.steps.every(s => s.status === 'completed');

  const handleCertificateSubmit = async () => {
    if (!certTitle || !certIssuer) return alert("Please provide both Title and Issuer");
    
    // Check if certificate matches selected role/skill
    const roleMatch = certTitle.toLowerCase().includes(path.role?.toLowerCase() || "");
    const skillMatch = path.skills?.some(skill => certTitle.toLowerCase().includes(skill.toLowerCase()));
    
    if (!roleMatch && !skillMatch) {
      const proceed = window.confirm("Warning: The certificate title doesn't seem to match your Target Role or Skills. Do you still want to proceed and claim your badge?");
      if (!proceed) return;
    }
    await handleFinalCompletion();
  };

  if (path.pathCompleted) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center animate-fade-in px-6">
         <Trophy size={100} className="mx-auto text-yellow-400 mb-6 animate-bounce" />
         <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 leading-tight">Course Successfully Completed!</h1>
         <p className="text-xl text-slate-500 mb-12">You have officially proven your mastery in <strong className="text-slate-900">{path.role}</strong>.</p>
         
         <div className="w-72 h-72 mx-auto rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 p-2 shadow-[0_0_80px_rgba(250,204,21,0.4)] animate-scale-up">
            <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center border-4 border-black/50 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/20 to-transparent"></div>
               <Sparkles size={30} className="absolute top-10 right-10 text-yellow-400 animate-pulse" />
               <Trophy size={60} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10"/>
               <span className="font-black text-slate-900 px-6 text-xl text-center z-10">{path.role}</span>
               <span className="text-[10px] font-black tracking-[0.3em] text-yellow-400 mt-2 z-10 uppercase">Certified Master</span>
            </div>
         </div>
         
         <button onClick={() => window.location.href = '/'} className="mt-16 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm tracking-widest uppercase">Return to Dashboard</button>
      </div>
    );
  }

  if (allStepsCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6 shadow-lg shadow-primary/20">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black mb-3">All Milestones Completed!</h2>
          <p className="text-slate-500">You've successfully finished all the technical requirements. Now, upload your external course certificate for final validation to unlock your ultimate mastery badge.</p>
        </div>
        
        <div className="glass-card p-8 border-slate-200 shadow-2xl">
          <h3 className="text-lg font-bold mb-6 text-slate-900 border-b border-slate-200 pb-4">Certificate Verification</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Certificate Title</label>
              <input 
                type="text" 
                placeholder="e.g. Advanced Meta Frontend Developer"
                value={certTitle}
                onChange={e => setCertTitle(e.target.value)}
                className="w-full p-4 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Issuing Organization</label>
              <input 
                type="text" 
                placeholder="e.g. Coursera, Udemy, AWS"
                value={certIssuer}
                onChange={e => setCertIssuer(e.target.value)}
                className="w-full p-4 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Upload File</label>
              <div className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:bg-white transition-colors cursor-pointer">
                <span className="text-slate-500 text-sm font-medium">Click to browse or drag image here (Simulated)</span>
              </div>
            </div>
            
            <button 
              onClick={handleCertificateSubmit}
              disabled={!certTitle || !certIssuer}
              className="w-full py-4 mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent/80 text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all disabled:opacity-50"
            >
              Verify Certificate & Claim Badge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 animate-fade-in font-outfit relative">
      
      {/* Dynamic Global Progress Bar */}
      <div className="sticky top-20 z-40 mb-8 w-full bg-black border border-white/20 rounded-xl p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none transition-all duration-300 relative overflow-hidden group">
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center bg-black shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Path Progress</p>
              <h2 className="text-lg font-black text-white leading-none m-0">{calcProgress()}% Mastered</h2>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-xl px-0 md:px-2">
             <div className="w-full relative h-[4px] bg-white/10 border border-white/20 rounded-full overflow-hidden mb-2 shadow-inner">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-out" 
                  style={{ width: `${calcProgress()}%` }}
                />
             </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${getOverallPace().bg} border border-white/20 px-3 py-1.5 rounded-lg shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]`}>
              <div className={`w-1.5 h-1.5 rounded-full ${getOverallPace().color.replace('text-', 'bg-')} animate-pulse`} />
              <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${getOverallPace().color}`}>{getOverallPace().label}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black border border-white/30 px-3 py-1.5 rounded-lg shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
              <Sparkles className="text-white w-3 h-3" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Level: <span className="text-white/60 capitalize">{path.difficultyLevel}</span></span>
            </div>
          </div>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar - Roadmap Card */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="glass-card p-0 overflow-hidden border-slate-200 shadow-2xl group">
            <div className="p-6 bg-gradient-to-br from-primary/20 to-accent/10 border-b border-slate-200 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard size={60} />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black text-slate-900 leading-tight pr-10">{path.title}</h2>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Adaptive Path Enabled</span>
                </div>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mt-4">{path.description}</p>
            </div>

            <div className="px-6 py-4 border-b border-slate-100 bg-white">
              <button 
                onClick={handleAdaptiveUpdate}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-slate-800 px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-black/20 group/refresh-main disabled:opacity-50"
              >
                <div className={`p-1.5 rounded-lg bg-white/10 group-hover/refresh-main:bg-primary/20 transition-colors ${isUpdating ? 'animate-spin' : ''}`}>
                  <RefreshCw size={14} className={isUpdating ? '' : 'group-hover/refresh-main:rotate-180 transition-transform duration-500'} />
                </div>
                {isUpdating ? 'Recalculating...' : 'Update Roadmap'}
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 px-2 tracking-[0.2em]">Curriculum Milestones</h4>
              <div className="space-y-2">
                {path.steps.map((step, idx) => {
                  const canAccess = idx === 0 || path.steps[idx - 1].status === 'completed';
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (canAccess) {
                          setSelectedStepIndex(idx);
                          setActiveTab("learn");
                          setIsVideoPlaying(false);
                          setVerificationResult(null);
                        }
                      }}
                      disabled={!canAccess}
                      className={`w-full p-4 flex items-center gap-4 rounded-xl transition-all duration-300 group/btn outline-none focus:outline-none text-left mb-2 ${
                         selectedStepIndex === idx 
                           ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-l-primary text-slate-900 translate-x-1 shadow-[0_4px_20px_rgba(99,102,241,0.1)]' 
                           : canAccess 
                             ? 'hover:bg-slate-100 border-transparent text-slate-500 hover:border-slate-200 hover:translate-x-1 border-l-4 border-l-transparent'
                             : 'opacity-50 cursor-not-allowed border-transparent text-slate-500 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
                        selectedStepIndex === idx ? 'bg-primary text-white scale-110 shadow-primary/40' : 'bg-white border border-slate-200'
                      }`}>
                        {step.status === 'completed' 
                          ? <CheckCircle size={16} /> 
                          : step.status === 'overdue'
                            ? <AlertCircle size={16} className="text-red-500" />
                            : <div className="text-[10px] font-bold">{idx + 1}</div>
                        }
                      </div>
                      <div className="flex-1">
                        <span className={`block text-sm font-bold transition-colors ${selectedStepIndex === idx ? 'text-slate-900' : 'group-hover/btn:text-slate-900'}`}>
                          {step.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-black ${
                            step.status === 'completed' ? 'text-green-500' : 
                            step.status === 'overdue' ? 'text-red-500' :
                            canAccess ? 'text-primary' : 'text-slate-400'
                          }`}>
                            {step.status === 'completed' ? 'Verified' : step.status === 'overdue' ? 'Overdue' : canAccess ? 'In Progress' : 'Locked'}
                          </span>
                          {step.status === 'completed' && <div className="w-1 h-1 rounded-full bg-green-500" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8 h-fit">
          {/* Enhanced Navigation Tabs */}
          <div className="glass-card p-2 flex flex-wrap md:flex-nowrap items-center gap-2 bg-white border-slate-200 shadow-xl">
            {[
              { id: 'learn', icon: <Play size={18} />, label: 'LEARN', color: 'primary', locked: false },
              { id: 'planner', icon: <Calendar size={18} />, label: 'PLANNER', color: 'primary', locked: false },
              { id: 'quiz', icon: <CheckSquare size={18} />, label: 'ASSESS', color: 'accent', locked: !currentStep.learningCompleted },
              { id: 'project', icon: <Github size={18} />, label: 'PROJECT', color: 'secondary', locked: !currentStep.quizPassed },
              { id: 'tools', icon: <PenTool size={18} />, label: 'RESOURCES', color: 'white/10', locked: false }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  if (tab.locked) return;
                  setActiveTab(tab.id);
                  if (tab.id !== 'learn') setIsVideoPlaying(false);
                }}
                disabled={tab.locked}
                className={`flex-1 py-4 px-2 flex items-center justify-center gap-2 rounded-2xl text-[11px] md:text-xs font-black tracking-widest transition-all duration-500 ${
                  activeTab === tab.id 
                    ? `bg-${tab.color} text-slate-900 shadow-lg scale-[1.02]` 
                    : tab.locked 
                      ? 'text-slate-900/20 bg-slate-100 cursor-not-allowed'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon} <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Cards */}
          <div className="transition-all duration-500">
            {activeTab === "learn" && (
              <div className="glass-card p-0 animate-fade-in border-primary/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{currentStep.title}</h3>
                      <p className="text-slate-500 text-sm max-w-lg">Master this fundamental skill with our professional training and hands-on laboratory.</p>
                    </div>
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20">
                      <BookOpen size={30} />
                    </div>
                  </div>
                  {/* Relevant Video Resources */}
                  <div className="mb-10 space-y-4">
                     {currentStep.resourceVideos && currentStep.resourceVideos.length > 0 ? (
                        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 shadow-sm">
                           <h4 className="flex items-center gap-2 text-red-600 font-black mb-4 text-sm tracking-widest"><Play size={18} fill="currentColor"/> RECOMMENDED YOUTUBE RESOURCES</h4>
                           <div className="flex flex-col gap-3">
                                {currentStep.resourceVideos.map((vid, idx) => {
                                  const isID = /^[a-zA-Z0-9_-]{11}$/.test(vid);
                                  const href = isID 
                                    ? `https://www.youtube.com/watch?v=${vid}` 
                                    : `https://www.youtube.com/results?search_query=${encodeURIComponent(vid)}`;
                                  const label = isID ? `Mastery Video ${idx + 1}` : vid;
                                  return (
                                    <a 
                                      key={idx} 
                                      href={href} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="px-5 py-4 bg-white text-gray-900 rounded-xl font-bold flex items-center justify-between border border-gray-100 hover:border-red-300 hover:shadow-md transition-all group"
                                    >
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                             <Play size={14} fill="currentColor" />
                                         </div>
                                         <span className="capitalize">{label}</span>
                                      </div>
                                      <ExternalLink size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                                   </a>
                                 );
                               })}
                           </div>
                        </div>
                     ) : (
                        <div className="group relative hidden">
                          {/* Fallback space if no videos */}
                        </div>
                     )}
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-gradient-to-br from-surface/80 to-surface/40 rounded-3xl border border-slate-200 shadow-inner hover:border-slate-200 transition-colors">
                      <h4 className="flex items-center gap-2 text-primary font-bold mb-4 text-sm tracking-widest"><BookOpen size={18}/> TOPIC OVERVIEW</h4>
                      <div className="text-slate-500 leading-relaxed text-[15px] space-y-4">
                        {currentStep.resourceText ? (
                          <p className="whitespace-pre-wrap">{currentStep.resourceText}</p>
                        ) : (
                          <p>Welcome to the deep dive into <strong className="text-slate-900">{currentStep.title}</strong>. In this section, we will explore the core architectural patterns and implementation strategies. Pay close attention to the structural details discussed in the video tutorial above.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/10 gap-4">
                      <div>
                        {currentStep.learningCompleted ? (
                           <div className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle size={20}/> Learning marked as completed.</div>
                        ) : (
                           <>
                             <p className="font-bold text-slate-900 text-sm">Have you mastered this topic?</p>
                             <p className="text-xs text-slate-500">Mark as completed to unlock the Assessment challenge.</p>
                           </>
                        )}
                      </div>
                      <div className="flex gap-4 w-full md:w-auto">
                        {!currentStep.learningCompleted && (
                          <button 
                            onClick={async () => {
                              await handleStepUpdate({ learningCompleted: true });
                              setActiveTab("quiz");
                            }} 
                            className="flex-1 md:flex-none px-6 py-2.5 text-xs bg-white text-black hover:bg-slate-100 rounded-xl transition-all font-bold"
                          >
                            Mark Learned
                          </button>
                        )}
                        <button 
                          onClick={() => setActiveTab("quiz")} 
                          disabled={!currentStep.learningCompleted}
                          className="flex-1 md:flex-none px-6 py-2.5 text-xs bg-primary hover:bg-primary-hover text-slate-900 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                          {currentStep.learningCompleted ? "Start Quiz Now" : "Assess Locked"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center">
                      <button 
                        onClick={() => setActiveTab("planner")}
                        className="text-[11px] font-black text-slate-400 hover:text-primary flex items-center gap-2 transition-colors group"
                      >
                        <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        STUCK OR AHEAD? UPDATE YOUR SCHEDULE IN PLANNER
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "planner" && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card p-10 border-primary/20 bg-primary/5">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Study Planner</h3>
                      <p className="text-slate-500 text-sm">Schedule your milestones to stay on track and master your skills faster.</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                        onClick={handleAdaptiveUpdate}
                        disabled={isUpdating}
                        className="flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                        Update Roadmap
                      </button>
                      <div className="p-4 bg-primary/20 rounded-2xl border border-primary/10">
                        <Clock className="text-primary animate-pulse" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-8 border-l-2 border-slate-200 space-y-12 ml-4">
                    {path.steps.map((step, idx) => {
                      const status = getStepStatus(step);
                      return (
                        <div key={idx} className="relative group/step">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-surface shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-500 ${
                            step.status === 'completed' ? 'bg-green-500 scale-125' : 'bg-primary group-hover/step:scale-125'
                          }`} />
                          
                          <div className="bg-black p-6 rounded-2xl border border-white/20 transition-all duration-500 group-hover/step:translate-x-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-3">
                                  <span className="text-sm font-black text-white/90 mr-4 uppercase tracking-[0.1em]">Milestone {idx + 1}</span>
                                  <div className={`flex items-center gap-2 text-sm font-bold ${status.color}`}>
                                    {status.icon} <span>{status.label}</span>
                                  </div>
                                </div>
                                <h4 className="text-xl font-black text-white group-hover/step:text-white/80 transition-colors">{step.title}</h4>
                                <p className="text-sm text-white/50 line-clamp-1 mt-1">Master this core concept on your journey to mastery.</p>
                              </div>

                              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 transition-all">
                                <span className="text-[10px] font-black text-white/60 uppercase px-2">Scheduled For</span>
                                <input 
                                  type="date" 
                                  className="bg-transparent border-none text-white text-xs font-bold focus:ring-0 cursor-pointer min-w-[130px] invert"
                                  value={step.scheduledDate ? new Date(step.scheduledDate).toISOString().split('T')[0] : ""}
                                  onChange={(e) => updateStepDate(idx, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="glass-card p-10 animate-fade-in border-accent/20">
                <QuizComponent 
                  topic={currentStep.title} 
                  onComplete={async (score, passed) => {
                    if (passed) {
                      await handleStepUpdate({ quizPassed: true });
                      alert("Quiz Passed! Project Phase Unlocked.");
                      setActiveTab("project");
                    } else {
                      alert("Quiz Failed. Please review the material and try again.");
                    }
                  }} 
                />
              </div>
            )}

            {activeTab === "project" && (
              <div className="glass-card p-10 animate-fade-in border-secondary/20">
                <div className="max-w-xl mx-auto text-center">
                  <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary mx-auto mb-6">
                    <Github size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">Project Submission</h3>
                  <p className="text-slate-500 mb-10 text-sm">Submit your repository for **{currentStep.title}**. We'll verify your code activity and structure using the GitHub API.</p>
                  
                  <div className="relative mb-6">
                    <Github className="absolute left-5 top-5 text-secondary" size={20} />
                    <input 
                      type="text" 
                      placeholder="https://github.com/your-username/your-repo" 
                      className="pl-14 h-16 rounded-2xl border-slate-200 bg-white text-sm focus:ring-secondary/50"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={async () => {
                      setGithubLoading(true);
                      try {
                        const res = await githubService.verify(githubUrl);
                        setVerificationResult(res.data.data);
                        await handleStepUpdate({ projectVerified: true, status: 'completed' });
                      } catch (err) { alert(err.message || "Invalid repository URL or API error"); }
                      finally { setGithubLoading(false); }
                    }}
                    disabled={githubLoading || !githubUrl || currentStep.status === 'completed'}
                    className="w-full h-16 flex items-center justify-center gap-3 bg-secondary text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(var(--secondary-rgb),0.3)] transition-all disabled:opacity-50"
                  >
                    {githubLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                    {currentStep.status === 'completed' ? "Milestone Completed" : githubLoading ? "Verifying..." : "Verify & Complete Milestone"}
                  </button>

                  {verificationResult && currentStep.status === 'completed' && (
                    <div className="mt-10 p-8 bg-green-500/5 border border-green-500/20 rounded-3xl animate-bounce-subtle text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-500/20">
                        <CheckCircle size={24} />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2">Milestone Verified!</h4>
                      <p className="text-xs text-slate-500 mb-6">We found {verificationResult.commits} recent commits. Great job pushing your code consistently!</p>
                      
                      <button 
                        onClick={() => {
                          if (selectedStepIndex + 1 < path.steps.length) {
                            setSelectedStepIndex(selectedStepIndex + 1);
                            setActiveTab("learn");
                            setVerificationResult(null);
                            setGithubUrl("");
                          } else {
                            handleFinalCompletion();
                          }
                        }}
                        className="w-full py-4 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-colors"
                      >
                        {selectedStepIndex + 1 < path.steps.length ? "Proceed to Next Skill" : "Claim Final Certificate!"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass-card hover-lift p-10 border-slate-200 bg-gradient-to-br from-surface/50 to-surface/10">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900"><PenTool className="text-primary" /> Learning Journal</h3>
                  
                  <div className="relative mb-6">
                    <textarea 
                      placeholder="Capture your thoughts, key insights, and code snippets for this specific topic..."
                      className="w-full h-64 rounded-3xl p-6 bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 resize-none text-[15px] leading-relaxed text-slate-900 transition-all custom-scrollbar placeholder:text-slate-900/20"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button className="h-12 px-8 font-bold tracking-widest text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-900">CLEAR</button>
                    <button className="h-12 px-8 font-bold tracking-widest text-xs rounded-xl bg-primary hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] text-slate-900 flex items-center gap-2">
                       <Plus size={16} /> SAVE ENTRY
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {path.aiSuggestions && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 glass-card p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquare size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-white/10 shrink-0">
               <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                Coach's Strategy Suggestions
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed italic">
                "{path.aiSuggestions}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Intelligent Update Overlay */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full">
               <div className="relative w-24 h-24 mx-auto mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  />
                  <div className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center">
                     <RefreshCw className="text-primary animate-pulse" size={32} />
                  </div>
               </div>
               <h2 className="text-2xl font-black text-white mb-4">Regenerating Your Roadmap</h2>
               <p className="text-white/60 mb-8 whitespace-pre-wrap">Our AI is analyzing your progress and recalculating the optimal learning path for you...</p>
               <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "easeInOut" }}
                    className="h-full bg-primary"
                  />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PathDetail;
