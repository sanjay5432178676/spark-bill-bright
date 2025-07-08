
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard, Shield, Zap, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface RazorpayPaymentProps {
  amount: number;
  billData: any;
  onPaymentSuccess: () => void;
  onPaymentFailure: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  billData,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: billData?.consumer_name || '',
    email: '',
    contact: ''
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    console.log('Validating form with data:', customerInfo);
    
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!customerInfo.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!customerInfo.contact.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!/^\d{10}$/.test(customerInfo.contact.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Order created:', orderId);
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  };

  const handlePayment = async () => {
    console.log('Payment button clicked');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Starting payment process...');
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const orderId = await createOrder();

      const options = {
        key: 'rzp_test_uHuVXWPgSq4wxd',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'ElectroBill',
        description: `Electricity Bill Payment - Meter: ${billData?.meter_number || 'N/A'}`,
        image: '/favicon.ico',
        order_id: orderId,
        handler: function (response: any) {
          console.log('Payment Success Response:', response);
          toast.success('Payment completed successfully!');
          setLoading(false);
          onPaymentSuccess();
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.contact
        },
        notes: {
          bill_id: billData?.bill_id || '',
          meter_number: billData?.meter_number || '',
          consumer_name: billData?.consumer_name || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
            toast.info('Payment was cancelled');
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      console.log('Razorpay options:', options);

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment Failed Response:', response);
        toast.error(`Payment failed: ${response.error?.description || 'Please try again'}`);
        onPaymentFailure(response.error);
        setLoading(false);
      });

      razorpay.open();
      
    } catch (error: any) {
      console.error('Payment Error:', error);
      toast.error(error.message || 'Unable to process payment. Please try again.');
      onPaymentFailure(error);
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} with value:`, value);
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-xl font-semibold">
            Secure Payment
          </CardTitle>
          <p className="text-center text-blue-100 text-sm">
            Pay your electricity bill securely with Razorpay
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-900 mb-3">Bill Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Meter Number:</span>
                <span className="font-medium">{billData?.meter_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consumer Name:</span>
                <span className="font-medium">{billData?.consumer_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Units Consumed:</span>
                <span className="font-medium">{billData?.units_consumed || 0} kWh</span>
              </div>
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Customer Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="contact"
                type="tel"
                value={customerInfo.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="10-digit mobile number"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-900 mb-1">Your payment is secure</p>
                <p className="text-green-700">256-bit SSL encryption • PCI DSS compliant</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Accepted Payment Methods</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Cards</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">UPI</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Net Banking</span>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Wallets</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                <span>Pay ₹{amount.toFixed(2)} Securely</span>
              </div>
            )}
          </Button>

          <div className="text-center space-y-2 pt-4 border-t">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Powered by Razorpay</span>
            </div>
            <p className="text-xs text-gray-500">
              Your payment information is encrypted and secure
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayPayment;
