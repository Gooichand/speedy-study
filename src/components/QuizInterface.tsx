import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCcw, Brain, ArrowLeft, Loader2 } from 'lucide-react';
import CongratulationsPopup from '@/components/CongratulationsPopup';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  questions: Question[];
  document_id: string;
}

const QuizInterface = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (id && user) {
      fetchQuizData();
    }
  }, [id, user]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      const { data: quizData, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('document_id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!quizData) {
        toast({
          title: "No Quiz Available",
          description: "No quiz has been generated for this document yet.",
          variant: "destructive"
        });
        return;
      }

      // Parse the questions from Json to Question array
      const parsedQuestions = Array.isArray(quizData.questions) 
        ? quizData.questions as unknown as Question[]
        : [];

      if (parsedQuestions.length === 0) {
        toast({
          title: "Empty Quiz",
          description: "This quiz has no questions. Please regenerate the quiz.",
          variant: "destructive"
        });
        return;
      }

      setQuiz({
        id: quizData.id,
        questions: parsedQuestions,
        document_id: quizData.document_id
      });
    } catch (error) {
      console.error('Error in fetchQuizData:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-slate-300">Loading quiz...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-4">No Quiz Available</h1>
            <p className="text-slate-400 mb-8 text-lg">No quiz has been generated for this document yet.</p>
            <Link to={`/document/${id}`}>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <ArrowLeft size={20} className="mr-2" />
                Back to Document
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    } else {
      calculateScore(newAnswers);
      setShowResults(true);
      setShowCongrats(true);
    }
  };

  const calculateScore = (userAnswers: string[]) => {
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      if (typeof userAnswer === 'string' && typeof q.correctAnswer === 'string') {
        if (userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
          correct++;
        }
      }
    });
    setScore(correct);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setAnswers([]);
    setShowResults(false);
    setShowCongrats(false);
    setScore(0);
  };

  const getScoreColor = () => {
    const percentage = (score / quiz.questions.length) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  if (showResults) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              <CardTitle className="text-4xl font-bold text-slate-100 mb-4">
                Quiz Complete! 🎉
              </CardTitle>
              <div className={`text-7xl font-bold ${getScoreColor()} mb-2`}>
                {score}/{quiz.questions.length}
              </div>
              <p className="text-2xl text-slate-300">
                You scored {Math.round((score / quiz.questions.length) * 100)}%
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = typeof userAnswer === 'string' && typeof question.correctAnswer === 'string' 
                  ? userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                  : false;

                return (
                  <div key={question.id} className="border border-slate-600/50 rounded-lg p-6 bg-gradient-to-r from-slate-800/30 to-slate-700/30 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="text-emerald-400 mt-1" size={24} />
                        ) : (
                          <XCircle className="text-red-400 mt-1" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-3 text-slate-200 text-lg">Question {index + 1}</h3>
                        <p className="text-slate-300 mb-4 text-lg leading-relaxed">{question.question}</p>
                        <div className="space-y-2">
                          <p className="text-slate-300"><strong>Your answer:</strong> <span className={isCorrect ? 'text-emerald-300' : 'text-red-300'}>{userAnswer || 'Not answered'}</span></p>
                          <p className="text-slate-300"><strong>Correct answer:</strong> <span className="text-emerald-300">{question.correctAnswer}</span></p>
                          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                            <p className="text-sm text-slate-400"><strong>Explanation:</strong></p>
                            <p className="text-sm text-slate-300 mt-1">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-center space-x-4 pt-8">
                <Button onClick={resetQuiz} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-3">
                  <RotateCcw size={20} className="mr-2" />
                  Retake Quiz
                </Button>
                <Link to={`/document/${id}`}>
                  <Button variant="outline" className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400 transform hover:scale-105 transition-all duration-200 px-8 py-3">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Document
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <CongratulationsPopup
          isOpen={showCongrats}
          onClose={() => setShowCongrats(false)}
          type="quiz"
          score={score}
          totalQuestions={quiz.questions.length}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-900">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to={`/document/${id}`}>
              <Button variant="outline" className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400 transform hover:scale-105 transition-all duration-200">
                <ArrowLeft size={20} className="mr-2" />
                Back to Document
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Document Quiz</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300 text-lg">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-slate-400">
              Progress: {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </Progress>
        </div>

        <Card className="glass-card border-slate-700/50 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="text-white" size={24} />
              </div>
              <span className="text-slate-100 text-2xl">Question {currentQuestion + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="text-xl font-medium text-slate-200 leading-relaxed">
              {currentQ.question}
            </div>

            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-4">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg transform hover:scale-[1.02] ${
                      selectedAnswer === option
                        ? 'border-purple-400 bg-purple-500/20 shadow-lg'
                        : 'border-slate-600/50 bg-slate-800/30 hover:border-purple-500/50 hover:bg-purple-500/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-slate-300 text-lg">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentQ.type === 'fill' || currentQ.type === 'short') && (
              <div>
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-6 border-2 border-slate-600/50 rounded-xl focus:border-purple-400 focus:outline-none bg-slate-800/50 text-slate-200 placeholder-slate-500 text-lg transition-all"
                />
              </div>
            )}

            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                    setSelectedAnswer(answers[currentQuestion - 1] || '');
                  }
                }}
                disabled={currentQuestion === 0}
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-200 disabled:opacity-50 transform hover:scale-105 transition-all duration-200 px-8 py-3"
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 px-8 py-3"
              >
                {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizInterface;
