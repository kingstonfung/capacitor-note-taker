import { describe, it, expect, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useNoteSearch } from "./useNoteSearch"

const NOTES_STORAGE_KEY = "notes"

const sampleNotes = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "React Tips",
    timestamp: "Jan 1",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Vue Guide",
    timestamp: "Jan 2",
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    title: "react hooks",
    timestamp: "Jan 3",
  },
]

describe("useNoteSearch:", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns empty array for an empty query", () => {
    const { result } = renderHook(() => useNoteSearch(""))
    expect(result.current).toEqual([])
  })

  it("returns empty array when query is shorter than 3 chars", () => {
    const { result } = renderHook(() => useNoteSearch("ab"))
    expect(result.current).toEqual([])
  })

  it("searches when query is exactly 3 chars", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sampleNotes))
    const { result } = renderHook(() => useNoteSearch("vue"))
    expect(result.current).toHaveLength(1)
  })

  it("returns empty array when localStorage has no notes", () => {
    const { result } = renderHook(() => useNoteSearch("react"))
    expect(result.current).toEqual([])
  })

  it("returns all notes whose title matches the query", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sampleNotes))
    const { result } = renderHook(() => useNoteSearch("react"))
    expect(result.current).toHaveLength(2)
  })

  it("filters case-insensitively", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sampleNotes))
    const { result } = renderHook(() => useNoteSearch("REACT"))
    expect(result.current).toHaveLength(2)
  })

  it("returns empty array when no notes match", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sampleNotes))
    const { result } = renderHook(() => useNoteSearch("angular"))
    expect(result.current).toEqual([])
  })

  it("returns empty array when localStorage contains invalid JSON", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, "not-json")
    const { result } = renderHook(() => useNoteSearch("react"))
    expect(result.current).toEqual([])
  })

  it("returns empty array when notes fail schema validation", () => {
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify([{ title: "", timestamp: "" }]),
    )
    const { result } = renderHook(() => useNoteSearch("react"))
    expect(result.current).toEqual([])
  })
})
