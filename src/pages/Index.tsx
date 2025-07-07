
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl floating" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl floating" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Logo */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 floating neon-glow">
              <Zap className="w-12 h-12 text-white" />
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                ElectroBill
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 shimmer max-w-2xl mx-auto">
                Modern electricity bill management system with advanced features and secure payments
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <Card className="glass-effect card-hover border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 floating">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Smart Billing</h3>
                  <p className="text-gray-600 text-sm">Automated calculations with slab-based pricing for accurate billing</p>
                </CardContent>
              </Card>

              <Card className="glass-effect card-hover border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 floating" style={{animationDelay: '0.5s'}}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Secure Payments</h3>
                  <p className="text-gray-600 text-sm">Integrated Razorpay for safe and instant bill payments</p>
                </CardContent>
              </Card>

              <Card className="glass-effect card-hover border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 floating" style={{animationDelay: '1s'}}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Real-time Tracking</h3>
                  <p className="text-gray-600 text-sm">Track bill history and payment status in real-time</p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                size="lg"
                className="morphing-button bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 neon-glow"
              >
                <div className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </div>

            {/* Footer */}
            <div className="pt-12 text-center">
              <p className="text-gray-500 text-sm">
                Powered by modern web technologies • Built with ❤️ for efficiency
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
