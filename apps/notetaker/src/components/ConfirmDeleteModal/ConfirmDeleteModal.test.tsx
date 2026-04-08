import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"

const onConfirm = vi.fn()
const onClose = vi.fn()

describe("ConfirmDeleteModal:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering:", () => {
    it("renders nothing when isOpen is false", () => {
      render(
        <ConfirmDeleteModal
          isOpen={false}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      expect(screen.queryByRole("dialog")).toBeNull()
    })

    it("renders the modal dialog when isOpen is true", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      expect(screen.getByRole("dialog")).not.toBeNull()
    })

    it("displays the confirmation title text", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      expect(screen.getByText("Delete all notes?")).not.toBeNull()
    })

    it("displays the warning body text", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      expect(screen.getByText("This action cannot be undone.")).not.toBeNull()
    })

    it("renders a Cancel button", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull()
    })

    it("renders a Delete button", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      expect(screen.getByRole("button", { name: "Delete" })).not.toBeNull()
    })
  })

  describe("overlay click:", () => {
    it("calls onClose when the overlay is clicked", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.click(screen.getByRole("dialog"))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("does not call onClose when the inner modal content is clicked", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.click(screen.getByText("Delete all notes?"))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe("Cancel button:", () => {
    it("calls onClose when Cancel is clicked", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("does not call onConfirm when Cancel is clicked", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe("Delete button:", () => {
    it("calls onConfirm when Delete is clicked", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.click(screen.getByRole("button", { name: "Delete" }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it("does not call onClose when Delete is clicked", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.click(screen.getByRole("button", { name: "Delete" }))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe("Escape key:", () => {
    it("calls onClose when Escape is pressed while open", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.keyDown(document, { key: "Escape" })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("does not call onClose when Escape is pressed while closed", () => {
      render(
        <ConfirmDeleteModal
          isOpen={false}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.keyDown(document, { key: "Escape" })
      expect(onClose).not.toHaveBeenCalled()
    })

    it("does not call onClose for other keys", () => {
      render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )
      fireEvent.keyDown(document, { key: "Enter" })
      expect(onClose).not.toHaveBeenCalled()
    })

    it("removes the keydown listener when the modal closes", () => {
      const { rerender } = render(
        <ConfirmDeleteModal
          isOpen={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )

      rerender(
        <ConfirmDeleteModal
          isOpen={false}
          onConfirm={onConfirm}
          onClose={onClose}
        />,
      )

      fireEvent.keyDown(document, { key: "Escape" })
      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
