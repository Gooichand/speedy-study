
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
            <h1 className="text-2xl font-bold text-slate-100 mb-4">No Quiz Available</h1>
            <p className="text-slate-400 mb-8">No quiz has been generated for this document yet.</p>
            <Link to={`/document/${id}`}>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
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
              <CardTitle className="text-3xl font-bold text-slate-100 mb-4">
                Quiz Complete! 🎉
              </CardTitle>
              <div className={`text-6xl font-bold ${getScoreColor()}`}>
                {score}/{quiz.questions.length}
              </div>
              <p className="text-xl text-slate-300 mt-2">
                You scored {Math.round((score / quiz.questions.length) * 100)}%
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = typeof userAnswer === 'string' && typeof question.correctAnswer === 'string' 
                  ? userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                  : false;

                return (
                  <div key={question.id} className="border border-slate-600/50 rounded-lg p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/30">
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="text-emerald-400 mt-1" size={20} />
                      ) : (
                        <XCircle className="text-red-400 mt-1" size={20} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-slate-200">Question {index + 1}</h3>
                        <p className="text-slate-300 mb-2">{question.question}</p>
                        <div className="space-y-1">
                          <p className="text-slate-300"><strong>Your answer:</strong> {userAnswer || 'Not answered'}</p>
                          <p className="text-slate-300"><strong>Correct answer:</strong> {question.correctAnswer}</p>
                          <p className="text-sm text-slate-400 mt-2 bg-slate-800/50 p-2 rounded">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-center space-x-4 pt-6">
                <Button onClick={resetQuiz} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                  <RotateCcw size={20} className="mr-2" />
                  Retake Quiz
                </Button>
                <Link to={`/document/${id}`}>
                  <Button variant="outline" className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400">
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
          <div className="flex items-center justify-between mb-4">
            <Link to={`/document/${id}`}>
              <Button variant="outline" className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400">
                <ArrowLeft size={20} className="mr-2" />
                Back to Document
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-4">Document Quiz</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-slate-400">
              Progress: {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>

        <Card className="glass-card border-slate-700/50 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="text-purple-400" size={24} />
              <span className="text-slate-100">Question {currentQuestion + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="text-lg font-medium text-slate-200">
              {currentQ.question}
            </div>

            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedAnswer === option
                        ? 'border-purple-400 bg-purple-500/20'
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
                    <span className="text-slate-300">{option}</span>
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
                  className="w-full p-4 border-2 border-slate-600/50 rounded-lg focus:border-purple-400 focus:outline-none bg-slate-800/50 text-slate-200 placeholder-slate-500"
                />
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(currentQuestion - 1);
                    setSelectedAnswer(answers[currentQuestion - 1] || '');
                  }
                }}
                disabled={currentQuestion === 0}
                className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-200"
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
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
