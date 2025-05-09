
import React from 'react';
import { Shield } from 'lucide-react';
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
    <Card className="mb-4 bg-amber-50 border border-amber-200 shadow-sm">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-700">
          <Shield size={16} />
          <span className="text-sm font-medium">Verification required to continue</span>
        </div>
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
          {pendingVerifications > 0 ? `${pendingVerifications} pending` : 'Pending'}
        </Badge>
      </div>
    </Card>
  );
};

export default VerificationBanner;
