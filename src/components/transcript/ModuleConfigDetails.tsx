
import React from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  
  // Format currency with thousands separator
  const formatPrice = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };
  
  // Format franchise options as a table - improved to handle more cases
  const renderFranchiseOptions = (options: Array<{ amount: number; premium: number }>) => {
    // Validate that we have proper franchise options data
    if (!options || !Array.isArray(options) || options.length === 0) {
      return <div className="text-xs text-gray-500">No franchise options available</div>;
    }
    
    // Check if options have the expected structure
    if (!('amount' in options[0]) || !('premium' in options[0])) {
      return <div className="text-xs text-gray-500">Invalid franchise options format</div>;
    }
    
    return (
      <div className="mt-2">
        <Table className="border border-amber-100 text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="py-1 px-2">Franchise</TableHead>
              <TableHead className="py-1 px-2">Prämie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option, index) => (
              <TableRow key={index} className={option.amount === 1000 ? "bg-green-50" : ""}>
                <TableCell className="py-1 px-2">CHF {formatPrice(option.amount)}</TableCell>
                <TableCell className="py-1 px-2">CHF {formatPrice(option.premium)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {options.some(opt => opt.amount === 1000) && (
          <div className="mt-2 p-1 text-xs bg-green-50/70 border border-green-100 rounded text-green-800">
            Empfehlung: CHF 1'000 Franchise bietet die beste Balance zwischen monatlicher Prämie und Selbstbehalt.
          </div>
        )}
      </div>
    );
  };
  
  // Format array or nested objects for better display - improved handling for different module types
  const formatComplexValue = (key: string, value: any, moduleType?: ModuleType) => {
    // Special handling for franchise options in different module types
    if ((key === 'franchiseOptions' || key === 'options') && 
        Array.isArray(value) && value.length > 0 && 
        ((value[0] && 'amount' in value[0] && 'premium' in value[0]) ||
         (moduleType === ModuleType.INFORMATION_TABLE || moduleType === ModuleType.FRANCHISE))) {
      
      // If it's a franchise table but doesn't have the right structure, try to convert it
      if (!('amount' in value[0]) || !('premium' in value[0])) {
        try {
          // Try to map the data to the expected format if possible
          const convertedOptions = value.map((item: any, idx: number) => {
            // If there are even number of items, try to pair them
            if (typeof item === 'object' && 'franchise' in item && 'premium' in item) {
              return { amount: item.franchise, premium: item.premium };
            } else if (typeof item === 'object' && Object.keys(item).length >= 2) {
              const keys = Object.keys(item);
              return { amount: item[keys[0]], premium: item[keys[1]] };
            }
            return null;
          }).filter(Boolean);
          
          if (convertedOptions.length > 0) {
            return renderFranchiseOptions(convertedOptions);
          }
        } catch (e) {
          console.error('Failed to convert franchise options:', e);
        }
      }
      
      return renderFranchiseOptions(value);
    }
    
    // Handle other array types
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
    
    // Special handling for information table modules - render franchise options first if they exist
    if (moduleConfig.type === ModuleType.INFORMATION_TABLE && moduleConfig.data.franchiseOptions) {
      return (
        <div className="text-xs space-y-1 bg-amber-50/50 p-2 rounded-md">
          <div className="mb-3">
            <div className="font-medium text-amber-700 mb-1">Franchise Optionen:</div>
            <div className="text-gray-700 break-words pl-2">
              {renderFranchiseOptions(moduleConfig.data.franchiseOptions)}
            </div>
          </div>
          
          {/* Then render other properties */}
          {configKeys.filter(key => key !== 'franchiseOptions').map(key => (
            <div key={key} className="mb-2 pb-2 border-b border-amber-100 last:border-0">
              <div className="font-medium text-amber-700 mb-1">{key}:</div>
              <div className="text-gray-700 break-words pl-2">
                {formatComplexValue(key, moduleConfig.data[key], moduleConfig.type)}
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
    }
    
    // Standard rendering for other module types
    return (
      <div className="text-xs space-y-1 bg-amber-50/50 p-2 rounded-md">
        {configKeys.map(key => (
          <div key={key} className="mb-2 pb-2 border-b border-amber-100 last:border-0">
            <div className="font-medium text-amber-700 mb-1">{key}:</div>
            <div className="text-gray-700 break-words pl-2">
              {formatComplexValue(key, moduleConfig.data[key], moduleConfig.type)}
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
