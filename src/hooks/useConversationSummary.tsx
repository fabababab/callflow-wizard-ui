
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useConversationSummary() {
  // Generate conversation summary based on scenario
  const generateSummary = useCallback((scenario: ScenarioType): string => {
    switch(scenario) {
      case 'testscenario':
        return "Customer called for a general inquiry about the system functionality. The agent verified the customer's identity and provided basic information about the service.";
      
      case 'verificationFlow':
      case 'verification':
        return "Customer received a security alert about unauthorized login attempt. The agent verified the customer's identity, confirmed the suspicious activity, and helped secure the account by changing the password and enabling two-factor authentication.";
      
      case 'contractManagement':
      case 'bankDetails':
        return "Customer needed to review and update their service contracts. After verifying the customer's identity, the agent displayed all active contracts, explained the terms, and processed the requested modifications while confirming the changes would be effective before the next billing cycle.";
      
      case 'productInfo':
      case 'accountHistory':
        return "Customer inquired about details of premium product offerings. The agent provided comprehensive information about product features, pricing options, and answered specific questions about compatibility, comparing different models to help the customer make an informed decision.";
      
      case 'physioTherapy':
        return "Customer inquired about physiotherapy treatment coverage. The agent verified the insurance policy details, confirmed the coverage limitations, and provided information about the reimbursement process and documentation required.";
      
      case 'paymentReminder':
        return "Customer called regarding a payment reminder received despite having made the payment. The agent verified the payment details, confirmed the receipt in the system, and arranged for the reminder notice to be cancelled with an apology.";
      
      case 'insurancePackage':
        return "Customer called to update their insurance package after graduating from university. The agent explained the available options, recommended suitable packages based on the customer's new situation, and processed the change to ensure continuity of coverage.";
      
      default:
        return "No conversation summary available for this scenario. Please select a different scenario or start a conversation to generate a summary.";
    }
  }, []);
  
  return { generateSummary };
}
