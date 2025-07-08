import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { History, Search, Filter, Calendar, CreditCard, CheckCircle, XCircle, Hash, Activity } from 'lucide-react';

interface BillHistoryProps {
  onNavigate: (page: string, data?: any) => void;
  session: Session;
}

interface Bill {
  bill_id: string;
  consumer_name: string;
  meter_number: string;
  connection_type: string;
  units_consumed: number;
  amount: number;
  status: string;
  created_at: string;
}

const BillHistory: React.FC<BillHistoryProps> = ({ onNavigate, session }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchBills();
  }, [session]);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter, typeFilter]);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
        toast.error('Failed to fetch bills');
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
    let filtered = bills;

    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.consumer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.meter_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(bill => bill.connection_type.toLowerCase() === typeFilter.toLowerCase());
    }

    setFilteredBills(filtered);
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

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl floating" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center floating">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Bill History
                </h1>
                <p className="text-gray-600 shimmer">View and manage your electricity bills</p>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Filters */}
        <Card className="glass-effect card-hover border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or meter number"
                    className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="glass-effect border-0 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/30">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="not paid">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">Connection Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="glass-effect border-0 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/30">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <div className="space-y-4">
          {filteredBills.length === 0 ? (
            <Card className="glass-effect border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-4">No bills found</p>
                <Button onClick={() => onNavigate('generate-bill')} className="morphing-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Generate New Bill
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBills.map((bill) => (
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
                        ₹{parseFloat(bill.amount.toString()).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(bill.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        <span className="ml-2">{bill.status}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onNavigate('bill-result', bill)}
                        className="morphing-button bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default BillHistory;
