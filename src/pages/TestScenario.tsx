import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { useCustomerScenario } from '@/hooks/useCustomerScenario';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { loadStateMachine, StateMachine, StateMachineState } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import TranscriptPanel from '@/components/TranscriptPanel'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, LayoutDashboard, Shield, AlertTriangle, Info, Database } from 'lucide-react';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { Button } from '@/components/ui/button';
import { SensitiveField } from '@/data/scenarioData';
import { Badge } from '@/components/ui/badge';

// New interface to track selected state details for the modal
interface SelectedStateDetails {
  id: string;
  data: StateMachineState;
  sensitiveFields?: SensitiveField[];
}

const TestScenario = () => {
  const [isAgentMode, setIsAgentMode] = useState(true); // Default to agent mode (you responding as agent)
  const [showJsonDialog, setShowJsonDialog] = useState(false); // Make sure this is initialized as false
  const [selectedStateMachine, setSelectedStateMachine] = useState<ScenarioType>("testscenario");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Initialize sidebar as collapsed
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  
  // New state for selected state details and sensitive fields
  const [selectedStateDetails, setSelectedStateDetails] = useState<SelectedStateDetails | null>(null);
  const [showSensitiveFieldDetails, setShowSensitiveFieldDetails] = useState<SensitiveField | null>(null);

  // Use the useTranscript hook for the active scenario
  const transcript = useTranscript(selectedStateMachine);

  // Choose the appropriate state machine based on the mode
  const customerScenario = useCustomerScenario();
  const physioCoverage = usePhysioCoverageStateMachine();

  // Use the appropriate scenario based on the mode
  const activeScenario = isAgentMode ? customerScenario : physioCoverage;
  const {
    currentState,
    isLoading,
    error
  } = activeScenario;

  // Handle state selection from the visualizer
  const handleStateSelection = (state: string) => {
    console.log(`State selected in TestScenario: ${state}`);
    
    // If we have a valid state machine, update the current state
    if (loadedStateMachine && loadedStateMachine.states[state]) {
      setJsonContent(JSON.stringify(loadedStateMachine, null, 2));

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
  };

  // Close sensitive field details modal
  const handleCloseSensitiveDetails = () => {
    setShowSensitiveFieldDetails(null);
  };

  // Listen for scenario change events from the TranscriptPanel
  useEffect(() => {
    const handleScenarioChange = (event: CustomEvent) => {
      const newScenario = event.detail.scenario as ScenarioType;
      if (newScenario && newScenario !== selectedStateMachine) {
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
        try {
          // Clear messages immediately when a new state machine is selected
          transcript.resetConversation();
          
          const machine = await loadStateMachine(selectedStateMachine);
          setLoadedStateMachine(machine);

          // Also load the JSON content for display
          if (machine) {
            setJsonContent(JSON.stringify(machine, null, 2));
          }

          // Reset any active call when changing scenarios
          if (transcript.callActive) {
            transcript.handleHangUpCall();
          }
          
          // Automatically start a new call after selecting a new state machine
          setTimeout(() => {
            // Start a new call with the selected state machine
            transcript.handleCall();
            
            // Scroll to the transcript panel to show the new conversation
            scrollToTranscript();
          }, 300); // Short delay to ensure UI is updated
          
        } catch (error) {
          console.error("Failed to load state machine:", error);
        }
      }
    }
    fetchStateMachine();
  }, [selectedStateMachine, transcript]);
  
  // Function to scroll to the transcript panel
  const scrollToTranscript = () => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sidebar collapse toggle handler
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle view mode between JSON and visualization
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };

  return <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="grid gap-6">
              {/* Main content section with transcript panel as the main view */}
              {loadedStateMachine && <Card className="flex-1 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                      <CardTitle className="flex items-center gap-2">
                        Call Center Agent Simulator
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Directly embed the transcript panel without tabs */}
                    <div className="h-[75vh]" ref={transcriptRef}>
                      <TranscriptPanel activeScenario={selectedStateMachine} />
                    </div>
                  </CardContent>
                </Card>}

              {/* Display loading or error states */}
              {isLoading && <Card>
                  <CardContent className="py-4">
                    <p className="text-center">Loading state machine...</p>
                  </CardContent>
                </Card>}

              {error && <Card>
                  <CardContent className="py-4">
                    <p className="text-red-500">{error}</p>
                  </CardContent>
                </Card>}
              
              {!loadedStateMachine && !isLoading && !error && <Card>
                  <CardContent className="py-8 text-center">
                    <p>State machine is loading...</p>
                  </CardContent>
                </Card>}
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Dialog to display the JSON file and visualization - using Portal to ensure proper rendering */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background">
          <DialogHeader>
            <DialogTitle>
              {selectedStateMachine} State Machine
            </DialogTitle>
            <DialogDescription>
              {dialogViewMode === "json" 
                ? "Complete JSON representation of the state machine flow" 
                : "Visual representation of the state machine flow"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Button 
              variant={dialogViewMode === "json" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => handleViewModeToggle("json")}
              className="flex items-center gap-2"
            >
              <FileJson size={16} />
              JSON View
            </Button>
            <Button 
              variant={dialogViewMode === "visualization" ? "secondary" : "outline"} 
              size="sm"
              onClick={() => handleViewModeToggle("visualization")}
              className="flex items-center gap-2"
            >
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
                <Badge 
                  variant={showSensitiveFieldDetails.status === 'valid' ? 'default' : 
                          showSensitiveFieldDetails.status === 'invalid' ? 'destructive' : 
                          'outline'}
                >
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
    </div>;
};
export default TestScenario;
