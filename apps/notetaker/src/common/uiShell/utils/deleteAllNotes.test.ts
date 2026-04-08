import { describe, it, expect, vi, beforeEach } from "vitest"
import { delteAllNotes } from "./deleteAllNotes"
import { NOTES_STORAGE_KEY } from "@/constants/storage"

const mockNavigate = vi.fn()
const mockReload = vi.fn()

vi.mock("@/router", () => ({
  router: { navigate: (...args: unknown[]) => mockNavigate(...args) },
}))

vi.stubGlobal("location", { reload: mockReload })

describe("delteAllNotes:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("removes the notes key from localStorage", () => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([{ id: "1", title: "A" }]))

    delteAllNotes()

    expect(localStorage.getItem(NOTES_STORAGE_KEY)).toBeNull()
  })

  it("does not affect unrelated localStorage keys", () => {
    localStorage.setItem("important-key-item", "important-value")
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([]))

    delteAllNotes()

    expect(localStorage.getItem("important-key-item")).toBe("important-value")
  })

  it("navigates to the root route", () => {
    delteAllNotes()

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" })
  })

  it("reloads the page", () => {
    delteAllNotes()

    expect(mockReload).toHaveBeenCalledTimes(1)
  })

  it("navigates before reloading", () => {
    const order: string[] = []
    mockNavigate.mockImplementation(() => order.push("navigate"))
    mockReload.mockImplementation(() => order.push("reload"))

    delteAllNotes()

    expect(order).toEqual(["navigate", "reload"])
  })
})
