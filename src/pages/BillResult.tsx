
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RazorpayPayment from '@/components/RazorpayPayment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Download, Eye, CreditCard, CheckCircle } from 'lucide-react';

interface BillResultProps {
  onNavigate: (page: string) => void;
  billData: any;
}

const BillResult: React.FC<BillResultProps> = ({ onNavigate, billData }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(billData?.status === 'Paid');

  if (!billData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="glass-effect border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600 mb-4">No bill data available</p>
            <Button onClick={() => onNavigate('dashboard')} className="morphing-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const printBill = () => {
    const printContent = document.getElementById('bill-content');
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ 
          status: 'Paid', 
          updated_at: new Date().toISOString() 
        })
        .eq('bill_id', billData.bill_id);

      if (error) {
        console.error('Error updating bill status:', error);
        toast.error('Failed to update bill status');
      } else {
        setPaymentCompleted(true);
        setShowPayment(false);
        toast.success('Payment completed successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Enhanced Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center floating">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Bill Generated
                </h1>
                <p className="text-gray-600">Your electricity bill has been created successfully</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={printBill} variant="outline" className="morphing-button glass-effect border-white/20">
                <Download className="w-4 h-4 mr-2" />
                Print Bill
              </Button>
              <Button onClick={() => onNavigate('dashboard')} className="morphing-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bill Display */}
          <div className="space-y-6">
            <Card id="bill-content" className="glass-effect border-0 shadow-2xl card-hover">
              <CardHeader className="text-center border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center neon-glow">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ElectroBill
                </CardTitle>
                <p className="text-gray-600 font-medium">Electricity Bill Statement</p>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Bill Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Bill Details</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Bill ID: <span className="font-mono font-medium text-gray-900">{billData.bill_id}</span></p>
                      <p>Generated: <span className="font-medium text-gray-900">{formatDate(billData.created_at)}</span></p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                    paymentCompleted
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white neon-glow' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white pulse-ring'
                  }`}>
                    {paymentCompleted ? 'PAID' : 'PENDING'}
                  </div>
                </div>

                {/* Consumer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2">Consumer Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium">Name:</span>
                        <span className="font-bold text-gray-900">{billData.consumer_name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium">Meter Number:</span>
                        <span className="font-mono font-bold text-gray-900">{billData.meter_number}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium">Connection Type:</span>
                        <span className="font-bold text-gray-900 capitalize">{billData.connection_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2">Usage Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <span className="text-gray-600 font-medium">Units Consumed:</span>
                        <span className="font-bold text-blue-600 text-xl">{billData.units_consumed} kWh</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <span className="text-gray-600 font-medium">Rate Structure:</span>
                        <span className="font-bold text-blue-600">Slab-based</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">Amount Details</h4>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl text-white text-center shadow-2xl neon-glow">
                    <div className="text-sm font-medium opacity-90 mb-2">Total Amount Due</div>
                    <div className="text-4xl font-bold mb-2">₹{parseFloat(billData.amount).toFixed(2)}</div>
                    <div className="text-xs opacity-75">Including all taxes and charges</div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Payment Status:</span>
                    <span className={`font-bold text-lg ${
                      paymentCompleted ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {paymentCompleted ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                  
                  {!paymentCompleted && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-yellow-800">
                          This bill is pending payment. Please pay to avoid late fees.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {!paymentCompleted && !showPayment && (
              <Card className="glass-effect border-0 shadow-2xl card-hover">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto floating">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Pay?</h3>
                    <p className="text-gray-600">Pay your electricity bill securely with multiple payment options</p>
                  </div>
                  <Button 
                    onClick={() => setShowPayment(true)}
                    className="w-full morphing-button bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 text-lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹{parseFloat(billData.amount).toFixed(2)}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!paymentCompleted && showPayment && (
              <RazorpayPayment
                amount={parseFloat(billData.amount)}
                billData={billData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            )}

            {paymentCompleted && (
              <Card className="glass-effect border-0 shadow-2xl">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto neon-glow">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Completed!</h3>
                    <p className="text-gray-600">Your electricity bill has been paid successfully</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="glass-effect border-0 shadow-xl">
              <CardContent className="p-6">
                <h4 className="font-bold text-gray-900 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <Button 
                    onClick={() => onNavigate('generate-bill')} 
                    variant="outline" 
                    className="w-full morphing-button glass-effect border-white/20"
                  >
                    Generate Another Bill
                  </Button>
                  <Button 
                    onClick={() => onNavigate('bill-history')}
                    variant="outline" 
                    className="w-full morphing-button glass-effect border-white/20"
                  >
                    View All Bills
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillResult;
