
import { useCallback } from 'react';
import { ModuleType } from '@/types/modules';
import { useToast } from '@/lib/use-toast.tsx';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useNachbearbeitungHandler(completeModule: (result: any) => void, activeScenario?: ScenarioType) {
  const { toast } = useToast();
  
  // Show the Nachbearbeitung (call summary) module
  const showNachbearbeitungSummary = useCallback(() => {
    // Create nachbearbeitung module config with scenario-specific content
    const nachbearbeitungModuleConfig = {
      id: 'nachbearbeitung-' + Date.now(),
      title: activeScenario === 'deutscheVersion' ? 'Gesprächszusammenfassung' : 'Call Summary',
      type: ModuleType.NACHBEARBEITUNG,
      data: {
        isInline: true, // Set to display inline instead of modal
        points: activeScenario === 'deutscheVersion' 
          ? [
              // German-specific summary points
              "Studium abgeschlossen",
              "Franchise von 2500 auf 1000 CHF reduziert",
              "Bleibt im Telmed-Modell",
              "Änderung ab nächstem Monat"
            ]
          : [
              // Default English summary points
              "Customer identity was verified",
              "Customer issue was addressed",
              "Relevant information was provided",
              "Next steps were explained to customer",
              "Customer was offered additional assistance"
            ],
        summary: activeScenario === 'deutscheVersion'
          ? "Kunde hat nach Studienabschluss Franchise von CHF 2500.– auf CHF 1000.– angepasst, bleibt im Telmed-Modell. Änderung per nächstem Monatsbeginn eingeleitet."
          : "Customer modified their health insurance plan after graduation. Changed franchise amount and maintained existing model."
      }
    };
    
    // Update module manager
    completeModule({ showSummary: true });
    
    // Set the active module to show the Nachbearbeitung
    setTimeout(() => {
      const event = new CustomEvent('module-trigger', { 
        detail: { module: nachbearbeitungModuleConfig } 
      });
      window.dispatchEvent(event);
      
      toast({
        title: activeScenario === 'deutscheVersion' ? "Gesprächszusammenfassung" : "Call Summary Module",
        description: activeScenario === 'deutscheVersion' 
          ? "Bitte vervollständigen Sie die Gesprächszusammenfassung" 
          : "Please complete the call summary checklist",
        duration: 3000
      });
    }, 300);
  }, [completeModule, toast, activeScenario]);

  return { showNachbearbeitungSummary };
}
