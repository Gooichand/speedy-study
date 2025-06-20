
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, BookOpen, Target, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Document {
  id: string;
  title: string;
  file_name: string;
  upload_date: string;
  processed: boolean;
  file_size?: number;
}

interface Quiz {
  id: string;
  document_id: string;
  score?: number;
  completed_at?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data for:', user?.id);
      
      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('upload_date', { ascending: false });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } else {
        console.log('Documents fetched:', documentsData);
        setDocuments(documentsData || []);
      }

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError);
      } else {
        console.log('Quizzes fetched:', quizzesData);
        setQuizzes(quizzesData || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentPages = (doc: Document) => {
    // Estimate pages based on file size or return default
    if (doc.file_size) {
      return Math.ceil(doc.file_size / 2000); // Rough estimate
    }
    return Math.floor(Math.random() * 50) + 10; // Placeholder
  };

  const getProgress = (doc: Document) => {
    return doc.processed ? 100 : 30;
  };

  const completedQuizzes = quizzes.filter(q => q.completed_at).length;
  const averageScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
    : 0;

  const stats = [
    { 
      label: "Documents Processed", 
      value: documents.length.toString(), 
      icon: FileText, 
      gradient: "bg-blue-gradient" 
    },
    { 
      label: "Quizzes Completed", 
      value: completedQuizzes.toString(), 
      icon: Target, 
      gradient: "bg-purple-gradient" 
    },
    { 
      label: "Average Score", 
      value: `${averageScore}%`, 
      icon: TrendingUp, 
      gradient: "bg-green-gradient" 
    },
    { 
      label: "Study Sessions", 
      value: documents.filter(d => d.processed).length.toString(), 
      icon: Clock, 
      gradient: "bg-pink-gradient" 
    }
  ];

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white font-space">Learning Dashboard</h1>
          <p className="text-xl text-slate-200">Track your progress and manage your documents</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 p-6 hover-lift shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 p-8 mb-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
          <div className="relative z-10">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-purple-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-purple animate-glow">
                <Upload size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Learn Something New?</h2>
              <p className="text-slate-200 mb-6">
                Upload any document and let our AI create a personalized learning experience for you
              </p>
              <Link to="/upload">
                <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-3 text-lg rounded-xl shadow-glow-purple">
                  <Upload size={20} className="mr-2" />
                  Upload New Document
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Documents List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">Your Documents</h2>
          
          {documents.length === 0 ? (
            <Card className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 p-12 text-center shadow-2xl">
              <FileText size={48} className="text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-200 mb-2">No documents yet</h3>
              <p className="text-slate-400">Upload your first document to get started!</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 p-6 hover-lift shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-gradient rounded-xl flex items-center justify-center shadow-lg">
                          <FileText size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                          <p className="text-sm text-slate-300">
                            {getDocumentPages(doc)} pages • Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="w-32 bg-slate-600 rounded-full h-2">
                              <div 
                                className="bg-purple-gradient h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgress(doc)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-300">{getProgress(doc)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Link to={`/document/${doc.id}`}>
                          <Button variant="outline" className="btn-3d border-slate-500 text-slate-200 hover:text-white hover:border-slate-400">
                            <BookOpen size={16} className="mr-2" />
                            Study
                          </Button>
                        </Link>
                        {doc.processed && (
                          <Link to={`/quiz/${doc.id}`}>
                            <Button className="btn-3d bg-pink-gradient hover:opacity-90 text-white">
                              <Target size={16} className="mr-2" />
                              Quiz
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
