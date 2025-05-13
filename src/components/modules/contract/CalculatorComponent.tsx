
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

const CalculatorComponent: React.FC = () => {
  const [amount, setAmount] = useState("1000");
  const [years, setYears] = useState("1");
  const [rate, setRate] = useState("2.5");
  
  const calculateInterest = () => {
    const principal = parseFloat(amount);
    const time = parseFloat(years);
    const interestRate = parseFloat(rate) / 100;
    
    if (isNaN(principal) || isNaN(time) || isNaN(interestRate)) {
      return "Please enter valid numbers";
    }
    
    const interest = principal * interestRate * time;
    const total = principal + interest;
    
    return `Interest: €${interest.toFixed(2)}\nTotal: €${total.toFixed(2)}`;
  };
  
  return (
    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md space-y-2 my-3">
      <h4 className="text-sm font-medium text-amber-800 flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        Payment Calculator
      </h4>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <Label htmlFor="amount">Amount (€)</Label>
          <Input 
            id="amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            type="text" 
          />
        </div>
        <div>
          <Label htmlFor="years">Years</Label>
          <Input 
            id="years" 
            value={years} 
            onChange={(e) => setYears(e.target.value)} 
            type="text" 
          />
        </div>
        <div>
          <Label htmlFor="rate">Interest Rate (%)</Label>
          <Input 
            id="rate" 
            value={rate} 
            onChange={(e) => setRate(e.target.value)} 
            type="text" 
          />
        </div>
      </div>
      <div className="mt-2 p-2 bg-white rounded border border-amber-100 font-mono text-xs whitespace-pre-line">
        {calculateInterest()}
      </div>
    </div>
  );
};

export default CalculatorComponent;
