
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Home, Book, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SecurityAlerts from './SecurityAlerts';

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <SecurityAlerts />
      <header className="fixed top-0 left-0 right-0 z-40 glass-card-dark border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center neon-glow transform-3d rotate-y-12">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient font-space">Speedy Study</h1>
                <p className="text-sm text-slate-400">DGC-AI</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-purple-500/20 text-purple-300 shadow-3d-glow' 
                    : 'text-slate-300 hover:text-purple-300 hover:bg-slate-800/50'
                }`}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive('/dashboard') 
                      ? 'bg-purple-500/20 text-purple-300 shadow-3d-glow' 
                      : 'text-slate-300 hover:text-purple-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Book size={20} />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/upload">
                    <Button className="btn-3d text-white px-6 py-2 rounded-xl">
                      <Upload size={20} className="mr-2" />
                      Upload Document
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="hidden sm:inline">{user.email}</span>
                    </div>
                    <Button
                      onClick={signOut}
                      variant="outline"
                      className="btn-3d border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="btn-3d text-white px-6 py-2 rounded-xl">
                    <User size={20} className="mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
