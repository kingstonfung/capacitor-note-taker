import { describe, it, expect, vi, beforeEach } from "vitest"
import { finalizeRecording } from "./finalizeRecording"
import { resetVoiceMemoDB } from "./getDB"

const mockDbPut = vi.fn().mockResolvedValue(undefined)
const mockOpenDB = vi.fn()

vi.mock("idb", () => ({
  openDB: (...args: unknown[]) => mockOpenDB(...args),
}))

const makeDB = () => {
  return { put: mockDbPut }
}

describe("finalizeRecording:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetVoiceMemoDB()
    mockDbPut.mockResolvedValue(undefined)
    mockOpenDB.mockResolvedValue(makeDB())
  })

  it("writes an entry to the recordings store with the correct id", async () => {
    await finalizeRecording(
      "sid-1",
      [{ sessionId: "sid-1", sequence: 0, data: new ArrayBuffer(4) }],
      "audio/webm",
    )
    expect(mockDbPut).toHaveBeenCalledWith(
      "recordings",
      expect.objectContaining({ id: "sid-1" }),
    )
  })

  it("uses the provided mimeType", async () => {
    await finalizeRecording(
      "sid-1",
      [{ sessionId: "sid-1", sequence: 0, data: new ArrayBuffer(4) }],
      "audio/webm",
    )
    expect(mockDbPut).toHaveBeenCalledWith(
      "recordings",
      expect.objectContaining({ mimeType: "audio/webm" }),
    )
  })

  it("falls back to audio/mp4 when activeMimeType is empty", async () => {
    await finalizeRecording(
      "sid-1",
      [{ sessionId: "sid-1", sequence: 0, data: new ArrayBuffer(4) }],
      "",
    )
    expect(mockDbPut).toHaveBeenCalledWith(
      "recordings",
      expect.objectContaining({ mimeType: "audio/mp4" }),
    )
  })

  it("sets size equal to the buffer byteLength", async () => {
    await finalizeRecording(
      "sid-1",
      [{ sessionId: "sid-1", sequence: 0, data: new ArrayBuffer(8) }],
      "audio/webm",
    )
    const saved = mockDbPut.mock.calls[0][1]
    expect(saved.size).toBe(saved.buffer.byteLength)
  })

  it("sets createdAt as a valid ISO timestamp", async () => {
    await finalizeRecording(
      "sid-1",
      [{ sessionId: "sid-1", sequence: 0, data: new ArrayBuffer(4) }],
      "audio/webm",
    )
    const saved = mockDbPut.mock.calls[0][1]
    expect(saved.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(new Date(saved.createdAt).getTime()).not.toBeNaN()
  })

  it("includes all chunk data in the stored buffer", async () => {
    const chunks = [
      { sessionId: "sid-1", sequence: 0, data: new ArrayBuffer(4) },
      { sessionId: "sid-1", sequence: 1, data: new ArrayBuffer(4) },
    ]
    await finalizeRecording("sid-1", chunks, "audio/webm")
    const saved = mockDbPut.mock.calls[0][1]
    expect(saved.buffer.byteLength).toBe(8)
  })
})
