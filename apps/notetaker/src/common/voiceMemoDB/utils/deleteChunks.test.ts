import { describe, it, expect, vi, beforeEach } from "vitest"
import { deleteChunks } from "./deleteChunks"
import { resetVoiceMemoDB } from "./getDB"

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

export const buildCursorChain = (
  count: number,
  mockDelete: ReturnType<typeof vi.fn>,
): any => {
  if (count === 0) return null
  const cursor: any = { delete: mockDelete, continue: vi.fn() }
  cursor.continue.mockResolvedValue(buildCursorChain(count - 1, mockDelete))
  return cursor
}

export const makeDB = (chunkCount = 0) => {
  const mockDelete = vi.fn().mockResolvedValue(undefined)
  const mockOpenCursor = vi
    .fn()
    .mockResolvedValue(buildCursorChain(chunkCount, mockDelete))
  const mockIndex = { openCursor: mockOpenCursor }
  const txStore = { index: vi.fn().mockReturnValue(mockIndex) }
  const tx = {
    objectStore: vi.fn().mockReturnValue(txStore),
    done: Promise.resolve(),
  }
  const db = { transaction: vi.fn().mockReturnValue(tx) }
  return { db, mockDelete, mockOpenCursor, tx, txStore }
}

describe("deleteChunks:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetVoiceMemoDB()
  })

  it("opens a readwrite transaction on the chunks store", async () => {
    const { db } = makeDB()
    mockOpenDB.mockResolvedValue(db)
    await deleteChunks("session-1")
    expect(db.transaction).toHaveBeenCalledWith("chunks", "readwrite")
  })

  it("queries the by-session index with the given session id", async () => {
    const { db, tx, txStore, mockOpenCursor } = makeDB()
    mockOpenDB.mockResolvedValue(db)
    await deleteChunks("session-1")
    expect(tx.objectStore).toHaveBeenCalledWith("chunks")
    expect(txStore.index).toHaveBeenCalledWith("by-session")
    expect(mockOpenCursor).toHaveBeenCalledWith("session-1")
  })

  it("does not delete anything when there are no chunks", async () => {
    const { db, mockDelete } = makeDB(0)
    mockOpenDB.mockResolvedValue(db)
    await deleteChunks("session-1")
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("deletes every chunk found for the session", async () => {
    const { db, mockDelete } = makeDB(3)
    mockOpenDB.mockResolvedValue(db)
    await deleteChunks("session-1")
    expect(mockDelete).toHaveBeenCalledTimes(3)
  })
})
