
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface BillHistoryProps {
  onNavigate: (page: string) => void;
  session: Session;
}

const BillHistory: React.FC<BillHistoryProps> = ({ onNavigate, session }) => {
  const [bills, setBills] = useState<any[]>([]);
  const [filteredBills, setFilteredBills] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [session]);

  useEffect(() => {
    filterBills();
  }, [bills, filter]);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        toast.error('Failed to load bills');
      } else {
        setBills(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    if (filter === 'all') {
      setFilteredBills(bills);
    } else {
      setFilteredBills(bills.filter(bill => bill.status === filter));
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'Paid', updated_at: new Date().toISOString() })
        .eq('bill_id', billId);

      if (error) {
        console.error('Error updating bill:', error);
        toast.error('Failed to update bill status');
      } else {
        toast.success('Bill marked as paid!');
        fetchBills();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const { error } = await supabase
          .from('bills')
          .delete()
          .eq('bill_id', billId);

        if (error) {
          console.error('Error deleting bill:', error);
          toast.error('Failed to delete bill');
        } else {
          toast.success('Bill deleted successfully');
          fetchBills();
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill History</h1>
              <p className="text-gray-600">View and manage all your electricity bills</p>
            </div>
            <Button onClick={() => onNavigate('dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter bills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="Paid">Paid Bills</SelectItem>
              <SelectItem value="Not Paid">Unpaid Bills</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No bills found</p>
              <Button onClick={() => onNavigate('generate-bill')} className="mt-4">
                Generate Your First Bill
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <Card key={bill.bill_id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{bill.consumer_name}</h3>
                        <p className="text-sm text-gray-600">Meter: {bill.meter_number}</p>
                        <p className="text-sm text-gray-600">Type: {bill.connection_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Units: {bill.units_consumed} kWh</p>
                        <p className="text-sm text-gray-600">Amount: ₹{parseFloat(bill.amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Date: {formatDate(bill.created_at)}</p>
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          bill.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {bill.status === 'Not Paid' && (
                        <Button
                          size="sm"
                          onClick={() => handlePayBill(bill.bill_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Pay Now
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteBill(bill.bill_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BillHistory;
