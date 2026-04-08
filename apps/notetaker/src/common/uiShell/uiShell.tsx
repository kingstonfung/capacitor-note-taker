import { useState } from "react"
import { Outlet } from "@tanstack/react-router"

import styles from "./styles.module.css"
import { Header } from "../Header/Header"
import { Search } from "@/features/search/Search"
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal/ConfirmDeleteModal"
import { delteAllNotes } from "./utils/deleteAllNotes"
import { useToast } from "@/common/toast/ToastContext"
import { useAndroidBackButton } from "@/common/useAndroidBackButton/useAndroidBackButton"

export const UIShell = () => {
  useAndroidBackButton()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const { showToastAfterReload } = useToast()

  const handleConfirmDelete = () => {
    setIsConfirmDeleteOpen(false)
    showToastAfterReload("All notes deleted")
    delteAllNotes()
  }

  return (
    <div className={styles.layout}>
      <Header onOpenSearch={() => setIsSearchOpen(true)} />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <a
          href=""
          className={styles.deleteAllLink}
          onClick={(e) => {
            e.preventDefault()
            setIsConfirmDeleteOpen(true)
          }}
        >
          DELETE ALL NOTES
        </a>
        Capacitor App Demo, prepared by {import.meta.env.VITE_AUTHOR_NAME}
      </footer>
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  )
}
