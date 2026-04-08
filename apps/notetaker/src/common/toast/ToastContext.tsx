import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Toast } from "@/components/Toast/Toast"
import { PENDING_TOAST_KEY } from "@/constants/pendingToastKey"

type ToastState = {
  message: string
  type: "success" | "error"
}

type ToastContextValue = {
  showToast: (message: string, type?: "success" | "error") => void
  showToastAfterReload: (message: string, type?: "success" | "error") => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_TOAST_KEY)
    if (pending) {
      sessionStorage.removeItem(PENDING_TOAST_KEY)
      try {
        setToast(JSON.parse(pending) as ToastState)
      } catch (error) {
        console.error(error)
      }
    }
  }, [])

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type })
  }

  const showToastAfterReload = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({ message, type }))
  }

  return (
    <ToastContext.Provider value={{ showToast, showToastAfterReload }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
