
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StateMachineState } from '@/utils/stateMachineLoader';

export function useStateChangeProcessor(
  messageHandling: any,
  conversationState: any,
  scenarioType: string
) {
  const { toast } = useToast();

  /**
   * Process a new state in the conversation
   */
  const processNewState = useCallback((
    stateData: StateMachineState | null,
    currentState: string,
    scenario: string
  ) => {
    if (!stateData) {
      console.warn(`No state data found for state: ${currentState}`);
      toast({
        title: "Fehlende Statusdaten",
        description: `Keine Daten für Status '${currentState}' gefunden.`,
        variant: "destructive",
      });
      return;
    }

    console.log(`Processing new state: ${currentState}`, stateData);
    
    // Extract meta information
    const agentText = stateData.meta?.agentText;
    const systemMessage = stateData.meta?.systemMessage;
    const customerText = stateData.meta?.customerText;
    const responseOptions = stateData.meta?.responseOptions;
    const suggestions = stateData.meta?.suggestions;
    const sensitiveFields = stateData.meta?.sensitiveFields;
    const moduleConfig = stateData.meta?.module;

    // Determine special scenario handling
    const isPhysioScenario = scenario === 'leistungsabdeckungPhysio';
    
    // Add system message if available
    if (systemMessage) {
      messageHandling.addSystemMessage(systemMessage);
    }

    // Add agent message if available
    if (agentText) {
      // For physio scenario, don't include response options with agent messages
      messageHandling.addAgentMessage(
        agentText,
        suggestions || [],
        isPhysioScenario ? undefined : responseOptions
      );
    }

    // Add customer message if available (only for specific states in special scenarios)
    if (customerText) {
      // When adding customer text in physio scenario, include response options there
      messageHandling.addCustomerMessage(
        customerText,
        sensitiveFields,
        isPhysioScenario ? responseOptions : undefined
      );
    }

    // Add inline module if available
    if (moduleConfig) {
      const isInline = moduleConfig.data?.isInline === true;
      
      if (isInline) {
        messageHandling.addInlineModuleMessage(
          `Modul "${moduleConfig.title}" wird angezeigt...`,
          moduleConfig
        );
      }
    }

    // Update conversation state
    conversationState.setAwaitingUserResponse(true);
    conversationState.setIsInitialStateProcessed(true);
    
  }, [messageHandling, toast, conversationState]);

  // Function to be called from useStateChangeEffect
  const processStateChange = useCallback((
    stateData: StateMachineState | null,
    currentState: string
  ) => {
    console.log(`Processing state change for state: ${currentState}`);
    // Call processNewState with the current data
    if (stateData && currentState) {
      processNewState(stateData, currentState, scenarioType);
    }
  }, [processNewState, scenarioType]);

  return {
    processNewState,
    processStateChange
  };
}
