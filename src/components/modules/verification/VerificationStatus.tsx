
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface VerificationStatusProps {
  status: 'pending' | 'success' | 'failed';
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  if (status === 'pending') return null;
  
  if (status === 'success') {
    return (
      <div className="bg-green-50 p-2 rounded-md flex items-center gap-2 text-green-700 text-sm mb-3 transition-opacity duration-300">
        <CheckCircle className="h-4 w-4" />
        <span>Verification successful</span>
      </div>
    );
  }
  
  return (
    <div className="bg-red-50 p-2 rounded-md flex items-center gap-2 text-red-700 text-sm mb-3 transition-opacity duration-300">
      <AlertCircle className="h-4 w-4" />
      <span>Verification failed. Please check your information.</span>
    </div>
  );
};

export default VerificationStatus;
