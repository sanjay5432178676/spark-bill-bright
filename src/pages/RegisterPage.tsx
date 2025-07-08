
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, CheckCircle, Zap } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting registration with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      console.log('Registration response:', { data, error });

      if (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('User already registered')) {
          toast.error('This email is already registered. Please try logging in instead.');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password should be at least 6 characters long');
        } else {
          toast.error(error.message);
        }
      } else if (data.user) {
        console.log('Registration successful:', data.user);
        
        if (data.user.email_confirmed_at) {
          toast.success('Registration successful! You can now sign in.');
          onNavigate('login');
        } else {
          toast.success('Registration successful! Please check your email for verification link.');
          onNavigate('login');
        }
      }
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl floating" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl floating" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-effect rounded-2xl shadow-2xl p-8 card-hover border-0">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4 floating">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 shimmer">Join ElectroBill today</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full morphing-button bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-medium text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text hover:from-green-700 hover:to-blue-700 transition-all duration-300"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
