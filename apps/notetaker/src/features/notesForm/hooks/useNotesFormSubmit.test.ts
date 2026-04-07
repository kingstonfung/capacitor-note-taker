import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useNotesFormSubmit } from "./useNotesFormSubmit"

const mockNote = {
  id: "3401a996-1ce7-4cc9-9de2-d901056cc33a",
  title: "Test Note",
  note: "Some note content",
  timestamp: "April 7, 2026 9:31pm",
}

describe("useNotesFormSubmit hook:", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("writes a new note to localStorage and sets isSuccess", () => {
    const { result } = renderHook(() => useNotesFormSubmit())

    act(() => {
      result.current.onSubmit(mockNote)
    })

    expect(result.current.isSuccess).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.savedNote).toEqual(mockNote)

    const stored = JSON.parse(localStorage.getItem("notes") ?? "[]")
    expect(stored).toHaveLength(1)
    expect(stored[0]).toEqual(mockNote)
  })

  it("appends to an existing notes array in localStorage", () => {
    const existingNote = {
      id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      title: "Existing Note",
    }
    localStorage.setItem("notes", JSON.stringify([existingNote]))

    const { result } = renderHook(() => useNotesFormSubmit())

    act(() => {
      result.current.onSubmit(mockNote)
    })

    const stored = JSON.parse(localStorage.getItem("notes") ?? "[]")
    expect(stored).toHaveLength(2)
    expect(stored[1]).toEqual(mockNote)
  })

  it("sets isError when localStorage throws", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage full")
    })

    const { result } = renderHook(() => useNotesFormSubmit())

    act(() => {
      result.current.onSubmit(mockNote)
    })

    expect(result.current.isError).toBe(true)
    expect(result.current.isSuccess).toBe(false)

    consoleErrorSpy.mockRestore()
  })

  it("updates an existing note in localStorage when id matches", () => {
    localStorage.setItem("notes", JSON.stringify([mockNote]))

    const updatedNote = { ...mockNote, title: "Updated Title" }
    const { result } = renderHook(() => useNotesFormSubmit())

    act(() => {
      result.current.onSubmit(updatedNote)
    })

    expect(result.current.isSuccess).toBe(true)
    expect(result.current.savedNote).toEqual(updatedNote)

    const stored = JSON.parse(localStorage.getItem("notes") ?? "[]")
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe("Updated Title")
  })

  it("reset clears success and error state", () => {
    const { result } = renderHook(() => useNotesFormSubmit())

    act(() => {
      result.current.onSubmit(mockNote)
    })

    expect(result.current.isSuccess).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.isSuccess).toBe(false)
    expect(result.current.savedNote).toBeNull()
  })
})
