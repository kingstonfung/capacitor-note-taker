import { useState } from "react"
import type { Notes } from "@/schemas/notes"
import { NOTES_STORAGE_KEY } from "@/constants/storage"

type UseNotesFormSubmit = {
  onSubmit: (note: Notes) => void
  isSuccess: boolean
  isError: boolean
  savedNote: Notes | null
  reset: () => void
}

export const useNotesFormSubmit = (): UseNotesFormSubmit => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [savedNote, setSavedNote] = useState<Notes | null>(null)

  const onSubmit = (note: Notes) => {
    try {
      const existing = localStorage.getItem(NOTES_STORAGE_KEY)
      const notes: Notes[] = existing ? JSON.parse(existing) : []
      const existingIndex = notes.findIndex((n) => n.id === note.id)
      if (existingIndex >= 0) {
        notes[existingIndex] = note
      } else {
        notes.push(note)
      }
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
      setSavedNote(note)
      setIsSuccess(true)
    } catch (error) {
      console.error("Failed to save note", error)
      setIsError(true)
    }
  }

  const reset = () => {
    setIsSuccess(false)
    setIsError(false)
    setSavedNote(null)
  }

  return { onSubmit, isSuccess, isError, savedNote, reset }
}
