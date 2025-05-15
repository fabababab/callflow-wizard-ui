
import React from 'react';
import { ModuleType } from '@/types/modules';
import { Shield, Info, FileText, BarChart, Table } from 'lucide-react';

interface ModuleIconProps {
  type: ModuleType;
  className?: string;
}

const ModuleIcon: React.FC<ModuleIconProps> = ({ type, className = "h-4 w-4 text-amber-600" }) => {
  switch(type) {
    case ModuleType.VERIFICATION:
      return <Shield className={className} />;
    case ModuleType.INFORMATION:
      return <Info className={className} />;
    case ModuleType.CONTRACT:
      return <FileText className={className} />;
    case ModuleType.FRANCHISE:
      return <BarChart className={className} />;
    case ModuleType.INFORMATION_TABLE:
      return <Table className={className} />;
    default:
      return <Info className={className} />;
  }
};

export default ModuleIcon;
