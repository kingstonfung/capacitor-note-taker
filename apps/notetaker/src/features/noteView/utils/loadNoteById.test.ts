import { describe, it, expect, beforeEach } from "vitest"
import { NOTES_STORAGE_KEY } from "@/constants/storage"
import { loadNoteById } from "./loadNoteById"

const mockNotes = [
  {
    id: "2686520d-bf11-4faa-b614-389ab62a9d86",
    title: "First Note",
    note: "Content A",
  },
  {
    id: "9db2ac03-2ee9-4390-a2fe-088472fd398b",
    title: "Second Note",
    note: "Content B",
  },
]

describe("loadNoteById:", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns the matching note when it exists in localStorage", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    const result = loadNoteById({ params: { noteId: mockNotes[0].id } })

    expect(result).toEqual(mockNotes[0])
  })

  it("returns undefined when the note id does not match any stored note", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    const result = loadNoteById({
      params: { noteId: "00000000-0000-0000-0000-000000000000" },
    })

    expect(result).toBeUndefined()
  })

  it("returns undefined when localStorage is empty", () => {
    const result = loadNoteById({ params: { noteId: mockNotes[0].id } })

    expect(result).toBeUndefined()
  })

  it("returns the correct note when multiple notes are stored", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    const result = loadNoteById({ params: { noteId: mockNotes[1].id } })

    expect(result).toEqual(mockNotes[1])
  })
})
