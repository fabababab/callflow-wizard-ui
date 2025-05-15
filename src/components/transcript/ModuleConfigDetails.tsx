
import React from 'react';
import { ModuleConfig } from '@/types/modules';

interface ModuleConfigDetailsProps {
  moduleConfig: ModuleConfig;
}

const ModuleConfigDetails: React.FC<ModuleConfigDetailsProps> = ({ moduleConfig }) => {
  // Format simple values for display
  const formatConfigValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };
  
  // Format array or nested objects for better display
  const formatComplexValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="mt-1 text-xs">
          {value.map((item, i) => (
            <div key={i} className="p-1 mb-1 bg-amber-50/50 rounded border border-amber-100">
              {typeof item === 'object' ? (
                Object.entries(item).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-[30%,70%] gap-1 mb-1">
                    <div className="font-medium text-amber-700">{key}:</div>
                    <div className="text-gray-700 break-all">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </div>
                  </div>
                ))
              ) : (
                String(item)
              )}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="mt-1 text-xs space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="grid grid-cols-[30%,70%] gap-1">
              <div className="font-medium text-amber-700">{key}:</div>
              <div className="text-gray-700 break-all">
                {typeof val === 'object' ? (
                  <pre className="whitespace-pre-wrap text-[10px] bg-white p-1 rounded border border-amber-100">
                    {JSON.stringify(val, null, 2)}
                  </pre>
                ) : (
                  String(val)
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };
  
  // Render configuration details content
  const renderConfigDetails = () => {
    if (!moduleConfig.data) return <p className="text-xs text-gray-500">No configuration data available</p>;
    
    // Extract keys but filter out any keys we don't want to show
    const keysToExclude = ['isInline'];
    const configKeys = Object.keys(moduleConfig.data).filter(key => !keysToExclude.includes(key));
    
    if (configKeys.length === 0) return <p className="text-xs text-gray-500">No configuration data available</p>;
    
    return (
      <div className="text-xs space-y-1 bg-amber-50/50 p-2 rounded-md">
        {configKeys.map(key => (
          <div key={key} className="mb-2 pb-2 border-b border-amber-100 last:border-0">
            <div className="font-medium text-amber-700 mb-1">{key}:</div>
            <div className="text-gray-700 break-words pl-2">
              {typeof moduleConfig.data[key] === 'object' ? (
                formatComplexValue(moduleConfig.data[key])
              ) : (
                formatConfigValue(moduleConfig.data[key])
              )}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[1fr,2fr] gap-2">
          <div className="font-medium text-amber-700">moduleType:</div>
          <div className="text-gray-700">{moduleConfig.type}</div>
        </div>
        <div className="grid grid-cols-[1fr,2fr] gap-2">
          <div className="font-medium text-amber-700">moduleId:</div>
          <div className="text-gray-700">{moduleConfig.id}</div>
        </div>
      </div>
    );
  };
  
  return renderConfigDetails();
};

export default ModuleConfigDetails;
