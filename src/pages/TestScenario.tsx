import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePhysioCoverageStateMachine } from '@/hooks/usePhysioCoverageStateMachine';
import { useCustomerScenario } from '@/hooks/useCustomerScenario';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscript } from '@/hooks/useTranscript';
import TranscriptPanel from '@/components/TranscriptPanel'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, LayoutDashboard } from 'lucide-react';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { Button } from '@/components/ui/button';

const TestScenario = () => {
  const [isAgentMode, setIsAgentMode] = useState(true); // Default to agent mode (you responding as agent)
  const [showJsonDialog, setShowJsonDialog] = useState(false); // Make sure this is initialized as false
  const [selectedStateMachine, setSelectedStateMachine] = useState<ScenarioType>("testscenario");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Initialize sidebar as collapsed
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");

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
      
      // Update dialog view mode to show the visualization with this state
      setDialogViewMode("visualization");
    }
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default TestScenario;
