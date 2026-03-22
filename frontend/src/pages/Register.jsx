import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Loader2, Target, Code, Clock } from 'lucide-react';
import { authService } from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New Fields
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [duration, setDuration] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pwd) => {
    // Min 8 characters, at least 1 number, and 1 special character
    const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return re.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain a number and a special character.');
      setLoading(false);
      return;
    }
    
    try {
      // Split skills string into array
      const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
      
      await authService.register({ 
        name, 
        email, 
        password,
        role,
        skills: skillsArray,
        duration
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-8">
      <div className="glass-card p-10 w-full max-w-xl animate-fade-in bg-white shadow-xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm border border-blue-100">
            <UserPlus size={32} />
          </div>
          <h2 className="mb-2 text-gray-900 font-black">Create Account</h2>
          <p className="text-gray-500 font-medium">Define your goals. We'll build the path.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                className="pl-12 bg-gray-50 border-gray-200 text-gray-900 w-full py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="pl-12 bg-gray-50 border-gray-200 text-gray-900 w-full py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password (Min 8 chars, 1 num, 1 special)"
              className="pl-12 bg-gray-50 border-gray-200 text-gray-900 w-full py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="pt-4 pb-2">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Initial Goal Setup</h3>
            <div className="w-full h-px bg-gray-200 mb-4"></div>
          </div>

          <div className="relative">
            <Target className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="What do you want to learn? (e.g. Data Scientist, Python)"
              className="pl-12 bg-gray-50 border-gray-200 text-gray-900 w-full py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-0"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Code className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Languages you already know (comma separated)"
              className="pl-12 bg-gray-50 border-gray-200 text-gray-900 w-full py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-0"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="relative">
            <Clock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Learning duration (e.g. 90 days, 6 months)"
              className="pl-12 bg-gray-50 border-gray-200 text-gray-900 w-full py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account & Begin Journey'}
          </button>
          
          {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;