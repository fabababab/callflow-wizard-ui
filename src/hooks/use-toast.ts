import { useNotifications } from "@/contexts/NotificationsContext";
import { type NotificationType } from "@/contexts/NotificationsContext";

// We keep the same interface for backward compatibility
export type ToastProps = {
  title?: string;
  description?: string;
  variant?: NotificationType;
  duration?: number;
  action?: React.ReactNode;
};

export function useToast() {
  const notifications = useNotifications();
  
  const toast = (props: ToastProps) => {
    notifications.addNotification({
      type: props.variant || "info",
      title: props.title || "",
      description: props.description || "",
    });
    
    return {
      id: "notification", // For backward compatibility
      dismiss: () => {},  // No-op as notifications are handled differently
      update: () => {},   // No-op as notifications are handled differently
    };
  };
  
  return {
    toast,
    dismiss: () => {}, // No-op
    toasts: [],        // Empty array for backward compatibility
  };
}

// Direct function for components that just use toast()
export const toast = (props: ToastProps) => {
  // We need a fallback for direct toast calls outside of React components
  try {
    const notifications = useNotifications();
    notifications.addNotification({
      type: props.variant || "info",
      title: props.title || "",
      description: props.description || "",
    });
  } catch (e) {
    console.log("Toast called outside notification context:", props);
    // Fallback to console log when the context isn't available
    console.log(`NOTIFICATION: ${props.title} - ${props.description}`);
  }
  
  return {
    id: "notification", // For backward compatibility
    dismiss: () => {},  // No-op
    update: () => {},   // No-op
  };
};
