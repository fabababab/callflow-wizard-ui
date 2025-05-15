
import React from 'react';
import { ModuleType } from '@/types/modules';
import { Check, Table } from 'lucide-react';

interface ModuleIconProps {
  type: ModuleType;
  className?: string;
}

const ModuleIcon: React.FC<ModuleIconProps> = ({ type, className = "" }) => {
  switch (type) {
    case ModuleType.VERIFICATION:
      return <Check className={`h-4 w-4 ${className}`} />;
    case ModuleType.INFORMATION_TABLE:
      return <Table className={`h-4 w-4 ${className}`} />;
    default:
      return <Check className={`h-4 w-4 ${className}`} />;
  }
};

export default ModuleIcon;
