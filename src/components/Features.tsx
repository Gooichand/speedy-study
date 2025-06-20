
import React from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Brain, Target, BookOpen, BarChart3, Clock, Shield, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Support for multiple file formats including PDF, Word documents, PowerPoint, and text files.",
      gradient: "bg-blue-gradient",
      shadowColor: "shadow-glow-blue"
    },
    {
      icon: Brain,
      title: "AI Processing",
      description: "Advanced natural language processing extracts key concepts and creates structured learning content.",
      gradient: "bg-purple-gradient",
      shadowColor: "shadow-glow-purple"
    },
    {
      icon: Target,
      title: "Adaptive Quizzes",
      description: "Intelligent quiz generation that adapts to your knowledge level and learning progress.",
      gradient: "bg-pink-gradient",
      shadowColor: "shadow-glow-pink"
    },
    {
      icon: BookOpen,
      title: "Interactive Study",
      description: "Engaging study materials with highlights, summaries, and interactive elements.",
      gradient: "bg-green-gradient",
      shadowColor: "shadow-glow-green"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Detailed insights into your learning patterns, strengths, and areas for improvement.",
      gradient: "bg-orange-gradient",
      shadowColor: "shadow-glow-orange"
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Optimize your study time with AI-driven recommendations and focused learning paths.",
      gradient: "bg-teal-gradient",
      shadowColor: "shadow-glow-teal"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your documents and learning data are protected with enterprise-grade security measures.",
      gradient: "bg-red-gradient",
      shadowColor: "shadow-glow-red"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get immediate feedback and results to accelerate your learning journey.",
      gradient: "bg-yellow-gradient",
      shadowColor: "shadow-glow-yellow"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-white font-space">
            Powerful Features for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Accelerated Learning
            </span>
          </h2>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with proven learning methodologies 
            to create the most effective study experience possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 p-6 hover-lift shadow-2xl relative overflow-hidden transition-all duration-500"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={28} className="text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 rounded-full px-6 py-3 border border-purple-500/30">
            <Shield size={20} className="text-purple-400" />
            <span className="text-purple-300 font-medium">Built by Sony Education Technologies</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
