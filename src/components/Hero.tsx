
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, Target, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-purple-gradient rounded-3xl flex items-center justify-center shadow-glow-purple animate-glow">
                <Brain size={64} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-gradient rounded-full flex items-center justify-center animate-bounce">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 text-gradient font-space leading-tight">
            Transform Documents Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient">
              Interactive Learning
            </span>
          </h1>

          <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Upload any document and let our AI create personalized quizzes, summaries, and interactive learning experiences. 
            <span className="text-purple-600 font-semibold"> Master any subject faster than ever.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {user ? (
              <>
                <Link to="/upload">
                  <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-4 text-lg rounded-2xl shadow-glow-purple transform hover:scale-105 transition-all duration-200">
                    <Upload size={24} className="mr-3" />
                    Upload Your First Document
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="btn-3d border-2 border-purple-200 hover:bg-purple-50 px-8 py-4 text-lg rounded-2xl">
                    <Target size={24} className="mr-3" />
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-4 text-lg rounded-2xl shadow-glow-purple transform hover:scale-105 transition-all duration-200">
                    <Brain size={24} className="mr-3" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" className="btn-3d border-2 border-purple-200 hover:bg-purple-50 px-8 py-4 text-lg rounded-2xl">
                    <Target size={24} className="mr-3" />
                    Try Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <div className="text-4xl font-bold text-purple-600 mb-2">10x</div>
              <div className="text-gray-600">Faster Learning</div>
            </div>
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <div className="text-4xl font-bold text-pink-600 mb-2">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div className="glass-card p-6 rounded-2xl hover-lift">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">File Formats</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
