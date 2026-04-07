import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useNewNote } from "./useNewNote"

const mockNavigate = vi.fn()

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

describe("useNewNote hook:", () => {
  it("calls navigate with the correct route and a UUID param when handleNewNote is invoked", () => {
    const { result } = renderHook(() => useNewNote())

    act(() => {
      result.current.handleNewNote()
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    const callArg = mockNavigate.mock.calls[0][0]
    expect(callArg.to).toBe("/note/$noteId/edit")
    expect(callArg.params.noteId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  })

  it("generates a unique UUID on each call", () => {
    const { result } = renderHook(() => useNewNote())

    act(() => {
      result.current.handleNewNote()
      result.current.handleNewNote()
    })

    const firstId = mockNavigate.mock.calls[0][0].params.noteId
    const secondId = mockNavigate.mock.calls[1][0].params.noteId
    expect(firstId).not.toBe(secondId)
  })
})
