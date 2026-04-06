import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, XCircle, Loader2, Sparkles, Target } from "lucide-react";
import axios from "axios";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("Frontend Developer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "null") {
      navigate("/login");
    }
  }, [navigate]);

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
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
      const res = await axios.post(`${baseUrl}/resume/analyze`, formData, {
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
              <input 
                type="text"
                className="w-full glass-card bg-surface p-3 outline-none border border-border rounded-xl text-white"
                placeholder="e.g. Senior Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
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
                <p className="text-sm font-medium mb-3">AI Alignment Score</p>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/20">
                        {result.alignmentScore}% Match
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-white/10">
                    <div style={{ width: `${result.alignmentScore}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"></div>
                  </div>
                </div>
              </div>

              {result.alignmentSuggestions && (
                <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm">
                  <p className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5" /> Expert Coach's Suggestions
                  </p>
                  <div className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap font-medium">
                    {result.alignmentSuggestions}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Detected Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs flex items-center gap-1 border border-primary/30">
                      <CheckCircle className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6 text-white/80">
                <p className="text-sm font-medium mb-3">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs flex items-center gap-1 border border-secondary/30">
                      <XCircle className="w-3 h-3" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 bg-gradient-to-r from-accent/20 to-primary/10 border border-accent/20 rounded-2xl shadow-xl">
                <p className="text-[14px] font-medium leading-relaxed text-white">
                   We've analyzed your resume for the **{result.role}** role. You have a solid foundation, and we've generated a suggested roadmap to help you bridge the gap!
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
