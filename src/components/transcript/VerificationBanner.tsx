
import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VerificationBannerProps {
  isVisible: boolean;
  pendingVerifications: number;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ 
  isVisible, 
  pendingVerifications = 0 
}) => {
  if (!isVisible) return null;
  
  return (
    <Card className="mb-4 bg-amber-50 border border-amber-200 shadow-sm animate-fade-in">
      <div className="p-3 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertCircle size={16} />
          <div>
            <span className="font-medium text-sm">Verification Required</span>
            <p className="text-xs text-amber-600 mt-0.5">Please complete verification in the chat to continue</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 px-2 py-1">
          <Shield size={12} className="mr-1" />
          {pendingVerifications > 0 ? `${pendingVerifications} pending` : 'Pending'}
        </Badge>
      </div>
    </Card>
  );
};

export default VerificationBanner;
