
import * as React from "react"
import { Toaster as Sonner } from "sonner"

import type {
  ExternalToast,
  Toast,
  ToastT,
} from "sonner"

const toastTimeouts = new Map<string | number, ReturnType<typeof setTimeout>>()

type ToastProps = React.ComponentPropsWithoutRef<typeof Sonner>

const toastState = {
  toasts: [] as Toast[],
  listeners: new Set<(toasts: Toast[]) => void>(),
  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  },
  update(toasts: Toast[]) {
    this.toasts = toasts
    this.listeners.forEach((listener) => listener(toasts))
  },
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  START_PAUSE: "START_PAUSE",
  END_PAUSE: "END_PAUSE",
} as const

let count = 0

function generateId() {
  return (count++).toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastT
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastT>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string | number
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string | number
    }
  | {
      type: ActionType["START_PAUSE"]
      time: number
    }
  | {
      type: ActionType["END_PAUSE"]
      time: number
    }

interface State {
  toasts: ToastT[]
  pausedAt: number | null
}

const toastReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }
    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action
      if (toastId) {
        toastState.update(state.toasts)
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId || toastId === undefined
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        }
      }
      toastState.update(state.toasts)
      return {
        ...state,
        toasts: state.toasts.map((t) => ({
          ...t,
          open: false,
        })),
      }
    }
    case actionTypes.REMOVE_TOAST: {
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    }
    case actionTypes.START_PAUSE:
      return {
        ...state,
        pausedAt: action.time,
      }
    case actionTypes.END_PAUSE: {
      if (state.pausedAt === null) {
        return state
      }
      const diff = action.time - state.pausedAt
      return {
        ...state,
        pausedAt: null,
        toasts: state.toasts.map((t) => {
          const updatedCreatedAt = new Date(
            new Date(t.createdAt!).getTime() + diff
          ).toISOString()
          return {
            ...t,
            createdAt: updatedCreatedAt,
          }
        }),
      }
    }
    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [], pausedAt: null }

function dispatch(action: Action) {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type ToasterToast = ToastT

interface Toast extends ToasterToast {}

type ToastActionType = Exclude<ActionType, ActionType["UPDATE_TOAST"]>

type ToastAction = Exclude<Action, { type: ActionType["UPDATE_TOAST"] }>

const toast = ((props: ExternalToast | string) => {
  const id = generateId()
  const now = Date.now()

  const toast: ToastT = {
    createdAt: now,
    id,
    open: true,
    type: "default",
    ...(typeof props === "string" ? { message: props } : props),
  }

  dispatch({
    type: "ADD_TOAST",
    toast,
  })

  return id
}) as any

toast.dismiss = (toastId?: string | number) => {
  dispatch({
    type: "DISMISS_TOAST",
    toastId,
  })
}

toast.update = (toastId: string | number, data: Partial<ToasterToast>) => {
  dispatch({
    type: "UPDATE_TOAST",
    toast: {
      ...data,
      id: toastId,
    },
  })

  return toastId
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
    dismiss: toast.dismiss,
  }
}

function Toaster({ ...props }: ToastProps) {
  const { toast, toasts, dismiss } = useToast()

  return (
    <Sonner
      toasts={toasts}
      toast={toast}
      dismiss={dismiss}
      {...props}
    />
  )
}

export { Toaster, useToast, toast }
