
// Hook for conversation initialization
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useToast } from '@/hooks/use-toast';

interface ConversationInitializerProps {
  activeScenario: ScenarioType;
  conversationState: any;
  stateMachine: any;
  messageHandling: any;
  callState: any;
  setHasInitializedConversation: (value: boolean) => void;
  toast: ReturnType<typeof useToast>;
  showNachbearbeitungSummary: () => void;
}

export function useConversationInitializer({
  activeScenario,
  conversationState,
  stateMachine,
  messageHandling,
  callState,
  setHasInitializedConversation,
  toast,
  showNachbearbeitungSummary
}: ConversationInitializerProps) {

  // Function to handle accepting a call
  const handleAcceptCall = useCallback(() => {
    if (!activeScenario) {
      toast({
        title: "No Scenario Selected",
        description: "Please select a scenario first.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    console.log('Accepting call for scenario:', activeScenario);
    callState.setCallActive(true);
  }, [activeScenario, callState, toast]);

  // Function to handle starting a call
  const handleCall = useCallback(() => {
    if (!activeScenario) {
      toast({
        title: "No Scenario Selected",
        description: "Please select a scenario first.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    console.log('===== CALL START PROCESS BEGIN =====');
    console.log('Starting call for scenario:', activeScenario);
    console.log('State machine status:', {
      currentState: stateMachine.currentState,
      hasStateMachine: !!stateMachine.stateMachine,
      stateDataExists: !!stateMachine.stateData
    });

    // Reset conversation state but don't clear messages
    conversationState.resetConversationState(false);
    
    // Set call as active
    callState.setCallActive(true);
    
    console.log('Initializing conversation...');
    
    // Add system message
    messageHandling.addSystemMessage(`Call started. Scenario: ${activeScenario}`);
    
    // Process start call - this triggers the state machine
    console.log('Attempting to process start call...');
    const success = stateMachine.processStartCall();
    console.log('Process start call result:', success);
    
    if (success) {
      console.log('State machine started successfully');
      console.log('New state:', stateMachine.currentState);
      console.log('State data:', stateMachine.stateData);
      
      // Set flags for initialization
      conversationState.setIsInitialStateProcessed(true);
      setHasInitializedConversation(true);
      
      // Update last transcript update time
      conversationState.setLastTranscriptUpdate(new Date());
    } else {
      console.error('Failed to start state machine - trying to process START_CALL event manually');
      
      // Try manual processing
      const manualSuccess = stateMachine.processSelection('START_CALL');
      console.log('Manual start result:', manualSuccess);
      
      if (manualSuccess) {
        console.log('Manual start successful');
        console.log('New state:', stateMachine.currentState);
        console.log('State data:', stateMachine.stateData);
        
        // Set flags for initialization
        conversationState.setIsInitialStateProcessed(true);
        setHasInitializedConversation(true);
        
        // Update last transcript update time
        conversationState.setLastTranscriptUpdate(new Date());
      } else {
        console.error('Failed to start state machine both ways');
        console.error('Current state machine:', stateMachine.stateMachine);
        
        // Show error toast
        toast({
          title: "Failed to Start Call",
          description: "There was an error initializing the conversation.",
          variant: "destructive",
          duration: 3000
        });
        
        callState.setCallActive(false);
      }
    }
    
    console.log('===== CALL START PROCESS END =====');
  }, [activeScenario, callState, conversationState, messageHandling, stateMachine, toast, setHasInitializedConversation]);

  // Function to handle hanging up a call
  const handleHangUpCall = useCallback(() => {
    console.log('Hanging up call...');
    
    // Set call as inactive
    callState.setCallActive(false);
    
    // Reset state machine
    stateMachine.resetStateMachine();
    
    // Add system message
    messageHandling.addSystemMessage('Call ended.');
    
    // Reset conversation state tracking but don't clear messages
    conversationState.resetConversationState(false);
    
    // Show summary screen
    if (conversationState.showNachbearbeitungModule) {
      console.log('Showing Nachbearbeitung summary...');
      showNachbearbeitungSummary();
    } else {
      toast({
        title: "Call Ended",
        description: "The call has been ended successfully.",
        duration: 3000
      });
    }
  }, [callState, stateMachine, messageHandling, conversationState, showNachbearbeitungSummary, toast]);

  // Function to reset the conversation
  const resetConversation = useCallback(() => {
    console.log('Resetting conversation...');
    
    // First check if call is active
    if (callState.callActive) {
      // End call first
      callState.setCallActive(false);
      messageHandling.addSystemMessage('Call ended.');
    }
    
    // Reset state machine
    stateMachine.resetStateMachine();
    
    // Reset conversation state including messages
    conversationState.resetConversationState(true);
    
    // Clear messages
    messageHandling.clearMessages();
    
    // Add reset message
    messageHandling.addSystemMessage('Conversation reset. Ready to start a new call.');
    
    // Update last transcript update time
    conversationState.setLastTranscriptUpdate(new Date());
    
    // Set flag for initialization
    setHasInitializedConversation(false);
    
    // Show toast
    toast({
      title: "Conversation Reset",
      description: "The conversation has been reset. Ready to start a new call.",
      duration: 3000
    });
  }, [callState, conversationState, messageHandling, stateMachine, toast, setHasInitializedConversation]);

  return {
    handleCall,
    handleAcceptCall,
    handleHangUpCall,
    resetConversation
  };
}
