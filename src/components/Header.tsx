
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User, UploadCloud, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-100 font-space">Speedy Study</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className={`flex items-center space-x-2 transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-purple-400' 
                      : 'text-slate-300 hover:text-purple-300'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/upload"
                  className={`flex items-center space-x-2 transition-colors ${
                    isActive('/upload') 
                      ? 'text-purple-400' 
                      : 'text-slate-300 hover:text-purple-300'
                  }`}
                >
                  <UploadCloud size={18} />
                  <span>Upload</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User size={18} />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400 transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {user ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200 hover:border-purple-400 transition-all duration-200"
              >
                <LogOut size={16} />
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
