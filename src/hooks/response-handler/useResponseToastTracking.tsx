
import { useRef } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';

/**
 * Hook to track response toast notifications
 */
export function useResponseToastTracking() {
  const { addNotification } = useNotifications();
  // Track if we've shown a response selection notification
  const responseToastShownRef = useRef<Record<string, boolean>>({});
  
  const trackResponseToast = (response: string) => {
    // Show notification for response selection (only once per unique response)
    if (!responseToastShownRef.current[response]) {
      addNotification({
        title: "Response Selected",
        description: response,
        type: "info"
      });
      responseToastShownRef.current[response] = true;
      return true;
    }
    return false;
  };
  
  return { trackResponseToast, responseToastShownRef };
}
