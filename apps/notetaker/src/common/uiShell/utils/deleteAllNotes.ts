import { NOTES_STORAGE_KEY } from "@/constants/storage"
import { router } from "@/router"

export const delteAllNotes = () => {
  localStorage.removeItem(NOTES_STORAGE_KEY)
  router.navigate({ to: "/" })
  window.location.reload()
}
