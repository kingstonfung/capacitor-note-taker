import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useRecorderMethods } from "./useRecorderMethods"

const mockStartRecording = vi.fn()
const mockStopRecording = vi.fn()
const mockDeleteRecording = vi.fn()

vi.mock("../utils/audioRecorderUtils", () => ({
  startRecording: (...args: unknown[]) => mockStartRecording(...args),
  stopRecording: () => mockStopRecording(),
}))

vi.mock("@/common/voiceMemoDB/utils/deleteRecording", () => ({
  deleteRecording: (...args: unknown[]) => mockDeleteRecording(...args),
}))

const TEST_UUID = "3b78d809-c82e-495d-a6c5-89a9f151b674"

describe("useRecorderMethods hook:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteRecording.mockResolvedValue(undefined)
  })

  it("starts with recordingState = 'idle'", () => {
    const { result } = renderHook(() => useRecorderMethods({ uuid: TEST_UUID }))
    expect(result.current.recordingState).toBe("idle")
  })

  it("transitions to 'recording' when start() succeeds", async () => {
    mockStartRecording.mockImplementation(async (_uuid: string) => {
      return true
    })

    const { result } = renderHook(() => useRecorderMethods({ uuid: TEST_UUID }))

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.recordingState).toBe("recording")
  })

  it("stays 'idle' when start() returns false (e.g. permission denied)", async () => {
    mockStartRecording.mockResolvedValue(false)

    const { result } = renderHook(() => useRecorderMethods({ uuid: TEST_UUID }))

    await act(async () => {
      await result.current.start()
    })

    expect(result.current.recordingState).toBe("idle")
  })

  it("calls stopRecording when stop() is called", () => {
    const { result } = renderHook(() => useRecorderMethods({ uuid: TEST_UUID }))

    act(() => {
      result.current.stop()
    })

    expect(mockStopRecording).toHaveBeenCalledTimes(1)
  })

  it("transitions to 'done' when the onComplete callback fires", async () => {
    const onRecordingComplete = vi.fn()
    let capturedOnComplete: ((id: string) => void) | undefined

    mockStartRecording.mockImplementation(
      async (_uuid: string, onComplete: (id: string) => void) => {
        capturedOnComplete = onComplete
        return true
      },
    )

    const { result } = renderHook(() =>
      useRecorderMethods({ uuid: TEST_UUID, onRecordingComplete }),
    )

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      capturedOnComplete?.("recording-id-123")
    })

    expect(result.current.recordingState).toBe("done")
    expect(onRecordingComplete).toHaveBeenCalledWith("recording-id-123")
  })

  it("handleDelete resets to 'idle' and calls onRecordingDelete", async () => {
    const onRecordingDelete = vi.fn()
    let capturedOnComplete: ((id: string) => void) | undefined

    mockStartRecording.mockImplementation(
      async (_uuid: string, onComplete: (id: string) => void) => {
        capturedOnComplete = onComplete
        return true
      },
    )

    const { result } = renderHook(() =>
      useRecorderMethods({ uuid: TEST_UUID, onRecordingDelete }),
    )

    await act(async () => {
      await result.current.start()
    })

    act(() => {
      capturedOnComplete?.("recording-id-456")
    })

    await act(async () => {
      await result.current.handleDelete()
    })

    expect(mockDeleteRecording).toHaveBeenCalledWith("recording-id-456")
    expect(result.current.recordingState).toBe("idle")
    expect(onRecordingDelete).toHaveBeenCalledTimes(1)
  })
})
