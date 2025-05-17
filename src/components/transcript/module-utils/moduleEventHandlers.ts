
import { ModuleConfig, ModuleType } from '@/types/modules';
import { type ToastActionElement } from '@/components/ui/toast';
import { dispatchModuleEvents as dispatchModuleEventsUtil } from '@/utils/moduleEvents';

export interface ToastUtility {
  toast: (props: { title: string; description?: string; duration?: number; action?: ToastActionElement }) => void;
}

export const handleModuleEvents = (moduleConfig: ModuleConfig, result: any) => {
  // Convert the moduleConfig to appropriate parameters for the utility function
  dispatchModuleEventsUtil(moduleConfig.id, moduleConfig.type, result);
  
  // Special handling for therapist selection module
  if (moduleConfig.id === 'therapist-suggestion-module') {
    // Extract the selected option ID
    const selectedOptionId = result?.selectedOptionId;
    
    // Determine which state to transition to
    let targetState = 'customer_confused'; // Default fallback
    
    // If user selected Jana Brunner, go to coverage_check
    if (selectedOptionId === 'jana_brunner') {
      targetState = 'coverage_check';
      console.log("Jana Brunner selected - should transition to coverage_check state");
    }
    
    console.log(`Therapist selection module completed with selection: ${selectedOptionId}, transitioning to: ${targetState}`);
    
    // Dispatch custom event for the therapist selection with target state
    const therapistEvent = new CustomEvent('therapist-selection-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        selectedOptionId,
        targetState,
        timestamp: Date.now(),
        // Include the selected option for debugging
        selectedOption: result?.selectedOption
      }
    });
    window.dispatchEvent(therapistEvent);
  }
};

export const getCompletionToastMessage = (moduleType: ModuleType, result: any) => {
  let title = "Modul abgeschlossen";
  let description = `${moduleType} wurde erfolgreich abgeschlossen`;
  
  if (moduleType === ModuleType.INFORMATION_TABLE) {
    if (result.selectedOption) {
      title = "Franchise-Option ausgewählt";
      description = `Sie haben die Option CHF ${result.selectedOption} gewählt.`;
    } else {
      title = "Informationstabelle angezeigt";
      description = "Die Informationen wurden erfolgreich angezeigt.";
    }
  } else if (moduleType === ModuleType.INSURANCE_MODEL && result.modelTitle) {
    title = "Versicherungsmodell ausgewählt";
    description = `Sie haben ${result.modelTitle} ausgewählt.`;
  } else if (moduleType === ModuleType.CHOICE_LIST && result.selectedOption) {
    title = "Option ausgewählt";
    description = `Sie haben die Option "${result.selectedOption.label}" gewählt.`;
  } else if (moduleType === ModuleType.VERIFICATION && result.verified) {
    title = "Verifizierung erfolgreich";
    description = "Identitätsverifizierung wurde erfolgreich abgeschlossen.";
  }
  
  return { title, description };
};

export const getModuleInitialToast = (moduleConfig: ModuleConfig) => {
  let description = "Bitte füllen Sie das interaktive Modul aus";
  let title = moduleConfig.title || "Interaktives Modul";
  
  if (moduleConfig.type === ModuleType.VERIFICATION) {
    description = "Bitte verifizieren Sie die Kundeninformationen";
  } else if (moduleConfig.type === ModuleType.CONTRACT) {
    description = "Vertragsdetails anzeigen und verwalten";
  } else if (moduleConfig.type === ModuleType.INFORMATION) {
    description = "Wichtige Kundeninformationen verfügbar";
  } else if (moduleConfig.type === ModuleType.FRANCHISE) {
    description = "Franchise-Optionen und Prämieninformationen";
    title = "Franchise-Optionen";
  } else if (moduleConfig.type === ModuleType.INFORMATION_TABLE) {
    description = "Bitte wählen Sie die gewünschte Franchise-Option";
    title = "Franchise-Übersicht";
  } else if (moduleConfig.type === ModuleType.INSURANCE_MODEL) {
    description = "Bitte wählen Sie das gewünschte Versicherungsmodell";
    title = "Versicherungsmodelle";
  } else if (moduleConfig.type === ModuleType.CHOICE_LIST) {
    description = "Bitte treffen Sie eine Auswahl";
    title = moduleConfig.title || "Auswahloptionen";
  }
  
  return { title, description };
};
