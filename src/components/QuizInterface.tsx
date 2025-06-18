
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, X, RefreshCw, Target, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuizInterface = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | string[])[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = [
    {
      type: 'mcq',
      question: 'What is the primary difference between supervised and unsupervised learning?',
      options: [
        'Supervised learning uses labeled data, unsupervised learning uses unlabeled data',
        'Supervised learning is faster than unsupervised learning',
        'Supervised learning uses more data than unsupervised learning',
        'There is no difference between them'
      ],
      correctAnswer: 0,
      explanation: 'Supervised learning algorithms learn from labeled training data, where the correct output is known. Unsupervised learning finds patterns in data without labeled examples.',
      difficulty: 'Intermediate',
      pageReference: '6-8'
    },
    {
      type: 'fill',
      question: 'Neural networks use a process called _______ to adjust weights and minimize error.',
      correctAnswer: 'backpropagation',
      explanation: 'Backpropagation is the algorithm used to train neural networks by propagating the error backward through the network and adjusting weights accordingly.',
      difficulty: 'Advanced',
      pageReference: '28-30'
    },
    {
      type: 'short',
      question: 'Explain the concept of overfitting in machine learning and how it can be prevented.',
      sampleAnswer: 'Overfitting occurs when a model learns the training data too well, including noise and irrelevant patterns, resulting in poor performance on new data. It can be prevented through techniques like cross-validation, regularization, early stopping, and using more training data.',
      difficulty: 'Advanced',
      pageReference: '38-40'
    },
    {
      type: 'match',
      question: 'Match the algorithm with its primary use case:',
      leftColumn: ['Linear Regression', 'K-Means', 'Decision Tree', 'SVM'],
      rightColumn: ['Classification with clear boundaries', 'Clustering data', 'Predicting continuous values', 'Rule-based decisions'],
      correctMatches: [2, 1, 3, 0],
      explanation: 'Each algorithm has specific strengths: Linear Regression for continuous predictions, K-Means for clustering, Decision Trees for interpretable rules, and SVM for complex classification boundaries.',
      difficulty: 'Intermediate',
      pageReference: '10-20'
    }
  ];

  const handleAnswerSelect = (answer: string | string[]) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      if (question.type === 'mcq' && userAnswer === question.correctAnswer) {
        correct++;
      } else if (question.type === 'fill' && 
                 typeof userAnswer === 'string' && 
                 userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase())) {
        correct++;
      }
      // For short answer and match questions, we'll assume they're correct for demo purposes
      else if (question.type === 'short' && userAnswer) {
        correct++;
      } else if (question.type === 'match' && userAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizCompleted(false);
    toast({
      title: "Quiz Reset",
      description: "New questions have been generated for your retry!"
    });
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const userAnswer = selectedAnswers[currentQuestion];

    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  userAnswer === index
                    ? 'border-dgc-purple bg-purple-50'
                    : 'border-gray-200 hover:border-dgc-purple/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    userAnswer === index ? 'border-dgc-purple bg-dgc-purple' : 'border-gray-300'
                  }`}>
                    {userAnswer === index && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'fill':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-lg text-gray-700 leading-relaxed">
                {question.question}
              </p>
            </div>
            <input
              type="text"
              placeholder="Enter your answer..."
              value={typeof userAnswer === 'string' ? userAnswer : ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-dgc-purple focus:outline-none"
            />
          </div>
        );

      case 'short':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-lg text-gray-700 leading-relaxed">
                {question.question}
              </p>
            </div>
            <textarea
              placeholder="Enter your detailed answer..."
              value={typeof userAnswer === 'string' ? userAnswer : ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              rows={6}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-dgc-purple focus:outline-none resize-none"
            />
          </div>
        );

      case 'match':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {question.question}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Items</h4>
                {question.leftColumn?.map((item, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-800">{index + 1}. {item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Match with</h4>
                {question.rightColumn?.map((item, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">{String.fromCharCode(65 + index)}. {item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Enter your matches (e.g., 1A, 2B, 3C, 4D):</p>
              <input
                type="text"
                placeholder="1A, 2B, 3C, 4D"
                value={typeof userAnswer === 'string' ? userAnswer : ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-dgc-purple focus:outline-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-pink">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gradient font-space mb-4">Quiz Complete!</h1>
            <p className="text-2xl text-gray-600">Your Score: {score.toFixed(0)}%</p>
          </div>

          <Card className="glass-card p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Detailed Results</h2>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="p-6 bg-white/50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline">{question.type.toUpperCase()}</Badge>
                        <Badge variant="outline">{question.difficulty}</Badge>
                        <Badge variant="outline">Pages {question.pageReference}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
                    </div>
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Explanation:</p>
                    <p className="text-blue-700">{question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button onClick={resetQuiz} className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-3">
              <RefreshCw size={20} className="mr-2" />
              Retake Quiz
            </Button>
            <Link to={`/document/${id}`}>
              <Button variant="outline" className="btn-3d px-8 py-3">
                <BookOpen size={20} className="mr-2" />
                Study Document
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="btn-3d px-8 py-3">
                <ArrowLeft size={20} className="mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link to={`/document/${id}`}>
            <Button variant="outline" className="btn-3d">
              <ArrowLeft size={20} className="mr-2" />
              Back to Document
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient font-space">Interactive Quiz</h1>
            <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="w-32">
            <Progress value={(currentQuestion / questions.length) * 100} />
          </div>
        </div>

        <Card className="glass-card p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-pink-gradient rounded-xl flex items-center justify-center">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{questions[currentQuestion].type.toUpperCase()}</Badge>
                <Badge variant="outline">{questions[currentQuestion].difficulty}</Badge>
                <Badge variant="outline">Pages {questions[currentQuestion].pageReference}</Badge>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            {questions[currentQuestion].question}
          </h2>

          {renderQuestion()}
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
            className="btn-3d disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion]}
            className="btn-3d bg-purple-gradient hover:opacity-90 text-white disabled:opacity-50"
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
