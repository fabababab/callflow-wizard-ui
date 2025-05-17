
import { ModuleType } from '@/types/modules';

/**
 * Keep track of dispatched events to prevent duplicates
 */
const dispatchedEvents = new Set<string>();

/**
 * Dispatches module events based on the module type and result
 * 
 * @param moduleId The ID of the module
 * @param moduleType The type of the module
 * @param result The result data from module completion
 */
export const dispatchModuleEvents = (moduleId: string, moduleType: ModuleType, result: any) => {
  // Create a unique event ID to prevent duplicates
  const timestamp = Date.now();
  const eventId = `${moduleType}-${moduleId}-${timestamp}`;
  
  if (dispatchedEvents.has(`${moduleType}-${moduleId}`)) {
    console.log(`Skipping duplicate module event for ${moduleType}-${moduleId}`);
    return;
  }
  
  // Store this event ID to prevent immediate duplicates
  dispatchedEvents.add(`${moduleType}-${moduleId}`);
  
  // Clear stored events after a short delay to allow future events
  setTimeout(() => {
    dispatchedEvents.delete(`${moduleType}-${moduleId}`);
  }, 2000);
  
  // Dispatch a generic module completion event
  const event = new CustomEvent('module-complete', {
    detail: { 
      moduleId,
      moduleType,
      result,
      eventId
    }
  });
  window.dispatchEvent(event);
  
  // For verification modules
  if (moduleType === ModuleType.VERIFICATION && result.verified === true) {
    const verificationEvent = new CustomEvent('verification-successful', {
      detail: { 
        moduleId,
        success: true,
        eventId
      }
    });
    window.dispatchEvent(verificationEvent);
  }
  
  // For contract modules
  if (moduleType === ModuleType.CONTRACT) {
    const contractEvent = new CustomEvent('contract-module-complete', {
      detail: { 
        moduleId,
        result,
        eventId
      }
    });
    window.dispatchEvent(contractEvent);
  }
  
  // For information modules
  if (moduleType === ModuleType.INFORMATION || moduleType === ModuleType.INFORMATION_TABLE) {
    const infoEvent = new CustomEvent('information-module-complete', {
      detail: { 
        moduleId,
        result,
        eventId
      }
    });
    window.dispatchEvent(infoEvent);
  }
  
  // For nachbearbeitung modules
  if (moduleType === ModuleType.NACHBEARBEITUNG) {
    const nachbearbeitungEvent = new CustomEvent('nachbearbeitung-complete', {
      detail: { 
        moduleId,
        result,
        eventId
      }
    });
    window.dispatchEvent(nachbearbeitungEvent);
  }

  // For franchise modules
  if (moduleType === ModuleType.FRANCHISE) {
    const franchiseEvent = new CustomEvent('franchise-complete', {
      detail: { 
        moduleId,
        result,
        eventId
      }
    });
    window.dispatchEvent(franchiseEvent);
  }
};
