
// This is our main toast implementation
import * as React from "react"
import { type ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 10
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  read?: boolean
  timestamp?: string
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  MARK_AS_READ: "MARK_AS_READ",
  CLEAR_ALL: "CLEAR_ALL",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
      id: string
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      id: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      id: string
    }
  | {
      type: ActionType["MARK_AS_READ"]
      id: string
    }
  | {
      type: ActionType["CLEAR_ALL"]
    }

interface State {
  toasts: ToasterToast[]
  notifications: ToasterToast[]
  unreadCount: number
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      id: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      const toast = {
        ...action.toast,
        read: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      return {
        ...state,
        // Only add to toasts if we want on-screen display (we'll disable this)
        toasts: [],  // No longer add toasts for automatic display
        notifications: [toast, ...state.notifications].slice(0, TOAST_LIMIT),
        unreadCount: state.unreadCount + 1,
      }
    }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
        notifications: state.notifications.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { id } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (id) {
        addToRemoveQueue(id)
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === id || id === "all"
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case "REMOVE_TOAST":
      if (action.id === "all") {
        return {
          ...state,
          toasts: [],
          notifications: [],
          unreadCount: 0,
        }
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
        notifications: state.notifications.filter((t) => t.id !== action.id),
        unreadCount: state.unreadCount - (state.notifications.find(t => t.id === action.id)?.read === false ? 1 : 0)
      }
    
    case "MARK_AS_READ":
      if (action.id === "all") {
        return {
          ...state,
          notifications: state.notifications.map(t => ({ ...t, read: true })),
          unreadCount: 0,
        }
      }
      
      return {
        ...state,
        notifications: state.notifications.map(t => 
          t.id === action.id ? { ...t, read: true } : t
        ),
        unreadCount: state.unreadCount - (state.notifications.find(t => t.id === action.id)?.read === false ? 1 : 0)
      }
      
    case "CLEAR_ALL":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      }

    default:
      return state;
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [], notifications: [], unreadCount: 0 }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: Toast) =>
    dispatch({
      type: "UPDATE_TOAST",
      id,
      toast: { ...props },
    })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", id: toastId || "all" }),
    markAsRead: (notificationId?: string) => dispatch({ type: "MARK_AS_READ", id: notificationId || "all" }),
    clearAll: () => dispatch({ type: "CLEAR_ALL" }),
  }
}

export { useToast, toast }
