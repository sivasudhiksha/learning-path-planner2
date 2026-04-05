import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft, Target, Clock, Zap, Layers } from "lucide-react";
import { learningPathService } from "../services/api";

const CreatePath = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    skills: "",
    difficultyLevel: "basic",
    duration: "4 weeks",
    durationValue: "4",
    durationUnit: "weeks",
    preference: "Both"
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await learningPathService.create(formData);
      navigate(`/path/${res.data._id}`);
    } catch (err) {
      alert("Error creating path: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const levels = [
    { id: "basic", label: "Beginner", desc: "Start from the absolute basics", icon: <Zap size={20} /> },
    { id: "intermediate", label: "Intermediate", desc: "Boost your existing knowledge", icon: <Layers size={20} /> },
    { id: "advanced", label: "Professional", desc: "Master advanced industry practices", icon: <Target size={20} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 shadow-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-primary" /> Roadmap Wizard
        </h1>
        <p className="text-text-muted">Personalize your journey to mastery</p>
      </div>

      <div className="glass-card p-10 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-surface font-outfit">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-primary">
              <Target /> Define your learning goals
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-text-muted mb-2">Target Role</label>
              <input 
                type="text" 
                placeholder="e.g. Web Developer, Data Analyst..."
                className="w-full p-4 rounded-xl bg-surface/50 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            
            <div className="mb-10">
              <label className="block text-sm font-bold text-text-muted mb-2">Skills to Learn (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. React, Node.js, MongoDB..."
                className="w-full p-4 rounded-xl bg-surface/50 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
              <p className="text-xs text-text-muted mt-2">We will generate your curriculum directly based on these exact skills.</p>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleNext} 
                disabled={!formData.role || !formData.skills} 
                className="flex items-center gap-2 bg-primary text-white py-3 px-8 rounded-xl hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/30"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-accent">
              <Layers /> Select your expertise level
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {levels.map(l => (
                <button 
                  key={l.id}
                  onClick={() => setFormData({ ...formData, difficultyLevel: l.id })}
                  className={`p-6 text-left border-2 rounded-xl flex items-center gap-4 transition-all 
                    ${formData.difficultyLevel === l.id 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-border bg-white text-gray-700 hover:border-black/50'}`}
                >
                  <div className={formData.difficultyLevel === l.id ? 'text-white' : 'text-primary'}>{l.icon}</div>
                  <div>
                    <div className={`font-bold ${formData.difficultyLevel === l.id ? 'text-white' : 'text-gray-900'}`}>{l.label}</div>
                    <div className={`text-sm ${formData.difficultyLevel === l.id ? 'text-white/70' : 'text-gray-500'}`}>{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={handleBack} className="secondary flex items-center gap-2 py-3 px-6">
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 bg-primary text-white py-3 px-6 rounded-xl hover:bg-primary-dark">
                Nearly there <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-secondary">
              <Clock /> Set your timeline & preference
            </h3>
            <label className="block text-sm font-bold text-text-muted mb-3">Time Commitment</label>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1">
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-4 rounded-xl bg-surface/50 border border-white/10 text-white focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-bold"
                  value={formData.durationValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ 
                      ...formData, 
                      durationValue: val,
                      duration: `${val} ${formData.durationUnit}`
                    });
                  }}
                />
              </div>
              <div className="w-1/3">
                <select 
                  className="w-full p-4 rounded-xl bg-surface/50 border border-white/10 text-white focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-bold appearance-none cursor-pointer"
                  value={formData.durationUnit}
                  onChange={(e) => {
                    const unit = e.target.value;
                    setFormData({ 
                      ...formData, 
                      durationUnit: unit,
                      duration: `${formData.durationValue} ${unit}`
                    });
                  }}
                >
                  <option value="weeks" className="bg-zinc-900">Weeks</option>
                  <option value="months" className="bg-zinc-900">Months</option>
                </select>
              </div>
            </div>

            <label className="block text-sm font-bold text-text-muted mb-3">Learning Preference</label>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {["Video", "Reading", "Both"].map(p => (
                <button 
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, preference: p })}
                  className={`p-4 border-2 rounded-xl transition-all font-bold 
                    ${formData.preference === p 
                      ? "!bg-black !text-white border-black shadow-xl scale-105" 
                      : "!bg-white border-gray-300 !text-gray-600 hover:border-black hover:!text-black"}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="p-6 border bg-surface/80 rounded-2xl text-sm border-l-4 border-l-secondary mb-8 shadow-inner border-white/5">
              <p className="text-gray-900 mb-3 font-black tracking-widest uppercase text-xs">Target Summary</p>
              <p className="text-gray-600 leading-relaxed font-medium">
                You will pursue the <span className="text-primary font-bold">{formData.role}</span> role at a <span className="text-primary font-bold">{formData.difficultyLevel}</span> level over <span className="text-primary font-bold">{formData.duration}</span>. 
                Your curriculum will be strictly generated for <span className="text-primary font-bold break-words">{formData.skills}</span>.
              </p>
            </div>
            <div className="flex justify-between">
              <button onClick={handleBack} className="secondary flex items-center gap-2 py-3 px-6">
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
                {loading ? "Generating..." : "Generate My Path"} <Sparkles size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePath;