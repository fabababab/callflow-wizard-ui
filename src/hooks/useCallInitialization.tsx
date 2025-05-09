
// Hook for call initialization
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useToast } from '@/hooks/use-toast';

interface CallInitializationProps {
  activeScenario: ScenarioType;
  conversationState: any;
  stateMachine: any;
  messageHandling: any;
  callState: any;
  setHasInitializedConversation: (value: boolean) => void;
  toast: ReturnType<typeof useToast>;
}

export function useCallInitialization({
  activeScenario,
  conversationState,
  stateMachine,
  messageHandling,
  callState,
  setHasInitializedConversation,
  toast
}: CallInitializationProps) {
  
  // Function to handle starting a call
  const handleCall = useCallback(() => {
    if (!activeScenario) {
      toast.toast({
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
    
    // Set call as active - IMPORTANT - Use direct setter
    callState.setCallActive(true);
    
    console.log('Initializing conversation...');
    console.log('Current state machine:', stateMachine.stateMachine);
    
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
      
      // Force state change processing
      setTimeout(() => {
        console.log('Forcing state change processing...');
        if (stateMachine.currentState && stateMachine.stateData) {
          const stateToProcess = stateMachine.currentState;
          console.log(`Processing state: ${stateToProcess}`);
          conversationState.markStateAsProcessed(stateToProcess);
        }
      }, 500);
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
        
        // Force state change processing
        setTimeout(() => {
          console.log('Forcing state change processing after manual start...');
          if (stateMachine.currentState && stateMachine.stateData) {
            const stateToProcess = stateMachine.currentState;
            console.log(`Processing state: ${stateToProcess}`);
            conversationState.markStateAsProcessed(stateToProcess);
          }
        }, 500);
      } else {
        console.error('Failed to start state machine both ways');
        console.error('Current state machine:', stateMachine.stateMachine);
        
        // Show error toast
        toast.toast({
          title: "Failed to Start Call",
          description: "There was an error initializing the conversation.",
          variant: "destructive",
          duration: 3000
        });
        
        callState.setCallActive(false); // Use direct setter
      }
    }
    
    console.log('===== CALL START PROCESS END =====');
  }, [activeScenario, callState, conversationState, messageHandling, stateMachine, toast, setHasInitializedConversation]);

  return {
    handleCall
  };
}
