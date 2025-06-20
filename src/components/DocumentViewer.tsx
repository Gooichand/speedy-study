
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, ArrowLeft, FileText, Brain, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  file_name: string;
  summary: string;
  content: string;
  file_size: number;
  upload_date: string;
  processed: boolean;
}

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

const DocumentViewer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  useEffect(() => {
    if (id && user) {
      fetchDocumentData();
    }
  }, [id, user]);

  const fetchDocumentData = async () => {
    try {
      setLoading(true);
      
      // Fetch document
      const { data: documentData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (docError) {
        console.error('Error fetching document:', docError);
        toast({
          title: "Error",
          description: "Failed to load document. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setDocument(documentData);

      // Fetch quiz for this document
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('document_id', id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (quizError) {
        console.error('Error fetching quiz:', quizError);
      } else if (quizData) {
        // Parse the questions from Json to Question array
        const parsedQuestions = Array.isArray(quizData.questions) 
          ? quizData.questions as Question[]
          : [];
        
        setQuiz({
          id: quizData.id,
          questions: parsedQuestions,
          document_id: quizData.document_id
        });
      }

    } catch (error) {
      console.error('Error in fetchDocumentData:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTopicsFromContent = (content: string, summary: string) => {
    if (!content && !summary) return [];

    // Split content into sections based on common patterns
    const sections = content ? content.split(/\n\s*\n/).filter(section => section.trim().length > 50) : [];
    
    if (sections.length === 0 && summary) {
      // If no content sections, create topics from summary
      return [{
        title: document?.title || "Document Overview",
        pages: "1-5",
        summary: summary,
        difficulty: "Beginner"
      }];
    }

    return sections.slice(0, 5).map((section, index) => {
      const firstLine = section.split('\n')[0].trim();
      const title = firstLine.length > 5 ? firstLine.substring(0, 60) + '...' : `Section ${index + 1}`;
      
      return {
        title: title,
        pages: `${index * 5 + 1}-${(index + 1) * 5}`,
        summary: section.substring(0, 200) + '...',
        difficulty: index < 2 ? "Beginner" : index < 4 ? "Intermediate" : "Advanced"
      };
    });
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Loading document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Document Not Found</h1>
            <p className="text-gray-600 mb-8">The document you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const generateTopicsFromContent = (content: string, summary: string) => {
    if (!content && !summary) return [];

    // Split content into sections based on common patterns
    const sections = content ? content.split(/\n\s*\n/).filter(section => section.trim().length > 50) : [];
    
    if (sections.length === 0 && summary) {
      // If no content sections, create topics from summary
      return [{
        title: document?.title || "Document Overview",
        pages: "1-5",
        summary: summary,
        difficulty: "Beginner"
      }];
    }

    return sections.slice(0, 5).map((section, index) => {
      const firstLine = section.split('\n')[0].trim();
      const title = firstLine.length > 5 ? firstLine.substring(0, 60) + '...' : `Section ${index + 1}`;
      
      return {
        title: title,
        pages: `${index * 5 + 1}-${(index + 1) * 5}`,
        summary: section.substring(0, 200) + '...',
        difficulty: index < 2 ? "Beginner" : index < 4 ? "Intermediate" : "Advanced"
      };
    });
  };

  const topics = generateTopicsFromContent(document.content || '', document.summary || '');

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
    <div className="pt-28 pb-20 px-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{document.title}</h1>
            <p className="text-gray-600">
              {document.file_name} • {(document.file_size / 1024 / 1024).toFixed(2)} MB • 
              Uploaded {new Date(document.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Section */}
            <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">AI-Generated Summary</h2>
              </div>

              {document.summary ? (
                <Tabs defaultValue="detailed" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-50">
                    <TabsTrigger value="detailed" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Detailed</TabsTrigger>
                    <TabsTrigger value="brief" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Brief</TabsTrigger>
                  </TabsList>

                  <TabsContent value="detailed" className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">{document.summary}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="brief" className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {document.summary.substring(0, 200) + (document.summary.length > 200 ? '...' : '')}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No summary available for this document.</p>
                  {!document.processed && (
                    <p className="text-sm text-amber-600 mt-2">Document is still being processed...</p>
                  )}
                </div>
              )}
            </Card>

            {/* Topics Breakdown */}
            {topics.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Content Analysis</h2>
                </div>

                <div className="space-y-6">
                  {topics.map((topic, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 p-6 rounded-xl hover:shadow-md transition-all cursor-pointer"
                      onClick={() => togglePageSelection(topic.pages)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{topic.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={`${
                                topic.difficulty === 'Beginner' ? 'border-green-300 text-green-700 bg-green-50' :
                                topic.difficulty === 'Intermediate' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                'border-red-300 text-red-700 bg-red-50'
                              }`}
                            >
                              {topic.difficulty}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">Section {topic.pages}</p>
                          <p className="text-gray-700 leading-relaxed">{topic.summary}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={topic.pages.split('-').map(Number).every(page => 
                            Array.from({ length: page }, (_, i) => i + 1).every(p => selectedPages.includes(p))
                          )}
                          onChange={() => togglePageSelection(topic.pages)}
                          className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
              <div className="space-y-3">
                {quiz ? (
                  <Link to={`/quiz/${id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                      <Target size={20} className="mr-2" />
                      Take Quiz ({quiz.questions?.length || 0} questions)
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full bg-gray-300 text-gray-500">
                    <Target size={20} className="mr-2" />
                    No Quiz Available
                  </Button>
                )}
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                  <BookOpen size={20} className="mr-2" />
                  Study Mode
                </Button>
              </div>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Learning Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Review the AI summary before diving into detailed content
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Use the quiz to test your understanding of key concepts
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Focus on sections marked as your difficulty level
                  </p>
                </div>
              </div>
            </Card>

            {selectedPages.length > 0 && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg p-6">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Selected Sections</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedPages.length} sections selected for focused study
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedPages([])}
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
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
