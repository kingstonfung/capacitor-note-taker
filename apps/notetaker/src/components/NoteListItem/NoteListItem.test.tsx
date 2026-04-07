import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { NoteListItem } from "./NoteListItem"
import type { Notes } from "@/schemas/notes"

const mockNote: Notes = {
  id: "2686520d-bf11-4faa-b614-389ab62a9d86",
  title: "Shopping List",
  timestamp: "April 5, 2026 9:45pm",
}

const renderComponent = (note: Notes) =>
  setupTest(<NoteListItem note={note} />, "/", "/")

describe("NoteListItem:", () => {
  it("renders the note title", async () => {
    await renderComponent(mockNote)

    expect(screen.getByText("Shopping List")).not.toBeNull()
  })

  it("links to the correct note path", async () => {
    await renderComponent(mockNote)

    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toBe(`/note/${mockNote.id}`)
  })

  it("renders the timestamp when present", async () => {
    await renderComponent(mockNote)

    expect(screen.getByText("April 5, 2026 9:45pm")).not.toBeNull()
  })

  it("does not render a timestamp element when timestamp is absent", async () => {
    const noteWithoutTimestamp = { ...mockNote, timestamp: "" } as Notes
    await renderComponent(noteWithoutTimestamp)

    const spans = screen.queryAllByText("")
    const timestampSpan = spans.find(
      (el) => el.tagName === "SPAN" && el.textContent === "",
    )
    expect(timestampSpan).toBeUndefined()
  })

  it("renders as a list item", async () => {
    await renderComponent(mockNote)

    expect(screen.getByRole("listitem")).not.toBeNull()
  })
})
