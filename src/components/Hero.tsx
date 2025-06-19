
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, Target, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Enhanced Background Elements with 3D Effects */}
      <div className="absolute inset-0">
        <div className="morphing-shape w-96 h-96 top-20 left-10"></div>
        <div className="morphing-shape w-96 h-96 top-40 right-10" style={{animationDelay: '2s'}}></div>
        <div className="morphing-shape w-96 h-96 -bottom-8 left-20" style={{animationDelay: '4s'}}></div>
        
        {/* 3D Floating Cubes */}
        <div className="absolute top-1/4 right-1/4 cube-3d">
          <div className="cube-face" style={{transform: 'rotateY(0deg) translateZ(50px)'}}></div>
          <div className="cube-face" style={{transform: 'rotateY(90deg) translateZ(50px)'}}></div>
          <div className="cube-face" style={{transform: 'rotateY(180deg) translateZ(50px)'}}></div>
          <div className="cube-face" style={{transform: 'rotateY(-90deg) translateZ(50px)'}}></div>
          <div className="cube-face" style={{transform: 'rotateX(90deg) translateZ(50px)'}}></div>
          <div className="cube-face" style={{transform: 'rotateX(-90deg) translateZ(50px)'}}></div>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 8 + 's'
            }}
          />
        ))}
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative perspective-1000">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center neon-glow floating-element transform-3d">
                <Brain size={64} className="text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center floating-element" style={{animationDelay: '1s'}}>
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full floating-element" style={{animationDelay: '2s'}}></div>
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 text-gradient font-space leading-tight">
            Transform Documents Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Interactive Learning
            </span>
          </h1>

          <p className="text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Upload any document and let our AI create personalized quizzes, summaries, and interactive learning experiences. 
            <span className="text-purple-400 font-semibold"> Master any subject faster than ever.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {user ? (
              <>
                <Link to="/upload">
                  <Button className="btn-3d text-white px-8 py-4 text-lg rounded-2xl hover-lift">
                    <Upload size={24} className="mr-3" />
                    Upload Your First Document
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-400/50 hover:border-purple-400 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white px-8 py-4 text-lg rounded-2xl hover-lift"
                  >
                    <Target size={24} className="mr-3" />
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button className="btn-3d text-white px-8 py-4 text-lg rounded-2xl hover-lift">
                    <Brain size={24} className="mr-3" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-400/50 hover:border-purple-400 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white px-8 py-4 text-lg rounded-2xl hover-lift"
                  >
                    <Target size={24} className="mr-3" />
                    Try Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Enhanced Stats Section with 3D Effects */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="glass-card-dark p-8 rounded-2xl hover-lift transform-3d rotate-y-12 border border-purple-500/20">
              <div className="text-5xl font-bold text-gradient mb-4">10x</div>
              <div className="text-slate-300 text-lg">Faster Learning</div>
              <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4"></div>
            </div>
            <div className="glass-card-dark p-8 rounded-2xl hover-lift transform-3d border border-pink-500/20" style={{animationDelay: '0.2s'}}>
              <div className="text-5xl font-bold text-gradient mb-4">95%</div>
              <div className="text-slate-300 text-lg">Accuracy Rate</div>
              <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mt-4"></div>
            </div>
            <div className="glass-card-dark p-8 rounded-2xl hover-lift transform-3d rotate-y-12 border border-blue-500/20" style={{animationDelay: '0.4s'}}>
              <div className="text-5xl font-bold text-gradient mb-4">50+</div>
              <div className="text-slate-300 text-lg">File Formats</div>
              <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
