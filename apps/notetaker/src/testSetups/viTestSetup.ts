import "@testing-library/react"
import { vi, afterEach } from "vitest"

class MockBlob {
  private parts: ArrayBuffer[]
  type: string

  constructor(parts: ArrayBuffer[], options?: { type?: string }) {
    this.parts = parts
    this.type = options?.type ?? ""
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const totalLength = this.parts.reduce((sum, p) => sum + p.byteLength, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const part of this.parts) {
      result.set(new Uint8Array(part), offset)
      offset += part.byteLength
    }
    return result.buffer
  }
}

;(globalThis as any).Blob = MockBlob

afterEach(() => {
  vi.restoreAllMocks()
})
