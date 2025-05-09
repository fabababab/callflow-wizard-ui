
import React from 'react';
import { Shield, Info, Database, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SensitiveField } from '@/data/scenarioData';

interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

interface StateDetailsPanelProps {
  selectedStateDetails: SelectedStateDetails | null;
  onSensitiveFieldClick: (field: SensitiveField) => void;
}

const StateDetailsPanel: React.FC<StateDetailsPanelProps> = ({
  selectedStateDetails,
  onSensitiveFieldClick
}) => {
  if (!selectedStateDetails) return null;
  
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-2">State: {selectedStateDetails.id}</h3>
      
      {selectedStateDetails.data.meta?.systemMessage && (
        <div className="mb-3 p-2 rounded bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-1 text-blue-700 text-sm font-medium mb-1">
            <Info size={16} />
            <span>System Message</span>
          </div>
          <p className="text-sm">{selectedStateDetails.data.meta.systemMessage}</p>
        </div>
      )}
      
      {selectedStateDetails.data.meta?.customerText && (
        <div className="mb-3 p-2 rounded bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-1 text-amber-700 text-sm font-medium mb-1">
            <AlertTriangle size={16} />
            <span>Customer Text</span>
          </div>
          <p className="text-sm">{selectedStateDetails.data.meta.customerText}</p>
        </div>
      )}
      
      {selectedStateDetails.data.meta?.agentText && (
        <div className="mb-3 p-2 rounded bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-1 text-emerald-700 text-sm font-medium mb-1">
            <Info size={16} />
            <span>Agent Text</span>
          </div>
          <p className="text-sm">{selectedStateDetails.data.meta.agentText}</p>
        </div>
      )}
      
      {/* Display Module Information if present */}
      {selectedStateDetails.data.meta?.module && (
        <div className="mb-3 p-2 rounded bg-indigo-50 border border-indigo-200">
          <div className="flex items-center gap-1 text-indigo-700 text-sm font-medium mb-1">
            <Info size={16} />
            <span>Module: {selectedStateDetails.data.meta.module.title}</span>
          </div>
          <p className="text-sm">Type: {selectedStateDetails.data.meta.module.type}</p>
        </div>
      )}
      
      {/* Display Sensitive Data Fields */}
      {selectedStateDetails.sensitiveFields && selectedStateDetails.sensitiveFields.length > 0 && (
        <div className="mb-3 p-2 rounded bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-1 text-yellow-700 text-sm font-medium mb-1">
            <Shield size={16} />
            <span>Sensitive Data Detection</span>
          </div>
          <div className="space-y-2">
            {selectedStateDetails.sensitiveFields.map(field => (
              <div 
                key={field.id} 
                className="p-2 bg-white border rounded cursor-pointer hover:bg-yellow-100 transition-colors" 
                onClick={() => onSensitiveFieldClick(field)}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{field.type}</span>
                  <Badge variant="outline" className="text-xs">
                    Click for details
                  </Badge>
                </div>
                <div className="mt-1 text-sm">
                  <strong>Value:</strong> {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StateDetailsPanel;
