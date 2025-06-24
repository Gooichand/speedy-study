
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
              Speedy Study
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-slate-300 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full px-4 py-2 text-slate-200">
                    <User size={20} className="text-blue-400" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-slate-800/50 border-blue-500/50 text-blue-300 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-400 transform hover:scale-105 transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="ghost" className="text-slate-300 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-blue-300 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-slate-800/50">
            <div className="space-y-4">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="space-y-3 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full px-4 py-2 mx-3">
                      <User size={20} className="text-blue-400" />
                      <span className="text-sm text-slate-200 font-medium">{user.email}</span>
                    </div>
                    <Button 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full bg-slate-800/50 border-blue-500/50 text-blue-300 hover:bg-blue-600/20 hover:text-blue-200 hover:border-blue-400 transition-all duration-200"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg transition-all duration-200">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
