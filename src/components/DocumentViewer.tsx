
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, ArrowLeft, FileText, Brain, Lightbulb } from 'lucide-react';

const DocumentViewer = () => {
  const { id } = useParams();
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  // Mock document data
  const document = {
    id: id,
    name: "Introduction to Machine Learning.pdf",
    totalPages: 45,
    uploadDate: "2024-01-15"
  };

  const summaries = {
    brief: "Machine Learning is a subset of AI that enables computers to learn and improve from experience without explicit programming. Key concepts include supervised learning, unsupervised learning, and reinforcement learning.",
    detailed: "Machine Learning (ML) represents a paradigm shift in computational approaches, where algorithms develop the ability to learn and adapt through experience rather than explicit programming. This field encompasses three primary categories: supervised learning (using labeled data to predict outcomes), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through reward-based interactions). The mathematical foundations rely heavily on statistical inference, linear algebra, and probability theory. Applications span across industries including healthcare, finance, autonomous vehicles, and natural language processing. The evolution from traditional rule-based systems to ML represents a fundamental change in how we approach complex problem-solving, enabling systems to handle ambiguity and adapt to new scenarios.",
    bullets: [
      "Machine Learning enables computers to learn from data without explicit programming",
      "Three main types: Supervised, Unsupervised, and Reinforcement Learning",
      "Relies on statistical methods and mathematical optimization",
      "Applications include image recognition, natural language processing, and predictive analytics",
      "Requires large datasets and computational power for effective training",
      "Common algorithms include neural networks, decision trees, and support vector machines",
      "Performance measured through metrics like accuracy, precision, and recall"
    ]
  };

  const topics = [
    {
      title: "Introduction to Machine Learning",
      pages: "1-5",
      summary: "Defines ML and its relationship to AI, covers basic terminology and historical context.",
      difficulty: "Beginner"
    },
    {
      title: "Supervised Learning Algorithms",
      pages: "6-15",
      summary: "Detailed exploration of classification and regression techniques including linear regression, logistic regression, and decision trees.",
      difficulty: "Intermediate"
    },
    {
      title: "Unsupervised Learning Methods",
      pages: "16-25",
      summary: "Clustering algorithms, dimensionality reduction, and pattern discovery techniques.",
      difficulty: "Intermediate"
    },
    {
      title: "Neural Networks and Deep Learning",
      pages: "26-35",
      summary: "Architecture of neural networks, backpropagation, and deep learning frameworks.",
      difficulty: "Advanced"
    },
    {
      title: "Model Evaluation and Optimization",
      pages: "36-45",
      summary: "Cross-validation, hyperparameter tuning, and performance metrics.",
      difficulty: "Advanced"
    }
  ];

  const togglePageSelection = (pageRange: string) => {
    const [start, end] = pageRange.split('-').map(Number);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    
    const isSelected = pages.every(page => selectedPages.includes(page));
    if (isSelected) {
      setSelectedPages(prev => prev.filter(page => !pages.includes(page)));
    } else {
      setSelectedPages(prev => [...new Set([...prev, ...pages])]);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" className="btn-3d">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gradient font-space">{document.name}</h1>
            <p className="text-gray-600">{document.totalPages} pages • Uploaded {document.uploadDate}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Section */}
            <Card className="glass-card p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-gradient rounded-xl flex items-center justify-center">
                  <Brain size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">AI-Generated Summary</h2>
              </div>

              <Tabs defaultValue="detailed" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="brief">Brief</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed</TabsTrigger>
                  <TabsTrigger value="bullets">Key Points</TabsTrigger>
                </TabsList>

                <TabsContent value="brief" className="space-y-4">
                  <p className="text-gray-700 leading-relaxed text-lg">{summaries.brief}</p>
                </TabsContent>

                <TabsContent value="detailed" className="space-y-4">
                  <p className="text-gray-700 leading-relaxed text-lg">{summaries.detailed}</p>
                </TabsContent>

                <TabsContent value="bullets" className="space-y-4">
                  <ul className="space-y-3">
                    {summaries.bullets.map((point, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-dgc-purple rounded-full mt-3 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Topics Breakdown */}
            <Card className="glass-card p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-gradient rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Detailed Topic Analysis</h2>
              </div>

              <div className="space-y-6">
                {topics.map((topic, index) => (
                  <div 
                    key={index}
                    className="glass-card p-6 rounded-xl hover-lift cursor-pointer"
                    onClick={() => togglePageSelection(topic.pages)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{topic.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`${
                              topic.difficulty === 'Beginner' ? 'border-green-300 text-green-700' :
                              topic.difficulty === 'Intermediate' ? 'border-yellow-300 text-yellow-700' :
                              'border-red-300 text-red-700'
                            }`}
                          >
                            {topic.difficulty}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Pages {topic.pages}</p>
                        <p className="text-gray-700 leading-relaxed">{topic.summary}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={topic.pages.split('-').map(Number).every(page => 
                          Array.from({ length: page }, (_, i) => i + 1).every(p => selectedPages.includes(p))
                        )}
                        onChange={() => togglePageSelection(topic.pages)}
                        className="w-5 h-5 text-dgc-purple rounded focus:ring-dgc-purple"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
              <div className="space-y-3">
                <Link to={`/quiz/${id}`} className="block">
                  <Button className="btn-3d w-full bg-pink-gradient hover:opacity-90 text-white">
                    <Target size={20} className="mr-2" />
                    Take Quiz
                  </Button>
                </Link>
                <Button className="btn-3d w-full bg-blue-gradient hover:opacity-90 text-white">
                  <BookOpen size={20} className="mr-2" />
                  Study Mode
                </Button>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Learning Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Start with basic concepts before moving to advanced topics
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Use the quiz feature to test your understanding
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Select specific pages to focus on challenging areas
                  </p>
                </div>
              </div>
            </Card>

            {selectedPages.length > 0 && (
              <Card className="glass-card p-6">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Selected Pages</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedPages.length} pages selected for focused study
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedPages([])}
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
