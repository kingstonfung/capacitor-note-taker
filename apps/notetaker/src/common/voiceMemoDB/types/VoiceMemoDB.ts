import type { ChunkRow } from "./chunks"
import type { DBSchema } from "idb"

export type VoiceMemosDB = DBSchema & {
  chunks: {
    key: number
    value: ChunkRow
    indexes: { "by-session": string }
  }
  recordings: {
    key: string
    value: {
      id: string
      title: string
      buffer: ArrayBuffer
      mimeType: string
      size: number
      createdAt: string
    }
  }
  meta: {
    key: string
    value: string
  }
}
