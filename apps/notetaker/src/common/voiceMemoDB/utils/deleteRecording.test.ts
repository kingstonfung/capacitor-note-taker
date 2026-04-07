import { describe, it, expect, vi, beforeEach } from "vitest"
import { deleteRecording } from "./deleteRecording"
import { resetVoiceMemoDB } from "./getDB"

const mockDbDelete = vi.fn().mockResolvedValue(undefined)
const mockOpenDB = vi.fn()

vi.mock("idb", () => ({
  openDB: (...args: unknown[]) => mockOpenDB(...args),
}))

const mockIDBKeyRange = {
  only: (val: unknown) => val,
  bound: (lower: unknown, upper: unknown) => ({ lower, upper }),
  lowerBound: (val: unknown) => val,
  upperBound: (val: unknown) => val,
}
vi.stubGlobal("IDBKeyRange", mockIDBKeyRange)

const makeDB = () => {
  const txStore = {
    index: vi.fn(() => ({ openCursor: vi.fn().mockResolvedValue(null) })),
  }
  const tx = { objectStore: vi.fn(() => txStore), done: Promise.resolve() }
  return { delete: mockDbDelete, transaction: vi.fn(() => tx) }
}

describe("deleteRecording:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetVoiceMemoDB()
    mockDbDelete.mockResolvedValue(undefined)
    mockOpenDB.mockResolvedValue(makeDB())
  })

  it("deletes the entry from the recordings store", async () => {
    await deleteRecording("recording-abc")
    expect(mockDbDelete).toHaveBeenCalledWith("recordings", "recording-abc")
  })

  it("also cleans up associated chunks", async () => {
    const txStore = {
      index: vi.fn(() => ({ openCursor: vi.fn().mockResolvedValue(null) })),
    }
    const tx = { objectStore: vi.fn(() => txStore), done: Promise.resolve() }
    const db = { delete: mockDbDelete, transaction: vi.fn(() => tx) }
    mockOpenDB.mockResolvedValue(db)

    await deleteRecording("recording-abc")

    expect(db.transaction).toHaveBeenCalledWith("chunks", "readwrite")
  })
})
