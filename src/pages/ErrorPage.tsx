
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Zap } from 'lucide-react';

interface ErrorPageProps {
  onNavigate: (page: string) => void;
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ onNavigate, message }) => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-60 h-60 bg-red-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl floating" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl floating" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className="max-w-md w-full glass-effect card-hover border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4 floating">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="text-6xl animate-bounce">⚠️</div>
          
          <div className="glass-effect p-4 rounded-xl">
            <p className="text-gray-700 font-medium">
              {message || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => onNavigate('dashboard')} 
              className="w-full morphing-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
            >
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full morphing-button glass-effect border-white/30 hover:bg-white/20 transition-all duration-300 font-semibold py-3 text-lg"
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Page</span>
              </div>
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-6">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>ElectroBill - Reliable & Secure</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
