
import { ModuleType } from '@/types/modules';

/**
 * Keep track of dispatched events to prevent duplicates
 */
const dispatchedEvents = new Set<string>();

/**
 * Create a unique event ID with timestamp to prevent duplicate handling
 */
const createEventId = (moduleId: string, moduleType: ModuleType, additionalInfo: string = '') => {
  const timestamp = Date.now();
  return `${moduleType}-${moduleId}-${additionalInfo}-${timestamp}`;
};

/**
 * Dispatches module events based on the module type and result
 * 
 * @param moduleId The ID of the module
 * @param moduleType The type of the module
 * @param result The result data from module completion
 */
export const dispatchModuleEvents = (moduleId: string, moduleType: ModuleType, result: any) => {
  // Create a unique tracking key for this specific module
  const moduleKey = `${moduleType}-${moduleId}`;
  
  // Skip if we've already dispatched this exact module event recently
  if (dispatchedEvents.has(moduleKey)) {
    console.log(`Skipping duplicate module event for ${moduleKey}`);
    return;
  }
  
  // Store this module key to prevent immediate duplicates
  dispatchedEvents.add(moduleKey);
  
  // Clear stored event after a short delay to allow future events
  setTimeout(() => {
    dispatchedEvents.delete(moduleKey);
  }, 2000);
  
  // Generate a unique event ID that includes the timestamp
  const eventId = createEventId(moduleId, moduleType);
  
  // Dispatch a generic module completion event with detailed information
  const event = new CustomEvent('module-complete', {
    detail: { 
      moduleId,
      moduleType,
      result,
      eventId,
      timestamp: Date.now() // Add timestamp for better tracking
    }
  });
  
  console.log(`Dispatching module-complete event for ${moduleType} ${moduleId}`, event.detail);
  window.dispatchEvent(event);
  
  // For verification modules
  if (moduleType === ModuleType.VERIFICATION && result.verified === true) {
    const verificationEventId = createEventId(moduleId, moduleType, 'verification');
    const verificationEvent = new CustomEvent('verification-successful', {
      detail: { 
        moduleId,
        success: true,
        eventId: verificationEventId,
        timestamp: Date.now() // Add timestamp for better tracking
      }
    });
    console.log(`Dispatching verification-successful event for ${moduleId}`, verificationEvent.detail);
    window.dispatchEvent(verificationEvent);
    
    // Also dispatch generic verification-complete event
    const verificationCompleteEvent = new CustomEvent('verification-complete', {
      detail: { 
        moduleId,
        success: true,
        eventId: verificationEventId,
        timestamp: Date.now() // Add timestamp for better tracking
      }
    });
    console.log(`Dispatching verification-complete event for ${moduleId}`, verificationCompleteEvent.detail);
    window.dispatchEvent(verificationCompleteEvent);
  }
  
  // For contract modules
  if (moduleType === ModuleType.CONTRACT) {
    const contractEventId = createEventId(moduleId, moduleType, 'contract');
    const contractEvent = new CustomEvent('contract-module-complete', {
      detail: { 
        moduleId,
        result,
        eventId: contractEventId,
        timestamp: Date.now()
      }
    });
    console.log(`Dispatching contract-module-complete event for ${moduleId}`, contractEvent.detail);
    window.dispatchEvent(contractEvent);
  }
  
  // For information modules
  if (moduleType === ModuleType.INFORMATION || moduleType === ModuleType.INFORMATION_TABLE) {
    const infoEventId = createEventId(moduleId, moduleType, 'information');
    const infoEvent = new CustomEvent('information-module-complete', {
      detail: { 
        moduleId,
        result,
        eventId: infoEventId,
        timestamp: Date.now()
      }
    });
    console.log(`Dispatching information-module-complete event for ${moduleId}`, infoEvent.detail);
    window.dispatchEvent(infoEvent);
    
    // For the coverage module specifically
    if (moduleId === 'coverage-info-module') {
      console.log("Coverage info module completed");
      setTimeout(() => {
        const coverageEventId = createEventId(moduleId, moduleType, 'coverage');
        // Create and dispatch an event for the coverage info module completion
        const coverageEvent = new CustomEvent('coverage-info-complete', {
          detail: { 
            moduleId,
            result,
            eventId: coverageEventId,
            timestamp: Date.now()
          }
        });
        console.log(`Dispatching coverage-info-complete event for ${moduleId}`, coverageEvent.detail);
        window.dispatchEvent(coverageEvent);
      }, 300);
    }
  }
  
  // For nachbearbeitung modules
  if (moduleType === ModuleType.NACHBEARBEITUNG) {
    const nachbearbeitungEventId = createEventId(moduleId, moduleType, 'nachbearbeitung');
    const nachbearbeitungEvent = new CustomEvent('nachbearbeitung-complete', {
      detail: { 
        moduleId,
        result,
        eventId: nachbearbeitungEventId,
        timestamp: Date.now()
      }
    });
    console.log(`Dispatching nachbearbeitung-complete event for ${moduleId}`, nachbearbeitungEvent.detail);
    window.dispatchEvent(nachbearbeitungEvent);
  }

  // For franchise modules
  if (moduleType === ModuleType.FRANCHISE) {
    const franchiseEventId = createEventId(moduleId, moduleType, 'franchise');
    const franchiseEvent = new CustomEvent('franchise-complete', {
      detail: { 
        moduleId,
        result,
        eventId: franchiseEventId,
        timestamp: Date.now()
      }
    });
    console.log(`Dispatching franchise-complete event for ${moduleId}`, franchiseEvent.detail);
    window.dispatchEvent(franchiseEvent);
  }
};
