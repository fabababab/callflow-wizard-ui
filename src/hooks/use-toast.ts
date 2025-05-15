
// Re-export from the lib directory where the actual implementation is
import { useToast as originalUseToast, toast as originalToast } from "@/lib/use-toast.tsx";

export const useToast = originalUseToast;
export const toast = originalToast;
