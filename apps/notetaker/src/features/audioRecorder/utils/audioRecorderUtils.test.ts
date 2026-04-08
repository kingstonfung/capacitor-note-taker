import { describe, it, expect, vi, beforeEach } from "vitest"
import { startRecording, stopRecording } from "./audioRecorderUtils"

const mockGetMimeType = vi.fn()
const mockHandleMicError = vi.fn()
const mockGetDB = vi.fn()
const mockDeleteChunks = vi.fn()
const mockFinalizeRecording = vi.fn()
const mockGetPlatform = vi.fn()
const mockGetUserMedia = vi.fn()

vi.mock("@/common/voiceMemoDB/utils/microphoneUtils", () => ({
  getMimeType: () => mockGetMimeType(),
  handleMicError: (...args: unknown[]) => mockHandleMicError(...args),
}))

vi.mock("@/common/voiceMemoDB/utils/getDB", () => ({
  getDB: () => mockGetDB(),
}))

vi.mock("@/common/voiceMemoDB/utils/deleteChunks", () => ({
  deleteChunks: (...args: unknown[]) => mockDeleteChunks(...args),
}))

vi.mock("@/common/voiceMemoDB/utils/finalizeRecording", () => ({
  finalizeRecording: (...args: unknown[]) => mockFinalizeRecording(...args),
}))

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: () => mockGetPlatform(),
  },
}))

vi.stubGlobal("navigator", {
  mediaDevices: { getUserMedia: mockGetUserMedia },
})

const TEST_UUID = "3b78d809-c82e-495d-a6c5-89a9f151b674"
const MOCK_MIME_TYPE = "audio/webm;codecs=opus"

const buildMockDB = () => ({
  put: vi.fn().mockResolvedValue(undefined),
  add: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  getAllFromIndex: vi.fn().mockResolvedValue([]),
})

const buildMockStream = () => {
  const mockTrack = { stop: vi.fn() }
  return {
    mockTrack,
    stream: { getTracks: () => [mockTrack] } as unknown as MediaStream,
  }
}

const buildMockMediaRecorder = (mimeType = MOCK_MIME_TYPE) => ({
  mimeType,
  state: "inactive" as RecordingState,
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null as ((e: BlobEvent) => void) | null,
  onstop: null as (() => void) | null,
})

describe("startRecording:", () => {
  let mockDB: ReturnType<typeof buildMockDB>
  let mockStream: ReturnType<typeof buildMockStream>
  let mockRecorder: ReturnType<typeof buildMockMediaRecorder>
  let MockMediaRecorder: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockDB = buildMockDB()
    mockStream = buildMockStream()
    mockRecorder = buildMockMediaRecorder()

    mockGetDB.mockResolvedValue(mockDB)
    mockGetMimeType.mockReturnValue(MOCK_MIME_TYPE)
    mockGetPlatform.mockReturnValue("web")
    mockDeleteChunks.mockResolvedValue(undefined)
    mockFinalizeRecording.mockResolvedValue(undefined)
    mockGetUserMedia.mockResolvedValue(mockStream.stream)

    MockMediaRecorder = vi.fn().mockImplementation(() => mockRecorder)
    ;(MockMediaRecorder as any).isTypeSupported = vi.fn().mockReturnValue(true)

    Object.defineProperty(globalThis, "MediaRecorder", {
      value: MockMediaRecorder,
      writable: true,
      configurable: true,
    })
  })

  it("returns true when recording starts successfully", async () => {
    const result = await startRecording(TEST_UUID, vi.fn())
    expect(result).toBe(true)
  })

  it("calls getUserMedia with detailed audio constraints on non-android platforms", async () => {
    mockGetPlatform.mockReturnValue("web")
    await startRecording(TEST_UUID, vi.fn())

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        channelCount: 1,
      },
    })
  })

  it("calls getUserMedia with simple audio: true on android", async () => {
    mockGetPlatform.mockReturnValue("android")
    await startRecording(TEST_UUID, vi.fn())

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it("stores the session uuid in the meta store", async () => {
    await startRecording(TEST_UUID, vi.fn())
    expect(mockDB.put).toHaveBeenCalledWith("meta", TEST_UUID, "in-progress-session")
  })

  it("constructs MediaRecorder with the detected mimeType", async () => {
    await startRecording(TEST_UUID, vi.fn())
    expect(MockMediaRecorder).toHaveBeenCalledWith(mockStream.stream, {
      mimeType: MOCK_MIME_TYPE,
    })
  })

  it("constructs MediaRecorder with no options when mimeType is empty", async () => {
    mockGetMimeType.mockReturnValue("")
    mockRecorder.mimeType = ""
    await startRecording(TEST_UUID, vi.fn())
    expect(MockMediaRecorder).toHaveBeenCalledWith(mockStream.stream, {})
  })

  it("starts the recorder with a 1000ms timeslice", async () => {
    await startRecording(TEST_UUID, vi.fn())
    expect(mockRecorder.start).toHaveBeenCalledWith(1_000)
  })

  it("writes audio chunk data to the database on ondataavailable", async () => {
    await startRecording(TEST_UUID, vi.fn())

    const buffer = new ArrayBuffer(8)
    const mockBlob = { size: 8, arrayBuffer: vi.fn().mockResolvedValue(buffer) }
    const event = { data: mockBlob } as unknown as BlobEvent

    await mockRecorder.ondataavailable?.(event)

    expect(mockDB.add).toHaveBeenCalledWith("chunks", {
      sessionId: TEST_UUID,
      sequence: 0,
      data: buffer,
    })
  })

  it("skips writing empty blobs on ondataavailable", async () => {
    await startRecording(TEST_UUID, vi.fn())

    const event = { data: { size: 0 } } as unknown as BlobEvent
    await mockRecorder.ondataavailable?.(event)

    expect(mockDB.add).not.toHaveBeenCalled()
  })

  it("increments the chunk sequence for each data chunk", async () => {
    await startRecording(TEST_UUID, vi.fn())

    const makeEvent = () =>
      ({
        data: {
          size: 4,
          arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
        },
      }) as unknown as BlobEvent

    await mockRecorder.ondataavailable?.(makeEvent())
    await mockRecorder.ondataavailable?.(makeEvent())

    const calls = mockDB.add.mock.calls
    expect(calls[0][1].sequence).toBe(0)
    expect(calls[1][1].sequence).toBe(1)
  })

  it("finalizes the recording, deletes chunks, and calls onComplete on onstop", async () => {
    const onComplete = vi.fn()
    const chunk = { sessionId: TEST_UUID, sequence: 0, data: new ArrayBuffer(4) }
    mockDB.getAllFromIndex.mockResolvedValue([chunk])

    await startRecording(TEST_UUID, onComplete)
    await mockRecorder.onstop?.()

    expect(mockFinalizeRecording).toHaveBeenCalledWith(
      TEST_UUID,
      [chunk],
      MOCK_MIME_TYPE,
    )
    expect(mockDeleteChunks).toHaveBeenCalledWith(TEST_UUID)
    expect(mockDB.delete).toHaveBeenCalledWith("meta", "in-progress-session")
    expect(onComplete).toHaveBeenCalledWith(TEST_UUID)
  })

  it("sorts chunks by sequence before finalizing", async () => {
    const chunkB = { sessionId: TEST_UUID, sequence: 1, data: new ArrayBuffer(4) }
    const chunkA = { sessionId: TEST_UUID, sequence: 0, data: new ArrayBuffer(4) }
    mockDB.getAllFromIndex.mockResolvedValue([chunkB, chunkA])

    await startRecording(TEST_UUID, vi.fn())
    await mockRecorder.onstop?.()

    expect(mockFinalizeRecording).toHaveBeenCalledWith(
      TEST_UUID,
      [chunkA, chunkB],
      MOCK_MIME_TYPE,
    )
  })

  it("stops all media tracks on onstop", async () => {
    await startRecording(TEST_UUID, vi.fn())
    await mockRecorder.onstop?.()

    expect(mockStream.mockTrack.stop).toHaveBeenCalledTimes(1)
  })

  it("returns false and calls handleMicError when getUserMedia throws", async () => {
    const micError = new DOMException("", "NotAllowedError")
    mockGetUserMedia.mockRejectedValue(micError)

    const result = await startRecording(TEST_UUID, vi.fn())

    expect(result).toBe(false)
    expect(mockHandleMicError).toHaveBeenCalledWith(micError)
  })

  it("stops stream tracks before calling handleMicError if stream was acquired", async () => {
    mockGetDB.mockRejectedValue(new DOMException("IDB failure"))

    await startRecording(TEST_UUID, vi.fn())

    expect(mockStream.mockTrack.stop).toHaveBeenCalledTimes(1)
  })
})

describe("stopRecording:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does nothing when no recording has been started", () => {
    expect(() => stopRecording()).not.toThrow()
  })

  it("calls stop() on the active MediaRecorder when it is not inactive", async () => {
    const mockDB = buildMockDB()
    const { stream } = buildMockStream()
    const mockRecorder = buildMockMediaRecorder()
    mockRecorder.state = "recording"

    const MockMediaRecorder = vi.fn().mockImplementation(() => mockRecorder)
    Object.defineProperty(globalThis, "MediaRecorder", {
      value: MockMediaRecorder,
      writable: true,
      configurable: true,
    })

    mockGetDB.mockResolvedValue(mockDB)
    mockGetMimeType.mockReturnValue(MOCK_MIME_TYPE)
    mockGetPlatform.mockReturnValue("web")
    mockGetUserMedia.mockResolvedValue(stream)

    await startRecording(TEST_UUID, vi.fn())
    stopRecording()

    expect(mockRecorder.stop).toHaveBeenCalledTimes(1)
  })
})
