
export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    case 'intermediate': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/50';
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
  }
};

export const getDocumentTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'academic': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    case 'business': return 'bg-green-500/20 text-green-300 border-green-500/50';
    case 'technical': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    case 'research': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
  }
};
