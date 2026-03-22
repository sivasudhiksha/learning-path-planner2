import React, { useState, useEffect } from "react";
import { User, Mail, GraduationCap, Briefcase, Linkedin, Github, Code, Save, Loader2, ArrowLeft } from "lucide-react";
import { userService } from "../services/api";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    education: "",
    skills: "",
    linkedin: "",
    github: "",
    leetcode: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await userService.getProfile();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        education: data.profile?.education || "",
        skills: data.profile?.skills ? data.profile.skills.join(", ") : "",
        linkedin: data.profile?.linkedin || "",
        github: data.profile?.github || "",
        leetcode: data.profile?.leetcode || ""
      });
    } catch (err) {
      setMessage({ text: "Failed to load profile.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      // Process skills into array, filter empty
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        profile: {
          education: formData.education,
          skills: skillsArray,
          linkedin: formData.linkedin,
          github: formData.github,
          leetcode: formData.leetcode
        }
      };

      await userService.updateProfile(updateData);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4 w-12 h-12" />
        <p className="text-white font-bold tracking-widest uppercase">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      
      <button 
        onClick={() => navigate("/dashboard")}
        className="absolute top-0 left-4 sm:left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mt-12"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="text-center mt-16 mb-12">
        <h1 className="text-4xl font-black text-white mb-2">User Profile</h1>
        <p className="text-gray-400">Manage your personal details, education, and connected platform links.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* General Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b border-gray-100 pb-3 mb-6">General Information</h2>
            
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <User size={14} className="text-primary"/> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <Mail size={14} className="text-primary"/> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <GraduationCap size={14} className="text-primary"/> Education Background
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. B.S. in Computer Science"
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <Briefcase size={14} className="text-primary"/> Core Skills (Comma Separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python"
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b border-gray-100 pb-3 mb-6">Platform Profiles</h2>
            
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <Linkedin size={14} className="text-[#0A66C2]"/> LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <Github size={14} className="text-gray-800"/> GitHub Profile URL
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                <Code size={14} className="text-[#FFA116]"/> LeetCode Profile URL
              </label>
              <input
                type="url"
                name="leetcode"
                value={formData.leetcode}
                onChange={handleChange}
                placeholder="https://leetcode.com/username"
                className="w-full bg-gray-50 border border-gray-200 text-black py-3 px-4 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>
            
            {message.text && (
              <div className={`mt-8 p-4 rounded-xl text-center font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform shadow-lg hover:-translate-y-1 hover:shadow-primary/30 disabled:opacity-70 disabled:transform-none"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
