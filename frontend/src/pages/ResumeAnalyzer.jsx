import React, { useState } from "react";
import { Upload, CheckCircle, XCircle, Loader2, Sparkles, Target } from "lucide-react";
import axios from "axios";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("Frontend Developer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file first");

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/resume/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-primary/80">AI Resume Analyzer</h1>
        <p className="text-text-muted text-lg">Upload your resume to see how well you match your target role and get a custom learning path.</p>
      </div>

      <div className={`grid grid-cols-1 ${result ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'} gap-8 transition-all duration-500`}>
        {/* Upload Form */}
        <div className="glass-card hover-lift p-10 border-white/10 shadow-2xl">
          <form onSubmit={handleUpload}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Target Role</label>
              <select 
                className="w-full glass-card bg-surface p-3 outline-none border border-border rounded-xl"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>Data Analyst</option>
              </select>
            </div>

            <div className={`mb-8 p-12 border-2 border-dashed rounded-3xl text-center transition-all cursor-pointer relative group ${file ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-primary/50 hover:bg-surface/50'}`}>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf"
              />
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-sm">{file ? file.name : "Click to upload PDF resume"}</p>
            </div>

            <button 
              type="submit" 
              className="w-full h-14 rounded-xl font-bold tracking-widest text-sm items-center justify-center flex gap-3 text-white transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none bg-primary hover:bg-primary-hover"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
            {error && <p className="text-secondary mt-4 text-sm text-center">{error}</p>}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="glass-card p-10 border-white/10 animate-fade-in shadow-2xl bg-gradient-to-br from-surface/80 to-surface/30">
            <div>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-white border-b border-white/5 pb-4">
                <Sparkles className="text-accent" /> Analysis Results
              </h2>
              
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Detected Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 bg-gradient-to-r from-accent/20 to-primary/10 border border-accent/30 rounded-2xl shadow-inner">
                <p className="text-[15px] font-medium leading-relaxed text-white">
                  <span className="text-accent font-black text-xl mr-2">"{Math.round((result.extractedSkills.length / (result.extractedSkills.length + result.missingSkills.length)) * 100)}% Match"</span> 
                  You are well on your way! We've generated a suggested roadmap for you based on these missing skills.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
