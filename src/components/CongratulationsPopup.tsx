
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

interface CongratulationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'quiz';
  score?: number;
  totalQuestions?: number;
}

const CongratulationsPopup: React.FC<CongratulationsPopupProps> = ({
  isOpen,
  onClose,
  type,
  score,
  totalQuestions
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      createConfetti();
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const createConfetti = () => {
    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti);
        }
      }, 5000);
    }
  };

  const getLoginMessage = () => ({
    title: "Welcome to DGC-AI! 🎉",
    subtitle: "You're ready to transform your learning experience",
    description: "Start uploading documents and create AI-powered quizzes to accelerate your learning journey."
  });

  const getQuizMessage = () => {
    const percentage = score && totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
    
    if (percentage >= 90) {
      return {
        title: "Outstanding Performance! 🏆",
        subtitle: `Perfect Score: ${score}/${totalQuestions}`,
        description: "You've mastered this topic completely! Ready for the next challenge?"
      };
    } else if (percentage >= 70) {
      return {
        title: "Great Job! 🌟",
        subtitle: `Good Score: ${score}/${totalQuestions}`,
        description: "You're doing well! Keep practicing to reach perfection."
      };
    } else {
      return {
        title: "Keep Learning! 💪",
        subtitle: `Score: ${score}/${totalQuestions}`,
        description: "Every expert was once a beginner. Review and try again!"
      };
    }
  };

  if (!isOpen) return null;

  const message = type === 'login' ? getLoginMessage() : getQuizMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="congratulations-enter glass-card-dark border-2 border-purple-500/30 max-w-md mx-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
        
        <CardContent className="p-8 text-center relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </Button>

          <div className="mb-6 relative">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              {type === 'login' ? (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center neon-glow floating-element">
                  <Sparkles size={40} className="text-white" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center neon-glow floating-element">
                  <Trophy size={40} className="text-white" />
                </div>
              )}
              
              {/* Floating particles */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-400 rounded-full particle" style={{animationDelay: '0s'}}></div>
              <div className="absolute -top-1 -right-3 w-3 h-3 bg-pink-400 rounded-full particle" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-2 -right-1 w-2 h-2 bg-blue-400 rounded-full particle" style={{animationDelay: '2s'}}></div>
              <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-green-400 rounded-full particle" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gradient mb-2 font-space">
            {message.title}
          </h2>
          
          <p className="text-xl font-semibold text-purple-300 mb-4">
            {message.subtitle}
          </p>
          
          <p className="text-slate-300 mb-6 leading-relaxed">
            {message.description}
          </p>

          {type === 'quiz' && (
            <div className="flex justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={24}
                  className={`transition-colors duration-300 ${
                    score && totalQuestions && (score / totalQuestions) * 5 > index
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          <Button
            onClick={onClose}
            className="btn-3d text-white px-8 py-3 text-lg rounded-2xl w-full"
          >
            {type === 'login' ? 'Start Learning' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CongratulationsPopup;
