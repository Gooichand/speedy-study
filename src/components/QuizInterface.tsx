
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCcw, Brain, Shuffle } from 'lucide-react';
import CongratulationsPopup from '@/components/CongratulationsPopup';

const QuizInterface = () => {
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [score, setScore] = useState(0);
  const [quizVariant, setQuizVariant] = useState(0);

  // Multiple quiz variants with different questions
  const quizVariants = [
    {
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
    },
    {
      title: "Advanced Machine Learning Concepts",
      questions: [
        {
          id: 1,
          type: "mcq",
          question: "Which algorithm is best suited for classification problems?",
          options: [
            "Linear Regression",
            "Random Forest",
            "K-means Clustering",
            "PCA"
          ],
          correctAnswer: "Random Forest",
          explanation: "Random Forest is an ensemble method that works well for both classification and regression, making it ideal for classification problems."
        },
        {
          id: 2,
          type: "fill",
          question: "The process of reducing the number of features in a dataset is called ____.",
          correctAnswer: "dimensionality reduction",
          explanation: "Dimensionality reduction techniques like PCA help reduce the number of features while preserving important information."
        },
        {
          id: 3,
          type: "short",
          question: "What is cross-validation used for?",
          correctAnswer: "To evaluate model performance and prevent overfitting",
          explanation: "Cross-validation is a technique used to assess how well a model will generalize to unseen data by splitting the dataset into multiple folds."
        }
      ]
    },
    {
      title: "Data Science Fundamentals",
      questions: [
        {
          id: 1,
          type: "mcq",
          question: "What is the purpose of feature scaling?",
          options: [
            "To make all features have the same range",
            "To remove outliers from data",
            "To increase the number of features",
            "To visualize the data better"
          ],
          correctAnswer: "To make all features have the same range",
          explanation: "Feature scaling ensures that all features contribute equally to the distance calculations in algorithms like KNN and SVM."
        },
        {
          id: 2,
          type: "fill",
          question: "The measure of how spread out data points are is called ____.",
          correctAnswer: "variance",
          explanation: "Variance measures the average squared deviation from the mean, indicating how spread out the data points are."
        },
        {
          id: 3,
          type: "short",
          question: "What is the difference between correlation and causation?",
          correctAnswer: "Correlation shows relationship, causation shows one causes the other",
          explanation: "Correlation indicates that two variables move together, while causation means one variable directly influences the other."
        }
      ]
    }
  ];

  const currentQuizData = quizVariants[quizVariant];
  const currentQ = currentQuizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / currentQuizData.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < currentQuizData.questions.length - 1) {
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
    currentQuizData.questions.forEach((q, index) => {
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

  const generateNewQuiz = () => {
    const newVariant = (quizVariant + 1) % quizVariants.length;
    setQuizVariant(newVariant);
    resetQuiz();
  };

  const getScoreColor = () => {
    const percentage = (score / currentQuizData.questions.length) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (showResults) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-slate-700/90 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
            <div className="absolute inset-[1px] bg-slate-700/95 backdrop-blur-xl rounded-lg"></div>
            
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-3xl font-bold text-gradient mb-4">
                Quiz Complete! 🎉
              </CardTitle>
              <div className={`text-6xl font-bold ${getScoreColor()}`}>
                {score}/{currentQuizData.questions.length}
              </div>
              <p className="text-xl text-slate-200 mt-2">
                You scored {Math.round((score / currentQuizData.questions.length) * 100)}%
              </p>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {currentQuizData.questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = typeof userAnswer === 'string' && typeof question.correctAnswer === 'string' 
                  ? userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                  : false;

                return (
                  <div key={question.id} className="border border-slate-500 rounded-lg p-4 bg-slate-600/50 backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="text-green-400 mt-1" size={20} />
                      ) : (
                        <XCircle className="text-red-400 mt-1" size={20} />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-slate-100">Question {index + 1}</h3>
                        <p className="text-slate-200 mb-2">{question.question}</p>
                        <div className="space-y-1">
                          <p className="text-slate-200"><strong>Your answer:</strong> {userAnswer || 'Not answered'}</p>
                          <p className="text-slate-200"><strong>Correct answer:</strong> {question.correctAnswer}</p>
                          <p className="text-sm text-slate-300 mt-2">{question.explanation}</p>
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
                <Button onClick={generateNewQuiz} className="btn-3d bg-gradient-to-r from-pink-500 to-purple-500">
                  <Shuffle size={20} className="mr-2" />
                  Try Different Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <CongratulationsPopup
          isOpen={showCongrats}
          onClose={() => setShowCongrats(false)}
          type="quiz"
          score={score}
          totalQuestions={currentQuizData.questions.length}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-4">{currentQuizData.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-200">
              Question {currentQuestion + 1} of {currentQuizData.questions.length}
            </span>
            <span className="text-sm text-slate-300">
              Progress: {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-slate-700/90 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
          <div className="absolute inset-[1px] bg-slate-700/95 backdrop-blur-xl rounded-lg"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="text-purple-400" size={24} />
              <span className="text-slate-100">Question {currentQuestion + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="text-lg font-medium text-slate-100">
              {currentQ.question}
            </div>

            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedAnswer === option
                        ? 'border-purple-400 bg-purple-500/20 backdrop-blur-sm'
                        : 'border-slate-500 bg-slate-600/30 hover:border-purple-400 hover:bg-slate-600/50'
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
                    <span className="text-slate-200">{option}</span>
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
                  className="w-full p-4 border-2 border-slate-500 rounded-lg focus:border-purple-400 focus:outline-none bg-slate-600/50 text-slate-100 placeholder-slate-300 backdrop-blur-sm"
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
                className="border-slate-500 hover:border-slate-400 text-slate-200 hover:text-white bg-slate-600/50 hover:bg-slate-600/70"
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer.trim()}
                className="btn-3d bg-purple-gradient"
              >
                {currentQuestion === currentQuizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizInterface;
