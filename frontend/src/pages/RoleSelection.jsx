import React from "react";
import { Code, Database, Globe, BarChart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Frontend Developer",
      icon: <Globe className="w-8 h-8 text-primary" />,
      description: "Master React, CSS, and modern web architectures.",
      skills: ["React", "TypeScript", "Tailwind", "Next.js"],
      color: "from-primary/20 to-primary/5"
    },
    {
      title: "Backend Developer",
      icon: <Database className="w-8 h-8 text-secondary" />,
      description: "Build robust APIs and manage scalable databases.",
      skills: ["Node.js", "Express", "MongoDB", "Docker"],
      color: "from-secondary/20 to-secondary/5"
    },
    {
      title: "Full Stack Developer",
      icon: <Code className="w-8 h-8 text-accent" />,
      description: "Connect the dots between frontend and backend.",
      skills: ["React", "Node.js", "MongoDB", "TypeScript"],
      color: "from-accent/20 to-accent/5"
    },
    {
      title: "Data Analyst",
      icon: <BarChart className="w-8 h-8 text-emerald-500" />,
      description: "Extract insights from complex data sets.",
      skills: ["Python", "SQL", "Pandas", "Tableau"],
      color: "from-emerald-500/20 to-emerald-500/5"
    }
  ];

  const handleSelect = (roleTheme) => {
    // Navigate to create path with prepopulated data or directly generate
    navigate("/create-path", { state: { role: roleTheme } });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Select Your Career Role</h1>
        <p className="text-text-muted text-lg">Fast-track your career with pre-designed, industry-standard roadmaps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => (
          <div 
            key={role.title}
            onClick={() => handleSelect(role.title)}
            className={`glass-card p-8 group cursor-pointer hover:border-primary/50 transition-all bg-gradient-to-br ${role.color}`}
          >
            <div className="mb-6 p-4 bg-background rounded-2xl w-fit group-hover:scale-110 transition-transform">
              {role.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{role.title}</h3>
            <p className="text-sm text-text-muted mb-6">{role.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {role.skills.map(skill => (
                <span key={skill} className="text-[10px] px-2 py-1 bg-background/50 rounded-md border border-border">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Select Role <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
