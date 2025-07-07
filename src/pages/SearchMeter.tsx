
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Hash, Activity, Calendar, CreditCard, CheckCircle, XCircle, Zap } from 'lucide-react';

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

  const getStatusIcon = (status: string) => {
    return status === 'Paid' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'Paid'
      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      domestic: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800',
      commercial: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800',
      industrial: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl floating" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center floating">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Search by Meter
                </h1>
                <p className="text-gray-600 shimmer">Find bills using meter number</p>
              </div>
            </div>
            <Button 
              onClick={() => onNavigate('dashboard')} 
              variant="outline"
              className="morphing-button glass-effect border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Search Form */}
        <Card className="glass-effect card-hover border-0 shadow-xl mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center mb-4 floating">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Search Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="meterNumber" className="text-sm font-medium text-gray-700">Meter Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="meterNumber"
                    type="text"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value)}
                    placeholder="Enter meter number"
                    className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="morphing-button bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold px-8 py-3"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searched && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-cyan-600" />
              Search Results {searchResults.length > 0 && `(${searchResults.length} found)`}
            </h2>
            
            {searchResults.length === 0 ? (
              <Card className="glass-effect card-hover border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-2">No bills found</p>
                  <p className="text-gray-500 mb-6">No bills found for meter number: {meterNumber}</p>
                  <Button 
                    onClick={() => onNavigate('generate-bill')} 
                    className="morphing-button bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white"
                  >
                    Generate New Bill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchResults.map((bill) => (
                  <Card key={bill.bill_id} className="glass-effect card-hover border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg text-gray-900">{bill.consumer_name}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            Meter: {bill.meter_number}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(bill.connection_type)}`}>
                            {bill.connection_type.charAt(0).toUpperCase() + bill.connection_type.slice(1)}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            {bill.units_consumed} kWh
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-gray-900 flex items-center">
                            <CreditCard className="w-5 h-5 mr-1" />
                            ₹{parseFloat(bill.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(bill.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(bill.status)}`}>
                            {getStatusIcon(bill.status)}
                            <span className="ml-2">{bill.status}</span>
                          </div>
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
