
import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { useCustomerScenario } from '@/hooks/useCustomerScenario';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { loadStateMachine, StateMachine, StateMachineState } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import TranscriptPanel from '@/components/TranscriptPanel';
import { Button } from '@/components/ui/button';
import { FileJson, LayoutDashboard, Shield, AlertTriangle, Info, Database, Loader2 } from 'lucide-react';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { Badge } from '@/components/ui/badge';
import { SensitiveField } from '@/data/scenarioData';
import { toast } from '@/hooks/use-toast';
// Proper import for StateMachineSelector
import StateMachineSelector from '@/components/StateMachineSelector';

// New interface to track selected state details for the modal
interface SelectedStateDetails {
  id: string;
  data: StateMachineState;
  sensitiveFields?: SensitiveField[];
}

const TestScenario = () => {
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [selectedStateMachine, setSelectedStateMachine] = useState<ScenarioType>("testscenario");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  const [isLoading, setIsLoading] = useState(true);

  // State for selected state details and sensitive fields
  const [selectedStateDetails, setSelectedStateDetails] = useState<SelectedStateDetails | null>(null);
  const [showSensitiveFieldDetails, setShowSensitiveFieldDetails] = useState<SensitiveField | null>(null);

  // Use the useTranscript hook for the active scenario
  const transcript = useTranscript(selectedStateMachine);

  // Choose the appropriate state machine based on the mode (always agent mode now)
  const customerScenario = useCustomerScenario();
  const physioCoverage = usePhysioCoverageStateMachine();

  // Always use agent mode
  const activeScenario = customerScenario;
  const {
    currentState,
    error
  } = activeScenario;

  // Handle state selection from the visualizer
  const handleStateSelection = (state: string) => {
    console.log(`State selected in TestScenario: ${state}`);

    // If we have a valid state machine, update the current state
    if (loadedStateMachine && loadedStateMachine.states[state]) {
      setJsonContent(JSON.stringify(loadedStateMachine.states[state], null, 2));

      // Store the selected state details including any sensitive fields
      const stateData = loadedStateMachine.states[state];
      const sensitiveFields = stateData.meta?.sensitiveFields;
      setSelectedStateDetails({
        id: state,
        data: stateData,
        sensitiveFields: sensitiveFields
      });

      // Update dialog view mode to show the visualization with this state
      setDialogViewMode("visualization");
    }
  };

  // Handle clicking on a sensitive field to show details
  const handleSensitiveFieldClick = (field: SensitiveField) => {
    setShowSensitiveFieldDetails(field);
    console.log("Showing sensitive field details:", field);
  };

  // Close sensitive field details modal
  const handleCloseSensitiveDetails = () => {
    setShowSensitiveFieldDetails(null);
  };

  // Listen for JSON visualization toggle events from TranscriptPanel
  useEffect(() => {
    const handleToggleJsonVisualization = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.hasOwnProperty('visible')) {
        setShowJsonDialog(customEvent.detail.visible);
      }
    };
    window.addEventListener('toggle-json-visualization', handleToggleJsonVisualization as EventListener);
    return () => {
      window.removeEventListener('toggle-json-visualization', handleToggleJsonVisualization as EventListener);
    };
  }, []);

  // Listen for scenario change events from the TranscriptPanel
  useEffect(() => {
    const handleScenarioChange = (event: CustomEvent) => {
      const newScenario = event.detail.scenario as ScenarioType;
      if (newScenario && newScenario !== selectedStateMachine) {
        console.log('Scenario changed to:', newScenario);
        setSelectedStateMachine(newScenario);
      }
    };
    window.addEventListener('scenario-change', handleScenarioChange as EventListener);
    return () => {
      window.removeEventListener('scenario-change', handleScenarioChange as EventListener);
    };
  }, [selectedStateMachine]);

  // Load state machine when selected scenario changes
  useEffect(() => {
    async function fetchStateMachine() {
      if (selectedStateMachine) {
        setIsLoading(true);
        try {
          console.log('Loading state machine for scenario:', selectedStateMachine);

          // Don't automatically reset transcript when scenario changes
          const machine = await loadStateMachine(selectedStateMachine);
          console.log('Loaded state machine:', machine);
          if (!machine) {
            throw new Error('Failed to load state machine - received null or undefined');
          }
          if (!machine.states || Object.keys(machine.states).length === 0) {
            throw new Error('State machine has no states defined');
          }
          setLoadedStateMachine(machine);

          // Also load the JSON content for display
          setJsonContent(JSON.stringify(machine, null, 2));

          // Don't auto-reset call when changing scenarios - let user control this
        } catch (error) {
          console.error("Failed to load state machine:", error);
          toast({
            title: "Error Loading Scenario",
            description: error instanceof Error ? error.message : "Failed to load the test scenario",
            variant: "destructive",
            duration: 5000
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchStateMachine();
  }, [selectedStateMachine]);

  // Add a new effect to monitor call state changes
  useEffect(() => {
    if (transcript.callActive) {
      console.log('Call is now active');
    } else {
      console.log('Call is now inactive');
    }
  }, [transcript.callActive]);

  // Toggle view mode between JSON and visualization
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };
  
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-0">
            <div className="h-full">
              {/* Main content section with transcript panel as the main view */}
              {loadedStateMachine && (
                <div className="h-full">
                  {/* Directly embed the transcript panel without tabs */}
                  <div className="h-full" ref={transcriptRef}>
                    <TranscriptPanel activeScenario={selectedStateMachine} />
                  </div>
                </div>
              )}

              {/* Display loading or error states */}
              {isLoading && (
                <Card className="m-4">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    </div>
                    <p className="text-center">Loading scenario...</p>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card className="m-4">
                  <CardContent className="py-4">
                    <p className="text-red-500">{error}</p>
                  </CardContent>
                </Card>
              )}
              
              {!loadedStateMachine && !isLoading && !error && (
                <Card className="m-4">
                  <CardContent className="py-8 text-center">
                    <p>State machine is loading...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Dialog to display the JSON file and visualization */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background">
          <DialogHeader>
            <DialogTitle>
              {selectedStateMachine} State Machine
            </DialogTitle>
            <DialogDescription>
              {dialogViewMode === "json" ? "Complete JSON representation of the state machine flow" : "Visual representation of the state machine flow"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Button variant={dialogViewMode === "json" ? "secondary" : "outline"} size="sm" onClick={() => handleViewModeToggle("json")} className="flex items-center gap-2">
              <FileJson size={16} />
              JSON View
            </Button>
            <Button variant={dialogViewMode === "visualization" ? "secondary" : "outline"} size="sm" onClick={() => handleViewModeToggle("visualization")} className="flex items-center gap-2">
              <LayoutDashboard size={16} />
              Visualization
            </Button>
          </div>
          
          <div className="overflow-auto max-h-[60vh]">
            {dialogViewMode === "json" ? (
              <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
                {jsonContent}
              </pre>
            ) : (
              <div className="bg-white p-4 rounded-md">
                <DecisionTreeVisualizer 
                  stateMachine={loadedStateMachine} 
                  currentState={currentState} 
                  onStateClick={handleStateSelection} 
                />
                
                {/* Display Selected State Details */}
                {selectedStateDetails && (
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
                              onClick={() => handleSensitiveFieldClick(field)}
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
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sensitive Field Details Dialog */}
      <Dialog open={!!showSensitiveFieldDetails} onOpenChange={() => setShowSensitiveFieldDetails(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              Sensitive Data: {showSensitiveFieldDetails?.type}
            </DialogTitle>
            <DialogDescription>
              Verification and source information
            </DialogDescription>
          </DialogHeader>
          
          {showSensitiveFieldDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Customer Provided</h4>
                  <p className="text-lg font-mono">{showSensitiveFieldDetails.value}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">System Value</h4>
                  <p className="text-lg font-mono">{showSensitiveFieldDetails.systemValue}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                {showSensitiveFieldDetails.value === showSensitiveFieldDetails.systemValue ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">Match</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-300">No Match</Badge>
                )}
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center gap-1 mb-1">
                  <Database size={14} />
                  <h4 className="text-sm font-medium">Source</h4>
                </div>
                <p className="text-sm">{showSensitiveFieldDetails.source || "Unknown source"}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md border">
                <h4 className="text-sm font-medium mb-1">Validation Status</h4>
                <Badge variant={showSensitiveFieldDetails.status === 'valid' ? 'default' : showSensitiveFieldDetails.status === 'invalid' ? 'destructive' : 'outline'}>
                  {showSensitiveFieldDetails.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleCloseSensitiveDetails}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestScenario;
