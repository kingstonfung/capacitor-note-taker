import { describe, it, expect, vi, beforeEach } from "vitest"
import { getDB, resetVoiceMemoDB } from "./getDB"

const mockOpenDB = vi.fn()

vi.mock("idb", () => ({
  openDB: (...args: unknown[]) => mockOpenDB(...args),
}))

describe("getDB:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetVoiceMemoDB()
  })

  it("calls openDB with the correct name and version", async () => {
    mockOpenDB.mockResolvedValue({})
    await getDB()
    expect(mockOpenDB).toHaveBeenCalledWith(
      "voice-memos-db",
      2,
      expect.objectContaining({ upgrade: expect.any(Function) }),
    )
  })

  it("returns the same instance on subsequent calls", async () => {
    const fakeDb = {}
    mockOpenDB.mockResolvedValue(fakeDb)
    const a = await getDB()
    const b = await getDB()
    expect(mockOpenDB).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })

  it("upgrade creates chunks store with by-session index, recordings store, and meta store", async () => {
    let capturedUpgrade: ((d: any) => void) | undefined
    mockOpenDB.mockImplementation(
      (_name: unknown, _ver: unknown, { upgrade }: any) => {
        capturedUpgrade = upgrade
        return Promise.resolve({})
      },
    )
    await getDB()

    const chunksStore = { createIndex: vi.fn() }
    const mockDb = {
      createObjectStore: vi.fn((name: string) =>
        name === "chunks" ? chunksStore : {},
      ),
    }
    capturedUpgrade!(mockDb)

    expect(mockDb.createObjectStore).toHaveBeenCalledWith("chunks", {
      keyPath: "id",
      autoIncrement: true,
    })
    expect(chunksStore.createIndex).toHaveBeenCalledWith(
      "by-session",
      "sessionId",
    )
    expect(mockDb.createObjectStore).toHaveBeenCalledWith("recordings", {
      keyPath: "id",
    })
    expect(mockDb.createObjectStore).toHaveBeenCalledWith("meta")
  })
})
