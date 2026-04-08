import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { setupTest } from "@/testSetups/TestProviderWrapper"
import { useBackNavigation } from "./useBackNavigation"

const mockLoadNoteById = vi.fn()

vi.mock("@/features/noteView/utils/loadNoteById", () => ({
  loadNoteById: (...args: unknown[]) => mockLoadNoteById(...args),
}))

const TestComponent = () => {
  const { isRoot, onBackClicked } = useBackNavigation()
  return (
    <>
      <span data-testid="is-root">{String(isRoot)}</span>
      <button onClick={onBackClicked}>Back</button>
    </>
  )
}

const NOTE_ID = "3b78d809-c82e-495d-a6c5-89a9f151b674"

describe("useBackNavigation:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe("isRoot:", () => {
    it("returns true when the current path is '/'", async () => {
      await setupTest(<TestComponent />, "/", "/")
      expect(screen.getByTestId("is-root").textContent).toBe("true")
    })

    it("returns false when the current path is not '/'", async () => {
      await setupTest(<TestComponent />, "/note/$noteId", `/note/${NOTE_ID}`)
      expect(screen.getByTestId("is-root").textContent).toBe("false")
    })
  })

  describe("onBackClicked — non-edit routes:", () => {
    it("navigates to '/' from a top-level path", async () => {
      const router = await setupTest(<TestComponent />, "/note", "/note")
      const user = userEvent.setup()

      await user.click(screen.getByRole("button", { name: "Back" }))

      expect(router.state.location.pathname).toBe("/")
    })

    it("navigates to the parent segment from a nested path", async () => {
      const router = await setupTest(
        <TestComponent />,
        "/note/$noteId",
        `/note/${NOTE_ID}`,
      )
      const user = userEvent.setup()

      await user.click(screen.getByRole("button", { name: "Back" }))

      expect(router.state.location.pathname).toBe("/note")
    })
  })

  describe("onBackClicked — edit routes:", () => {
    it("navigates to '/' when the note does not exist (new note flow)", async () => {
      mockLoadNoteById.mockReturnValue(undefined)

      const router = await setupTest(
        <TestComponent />,
        "/note/$noteId/edit",
        `/note/${NOTE_ID}/edit`,
      )
      const user = userEvent.setup()

      await user.click(screen.getByRole("button", { name: "Back" }))

      expect(mockLoadNoteById).toHaveBeenCalledWith({
        params: { noteId: NOTE_ID },
      })
      expect(router.state.location.pathname).toBe("/")
    })

    it("navigates to the parent note view when the note exists", async () => {
      mockLoadNoteById.mockReturnValue({
        id: NOTE_ID,
        title: "Existing Note",
        timestamp: "April 5, 2026 9:45pm",
      })

      const router = await setupTest(
        <TestComponent />,
        "/note/$noteId/edit",
        `/note/${NOTE_ID}/edit`,
      )
      const user = userEvent.setup()

      await user.click(screen.getByRole("button", { name: "Back" }))

      expect(router.state.location.pathname).toBe(`/note/${NOTE_ID}`)
    })
  })
})
