// Primary transcript hook - composes all other hooks for managing the transcript
import { useState, useRef, useCallback, useEffect } from 'react';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { useConversationState } from '@/hooks/useConversationState';
import { useConversationInitializer } from '@/hooks/useConversationInitializer';
import { useResponseHandler } from '@/hooks/useResponseHandler';
// Import StateMachine type from utils to avoid name conflict
import { StateMachine as StateMachineType } from '@/utils/stateMachineLoader';
import { ScenarioType, scenarioCallData } from '@/components/ScenarioSelector';
import { ModuleConfig } from '@/types/modules';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useToast } from '@/hooks/use-toast';

// Define a more specific type for actions if possible, or use Record<string, Function>
interface StateMachineActions {
  addSystemMessage: (text: string, options?: { responseOptions?: string[] }) => void;
  addAgentMessage: (text: string) => void;
  addCustomerMessage: (text: string, options?: { highlightSensitiveData?: boolean }) => void;
  addInlineModuleMessage: (text: string, inlineModule: ModuleConfig) => void;
  setActiveModule: (module: ModuleConfig | null) => void;
  setModuleResult: (result: any) => void; // Kept as any for now
  setStateData: (data: Record<string, any> | null) => void; // Changed to Record<string, any> | null
  setCurrentState: (state: string) => void;
}

export function useTranscriptCore(initialStateMachine: StateMachineType | null) {
  const [callActive, setCallActive] = useState(false);
  const [hasInitializedConversation, setHasInitializedConversation] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleConfig | null>(null);
  const [moduleResult, setModuleResult] = useState<any>(null); // Kept as any
  const [stateData, setStateData] = useState<Record<string, any> | null>(null); // Changed to Record<string, any> | null
  const [currentState, setCurrentState] = useState<string>('');
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const { addNotification } = useNotifications();
  const toastAPI = useToast();
  
  const nachbearbeitungSummaryRef = useRef<HTMLDialogElement>(null);
  // const messagesEndRef = useRef<HTMLDivElement>(null); // This is returned by useMessageHandling
  // const stateMachineRef = useRef<StateMachineType | null>(null); // No longer needed directly here
  
  // Initialize messageHandling first as it doesn't depend on stateMachineHook
  const {
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate: messageHookLastUpdate,
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

  // Now initialize stateMachineHook as showNachbearbeitungSummary depends on it
  const stateMachineHook = useStateMachineInternal(initialStateMachine, {
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    addInlineModuleMessage,
    setActiveModule,
    setModuleResult,
    setStateData: (data) => setStateData(data),
    setCurrentState: (state) => setCurrentState(state)
  });
  
  // showNachbearbeitungSummary can now safely access stateMachineHook.currentState
  const showNachbearbeitungSummary = useCallback((finalState?: string) => {
    if (nachbearbeitungSummaryRef.current) {
      console.log("Showing Nachbearbeitung summary");
      const displayState = finalState || stateMachineHook.currentState || "unknown";
      addSystemMessage(`Call completed in state: ${displayState}. Please complete after-call work.`);
      nachbearbeitungSummaryRef.current.showModal();
    } else {
      console.warn("Nachbearbeitung summary ref not available");
      addNotification({
        title: "Nachbearbeitung Unavailable",
        description: "The after-call summary is not available at this time.",
        type: "warning"
      });
    }
  }, [addNotification, nachbearbeitungSummaryRef, stateMachineHook.currentState, addSystemMessage]);
  
  const callState = { callActive, setCallActive };
  const conversationState = useConversationState();
  const scenarioIdForInitializer = initialStateMachine?.id as ScenarioType | undefined;

  const conversationInitializer = useConversationInitializer({
    activeScenario: scenarioIdForInitializer, 
    conversationState,
    stateMachine: stateMachineHook.stateMachineInstance,
    messageHandling: {
      addSystemMessage,
      clearMessages
    },
    callState,
    setHasInitializedConversation,
    showNachbearbeitungSummary,
    toast: toastAPI,
  });
  
  const responseHandler = useResponseHandler({
    stateMachine: stateMachineHook.stateMachineInstance,
    messageHandling: {
      addAgentMessage
    },
    conversationState
  });
  
  useEffect(() => {
    if (scenarioIdForInitializer) {
      conversationInitializer.resetConversation();
    }
  }, [scenarioIdForInitializer, conversationInitializer]);
  
  const completeModule = useCallback((result: any) => { 
    console.log('Module completed with result:', result);
    setModuleResult(result);
    setActiveModule(null);
    addSystemMessage(`Module completed with result: ${JSON.stringify(result)}`);
    const event = new CustomEvent('module-complete', {
      detail: { result }
    });
    window.dispatchEvent(event);
    if (result?.nextState) {
      console.log(`Transitioning to next state: ${result.nextState}`);
      stateMachineHook.transitionTo(result.nextState);
    }
  }, [setModuleResult, setActiveModule, addSystemMessage, stateMachineHook]);
  
  const handleModuleComplete = useCallback((result: Record<string, unknown>) => {
    console.log('Module completed with result:', result);
    completeModule(result);
  }, [completeModule]);
  
  const handleCall = () => {
    console.log("Starting call");
    conversationInitializer.handleCall();
  };
  
  const handleHangUpCall = () => {
    console.log("Hanging up call");
    conversationInitializer.handleHangUpCall();
  };
  
  const resetConversation = () => {
    console.log("Resetting conversation");
    if (scenarioIdForInitializer) { 
        conversationInitializer.resetConversation();
    }
  };

  useEffect(() => {
    if (messageHookLastUpdate) {
      console.log("Message update detected, updating transcript:", messageHookLastUpdate);
      setLastTranscriptUpdate(new Date());
    }
  }, [messageHookLastUpdate]);
  
  useEffect(() => {
    if (stateMachineHook.stateData) {
      setStateData(stateMachineHook.stateData);
    }
  }, [stateMachineHook.stateData]);

  useEffect(() => {
    if (stateMachineHook.currentState) {
      setCurrentState(stateMachineHook.currentState);
    }
  }, [stateMachineHook.currentState]);
  
  return {
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
    messagesEndRef, // Return from useMessageHandling
    nachbearbeitungSummaryRef,
    // stateMachineRef, // No longer directly returned
    lastTranscriptUpdate,
    
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate: messageHookLastUpdate, // Return renamed variable
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
    
    handleCall,
    handleHangUpCall,
    resetConversation,
    handleSelectResponse: responseHandler.handleSelectResponse,
    
    completeModule,
    handleModuleComplete,
    
    stateMachine: stateMachineHook.stateMachineInstance,
    loadStateMachine: stateMachineHook.loadStateMachine,
    transitionTo: stateMachineHook.transitionTo,
  };
}

function useStateMachineInternal(initialStateMachine: StateMachineType | null, actions: StateMachineActions) {
  const stateMachineInstanceRef = useRef<StateMachineType | null>(null); 
  const [currentInternalStateData, setCurrentInternalStateData] = useState<Record<string, any> | null>(null); 
  const [currentInternalStateName, setCurrentInternalStateName] = useState<string>('');

  const initializeOrUpdateStateMachine = useCallback((sm: StateMachineType | null) => {
    if (!sm || !sm.initial || !sm.states) {
      console.warn("useStateMachineInternal: Provided state machine is null or invalid.");
      stateMachineInstanceRef.current = null;
      setCurrentInternalStateData(null);
      setCurrentInternalStateName('');
      actions.setStateData(null);
      actions.setCurrentState('');
      return;
    }
    console.log(`useStateMachineInternal: Initializing/Updating state machine with ID: ${sm.id}`);
    stateMachineInstanceRef.current = sm;
    
    const initialStateName = sm.initial;
    const initialStateData = sm.states[initialStateName]?.meta; 

    if (initialStateName && typeof initialStateData === 'object' && initialStateData !== null) {
      setCurrentInternalStateName(initialStateName);
      setCurrentInternalStateData(initialStateData);
      actions.setCurrentState(initialStateName);
      actions.setStateData(initialStateData);
    } else {
      console.error(`useStateMachineInternal: Could not find initial state '${initialStateName}' or its data (must be an object) in the provided state machine.`);
      setCurrentInternalStateName('');
      setCurrentInternalStateData(null);
      actions.setCurrentState('');
      actions.setStateData(null);
    }
  }, [actions]);

  useEffect(() => {
    initializeOrUpdateStateMachine(initialStateMachine);
  }, [initialStateMachine, initializeOrUpdateStateMachine]);

  const transitionTo = useCallback((newStateName: string) => {
    if (!stateMachineInstanceRef.current || !stateMachineInstanceRef.current.states) {
      console.error("useStateMachineInternal: State machine not initialized or has no states.");
      return;
    }
    const sm = stateMachineInstanceRef.current;
    if (!sm.states[newStateName]) {
      console.error(`useStateMachineInternal: Invalid state to transition to: ${newStateName}`);
      return;
    }
    console.log(`useStateMachineInternal: Transitioning to state: ${newStateName}`);
    const newStateData = sm.states[newStateName].meta; 
    setCurrentInternalStateName(newStateName);
    
    if (typeof newStateData === 'object' && newStateData !== null) {
      setCurrentInternalStateData(newStateData);
      actions.setStateData(newStateData);
    } else {
      console.warn(`useStateMachineInternal: Meta data for state '${newStateName}' is not an object or is null. Setting state data to null.`);
      setCurrentInternalStateData(null);
      actions.setStateData(null);
    }
    actions.setCurrentState(newStateName);

  }, [actions]);
  
  return {
    stateMachineInstance: stateMachineInstanceRef.current,
    loadStateMachine: initializeOrUpdateStateMachine,
    transitionTo,
    stateData: currentInternalStateData,
    currentState: currentInternalStateName
  };
}
