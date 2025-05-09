
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useConversationSummary() {
  const generateSummary = useCallback((scenario: ScenarioType | null): string => {
    if (!scenario) return "No scenario selected. Start a call to begin.";

    // Generate different summaries based on scenario type
    switch (scenario) {
      case 'verification':
        return "The customer requested identity verification after receiving an alert about a login from an unfamiliar location. Agent verified the customer's identity using date of birth and account details. Confirmed this was unauthorized access and recommended a password change. The customer was advised about enabling two-factor authentication for additional security.";
      
      case 'bankDetails':
        return "Customer called to update their bank account details after switching banks. Agent verified the customer's identity and collected new banking information. The changes were confirmed and processed. Customer was informed that the changes will take effect for the next payment cycle.";
      
      case 'accountHistory':
        return "Customer reported suspicious transactions on their account. Agent verified customer identity and reviewed account history for the past three months. Three unknown transactions were identified and flagged for investigation. A temporary hold was placed on the account and a new card was issued to the customer as a precaution.";
      
      case 'physioTherapy':
        return "Der Kunde fragte nach der Deckung für 10 Physiotherapiebehandlungen, die vom Arzt verschrieben wurden. Der Agent bestätigte, dass die Versicherung alle 10 Behandlungen abdeckt, solange sie medizinisch notwendig sind. Der Kunde wurde darüber informiert, dass keine Vorabgenehmigung erforderlich ist und die Erstattung direkt erfolgen kann.";
      
      case 'paymentReminder':
        return "Der Kunde erhielt eine Zahlungserinnerung, obwohl die Zahlung bereits geleistet wurde. Der Agent überprüfte die Zahlung und bestätigte, dass sie eingegangen ist, aber nicht korrekt verbucht wurde. Die Mahnung wurde storniert und der Agent versicherte, dass keine Mahngebühren anfallen werden.";
      
      case 'insurancePackage':
        return "Der Kunde wollte nach Studienabschluss von einer Studentenversicherung auf ein reguläres Versicherungspaket umsteigen. Der Agent erläuterte verschiedene Pakete mit besonderem Fokus auf Zahnversicherung und Zusatzleistungen für Brillen. Ein passendes Paket wurde identifiziert und der Kunde erhält ein detailliertes Angebot per E-Mail.";
      
      case 'basicTutorial':
        return "This was a basic tutorial call to demonstrate the system functionality. The agent went through standard greeting procedures and basic customer service protocols. This scenario serves as an introduction to the call handling workflow.";
      
      case 'customerSupport':
        return "Customer called with general inquiries about their account services. Agent provided information about account features, answered questions about billing cycles, and explained premium service options. Customer was satisfied with the information provided and will consider upgrading their package.";
      
      case 'accountVerification':
        return "Customer needed to verify their account details after receiving system notifications. Agent guided them through the verification process using security questions and confirmed all details were correct. Additional security measures were explained and account access was restored successfully.";
      
      default:
        return "Customer called with a general inquiry. Agent provided information and assistance according to company protocols. The call was resolved successfully and customer's concerns were addressed appropriately.";
    }
  }, []);

  return { generateSummary };
}
