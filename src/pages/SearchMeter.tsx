
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface SearchMeterProps {
  onNavigate: (page: string) => void;
  session: Session;
}

const SearchMeter: React.FC<SearchMeterProps> = ({ onNavigate, session }) => {
  const [meterNumber, setMeterNumber] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meterNumber.trim()) {
      toast.error('Please enter a meter number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('meter_number', meterNumber.trim())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching bills:', error);
        toast.error('Failed to search bills');
      } else {
        setSearchResults(data || []);
        if (data && data.length === 0) {
          toast.info('No bills found for this meter number');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search by Meter</h1>
              <p className="text-gray-600">Find bills using meter number</p>
            </div>
            <Button onClick={() => onNavigate('dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="meterNumber">Meter Number</Label>
                <Input
                  id="meterNumber"
                  type="text"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                  placeholder="Enter meter number"
                  className="mt-1"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searched && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results {searchResults.length > 0 && `(${searchResults.length} found)`}
            </h2>
            
            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No bills found for meter number: {meterNumber}</p>
                  <Button onClick={() => onNavigate('generate-bill')} className="mt-4">
                    Generate New Bill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchResults.map((bill) => (
                  <Card key={bill.bill_id}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{bill.consumer_name}</h3>
                          <p className="text-sm text-gray-600">Meter: {bill.meter_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type: {bill.connection_type}</p>
                          <p className="text-sm text-gray-600">Units: {bill.units_consumed} kWh</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount: ₹{parseFloat(bill.amount).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Date: {formatDate(bill.created_at)}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            bill.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchMeter;
