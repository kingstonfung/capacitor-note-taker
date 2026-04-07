import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { NOTES_STORAGE_KEY } from "@/constants/storage"
import { NoteView } from "./NoteView"

const mockNote = {
  id: "2686520d-bf11-4faa-b614-389ab62a9d86",
  title: "My Test Note",
  note: "Some content here",
  timestamp: "April 7, 2026 9:32pm",
}

const renderComponent = (props: Parameters<typeof NoteView>[0]) =>
  setupTest(<NoteView {...props} />, "/", "/")

describe("NoteView:", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders nothing when no note is provided", async () => {
    await renderComponent({})

    expect(screen.queryByRole("article")).toBeNull()
  })

  it("renders the note title and body", async () => {
    await renderComponent({ note: mockNote })

    expect(screen.getByRole("heading", { name: mockNote.title })).not.toBeNull()
    expect(screen.getByText(mockNote.note)).not.toBeNull()
  })

  it("does not render the body paragraph when note text is absent", async () => {
    const noteWithoutBody = { ...mockNote, note: undefined }

    await renderComponent({ note: noteWithoutBody })

    expect(screen.queryByText("Some content here")).toBeNull()
  })

  it("renders the Edit link pointing to the correct edit path", async () => {
    await renderComponent({ note: mockNote })

    const editLink = screen.getByRole("link", { name: "Edit" })
    expect(editLink.getAttribute("href")).toBe(`/note/${mockNote.id}/edit`)
  })

  it("clicking Delete Note removes the note from localStorage", async () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([mockNote]))
    const user = userEvent.setup()

    await renderComponent({ note: mockNote })

    await user.click(screen.getByRole("button", { name: /delete note/i }))

    const stored = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? "[]")
    expect(stored).toHaveLength(0)
  })

  it("clicking Delete Note only removes the current note, leaving others intact", async () => {
    const otherNote = {
      id: "9db2ac03-2ee9-4390-a2fe-088472fd398b",
      title: "Other Note",
    }
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify([mockNote, otherNote]),
    )
    const user = userEvent.setup()

    await renderComponent({ note: mockNote })

    await user.click(screen.getByRole("button", { name: /delete note/i }))

    const stored = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) ?? "[]")
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe(otherNote.id)
  })
})
