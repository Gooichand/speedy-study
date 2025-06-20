
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Mail, Lock, User, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useSecurityContext } from '@/contexts/SecurityContext';

const Auth = () => {
  const { user } = useAuth();
  const { addAlert, logSecurityEvent } = useSecurityContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateInput = (email: string, password: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Password strength validation
    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput(email, password)) return;
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        addAlert('error', `Signup failed: ${error.message}`);
        logSecurityEvent('SIGNUP_FAILED', { email, error: error.message });
        
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        logSecurityEvent('SIGNUP_SUCCESS', { email });
        toast({
          title: "Registration Successful!",
          description: "Please check your email to activate your account before signing in.",
          variant: "default",
        });
        addAlert('info', 'Please check your email to activate your account');
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        // Switch to login view
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during sign up.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (loginAttempts >= 5) {
      addAlert('error', 'Too many failed login attempts. Please wait before trying again.');
      toast({
        title: "Rate Limited",
        description: "Too many failed attempts. Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    if (!validateInput(email, password)) return;

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        setLoginAttempts(prev => prev + 1);
        addAlert('error', `Login failed: ${error.message}`);
        logSecurityEvent('LOGIN_FAILED', { email, error: error.message });
        
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        logSecurityEvent('LOGIN_SUCCESS', { email });
        setLoginAttempts(0);
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      console.error('Unexpected signin error:', error);
      setLoginAttempts(prev => prev + 1);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md p-8 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-300">
            {isLogin ? 'Sign in to continue learning' : 'Start your learning journey today'}
          </p>
        </div>

        <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-slate-700/80 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-slate-700/80 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-slate-700/80 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-slate-700/80 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-3d bg-purple-gradient hover:opacity-90 text-white py-3 text-lg rounded-xl shadow-glow-purple"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFullName('');
              setLoginAttempts(0);
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
