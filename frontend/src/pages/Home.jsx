import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Target } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
        <Sparkles size={16} />
        <span>New: AI-Powered Career Roadmaps</span>
      </div>

      <h1 className="max-w-4xl mx-auto leading-tight mb-8 text-gray-900">
        Plan your learning journey.<br/> Stay consistent.<br/> <span className="text-primary italic">Prove your skills.</span>
      </h1>

      <p className="max-w-2xl mx-auto text-text-muted text-xl mb-12">
        A strict, guided workflow engine to transform your career goals into real, structured milestones.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-20">
        <button onClick={() => navigate('/register')} className="flex items-center gap-2">
          Get Started Free <ArrowRight size={20} />
        </button>
        <button onClick={() => navigate('/login')} className="secondary">
          Sign In
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
        <div className="glass-card p-8 text-left">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-6">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Structured Learning</h3>
          <p className="text-text-muted">Break down complex topics into digestible, actionable milestones.</p>
        </div>

        <div className="glass-card p-8 text-left border-primary/30">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary mb-6">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Goal Oriented</h3>
          <p className="text-text-muted">Set clear objectives and track your progress in real-time.</p>
        </div>

        <div className="glass-card p-8 text-left">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent mb-6">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">AI Recommendations</h3>
          <p className="text-text-muted">Get personalized course and project ideas based on your goals.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;