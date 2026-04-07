import { describe, it, expect } from "vitest"
import { sortNotes } from "./sortNotes"
import { mockNotes } from "./testUtils/mockNotes"

describe("sortNotes:", () => {
  it("reverses the order of the notes array", () => {
    const result = sortNotes([...mockNotes])

    expect(result[0]).toEqual(mockNotes[1])
    expect(result[1]).toEqual(mockNotes[0])
  })

  it("returns an empty array when given an empty array", () => {
    const result = sortNotes([])

    expect(result).toEqual([])
  })
})
