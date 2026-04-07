import { describe, it, expect } from "vitest"
import { NotesSchema } from "./notes"

describe("NotesSchema:", () => {
  const validNote = {
    id: "3b78d809-c82e-495d-a6c5-89a9f151b674",
    title: "My Note",
    timestamp: "April 5, 2026 9:45pm",
  }

  it("parses a valid note with all required fields", () => {
    const result = NotesSchema.safeParse(validNote)
    expect(result.success).toBe(true)
  })

  it("generates a default UUID when id is omitted", () => {
    const { id: _id, ...withoutId } = validNote
    const result = NotesSchema.safeParse(withoutId)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      )
    }
  })

  it("fails when title is an empty string", () => {
    const result = NotesSchema.safeParse({ ...validNote, title: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required")
    }
  })

  it("fails when title is missing", () => {
    const { title: _title, ...withoutTitle } = validNote
    const result = NotesSchema.safeParse(withoutTitle)
    expect(result.success).toBe(false)
  })

  it("fails when timestamp is empty", () => {
    const result = NotesSchema.safeParse({ ...validNote, timestamp: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Timestamp is required")
    }
  })

  it("allows an optional note field", () => {
    const withNote = { ...validNote, note: "Some body text" }
    const result = NotesSchema.safeParse(withNote)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.note).toBe("Some body text")
    }
  })

  it("allows note to be undefined", () => {
    const result = NotesSchema.safeParse(validNote)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.note).toBeUndefined()
    }
  })

  it("allows an optional hasAudio field", () => {
    const withAudio = { ...validNote, hasAudio: true }
    const result = NotesSchema.safeParse(withAudio)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hasAudio).toBe(true)
    }
  })

  it("fails when id is not a valid UUID", () => {
    const result = NotesSchema.safeParse({ ...validNote, id: "not-a-uuid" })
    expect(result.success).toBe(false)
  })
})
