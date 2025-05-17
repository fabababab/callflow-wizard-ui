
import { ModuleConfig, ModuleType } from '@/types/modules';
import { type ToastActionElement } from '@/components/ui/toast';

export interface ToastUtility {
  toast: (props: { title: string; description?: string; duration?: number; action?: ToastActionElement }) => void;
}

export const dispatchModuleEvents = (moduleConfig: ModuleConfig, result: any) => {
  // Dispatch a generic module completion event
  const event = new CustomEvent('module-complete', {
    detail: { 
      moduleId: moduleConfig.id,
      moduleType: moduleConfig.type,
      result
    }
  });
  window.dispatchEvent(event);
  
  // Special handling for therapist selection module
  if (moduleConfig.id === 'therapist-suggestion-module') {
    // Extract the selected option ID
    const selectedOptionId = result?.selectedOptionId;
    
    // Determine which state to transition to
    let targetState = 'customer_confused'; // Default fallback
    
    // If user selected Jana Brunner, go to coverage_check
    if (selectedOptionId === 'jana_brunner') {
      targetState = 'coverage_check';
    }
    
    console.log(`Therapist selection module completed with selection: ${selectedOptionId}, transitioning to: ${targetState}`);
    
    // Dispatch custom event for the therapist selection with target state
    const therapistEvent = new CustomEvent('therapist-selection-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        selectedOptionId,
        targetState
      }
    });
    window.dispatchEvent(therapistEvent);
  }
  
  // For verification modules
  if (moduleConfig.type === ModuleType.VERIFICATION && result.verified === true) {
    const verificationEvent = new CustomEvent('verification-successful', {
      detail: { 
        moduleId: moduleConfig.id,
        success: true
      }
    });
    window.dispatchEvent(verificationEvent);
  }
  
  // For contract modules
  if (moduleConfig.type === ModuleType.CONTRACT) {
    const contractEvent = new CustomEvent('contract-module-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        result
      }
    });
    window.dispatchEvent(contractEvent);
  }
  
  // For information modules
  if (moduleConfig.type === ModuleType.INFORMATION || moduleConfig.type === ModuleType.INFORMATION_TABLE) {
    const infoEvent = new CustomEvent('information-module-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        result
      }
    });
    window.dispatchEvent(infoEvent);
  }
  
  // For nachbearbeitung modules
  if (moduleConfig.type === ModuleType.NACHBEARBEITUNG) {
    const nachbearbeitungEvent = new CustomEvent('nachbearbeitung-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        result
      }
    });
    window.dispatchEvent(nachbearbeitungEvent);
  }

  // For franchise modules
  if (moduleConfig.type === ModuleType.FRANCHISE || 
      (moduleConfig.type === ModuleType.INFORMATION_TABLE && 
       moduleConfig.data?.franchiseOptions)) {
    const franchiseEvent = new CustomEvent('franchise-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        result
      }
    });
    window.dispatchEvent(franchiseEvent);
  }
  
  // For insurance model modules
  if (moduleConfig.type === ModuleType.INSURANCE_MODEL) {
    const insuranceModelEvent = new CustomEvent('insurance-model-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        result
      }
    });
    window.dispatchEvent(insuranceModelEvent);
  }
};

export const getCompletionToastMessage = (moduleConfig: ModuleType, result: any) => {
  let title = "Module Completed";
  let description = `${moduleConfig} has been completed successfully`;
  
  if (moduleConfig === ModuleType.INFORMATION_TABLE && result.selectedOption) {
    title = "Franchise-Option ausgewählt";
    description = `Sie haben die Option CHF ${result.selectedOption} gewählt.`;
  } else if (moduleConfig === ModuleType.INSURANCE_MODEL && result.modelTitle) {
    title = "Versicherungsmodell ausgewählt";
    description = `Sie haben ${result.modelTitle} ausgewählt.`;
  } else if (moduleConfig === ModuleType.CHOICE_LIST && result.selectedOption) {
    title = "Option ausgewählt";
    description = `Sie haben die Option "${result.selectedOption.label}" gewählt.`;
  }
  
  return { title, description };
};

export const getModuleInitialToast = (moduleConfig: ModuleConfig) => {
  let description = "Please complete this interactive module";
  let title = moduleConfig.title || "Interactive Module";
  
  if (moduleConfig.type === ModuleType.VERIFICATION) {
    description = "Please verify the customer information";
  } else if (moduleConfig.type === ModuleType.CONTRACT) {
    description = "View and manage contract details";
  } else if (moduleConfig.type === ModuleType.INFORMATION) {
    description = "Important customer information available";
  } else if (moduleConfig.type === ModuleType.FRANCHISE) {
    description = "Franchise options and premium information";
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
