
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Brain, Target, Zap, BookOpen, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
            <Zap size={16} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white font-space leading-tight">
            Master Any
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
              Subject Fast
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your documents and let our AI create personalized quizzes and study materials. 
            Transform any content into an interactive learning experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/auth">
            <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-4 text-lg rounded-2xl shadow-glow-purple transform hover:scale-105 transition-all duration-300">
              <Upload size={24} className="mr-3" />
              Start Learning Now
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="btn-3d border-2 border-slate-400/50 text-white px-8 py-4 text-lg rounded-2xl hover:border-purple-400 hover:text-purple-300 transition-all duration-300"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>

        {/* Features preview */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50 hover-lift">
            <div className="w-12 h-12 bg-blue-gradient rounded-xl flex items-center justify-center mb-4 mx-auto shadow-glow-blue">
              <Brain size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Analysis</h3>
            <p className="text-slate-300">Advanced AI processes your documents to extract key concepts and create comprehensive study materials.</p>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50 hover-lift">
            <div className="w-12 h-12 bg-pink-gradient rounded-xl flex items-center justify-center mb-4 mx-auto shadow-glow-pink">
              <Target size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Quizzes</h3>
            <p className="text-slate-300">Automatically generated quizzes adapt to your learning pace and focus on areas that need improvement.</p>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/50 hover-lift">
            <div className="w-12 h-12 bg-green-gradient rounded-xl flex items-center justify-center mb-4 mx-auto shadow-glow-green">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Progress Tracking</h3>
            <p className="text-slate-300">Monitor your learning progress with detailed analytics and personalized recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
