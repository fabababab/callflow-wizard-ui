
import React, { useState } from 'react';
import { Shield, Info, FileText, ClipboardList, BookText, ArrowRight, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SensitiveField } from '@/data/scenarioData';
import { ModuleType } from '@/types/modules';
import { useToast } from '@/hooks/use-toast';

interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

interface StateDetailsPanelProps {
  selectedStateDetails: SelectedStateDetails | null;
  onSensitiveFieldClick: (field: SensitiveField) => void;
  onJumpToState?: (stateId: string) => void;
}

const StateDetailsPanel: React.FC<StateDetailsPanelProps> = ({
  selectedStateDetails,
  onSensitiveFieldClick,
  onJumpToState
}) => {
  const [activeTab, setActiveTab] = useState<string>("info");
  const { toast } = useToast();
  
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
        return <Shield className="h-4 w-4 text-amber-500" />;
      case ModuleType.INFORMATION:
        return <Info className="h-4 w-4 text-amber-500" />;
      case ModuleType.CONTRACT:
        return <FileText className="h-4 w-4 text-amber-500" />;
      case ModuleType.NACHBEARBEITUNG:
        return <ClipboardList className="h-4 w-4 text-amber-500" />;
      default:
        return <BookText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Handle jump to state
  const handleJumpToState = () => {
    if (onJumpToState) {
      onJumpToState(selectedStateDetails.id);
      toast({
        title: "Navigating to State",
        description: `Loading state: ${selectedStateDetails.id}`,
        duration: 2000
      });
    }
  };
  
  return (
    <div className="state-details-panel border rounded-md overflow-hidden bg-white">
      <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>State: {selectedStateDetails.id}</span>
          {hasModule && (
            <Badge variant="outline" className="ml-2 flex items-center gap-1 text-xs bg-amber-50 border-amber-200 text-amber-700">
              {getModuleTypeIcon(moduleInfo.type)}
              <span>Has Module</span>
            </Badge>
          )}
          {selectedStateDetails.sensitiveFields && selectedStateDetails.sensitiveFields.length > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 text-xs">
              <Shield className="h-3 w-3" />
              <span>Sensitive Data</span>
            </Badge>
          )}
        </h3>
        
        {/* Jump to state button */}
        {onJumpToState && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleJumpToState}
            className="text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1"
          >
            <ArrowRight className="h-3 w-3" />
            Jump to State
          </Button>
        )}
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
          <TabsTrigger value="json" className="data-[state=active]:bg-white rounded-none">
            <Code className="h-3 w-3 mr-1" />
            JSON
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
          {selectedStateDetails.data.meta?.systemMessage && (
            <div className="mb-3 p-2 rounded bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1 text-amber-700 text-sm font-medium mb-1">
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
            <div className="mb-3 p-2 rounded bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1 text-amber-700 text-sm font-medium mb-1">
                <Info size={16} />
                <span>Agent Text</span>
              </div>
              <p className="text-sm">{selectedStateDetails.data.meta.agentText}</p>
            </div>
          )}
        </TabsContent>
        
        {hasModule && (
          <TabsContent value="module" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
            <div className="p-3 rounded bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-700 text-sm font-medium">
                  {getModuleTypeIcon(moduleInfo.type)}
                  <span>{moduleInfo.title}</span>
                </div>
                <Badge variant={moduleInfo.data?.isInline ? "outline" : "secondary"} className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                  {moduleInfo.data?.isInline ? "Inline" : "Modal"}
                </Badge>
              </div>
              
              <div className="mt-2 pt-2 border-t border-amber-200">
                <p className="text-sm font-medium text-amber-700">Module Type: <span className="font-normal">{moduleInfo.type}</span></p>
                {moduleInfo.id && (
                  <p className="text-sm font-medium text-amber-700">Module ID: <span className="font-normal">{moduleInfo.id}</span></p>
                )}
                {moduleInfo.data && Object.keys(moduleInfo.data).length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-amber-700">Configuration:</p>
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
                <div key={event} className="p-2 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-amber-700">{event}</span>
                    <p className="text-xs text-amber-600">Trigger event</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-100 px-2 py-1 rounded-md text-amber-800">
                      → {String(target)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 p-1"
                      onClick={() => {
                        if (onJumpToState && typeof target === 'string') {
                          onJumpToState(target);
                          toast({
                            title: "Navigating to State",
                            description: `Loading target state: ${target}`,
                            duration: 2000
                          });
                        }
                      }}
                    >
                      <ArrowRight className="h-3 w-3 text-amber-700" />
                    </Button>
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
                  className="p-2 bg-amber-50 border border-amber-200 rounded cursor-pointer hover:bg-amber-100 transition-colors" 
                  onClick={() => onSensitiveFieldClick(field)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-sm text-amber-700">{field.type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                      Click for details
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-amber-700">
                    <strong>Value:</strong> {field.value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        
        {/* New JSON Tab */}
        <TabsContent value="json" className="m-0 p-4 focus-visible:outline-none focus-visible:ring-0">
          <div className="bg-slate-100 p-3 rounded-md">
            <div className="flex items-center gap-1 text-slate-700 text-sm font-medium mb-2">
              <Code size={16} />
              <span>Raw State Data</span>
            </div>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-80">
              {JSON.stringify(selectedStateDetails.data, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StateDetailsPanel;
