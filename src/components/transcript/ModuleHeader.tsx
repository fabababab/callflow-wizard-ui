
import React from 'react';
import { ModuleConfig } from '@/types/modules';
import ModuleIcon from './ModuleIcon';

interface ModuleHeaderProps {
  moduleConfig: ModuleConfig;
  completed: boolean;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({ moduleConfig, completed }) => {
  return (
    <div className="p-2 border-b border-amber-200 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <ModuleIcon type={moduleConfig.type} />
        <span className="font-medium text-sm text-amber-700">{moduleConfig.title}</span>
      </div>
      <div className="flex items-center gap-1">
        {completed && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            Completed
          </span>
        )}
      </div>
    </div>
  );
};

export default ModuleHeader;
