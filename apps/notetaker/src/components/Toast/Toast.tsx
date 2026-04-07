import { useEffect, useState } from "react"
import styles from "./Toast.module.css"

type ToastProps = {
  message: string
  type?: "success" | "error"
  onDismiss?: () => void
}

export const Toast = ({ message, type = "success", onDismiss }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onDismiss?.()
      }, 300)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${!isVisible ? styles.fadeOut : ""}`}
    >
      {message}
    </div>
  )
}
