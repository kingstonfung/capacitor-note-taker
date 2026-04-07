import { useEffect } from "react"
import styles from "./confirmDeleteModal.module.css"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDeleteModal = ({
  isOpen,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p id="confirm-delete-title" className={styles.title}>
          Delete all notes?
        </p>
        <p className={styles.body}>This action cannot be undone.</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
