
import { useCallback } from 'react';
import { ModuleType } from '@/types/modules';
import { useToast } from '@/hooks/use-toast';

export function useNachbearbeitungHandler(completeModule: (result: any) => void) {
  const { toast } = useToast();
  
  // Show the Nachbearbeitung (call summary) module
  const showNachbearbeitungSummary = useCallback(() => {
    // Create nachbearbeitung module config
    const nachbearbeitungModuleConfig = {
      id: 'nachbearbeitung-' + Date.now(),
      title: 'Gesprächszusammenfassung',
      type: ModuleType.NACHBEARBEITUNG,
      data: {
        isInline: true, // Set to display inline instead of modal
        summaryPoints: [
          { id: '1', text: 'Kunde hat Studium abgeschlossen', checked: true, important: true },
          { id: '2', text: 'Wechsel zum Telmed-Modell', checked: true, important: true },
          { id: '3', text: 'Franchise von CHF 1000 gewählt', checked: true, important: true },
          { id: '4', text: 'Änderung ab nächstem Monat wirksam', checked: false, important: false },
          { id: '5', text: 'E-Mail mit Bestätigung gesendet', checked: false, important: false }
        ]
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
        title: "Gesprächszusammenfassung",
        description: "Bitte bestätigen Sie die Gesprächspunkte",
        duration: 3000
      });
    }, 300);
  }, [completeModule, toast]);

  return { showNachbearbeitungSummary };
}
