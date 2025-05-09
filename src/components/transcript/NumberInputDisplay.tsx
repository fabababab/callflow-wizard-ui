
import React from 'react';
import { Check } from 'lucide-react';

interface NumberInputDisplayProps {
  userValue: string | number;
  systemValue: string | number;
  matched: boolean;
}

const NumberInputDisplay: React.FC<NumberInputDisplayProps> = ({ userValue, systemValue, matched }) => {
  return (
    <div className="mt-2 p-2 rounded bg-secondary/10 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs font-medium">Input: <strong>{userValue}</strong></span>
        <span className="text-xs font-medium">System: <strong>{systemValue}</strong></span>
      </div>
      {matched ? (
        <div className="bg-green-100 text-green-700 p-1 rounded-full">
          <Check className="h-4 w-4" />
        </div>
      ) : (
        <span className="text-yellow-500 text-xs font-medium">No match</span>
      )}
    </div>
  );
};

export default NumberInputDisplay;
