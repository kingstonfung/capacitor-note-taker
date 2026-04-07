import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAudioLoader } from "./useAudioLoader"

const mockPreparePlayback = vi.fn()

vi.mock("../utils/audioPlayback", () => ({
  preparePlayback: (...args: unknown[]) => mockPreparePlayback(...args),
}))

URL.createObjectURL = vi.fn(() => "blob:mock")
URL.revokeObjectURL = vi.fn()

describe("useAudioLoader hook:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("starts with loadState = 'idle'", () => {
    const { result } = renderHook(() => useAudioLoader("test-uuid"))
    expect(result.current.loadState).toBe("idle")
  })

  it("returns an audioRef and prepare function", () => {
    const { result } = renderHook(() => useAudioLoader("test-uuid"))
    expect(result.current.audioRef).toBeDefined()
    expect(typeof result.current.prepare).toBe("function")
  })

  it("transitions to 'ready' and returns true when preparePlayback succeeds", async () => {
    mockPreparePlayback.mockResolvedValue("blob:http://localhost/abc123")

    const { result } = renderHook(() => useAudioLoader("test-uuid"))

    Object.defineProperty(result.current.audioRef, "current", {
      value: document.createElement("audio"),
      writable: true,
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.prepare()
    })

    expect(success).toBe(true)
    expect(result.current.loadState).toBe("ready")
  })

  it("transitions to 'error' and returns false when preparePlayback returns null", async () => {
    mockPreparePlayback.mockResolvedValue(null)

    const { result } = renderHook(() => useAudioLoader("test-uuid"))

    Object.defineProperty(result.current.audioRef, "current", {
      value: document.createElement("audio"),
      writable: true,
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.prepare()
    })

    expect(success).toBe(false)
    expect(result.current.loadState).toBe("error")
  })

  it("transitions to 'error' and returns false when preparePlayback throws", async () => {
    mockPreparePlayback.mockRejectedValue(new Error("IDB error"))

    const { result } = renderHook(() => useAudioLoader("test-uuid"))

    Object.defineProperty(result.current.audioRef, "current", {
      value: document.createElement("audio"),
      writable: true,
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.prepare()
    })

    expect(success).toBe(false)
    expect(result.current.loadState).toBe("error")
  })

  it("returns true immediately without calling preparePlayback when already 'ready'", async () => {
    mockPreparePlayback.mockResolvedValue("blob:http://localhost/abc123")

    const { result } = renderHook(() => useAudioLoader("test-uuid"))

    Object.defineProperty(result.current.audioRef, "current", {
      value: document.createElement("audio"),
      writable: true,
    })

    await act(async () => {
      await result.current.prepare()
    })

    mockPreparePlayback.mockClear()

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.prepare()
    })

    expect(success).toBe(true)
    expect(mockPreparePlayback).not.toHaveBeenCalled()
  })
})
