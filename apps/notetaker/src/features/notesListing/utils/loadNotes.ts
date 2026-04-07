import { NOTES_STORAGE_KEY } from "@/constants/storage"
import type { Notes } from "@/schemas/notes"

export const loadNotes = (): Notes[] => {
  const stored = localStorage.getItem(NOTES_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}
