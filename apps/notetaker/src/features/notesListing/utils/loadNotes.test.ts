import { describe, it, expect, beforeEach } from "vitest"
import { NOTES_STORAGE_KEY } from "@/constants/storage"
import { loadNotes } from "./loadNotes"
import { mockNotes } from "./testUtils/mockNotes"

describe("loadNotes:", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns an empty array when localStorage has no notes", () => {
    const result = loadNotes()

    expect(result).toEqual([])
  })

  it("returns all notes stored in localStorage", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    const result = loadNotes()

    expect(result).toEqual(mockNotes)
  })
})
