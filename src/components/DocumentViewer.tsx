
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, ArrowLeft, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSummaryGeneration } from '@/hooks/useSummaryGeneration';
import SummaryDisplay from '@/components/SummaryDisplay';

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
  const { generateSummaryAndQuiz, loading: generatingSummary } = useSummaryGeneration();
  const [document, setDocument] = useState<Document | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

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
        const parsedQuestions = Array.isArray(quizData.questions) 
          ? quizData.questions as unknown as Question[]
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

  const handleRegenerateSummary = async () => {
    if (!document) return;

    try {
      const result = await generateSummaryAndQuiz(
        document.id,
        document.content || document.title,
        document.title,
        document.file_size
      );

      // Refresh the document data
      await fetchDocumentData();
    } catch (error) {
      console.error('Error regenerating summary:', error);
    }
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
            {document.summary ? (
              <SummaryDisplay summary={document.summary} title={document.title} />
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg p-8">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Summary Available</h3>
                  <p className="text-gray-600 mb-6">
                    {!document.processed 
                      ? "This document is still being processed. The summary will be available shortly."
                      : "Generate a comprehensive AI summary with detailed analysis, key points, and quiz questions."
                    }
                  </p>
                  {document.processed && (
                    <Button
                      onClick={handleRegenerateSummary}
                      disabled={generatingSummary}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                    >
                      {generatingSummary ? (
                        <>
                          <Loader2 size={20} className="mr-2 animate-spin" />
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={20} className="mr-2" />
                          Generate AI Summary
                        </>
                      )}
                    </Button>
                  )}
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
                  <Button 
                    onClick={handleRegenerateSummary}
                    disabled={generatingSummary || !document.processed}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50"
                  >
                    <Target size={20} className="mr-2" />
                    {generatingSummary ? 'Generating Quiz...' : 'Generate Quiz'}
                  </Button>
                )}
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                  <BookOpen size={20} className="mr-2" />
                  Study Mode
                </Button>
              </div>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Document Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-medium">{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={document.processed ? "default" : "secondary"}>
                    {document.processed ? "Processed" : "Processing"}
                  </Badge>
                </div>
                {quiz && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quiz Questions:</span>
                    <span className="font-medium">{quiz.questions?.length || 0}</span>
                  </div>
                )}
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
                    Read the detailed summary first for comprehensive understanding
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Use key points for quick review and memorization
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Take the quiz to test your understanding
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
