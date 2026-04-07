import type { Notes } from "@/schemas/notes"
import { NOTES_STORAGE_KEY } from "@/constants/storage"

type LoadNoteByIdArgs = {
  params: { noteId: string }
}

export const loadNoteById = ({
  params,
}: LoadNoteByIdArgs): Notes | undefined => {
  const { noteId } = params

  const stored = localStorage.getItem(NOTES_STORAGE_KEY)
  const notes: Notes[] = stored ? JSON.parse(stored) : []

  return notes.find((n) => n.id === noteId)
}
