import { describe, it, expect, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { NOTES_STORAGE_KEY } from "@/constants/storage"
import { NotesListing } from "./NotesListing"

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

const renderComponent = () => setupTest(<NotesListing />, "/", "/")

describe("NotesListing:", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("shows empty state when there are no notes", async () => {
    await renderComponent()

    expect(
      screen.getByText("No notes yet. Create one to get started!"),
    ).not.toBeNull()
  })

  it("renders a title for each note in localStorage", async () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    await renderComponent()

    expect(screen.getByText("First Note")).not.toBeNull()
    expect(screen.getByText("Second Note")).not.toBeNull()
  })

  it("each note title links to the correct note path", async () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    await renderComponent()

    const firstLink = screen.getByText(mockNotes[0].title).closest("a")
    const secondLink = screen.getByText(mockNotes[1].title).closest("a")

    expect(firstLink?.getAttribute("href")).toBe(`/note/${mockNotes[0].id}`)
    expect(secondLink?.getAttribute("href")).toBe(`/note/${mockNotes[1].id}`)
  })

  it("does not show Delete All button when there are no notes", async () => {
    await renderComponent()

    expect(screen.queryByRole("button", { name: /delete all/i })).toBeNull()
  })

  it("does not show Delete All button when notes exist", async () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockNotes))

    await renderComponent()

    expect(screen.queryByRole("button", { name: /delete all/i })).toBeNull()
  })
})
