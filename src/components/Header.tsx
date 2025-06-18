
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Home, Book, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-gradient rounded-xl flex items-center justify-center shadow-glow-purple">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient font-space">DGC-AI</h1>
              <p className="text-sm text-gray-600">AI-Powered Education</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/') ? 'bg-purple-100 text-dgc-purple' : 'text-gray-700 hover:text-dgc-purple'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/dashboard') ? 'bg-purple-100 text-dgc-purple' : 'text-gray-700 hover:text-dgc-purple'
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
                  <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-6 py-2 rounded-xl shadow-glow-purple">
                    <Upload size={20} className="mr-2" />
                    Upload Document
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User size={20} />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="btn-3d"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-6 py-2 rounded-xl shadow-glow-purple">
                  <User size={20} className="mr-2" />
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
