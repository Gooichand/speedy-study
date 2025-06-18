
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, BookOpen, Target, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [documents] = useState([
    {
      id: 1,
      name: "Introduction to Machine Learning.pdf",
      uploadDate: "2024-01-15",
      pages: 45,
      status: "processed",
      progress: 75
    },
    {
      id: 2,
      name: "Web Development Basics.docx",
      uploadDate: "2024-01-14",
      pages: 28,
      status: "processed",
      progress: 90
    },
    {
      id: 3,
      name: "Data Structures.pptx",
      uploadDate: "2024-01-13",
      pages: 60,
      status: "processing",
      progress: 30
    }
  ]);

  const stats = [
    { label: "Documents Processed", value: "12", icon: FileText, gradient: "bg-blue-gradient" },
    { label: "Quizzes Completed", value: "28", icon: Target, gradient: "bg-purple-gradient" },
    { label: "Study Hours", value: "15.5", icon: Clock, gradient: "bg-pink-gradient" },
    { label: "Learning Progress", value: "82%", icon: TrendingUp, gradient: "bg-green-gradient" }
  ];

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient font-space">Learning Dashboard</h1>
          <p className="text-xl text-gray-600">Track your progress and manage your documents</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card p-6 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.gradient} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upload Section */}
        <Card className="glass-card p-8 mb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-purple-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-purple animate-glow">
              <Upload size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Learn Something New?</h2>
            <p className="text-gray-600 mb-6">
              Upload any document and let our AI create a personalized learning experience for you
            </p>
            <Link to="/upload">
              <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-3 text-lg rounded-xl shadow-glow-purple">
                <Upload size={20} className="mr-2" />
                Upload New Document
              </Button>
            </Link>
          </div>
        </Card>

        {/* Documents List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Documents</h2>
          
          {documents.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No documents yet</h3>
              <p className="text-gray-500">Upload your first document to get started!</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="glass-card p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-gradient rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{doc.name}</h3>
                        <p className="text-sm text-gray-600">
                          {doc.pages} pages • Uploaded {doc.uploadDate}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-gradient h-2 rounded-full transition-all duration-300"
                              style={{ width: `${doc.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{doc.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link to={`/document/${doc.id}`}>
                        <Button variant="outline" className="btn-3d">
                          <BookOpen size={16} className="mr-2" />
                          Study
                        </Button>
                      </Link>
                      <Link to={`/quiz/${doc.id}`}>
                        <Button className="btn-3d bg-pink-gradient hover:opacity-90 text-white">
                          <Target size={16} className="mr-2" />
                          Quiz
                        </Button>
                      </Link>
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
