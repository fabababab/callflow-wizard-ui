// Primary transcript hook - composes all other hooks for managing the transcript
import { useState, useRef, useCallback, useEffect } from 'react';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { useConversationState } from '@/hooks/useConversationState';
import { useConversationInitializer } from '@/hooks/useConversationInitializer';
import { useResponseHandler } from '@/hooks/useResponseHandler';
import { useStateMachine } from '@/hooks/useStateMachine';
import { ScenarioType, scenarioData } from '@/components/ScenarioSelector';
import { ModuleConfig } from '@/types/modules';
import { useNotifications } from '@/contexts/NotificationsContext';

export function useTranscriptCore(activeScenario: ScenarioType) {
  // Initialize state for call and conversation
  const [callActive, setCallActive] = useState(false);
  const [hasInitializedConversation, setHasInitializedConversation] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleConfig | null>(null);
  const [moduleResult, setModuleResult] = useState<any>(null);
  const [stateData, setStateData] = useState<any>(null);
  const [currentState, setCurrentState] = useState<string>('');
  const { addNotification } = useNotifications();
  
  // Initialize refs
  const nachbearbeitungSummaryRef = useRef<HTMLDialogElement>(null);
  const stateMachineRef = useRef<any>(null);
  
  // Initialize smaller focused hooks
  const callState = { callActive, setCallActive };
  const {
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate,
    messagesEndRef,
    addMessage,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    handleInlineModuleComplete,
    setVerificationBlocking: setMessageVerificationBlocking,
    scanSensitiveFields,
    resetSensitiveDataStats
  } = useMessageHandling();
  
  const conversationState = useConversationState();
  const stateMachine = useStateMachine(activeScenario, {
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage,
    setActiveModule,
    setModuleResult,
    setStateData,
    setCurrentState
  });
  
  const conversationInitializer = useConversationInitializer({
    activeScenario,
    conversationState,
    stateMachine,
    messageHandling: {
      addSystemMessage,
      clearMessages
    },
    callState,
    setHasInitializedConversation,
    showNachbearbeitungSummary
  });
  
  const responseHandler = useResponseHandler({
    stateMachine,
    messageHandling: {
      addAgentMessage
    },
    conversationState
  });
  
  // Load state machine on scenario change
  useEffect(() => {
    stateMachine.loadStateMachine(activeScenario);
  }, [activeScenario, stateMachine]);
  
  // Reset conversation state on scenario change
  useEffect(() => {
    conversationInitializer.resetConversation();
  }, [activeScenario, conversationInitializer]);
  
  // Function to show the Nachbearbeitung summary
  const showNachbearbeitungSummary = (state?: string) => {
    if (nachbearbeitungSummaryRef.current) {
      console.log("Showing Nachbearbeitung summary");
      addSystemMessage(`Call completed in state: ${state || stateMachine.currentState}. Please complete after-call work.`);
      nachbearbeitungSummaryRef.current.showModal();
    } else {
      console.warn("Nachbearbeitung summary ref not available");
      addNotification({
        title: "Nachbearbeitung Unavailable",
        description: "The after-call summary is not available at this time.",
        type: "warning"
      });
    }
  };
  
  // Function to complete a module
  const completeModule = useCallback((result: any) => {
    console.log('Module completed with result:', result);
    setModuleResult(result);
    setActiveModule(null);
    
    // Add a system message indicating the module is complete
    addSystemMessage(`Module completed with result: ${JSON.stringify(result)}`);
    
    // Dispatch custom event for module completion
    const event = new CustomEvent('module-complete', {
      detail: { result }
    });
    window.dispatchEvent(event);
    
    // Optionally transition to the next state based on the module result
    if (result?.nextState) {
      console.log(`Transitioning to next state: ${result.nextState}`);
      stateMachine.transition(result.nextState);
    }
  }, [setModuleResult, setActiveModule, addSystemMessage, stateMachine]);
  
  // Handle module completion
  const handleModuleComplete = useCallback((result: Record<string, unknown>) => {
    console.log('Module completed with result:', result);
    completeModule(result);
  }, [completeModule]);
  
  // Handle call functionality
  const handleCall = () => {
    console.log("Starting call");
    conversationInitializer.handleCall();
  };
  
  // Handle hang up call functionality
  const handleHangUpCall = () => {
    console.log("Hanging up call");
    conversationInitializer.handleHangUpCall();
  };
  
  // Reset conversation
  const resetConversation = () => {
    console.log("Resetting conversation");
    conversationInitializer.resetConversation();
  };
  
  return {
    // State and refs
    callActive,
    setCallActive,
    hasInitializedConversation,
    setHasInitializedConversation,
    activeModule,
    setActiveModule,
    moduleResult,
    setModuleResult,
    stateData,
    setStateData,
    currentState,
    setCurrentState,
    messagesEndRef,
    nachbearbeitungSummaryRef,
    stateMachineRef,
    
    // Message handling
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate,
    addMessage,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    handleInlineModuleComplete,
    setMessageVerificationBlocking,
    scanSensitiveFields,
    resetSensitiveDataStats,
    
    // Conversation control
    handleCall,
    handleHangUpCall,
    resetConversation,
    handleSelectResponse: responseHandler.handleSelectResponse,
    
    // Module handling
    completeModule,
    handleModuleComplete,
    
    // State machine
    stateMachine: stateMachine.stateMachine,
    loadStateMachine: stateMachine.loadStateMachine
  };
}

// Internal hook for managing state machine
function useStateMachine(activeScenario: ScenarioType, actions: any) {
  const stateMachineRef = useRef<any>(null);
  const [stateData, setStateData] = useState<any>(null);
  const [currentState, setCurrentState] = useState<string>('');
  
  const loadStateMachine = useCallback((scenario: ScenarioType) => {
    console.log(`Loading state machine for scenario: ${scenario}`);
    const scenarioConfig = scenarioData[scenario];
    if (!scenarioConfig) {
      console.error(`No scenario data found for scenario: ${scenario}`);
      return;
    }
    
    stateMachineRef.current = new StateMachine(scenarioConfig.initialState, scenarioConfig.states, actions);
    
    // Initialize the state machine
    stateMachineRef.current.initialize();
    
    // Set initial state data
    setStateData(stateMachineRef.current.stateData);
    setCurrentState(stateMachineRef.current.currentState);
  }, [actions]);
  
  const transition = useCallback((newState: string) => {
    console.log(`Transitioning to state: ${newState}`);
    if (!stateMachineRef.current) {
      console.error("State machine not initialized");
      return;
    }
    
    stateMachineRef.current.transition(newState);
    setStateData(stateMachineRef.current.stateData);
    setCurrentState(stateMachineRef.current.currentState);
  }, []);
  
  return {
    stateMachine: stateMachineRef.current,
    loadStateMachine,
    transition,
    stateData,
    currentState
  };
}
