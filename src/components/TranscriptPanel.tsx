
import React, { useEffect, useState } from 'react';
import { useTranscript } from '@/hooks/useTranscript';
import { ScenarioType } from '@/components/ScenarioSelector';
import { Button } from '@/components/ui/button';
import { Shield, Phone, PhoneOff, RefreshCw, FileJson, AlignLeft, Layers } from 'lucide-react';
import ChatMessages from '@/components/TestScenario/ChatMessages';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenarioSelector from './ScenarioSelector';
import ModuleContainer from '@/components/modules/ModuleContainer';
import { useConversationSummary } from '@/hooks/useConversationSummary';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  activeScenario
}) => {
  // Use the transcript hook with the active scenario
  const transcript = useTranscript(activeScenario);
  const { generateSummary } = useConversationSummary();
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [conversationSummary, setConversationSummary] = useState<string>("");

  // Update summary when scenario changes
  useEffect(() => {
    setConversationSummary(generateSummary(activeScenario));
  }, [activeScenario, generateSummary]);

  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    if (transcript.messagesEndRef.current && activeTab === "chat") {
      transcript.messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [transcript.lastTranscriptUpdate, activeTab]);

  // Function to handle scenario changes
  const handleScenarioChange = (newScenario: ScenarioType) => {
    if (activeScenario !== newScenario) {
      // Dispatch custom event for scenario change
      const event = new CustomEvent('scenario-change', {
        detail: {
          scenario: newScenario
        }
      });
      window.dispatchEvent(event);
      // Update conversation summary
      setConversationSummary(generateSummary(newScenario));
    }
  };

  // Handle module completion
  const handleModuleComplete = (result: any) => {
    console.log('Module completed with result:', result);
    transcript.handleModuleComplete(result);
  };

  // Updated to correctly handle inline module completion
  const handleInlineModuleComplete = (messageId: string, moduleId: string, result: any) => {
    transcript.handleInlineModuleComplete(messageId, moduleId, result);
  };

  // Toggle JSON dialog visibility
  const toggleJsonDialog = () => {
    setShowJsonDialog(!showJsonDialog);

    // Dispatch event for JSON visualization
    const event = new CustomEvent('toggle-json-visualization', {
      detail: {
        visible: !showJsonDialog
      }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Scenario selector */}
            <ScenarioSelector activeScenario={activeScenario} onSelectScenario={handleScenarioChange} />
            
            {/* Reset button */}
            <Button variant="outline" size="icon" onClick={transcript.resetConversation} title="Reset conversation">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* JSON button */}
            <Button variant="outline" size="sm" onClick={toggleJsonDialog} className="flex items-center gap-1">
              <FileJson className="h-4 w-4 mr-1" />
              JSON
            </Button>
            
            {/* Call button - now positioned at the same level as scenario selector */}
            <Button 
              size="sm" 
              variant={transcript.callActive ? "destructive" : "default"}
              onClick={transcript.handleCall}
              className="min-w-[100px]"
            >
              {transcript.callActive ? 
                <>
                  <PhoneOff className="h-3.5 w-3.5 mr-1" /> End Call
                </> : 
                <>
                  <Phone className="h-3.5 w-3.5 mr-1" /> Start Call
                </>
              }
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span>Chat View</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <AlignLeft className="h-4 w-4" />
              <span>Text Summary</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-grow overflow-auto p-0 m-0">
          <ScrollArea className="flex-grow p-4">
            {/* Verification banner */}
            {transcript.verificationBlocking && 
              <Card className="mb-4 bg-amber-50 border border-amber-200 shadow-sm">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Shield size={16} />
                    <span className="text-sm font-medium">Verification required to continue</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs bg-white" 
                    onClick={() => transcript.handleVerifySystemCheck('system')}
                  >
                    Verify Identity
                  </Button>
                </div>
              </Card>
            }
            
            {/* Chat messages */}
            <ChatMessages 
              messages={transcript.messages} 
              isAgentMode={true} 
              onSelectResponse={transcript.handleSelectResponse} 
              onVerifySystemCheck={transcript.handleVerifySystemCheck} 
              onValidateSensitiveData={transcript.handleValidateSensitiveData} 
              messagesEndRef={transcript.messagesEndRef} 
              onModuleComplete={handleInlineModuleComplete} 
            />
            
            {/* Empty state */}
            {transcript.messages.length === 0 && !transcript.callActive && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Phone className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Active Call</h3>
                <p className="text-sm text-muted-foreground/70 max-w-xs mb-6">
                  Click the "Start Call" button to begin a conversation with the virtual customer
                </p>
                <Button 
                  onClick={transcript.handleCall}
                  className="gap-2"
                >
                  <Phone className="h-4 w-4" /> Start Call
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="summary" className="flex-grow overflow-auto p-4 m-0">
          <Card className="border shadow-sm">
            <div className="p-5">
              <h2 className="text-lg font-semibold mb-4">Conversation Summary</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-muted/50">{activeScenario}</Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {transcript.callActive ? "Active Call" : "Completed Call"}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line">{conversationSummary}</p>
                </div>
                
                {transcript.callActive && (
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm text-amber-700">
                    Call is currently in progress. Summary will be updated when the call ends.
                  </div>
                )}
                
                {!transcript.callActive && transcript.messages.length > 0 && (
                  <div className="pt-3 border-t">
                    <h3 className="text-sm font-semibold mb-2">Key Points:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Customer identity was successfully verified</li>
                      <li>Customer concern was addressed</li>
                      <li>Required information was provided</li>
                      <li>Next steps were clearly communicated</li>
                      <li>Follow-up actions were documented</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Footer status area */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between pb-2 gap-3">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              {transcript.callActive ? 
                <span className="flex items-center gap-1.5 text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium">Call Active</span>
                  <span className="text-xs text-gray-400 ml-1">{transcript.elapsedTime}</span>
                </span> : 
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span className="text-xs">No Active Call</span>
                </span>
              }
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {transcript.awaitingUserResponse && (
              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 animate-pulse">
                Awaiting your response
              </Badge>
            )}
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex justify-center pt-2">
          <span className="text-center text-xs text-gray-400">
            {transcript.awaitingUserResponse ? 
              "Customer is waiting for your response" : 
              transcript.callActive ? 
                "Waiting for customer input" :
                "Start a call to begin conversation"
            }
          </span>
        </div>
      </div>

      {/* Module container that will display active modules */}
      {transcript.activeModule && 
        <ModuleContainer 
          moduleConfig={transcript.activeModule} 
          onClose={transcript.closeModule} 
          onComplete={handleModuleComplete} 
          currentState={transcript.currentState} 
          stateData={transcript.stateData} 
        />
      }
    </div>
  );
};

export default TranscriptPanel;
