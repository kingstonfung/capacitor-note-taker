import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAudioPlayback } from "./useAudioPlayback"
import type { RefObject } from "react"
import type { LoadState } from "./useAudioLoader"

const makeAudioEl = () => {
  const el = document.createElement("audio")
  el.play = vi.fn().mockResolvedValue(undefined)
  el.pause = vi.fn()
  return el
}

const makeRef = (
  el: HTMLAudioElement | null,
): RefObject<HTMLAudioElement | null> => {
  return { current: el }
}

describe("useAudioPlayback hook:", () => {
  const prepare = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    prepare.mockResolvedValue(true)
  })

  it("starts with playing=false, current=0, duration=0", () => {
    const audioRef = makeRef(null)
    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "idle",
        prepare,
        isProcessing: false,
      }),
    )
    expect(result.current.playing).toBe(false)
    expect(result.current.current).toBe(0)
    expect(result.current.duration).toBe(0)
  })

  it("calls alert and does not toggle when isProcessing is true", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})
    const audioEl = makeAudioEl()
    const audioRef = makeRef(audioEl)

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "ready",
        prepare,
        isProcessing: true,
      }),
    )

    await act(async () => {
      result.current.handleClick()
    })

    expect(alertSpy).toHaveBeenCalledWith(
      "Audio file is being processed. Please wait a moment.",
    )
    expect(audioEl.play).not.toHaveBeenCalled()
  })

  it("calls prepare and plays audio when paused and isProcessing is false", async () => {
    const audioEl = makeAudioEl()
    Object.defineProperty(audioEl, "paused", { value: true, writable: true })
    const audioRef = makeRef(audioEl)

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "idle",
        prepare,
        isProcessing: false,
      }),
    )

    await act(async () => {
      await result.current.handleClick()
    })

    expect(prepare).toHaveBeenCalled()
    expect(audioEl.play).toHaveBeenCalled()
  })

  it("pauses audio when already playing", async () => {
    const audioEl = makeAudioEl()
    Object.defineProperty(audioEl, "paused", { value: false, writable: true })
    const audioRef = makeRef(audioEl)

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "ready",
        prepare,
        isProcessing: false,
      }),
    )

    await act(async () => {
      await result.current.handleClick()
    })

    expect(audioEl.pause).toHaveBeenCalled()
    expect(audioEl.play).not.toHaveBeenCalled()
  })

  it("onPlay sets playing to true", () => {
    const audioRef = makeRef(makeAudioEl())

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "ready",
        prepare,
        isProcessing: false,
      }),
    )

    act(() => {
      result.current.audioEvents.onPlay()
    })

    expect(result.current.playing).toBe(true)
  })

  it("onPause sets playing to false", () => {
    const audioRef = makeRef(makeAudioEl())

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "ready",
        prepare,
        isProcessing: false,
      }),
    )

    act(() => {
      result.current.audioEvents.onPlay()
    })
    act(() => {
      result.current.audioEvents.onPause()
    })

    expect(result.current.playing).toBe(false)
  })

  it("onEnded resets playing and current to 0", () => {
    const audioRef = makeRef(makeAudioEl())

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "ready",
        prepare,
        isProcessing: false,
      }),
    )

    act(() => {
      result.current.audioEvents.onPlay()
    })
    act(() => {
      result.current.audioEvents.onEnded()
    })

    expect(result.current.playing).toBe(false)
    expect(result.current.current).toBe(0)
  })

  it("does not seek when loadState is not 'ready'", () => {
    const audioEl = makeAudioEl()
    const audioRef = makeRef(audioEl)

    const { result } = renderHook(() =>
      useAudioPlayback({
        audioRef,
        loadState: "idle" as LoadState,
        prepare,
        isProcessing: false,
      }),
    )

    act(() => {
      result.current.seek({
        target: { value: "30" },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(audioEl.currentTime).toBe(0)
  })
})
