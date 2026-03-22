import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LogOut, Home as HomeIcon, Sparkles } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex items-center justify-between mx-4 mt-4 rounded-2xl">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg">
            <HomeIcon size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-muted">
            PathPlanner
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
            <LayoutDashboard size={20} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/resume-analyzer" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
            <PlusCircle size={20} />
            <span className="hidden sm:inline">Resume Analyzer</span>
          </Link>
          <Link to="/create-path" className="flex items-center gap-2 transition-all group bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl border border-primary/20">
            <Sparkles size={18} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-primary font-bold text-sm">Generate Roadmap</span>
          </Link>
          <div className="h-6 w-[1px] bg-border mx-2"></div>
          
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <button className="secondary py-2 px-4 text-sm">Login</button>
              </Link>
              <Link to="/register">
                <button className="py-2 px-4 text-sm">Register</button>
              </Link>
            </>
          ) : (
            <button 
              onClick={handleLogout}
              className="secondary flex items-center gap-2 py-2 px-4 text-sm text-secondary hover:bg-secondary/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-text-muted text-sm mt-auto">
        <p>© 2026 Learning Path Planner. Built with ❤️ for students.</p>
      </footer>
    </div>
  );
};

export default Layout;
