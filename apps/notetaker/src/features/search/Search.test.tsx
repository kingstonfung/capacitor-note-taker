import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Search } from "./Search"

vi.mock("@/components/NoteListItem/NoteListItem", () => ({
  NoteListItem: ({ note }: { note: { id: string; title: string } }) => (
    <div data-testid="note-list-item">{note.title}</div>
  ),
}))

const mockUseNoteSearch = vi.fn()
vi.mock("./hooks/useNoteSearch", () => ({
  useNoteSearch: (query: string) => mockUseNoteSearch(query),
}))

const onClose = vi.fn()

describe("Search:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNoteSearch.mockReturnValue([])
  })

  it("renders nothing when isOpen is false", () => {
    render(<Search isOpen={false} onClose={onClose} />)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("renders the search modal when isOpen is true", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    expect(screen.getByRole("dialog")).toBeTruthy()
  })

  it("calls onClose when the overlay is clicked", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole("dialog"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose when the inner modal area is clicked", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText("Search notes"))
    expect(onClose).not.toHaveBeenCalled()
  })

  it("calls onClose when the close button is clicked", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText("Close search"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when Escape is pressed while open", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("does not call onClose when Escape is pressed while closed", () => {
    render(<Search isOpen={false} onClose={onClose} />)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).not.toHaveBeenCalled()
  })

  it("does not call onClose for other keys", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.keyDown(document, { key: "Enter" })
    expect(onClose).not.toHaveBeenCalled()
  })

  it("shows no results message when query is longer than 3 chars and there are no results", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "abcd" },
    })
    expect(screen.getByText("No notes match your search.")).toBeTruthy()
  })

  it("does not show no results message when query is 3 chars or fewer", () => {
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "abc" },
    })
    expect(screen.queryByText("No notes match your search.")).toBeNull()
  })

  it("renders a result item for each note returned", () => {
    mockUseNoteSearch.mockReturnValue([
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        title: "Note A",
        timestamp: "Jan 1",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Note B",
        timestamp: "Jan 2",
      },
    ])
    render(<Search isOpen={true} onClose={onClose} />)
    expect(screen.getAllByTestId("note-list-item")).toHaveLength(2)
  })

  it("calls onClose when a result item is clicked", () => {
    mockUseNoteSearch.mockReturnValue([
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        title: "Note A",
        timestamp: "Jan 1",
      },
    ])
    render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByTestId("note-list-item"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("clears the query when isOpen transitions to false then back to true", () => {
    const { rerender } = render(<Search isOpen={true} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText("Search notes"), {
      target: { value: "hello" },
    })
    rerender(<Search isOpen={false} onClose={onClose} />)
    rerender(<Search isOpen={true} onClose={onClose} />)

    const input = screen.getByLabelText("Search notes")

    expect(input instanceof HTMLInputElement).toBe(true)

    if (!(input instanceof HTMLInputElement))
      throw new Error("Search input not found")
    expect(input.value).toBe("")
  })
})
