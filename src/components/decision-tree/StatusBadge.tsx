
import React from 'react';
import { StateMachineStatus } from '@/utils/stateMachineLoader';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status?: StateMachineStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === StateMachineStatus.PRODUCTION) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Stable
      </Badge>
    );
  } else if (status === StateMachineStatus.TESTING) {
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Beta
      </Badge>
    );
  } else if (status === StateMachineStatus.DEVELOPMENT) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        In Development
      </Badge>
    );
  }
  
  return null;
};

export default StatusBadge;
