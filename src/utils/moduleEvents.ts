
import { ModuleType } from '@/types/modules';

/**
 * Dispatches module events based on the module type and result
 * 
 * @param moduleId The ID of the module
 * @param moduleType The type of the module
 * @param result The result data from module completion
 */
export const dispatchModuleEvents = (moduleId: string, moduleType: ModuleType, result: any) => {
  // Dispatch a generic module completion event
  const event = new CustomEvent('module-complete', {
    detail: { 
      moduleId,
      moduleType,
      result
    }
  });
  window.dispatchEvent(event);
  
  // For verification modules
  if (moduleType === ModuleType.VERIFICATION && result.verified === true) {
    const verificationEvent = new CustomEvent('verification-successful', {
      detail: { 
        moduleId,
        success: true
      }
    });
    window.dispatchEvent(verificationEvent);
  }
  
  // For contract modules
  if (moduleType === ModuleType.CONTRACT) {
    const contractEvent = new CustomEvent('contract-module-complete', {
      detail: { 
        moduleId,
        result
      }
    });
    window.dispatchEvent(contractEvent);
  }
  
  // For information modules
  if (moduleType === ModuleType.INFORMATION || moduleType === ModuleType.INFORMATION_TABLE) {
    const infoEvent = new CustomEvent('information-module-complete', {
      detail: { 
        moduleId,
        result
      }
    });
    window.dispatchEvent(infoEvent);
  }
  
  // For nachbearbeitung modules
  if (moduleType === ModuleType.NACHBEARBEITUNG) {
    const nachbearbeitungEvent = new CustomEvent('nachbearbeitung-complete', {
      detail: { 
        moduleId,
        result
      }
    });
    window.dispatchEvent(nachbearbeitungEvent);
  }

  // For franchise modules
  if (moduleType === ModuleType.FRANCHISE) {
    const franchiseEvent = new CustomEvent('franchise-complete', {
      detail: { 
        moduleId,
        result
      }
    });
    window.dispatchEvent(franchiseEvent);
  }
};
