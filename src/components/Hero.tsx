
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Book, Search } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-6xl mx-auto">
          <div className="animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-space">
              Transform Your 
              <span className="text-gradient block mt-4">
                Documents into
              </span>
              <span className="text-gradient block mt-4">
                Learning Adventures
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Upload any document - PDF, Word, PowerPoint, HTML, CSS, or any file type. 
              Our AI will analyze, summarize, and create interactive quizzes to help you master the content.
            </p>
          </div>

          <div className="animate-slide-up flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link to="/upload">
              <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-4 text-lg rounded-xl shadow-glow-purple">
                <Upload size={24} className="mr-3" />
                Start Learning Now
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="btn-3d border-2 border-dgc-purple text-dgc-purple hover:bg-dgc-purple hover:text-white px-8 py-4 text-lg rounded-xl">
                <Book size={24} className="mr-3" />
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="glass-card p-8 rounded-2xl hover-lift animate-float">
              <div className="w-16 h-16 bg-blue-gradient rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
                <Upload size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Upload Any File</h3>
              <p className="text-gray-600 leading-relaxed">
                Support for PDF, Word, PowerPoint, HTML, CSS, and many more file formats. 
                No file type restrictions!
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift animate-float" style={{animationDelay: '2s'}}>
              <div className="w-16 h-16 bg-pink-gradient rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-pink">
                <Search size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI extracts and analyzes every topic in detail, 
                providing comprehensive explanations without missing any context.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift animate-float" style={{animationDelay: '4s'}}>
              <div className="w-16 h-16 bg-green-gradient rounded-xl flex items-center justify-center mx-auto mb-6">
                <Book size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Interactive Quizzes</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate MCQ, Fill-in-the-blanks, Short answers, and Match-the-following 
                questions with adaptive difficulty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
