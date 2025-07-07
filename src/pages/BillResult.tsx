
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BillResultProps {
  onNavigate: (page: string) => void;
  billData: any;
}

const BillResult: React.FC<BillResultProps> = ({ onNavigate, billData }) => {
  if (!billData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No bill data available</p>
            <Button onClick={() => onNavigate('dashboard')} className="mt-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Generated</h1>
              <p className="text-gray-600">Your electricity bill has been created successfully</p>
            </div>
            <div className="space-x-2">
              <Button onClick={printBill} variant="outline">
                Print Bill
              </Button>
              <Button onClick={() => onNavigate('dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card id="bill-content">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl text-blue-900">ElectroBill</CardTitle>
            <p className="text-gray-600">Electricity Bill</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bill Details</h3>
                  <p className="text-sm text-gray-600">Bill ID: {billData.bill_id}</p>
                  <p className="text-sm text-gray-600">Generated: {formatDate(billData.created_at)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  billData.status === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {billData.status}
                </div>
              </div>

              {/* Consumer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Consumer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{billData.consumer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meter Number:</span>
                      <span className="font-medium">{billData.meter_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connection Type:</span>
                      <span className="font-medium capitalize">{billData.connection_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Usage Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Units Consumed:</span>
                      <span className="font-medium">{billData.units_consumed} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate per Unit:</span>
                      <span className="font-medium">Variable (Slab-based)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Amount Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-2xl text-blue-600">₹{parseFloat(billData.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-semibold ${
                    billData.status === 'Paid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {billData.status}
                  </span>
                </div>
                {billData.status === 'Not Paid' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This bill is pending payment. Please pay before the due date to avoid late fees.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <Button onClick={() => onNavigate('generate-bill')} variant="outline">
            Generate Another Bill
          </Button>
          <Button onClick={() => onNavigate('bill-history')}>
            View All Bills
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BillResult;
