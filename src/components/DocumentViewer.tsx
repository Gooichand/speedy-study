
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, ArrowLeft, Lightbulb, Loader2, RefreshCw, ExternalLink, FileText } from 'lucide-react';
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
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [processingAttempts, setProcessingAttempts] = useState(0);

  useEffect(() => {
    if (id && user) {
      fetchDocumentData();
    }
  }, [id, user]);

  // Enhanced auto-generation with retry mechanism
  useEffect(() => {
    const autoGenerateSummary = async () => {
      if (document && document.processed && !document.summary && !autoGenerating && document.content && processingAttempts < 3) {
        console.log('Auto-generating summary for document:', document.title, 'Attempt:', processingAttempts + 1);
        setAutoGenerating(true);
        setProcessingAttempts(prev => prev + 1);
        
        try {
          await generateSummaryAndQuiz(document.id, document.content, document.title, document.file_size);
          await fetchDocumentData();
          toast({
            title: "Success!",
            description: "AI summary and quiz have been generated successfully!",
          });
        } catch (error) {
          console.error('Auto-generation failed:', error);
          if (processingAttempts >= 2) {
            toast({
              title: "Generation Failed",
              description: "Unable to generate summary automatically. Please try the manual generation button.",
              variant: "destructive"
            });
          }
        } finally {
          setAutoGenerating(false);
        }
      }
    };

    const timer = setTimeout(autoGenerateSummary, 2000); // Delay to allow document processing
    return () => clearTimeout(timer);
  }, [document, autoGenerating, generateSummaryAndQuiz, processingAttempts]);

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
      setProcessingAttempts(0); // Reset attempts for manual generation
      await generateSummaryAndQuiz(
        document.id,
        document.content || document.title,
        document.title,
        document.file_size
      );
      await fetchDocumentData();
      toast({
        title: "Success!",
        description: "Summary and quiz have been regenerated successfully!",
      });
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate summary and quiz. Please check if your document has enough content.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-slate-300">Loading document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">Document Not Found</h1>
            <p className="text-slate-400 mb-8">The document you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isGenerating = generatingSummary || autoGenerating;
  const showGenerateButton = document.processed && !document.summary && !isGenerating;
  const hasContent = document.content && document.content.trim().length > 100;

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-slate-900">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" className="bg-slate-800/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400 transform hover:scale-105 transition-all duration-200">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">{document.title}</h1>
            <p className="text-slate-400">
              {document.file_name} • {(document.file_size / 1024 / 1024).toFixed(2)} MB • 
              Uploaded {new Date(document.upload_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Processing Status */}
            {!document.processed && (
              <Card className="glass-card border-amber-500/50 shadow-2xl bg-amber-900/20 backdrop-blur-xl">
                <div className="text-center py-8 p-6">
                  <Loader2 size={32} className="text-amber-400 animate-spin mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-amber-100 mb-2">Processing Document...</h3>
                  <p className="text-amber-200">
                    Your document is being processed. This may take a few moments depending on the file size.
                  </p>
                </div>
              </Card>
            )}

            {/* No Content Warning */}
            {document.processed && !hasContent && (
              <Card className="glass-card border-red-500/50 shadow-2xl bg-red-900/20 backdrop-blur-xl">
                <div className="text-center py-8 p-6">
                  <FileText size={32} className="text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-100 mb-2">No Content Detected</h3>
                  <p className="text-red-200 mb-4">
                    This document appears to be empty or the content couldn't be extracted. 
                    Please upload a document with readable text content.
                  </p>
                  <p className="text-red-300 text-sm">
                    Supported formats: PDF, DOCX, TXT with readable text content
                  </p>
                </div>
              </Card>
            )}

            {/* Summary Section */}
            {document.summary ? (
              <SummaryDisplay summary={document.summary} title={document.title} />
            ) : document.processed && hasContent ? (
              <Card className="glass-card border-slate-700/50 shadow-2xl bg-slate-800/40 backdrop-blur-xl">
                <div className="text-center py-12 p-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-purple">
                    {isGenerating ? (
                      <Loader2 size={36} className="text-white animate-spin" />
                    ) : (
                      <Lightbulb size={36} className="text-white" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-100 mb-4">
                    {isGenerating ? 'Generating AI Analysis...' : 'Ready for AI Analysis'}
                  </h3>
                  <p className="text-slate-300 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
                    {isGenerating
                      ? `Our advanced AI is analyzing your document "${document.title}" and creating comprehensive summaries with custom quiz questions. This process may take 1-2 minutes...`
                      : "Generate an intelligent AI summary with detailed analysis, key insights, and personalized quiz questions based on your document's unique content."
                    }
                  </p>
                  {showGenerateButton && (
                    <Button
                      onClick={handleRegenerateSummary}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-3 text-lg"
                    >
                      <RefreshCw size={24} className="mr-3" />
                      Generate AI Summary & Quiz
                    </Button>
                  )}
                  {isGenerating && (
                    <div className="mt-6">
                      <div className="text-sm text-slate-400 mb-2">Processing...</div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Actions Card */}
            <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center">
                  <Target className="mr-2 text-purple-400" size={20} />
                  Study Actions
                </h3>
                <div className="space-y-3">
                  {quiz && quiz.questions?.length > 0 ? (
                    <Link to={`/quiz/${id}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                        <Target size={20} className="mr-2" />
                        Take Quiz ({quiz.questions?.length || 0} questions)
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={handleRegenerateSummary}
                      disabled={isGenerating || !document.processed || !hasContent}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                    >
                      <Target size={20} className="mr-2" />
                      {isGenerating ? 'Generating Quiz...' : !hasContent ? 'No Content Available' : 'Generate Quiz'}
                    </Button>
                  )}
                  <Button 
                    disabled={!document.summary}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                  >
                    <BookOpen size={20} className="mr-2" />
                    {document.summary ? 'Study Mode' : 'Summary Required'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Document Stats Card */}
            <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-100">Document Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <span className="text-slate-300">File Size:</span>
                    <span className="font-medium text-purple-300">{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <span className="text-slate-300">Status:</span>
                    <Badge variant={document.processed ? "default" : "secondary"} className={document.processed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-amber-500/20 text-amber-300 border-amber-500/50"}>
                      {document.processed ? "Processed" : "Processing"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <span className="text-slate-300">Content:</span>
                    <Badge className={hasContent ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-red-500/20 text-red-300 border-red-500/50"}>
                      {hasContent ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  {quiz && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                      <span className="text-slate-300">Quiz Questions:</span>
                      <span className="font-medium text-purple-300">{quiz.questions?.length || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <span className="text-slate-300">Upload Date:</span>
                    <span className="font-medium text-purple-300">{new Date(document.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Study Tips Card */}
            <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center">
                  <Lightbulb className="mr-2 text-purple-400" size={20} />
                  Study Tips
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Upload documents with clear, readable text for best AI analysis results
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Review the detailed summary first for comprehensive understanding
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Take the quiz to test your understanding and retention
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Built By Card */}
            <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl shadow-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-100 text-center">Built By</h3>
                <div className="text-center">
                  <p className="text-lg font-semibold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
                    Speedy Study
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="https://www.linkedin.com/in/gopichand-dandimeni-269709287/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 text-slate-300 hover:text-purple-300 transition-colors p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                    >
                      <span className="font-medium">Gopichand Dandimeni</span>
                      <ExternalLink size={16} />
                    </a>
                    <a 
                      href="http://www.linkedin.com/in/priyankagara" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 text-slate-300 hover:text-purple-300 transition-colors p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                    >
                      <span className="font-medium">Priyanka Gara</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>
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
