
import React from 'react';
import { CheckCircle, FileText, Brain, Target, Users, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Universal File Support",
      description: "Upload and process PDF, Word, PowerPoint, HTML, CSS, and any other file type with ease.",
      gradient: "bg-blue-gradient"
    },
    {
      icon: Brain,
      title: "Detailed AI Analysis",
      description: "AI explains every topic in detail, providing 2-3 page explanations when needed without missing any context.",
      gradient: "bg-purple-gradient"
    },
    {
      icon: Target,
      title: "Adaptive Quizzes",
      description: "Four question types with difficulty that adapts to document complexity. Questions update on every retry.",
      gradient: "bg-pink-gradient"
    },
    {
      icon: CheckCircle,
      title: "Smart Feedback",
      description: "Detailed explanations for answers with references to specific parts of your document.",
      gradient: "bg-green-gradient"
    },
    {
      icon: Users,
      title: "Personalized Learning",
      description: "Select specific pages or complete files for focused learning with personalized suggestions.",
      gradient: "bg-gradient-to-r from-dgc-orange to-dgc-red"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Fast processing and immediate access to summaries, explanations, and interactive quizzes.",
      gradient: "bg-gradient-to-r from-dgc-cyan to-dgc-indigo"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-white to-purple-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-gradient font-space">
            Powerful Features for Smarter Learning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform any document into an engaging learning experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-8 rounded-2xl hover-lift animate-slide-up"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className={`w-16 h-16 ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="glass-card p-8 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-gradient font-space">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of learners who are already using DGC-AI to master their documents
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">100% Free to Use</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">No Registration Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Instant Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
