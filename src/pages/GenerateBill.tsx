
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
      amount = units * 8.0; // Flat rate for industrial
    }

    return Math.round(amount * 100) / 100; // Round to 2 decimal places
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Bill</h1>
              <p className="text-gray-600">Create a new electricity bill</p>
            </div>
            <Button onClick={() => onNavigate('dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="consumerName">Consumer Name</Label>
                <Input
                  id="consumerName"
                  type="text"
                  value={formData.consumerName}
                  onChange={(e) => handleInputChange('consumerName', e.target.value)}
                  placeholder="Enter consumer name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="meterNumber">Meter Number</Label>
                <Input
                  id="meterNumber"
                  type="text"
                  value={formData.meterNumber}
                  onChange={(e) => handleInputChange('meterNumber', e.target.value)}
                  placeholder="Enter meter number"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="connectionType">Connection Type</Label>
                <Select onValueChange={(value) => handleInputChange('connectionType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unitsConsumed">Units Consumed</Label>
                <Input
                  id="unitsConsumed"
                  type="number"
                  min="0"
                  value={formData.unitsConsumed}
                  onChange={(e) => handleInputChange('unitsConsumed', e.target.value)}
                  placeholder="Enter units consumed"
                  className="mt-1"
                  required
                />
              </div>

              {/* Rate Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Tariff Rates</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Domestic:</strong> 0-100 units: ₹3.5/unit, 101-200: ₹4.5/unit, 201-300: ₹6.5/unit, 300+: ₹8.5/unit</p>
                  <p><strong>Commercial:</strong> 0-100 units: ₹5.5/unit, 101-300: ₹7.5/unit, 300+: ₹9.5/unit</p>
                  <p><strong>Industrial:</strong> Flat rate: ₹8.0/unit</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Generating Bill...' : 'Generate Bill'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GenerateBill;
