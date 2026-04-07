import { describe, it, expect, beforeEach, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { NotesForm } from "./NotesForm"

const mockOnSubmit = vi.fn()
const exampleUUID = "3b78d809-c82e-495d-a6c5-89a9f151b674"

vi.mock("./hooks/useNotesFormSubmit", () => ({
  useNotesFormSubmit: () => ({
    onSubmit: mockOnSubmit,
    isSuccess: false,
    isError: false,
    savedNote: null,
    reset: vi.fn(),
  }),
}))

describe("NotesForm validation behavior:", () => {
  const initPage = async () => {
    const user = userEvent.setup()

    await setupTest(<NotesForm noteId={exampleUUID} />, "/", "/")

    return user
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows a validation error when submitting without a title", async () => {
    const user = await initPage()

    const submitButton = screen.getByRole("button", { name: "Save Note" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Title is required")).not.toBeNull()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it("calls onSubmit when the form is valid", async () => {
    const user = await initPage()

    await user.type(screen.getByLabelText("Title"), "My first note")
    await user.type(screen.getByLabelText("Note"), "Some content here")

    const submitButton = screen.getByRole("button", { name: "Save Note" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it("calls onSubmit with only a title (note is optional)", async () => {
    const user = await initPage()

    await user.type(screen.getByLabelText("Title"), "Title only note")

    const submitButton = screen.getByRole("button", { name: "Save Note" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})
