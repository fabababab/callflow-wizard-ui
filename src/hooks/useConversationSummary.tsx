
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useConversationSummary() {
  // Generate conversation summary based on scenario
  const generateSummary = useCallback((scenario: ScenarioType): string => {
    switch(scenario) {
      case 'testscenario':
        return "Customer called for a general inquiry about the system functionality. The agent verified the customer's identity and provided basic information about the service.";
      
      case 'verificationFlow':
        return "Customer received a security alert about unauthorized login attempt. The agent verified the customer's identity, confirmed the suspicious activity, and helped secure the account by changing the password and enabling two-factor authentication.";
      
      case 'contractManagement':
        return "Customer needed to review and update their service contracts. After verifying the customer's identity, the agent displayed all active contracts, explained the terms, and processed the requested modifications while confirming the changes would be effective before the next billing cycle.";
      
      case 'productInfo':
        return "Customer inquired about details of premium product offerings. The agent provided comprehensive information about product features, pricing options, and answered specific questions about compatibility, comparing different models to help the customer make an informed decision.";
      
      default:
        return "No conversation summary available for this scenario. Please select a different scenario or start a conversation to generate a summary.";
    }
  }, []);
  
  return { generateSummary };
}
