import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Zap, FileText, CheckCircle, AlertCircle, CreditCard, Plus, History, Search } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  session: Session;
}

interface Stats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalAmount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, session }) => {
  const [stats, setStats] = useState<Stats>({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    totalAmount: 0,
  });
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentBills();
  }, [session]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('status, amount')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard stats');
      } else {
        const totalBills = data.length;
        const paidBills = data.filter(bill => bill.status === 'Paid').length;
        const unpaidBills = totalBills - paidBills;
        const totalAmount = data.reduce((sum, bill) => sum + bill.amount, 0);

        setStats({
          totalBills,
          paidBills,
          unpaidBills,
          totalAmount,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const fetchRecentBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent bills:', error);
        toast.error('Failed to load recent bills');
      } else {
        setRecentBills(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onNavigate('login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Enhanced Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center floating">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  ElectroBill Dashboard
                </h1>
                <p className="text-gray-600">Welcome back! Manage your electricity bills efficiently</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="morphing-button glass-effect border-white/20 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-0 shadow-xl card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bills</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.totalBills}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Bills</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {stats.paidBills}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    {stats.unpaidBills}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center pulse-ring">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{stats.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect border-0 shadow-xl card-hover group cursor-pointer" onClick={() => onNavigate('generate-bill')}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform floating">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Bill</h3>
                <p className="text-gray-600">Create a new electricity bill for your customers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl card-hover group cursor-pointer" onClick={() => onNavigate('bill-history')}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform floating">
                <History className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bill History</h3>
                <p className="text-gray-600">View and manage all your electricity bills</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl card-hover group cursor-pointer" onClick={() => onNavigate('search-meter')}>
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform floating">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Search by Meter</h3>
                <p className="text-gray-600">Find bills using meter number quickly</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bills */}
        <Card className="glass-effect border-0 shadow-xl">
          <CardHeader className="border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">Recent Bills</CardTitle>
              <Button 
                onClick={() => onNavigate('bill-history')} 
                variant="outline"
                className="morphing-button glass-effect border-white/20"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {recentBills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">No bills found</p>
                <Button 
                  onClick={() => onNavigate('generate-bill')}
                  className="morphing-button bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Your First Bill
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBills.map((bill) => (
                  <div key={bill.bill_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        bill.status === 'Paid' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        {bill.status === 'Paid' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{bill.consumer_name}</h4>
                        <p className="text-sm text-gray-600">Meter: {bill.meter_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{parseFloat(bill.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(bill.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
