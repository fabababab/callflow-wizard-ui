
// Hook for conversation initialization - now uses smaller focused hooks
import { useCallAcceptance } from '@/hooks/useCallAcceptance';
import { useCallInitialization } from '@/hooks/useCallInitialization';
import { useCallTermination } from '@/hooks/useCallTermination';
import { useConversationReset } from '@/hooks/useConversationReset';
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

export function useConversationInitializer(props: ConversationInitializerProps) {
  const { 
    activeScenario,
    conversationState,
    stateMachine,
    messageHandling,
    callState,
    setHasInitializedConversation,
    toast,
    showNachbearbeitungSummary
  } = props;

  // Use the smaller focused hooks
  const { handleAcceptCall } = useCallAcceptance({
    activeScenario,
    callState,
    toast
  });
  
  const { handleCall } = useCallInitialization({
    activeScenario,
    conversationState,
    stateMachine,
    messageHandling,
    callState,
    setHasInitializedConversation,
    toast
  });
  
  const { handleHangUpCall } = useCallTermination({
    callState,
    stateMachine,
    messageHandling,
    conversationState,
    showNachbearbeitungSummary,
    toast
  });
  
  const { resetConversation } = useConversationReset({
    callState,
    conversationState,
    messageHandling,
    stateMachine,
    setHasInitializedConversation,
    toast
  });

  return {
    handleCall,
    handleAcceptCall,
    handleHangUpCall,
    resetConversation
  };
}
