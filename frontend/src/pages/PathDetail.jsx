import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Trophy, CheckCircle, Circle, BookMarked, StickyNote, Github, ExternalLink, Plus, Trash2, Loader2, Play, BookOpen, PenTool, CheckSquare, Sparkles, TrendingUp, LayoutDashboard, Calendar, Clock, AlertCircle } from "lucide-react";
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
      updatedSteps[selectedStepIndex] = { ...updatedSteps[selectedStepIndex], ...updates };
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

  const getStepStatus = (step) => {
    if (step.status === 'completed') return { label: 'Completed', color: 'text-green-400', icon: <CheckCircle size={14}/> };
    if (!step.scheduledDate) return { label: 'Not Scheduled', color: 'text-slate-500', icon: <Clock size={14}/> };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const scheduled = new Date(step.scheduledDate);
    scheduled.setHours(0,0,0,0);
    const diffTime = scheduled - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: `${Math.abs(diffDays)} Days Overdue`, color: 'text-red-400', icon: <AlertCircle size={14}/> };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-yellow-400', icon: <Clock size={14}/> };
    return { label: `Due in ${diffDays} Days`, color: 'text-primary', icon: <Calendar size={14}/> };
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
    <div className="max-w-7xl mx-auto py-8 px-6 animate-fade-in font-outfit relative">
      
      {/* Dynamic Global Progress Bar */}
      <div className="sticky top-20 z-40 mb-10 -mx-6 px-6">
        <div className="glass-card p-4 flex items-center justify-between border-primary/30 bg-primary/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <TrendingUp className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Path Progress</p>
              <p className="text-lg font-bold text-slate-900 leading-none">{calcProgress()}% Mastered</p>
            </div>
          </div>
          <div className="flex-1 max-w-md mx-8 relative h-3 bg-white rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000 ease-out" 
              style={{ width: `${calcProgress()}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400 animate-pulse" size={18} />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Level: {path.difficultyLevel}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar - Roadmap Card */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="glass-card p-0 overflow-hidden border-slate-200 shadow-2xl group">
            <div className="p-8 bg-gradient-to-br from-primary/20 to-accent/10 border-b border-slate-200 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard size={80} />
              </div>
              <h2 className="text-2xl font-black mb-2 text-slate-900 leading-tight">{path.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{path.description}</p>
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
                          : <div className="text-[10px] font-bold">{idx + 1}</div>
                        }
                      </div>
                      <div>
                        <span className={`block text-sm font-bold transition-colors ${selectedStepIndex === idx ? 'text-slate-900' : 'group-hover/btn:text-slate-900'}`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold opacity-50">
                          {step.status === 'completed' ? 'Verified' : canAccess ? 'In Progress' : 'Locked'}
                        </span>
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
                <div className="p-10 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{currentStep.title}</h3>
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
                              {currentStep.resourceVideos.map((vid, idx) => (
                                <a 
                                  key={idx} 
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(vid)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-5 py-4 bg-white text-gray-900 rounded-xl font-bold flex items-center justify-between border border-gray-100 hover:border-red-300 hover:shadow-md transition-all group"
                                >
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                          <Play size={14} fill="currentColor" />
                                      </div>
                                      <span>{vid}</span>
                                   </div>
                                   <ExternalLink size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                                </a>
                              ))}
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
                  </div>
                </div>
              </div>
            )}

            {activeTab === "planner" && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card p-10 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Study Planner</h3>
                      <p className="text-slate-500 text-sm">Schedule your milestones to stay on track and master your skills faster.</p>
                    </div>
                    <div className="p-4 bg-primary/20 rounded-2xl border border-primary/10">
                      <Clock className="text-primary animate-pulse" size={24} />
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
                          
                          <div className="glass-card p-6 border-slate-200 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 group-hover/step:translate-x-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Milestone {idx + 1}</span>
                                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold ${status.color}`}>
                                    {status.icon} {status.label}
                                  </div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 group-hover/step:text-primary transition-colors">{step.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-1">Master this core concept on your journey to mastery.</p>
                              </div>

                              <div className="flex items-center gap-4 bg-slate-100 p-3 rounded-2xl border border-slate-200 border-dashed group-hover/step:border-primary/30 transition-all">
                                <span className="text-[10px] font-black text-slate-500 uppercase px-2">Scheduled For</span>
                                <input 
                                  type="date" 
                                  className="bg-transparent border-none text-slate-900 text-xs font-bold focus:ring-0 cursor-pointer min-w-[130px]"
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
    </div>
  );
};

export default PathDetail;
