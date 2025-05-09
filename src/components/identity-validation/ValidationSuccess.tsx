
import React from 'react';
import { CheckCircle } from 'lucide-react';

const ValidationSuccess: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle size={18} />
        <span className="font-medium">Identity Verified</span>
      </div>
      <p className="mt-1 pl-6">All customer details have been confirmed.</p>
    </div>
  );
};

export default ValidationSuccess;
