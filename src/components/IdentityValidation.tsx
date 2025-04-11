
import React from 'react';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ValidationItemProps = {
  label: string;
  status: 'verified' | 'pending' | 'failed';
};

const ValidationItem = ({ label, status }: ValidationItemProps) => {
  const statusIcons = {
    verified: <Check size={16} className="text-callflow-success" />,
    pending: <div className="w-4 h-4 rounded-full border-2 border-callflow-muted-text border-t-transparent animate-spin"></div>,
    failed: <AlertCircle size={16} className="text-callflow-danger" />,
  };

  const statusClasses = {
    verified: "text-callflow-success border-callflow-success/20 bg-callflow-success/5",
    pending: "text-callflow-muted-text border-callflow-muted-text/20 bg-callflow-muted-text/5",
    failed: "text-callflow-danger border-callflow-danger/20 bg-callflow-danger/5",
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-2 border rounded-md",
      statusClasses[status]
    )}>
      <span className="text-sm">{label}</span>
      {statusIcons[status]}
    </div>
  );
};

const IdentityValidation = () => {
  const [verificationProgress, setVerificationProgress] = React.useState(40);
  
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield size={18} className="text-callflow-primary" />
          <span>Identity Validation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Verification Progress</span>
            <span className="text-sm">{verificationProgress}%</span>
          </div>
          <Progress value={verificationProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <ValidationItem label="Phone Number Match" status="verified" />
          <ValidationItem label="Personal Information" status="verified" />
          <ValidationItem label="Voice Biometrics" status="pending" />
          <ValidationItem label="Security Questions" status="failed" />
        </div>
        
        <div className="pt-2">
          <Button className="w-full" variant="default">
            Start Full Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdentityValidation;
