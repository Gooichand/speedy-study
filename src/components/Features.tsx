
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Brain, Target, Sparkles, Zap, Globe, Github, Linkedin } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Upload className="w-8 h-8 text-purple-400" />,
      title: "Smart Document Upload",
      description: "Upload PDFs, Word docs, images, and more. Our AI instantly processes any format.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-400" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms extract key concepts and generate comprehensive summaries.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Target className="w-8 h-8 text-green-400" />,
      title: "Interactive Quizzes",
      description: "Personalized quizzes that adapt to your learning style and knowledge level.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      title: "Instant Insights",
      description: "Get immediate feedback and explanations to accelerate your understanding.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Zap className="w-8 h-8 text-red-400" />,
      title: "Lightning Fast",
      description: "Process documents and generate quizzes in seconds, not hours.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-400" />,
      title: "Multi-Language Support",
      description: "Learn in your preferred language with our global AI understanding.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-20 px-6 bg-slate-900/50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="morphing-shape w-72 h-72 top-10 right-10" style={{animationDelay: '1s'}}></div>
        <div className="morphing-shape w-60 h-60 bottom-20 left-20" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gradient mb-6 font-space">
            Powerful Features for Accelerated Learning
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience the future of education with our cutting-edge AI technology designed to transform how you learn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card-dark border border-slate-700/50 hover-lift group">
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 neon-glow`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credits Section */}
        <div className="text-center py-16 border-t border-slate-700/50">
          <h3 className="text-3xl font-bold text-gradient mb-8 font-space">
            Built with ❤️ by Amazing Developers
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
            <div className="glass-card-dark p-6 rounded-2xl border border-purple-500/30 hover-lift">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center neon-glow">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-200">Gopichand</h4>
                  <p className="text-slate-400">Full Stack Developer</p>
                  <a 
                    href="https://www.linkedin.com/in/gopichand-dandimeni-269709287/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors mt-2"
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card-dark p-6 rounded-2xl border border-pink-500/30 hover-lift">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center neon-glow">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-200">Priyanka</h4>
                  <p className="text-slate-400">Frontend Developer</p>
                  <a 
                    href="http://www.linkedin.com/in/priyankagara" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors mt-2"
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <p className="text-slate-400 mt-8 text-lg">
            Passionate about creating innovative educational technology solutions
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
