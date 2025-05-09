
import { useCallback } from 'react';
import { ModuleType } from '@/types/modules';

export function useNachbearbeitungHandler(completeModule: (result: any) => void) {
  // Show the Nachbearbeitung (call summary) module
  const showNachbearbeitungSummary = useCallback(() => {
    // Create nachbearbeitung module config
    const nachbearbeitungModuleConfig = {
      id: 'nachbearbeitung-' + Date.now(),
      title: 'Call Summary',
      type: ModuleType.NACHBEARBEITUNG,
      data: {
        summaryPoints: [
          { id: '1', text: 'Customer identity was verified', checked: false, important: true },
          { id: '2', text: 'Customer issue was addressed', checked: false, important: true },
          { id: '3', text: 'Relevant information was provided', checked: false, important: true },
          { id: '4', text: 'Next steps were explained to customer', checked: false, important: false },
          { id: '5', text: 'Customer was offered additional assistance', checked: false, important: false }
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
    }, 300);
  }, [completeModule]);

  return { showNachbearbeitungSummary };
}
