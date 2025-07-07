
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calculator, FileText, Zap, User, Hash, Building, Activity } from 'lucide-react';

interface GenerateBillProps {
  onNavigate: (page: string, data?: any) => void;
  session: Session;
}

const GenerateBill: React.FC<GenerateBillProps> = ({ onNavigate, session }) => {
  const [formData, setFormData] = useState({
    consumerName: '',
    meterNumber: '',
    connectionType: '',
    unitsConsumed: ''
  });
  const [loading, setLoading] = useState(false);

  // Electricity tariff rates (slab-based pricing)
  const calculateAmount = (units: number, type: string): number => {
    let amount = 0;
    
    if (type === 'domestic') {
      if (units <= 100) {
        amount = units * 3.5;
      } else if (units <= 200) {
        amount = 100 * 3.5 + (units - 100) * 4.5;
      } else if (units <= 300) {
        amount = 100 * 3.5 + 100 * 4.5 + (units - 200) * 6.5;
      } else {
        amount = 100 * 3.5 + 100 * 4.5 + 100 * 6.5 + (units - 300) * 8.5;
      }
    } else if (type === 'commercial') {
      if (units <= 100) {
        amount = units * 5.5;
      } else if (units <= 300) {
        amount = 100 * 5.5 + (units - 100) * 7.5;
      } else {
        amount = 100 * 5.5 + 200 * 7.5 + (units - 300) * 9.5;
      }
    } else if (type === 'industrial') {
      amount = units * 8.0;
    }

    return Math.round(amount * 100) / 100;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consumerName || !formData.meterNumber || !formData.connectionType || !formData.unitsConsumed) {
      toast.error('Please fill in all fields');
      return;
    }

    const units = parseInt(formData.unitsConsumed);
    if (isNaN(units) || units < 0) {
      toast.error('Please enter a valid number of units');
      return;
    }

    setLoading(true);

    try {
      const amount = calculateAmount(units, formData.connectionType);
      
      const { data, error } = await supabase
        .from('bills')
        .insert({
          user_id: session.user.id,
          consumer_name: formData.consumerName,
          meter_number: formData.meterNumber,
          connection_type: formData.connectionType,
          units_consumed: units,
          amount: amount,
          status: 'Not Paid'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bill:', error);
        toast.error('Failed to generate bill');
      } else {
        toast.success('Bill generated successfully!');
        onNavigate('bill-result', data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-green-500/20 rounded-full blur-3xl floating" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center floating">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Generate Bill
                </h1>
                <p className="text-gray-600 shimmer">Create a new electricity bill</p>
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Card className="glass-effect card-hover border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4 floating">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Bill Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="consumerName" className="text-sm font-medium text-gray-700">Consumer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="consumerName"
                    type="text"
                    value={formData.consumerName}
                    onChange={(e) => handleInputChange('consumerName', e.target.value)}
                    placeholder="Enter consumer name"
                    className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterNumber" className="text-sm font-medium text-gray-700">Meter Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="meterNumber"
                    type="text"
                    value={formData.meterNumber}
                    onChange={(e) => handleInputChange('meterNumber', e.target.value)}
                    placeholder="Enter meter number"
                    className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionType" className="text-sm font-medium text-gray-700">Connection Type</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Select onValueChange={(value) => handleInputChange('connectionType', value)}>
                    <SelectTrigger className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300">
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-white/30">
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitsConsumed" className="text-sm font-medium text-gray-700">Units Consumed</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="unitsConsumed"
                    type="number"
                    min="0"
                    value={formData.unitsConsumed}
                    onChange={(e) => handleInputChange('unitsConsumed', e.target.value)}
                    placeholder="Enter units consumed"
                    className="pl-10 glass-effect border-0 focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Rate Information */}
              <div className="glass-effect p-6 rounded-xl border border-blue-200/30">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Tariff Rates
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="p-3 glass-effect rounded-lg">
                    <p><strong className="text-green-700">Domestic:</strong> 0-100 units: ₹3.5/unit, 101-200: ₹4.5/unit, 201-300: ₹6.5/unit, 300+: ₹8.5/unit</p>
                  </div>
                  <div className="p-3 glass-effect rounded-lg">
                    <p><strong className="text-orange-700">Commercial:</strong> 0-100 units: ₹5.5/unit, 101-300: ₹7.5/unit, 300+: ₹9.5/unit</p>
                  </div>
                  <div className="p-3 glass-effect rounded-lg">
                    <p><strong className="text-purple-700">Industrial:</strong> Flat rate: ₹8.0/unit</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full morphing-button bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Bill...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Generate Bill</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GenerateBill;
