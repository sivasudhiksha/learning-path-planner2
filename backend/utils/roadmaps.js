export const roleSkillMaps = {
  "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Tailwind", "Next.js", "Redux"],
  "Backend Developer": ["Node.js", "Express", "MongoDB", "PostgreSQL", "Python", "Django", "Docker", "Redis"],
  "Full Stack Developer": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "TypeScript", "HTML", "CSS"],
  "Data Analyst": ["Python", "SQL", "Pandas", "NumPy", "Tableau", "PowerBI", "R", "Excel"],
};

export const getSuggestedRoadmap = (role) => {
  // Logic to return a predefined roadmap ID or structure
  // For now, we returns a slug or name
  return roleSkillMaps[role] || [];
};
