
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import {
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement,
  timestamp?: string,
  read?: boolean
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  MARK_AS_READ: "MARK_AS_READ",
  MARK_ALL_AS_READ: "MARK_ALL_AS_READ",
  CLEAR_ALL: "CLEAR_ALL"
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["MARK_AS_READ"]
      toastId?: string
    }
  | {
      type: ActionType["MARK_ALL_AS_READ"]
    }
  | {
      type: ActionType["CLEAR_ALL"]
    }

interface State {
  notifications: ToasterToast[]
  unreadCount: number
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        notifications: [action.toast, ...state.notifications].slice(0, TOAST_LIMIT),
        unreadCount: state.unreadCount + 1,
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        notifications: state.notifications.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        const newNotifications = state.notifications.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        )
        return { ...state, notifications: newNotifications }
      }
      
      return {
        ...state,
        notifications: state.notifications.map((t) => ({
          ...t,
          open: false,
        })),
      }
    }

    case actionTypes.REMOVE_TOAST: {
      if (action.toastId) {
        const updatedNotifications = state.notifications.filter((t) => t.id !== action.toastId)
        return { 
          ...state, 
          notifications: updatedNotifications,
          unreadCount: Math.max(0, state.unreadCount - 1)
        }
      }
      return { 
        ...state, 
        notifications: [],
        unreadCount: 0 
      }
    }
    
    case actionTypes.MARK_AS_READ: {
      const { toastId } = action
      if (toastId) {
        const newNotifications = state.notifications.map((t) =>
          t.id === toastId && !t.read ? { ...t, read: true } : t
        )
        const markedOneAsRead = newNotifications.some((t) => t.id === toastId && t.read)
        return { 
          ...state, 
          notifications: newNotifications,
          unreadCount: markedOneAsRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        }
      }
      return state
    }
    
    case actionTypes.MARK_ALL_AS_READ: {
      const newNotifications = state.notifications.map((t) => ({ ...t, read: true }))
      return { 
        ...state, 
        notifications: newNotifications,
        unreadCount: 0
      }
    }
    
    case actionTypes.CLEAR_ALL: {
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { notifications: [], unreadCount: 0 }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

interface Toast extends Omit<ToasterToast, "id"> {
  id?: string
}

function toast({ ...props }: Toast) {
  const id = props.id || crypto.randomUUID()
  const timestamp = props.timestamp || new Date().toLocaleString()
  const read = false

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      timestamp,
      read,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
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
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    dismissAll: () => dispatch({ type: actionTypes.DISMISS_TOAST }),
    clear: (toastId?: string) => dispatch({ type: actionTypes.REMOVE_TOAST, toastId }),
    clearAll: () => dispatch({ type: actionTypes.CLEAR_ALL }),
    markAsRead: (toastId?: string | "all") => {
      if (toastId === "all") {
        dispatch({ type: actionTypes.MARK_ALL_AS_READ })
      } else {
        dispatch({ type: actionTypes.MARK_AS_READ, toastId })
      }
    },
    toasts: state.notifications,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
  }
}

export { useToast, toast }
