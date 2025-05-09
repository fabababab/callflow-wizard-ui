
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useConversationSummary() {
  // Generate conversation summary based on scenario
  const generateSummary = useCallback((scenario: ScenarioType): string => {
    switch(scenario) {
      case 'testscenario':
        return "Customer called for a general inquiry about the system functionality. The agent verified the customer's identity and provided basic information about the service.";
      
      case 'scenario2':
        return "Customer was experiencing problems upgrading their internet package through the website. The agent guided them through the process, identified a technical issue with the checkout, and successfully helped complete the upgrade.";
      
      case 'verification':
        return "Customer received a security alert about unauthorized login attempt. The agent verified the customer's identity, confirmed the suspicious activity, and helped secure the account by changing the password and enabling two-factor authentication.";
      
      case 'bankDetails':
        return "Customer needed to update their bank details after changing banks. After verifying the customer's identity, the agent collected and updated the new bank information and confirmed the changes would be effective before the next payment cycle.";
      
      case 'accountHistory':
        return "Customer noticed unusual transactions on their account statement. The agent verified the customer's identity, reviewed the account history, identified three unauthorized charges, and initiated the dispute process while arranging for a new card to be issued.";
      
      case 'physioTherapy':
        return "Customer inquired about coverage for physiotherapy after receiving a prescription for 10 sessions. The agent verified the insurance coverage, confirmed all sessions were covered under their plan, and explained the process for submitting claims after treatment.";
      
      case 'paymentReminder':
        return "Customer received a payment reminder despite having already made payment. The agent located the payment in the system, confirmed it was processed after the reminder was automatically generated, and removed the late payment fee from the account.";
      
      case 'insurancePackage':
        return "Customer is graduating from studies and needed to update their insurance package. The agent reviewed available options for young professionals, recommended a comprehensive package with dental and vision coverage, and set up the transition for the beginning of next month.";
      
      case 'basicTutorial':
        return "This is a basic tutorial scenario that walks through the fundamental features of the system. The agent demonstrated how to navigate the interface, access account information, and perform basic actions like updating personal details.";
      
      case 'customerSupport':
        return "Customer reached out with general questions about their account services. The agent provided information about account features, answered questions about billing cycles, and helped troubleshoot a minor access issue with the customer's online dashboard.";
        
      case 'accountVerification':
        return "New customer needed to complete their account verification process. The agent guided them through identity verification steps, helped set up security questions, and explained the account protection measures in place for their privacy and security.";
        
      default:
        return "No conversation summary available for this scenario. Please select a different scenario or start a conversation to generate a summary.";
    }
  }, []);
  
  return { generateSummary };
}
