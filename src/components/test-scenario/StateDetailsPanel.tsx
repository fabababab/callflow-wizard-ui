
import React, { useState } from 'react';
import { Shield, Info, FileText, ClipboardList, BookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SensitiveField } from '@/data/scenarioData';
import { ModuleType } from '@/types/modules';

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
  const [activeTab, setActiveTab] = useState<string>("info");
  
  if (!selectedStateDetails) {
    return (
      <div className="p-4 text-center text-gray-500 italic border rounded-md">
        Select a state to view details
      </div>
    );
  }
  
  // Get module info if present
  const moduleInfo = selectedStateDetails.data.meta?.module;
  const hasModule = !!moduleInfo;
  
  // Get transitions if present
  const transitions = selectedStateDetails.data.on || {};
  const hasTransitions = Object.keys(transitions).length > 0;
  
  // Helper to get module type icon
  const getModuleTypeIcon = (type?: string) => {
    switch(type) {
      case ModuleType.VERIFICATION:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case ModuleType.INFORMATION:
        return <Info className="h-4 w-4 text-green-500" />;
      case ModuleType.CONTRACT:
        return <FileText className="h-4 w-4 text-purple-500" />;
      case ModuleType.NACHBEARBEITUNG:
        return <ClipboardList className="h-4 w-4 text-amber-500" />;
      default:
        return <BookText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="state-details-panel border rounded-md overflow-hidden bg-white">
      <div className="p-3 border-b bg-slate-50">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>State: {selectedStateDetails.id}</span>
          {hasModule && (
            <Badge variant="outline" className="ml-2 flex items-center gap-1 text-xs">
              {getModuleTypeIcon(moduleInfo.type)}
              <span>Has Module</span>
            </Badge>
          )}
          {selectedStateDetails.sensitiveFields && selectedStateDetails.sensitiveFields.length > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1 text-xs">
              <Shield className="h-3 w-3" />
              <span>Sensitive Data</span>
            </Badge>
          )}
        </h3>
      </div>
      
      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start p-0 bg-slate-100 rounded-none border-b">
          <TabsTrigger value="info" className="data-[state=active]:bg-white rounded-none">
            State Info
          </TabsTrigger>
          {hasModule && (
            <TabsTrigger value="module" className="data-[state=active]:bg-white rounded-none">
              Module
            </TabsTrigger>
          )}
          {hasTransitions && (
            <TabsTrigger value="transitions" className="data-[state=active]:bg-white rounded-none">
              Transitions
            </TabsTrigger>
          )}
          {selectedStateDetails.sensitiveFields && selectedStateDetails.sensitiveFields.length > 0 && (
            <TabsTrigger value="sensitive" className="data-[state=active]:bg-white rounded-none">
              Sensitive Data
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="info" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
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
                <Info size={16} />
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
        </TabsContent>
        
        {hasModule && (
          <TabsContent value="module" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
            <div className="p-3 rounded bg-indigo-50 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-indigo-700 text-sm font-medium">
                  {getModuleTypeIcon(moduleInfo.type)}
                  <span>{moduleInfo.title}</span>
                </div>
                <Badge variant={moduleInfo.data?.isInline ? "outline" : "secondary"} className="text-xs">
                  {moduleInfo.data?.isInline ? "Inline" : "Modal"}
                </Badge>
              </div>
              
              <div className="mt-2 pt-2 border-t border-indigo-200">
                <p className="text-sm font-medium text-gray-700">Module Type: <span className="font-normal">{moduleInfo.type}</span></p>
                {moduleInfo.id && (
                  <p className="text-sm font-medium text-gray-700">Module ID: <span className="font-normal">{moduleInfo.id}</span></p>
                )}
                {moduleInfo.data && Object.keys(moduleInfo.data).length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Configuration:</p>
                    <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {JSON.stringify(moduleInfo.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}
        
        {hasTransitions && (
          <TabsContent value="transitions" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-2">
              {Object.entries(transitions).map(([event, target]) => (
                <div key={event} className="p-2 bg-gray-50 border rounded flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{event}</span>
                    <p className="text-xs text-gray-500">Trigger event</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-md">
                      → {String(target)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        
        {selectedStateDetails.sensitiveFields && selectedStateDetails.sensitiveFields.length > 0 && (
          <TabsContent value="sensitive" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-2">
              {selectedStateDetails.sensitiveFields.map(field => (
                <div 
                  key={field.id} 
                  className="p-2 bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:bg-yellow-100 transition-colors" 
                  onClick={() => onSensitiveFieldClick(field)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-sm">{field.type}</span>
                    </div>
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default StateDetailsPanel;
