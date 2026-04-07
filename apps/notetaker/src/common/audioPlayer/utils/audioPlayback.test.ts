import { describe, it, expect, vi, beforeEach } from "vitest"
import { preparePlayback, resetPlaybackDB } from "./audioPlayback"

URL.createObjectURL = vi.fn(() => "blob:mock")
URL.revokeObjectURL = vi.fn()

const mockOpenDB = vi.fn()

vi.mock("idb", () => ({
  openDB: (...args: unknown[]) => mockOpenDB(...args),
}))

const makeDB = (entry: Record<string, unknown> | undefined) => {
  return { get: vi.fn().mockResolvedValue(entry) }
}

const makeUpgradeSafeDB = (entry: Record<string, unknown> | undefined) => {
  const db = makeDB(entry)
  mockOpenDB.mockImplementation(
    async (_name: string, _version: number, opts: any) => {
      opts?.upgrade?.(
        {
          objectStoreNames: { contains: () => true },
          deleteObjectStore: vi.fn(),
          createObjectStore: vi.fn(() => ({ createIndex: vi.fn() })),
        },
        0,
      )
      return db
    },
  )
  return db
}

describe("preparePlayback:", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetPlaybackDB()
  })

  it("returns null when no recording entry exists for the given uuid", async () => {
    makeUpgradeSafeDB(undefined)

    const audioEl = document.createElement("audio")
    const result = await preparePlayback("missing-uuid", audioEl)

    expect(result).toBeNull()
  })

  it("sets audioEl.src and resolves an object URL when entry is found", async () => {
    const fakeBuffer = new ArrayBuffer(8)
    const entry = { id: "abc", buffer: fakeBuffer, mimeType: "audio/webm" }
    makeUpgradeSafeDB(entry)

    const fakeUrl = "blob:http://localhost/fake-url"
    vi.spyOn(URL, "createObjectURL").mockReturnValue(fakeUrl)

    const audioEl = document.createElement("audio")

    let metaHandler: (() => void) | null = null
    Object.defineProperty(audioEl, "onloadedmetadata", {
      get: () => metaHandler,
      set: (fn) => {
        metaHandler = fn
        setTimeout(() => fn?.(), 0)
      },
      configurable: true,
    })

    Object.defineProperty(audioEl, "duration", {
      get: () => 10,
      configurable: true,
    })

    const result = await preparePlayback("abc", audioEl)

    expect(result).toBe(fakeUrl)
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it("rejects when the audio element fires an error event", async () => {
    const fakeBuffer = new ArrayBuffer(8)
    const entry = { id: "abc", buffer: fakeBuffer, mimeType: "audio/webm" }
    makeUpgradeSafeDB(entry)

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://localhost/x")

    const audioEl = document.createElement("audio")

    Object.defineProperty(audioEl, "onerror", {
      get: () => null,
      set: (fn) => {
        setTimeout(() => fn?.(), 0)
      },
      configurable: true,
    })

    Object.defineProperty(audioEl, "onloadedmetadata", {
      get: () => null,
      set: () => {},
      configurable: true,
    })

    await expect(preparePlayback("abc", audioEl)).rejects.toThrow(
      "Audio failed to load",
    )
  })
})
