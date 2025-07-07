
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreditCard, Shield, Zap } from 'lucide-react';

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const options = {
        key: 'rzp_test_9999999999', // Replace with your Razorpay Key ID
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        name: 'ElectroBill',
        description: `Electricity Bill Payment - ${billData.meter_number}`,
        image: '/favicon.ico',
        order_id: '', // You should create an order on your backend
        handler: function (response: any) {
          console.log('Payment Success:', response);
          toast.success('Payment successful!');
          onPaymentSuccess();
        },
        prefill: {
          name: billData.consumer_name,
          email: 'customer@example.com',
          contact: '9999999999'
        },
        notes: {
          bill_id: billData.bill_id,
          meter_number: billData.meter_number
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment Failed:', response.error);
        toast.error('Payment failed. Please try again.');
        onPaymentFailure(response.error);
        setLoading(false);
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Unable to process payment. Please try again.');
      onPaymentFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect card-hover border-0 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 floating">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Secure Payment
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ₹{amount.toFixed(2)}
          </div>
          <div className="text-gray-600">
            Bill for Meter: {billData.meter_number}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Shield className="w-6 h-6 text-green-500" />
            <span className="text-xs text-gray-600">Secure</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-xs text-gray-600">Instant</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-gray-600">All Cards</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Accepted Payment Methods:
          </div>
          <div className="flex justify-center space-x-4">
            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-xs font-medium text-blue-700">
              Credit Card
            </div>
            <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-xs font-medium text-green-700">
              Debit Card
            </div>
            <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg text-xs font-medium text-purple-700">
              UPI
            </div>
            <div className="px-3 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg text-xs font-medium text-orange-700">
              Net Banking
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={loading}
          className="w-full morphing-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Pay Now</span>
            </div>
          )}
        </Button>

        <div className="text-xs text-center text-gray-500 space-y-1">
          <div>🔒 Your payment information is secure and encrypted</div>
          <div>Powered by Razorpay</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
