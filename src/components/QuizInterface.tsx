
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCcw, Brain } from 'lucide-react';

const QuizInterface = () => {
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Mock quiz data - replace with real data from backend
  const quizData = {
    title: "Understanding AI and Machine Learning Concepts",
    questions: [
      {
        id: 1,
        type: "mcq",
        question: "What is the primary difference between supervised and unsupervised learning?",
        options: [
          "Supervised learning uses labeled data, unsupervised learning doesn't",
          "Supervised learning is faster than unsupervised learning",
          "Supervised learning only works with text data",
          "There is no difference between them"
        ],
        correctAnswer: "Supervised learning uses labeled data, unsupervised learning doesn't",
        explanation: "Supervised learning algorithms learn from labeled training data to make predictions, while unsupervised learning finds patterns in data without labeled examples."
      },
      {
        id: 2,
        type: "fill",
        question: "Neural networks are inspired by the structure of the human ____.",
        correctAnswer: "brain",
        explanation: "Neural networks are computational models inspired by the way biological neural networks in the human brain process information."
      },
      {
        id: 3,
        type: "short",
        question: "Explain what overfitting means in machine learning.",
        correctAnswer: "When a model learns training data too well and fails to generalize",
        explanation: "Overfitting occurs when a model memorizes the training data instead of learning generalizable patterns, leading to poor performance on new, unseen data."
      }
    ]
  };

  const currentQ = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    } else {
      calculateScore(newAnswers);
      setShowResults(true);
    }
  };

  const calculateScore = (userAnswers: string[]) => {
    let correct = 0;
    quizData.questions.forEach((q, index) => {
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
    setScore(0);
  };

  const getScoreColor = () => {
    const percentage = (score / quizData.questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (showResults) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card border-2 border-purple-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gradient mb-4">
                Quiz Complete! 🎉
              </CardTitle>
              <div className={`text-6xl font-bold ${getScoreColor()}`}>
                {score}/{quizData.questions.length}
              </div>
              <p className="text-xl text-gray-600 mt-2">
                You scored {Math.round((score / quizData.questions.length) * 100)}%
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizData.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = typeof userAnswer === 'string' && typeof question.correctAnswer === 'string' 
                  ? userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                  : false;

                return (
                  <div key={question.id} className="border rounded-lg p-4 bg-white/50">
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="text-green-600 mt-1" size={20} />
                      ) : (
                        <XCircle className="text-red-600 mt-1" size={20} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Question {index + 1}</h3>
                        <p className="text-gray-700 mb-2">{question.question}</p>
                        <div className="space-y-1">
                          <p><strong>Your answer:</strong> {userAnswer || 'Not answered'}</p>
                          <p><strong>Correct answer:</strong> {question.correctAnswer}</p>
                          <p className="text-sm text-gray-600 mt-2">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-center space-x-4 pt-6">
                <Button onClick={resetQuiz} className="btn-3d bg-purple-gradient">
                  <RotateCcw size={20} className="mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-4">{quizData.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            <span className="text-sm text-gray-500">
              Progress: {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="glass-card border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="text-purple-600" size={24} />
              <span>Question {currentQuestion + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-gray-800">
              {currentQ.question}
            </div>

            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedAnswer === option
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
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
                    <span className="text-gray-700">{option}</span>
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
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
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
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer.trim()}
                className="btn-3d bg-purple-gradient"
              >
                {currentQuestion === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizInterface;
