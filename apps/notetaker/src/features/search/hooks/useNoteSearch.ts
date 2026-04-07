import { useMemo } from "react"
import { z } from "zod"
import { NotesSchema } from "@/schemas/notes"
import type { Notes } from "@/schemas/notes"
import { NOTES_STORAGE_KEY } from "@/constants/storage"

const MIN_QUERY_LENGTH = 3

const loadAllNotes = (): Notes[] => {
  const stored = localStorage.getItem(NOTES_STORAGE_KEY)
  if (!stored) return []
  try {
    return z.array(NotesSchema).parse(JSON.parse(stored))
  } catch {
    return []
  }
}

export const useNoteSearch = (query: string): Notes[] => {
  return useMemo(() => {
    if (query.length < MIN_QUERY_LENGTH) return []

    const notes = loadAllNotes()
    const normalised = query.toLowerCase()
    return notes.filter((note) => note.title.toLowerCase().includes(normalised))
  }, [query])
}
