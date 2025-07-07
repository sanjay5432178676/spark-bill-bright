
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorPageProps {
  onNavigate: (page: string) => void;
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ onNavigate, message }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Oops! Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <p className="text-gray-600">
            {message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="space-y-2">
            <Button onClick={() => onNavigate('dashboard')} className="w-full">
              Back to Dashboard
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
