
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityContext } from '@/contexts/SecurityContext';
import CongratulationsPopup from '@/components/CongratulationsPopup';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword, validateFullName, sanitizeText, authRateLimiter } from '@/utils/security';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [rateLimited, setRateLimited] = useState(false);
  const { user } = useAuth();
  const { addAlert, logSecurityEvent } = useSecurityContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Email validation
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Full name validation for signup
    if (!isLogin && !validateFullName(fullName)) {
      errors.push('Full name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const clientIP = 'client'; // In production, you'd get the actual IP
    if (!authRateLimiter.isAllowed(clientIP)) {
      const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(clientIP) / 1000 / 60);
      setRateLimited(true);
      addAlert('error', `Too many login attempts. Please try again in ${remainingTime} minutes.`);
      logSecurityEvent('RATE_LIMITED_AUTH_ATTEMPT', { email: email.substring(0, 3) + '***' });
      return;
    }

    // Validate form
    if (!validateForm()) {
      addAlert('warning', 'Please fix the validation errors before continuing');
      return;
    }

    setLoading(true);
    setRateLimited(false);

    // Sanitize inputs
    const sanitizedEmail = sanitizeText(email.toLowerCase().trim());
    const sanitizedFullName = sanitizeText(fullName.trim());

    try {
      if (isLogin) {
        logSecurityEvent('LOGIN_ATTEMPT', { email: sanitizedEmail.substring(0, 3) + '***' });
        
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

        if (error) {
          logSecurityEvent('LOGIN_FAILED', { 
            email: sanitizedEmail.substring(0, 3) + '***',
            error: error.message 
          });
          
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          logSecurityEvent('LOGIN_SUCCESS', { email: sanitizedEmail.substring(0, 3) + '***' });
          setShowCongrats(true);
        }
      } else {
        logSecurityEvent('SIGNUP_ATTEMPT', { email: sanitizedEmail.substring(0, 3) + '***' });
        
        const { error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: sanitizedFullName,
            }
          }
        });

        if (error) {
          logSecurityEvent('SIGNUP_FAILED', { 
            email: sanitizedEmail.substring(0, 3) + '***',
            error: error.message 
          });
          
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          logSecurityEvent('SIGNUP_SUCCESS', { email: sanitizedEmail.substring(0, 3) + '***' });
          
          toast({
            title: "Success",
            description: "Please check your email to confirm your account.",
          });
          setShowCongrats(true);
        }
      }
    } catch (error) {
      logSecurityEvent('AUTH_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCongratulationsClose = () => {
    setShowCongrats(false);
    if (user) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Enhanced Background with 3D Effects */}
      <div className="absolute inset-0">
        <div className="morphing-shape w-96 h-96 top-1/4 left-1/4"></div>
        <div className="morphing-shape w-80 h-80 bottom-1/4 right-1/4" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
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

      <Card className="w-full max-w-md bg-slate-800/95 backdrop-blur-xl border-2 border-purple-400/50 relative z-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
        <div className="absolute inset-[1px] bg-slate-800/98 backdrop-blur-xl rounded-lg"></div>
        
        <CardHeader className="text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center neon-glow floating-element">
              <Brain size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient font-space">
            Welcome to Speedy Study
          </CardTitle>
          <p className="text-slate-300 mt-2">DGC-AI Powered Learning Platform</p>
        </CardHeader>
        <CardContent className="relative z-10">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-red-400 font-medium">Please fix the following:</span>
              </div>
              <ul className="text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rate Limit Warning */}
          {rateLimited && (
            <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-orange-400" />
                <span className="text-orange-400 text-sm">Account temporarily locked due to multiple failed attempts</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-200">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  required
                  className="bg-slate-700/60 border-slate-500 text-white placeholder-slate-300 focus:border-purple-400 focus:bg-slate-700/80"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                required
                className="bg-slate-700/60 border-slate-500 text-white placeholder-slate-300 focus:border-purple-400 focus:bg-slate-700/80"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={128}
                required
                className="bg-slate-700/60 border-slate-500 text-white placeholder-slate-300 focus:border-purple-400 focus:bg-slate-700/80"
              />
              {!isLogin && (
                <p className="text-xs text-slate-400">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || rateLimited}
              className="w-full btn-3d text-white py-3 text-lg rounded-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles size={20} />
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6">
            <Link to="/" className="flex items-center justify-center space-x-2 text-slate-300 hover:text-purple-300 transition-colors">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CongratulationsPopup
        isOpen={showCongrats}
        onClose={handleCongratulationsClose}
        type="login"
      />
    </div>
  );
};

export default Auth;
