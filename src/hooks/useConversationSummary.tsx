
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useConversationSummary() {
  // Generate conversation summary based on scenario
  const generateSummary = useCallback((scenario: ScenarioType): string => {
    switch(scenario) {
      case 'studiumabschlussCase':
        return "Customer called to update their insurance package after graduating from university. The agent explained the available options, recommended suitable packages based on the customer's new situation, and processed the change to ensure continuity of coverage.";
      
      case 'leistungsabdeckungPhysio':
        return "Customer inquired about physiotherapy treatment coverage. The agent verified the insurance policy details, confirmed the coverage limitations, and provided information about the reimbursement process and documentation required.";
      
      case 'mahnungTrotzZahlung':
        return "Customer called regarding a payment reminder received despite having made the payment. The agent verified the payment details, confirmed the receipt in the system, and arranged for the reminder notice to be cancelled with an apology.";
      
      default:
        return "No conversation summary available for this scenario. Please select a different scenario or start a conversation to generate a summary.";
    }
  }, []);
  
  return { generateSummary };
}
